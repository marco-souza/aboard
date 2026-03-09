import { z } from "zod";

const uuidSchema = z.string().length(36, { message: "Invalid UUID length" });
const urlSchema = z
  .string()
  .refine((val) => val.startsWith("http"), { message: "Invalid URL" });

export const laneSchema = z.strictObject({
  id: uuidSchema,
  title: z.string().min(1),
  position: z.number().int().nonnegative(),
});
export type Lane = z.infer<typeof laneSchema>;

export const cardAssigneeSchema = z.strictObject({
  id: uuidSchema,
  name: z.string().min(1),
  avatar: urlSchema,
});
export type CardAssignee = z.infer<typeof cardAssigneeSchema>;

export const cardSchema = z.strictObject({
  id: uuidSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  laneId: uuidSchema,
  position: z.number().int().nonnegative(),
  assignee: cardAssigneeSchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Card = z.infer<typeof cardSchema>;

export const boardSchema = z.strictObject({
  id: uuidSchema,
  title: z.string().min(1),
  lanes: z.array(laneSchema),
  cards: z.array(cardSchema),
});
export type Board = z.infer<typeof boardSchema>;

// API DTOs

export const createBoardRequestSchema = z.strictObject({
  title: z.string().min(1),
});
export type CreateBoardRequest = z.infer<typeof createBoardRequestSchema>;

export const addLaneRequestSchema = z.strictObject({
  title: z.string().min(1),
});
export type AddLaneRequest = z.infer<typeof addLaneRequestSchema>;

export const addCardRequestSchema = z.strictObject({
  laneId: uuidSchema,
  title: z.string().min(1),
  description: z.string().optional(),
});
export type AddCardRequest = z.infer<typeof addCardRequestSchema>;

export const moveCardRequestSchema = z.strictObject({
  cardId: uuidSchema,
  targetLaneId: uuidSchema,
  position: z.number().int().nonnegative(),
});
export type MoveCardRequest = z.infer<typeof moveCardRequestSchema>;
