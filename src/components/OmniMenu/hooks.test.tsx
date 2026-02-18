import { cleanup, renderHook } from "solid-testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useOmniMenu } from "~/components/OmniMenu/hooks";

afterEach(cleanup);

describe("useOmniMenu", () => {
  describe("open/close", () => {
    it("starts closed", () => {
      const { result } = renderHook(useOmniMenu);
      expect(result.open()).toBe(false);
    });

    it("toggles open and closed with dialog refs", () => {
      const { result } = renderHook(useOmniMenu);

      const dialog = {
        showModal: vi.fn(),
        close: vi.fn(),
      } as unknown as HTMLDialogElement;
      const input = { focus: vi.fn() } as unknown as HTMLInputElement;

      result.setDialogRef(dialog);
      result.setSearchRef(input);

      result.toggle();
      expect(result.open()).toBe(true);
      expect(dialog.showModal).toHaveBeenCalled();
      expect(input.focus).toHaveBeenCalled();

      result.toggle();
      expect(result.open()).toBe(false);
      expect(dialog.close).toHaveBeenCalled();
    });
  });

  describe("search", () => {
    it("starts with empty search", () => {
      const { result } = renderHook(useOmniMenu);
      expect(result.search()).toBe("");
    });

    it("updates search value", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("play");
      expect(result.search()).toBe("play");
    });
  });

  describe("filteredSections", () => {
    it("returns all sections with no search query", () => {
      const { result } = renderHook(useOmniMenu);
      const { sections, matchedKeys } = result.filteredSections();
      expect(sections).toHaveLength(3);
      expect(matchedKeys.size).toBe(0);
    });

    it("filters items by search query", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("play");

      const { sections, matchedKeys } = result.filteredSections();
      expect(sections).toHaveLength(1);
      expect(sections[0].key).toBe("boards");
      expect(sections[0].items).toEqual(["Playground"]);
      expect(matchedKeys.has("boards")).toBe(true);
    });

    it("returns empty when nothing matches", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("zzzzz");

      const { sections } = result.filteredSections();
      expect(sections).toHaveLength(0);
    });

    it("matches across multiple sections", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("in");

      const { sections, matchedKeys } = result.filteredSections();
      expect(sections.length).toBeGreaterThanOrEqual(2);
      expect(matchedKeys.size).toBeGreaterThanOrEqual(2);
    });

    it("is case-insensitive", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("GENERAL");

      const { sections } = result.filteredSections();
      expect(sections).toHaveLength(1);
      expect(sections[0].key).toBe("settings");
    });
  });

  describe("expanded / toggleSection", () => {
    it("starts with boards expanded", () => {
      const { result } = renderHook(useOmniMenu);
      expect(result.isExpanded("boards")).toBe(true);
      expect(result.isExpanded("users")).toBe(false);
      expect(result.isExpanded("settings")).toBe(false);
    });

    it("toggles a section open and closed", () => {
      const { result } = renderHook(useOmniMenu);

      result.toggleSection("settings");
      expect(result.isExpanded("settings")).toBe(true);

      result.toggleSection("settings");
      expect(result.isExpanded("settings")).toBe(false);
    });

    it("allows multiple sections open at once", () => {
      const { result } = renderHook(useOmniMenu);

      result.toggleSection("users");
      result.toggleSection("settings");

      expect(result.isExpanded("boards")).toBe(true);
      expect(result.isExpanded("users")).toBe(true);
      expect(result.isExpanded("settings")).toBe(true);
    });
  });

  describe("keyboard navigation", () => {
    it("starts with no selection", () => {
      const { result } = renderHook(useOmniMenu);
      expect(result.selectedEntry()).toBeNull();
    });

    it("selects section header on first moveDown", () => {
      const { result } = renderHook(useOmniMenu);
      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "boards",
      });
    });

    it("cycles through section headers and items", () => {
      const { result } = renderHook(useOmniMenu);

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "boards",
      });

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "item",
        section: "boards",
        item: "Playground",
      });

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "item",
        section: "boards",
        item: "Sprint 1",
      });

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "item",
        section: "boards",
        item: "Backlog",
      });

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "users",
      });

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "settings",
      });
    });

    it("wraps around from last to first on moveDown", () => {
      const { result } = renderHook(useOmniMenu);
      for (let i = 0; i < 6; i++) result.moveDown();
      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "boards",
      });
    });

    it("wraps around from top to last on moveUp", () => {
      const { result } = renderHook(useOmniMenu);
      result.moveUp();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "settings",
      });
    });

    it("moves up through entries", () => {
      const { result } = renderHook(useOmniMenu);
      result.moveDown(); // boards section
      result.moveDown(); // Playground
      result.moveDown(); // Sprint 1
      result.moveUp(); // Playground
      expect(result.selectedEntry()).toEqual({
        type: "item",
        section: "boards",
        item: "Playground",
      });
    });

    it("navigates across expanded sections", () => {
      const { result } = renderHook(useOmniMenu);
      result.toggleSection("users");

      result.moveDown(); // boards section
      result.moveDown(); // Playground
      result.moveDown(); // Sprint 1
      result.moveDown(); // Backlog
      result.moveDown(); // users section
      result.moveDown(); // Board Members
      expect(result.selectedEntry()).toEqual({
        type: "item",
        section: "users",
        item: "Board Members",
      });
    });

    it("resets selection with resetSelection", () => {
      const { result } = renderHook(useOmniMenu);
      result.moveDown();
      expect(result.selectedEntry()).not.toBeNull();
      result.resetSelection();
      expect(result.selectedEntry()).toBeNull();
    });

    it("navigates section headers when all sections are collapsed", () => {
      const { result } = renderHook(useOmniMenu);
      result.toggleSection("boards");

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "boards",
      });

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "users",
      });

      result.moveDown();
      expect(result.selectedEntry()).toEqual({
        type: "section",
        section: "settings",
      });
    });
  });

  describe("navigation during search", () => {
    it("navigates filtered entries after searching", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("in");

      result.moveDown(); // boards section
      result.moveDown(); // Sprint 1
      const first = result.selectedEntry();
      expect(first).not.toBeNull();
      expect(first?.type).toBe("item");
      if (first?.type === "item")
        expect(first.item.toLowerCase()).toContain("in");

      result.moveDown(); // users section
      result.moveDown(); // Invite
      const second = result.selectedEntry();
      expect(second).not.toBeNull();
      expect(second?.type).toBe("item");
      if (second?.type === "item")
        expect(second.item.toLowerCase()).toContain("in");
      expect(second).not.toEqual(first);
    });

    it("resets and re-navigates when search changes", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("play");
      result.moveDown(); // boards section
      result.moveDown(); // Playground
      expect(result.selectedEntry()).toEqual({
        type: "item",
        section: "boards",
        item: "Playground",
      });

      result.resetSelection();
      result.setSearch("general");
      result.moveDown(); // settings section
      result.moveDown(); // General
      expect(result.selectedEntry()).toEqual({
        type: "item",
        section: "settings",
        item: "General",
      });
    });
  });

  describe("confirmSelection", () => {
    it("calls onSelect with the selected item", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() => useOmniMenu({ onSelect }));

      const dialog = {
        showModal: vi.fn(),
        close: vi.fn(),
      } as unknown as HTMLDialogElement;
      result.setDialogRef(dialog);
      result.setSearchRef({ focus: vi.fn() } as unknown as HTMLInputElement);

      result.toggle();
      result.moveDown(); // boards section
      result.moveDown(); // Playground
      result.confirmSelection();

      expect(onSelect).toHaveBeenCalledWith({
        type: "item",
        section: "boards",
        item: "Playground",
      });
    });

    it("toggles section when confirming a section header", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() => useOmniMenu({ onSelect }));

      expect(result.isExpanded("users")).toBe(false);

      result.moveDown(); // boards section
      result.moveDown(); // Playground
      result.moveDown(); // Sprint 1
      result.moveDown(); // Backlog
      result.moveDown(); // users section
      result.confirmSelection();

      expect(result.isExpanded("users")).toBe(true);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("does nothing when no entry is selected", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() => useOmniMenu({ onSelect }));

      result.confirmSelection();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("closes the menu after confirming an item", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() => useOmniMenu({ onSelect }));

      const dialog = {
        showModal: vi.fn(),
        close: vi.fn(),
      } as unknown as HTMLDialogElement;
      result.setDialogRef(dialog);
      result.setSearchRef({ focus: vi.fn() } as unknown as HTMLInputElement);

      result.toggle();
      result.moveDown(); // boards section
      result.moveDown(); // Playground
      result.confirmSelection();

      expect(result.open()).toBe(false);
      expect(dialog.close).toHaveBeenCalled();
    });

    it("does not close the menu after toggling a section", () => {
      const { result } = renderHook(useOmniMenu);

      const dialog = {
        showModal: vi.fn(),
        close: vi.fn(),
      } as unknown as HTMLDialogElement;
      result.setDialogRef(dialog);
      result.setSearchRef({ focus: vi.fn() } as unknown as HTMLInputElement);

      result.toggle();
      result.moveDown(); // boards section header
      result.confirmSelection();

      expect(result.open()).toBe(true);
      expect(dialog.close).not.toHaveBeenCalled();
    });

    it("resets search instead of closing when confirming during search", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() => useOmniMenu({ onSelect }));

      const dialog = {
        showModal: vi.fn(),
        close: vi.fn(),
      } as unknown as HTMLDialogElement;
      result.setDialogRef(dialog);
      result.setSearchRef({ focus: vi.fn() } as unknown as HTMLInputElement);

      result.toggle();
      result.setSearch("play");
      result.moveDown(); // boards section
      result.moveDown(); // Playground
      result.confirmSelection();

      expect(onSelect).toHaveBeenCalledWith({
        type: "item",
        section: "boards",
        item: "Playground",
      });
      expect(result.search()).toBe("");
      expect(result.selectedEntry()).toBeNull();
      expect(result.open()).toBe(true);
      expect(dialog.close).not.toHaveBeenCalled();
    });
  });

  describe("isExpanded with search", () => {
    it("forces matched sections open during search", () => {
      const { result } = renderHook(useOmniMenu);

      result.toggleSection("boards");
      expect(result.isExpanded("boards")).toBe(false);

      result.setSearch("play");
      expect(result.isExpanded("boards")).toBe(true);
    });

    it("restores manual state when search is cleared", () => {
      const { result } = renderHook(useOmniMenu);

      result.toggleSection("boards");
      result.setSearch("play");
      expect(result.isExpanded("boards")).toBe(true);

      result.setSearch("");
      expect(result.isExpanded("boards")).toBe(false);
    });

    it("allows collapsing a matched section during search", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("in");

      expect(result.isExpanded("boards")).toBe(true);

      result.toggleSection("boards");
      expect(result.isExpanded("boards")).toBe(false);
    });

    it("allows re-expanding a collapsed section during search", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("in");

      result.toggleSection("boards");
      expect(result.isExpanded("boards")).toBe(false);

      result.toggleSection("boards");
      expect(result.isExpanded("boards")).toBe(true);
    });

    it("resets search collapse state when search query changes", () => {
      const { result } = renderHook(useOmniMenu);
      result.setSearch("in");

      result.toggleSection("boards");
      expect(result.isExpanded("boards")).toBe(false);

      result.setSearch("inv");
      expect(result.isExpanded("users")).toBe(true);
    });
  });
});
