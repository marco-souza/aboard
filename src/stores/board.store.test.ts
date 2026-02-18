import { cleanup, renderHook } from "solid-testing-library";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_LANE_TITLES, useBoardStore } from "./board.store";

afterEach(cleanup);

describe("useBoardStore", () => {
  describe("initialization", () => {
    it("starts with default lanes and no cards", () => {
      const { result } = renderHook(() => useBoardStore("My Board"));
      const board = result.board();

      expect(board.title).toBe("My Board");
      expect(board.lanes).toHaveLength(3);
      expect(board.cards).toEqual([]);
    });

    it("exposes default lanes sorted by position", () => {
      const { result } = renderHook(() => useBoardStore("My Board"));
      const titles = result.lanes().map((l) => l.title);
      expect(titles).toEqual([...DEFAULT_LANE_TITLES]);
    });

    it("exposes the default lane id (Maybe)", () => {
      const { result } = renderHook(() => useBoardStore("My Board"));
      const maybeLane = result.lanes().find((l) => l.title === "Maybe");
      expect(result.defaultLaneId()).toBe(maybeLane?.id);
    });
  });

  describe("lane management", () => {
    it("adds a lane after the defaults", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("Blocked");

      expect(result.lanes()).toHaveLength(4);
      expect(result.lanes()[3].title).toBe("Blocked");
    });

    it("removes a lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("Blocked");
      const blockedId = result.lanes().find((l) => l.title === "Blocked")?.id;
      result.removeLane(blockedId);

      expect(result.lanes()).toHaveLength(3);
      expect(result.lanes().map((l) => l.title)).toEqual([
        ...DEFAULT_LANE_TITLES,
      ]);
    });
  });

  describe("card management", () => {
    it("adds a card to the default lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      const laneId = result.defaultLaneId();
      result.addCard(laneId, "First task");

      const cards = result.cardsInLane(laneId);
      expect(cards).toHaveLength(1);
      expect(cards[0].title).toBe("First task");
    });

    it("returns cards sorted by position", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      const laneId = result.defaultLaneId();
      result.addCard(laneId, "First");
      result.addCard(laneId, "Second");
      result.addCard(laneId, "Third");

      const titles = result.cardsInLane(laneId).map((c) => c.title);
      expect(titles).toEqual(["First", "Second", "Third"]);
    });

    it("removes a card", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      const laneId = result.defaultLaneId();
      result.addCard(laneId, "Task");
      const cardId = result.cardsInLane(laneId)[0].id;
      result.removeCard(cardId);

      expect(result.cardsInLane(laneId)).toHaveLength(0);
    });

    it("cardsInLane only returns cards for the given lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      const [notNow, maybe] = result.lanes();

      result.addCard(notNow.id, "Task A");
      result.addCard(maybe.id, "Task B");

      expect(result.cardsInLane(notNow.id)).toHaveLength(1);
      expect(result.cardsInLane(notNow.id)[0].title).toBe("Task A");
      expect(result.cardsInLane(maybe.id)).toHaveLength(1);
      expect(result.cardsInLane(maybe.id)[0].title).toBe("Task B");
    });
  });

  describe("moveCard", () => {
    it("moves a card between lanes", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      const [_notNow, maybe, done] = result.lanes();

      result.addCard(maybe.id, "Task");
      const cardId = result.cardsInLane(maybe.id)[0].id;

      result.moveCard(cardId, done.id, 0);

      expect(result.cardsInLane(maybe.id)).toHaveLength(0);
      expect(result.cardsInLane(done.id)).toHaveLength(1);
      expect(result.cardsInLane(done.id)[0].title).toBe("Task");
    });

    it("reorders a card within the same lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      const laneId = result.defaultLaneId();
      result.addCard(laneId, "A");
      result.addCard(laneId, "B");
      result.addCard(laneId, "C");

      const cardA = result.cardsInLane(laneId)[0].id;
      result.moveCard(cardA, laneId, 2);

      const titles = result.cardsInLane(laneId).map((c) => c.title);
      expect(titles).toEqual(["B", "C", "A"]);
    });
  });
});
