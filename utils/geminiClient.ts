import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiClient = (): GoogleGenerativeAI | null => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return new GoogleGenerativeAI(apiKey);
};