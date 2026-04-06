import { NextFunction, Response } from "express";
import { Types } from "mongoose";
import { LoanAnalysis } from "../models/LoanAnalysis";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";

export const getAnalysisHistoryController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const analyses = await LoanAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const data = analyses.map((item) => ({
      id: String(item._id),
      loanAmount: item.loanAmount,
      interestRate: item.interestRate,
      tenureYears: item.tenureYears,
      emi: item.emi,
      affordabilityScore: item.affordabilityScore,
      riskLevel: item.riskLevel,
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnalysisController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const analysisIdParam = req.params.id;
    const analysisId = Array.isArray(analysisIdParam)
      ? analysisIdParam[0]
      : analysisIdParam;

    if (!analysisId) {
      throw new AppError("Invalid analysis id", 400);
    }

    if (!Types.ObjectId.isValid(analysisId)) {
      throw new AppError("Invalid analysis id", 400);
    }

    const deleted = await LoanAnalysis.findOneAndDelete({
      _id: analysisId,
      userId: req.user.id,
    });

    if (!deleted) {
      throw new AppError("Analysis not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
