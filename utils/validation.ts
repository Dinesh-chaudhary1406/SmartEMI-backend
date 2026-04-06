import { AppError } from "./AppError";

export interface EmiRequestBody {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
}

export interface AffordabilityRequestBody {
  monthlyIncome: number;
  monthlyExpenses: number;
  emi: number;
}

export interface AiAdviceRequestBody {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emi: number;
  affordabilityScore: number;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

const assertRequestBodyObject = (payload: unknown): Record<string, unknown> => {
  if (typeof payload !== "object" || payload === null) {
    throw new AppError("Request body must be a valid object", 400);
  }

  return payload as Record<string, unknown>;
};

const validateRequiredStringField = (key: string, value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${key} is required`, 400);
  }
  return value.trim();
};

const validateNumericField = (
  key: string,
  value: unknown,
  allowZero = false,
): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new AppError(`${key} must be a valid number`, 400);
  }

  if (allowZero ? value < 0 : value <= 0) {
    throw new AppError(
      `${key} must be ${allowZero ? "zero or a positive" : "a positive"} number`,
      400,
    );
  }

  return value;
};

export const validateEmiRequest = (payload: unknown): EmiRequestBody => {
  const body = assertRequestBodyObject(payload);

  return {
    loanAmount: validateNumericField("loanAmount", body.loanAmount),
    interestRate: validateNumericField("interestRate", body.interestRate),
    tenureYears: validateNumericField("tenureYears", body.tenureYears),
  };
};

export const validateAffordabilityRequest = (
  payload: unknown,
): AffordabilityRequestBody => {
  const body = assertRequestBodyObject(payload);

  return {
    monthlyIncome: validateNumericField("monthlyIncome", body.monthlyIncome),
    monthlyExpenses: validateNumericField(
      "monthlyExpenses",
      body.monthlyExpenses,
      true,
    ),
    emi: validateNumericField("emi", body.emi),
  };
};

export const validateAiAdviceRequest = (
  payload: unknown,
): AiAdviceRequestBody => {
  const body = assertRequestBodyObject(payload);

  return {
    loanAmount: validateNumericField("loanAmount", body.loanAmount),
    interestRate: validateNumericField("interestRate", body.interestRate),
    tenureYears: validateNumericField("tenureYears", body.tenureYears),
    monthlyIncome: validateNumericField("monthlyIncome", body.monthlyIncome),
    monthlyExpenses: validateNumericField(
      "monthlyExpenses",
      body.monthlyExpenses,
      true,
    ),
    emi: validateNumericField("emi", body.emi),
    affordabilityScore: validateNumericField(
      "affordabilityScore",
      body.affordabilityScore,
      true,
    ),
  };
};

export const validateRegisterRequest = (
  payload: unknown,
): RegisterRequestBody => {
  const body = assertRequestBodyObject(payload);

  const name = validateRequiredStringField("name", body.name);
  const email = validateRequiredStringField("email", body.email).toLowerCase();
  const password = validateRequiredStringField("password", body.password);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("email must be a valid email address", 400);
  }

  if (password.length < 6) {
    throw new AppError("password must be at least 6 characters", 400);
  }

  return { name, email, password };
};

export const validateLoginRequest = (payload: unknown): LoginRequestBody => {
  const body = assertRequestBodyObject(payload);

  const email = validateRequiredStringField("email", body.email).toLowerCase();
  const password = validateRequiredStringField("password", body.password);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("email must be a valid email address", 400);
  }

  return { email, password };
};
