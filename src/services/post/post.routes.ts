import { Hono } from "hono";
import {
  errorResponse,
  MESSAGES,
  paginationDataMaker,
  successResponse,
} from "../../utils/responseHelper.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";
import { zValidator } from "@hono/zod-validator";
import {
  createPostDBSchema,
  postDBTable,
  updatePostDBSchema,
  usersDBTable,
} from "../../db/schema.js";
import { db } from "../../db/index.js";
import z from "zod";
import { eq, ilike } from "drizzle-orm";

const postRoutes = new Hono();

// // Get
// postRoutes.get("/language", jwtMiddleware, authMiddleware, async (c) => {
//   const lang = c.get("language");
//   console.log("lang:", lang);
//   console.log(c.var, "Get User From Header");

//   return successResponse({
//     c,
//     message: MESSAGES.FETCHED,
//     data: "",
//     statusCode: 200,
//   });
// });

// Get
postRoutes.get("/", async (c) => {
  // Query
  const { q = "", page = 1, pageSize = 20 } = c.req.query();

  // Get post data
  const postsCount = await db.$count(postDBTable);
  const posts = await db
    .select()
    .from(postDBTable)
    .orderBy(postDBTable.createdAt)
    .where(ilike(postDBTable.title, `%${q}%`))
    .limit(Number(pageSize))
    .offset(Number(pageSize) * (Number(page) - 1))
    .leftJoin(usersDBTable, eq(usersDBTable.id, postDBTable.userId));

  const prepareData = paginationDataMaker({
    page: Number(page),
    pageSize: Number(pageSize),
    totalCount: postsCount,
    data: posts.map((p) => ({
      id: p.posts.id,
      title: p.posts.title,
      content: p.posts.content,
      createdAt: p.posts.createdAt,
      updatedAt: p.posts.updatedAt,
      user: p.users
        ? {
            id: p.users.id,
            name: p.users.name,
            email: p.users.email,
            isVerified: p.users.isVerified,
            createdAt: p.users.createdAt,
            updatedAt: p.users.updatedAt,
          }
        : null,
    })),
  });

  return successResponse({
    c,
    message: MESSAGES.FETCHED,
    data: prepareData,
    statusCode: 200,
  });
});

// Get Single
postRoutes.get("/:id", async (c) => {
  const data = ["manish"];
  successResponse({ c, message: MESSAGES.FETCHED, data, statusCode: 200 });
});

// Create
postRoutes.post(
  "/",
  jwtMiddleware,
  authMiddleware,
  zValidator("json", createPostDBSchema),
  async (c) => {
    // Payload
    const payload = await c.req.json();

    // Prepare Data
    const userId = c.var.jwtPayload.id;
    const prepareData = {
      title: payload.title,
      content: payload.content,
      userId: userId,
    };

    // Save post
    const savePost = await db
      .insert(postDBTable)
      .values(prepareData)
      .returning();
    const createdPost = savePost?.[0];
    if (!createdPost) {
      return errorResponse({
        c,
        message: MESSAGES.BAD_REQUEST,
        statusCode: 404,
      });
    }
    return successResponse({
      c,
      message: MESSAGES.FETCHED,
      data: createdPost,
      statusCode: 200,
    });
  }
);

// Get Update
postRoutes.put(
  "/",
  jwtMiddleware,
  authMiddleware,
  zValidator("json", updatePostDBSchema.extend({ id: z.string().min(1) })),
  async (c) => {
    // Payload
    const payload = await c.req.json();

    // Prepare Data
    const prepareData = {
      title: payload.title,
      content: payload.content,
    };

    // Save post
    const updatePost = await db
      .update(postDBTable)
      .set(prepareData)
      .where(eq(postDBTable.id, payload.id))
      .returning();

    if (!updatePost?.[0]) {
      return errorResponse({
        c,
        message: MESSAGES.NOT_FOUND,
        statusCode: 404,
      });
    }

    return successResponse({
      c,
      message: MESSAGES.UPDATED,
      data: updatePost,
      statusCode: 200,
    });
  }
);

// Get Delete
postRoutes.delete("/", jwtMiddleware, authMiddleware, async (c) => {
  const id = c.req.query("id");
  if (!id) {
    return errorResponse({
      c,
      message: MESSAGES.BAD_REQUEST,
      statusCode: 400,
      error: {
        message: "Post id is required",
      },
    });
  }

  // Delete post
  const deletePost = await db
    .delete(postDBTable)
    .where(eq(postDBTable.id, id))
    .returning();

  if (!deletePost?.[0]) {
    return errorResponse({
      c,
      message: MESSAGES.NOT_FOUND,
      statusCode: 404,
      error: {
        message: "Post not found",
      },
    });
  }

  return successResponse({
    c,
    message: MESSAGES.DELETED,
    data: deletePost,
    statusCode: 200,
  });
});

export default postRoutes;
