import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import envVariables from "../utils/env.js";

const jwtMiddleware = createMiddleware(async (c, next) => {
  const jwtFun = jwt({
    secret: envVariables.JWT_SECRET!,
  });
  await jwtFun(c, next);
});

export default jwtMiddleware;
