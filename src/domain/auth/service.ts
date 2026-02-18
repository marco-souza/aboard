import { z } from "zod";

import { MAX_SESSION_AGE, SESSION_COOKIE_NAME } from "~/domain/auth/constants";
import {
  type SessionData,
  type UserSession,
  sessionDataSchema,
  userSessionSchema,
} from "~/domain/auth/schema";
import { type Provider, providerEnum } from "~/domain/shared/provider";
import { createErrorSummary } from "~/lib/zod-errors";

/**
 * Validates a session data object against the schema.
 * Returns validation result with error details if invalid.
 */
export function validateSessionData(data: unknown): {
  valid: boolean;
  data?: SessionData;
  error?: string;
} {
  const result = sessionDataSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: createErrorSummary(result.error),
    };
  }
  return { valid: true, data: result.data };
}

/**
 * Validates a user session object against the schema.
 * Returns validation result with error details if invalid.
 */
export function validateUserSession(data: unknown): {
  valid: boolean;
  user?: UserSession;
  error?: string;
} {
  const result = userSessionSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: createErrorSummary(result.error),
    };
  }
  return { valid: true, user: result.data };
}

/**
 * Checks if a provider name is valid according to the provider enum.
 */
export function isValidProvider(provider: unknown): provider is Provider {
  return providerEnum.safeParse(provider).success;
}

/**
 * Extracts normalized user data from an OAuth provider payload.
 * Each provider returns different fields, so this normalizes to our schema.
 */
export function extractOAuthUser(
  provider: Provider,
  payload: Record<string, unknown>,
): UserSession | null {
  try {
    switch (provider) {
      case "github": {
        const user = userSessionSchema.parse({
          name: payload.name || payload.login || "GitHub User",
          login: payload.login,
          email: payload.email,
          provider: "github",
          avatar: payload.avatar_url,
        });
        return user;
      }

      case "google": {
        const user = userSessionSchema.parse({
          name: payload.name || "Google User",
          login: payload.email?.split("@")[0] || "user",
          email: payload.email,
          provider: "google",
          avatar: payload.picture,
        });
        return user;
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Checks if a user is authenticated (has valid session).
 */
export function isAuthenticated(session: SessionData | null): boolean {
  return session != null;
}

/**
 * Checks if an email is in a valid format.
 */
export function isValidEmail(email: unknown): boolean {
  return z.string().email().safeParse(email).success;
}

/**
 * Gets the session cookie configuration object.
 */
export function getSessionCookieConfig() {
  return {
    name: SESSION_COOKIE_NAME,
    maxAge: MAX_SESSION_AGE,
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
  };
}
