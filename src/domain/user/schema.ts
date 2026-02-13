import { z } from "zod";

import { paginationSchema } from "~/domain/shared/pagination";

export const providerEnum = z.enum(["github", "google"]);
export type Provider = z.infer<typeof providerEnum>;

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().default("Jane Doe"),
  login: z.string(),
  email: z.email(),
  provider: providerEnum,
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

export const userIdParamSchema = userSchema.pick({ id: true });
export type UserIdParam = z.infer<typeof userIdParamSchema>;

export const createUserRequestSchema = userSchema.omit({ id: true });
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export const updateUserRequestSchema = createUserRequestSchema.partial();
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export const listUsersQuerySchema = paginationSchema.extend({
  provider: providerEnum.optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
