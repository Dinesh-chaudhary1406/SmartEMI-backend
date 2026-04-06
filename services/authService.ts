import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || "smartemi_dev_secret";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

const buildAuthUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  createdAt: Date;
}): AuthUser => {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

const signToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterInput): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  return {
    token: signToken(String(user._id)),
    user: buildAuthUser(user),
  };
};

export const loginUser = async ({
  email,
  password,
}: LoginInput): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    token: signToken(String(user._id)),
    user: buildAuthUser(user),
  };
};
