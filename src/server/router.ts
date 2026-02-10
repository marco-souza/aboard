import { Hono } from "hono";
import { auth } from "./auth";
import { health } from "./health";
import { posts } from "./posts";

const routes = new Hono()
  .basePath("/api/")
  // add routers
  .route("/posts", posts)
  .route("/auth", auth)
  .route("/healthcheck", health);

// Export the type for Hono RPC client
export type AppType = typeof routes;

export const app = routes;
