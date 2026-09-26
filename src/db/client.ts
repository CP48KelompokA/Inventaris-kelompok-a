import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let database: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!database) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL belum dikonfigurasi.");
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
    attachDatabasePool(pool);
    database = drizzle(pool);
  }
  return database;
}
