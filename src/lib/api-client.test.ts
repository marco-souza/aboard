import { testClient } from "hono/testing";
import { describe, expect, it, vi } from "vitest";

// Mock config so importing router.ts doesn't blow up on missing/invalid env vars
vi.mock("~/config", () => ({
  config: {
    BASE_URL: "http://localhost:4321",
    GITHUB_ID: "test-github-id",
    GITHUB_SECRET: "test-github-secret",
    GOOGLE_ID: "test-google-id",
    GOOGLE_SECRET: "test-google-secret",
    NODE_ENV: "test",
  },
}));

const { app } = await import("~/server/router");
const client = testClient(app);

describe("API server", () => {
  // ── Healthcheck ──────────────────────────────────────────────

  describe("GET /api/healthcheck", () => {
    it("returns ok status", async () => {
      const res = await client.api.healthcheck.$get();
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: "ok" });
    });
  });

  // ── Users CRUD ───────────────────────────────────────────────

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

    it("rejects invalid provider", async () => {
      const res = await client.api.users.$get({
        query: { provider: "invalid" as "github" },
      });
      expect(res.status).toBe(400);
    });

    it("rejects negative offset", async () => {
      const res = await client.api.users.$get({
        query: { offset: "-1" },
      });
      expect(res.status).toBe(400);
    });

    it("rejects limit above 100", async () => {
      const res = await client.api.users.$get({
        query: { limit: "101" },
      });
      expect(res.status).toBe(400);
    });

    it("rejects limit of 0", async () => {
      const res = await client.api.users.$get({
        query: { limit: "0" },
      });
      expect(res.status).toBe(400);
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

    it("rejects invalid UUID", async () => {
      const res = await client.api.users[":id"].$get({
        param: { id: "not-a-uuid" },
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/users", () => {
    const validUser = {
      name: "Jane Doe",
      login: "janedoe",
      email: "jane@example.com",
      provider: "github" as const,
      avatar: "https://example.com/avatar.png",
    };

    it("creates a user", async () => {
      const res = await client.api.users.$post({ json: validUser });
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.login).toBe("janedoe");
      expect(data.email).toBe("jane@example.com");
      expect(data.provider).toBe("github");
      expect(data.id).toBeDefined();
    });

    it("rejects missing required fields", async () => {
      const res = await client.api.users.$post({
        json: { name: "Jane" } as typeof validUser,
      });
      expect(res.status).toBe(400);
    });

    it("rejects invalid email", async () => {
      const res = await client.api.users.$post({
        json: { ...validUser, email: "not-an-email" },
      });
      expect(res.status).toBe(400);
    });

    it("rejects invalid avatar URL", async () => {
      const res = await client.api.users.$post({
        json: { ...validUser, avatar: "not-a-url" },
      });
      expect(res.status).toBe(400);
    });

    it("rejects invalid provider", async () => {
      const res = await client.api.users.$post({
        json: { ...validUser, provider: "twitter" as "github" },
      });
      expect(res.status).toBe(400);
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

    it("accepts partial update", async () => {
      const id = crypto.randomUUID();
      const res = await client.api.users[":id"].$put({
        param: { id },
        json: { email: "new@example.com" },
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe(id);
      expect(data.email).toBe("new@example.com");
    });

    it("rejects invalid UUID param", async () => {
      const res = await client.api.users[":id"].$put({
        param: { id: "bad-id" },
        json: { name: "Test" },
      });
      expect(res.status).toBe(400);
    });

    it("rejects invalid email in body", async () => {
      const id = crypto.randomUUID();
      const res = await client.api.users[":id"].$put({
        param: { id },
        json: { email: "not-an-email" },
      });
      expect(res.status).toBe(400);
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

    it("rejects invalid UUID", async () => {
      const res = await client.api.users[":id"].$delete({
        param: { id: "bad-id" },
      });
      expect(res.status).toBe(400);
    });
  });

  // ── Auth ─────────────────────────────────────────────────────

  describe("GET /api/auth/logout", () => {
    it("redirects to login and clears session cookie", async () => {
      const res = await app.request("/api/auth/logout");
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/login");

      const setCookie = res.headers.get("set-cookie") ?? "";
      expect(setCookie).toContain("aboard_session=");
      expect(setCookie).toContain("Max-Age=0");
    });
  });
});
