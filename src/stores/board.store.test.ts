import { cleanup, renderHook } from "solid-testing-library";
import { afterEach, describe, expect, it } from "vitest";

import { useBoardStore } from "./board.store";

afterEach(cleanup);

describe("useBoardStore", () => {
  describe("initialization", () => {
    it("starts with an empty board", () => {
      const { result } = renderHook(() => useBoardStore("My Board"));
      const board = result.board();

      expect(board.title).toBe("My Board");
      expect(board.lanes).toEqual([]);
      expect(board.cards).toEqual([]);
    });

    it("exposes empty lanes accessor", () => {
      const { result } = renderHook(() => useBoardStore("My Board"));
      expect(result.lanes()).toEqual([]);
    });
  });

  describe("lane management", () => {
    it("adds a lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");

      expect(result.lanes()).toHaveLength(1);
      expect(result.lanes()[0].title).toBe("To Do");
    });

    it("adds multiple lanes in order", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      result.addLane("In Progress");
      result.addLane("Done");

      const titles = result.lanes().map((l) => l.title);
      expect(titles).toEqual(["To Do", "In Progress", "Done"]);
    });

    it("removes a lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      const laneId = result.lanes()[0].id;
      result.removeLane(laneId);

      expect(result.lanes()).toHaveLength(0);
    });
  });

  describe("card management", () => {
    it("adds a card to a lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      const laneId = result.lanes()[0].id;
      result.addCard(laneId, "First task");

      const cards = result.cardsInLane(laneId);
      expect(cards).toHaveLength(1);
      expect(cards[0].title).toBe("First task");
    });

    it("returns cards sorted by position", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      const laneId = result.lanes()[0].id;
      result.addCard(laneId, "First");
      result.addCard(laneId, "Second");
      result.addCard(laneId, "Third");

      const titles = result.cardsInLane(laneId).map((c) => c.title);
      expect(titles).toEqual(["First", "Second", "Third"]);
    });

    it("removes a card", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      const laneId = result.lanes()[0].id;
      result.addCard(laneId, "Task");
      const cardId = result.cardsInLane(laneId)[0].id;
      result.removeCard(cardId);

      expect(result.cardsInLane(laneId)).toHaveLength(0);
    });

    it("cardsInLane only returns cards for the given lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      result.addLane("Done");
      const [todo, done] = result.lanes();

      result.addCard(todo.id, "Task A");
      result.addCard(done.id, "Task B");

      expect(result.cardsInLane(todo.id)).toHaveLength(1);
      expect(result.cardsInLane(todo.id)[0].title).toBe("Task A");
      expect(result.cardsInLane(done.id)).toHaveLength(1);
      expect(result.cardsInLane(done.id)[0].title).toBe("Task B");
    });
  });

  describe("moveCard", () => {
    it("moves a card between lanes", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      result.addLane("Done");
      const [todo, done] = result.lanes();

      result.addCard(todo.id, "Task");
      const cardId = result.cardsInLane(todo.id)[0].id;

      result.moveCard(cardId, done.id, 0);

      expect(result.cardsInLane(todo.id)).toHaveLength(0);
      expect(result.cardsInLane(done.id)).toHaveLength(1);
      expect(result.cardsInLane(done.id)[0].title).toBe("Task");
    });

    it("reorders a card within the same lane", () => {
      const { result } = renderHook(() => useBoardStore("Board"));

      result.addLane("To Do");
      const laneId = result.lanes()[0].id;
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
