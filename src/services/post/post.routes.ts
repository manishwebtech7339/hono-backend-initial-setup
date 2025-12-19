import { Hono } from "hono";
import { MESSAGES, successResponse } from "../../utils/responseHelper.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";

const postRoutes = new Hono();

// Get
postRoutes.get("/", jwtMiddleware, jwtMiddleware, authMiddleware, async (c) => {
  const data = ["manish"];
  const lang = c.get("language");
  console.log("lang:", lang);
  console.log(c.var, "Get User From Header");
  return successResponse({
    c,
    message: MESSAGES.FETCHED,
    data,
    statusCode: 200,
  });
});

// Get Single
postRoutes.get("/:id", async (c) => {
  const data = ["manish"];
  successResponse({ c, message: MESSAGES.FETCHED, data, statusCode: 200 });
});

// Get Create
postRoutes.post("/", jwtMiddleware, authMiddleware, async (c) => {
  const data = ["manish"];
  successResponse({ c, message: MESSAGES.FETCHED, data, statusCode: 200 });
});

// Get Update
postRoutes.put("/", jwtMiddleware, authMiddleware, async (c) => {
  const data = ["manish"];
  successResponse({ c, message: MESSAGES.FETCHED, data, statusCode: 200 });
});

// Get Delete
postRoutes.delete("/", jwtMiddleware, authMiddleware, async (c) => {
  const data = ["manish"];
  successResponse({ c, message: MESSAGES.FETCHED, data, statusCode: 200 });
});

export default postRoutes;
