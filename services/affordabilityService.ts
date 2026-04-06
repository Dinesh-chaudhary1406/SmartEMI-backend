import {
  calculateFinancialHealthScore,
  type FinancialHealthResult,
} from "./financialHealthService";

export interface AffordabilityInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  emi: number;
}

export type RiskLevel = "Safe" | "Risky" | "Dangerous";

export interface AffordabilityResult {
  debtToIncomeRatio: number;
  savingsRate: number;
  affordabilityScore: number;
  riskLevel: RiskLevel;
  financialHealth: FinancialHealthResult;
}

const roundTo2 = (value: number): number => Math.round(value * 100) / 100;
const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getRiskLevel = (debtToIncomeRatio: number): RiskLevel => {
  if (debtToIncomeRatio < 25) {
    return "Safe";
  }
  if (debtToIncomeRatio <= 40) {
    return "Risky";
  }
  return "Dangerous";
};

export const checkLoanAffordability = ({
  monthlyIncome,
  monthlyExpenses,
  emi,
}: AffordabilityInput): AffordabilityResult => {
  const debtToIncomeRatio = (emi / monthlyIncome) * 100;
  const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
  const riskLevel = getRiskLevel(debtToIncomeRatio);

  const affordabilityScore = roundTo2(
    clamp(100 - debtToIncomeRatio + savingsRate * 0.5, 0, 100),
  );

  const financialHealth = calculateFinancialHealthScore({
    monthlyIncome,
    monthlyExpenses,
    emi,
  });

  return {
    debtToIncomeRatio: roundTo2(debtToIncomeRatio),
    savingsRate: roundTo2(savingsRate),
    affordabilityScore,
    riskLevel,
    financialHealth,
  };
};
