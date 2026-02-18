import { describe, it, expect } from "vitest";

import {
  extractOAuthUser,
  getSessionCookieConfig,
  isAuthenticated,
  isValidEmail,
  isValidProvider,
  validateSessionData,
  validateUserSession,
} from "~/domain/auth/service";
import { SESSION_COOKIE_NAME, MAX_SESSION_AGE } from "~/domain/auth/constants";

describe("Auth Service", () => {
  describe("validateUserSession", () => {
    it("should validate a valid user session", () => {
      const validSession = {
        name: "John Doe",
        login: "johndoe",
        email: "john@example.com",
        provider: "github" as const,
        avatar: "https://example.com/avatar.jpg",
      };

      const result = validateUserSession(validSession);

      expect(result.valid).toBe(true);
      expect(result.user).toEqual(validSession);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid email", () => {
      const invalidSession = {
        name: "John Doe",
        login: "johndoe",
        email: "not-an-email",
        provider: "github" as const,
        avatar: "https://example.com/avatar.jpg",
      };

      const result = validateUserSession(invalidSession);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject invalid URL for avatar", () => {
      const invalidSession = {
        name: "John Doe",
        login: "johndoe",
        email: "john@example.com",
        provider: "github" as const,
        avatar: "not-a-url",
      };

      const result = validateUserSession(invalidSession);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should use default name if not provided", () => {
      const sessionWithoutName = {
        login: "johndoe",
        email: "john@example.com",
        provider: "github" as const,
        avatar: "https://example.com/avatar.jpg",
      };

      const result = validateUserSession(sessionWithoutName);

      expect(result.valid).toBe(true);
      expect(result.user?.name).toBe("Jane Doe");
    });

    it("should reject invalid provider", () => {
      const invalidSession = {
        name: "John Doe",
        login: "johndoe",
        email: "john@example.com",
        provider: "invalid-provider",
        avatar: "https://example.com/avatar.jpg",
      };

      const result = validateUserSession(invalidSession);

      expect(result.valid).toBe(false);
    });
  });

  describe("validateSessionData", () => {
    it("should validate valid session data", () => {
      const sessionData = {
        user: {
          name: "John Doe",
          login: "johndoe",
          email: "john@example.com",
          provider: "github" as const,
          avatar: "https://example.com/avatar.jpg",
        },
        token: "some-token-string",
      };

      const result = validateSessionData(sessionData);

      expect(result.valid).toBe(true);
      expect(result.data).toEqual(sessionData);
    });

    it("should reject missing token", () => {
      const incompleteSession = {
        user: {
          name: "John Doe",
          login: "johndoe",
          email: "john@example.com",
          provider: "github" as const,
          avatar: "https://example.com/avatar.jpg",
        },
      };

      const result = validateSessionData(incompleteSession);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("isValidProvider", () => {
    it("should accept valid providers", () => {
      expect(isValidProvider("github")).toBe(true);
      expect(isValidProvider("google")).toBe(true);
    });

    it("should reject invalid providers", () => {
      expect(isValidProvider("twitter")).toBe(false);
      expect(isValidProvider("invalid")).toBe(false);
      expect(isValidProvider(123)).toBe(false);
    });
  });

  describe("extractOAuthUser", () => {
    it("should extract GitHub user from OAuth payload", () => {
      const payload = {
        login: "johndoe",
        name: "John Doe",
        email: "john@github.com",
        avatar_url: "https://avatars.githubusercontent.com/u/123456?v=4",
      };

      const user = extractOAuthUser("github", payload);

      expect(user).toEqual({
        name: "John Doe",
        login: "johndoe",
        email: "john@github.com",
        provider: "github",
        avatar: "https://avatars.githubusercontent.com/u/123456?v=4",
      });
    });

    it("should extract Google user from OAuth payload", () => {
      const payload = {
        name: "Jane Doe",
        email: "jane@gmail.com",
        picture: "https://example.com/jane.jpg",
      };

      const user = extractOAuthUser("google", payload);

      expect(user).toEqual({
        name: "Jane Doe",
        login: "jane",
        email: "jane@gmail.com",
        provider: "google",
        avatar: "https://example.com/jane.jpg",
      });
    });

    it("should handle GitHub user without name", () => {
      const payload = {
        login: "johndoe",
        email: "john@github.com",
        avatar_url: "https://avatars.githubusercontent.com/u/123456?v=4",
      };

      const user = extractOAuthUser("github", payload);

      expect(user?.name).toBe("johndoe");
    });

    it("should handle Google user without name", () => {
      const payload = {
        email: "jane@gmail.com",
        picture: "https://example.com/jane.jpg",
      };

      const user = extractOAuthUser("google", payload);

      expect(user?.name).toBe("Google User");
      expect(user?.login).toBe("jane");
    });

    it("should return null for invalid provider", () => {
      const payload = { email: "test@example.com" };

      // @ts-expect-error Testing invalid provider
      const user = extractOAuthUser("invalid", payload);

      expect(user).toBeNull();
    });

    it("should return null for invalid payload", () => {
      const payload = {
        login: "johndoe",
        email: "invalid-email",
        avatar_url: "not-a-url",
      };

      const user = extractOAuthUser("github", payload);

      expect(user).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true for valid session", () => {
      const session = {
        user: {
          name: "John Doe",
          login: "johndoe",
          email: "john@example.com",
          provider: "github" as const,
          avatar: "https://example.com/avatar.jpg",
        },
        token: "token",
      };

      expect(isAuthenticated(session)).toBe(true);
    });

    it("should return false for null session", () => {
      expect(isAuthenticated(null)).toBe(false);
    });

    it("should return false for undefined session", () => {
      // biome-ignore lint/suspicious/noExplicitAny: Testing type guard
      expect(isAuthenticated(undefined as any)).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("should accept valid emails", () => {
      expect(isValidEmail("john@example.com")).toBe(true);
      expect(isValidEmail("jane.doe+tag@example.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("invalid@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });

  describe("getSessionCookieConfig", () => {
    it("should return correct cookie configuration", () => {
      const config = getSessionCookieConfig();

      expect(config.name).toBe(SESSION_COOKIE_NAME);
      expect(config.maxAge).toBe(MAX_SESSION_AGE);
      expect(config.httpOnly).toBe(true);
      expect(config.secure).toBe(true);
      expect(config.sameSite).toBe("lax");
      expect(config.path).toBe("/");
    });

    it("should not be mutable", () => {
      const config = getSessionCookieConfig();
      const newConfig = getSessionCookieConfig();

      expect(config).toEqual(newConfig);
      expect(config).not.toBe(newConfig);
    });
  });
});
