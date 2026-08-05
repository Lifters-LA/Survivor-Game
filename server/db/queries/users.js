import db from "../client.js";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//register
export const createUser = async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
  const SQL = `INSERT INTO users (id, username, password) VALUES($1, $2, $3) 
  RETURNING id, username;`;
  const response = await db.query(SQL, [v4(), user.username, user.password]);
  const token = jwt.sign({ id: response.rows[0].id }, process.env.JWT__SECRET);
  return { token: token };
};
//LOGIN
export const getUserLogin = async (user) => {
  const token = await authenticate(user);
  return { token: token };
};

const authenticate = async (user) => {
  const { username, password } = user;
  const sql = `SELECT * FROM users 
                WHERE username = $1;`;
  const response = await db.query(sql, [username]);

  if (!response.rows[0]) {
    throw Error("invalid credentials");
  }

  const valid = await bcrypt.compare(password, response.rows[0].password);

  if (!valid) {
    throw Error("invalid credentials");
  }

  const token = jwt.sign({ id: response.rows[0].id }, process.env.JWT_SECRET);
  return token;
};

export const deleteUser = async (id) => {
  const sql = `DELETE FROM users 
                WHERE id = $1;`;

  await db.query(sql, [id]);
};

export const updateUsername = async (username, id) => {
  const sql = `UPDATE users 
              SET username = $1 
              WHERE id = $2
              RETURNING username, id;`;
  const response = await db.query(sql, [username, id]);
  return response.rows[0];
};

export const updatePassword = async (password, id) => {
  password = await bcrypt.hash(password, 10);
  const sql = `UPDATE users 
                SET password = $1 
                WHERE id = $2 
                RETURNING username, id;`;
  const response = await db.query(sql, [password, id]);
  return response.rows[0];
};
