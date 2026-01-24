import { posts } from "./posts";
import { configureDocs } from "./docs";
import { config } from "~/config";
import { health } from "./health";
import { OpenAPIHono } from "@hono/zod-openapi";

export const app = new OpenAPIHono()
  .basePath("/api/")
  // add routers
  .route("/posts", posts)
  .route("/healthcheck", health);

if (config.NODE_ENV !== "production") {
  configureDocs(app);
}
