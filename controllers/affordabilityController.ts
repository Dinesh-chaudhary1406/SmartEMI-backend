import { NextFunction, Request, Response } from "express";
import { checkLoanAffordability } from "../services/affordabilityService";
import { validateAffordabilityRequest } from "../utils/validation";

export const checkAffordabilityController = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const { monthlyIncome, monthlyExpenses, emi } = validateAffordabilityRequest(
      req.body,
    );

    const result = checkLoanAffordability({
      monthlyIncome,
      monthlyExpenses,
      emi,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
