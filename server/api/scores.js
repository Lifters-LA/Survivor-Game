import express from "express";
import { getScore, creatScore, getUserScore } from "../db/queries/scores.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const scoresRouter = express.Router();

scoresRouter.post("/scores/:id/create", isLoggedIn, async (req, res, next) => {
  if (req.params.id !== req.user.id) throw Error("wrong id");
  const { id } = req.params;
  res.status(200).send(await creatScore(req.body.score, id));
});

scoresRouter.get("/scores", async (req, res, next) => {
  res.status(200).send(await getScore());
});

scoresRouter.get("/scores/:id", isLoggedIn, async (req, res, next) => {
  if (req.params.id !== req.user.id) throw Error("wrong id");
  const { id } = req.params;
  res.status(200).send(await getUserScore(id));
});

export default scoresRouter;
