import type { Context } from "hono";
import { userService } from "./user.service.js";

export const getUserByEmail = async (c: Context) => {
  const email = c.req.param("email") || "";

  const user = await userService.getUserByEmail(email);

  return c.json({
    success: true,
    data: user,
  });
};
