import { Router } from "express";
import { checkAffordabilityController } from "../controllers/affordabilityController";
import { authMiddleware } from "../middleware/authMiddleware";

const affordabilityRouter = Router();

affordabilityRouter.post("/check", authMiddleware, checkAffordabilityController);

export default affordabilityRouter;
