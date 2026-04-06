import { Document, Schema, Types, model } from "mongoose";

export interface ILoanAnalysis extends Document {
  userId: Types.ObjectId;
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  emi: number;
  affordabilityScore: number;
  riskLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

const loanAnalysisSchema = new Schema<ILoanAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureYears: { type: Number, required: true },
    emi: { type: Number, required: true },
    affordabilityScore: { type: Number, required: true },
    riskLevel: { type: String, required: true },
  },
  { timestamps: true },
);

export const LoanAnalysis = model<ILoanAnalysis>("LoanAnalysis", loanAnalysisSchema);
