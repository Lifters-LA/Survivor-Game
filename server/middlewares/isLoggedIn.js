import jwt from "jsonwebtoken";
import db from "../db/client.js";

export const isLoggedIn = async (req, res, next) => {
  if (!req.headers.authorization) {
    throw Error("token not found");
  }
  const id = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

  const sql = `SELECT username, id FROM users 
                WHERE id = $1;`;

  const response = await db.query(sql, [id.id]);

  if (!response.rows[0]) {
    throw Error("wrong token");
  }
  req.user = response.rows[0];
  next();
};
