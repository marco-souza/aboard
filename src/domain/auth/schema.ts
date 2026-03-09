import { z } from "zod";
import { userBaseSchema } from "~/domain/shared/user";

/**
 * User session schema derived from base user data.
 */
export const userSessionSchema = userBaseSchema;
export type UserSession = z.infer<typeof userSessionSchema>;

export const sessionDataSchema = z.strictObject({
  user: userSessionSchema,
  token: z.string().min(1),
});
export type SessionData = z.infer<typeof sessionDataSchema>;
