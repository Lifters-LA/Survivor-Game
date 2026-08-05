import db from "./client.js";

const seed = async () => {
  const sql = `DROP TABLE IF EXISTS users CASCADE;
               DROP TABLE IF EXISTS user_scores CASCADE;
               
               CREATE TABLE users(
               id UUID PRIMARY KEY,
               username TEXT UNIQUE NOT NULL ,
               password TEXT NOT NULL);
               
               CREATE TABLE user_scores(
               score_id UUID PRIMARY KEY,
               user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
               score INT NOT NULL);`;

  await db.query(sql);
};

export default seed;
