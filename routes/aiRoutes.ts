import { Router } from "express";
import { getFinancialAdviceController } from "../controllers/aiController";
import { authMiddleware } from "../middleware/authMiddleware";

const aiRouter = Router();

aiRouter.post("/advice", authMiddleware, getFinancialAdviceController);

export default aiRouter;
