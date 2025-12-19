import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import postRoutes from "./services/post/post.routes.js";
import { languageDetector } from "hono/language";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorResponse, MESSAGES } from "./utils/responseHelper.js";
import userRoutes from "./services/users/user.routes.js";
import authRoutes from "./services/auth/auth.routes.js";
import envVariables from "./utils/env.js";

const app = new Hono().basePath("/api/v1");

// Logger
app.use(logger());

app.use("/api/*", cors());

// Server Static Files
app.use("/static/*", serveStatic({ root: "./" })); // Files Will get By: ./static/hello.txt

// Language
app.use(
  "*",
  languageDetector({
    order: ["header"],
    supportedLanguages: ["en"],
    fallbackLanguage: "en",
    caches: false,
    lookupFromHeaderKey: "accept-language",

    // Debugging
    debug: process.env.NODE_ENV !== "production",
  })
);

// Routes
app.get("/", (c) => c.json({ test: "Running project - Hono-js Learn" }));
app.route("/auth", authRoutes);
app.route("/post", postRoutes);
app.route("/users", userRoutes);

// Handle uncaught errors
app.onError((err, c) => {
  console.error("Unhandled Error:", err);
  return errorResponse({
    c,
    message: MESSAGES.INTERNAL_ERROR,
    statusCode: 500,
    error: err,
  });
});

// Run the server
serve(
  {
    fetch: app.fetch,
    port: envVariables.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
