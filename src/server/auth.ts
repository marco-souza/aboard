import { githubAuth } from "@hono/oauth-providers/github";
import { googleAuth } from "@hono/oauth-providers/google";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { config } from "~/config";
import {
  MAX_SESSION_AGE,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_PATH,
} from "~/domain/auth/constants";
import { sessionDataSchema } from "~/domain/auth/schema";
import { routes } from "./contants";

export const auth = new Hono()
  .use(
    "/github",
    githubAuth({
      client_id: config.GITHUB_ID,
      client_secret: config.GITHUB_SECRET,
      scope: ["user:email"],
      oauthApp: true,
    }),
  )
  .get("/github", (c) => {
    const token = c.get("token");
    const user = c.get("user-github");

    if (!user || !token) {
      return c.redirect(`${routes.public.login}?error=github_auth_failed`);
    }

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
  })
  .use(
    "/google",
    googleAuth({
      client_id: config.GOOGLE_ID,
      client_secret: config.GOOGLE_SECRET,
      scope: ["openid", "email", "profile"],
    }),
  )
  .get("/google", (c) => {
    const token = c.get("token");
    const user = c.get("user-google");

    if (!user || !token) {
      return c.redirect(`${routes.public.login}?error=google_auth_failed`);
    }

    const sessionData = sessionDataSchema.parse({
      user: {
        name: user.name || user.email,
        avatar: user.picture,
        email: user.email,
        login: user.email,
        provider: "google",
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
  })
  .get("/logout", (c) => {
    deleteCookie(c, SESSION_COOKIE_NAME, {
      path: SESSION_COOKIE_PATH,
      maxAge: 0,
      secure: import.meta.env.PROD,
      httpOnly: import.meta.env.PROD,
      sameSite: "Lax",
    });

    return c.redirect(routes.public.login);
  });
