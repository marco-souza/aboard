import type { Board, Card, Lane } from "./schema";

let counter = 0;
function nextUuid(): string {
  counter++;
  const hex = counter.toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex}`;
}

export function resetFixtureCounter() {
  counter = 0;
}

export function buildLane(overrides: Partial<Lane> = {}): Lane {
  return {
    id: nextUuid(),
    title: "Lane",
    position: 0,
    ...overrides,
  };
}

export function buildCard(overrides: Partial<Card> = {}): Card {
  return {
    id: nextUuid(),
    title: "Card",
    laneId: "00000000-0000-4000-8000-000000000000",
    position: 0,
    ...overrides,
  };
}

export function buildBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: nextUuid(),
    title: "Board",
    lanes: [],
    cards: [],
    ...overrides,
  };
}
