import { Hono } from "hono";
import { auth } from "./auth";
import { health } from "./health";
import { users } from "./users";

const routes = new Hono()
  .basePath("/api/")
  // add routers
  .route("/users", users)
  .route("/auth", auth)
  .route("/healthcheck", health);

// Export the type for Hono RPC client
export type AppType = typeof routes;

export const app = routes;
