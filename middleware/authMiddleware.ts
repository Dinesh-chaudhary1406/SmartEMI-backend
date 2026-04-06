import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "smartemi_dev_secret";

interface JwtPayload {
  userId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: token is missing", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Unauthorized: token is missing", 401);
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId) {
      throw new AppError("Unauthorized: invalid token payload", 401);
    }

    const user = await User.findById(decoded.userId).select("_id name email");
    if (!user) {
      throw new AppError("Unauthorized: user not found", 401);
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
