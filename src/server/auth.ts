import { OpenAPIHono } from "@hono/zod-openapi";
import { githubAuth } from "@hono/oauth-providers/github";
import { googleAuth } from "@hono/oauth-providers/google";
import { setCookie } from "hono/cookie";
import { config } from "~/config";

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
    return c.redirect("/login?error=github_auth_failed");
  }

  // In a real app, you'd store this in a DB and create a session
  // For now, we'll set a simple cookie with the user info
  const sessionData = {
    user: {
      name: user.name || user.login,
      avatar: user.avatar_url,
      email: user.email,
    },
    token: token.token,
  };

  setCookie(c, "aboard_session", JSON.stringify(sessionData), {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "Lax",
  });

  return c.redirect("/dashboard");
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
