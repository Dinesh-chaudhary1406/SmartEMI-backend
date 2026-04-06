"use strict";

require("dotenv/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const MODELS_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

if (!API_KEY) {
  console.error("GEMINI_API_KEY is missing. Set it in environment first.");
  process.exit(1);
}

const withTimeout = async (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);

const listGenerateContentModels = async () => {
  const url = `${MODELS_ENDPOINT}?key=${encodeURIComponent(API_KEY)}`;
  const response = await withTimeout(fetch(url), 10000);
  if (!response.ok) {
    throw new Error(`ListModels failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const models =
    (data.models || [])
      .filter((model) => (model.supportedGenerationMethods || []).includes("generateContent"))
      .map((model) => String(model.name || "").replace(/^models\//, ""))
      .filter(Boolean);

  return models;
};

const probeModel = async (client, modelName) => {
  try {
    const model = client.getGenerativeModel({ model: modelName });
    const response = await withTimeout(
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Reply with JSON only: {\"ok\":true}" }] }],
        generationConfig: { maxOutputTokens: 20, temperature: 0 },
      }),
      12000,
    );

    const text = response.response.text();
    return {
      model: modelName,
      ok: true,
      preview: text.slice(0, 120),
    };
  } catch (error) {
    return {
      model: modelName,
      ok: false,
      status: error && error.status ? error.status : undefined,
      message: error && error.message ? error.message : String(error),
    };
  }
};

const run = async () => {
  const client = new GoogleGenerativeAI(API_KEY);
  const models = await listGenerateContentModels();
  const runAll = process.argv.includes("--all");

  if (models.length === 0) {
    console.log("No generateContent-capable models were returned for this key.");
    return;
  }

  console.log(`Detected ${models.length} candidate models.`);
  const results = [];
  for (const modelName of models) {
    // eslint-disable-next-line no-await-in-loop
    const result = await probeModel(client, modelName);
    results.push(result);
    console.log(
      result.ok
        ? `[OK] ${result.model} -> ${result.preview}`
        : `[FAIL] ${result.model} -> ${result.status || "N/A"} ${result.message}`,
    );
    if (!runAll && result.ok) {
      break;
    }
    if (!runAll && result.status === 429) {
      console.log("Stopping early after quota response to avoid repeated failures.");
      break;
    }
  }

  const working = results.find((item) => item.ok);
  if (working) {
    console.log(`\nRecommended working model: ${working.model}`);
  } else {
    console.log("\nNo model worked with current API key/quota.");
  }
};

run().catch((error) => {
  console.error("Gemini model test failed:", error);
  process.exit(1);
});
