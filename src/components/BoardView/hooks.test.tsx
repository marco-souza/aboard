import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import {
  formatDate,
  useBoardView,
  useCardCreation,
  MAX_VISIBLE_AVATARS,
  MOCK_WATCHERS,
} from "./hooks";

describe("BoardView.hooks", () => {
  describe("formatDate", () => {
    it("formats date with month, day, hour, minute", () => {
      const date = new Date("2025-02-18T14:30:00");
      const formatted = formatDate(date);
      expect(formatted).toContain("Feb");
      expect(formatted).toContain("18");
    });

    it("handles different dates", () => {
      const date = new Date("2025-01-01T08:15:00");
      const formatted = formatDate(date);
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("1");
    });
  });

  describe("useBoardView", () => {
    it("initializes with board store", () => {
      let view;
      createRoot(() => {
        view = useBoardView("Test Board");
      });

      expect(view).toBeDefined();
      expect(view.store).toBeDefined();
      expect(view.lanes).toBeDefined();
    });

    it("exposes lanes from store", () => {
      let view;
      createRoot(() => {
        view = useBoardView("Test Board");
      });

      const lanes = view.lanes();
      expect(Array.isArray(lanes)).toBe(true);
      expect(lanes.length).toBeGreaterThan(0);
    });

    it("provides laneCards function", () => {
      let view;
      createRoot(() => {
        view = useBoardView("Test Board");
      });

      const lanes = view.lanes();
      const cards = view.laneCards(lanes[0].id);
      expect(Array.isArray(cards)).toBe(true);
    });

    it("provides isDefaultLane function", () => {
      let view;
      createRoot(() => {
        view = useBoardView("Test Board");
      });

      const lanes = view.lanes();
      const isDefault = view.isDefaultLane(lanes[0].id);
      expect(typeof isDefault).toBe("boolean");
    });

    it("limits visible watchers to MAX_VISIBLE_AVATARS", () => {
      let view;
      createRoot(() => {
        view = useBoardView("Test Board");
      });

      expect(view.visibleWatchers.length).toBe(MAX_VISIBLE_AVATARS);
      expect(view.visibleWatchers.length).toBeLessThanOrEqual(
        MOCK_WATCHERS.length,
      );
    });

    it("calculates hidden watcher count", () => {
      let view;
      createRoot(() => {
        view = useBoardView("Test Board");
      });

      const expectedHidden = MOCK_WATCHERS.length - MAX_VISIBLE_AVATARS;
      expect(view.hiddenWatcherCount).toBe(expectedHidden);
    });
  });

  describe("useCardCreation", () => {
    it("initializes with creating false", () => {
      let creation;
      createRoot(() => {
        const view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      expect(creation.creating()).toBe(false);
    });

    it("initializes with empty title", () => {
      let creation;
      createRoot(() => {
        const view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      expect(creation.newTitle()).toBe("");
    });

    it("startCreate enables creating state", () => {
      let creation;
      createRoot(() => {
        const view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      creation.startCreate();
      expect(creation.creating()).toBe(true);
    });

    it("cancelCreate disables creating state", () => {
      let creation;
      createRoot(() => {
        const view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      creation.startCreate();
      creation.setNewTitle("Test");
      creation.cancelCreate();

      expect(creation.creating()).toBe(false);
      expect(creation.newTitle()).toBe("");
    });

    it("canSubmit is false with empty title", () => {
      let creation;
      createRoot(() => {
        const view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      expect(creation.canSubmit()).toBe(false);
    });

    it("canSubmit is true with non-empty title", () => {
      let creation;
      createRoot(() => {
        const view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      creation.setNewTitle("Test Card");
      expect(creation.canSubmit()).toBe(true);
    });

    it("canSubmit is false with only whitespace", () => {
      let creation;
      createRoot(() => {
        const view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      creation.setNewTitle("   ");
      expect(creation.canSubmit()).toBe(false);
    });

    it("submitCard adds card to store", () => {
      let creation, view;
      createRoot(() => {
        view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      const laneId = view.store.defaultLaneId();
      const initialCount = view.laneCards(laneId).length;

      creation.setNewTitle("New Card");
      creation.submitCard(new Event("submit"));

      const newCount = view.laneCards(laneId).length;
      expect(newCount).toBe(initialCount + 1);
    });

    it("submitCard clears title after submission", () => {
      let creation, view;
      createRoot(() => {
        view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      creation.setNewTitle("New Card");
      creation.submitCard(new Event("submit"));

      expect(creation.newTitle()).toBe("");
    });

    it("submitCard disables creating after submission", () => {
      let creation, view;
      createRoot(() => {
        view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      creation.startCreate();
      creation.setNewTitle("New Card");
      creation.submitCard(new Event("submit"));

      expect(creation.creating()).toBe(false);
    });

    it("submitCard does nothing with empty title", () => {
      let creation, view;
      createRoot(() => {
        view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      const laneId = view.store.defaultLaneId();
      const initialCount = view.laneCards(laneId).length;

      creation.submitCard(new Event("submit"));

      const newCount = view.laneCards(laneId).length;
      expect(newCount).toBe(initialCount);
    });

    it("removeCard removes card from store", () => {
      let creation, view;
      createRoot(() => {
        view = useBoardView("Test Board");
        creation = useCardCreation(view.store, () =>
          view.store.defaultLaneId(),
        );
      });

      const laneId = view.store.defaultLaneId();
      creation.setNewTitle("Card to Remove");
      creation.submitCard(new Event("submit"));

      const cards = view.laneCards(laneId);
      const cardId = cards[cards.length - 1].id;
      const initialCount = cards.length;

      creation.removeCard(cardId);

      const newCards = view.laneCards(laneId);
      expect(newCards.length).toBe(initialCount - 1);
    });
  });
});
