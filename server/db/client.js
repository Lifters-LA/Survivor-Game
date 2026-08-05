import { configDotenv } from "dotenv";
import pg from "pg";

configDotenv();

const db = new pg.Client(process.env.DATABASE_URL);

export default db;
