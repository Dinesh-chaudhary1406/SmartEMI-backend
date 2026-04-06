export interface FinancialHealthInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  emi: number;
}

export type FinancialHealthStatus = "Poor" | "Average" | "Healthy";

export interface FinancialHealthResult {
  score: number;
  status: FinancialHealthStatus;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const getStatus = (score: number): FinancialHealthStatus => {
  if (score <= 40) {
    return "Poor";
  }
  if (score <= 70) {
    return "Average";
  }
  return "Healthy";
};

export const calculateFinancialHealthScore = ({
  monthlyIncome,
  monthlyExpenses,
  emi,
}: FinancialHealthInput): FinancialHealthResult => {
  let score = 100;

  const emiRatio = (emi / monthlyIncome) * 100;
  const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;

  if (emiRatio > 40) {
    score -= 40;
  } else if (emiRatio >= 25) {
    score -= 20;
  }

  if (savingsRate < 20) {
    score -= 20;
  } else if (savingsRate > 30) {
    score += 10;
  }

  const finalScore = clamp(Math.round(score), 0, 100);

  return {
    score: finalScore,
    status: getStatus(finalScore),
  };
};
