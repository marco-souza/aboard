import { NotFoundError } from "~/domain/shared/errors";
import { DEFAULT_LANES } from "./constants";
import type { Board, Card } from "./schema";

function uuid(): string {
  return crypto.randomUUID();
}

function sortedByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

function assignPositions<T extends { position: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, position: i }));
}

function cardsInLane(cards: Card[], laneId: string): Card[] {
  return cards.filter((c) => c.laneId === laneId);
}

/**
 * Creates a new board with default lanes initialized.
 */
export function createBoard(title: string): Board {
  const lanes = DEFAULT_LANES.map((name, i) => ({
    id: uuid(),
    title: name,
    position: i,
  }));
  return { id: uuid(), title, lanes, cards: [] };
}

/**
 * Adds a new lane to the end of the board.
 */
export function addLane(board: Board, title: string): Board {
  const position = board.lanes.length;
  return {
    ...board,
    lanes: [...board.lanes, { id: uuid(), title, position }],
  };
}

/**
 * Removes a lane and all its associated cards.
 */
export function removeLane(board: Board, laneId: string): Board {
  if (!board.lanes.some((l) => l.id === laneId)) return board;

  const remaining = sortedByPosition(
    board.lanes.filter((l) => l.id !== laneId),
  );
  return {
    ...board,
    lanes: assignPositions(remaining),
    cards: board.cards.filter((c) => c.laneId !== laneId),
  };
}

/**
 * Changes the order of lanes within a board.
 */
export function reorderLanes(
  board: Board,
  laneId: string,
  newPosition: number,
): Board {
  const sorted = sortedByPosition(board.lanes);
  const lane = sorted.find((l) => l.id === laneId);
  if (!lane) return board;

  const others = sorted.filter((l) => l.id !== laneId);
  const clamped = Math.max(0, Math.min(newPosition, others.length));
  others.splice(clamped, 0, lane);

  return { ...board, lanes: assignPositions(others) };
}

/**
 * Adds a card to a specific lane.
 * @throws {NotFoundError} If the target lane does not exist.
 */
export function addCard(
  board: Board,
  laneId: string,
  title: string,
  description?: string,
): Board {
  if (!board.lanes.some((l) => l.id === laneId)) {
    throw new NotFoundError("Lane", laneId);
  }

  const position = cardsInLane(board.cards, laneId).length;
  const now = new Date();
  const card: Card = {
    id: uuid(),
    title,
    laneId,
    position,
    description,
    createdAt: now,
    updatedAt: now,
  };

  return { ...board, cards: [...board.cards, card] };
}

/**
 * Removes a card and re-calculates positions for remaining cards in that lane.
 */
export function removeCard(board: Board, cardId: string): Board {
  const card = board.cards.find((c) => c.id === cardId);
  if (!card) return board;

  const remaining = board.cards.filter((c) => c.id !== cardId);
  const laneCards = assignPositions(
    sortedByPosition(remaining.filter((c) => c.laneId === card.laneId)),
  );
  const otherCards = remaining.filter((c) => c.laneId !== card.laneId);

  return { ...board, cards: [...otherCards, ...laneCards] };
}

/**
 * Moves a card within a lane or between different lanes.
 * @throws {NotFoundError} If the card or target lane does not exist.
 */
export function moveCard(
  board: Board,
  cardId: string,
  targetLaneId: string,
  position: number,
): Board {
  const card = board.cards.find((c) => c.id === cardId);
  if (!card) throw new NotFoundError("Card", cardId);
  if (!board.lanes.some((l) => l.id === targetLaneId)) {
    throw new NotFoundError("Lane", targetLaneId);
  }

  const sourceLaneId = card.laneId;
  const withoutCard = board.cards.filter((c) => c.id !== cardId);

  const sourceCards =
    sourceLaneId === targetLaneId
      ? []
      : assignPositions(
          sortedByPosition(
            withoutCard.filter((c) => c.laneId === sourceLaneId),
          ),
        );

  const targetCards = sortedByPosition(
    withoutCard.filter((c) => c.laneId === targetLaneId),
  );
  const clamped = Math.max(0, Math.min(position, targetCards.length));
  targetCards.splice(clamped, 0, {
    ...card,
    laneId: targetLaneId,
    position: 0,
    updatedAt: new Date(),
  });
  const reorderedTarget = assignPositions(targetCards);

  const touchedLanes = new Set([sourceLaneId, targetLaneId]);
  const untouchedCards = withoutCard.filter((c) => !touchedLanes.has(c.laneId));

  return {
    ...board,
    cards: [...untouchedCards, ...sourceCards, ...reorderedTarget],
  };
}

// Deprecated: Moving to named exports. Use top-level functions instead.
export const BoardService = {
  createBoard,
  addLane,
  removeLane,
  reorderLanes,
  addCard,
  removeCard,
  moveCard,
};
