import { configDotenv } from "dotenv";
import pg from "pg";

configDotenv();

console.log("DATABASE URL:", process.env.DATABASE_URL);

const db = new pg.Client(process.env.DATABASE_URL);

export default db;
