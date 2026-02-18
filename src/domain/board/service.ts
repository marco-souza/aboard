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

export const BoardService = {
  createBoard(title: string): Board {
    return { id: uuid(), title, lanes: [], cards: [] };
  },

  addLane(board: Board, title: string): Board {
    const position = board.lanes.length;
    return {
      ...board,
      lanes: [...board.lanes, { id: uuid(), title, position }],
    };
  },

  removeLane(board: Board, laneId: string): Board {
    if (!board.lanes.some((l) => l.id === laneId)) return board;

    const remaining = sortedByPosition(
      board.lanes.filter((l) => l.id !== laneId),
    );
    return {
      ...board,
      lanes: assignPositions(remaining),
      cards: board.cards.filter((c) => c.laneId !== laneId),
    };
  },

  reorderLanes(board: Board, laneId: string, newPosition: number): Board {
    const sorted = sortedByPosition(board.lanes);
    const lane = sorted.find((l) => l.id === laneId);
    if (!lane) return board;

    const others = sorted.filter((l) => l.id !== laneId);
    const clamped = Math.max(0, Math.min(newPosition, others.length));
    others.splice(clamped, 0, lane);

    return { ...board, lanes: assignPositions(others) };
  },

  addCard(
    board: Board,
    laneId: string,
    title: string,
    description?: string,
  ): Board {
    if (!board.lanes.some((l) => l.id === laneId)) {
      throw new Error(`Lane ${laneId} does not exist`);
    }

    const position = cardsInLane(board.cards, laneId).length;
    const card: Card = { id: uuid(), title, laneId, position, description };

    return { ...board, cards: [...board.cards, card] };
  },

  removeCard(board: Board, cardId: string): Board {
    const card = board.cards.find((c) => c.id === cardId);
    if (!card) return board;

    const remaining = board.cards.filter((c) => c.id !== cardId);
    const laneCards = assignPositions(
      sortedByPosition(remaining.filter((c) => c.laneId === card.laneId)),
    );
    const otherCards = remaining.filter((c) => c.laneId !== card.laneId);

    return { ...board, cards: [...otherCards, ...laneCards] };
  },

  moveCard(
    board: Board,
    cardId: string,
    targetLaneId: string,
    position: number,
  ): Board {
    const card = board.cards.find((c) => c.id === cardId);
    if (!card) throw new Error(`Card ${cardId} does not exist`);
    if (!board.lanes.some((l) => l.id === targetLaneId)) {
      throw new Error(`Lane ${targetLaneId} does not exist`);
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
    });
    const reorderedTarget = assignPositions(targetCards);

    const touchedLanes = new Set([sourceLaneId, targetLaneId]);
    const untouchedCards = withoutCard.filter(
      (c) => !touchedLanes.has(c.laneId),
    );

    return {
      ...board,
      cards: [...untouchedCards, ...sourceCards, ...reorderedTarget],
    };
  },
};
