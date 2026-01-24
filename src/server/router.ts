import { OpenAPIHono } from "@hono/zod-openapi";
import { config } from "~/config";
import { configureDocs } from "./docs";
import { health } from "./health";
import { posts } from "./posts";
import { auth } from "./auth";

export const app = new OpenAPIHono()
  .basePath("/api/")
  // add routers
  .route("/posts", posts)
  .route("/auth", auth)
  .route("/healthcheck", health);

if (config.NODE_ENV !== "production") {
  configureDocs(app);
}
