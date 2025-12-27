import { createMiddleware } from "hono/factory";
import { db } from "../db/index.js";
import { usersDBTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { errorResponse, MESSAGES } from "../utils/responseHelper.js";

const authMiddleware = createMiddleware(async (c, next) => {
  const userPayload = c.get("jwtPayload");

  // Check user in db
  const checkUser = await db
    .select()
    .from(usersDBTable)
    .where(eq(usersDBTable.id, userPayload.id));
  const userData = checkUser?.[0];
  if (!userData?.id) {
    return errorResponse({
      c,
      message: MESSAGES.UNAUTHORIZED,
      statusCode: 401,
      error: {
        message: "User not found",
      },
    });
  }

  // Set user data in request header
  c.set("user", userData);
  await next();
});

export default authMiddleware;
