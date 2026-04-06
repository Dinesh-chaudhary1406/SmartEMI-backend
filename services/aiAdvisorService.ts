import { getGeminiClient } from "../utils/geminiClient";

export interface AiAdvisorInput {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emi: number;
  affordabilityScore: number;
}

export type AdviceRiskLevel =
  | "High risk"
  | "Moderate risk"
  | "Safe";

export interface AiAdvisorResult {
  riskLevel: AdviceRiskLevel;
  recommendation: string;
  budgetTips: string[];
}

interface GeminiModelsResponse {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
}

/* ---------- RULE ENGINE (FALLBACK) ---------- */

const getRiskLevel = (
  emiToIncomeRatio: number
): AdviceRiskLevel => {

  if (emiToIncomeRatio > 40)
    return "High risk";

  if (emiToIncomeRatio >= 25)
    return "Moderate risk";

  return "Safe";
};

const getRecommendation = (
  riskLevel: AdviceRiskLevel,
  input: AiAdvisorInput
): string => {

  if (riskLevel === "High risk") {

    return `Your EMI is very high compared to income. Consider reducing loan or extending tenure before committing to INR ${input.loanAmount}.`;

  }

  if (riskLevel === "Moderate risk") {

    return "Your loan is manageable but requires careful budgeting and avoiding extra debt.";

  }

  return "Your EMI looks affordable. Continue repayments and consider part-prepayment to reduce interest.";

};

const getBudgetTips = (
  riskLevel: AdviceRiskLevel,
  input: AiAdvisorInput
): string[] => {

  const savings =
    input.monthlyIncome -
    input.monthlyExpenses;

  if (riskLevel === "High risk") {

    return [

      "Reduce unnecessary expenses.",

      "Maintain at least one EMI as emergency fund.",

      `Try saving INR ${Math.max(
        Math.round(input.emi * 0.5),
        5000
      )}.`

    ];

  }

  if (riskLevel === "Moderate risk") {

    return [

      "Follow structured budgeting.",

      "Automate savings.",

      "Do partial prepayments if possible."

    ];

  }

  return [

    `You save about INR ${Math.max(
      Math.round(savings),
      0
    )}. Invest part of it.`,

    "Maintain 3-6 month emergency fund.",

    "Review interest rates yearly."

  ];

};

/* ---------- SAFE JSON PARSER ---------- */

const safeJsonParse = (
  text:string
) => {

  try{

    const cleaned =
      text
      .replace(/```json/g,"")
      .replace(/```/g,"")
      .trim();

    return JSON.parse(cleaned);

  }catch{

    return null;

  }

};

/* ---------- GEMINI MODEL DISCOVERY + RESILIENCE ---------- */

const GEMINI_MODELS_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_CACHE_TTL_MS = 30 * 60 * 1000;
const PROBE_RETRY_DELAY_MS = 5 * 60 * 1000;
const QUOTA_COOLDOWN_MS = 10 * 60 * 1000;
const NETWORK_TIMEOUT_MS = 8000;
const MODEL_PROBE_TIMEOUT_MS = 10000;

let cachedModels:
  | {
      models: string[];
      fetchedAt: number;
    }
  | null = null;

let cachedWorkingModel: string | null = null;
let nextProbeAllowedAt = 0;
let quotaBlockedUntil = 0;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
};

const normalizeModelName = (rawName: string): string =>
  rawName.replace(/^models\//, "").trim();

const isQuotaError = (error: unknown): boolean => {
  const maybeStatus = (error as { status?: unknown })?.status;
  const maybeMessage = String((error as { message?: unknown })?.message || "");
  return maybeStatus === 429 || maybeMessage.includes("429");
};

const isModelNotFoundError = (error: unknown): boolean => {
  const maybeStatus = (error as { status?: unknown })?.status;
  return maybeStatus === 404;
};

const fetchGenerateContentModels = async (): Promise<string[]> => {
  const now = Date.now();
  if (cachedModels && now - cachedModels.fetchedAt < MODEL_CACHE_TTL_MS) {
    return cachedModels.models;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return [];
  }

  const url = `${GEMINI_MODELS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;

  const response = await withTimeout(fetch(url), NETWORK_TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`Failed to list Gemini models: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GeminiModelsResponse;
  const models =
    data.models
      ?.filter((model) =>
        (model.supportedGenerationMethods || []).includes("generateContent"),
      )
      .map((model) => normalizeModelName(model.name || ""))
      .filter(Boolean) || [];

  cachedModels = {
    models,
    fetchedAt: now,
  };

  return models;
};

const probeModel = async (
  modelName: string,
): Promise<boolean> => {
  const geminiClient = getGeminiClient();
  if (!geminiClient) {
    return false;
  }

  try {
    const model = geminiClient.getGenerativeModel({ model: modelName });
    await withTimeout(
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Respond only with JSON: {\"ok\":true}" }] }],
        generationConfig: { maxOutputTokens: 20, temperature: 0 },
      }),
      MODEL_PROBE_TIMEOUT_MS,
    );
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      quotaBlockedUntil = Date.now() + QUOTA_COOLDOWN_MS;
    }
    return false;
  }
};

const resolveWorkingModel = async (): Promise<string | null> => {
  const now = Date.now();
  if (now < quotaBlockedUntil) {
    return null;
  }

  if (cachedWorkingModel) {
    return cachedWorkingModel;
  }

  if (now < nextProbeAllowedAt) {
    return null;
  }

  try {
    const models = await fetchGenerateContentModels();
    if (models.length === 0) {
      nextProbeAllowedAt = now + PROBE_RETRY_DELAY_MS;
      return null;
    }

    const configuredModel = process.env.GEMINI_MODEL?.trim();
    const modelCandidates = [
      configuredModel && models.includes(configuredModel) ? configuredModel : null,
      ...models,
    ].filter((value, index, self): value is string => Boolean(value) && self.indexOf(value) === index);

    for (const candidate of modelCandidates) {
      const works = await probeModel(candidate);
      if (works) {
        cachedWorkingModel = candidate;
        console.log(`Gemini active model: ${candidate}`);
        return candidate;
      }
      if (Date.now() < quotaBlockedUntil) {
        break;
      }
    }
  } catch (error) {
    if (isQuotaError(error)) {
      quotaBlockedUntil = now + QUOTA_COOLDOWN_MS;
    }
    console.warn("Gemini model discovery failed, using rule fallback:", error);
  }

  nextProbeAllowedAt = now + PROBE_RETRY_DELAY_MS;
  return null;
};

const normalizeAiResult = (
  aiData: unknown,
  fallback: AiAdvisorResult,
): AiAdvisorResult => {
  if (!aiData || typeof aiData !== "object") {
    return fallback;
  }

  const data = aiData as {
    riskLevel?: unknown;
    recommendation?: unknown;
    budgetTips?: unknown;
  };

  const riskLevel =
    typeof data.riskLevel === "string" &&
    (data.riskLevel === "High risk" ||
      data.riskLevel === "Moderate risk" ||
      data.riskLevel === "Safe")
      ? data.riskLevel
      : fallback.riskLevel;

  const recommendation =
    typeof data.recommendation === "string" && data.recommendation.trim()
      ? data.recommendation.trim()
      : fallback.recommendation;

  const budgetTips =
    Array.isArray(data.budgetTips) &&
    data.budgetTips.every((tip) => typeof tip === "string" && tip.trim())
      ? (data.budgetTips as string[]).slice(0, 3)
      : fallback.budgetTips;

  return { riskLevel, recommendation, budgetTips };
};

/* ---------- MAIN SERVICE ---------- */

export const generateFinancialAdvice =
async (

input:AiAdvisorInput

):Promise<AiAdvisorResult> => {

const emiRatio =
(input.emi / input.monthlyIncome)*100;

const riskLevel =
getRiskLevel(emiRatio);

const recommendation =
getRecommendation(
riskLevel,
input
);

const budgetTips =
getBudgetTips(
riskLevel,
input
);

const fallback:AiAdvisorResult = {

riskLevel,

recommendation,

budgetTips

};

/* If no Gemini key → rule engine */

const geminiClient =
getGeminiClient();

if(!geminiClient){

return fallback;

}

try{
const workingModel = await resolveWorkingModel();
if (!workingModel) {
  return fallback;
}

const model = geminiClient.getGenerativeModel({
model: workingModel
});

const prompt = `
You are a fintech advisor.

Analyze:

Loan: ${input.loanAmount}
Interest: ${input.interestRate}
Tenure: ${input.tenureYears}
EMI: ${input.emi}
Income: ${input.monthlyIncome}
Expenses: ${input.monthlyExpenses}
Score: ${input.affordabilityScore}

Return ONLY JSON:

{
"riskLevel":"High risk | Moderate risk | Safe",
"recommendation":"short advice",
"budgetTips":[
"tip1",
"tip2",
"tip3"
]
}

No explanation.
JSON only.
`;

const result =
await withTimeout(model.generateContent({

contents:[
{
role:"user",
parts:[
{text:prompt}
]
}
],

generationConfig:{
maxOutputTokens:250,
temperature:0.4
}

}), MODEL_PROBE_TIMEOUT_MS);

const text =
result.response.text();
console.log("AI advice generated using Gemini");
const aiData =
safeJsonParse(text);

if(!aiData){

return fallback;

}

return normalizeAiResult(aiData, fallback);

}catch(error){

console.warn("AI failed, using rule fallback.");

console.error(
"Gemini error:",
error
);

if (isQuotaError(error)) {
quotaBlockedUntil = Date.now() + QUOTA_COOLDOWN_MS;
}

if (isModelNotFoundError(error)) {
cachedWorkingModel = null;
nextProbeAllowedAt = Date.now() + PROBE_RETRY_DELAY_MS;
}

return fallback;

}

};