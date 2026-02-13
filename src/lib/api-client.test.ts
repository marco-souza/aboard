import { Hono } from "hono";
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";
import { health } from "~/server/health";
import { users } from "~/server/users";

// Build a test app without auth route — importing router.ts pulls in auth.ts
// which accesses OAuth config (~/config) at module level, failing in tests.
const app = new Hono()
  .basePath("/api/")
  .route("/users", users)
  .route("/healthcheck", health);

const client = testClient(app);

describe("Hono RPC client", () => {
  describe("GET /api/healthcheck", () => {
    it("returns ok status", async () => {
      const res = await client.api.healthcheck.$get();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toEqual({ status: "ok" });
    });
  });

  describe("GET /api/users", () => {
    it("returns empty list with default pagination", async () => {
      const res = await client.api.users.$get({ query: {} });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.users).toEqual([]);
      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);
    });

    it("accepts custom pagination and provider filter", async () => {
      const res = await client.api.users.$get({
        query: { limit: "5", offset: "10", provider: "github" },
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.limit).toBe(5);
      expect(data.offset).toBe(10);
      expect(data.provider).toBe("github");
    });
  });

  describe("GET /api/users/:id", () => {
    it("returns user by id", async () => {
      const id = crypto.randomUUID();
      const res = await client.api.users[":id"].$get({ param: { id } });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe(id);
    });
  });

  describe("POST /api/users", () => {
    it("creates a user", async () => {
      const payload = {
        name: "Jane Doe",
        login: "janedoe",
        email: "jane@example.com",
        provider: "github" as const,
        avatar: "https://example.com/avatar.png",
      };
      const res = await client.api.users.$post({ json: payload });
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.login).toBe("janedoe");
      expect(data.email).toBe("jane@example.com");
      expect(data.id).toBeDefined();
    });
  });

  describe("PUT /api/users/:id", () => {
    it("updates a user", async () => {
      const id = crypto.randomUUID();
      const res = await client.api.users[":id"].$put({
        param: { id },
        json: { name: "Updated Name" },
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe(id);
      expect(data.name).toBe("Updated Name");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("deletes a user", async () => {
      const id = crypto.randomUUID();
      const res = await client.api.users[":id"].$delete({ param: { id } });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe(id);
      expect(data.deleted).toBe(true);
    });
  });
});
