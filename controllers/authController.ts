import { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService";
import { validateLoginRequest, validateRegisterRequest } from "../utils/validation";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = validateRegisterRequest(req.body);
    const result = await registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = validateLoginRequest(req.body);
    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
