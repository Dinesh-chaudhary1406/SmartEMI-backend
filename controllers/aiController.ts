import { NextFunction, Response } from "express";
import { LoanAnalysis } from "../models/LoanAnalysis";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { generateFinancialAdvice } from "../services/aiAdvisorService";
import { validateAiAdviceRequest } from "../utils/validation";

export const getFinancialAdviceController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      loanAmount,
      interestRate,
      tenureYears,
      monthlyIncome,
      monthlyExpenses,
      emi,
      affordabilityScore,
    } = validateAiAdviceRequest(req.body);

    const advice = await generateFinancialAdvice({
      loanAmount,
      interestRate,
      tenureYears,
      monthlyIncome,
      monthlyExpenses,
      emi,
      affordabilityScore,
    });

    if (req.user?.id) {
      await LoanAnalysis.create({
        userId: req.user.id,
        loanAmount,
        interestRate,
        tenureYears,
        emi,
        affordabilityScore,
        riskLevel: advice.riskLevel,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        riskLevel: advice.riskLevel,
        recommendation: advice.recommendation,
        tips: advice.budgetTips,
      },
    });
  } catch (error) {
    next(error);
  }
};
