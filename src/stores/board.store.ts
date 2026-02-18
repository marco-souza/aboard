import { createMemo, createSignal } from "solid-js";
import { DEFAULT_LANE_INDEX, DEFAULT_LANES } from "~/domain/board/constants";
import type { Board } from "~/domain/board/schema";
import { BoardService } from "~/domain/board/service";

export const DEFAULT_LANE_TITLES = DEFAULT_LANES;

export function useBoardStore(title: string) {
  const [board, setBoard] = createSignal<Board>(
    BoardService.createBoard(title),
  );

  const lanes = createMemo(() =>
    [...board().lanes].sort((a, b) => a.position - b.position),
  );

  const defaultLaneId = createMemo(() => lanes()[DEFAULT_LANE_INDEX].id);

  function cardsInLane(laneId: string) {
    return board()
      .cards.filter((c) => c.laneId === laneId)
      .sort((a, b) => a.position - b.position);
  }

  function addLane(laneTitle: string) {
    setBoard((prev) => BoardService.addLane(prev, laneTitle));
  }

  function removeLane(laneId: string) {
    setBoard((prev) => BoardService.removeLane(prev, laneId));
  }

  function addCard(laneId: string, cardTitle: string, description?: string) {
    setBoard((prev) =>
      BoardService.addCard(prev, laneId, cardTitle, description),
    );
  }

  function removeCard(cardId: string) {
    setBoard((prev) => BoardService.removeCard(prev, cardId));
  }

  function moveCard(cardId: string, targetLaneId: string, position: number) {
    setBoard((prev) =>
      BoardService.moveCard(prev, cardId, targetLaneId, position),
    );
  }

  return {
    board,
    lanes,
    defaultLaneId,
    cardsInLane,
    addLane,
    removeLane,
    addCard,
    removeCard,
    moveCard,
  };
}

export type BoardStore = ReturnType<typeof useBoardStore>;
