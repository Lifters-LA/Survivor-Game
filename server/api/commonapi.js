import express from "express";
import scoresRouter from "./scores.js";
import userRouter from "./users.js";

const commonRouter = express.Router();

commonRouter.use("/users", userRouter);
commonRouter.use("/scores", scoresRouter);

export default commonRouter;
