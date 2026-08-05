import express from "express";
import db from "./db/client.js";
import seed from "./db/seed.js";
import commonRouter from "./api/commonapi.js";

const app = express();

app.use(express.json());

app.use("/api", commonRouter);

const init = async () => {
  await db.connect();
  await seed();
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening to port... ${PORT}`);
  });
};
init();

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("error");
});
