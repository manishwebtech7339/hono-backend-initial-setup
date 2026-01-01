import { db } from "../../config/db.js";

export const userRepo = {
  async getUserByEmail(email: string) {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0];
  },
};
