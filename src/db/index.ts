import envVariables from "../utils/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: envVariables.DATABASE_URL,
});
export const db = drizzle({ client: pool });
