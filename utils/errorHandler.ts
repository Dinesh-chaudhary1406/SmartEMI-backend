import { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const appError =
    err instanceof AppError ? err : new AppError("Internal server error", 500);

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
  });
};
