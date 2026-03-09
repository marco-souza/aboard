import { z } from "zod";
import { providerEnum } from "./provider";

/**
 * Base user schema shared across User and Auth domains.
 * Ensures consistent data structures for names, avatars, and providers.
 */
export const userBaseSchema = z.strictObject({
  name: z.string().min(1).default("Jane Doe"),
  login: z.string().min(1),
  email: z
    .string()
    .refine((val) => val.includes("@"), { message: "Invalid email" }),
  provider: providerEnum,
  avatar: z
    .string()
    .refine((val) => val.startsWith("http"), { message: "Invalid URL" }),
});

export type UserBase = z.infer<typeof userBaseSchema>;
