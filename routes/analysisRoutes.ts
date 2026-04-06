import { Router } from "express";
import {
  deleteAnalysisController,
  getAnalysisHistoryController,
} from "../controllers/analysisController";
import { authMiddleware } from "../middleware/authMiddleware";

const analysisRouter = Router();

analysisRouter.get("/history", authMiddleware, getAnalysisHistoryController);
analysisRouter.delete("/:id", authMiddleware, deleteAnalysisController);

export default analysisRouter;
