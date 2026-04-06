import { Schema, model, Document } from "mongoose";

export interface IUserFinanceProfile extends Document {
  monthlyIncome: number;
  monthlyExpenses: number;
  createdAt: Date;
  updatedAt: Date;
}

const userFinanceProfileSchema = new Schema<IUserFinanceProfile>(
  {
    monthlyIncome: { type: Number, required: true },
    monthlyExpenses: { type: Number, required: true },
  },
  { timestamps: true },
);

export const UserFinanceProfile = model<IUserFinanceProfile>(
  "UserFinanceProfile",
  userFinanceProfileSchema,
);
