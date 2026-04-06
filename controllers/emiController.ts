import { Request, Response, NextFunction } from "express";
import { calculateEmi } from "../services/emiService";
import { validateEmiRequest } from "../utils/validation";

export const calculateEmiController = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const { loanAmount, interestRate, tenureYears } = validateEmiRequest(
      req.body,
    );
    const result = calculateEmi({ loanAmount, interestRate, tenureYears });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
