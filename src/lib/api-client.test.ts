import { Hono } from "hono";
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";
import { health } from "~/server/health";
import { posts } from "~/server/posts";

// Build a test app with the same route structure as the real router
// (avoids importing router.ts which triggers env config validation)
const app = new Hono()
  .basePath("/api/")
  .route("/posts", posts)
  .route("/healthcheck", health);

describe("Hono RPC client", () => {
  const client = testClient(app);

  it("GET /api/healthcheck", async () => {
    const res = await client.api.healthcheck.$get();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({ status: "ok" });
  });

  it("GET /api/posts", async () => {
    const res = await client.api.posts.$get();
    expect(res.ok).toBe(true);

    const data = await res.json();
    expect(data.posts).toHaveLength(2);
    expect(data.posts[0]).toEqual({ id: 1, title: "Hello World" });
    expect(data.posts[1]).toEqual({ id: 2, title: "Goodbye World" });
  });
});
