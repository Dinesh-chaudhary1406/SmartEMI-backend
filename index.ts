import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";

import emiRouter from "./routes/emiRoutes";
import affordabilityRouter from "./routes/affordabilityRoutes";
import aiRouter from "./routes/aiRoutes";
import authRouter from "./routes/authRoutes";
import analysisRouter from "./routes/analysisRoutes";

import {
errorHandler,
notFoundHandler
} from "./utils/errorHandler";

const app = express();

const PORT =
process.env.PORT || 5000;

const MONGODB_URI =
process.env.MONGODB_URI;

if(!MONGODB_URI){

console.error(
"Mongo URI missing"
);

process.exit(1);

}

app.set("trust proxy",1);

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials:true
}));

app.use(express.json());

app.get("/health",(_req,res)=>{

res.status(200).json({

success:true,

message:"SmartEMI API is running"

});

});

app.use("/api/emi",emiRouter);

app.use("/api/auth",authRouter);

app.use("/api/affordability",affordabilityRouter);

app.use("/api/ai",aiRouter);

app.use("/api/analysis",analysisRouter);

app.use(notFoundHandler);

app.use(errorHandler);

const startServer =
async():Promise<void>=>{

try{

await mongoose.connect(
MONGODB_URI
);

app.listen(PORT,()=>{

console.log(

`SmartEMI backend running on port ${PORT}`

);

});

}catch(error){

console.error(

"Failed to start server:",
error

);

process.exit(1);

}

};

void startServer();