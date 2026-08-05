import db from "../client.js";
import { v4 } from "uuid";

export const creatScore = async (score, id) => {
  const sql = `INSERT INTO user_scores (score_id, user_id, score ) VALUES ($1, $2, $3) 
                RETURNING *;`;

  const response = await db.query(sql, [v4(), id, score]);
  return response.rows[0];
};

export const getScore = async () => {
  const sql = `SELECT * FROM user_scores 
                ORDER BY score DESC 
                LIMIT 15;`;
  const response = await db.query(sql);
  return response.rows;
};

export const getUserScore = async (id) => {
  const sql = `SELECT * FROM user_scores 
                WHERE id = $1 
                ORDER BY score DESC 
                LIMIT 10;`;
  const response = await db.query(sql, [id]);
  return response.rows;
};
