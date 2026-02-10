import { z } from "zod";

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().default("Jane Doe"),
  login: z.string(),
  email: z.email(),
  provider: z.enum(["github", "google"]),
  avatar: z.url(),
});
export type User = z.infer<typeof userSchema>;

export const userSessionSchema = userSchema.omit({
  id: true,
});
export type UserSession = z.infer<typeof userSessionSchema>;

export const sessionDataSchema = z.strictObject({
  user: userSessionSchema,
  token: z.string(),
});
export type SessionData = z.infer<typeof sessionDataSchema>;

// API DTOs
//
// AddUserRequestDTO
// AddUserResponseDTO
// ...
