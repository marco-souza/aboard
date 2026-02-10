import { githubAuth } from "@hono/oauth-providers/github";
import { googleAuth } from "@hono/oauth-providers/google";
import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteCookie, setCookie } from "hono/cookie";
import { config } from "~/config";
import {
  MAX_SESSION_AGE,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_PATH,
} from "~/domain/user/constants";

import { routes } from "./contants";
import { sessionDataSchema } from "~/domain/user/schema";

export const auth = new OpenAPIHono();

auth.use(
  "/github",
  githubAuth({
    client_id: config.GITHUB_ID,
    client_secret: config.GITHUB_SECRET,
    scope: ["user:email"],
    oauthApp: true,
  }),
);

auth.get("/github", (c) => {
  const token = c.get("token");
  const user = c.get("user-github");

  if (!user || !token) {
    return c.redirect(`${routes.public.login}?error=github_auth_failed`);
  }

  // In a real app, you'd store this in a DB and create a session
  // For now, we'll set a simple cookie with the user info
  const sessionData = sessionDataSchema.parse({
    user: {
      name: user.name || user.login,
      avatar: user.avatar_url,
      email: user.email,
      login: user.login,
      provider: "github",
    },
    token: token.token,
  });

  setCookie(c, SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    path: SESSION_COOKIE_PATH,
    secure: import.meta.env.PROD,
    httpOnly: import.meta.env.PROD,
    maxAge: MAX_SESSION_AGE, // 7 days
    sameSite: "Lax",
  });

  return c.redirect(routes.private.dashboard);
});

auth.use(
  "/google",
  googleAuth({
    client_id: config.GOOGLE_ID,
    client_secret: config.GOOGLE_SECRET,
    scope: ["openid", "email", "profile"],
  }),
);

auth.get("/google", (c) => {
  const token = c.get("token");
  const grantedScopes = c.get("granted-scopes");
  const user = c.get("user-google");

  return c.json({
    token,
    grantedScopes,
    user,
  });
});

auth.get("/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: SESSION_COOKIE_PATH,
    maxAge: 0,
    secure: import.meta.env.PROD,
    httpOnly: import.meta.env.PROD,
    sameSite: "Lax",
  });

  return c.redirect(routes.public.login);
});
