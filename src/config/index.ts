import { z } from "astro:schema";

const AppConfigSchema = z.object({
  BASE_URL: z.string().url(),
  GOOGLE_AUTH_KEY: z.string().min(1),
  GITHUB_AUTH_KEY: z.string().min(1),
});

export const config = AppConfigSchema.parse(Bun.env);
