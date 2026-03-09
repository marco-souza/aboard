import { describe, expect, it } from "vitest";
import { DEFAULT_LANE_TITLES, useBoardStore } from "./board.store";

describe("board.store", () => {
  describe("useBoardStore", () => {
    it("initializes with a default board", () => {
      const result = useBoardStore("Test Board");

      expect(result.board.title).toBe("Test Board");
      expect(result.lanes()).toHaveLength(DEFAULT_LANE_TITLES.length);
      expect(result.defaultLaneId()).toBeDefined();
    });

    it("can add a new lane", () => {
      const result = useBoardStore("Test Board");
      const initialCount = result.lanes().length;

      result.addLane("New Lane");

      expect(result.lanes()).toHaveLength(initialCount + 1);
      expect(result.lanes()[initialCount].title).toBe("New Lane");
    });

    it("can remove a lane", () => {
      const result = useBoardStore("Test Board");
      const initialCount = result.lanes().length;
      const targetLaneId = result.lanes()[1].id; // Don't remove the first (default) lane

      result.removeLane(targetLaneId);

      expect(result.lanes()).toHaveLength(initialCount - 1);
      expect(result.lanes().find((l) => l.id === targetLaneId)).toBeUndefined();
    });

    it("can add a card to a lane", () => {
      const result = useBoardStore("Test Board");
      const laneId = result.defaultLaneId();
      const initialCount = result.cardsInLane(laneId).length;

      result.addCard(laneId, "New Card", "Card Description");

      const cards = result.cardsInLane(laneId);
      expect(cards).toHaveLength(initialCount + 1);
      expect(cards[cards.length - 1].title).toBe("New Card");
      expect(cards[cards.length - 1].description).toBe("Card Description");
    });

    it("can remove a card", () => {
      const result = useBoardStore("Test Board");
      const laneId = result.defaultLaneId();

      result.addCard(laneId, "Card to Remove");
      const cards = result.cardsInLane(laneId);
      const cardId = cards[cards.length - 1].id;
      const initialCount = cards.length;

      result.removeCard(cardId);

      expect(result.cardsInLane(laneId)).toHaveLength(initialCount - 1);
    });

    it("can move a card within a lane", () => {
      const result = useBoardStore("Test Board");
      const laneId = result.defaultLaneId();

      result.addCard(laneId, "Card 1");
      result.addCard(laneId, "Card 2");

      const cards = result.cardsInLane(laneId);
      const card1Id = cards[cards.length - 2].id;

      // Move Card 1 to position 1 (after Card 2)
      result.moveCard(card1Id, laneId, 1);

      const updatedCards = result.cardsInLane(laneId);
      expect(updatedCards[updatedCards.length - 1].id).toBe(card1Id);
    });

    it("can move a card between lanes", () => {
      const result = useBoardStore("Test Board");
      const lane1Id = result.lanes()[0].id;
      const lane2Id = result.lanes()[1].id;

      result.addCard(lane1Id, "Card to Move");
      const cards = result.cardsInLane(lane1Id);
      const cardId = cards[cards.length - 1].id;

      result.moveCard(cardId, lane2Id, 0);

      expect(
        result.cardsInLane(lane1Id).find((c) => c.id === cardId),
      ).toBeUndefined();
      expect(
        result.cardsInLane(lane2Id).find((c) => c.id === cardId),
      ).toBeDefined();
    });

    it("handles moving a non-existent card gracefully", () => {
      const result = useBoardStore("Test Board");
      const laneId = result.defaultLaneId();

      expect(() => result.moveCard("non-existent-id", laneId, 0)).toThrow();
    });
  });
});
