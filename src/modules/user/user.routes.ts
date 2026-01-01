import { Hono } from "hono";
import { getUserByEmail } from "./user.controller.js";

const userRoutes = new Hono();

userRoutes.post("/get-user-by-email/:email", getUserByEmail);

export default userRoutes;
