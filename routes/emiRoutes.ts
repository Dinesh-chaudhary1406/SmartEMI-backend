import { Router } from "express";
import { calculateEmiController } from "../controllers/emiController";

const emiRouter = Router();

emiRouter.post("/calculate", calculateEmiController);

export default emiRouter;
