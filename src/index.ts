import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { PORT } from "./config/env.js";

// Start Project
function start() {
  // Connect DB
  // Run server
  serve(
    {
      fetch: app.fetch,
      port: Number(PORT),
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
}

start();
