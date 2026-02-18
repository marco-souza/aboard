import { cleanup, renderHook } from "solid-testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useOmniMenu } from "~/components/OmniMenu.hooks";

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
  });
});
