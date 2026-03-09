import { createRoot } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { useOmniMenu } from "./hooks";

describe("useOmniMenu", () => {
  const mockDialog = {
    showModal: vi.fn(),
    close: vi.fn(),
  } as unknown as HTMLDialogElement;

  it("starts closed", () => {
    let result: ReturnType<typeof useOmniMenu> | undefined;
    createRoot(() => {
      result = useOmniMenu();
    });
    expect(result?.open()).toBe(false);
  });

  it("toggles open and closed with dialog refs", () => {
    let result: ReturnType<typeof useOmniMenu> | undefined;
    createRoot(() => {
      result = useOmniMenu();
      result.setDialogRef(mockDialog);
    });

    result?.toggle();
    expect(mockDialog.showModal).toHaveBeenCalled();
    expect(result?.open()).toBe(true);

    result?.toggle();
    expect(mockDialog.close).toHaveBeenCalled();
    expect(result?.open()).toBe(false);
  });

  it("starts with empty search", () => {
    let result: ReturnType<typeof useOmniMenu> | undefined;
    createRoot(() => {
      result = useOmniMenu();
    });
    expect(result?.search()).toBe("");
  });

  it("updates search value", () => {
    let result: ReturnType<typeof useOmniMenu> | undefined;
    createRoot(() => {
      result = useOmniMenu();
    });
    result?.setSearch("test");
    expect(result?.search()).toBe("test");
  });

  describe("filtering", () => {
    it("returns all sections with no search query", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
      });
      if (result) {
        const data = result.filteredSections();
        expect(data.sections.length).toBeGreaterThan(0);
      }
    });

    it("filters items by search query", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
      });
      if (result) {
        result.setSearch("play");
        const data = result.filteredSections();
        expect(data.sections[0].items).toContain("Playground");
        expect(data.sections[0].items).not.toContain("Sprint 1");
      }
    });
  });

  describe("expansion", () => {
    it("starts with boards expanded", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
      });
      expect(result?.isExpanded("boards")).toBe(true);
      expect(result?.isExpanded("users")).toBe(false);
    });

    it("toggles a section open and closed", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
      });
      result?.toggleSection("users");
      expect(result?.isExpanded("users")).toBe(true);
      result?.toggleSection("users");
      expect(result?.isExpanded("users")).toBe(false);
    });
  });

  describe("navigation", () => {
    it("starts with no selection", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
      });
      expect(result?.selectedIndex()).toBe(-1);
    });

    it("selects section header on first moveDown", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
      });
      result?.moveDown();
      expect(result?.selectedIndex()).toBe(0);
    });

    it("wraps around from last to first on moveDown", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
      });
      if (result) {
        const entries = result.visibleEntries();
        for (let i = 0; i < entries.length; i++) {
          result.moveDown();
        }
        result.moveDown();
        expect(result.selectedIndex()).toBe(0);
      }
    });
  });

  describe("confirmSelection", () => {
    it("closes the menu after confirming an item", () => {
      let result: ReturnType<typeof useOmniMenu> | undefined;
      createRoot(() => {
        result = useOmniMenu();
        result.setDialogRef(mockDialog);
        result.toggle(); // open it
      });

      if (result) {
        result.moveDown();
        result.moveDown();
        result.confirmSelection();
        expect(result.open()).toBe(false);
      }
    });
  });
});
