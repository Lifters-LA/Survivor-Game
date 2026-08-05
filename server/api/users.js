import express from "express";
import {
  createUser,
  getUserLogin,
  deleteUser,
  updatePassword,
  updateUsername,
} from "../db/queries/users.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  if (!req.body) {
    throw Error("body not found");
  }
  const { username, password } = req.body;
  if (!username.trim() || !password.trim()) {
    throw Error("credentials not entered");
  }
  res.status(200).send(await createUser(req.body));
});

userRouter.post("/login", async (req, res, next) => {
  if (!req.body) {
    throw Error("body not found");
  }
  const { username, password } = req.body;
  if (!username.trim() || !password.trim()) {
    throw Error("credentials not entered");
  }
  res.status(200).send(await getUserLogin(req.body));
});

userRouter.get("/login/me", isLoggedIn, async (req, res, next) => {
  res.status(200).send(req.user);
});

userRouter.delete("/delete/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  if (req.user.id !== id) {
    throw Error("not authorized");
  }
  res.status(200).send(await deleteUser(id));
});

userRouter.patch("/patchusername/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  if (!id) throw Error("id is not found");
  if (req.user.id !== id) {
    throw Error("not authorized");
  }
  if (!req.body) throw Error("body not found");

  const { username } = req.body;
  if (!username.trim()) throw Error("username not found");

  res.status(200).send(await updateUsername(username, id));
});

userRouter.patch("/patchpassword/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  if (!id) throw Error("id is not found");
  if (req.user.id !== id) {
    throw Error("not authorized");
  }
  if (!req.body) throw Error("body not found");

  const { password } = req.body;
  if (!password.trim()) throw Error("password not found");

  res.status(200).send(await updatePassword(password, id));
});

export default userRouter;
