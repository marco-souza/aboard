import { z } from "zod";

export const laneSchema = z.strictObject({
  id: z.uuid(),
  title: z.string().min(1),
  position: z.int().nonnegative(),
});
export type Lane = z.infer<typeof laneSchema>;

export const cardSchema = z.strictObject({
  id: z.uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  laneId: z.uuid(),
  position: z.int().nonnegative(),
});
export type Card = z.infer<typeof cardSchema>;

export const boardSchema = z.strictObject({
  id: z.uuid(),
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
  laneId: z.uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});
export type AddCardRequest = z.infer<typeof addCardRequestSchema>;

export const moveCardRequestSchema = z.strictObject({
  cardId: z.uuid(),
  targetLaneId: z.uuid(),
  position: z.int().nonnegative(),
});
export type MoveCardRequest = z.infer<typeof moveCardRequestSchema>;
