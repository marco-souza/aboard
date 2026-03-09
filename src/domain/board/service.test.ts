import { describe, expect, it } from "vitest";
import { NotFoundError } from "~/domain/shared/errors";
import { DEFAULT_LANES } from "./constants";
import {
  addCard,
  addLane,
  createBoard,
  moveCard,
  removeCard,
  removeLane,
  reorderLanes,
} from "./service";

describe("BoardService", () => {
  describe("createBoard", () => {
    it("should create a board with default lanes", () => {
      const board = createBoard("Test Board");
      expect(board.title).toBe("Test Board");
      expect(board.lanes).toHaveLength(DEFAULT_LANES.length);
      expect(board.lanes[0].title).toBe(DEFAULT_LANES[0]);
      expect(board.cards).toHaveLength(0);
    });
  });

  describe("addLane", () => {
    it("should add a lane at the end", () => {
      const board = createBoard("Test");
      const updated = addLane(board, "New Lane");
      expect(updated.lanes).toHaveLength(DEFAULT_LANES.length + 1);
      expect(updated.lanes[updated.lanes.length - 1].title).toBe("New Lane");
      expect(updated.lanes[updated.lanes.length - 1].position).toBe(
        DEFAULT_LANES.length,
      );
    });
  });

  describe("removeLane", () => {
    it("should remove a lane and its cards", () => {
      let board = createBoard("Test");
      const laneId = board.lanes[0].id;
      board = addCard(board, laneId, "Card 1");

      const updated = removeLane(board, laneId);
      expect(updated.lanes).toHaveLength(DEFAULT_LANES.length - 1);
      expect(updated.cards).toHaveLength(0);
    });

    it("should reorder positions of remaining lanes", () => {
      const board = createBoard("Test");
      const firstLaneId = board.lanes[0].id;
      const secondLaneId = board.lanes[1].id;

      const updated = removeLane(board, firstLaneId);
      const newSecondLane = updated.lanes.find((l) => l.id === secondLaneId);
      expect(newSecondLane?.position).toBe(0);
    });
  });

  describe("reorderLanes", () => {
    it("should move a lane to a new position", () => {
      const board = createBoard("Test");
      const laneId = board.lanes[0].id; // position 0
      const secondId = board.lanes[1].id; // position 1

      const updated = reorderLanes(board, laneId, 1);
      expect(updated.lanes.find((l) => l.id === laneId)?.position).toBe(1);
      expect(updated.lanes.find((l) => l.id === secondId)?.position).toBe(0);
    });
  });

  describe("addCard", () => {
    it("should add a card to a lane", () => {
      const board = createBoard("Test");
      const laneId = board.lanes[0].id;
      const updated = addCard(board, laneId, "New Card", "Desc");

      expect(updated.cards).toHaveLength(1);
      expect(updated.cards[0].title).toBe("New Card");
      expect(updated.cards[0].laneId).toBe(laneId);
    });

    it("should throw NotFoundError if lane does not exist", () => {
      const board = createBoard("Test");
      expect(() => addCard(board, "non-existent", "Title")).toThrow(
        NotFoundError,
      );
    });
  });

  describe("removeCard", () => {
    it("should remove a card and reorder remaining", () => {
      let board = createBoard("Test");
      const laneId = board.lanes[0].id;
      board = addCard(board, laneId, "Card 1");
      board = addCard(board, laneId, "Card 2");
      const firstCardId = board.cards[0].id;

      const updated = removeCard(board, firstCardId);
      expect(updated.cards).toHaveLength(1);
      expect(updated.cards[0].title).toBe("Card 2");
      expect(updated.cards[0].position).toBe(0);
    });
  });

  describe("moveCard", () => {
    it("should move card within same lane", () => {
      let board = createBoard("Test");
      const laneId = board.lanes[0].id;
      board = addCard(board, laneId, "Card 0");
      board = addCard(board, laneId, "Card 1");
      const card0Id = board.cards[0].id;

      const updated = moveCard(board, card0Id, laneId, 1);
      const moved = updated.cards.find((c) => c.id === card0Id);
      expect(moved?.position).toBe(1);
    });

    it("should move card between lanes", () => {
      let board = createBoard("Test");
      const lane0Id = board.lanes[0].id;
      const lane1Id = board.lanes[1].id;
      board = addCard(board, lane0Id, "Card 0");
      const cardId = board.cards[0].id;

      const updated = moveCard(board, cardId, lane1Id, 0);
      const moved = updated.cards.find((c) => c.id === cardId);
      expect(moved?.laneId).toBe(lane1Id);
      expect(updated.cards.filter((c) => c.laneId === lane0Id)).toHaveLength(0);
    });

    it("should throw NotFoundError if card does not exist", () => {
      const board = createBoard("Test");
      const laneId = board.lanes[0].id;
      expect(() => moveCard(board, "none", laneId, 0)).toThrow(NotFoundError);
    });
  });
});
