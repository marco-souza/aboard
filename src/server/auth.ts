import { OpenAPIHono } from "@hono/zod-openapi";
import { githubAuth } from "@hono/oauth-providers/github";
import { googleAuth } from "@hono/oauth-providers/google";
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
  const grantedScopes = c.get("granted-scopes");
  const user = c.get("user-github");

  return c.json({
    token,
    grantedScopes,
    user,
  });
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
