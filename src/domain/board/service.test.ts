import { afterEach, describe, expect, it } from "vitest";

import {
  buildBoard,
  buildCard,
  buildLane,
  resetFixtureCounter,
} from "./fixtures";
import { DEFAULT_LANES } from "./constants";
import { BoardService } from "./service";

afterEach(resetFixtureCounter);

describe("BoardService", () => {
  describe("createBoard", () => {
    it("creates a board with the given title", () => {
      const board = BoardService.createBoard("Sprint 1");
      expect(board.title).toBe("Sprint 1");
      expect(board.id).toBeDefined();
      expect(board.cards).toEqual([]);
    });

    it("creates default lanes in order", () => {
      const board = BoardService.createBoard("Sprint 1");
      expect(board.lanes).toHaveLength(DEFAULT_LANES.length);
      expect(board.lanes.map((l) => l.title)).toEqual([...DEFAULT_LANES]);
      expect(board.lanes.map((l) => l.position)).toEqual([0, 1, 2]);
    });
  });

  describe("addLane", () => {
    it("adds a lane with position 0 to an empty board", () => {
      const board = buildBoard();
      const result = BoardService.addLane(board, "To Do");

      expect(result.lanes).toHaveLength(1);
      expect(result.lanes[0].title).toBe("To Do");
      expect(result.lanes[0].position).toBe(0);
    });

    it("appends a lane with the next position", () => {
      const lane = buildLane({ title: "To Do", position: 0 });
      const board = buildBoard({ lanes: [lane] });
      const result = BoardService.addLane(board, "In Progress");

      expect(result.lanes).toHaveLength(2);
      expect(result.lanes[1].title).toBe("In Progress");
      expect(result.lanes[1].position).toBe(1);
    });

    it("does not mutate the original board", () => {
      const board = buildBoard();
      const result = BoardService.addLane(board, "To Do");

      expect(board.lanes).toHaveLength(0);
      expect(result.lanes).toHaveLength(1);
    });
  });

  describe("removeLane", () => {
    it("removes the lane by id", () => {
      const lane = buildLane({ position: 0 });
      const board = buildBoard({ lanes: [lane] });
      const result = BoardService.removeLane(board, lane.id);

      expect(result.lanes).toHaveLength(0);
    });

    it("removes cards belonging to the removed lane", () => {
      const lane = buildLane({ position: 0 });
      const card = buildCard({ laneId: lane.id, position: 0 });
      const board = buildBoard({ lanes: [lane], cards: [card] });
      const result = BoardService.removeLane(board, lane.id);

      expect(result.cards).toHaveLength(0);
    });

    it("recalculates positions after removal", () => {
      const l1 = buildLane({ position: 0 });
      const l2 = buildLane({ position: 1 });
      const l3 = buildLane({ position: 2 });
      const board = buildBoard({ lanes: [l1, l2, l3] });
      const result = BoardService.removeLane(board, l2.id);

      expect(result.lanes).toHaveLength(2);
      expect(result.lanes[0].position).toBe(0);
      expect(result.lanes[1].position).toBe(1);
    });

    it("returns the board unchanged if lane does not exist", () => {
      const board = buildBoard();
      const result = BoardService.removeLane(
        board,
        "00000000-0000-4000-8000-ffffffffffff",
      );

      expect(result).toEqual(board);
    });
  });

  describe("reorderLanes", () => {
    it("moves a lane to a new position", () => {
      const l1 = buildLane({ title: "A", position: 0 });
      const l2 = buildLane({ title: "B", position: 1 });
      const l3 = buildLane({ title: "C", position: 2 });
      const board = buildBoard({ lanes: [l1, l2, l3] });

      const result = BoardService.reorderLanes(board, l3.id, 0);

      expect(result.lanes.map((l) => l.title)).toEqual(["C", "A", "B"]);
      expect(result.lanes.map((l) => l.position)).toEqual([0, 1, 2]);
    });

    it("handles moving to the same position", () => {
      const l1 = buildLane({ title: "A", position: 0 });
      const l2 = buildLane({ title: "B", position: 1 });
      const board = buildBoard({ lanes: [l1, l2] });

      const result = BoardService.reorderLanes(board, l1.id, 0);

      expect(result.lanes.map((l) => l.title)).toEqual(["A", "B"]);
    });

    it("clamps position to valid range", () => {
      const l1 = buildLane({ title: "A", position: 0 });
      const l2 = buildLane({ title: "B", position: 1 });
      const board = buildBoard({ lanes: [l1, l2] });

      const result = BoardService.reorderLanes(board, l1.id, 99);

      expect(result.lanes[result.lanes.length - 1].title).toBe("A");
    });
  });

  describe("addCard", () => {
    it("adds a card to the specified lane", () => {
      const lane = buildLane({ position: 0 });
      const board = buildBoard({ lanes: [lane] });
      const result = BoardService.addCard(board, lane.id, "My Task");

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].title).toBe("My Task");
      expect(result.cards[0].laneId).toBe(lane.id);
      expect(result.cards[0].position).toBe(0);
    });

    it("adds a card with an optional description", () => {
      const lane = buildLane({ position: 0 });
      const board = buildBoard({ lanes: [lane] });
      const result = BoardService.addCard(
        board,
        lane.id,
        "My Task",
        "Details here",
      );

      expect(result.cards[0].description).toBe("Details here");
    });

    it("appends card with the next position in that lane", () => {
      const lane = buildLane({ position: 0 });
      const c1 = buildCard({ laneId: lane.id, position: 0 });
      const board = buildBoard({ lanes: [lane], cards: [c1] });
      const result = BoardService.addCard(board, lane.id, "Second Task");

      expect(result.cards).toHaveLength(2);
      expect(result.cards[1].position).toBe(1);
    });

    it("throws if the target lane does not exist", () => {
      const board = buildBoard();
      expect(() =>
        BoardService.addCard(
          board,
          "00000000-0000-4000-8000-ffffffffffff",
          "Task",
        ),
      ).toThrow();
    });
  });

  describe("removeCard", () => {
    it("removes the card by id", () => {
      const lane = buildLane({ position: 0 });
      const card = buildCard({ laneId: lane.id, position: 0 });
      const board = buildBoard({ lanes: [lane], cards: [card] });
      const result = BoardService.removeCard(board, card.id);

      expect(result.cards).toHaveLength(0);
    });

    it("recalculates positions in the same lane after removal", () => {
      const lane = buildLane({ position: 0 });
      const c1 = buildCard({ title: "A", laneId: lane.id, position: 0 });
      const c2 = buildCard({ title: "B", laneId: lane.id, position: 1 });
      const c3 = buildCard({ title: "C", laneId: lane.id, position: 2 });
      const board = buildBoard({ lanes: [lane], cards: [c1, c2, c3] });
      const result = BoardService.removeCard(board, c2.id);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].position).toBe(0);
      expect(result.cards[1].position).toBe(1);
    });

    it("does not affect cards in other lanes", () => {
      const l1 = buildLane({ position: 0 });
      const l2 = buildLane({ position: 1 });
      const c1 = buildCard({ laneId: l1.id, position: 0 });
      const c2 = buildCard({ laneId: l2.id, position: 0 });
      const board = buildBoard({ lanes: [l1, l2], cards: [c1, c2] });
      const result = BoardService.removeCard(board, c1.id);

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].laneId).toBe(l2.id);
      expect(result.cards[0].position).toBe(0);
    });

    it("returns the board unchanged if card does not exist", () => {
      const board = buildBoard();
      const result = BoardService.removeCard(
        board,
        "00000000-0000-4000-8000-ffffffffffff",
      );

      expect(result).toEqual(board);
    });
  });

  describe("moveCard", () => {
    it("moves a card to another lane", () => {
      const l1 = buildLane({ position: 0 });
      const l2 = buildLane({ position: 1 });
      const card = buildCard({ laneId: l1.id, position: 0 });
      const board = buildBoard({ lanes: [l1, l2], cards: [card] });

      const result = BoardService.moveCard(board, card.id, l2.id, 0);

      expect(result.cards[0].laneId).toBe(l2.id);
      expect(result.cards[0].position).toBe(0);
    });

    it("reorders positions in source lane after move", () => {
      const l1 = buildLane({ position: 0 });
      const l2 = buildLane({ position: 1 });
      const c1 = buildCard({ title: "A", laneId: l1.id, position: 0 });
      const c2 = buildCard({ title: "B", laneId: l1.id, position: 1 });
      const c3 = buildCard({ title: "C", laneId: l1.id, position: 2 });
      const board = buildBoard({ lanes: [l1, l2], cards: [c1, c2, c3] });

      const result = BoardService.moveCard(board, c2.id, l2.id, 0);

      const sourceCards = result.cards
        .filter((c) => c.laneId === l1.id)
        .sort((a, b) => a.position - b.position);
      expect(sourceCards).toHaveLength(2);
      expect(sourceCards[0].title).toBe("A");
      expect(sourceCards[0].position).toBe(0);
      expect(sourceCards[1].title).toBe("C");
      expect(sourceCards[1].position).toBe(1);
    });

    it("inserts at the correct position in the target lane", () => {
      const l1 = buildLane({ position: 0 });
      const l2 = buildLane({ position: 1 });
      const c1 = buildCard({ title: "A", laneId: l2.id, position: 0 });
      const c2 = buildCard({ title: "B", laneId: l2.id, position: 1 });
      const moving = buildCard({ title: "X", laneId: l1.id, position: 0 });
      const board = buildBoard({ lanes: [l1, l2], cards: [c1, c2, moving] });

      const result = BoardService.moveCard(board, moving.id, l2.id, 1);

      const targetCards = result.cards
        .filter((c) => c.laneId === l2.id)
        .sort((a, b) => a.position - b.position);
      expect(targetCards).toHaveLength(3);
      expect(targetCards[0].title).toBe("A");
      expect(targetCards[1].title).toBe("X");
      expect(targetCards[2].title).toBe("B");
    });

    it("reorders within the same lane", () => {
      const lane = buildLane({ position: 0 });
      const c1 = buildCard({ title: "A", laneId: lane.id, position: 0 });
      const c2 = buildCard({ title: "B", laneId: lane.id, position: 1 });
      const c3 = buildCard({ title: "C", laneId: lane.id, position: 2 });
      const board = buildBoard({ lanes: [lane], cards: [c1, c2, c3] });

      const result = BoardService.moveCard(board, c1.id, lane.id, 2);

      const cards = result.cards.sort((a, b) => a.position - b.position);
      expect(cards.map((c) => c.title)).toEqual(["B", "C", "A"]);
      expect(cards.map((c) => c.position)).toEqual([0, 1, 2]);
    });

    it("throws if card does not exist", () => {
      const board = buildBoard();
      expect(() =>
        BoardService.moveCard(
          board,
          "00000000-0000-4000-8000-ffffffffffff",
          "00000000-0000-4000-8000-ffffffffffff",
          0,
        ),
      ).toThrow();
    });

    it("throws if target lane does not exist", () => {
      const lane = buildLane({ position: 0 });
      const card = buildCard({ laneId: lane.id, position: 0 });
      const board = buildBoard({ lanes: [lane], cards: [card] });

      expect(() =>
        BoardService.moveCard(
          board,
          card.id,
          "00000000-0000-4000-8000-ffffffffffff",
          0,
        ),
      ).toThrow();
    });
  });
});
