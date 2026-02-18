import { cleanup, fireEvent, render, screen } from "solid-testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import OmniMenu from "~/components/OmniMenu";

afterEach(cleanup);

describe("OmniMenu UI", () => {
  describe("trigger button", () => {
    it("renders the trigger button", () => {
      render(() => <OmniMenu />);
      expect(screen.getByLabelText("Open Omni Menu")).toBeTruthy();
    });
  });

  describe("modal", () => {
    it("renders the dialog element", () => {
      render(() => <OmniMenu />);
      expect(document.querySelector("dialog")).toBeTruthy();
    });

    it("shows the header title", () => {
      render(() => <OmniMenu />);
      expect(screen.getByText("Omni Menu")).toBeTruthy();
    });

    it("shows the search input", () => {
      render(() => <OmniMenu />);
      expect(screen.getByPlaceholderText("Search commands...")).toBeTruthy();
    });
  });

  describe("sections", () => {
    it("renders all three section labels", () => {
      render(() => <OmniMenu />);

      for (const label of ["Boards", "Users", "Settings"]) {
        expect(screen.getByText(label, { exact: false })).toBeTruthy();
      }
    });

    it("shows boards items expanded by default", () => {
      render(() => <OmniMenu />);
      expect(screen.getByText("Playground")).toBeTruthy();
    });

    it("does not show users items by default", () => {
      render(() => <OmniMenu />);
      expect(screen.queryByText("Board Members")).toBeNull();
    });

    it("expands a section on click", async () => {
      render(() => <OmniMenu />);

      const settingsBtn = screen.getByText("Settings", { exact: false });
      fireEvent.click(settingsBtn);

      expect(screen.getByText("General")).toBeTruthy();
      expect(screen.getByText("Appearance")).toBeTruthy();
    });

    it("collapses a section on second click", async () => {
      render(() => <OmniMenu />);

      const boardsBtn = screen.getByText("Boards", { exact: false });
      fireEvent.click(boardsBtn);

      expect(screen.queryByText("Playground")).toBeNull();
    });
  });

  describe("search filtering", () => {
    it("filters items when typing in search", async () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.input(input, { target: { value: "General" } });

      expect(screen.getByText("General")).toBeTruthy();
      expect(screen.queryByText("Playground")).toBeNull();
    });

    it("shows no results message when nothing matches", async () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.input(input, { target: { value: "zzzzz" } });

      expect(screen.getByText("No results found")).toBeTruthy();
    });

    it("expands matched sections automatically", async () => {
      render(() => <OmniMenu />);

      expect(screen.queryByText("General")).toBeNull();

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.input(input, { target: { value: "General" } });

      expect(screen.getByText("General")).toBeTruthy();
    });
  });

  describe("keyboard navigation", () => {
    function getItemBtn(text: string) {
      return screen.getByText(text).closest("button");
    }

    function getSectionBtn(label: string) {
      return screen.getByText(label, { exact: false }).closest("button");
    }

    it("highlights section header on first ArrowDown", () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(getSectionBtn("Boards")?.classList.contains("menu-focus")).toBe(
        true,
      );
    });

    it("highlights first item on second ArrowDown", () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(getItemBtn("Playground")?.classList.contains("menu-focus")).toBe(
        true,
      );
    });

    it("moves highlight down through items", () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.keyDown(input, { key: "ArrowDown" }); // boards section
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Playground
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Sprint 1

      expect(getItemBtn("Sprint 1")?.classList.contains("menu-focus")).toBe(
        true,
      );
    });

    it("moves highlight up with ArrowUp", () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.keyDown(input, { key: "ArrowDown" }); // boards section
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Playground
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Sprint 1
      fireEvent.keyDown(input, { key: "ArrowUp" }); // Playground

      expect(getItemBtn("Playground")?.classList.contains("menu-focus")).toBe(
        true,
      );
    });

    it("resets highlight when search changes", () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.keyDown(input, { key: "ArrowDown" }); // boards section
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Playground

      expect(getItemBtn("Playground")?.classList.contains("menu-focus")).toBe(
        true,
      );

      fireEvent.input(input, { target: { value: "play" } });

      expect(getItemBtn("Playground")?.classList.contains("menu-focus")).toBe(
        false,
      );
    });

    it("navigates filtered items after search", () => {
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.input(input, { target: { value: "General" } });
      fireEvent.keyDown(input, { key: "ArrowDown" }); // settings section
      fireEvent.keyDown(input, { key: "ArrowDown" }); // General

      expect(getItemBtn("General")?.classList.contains("menu-focus")).toBe(
        true,
      );
    });

    it("confirms item selection on Enter", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      render(() => <OmniMenu />);

      const dialog = document.querySelector("dialog");
      if (dialog) {
        dialog.showModal = vi.fn();
        dialog.close = vi.fn();
      }

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.keyDown(input, { key: "ArrowDown" }); // boards section
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Playground
      fireEvent.keyDown(input, { key: "Enter" });

      expect(alertSpy).toHaveBeenCalledWith("Selected: boards > Playground");
      alertSpy.mockRestore();
    });

    it("toggles section on Enter when section header is selected", () => {
      render(() => <OmniMenu />);

      expect(screen.queryByText("Board Members")).toBeNull();

      const input = screen.getByPlaceholderText("Search commands...");
      fireEvent.keyDown(input, { key: "ArrowDown" }); // boards section
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Playground
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Sprint 1
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Backlog
      fireEvent.keyDown(input, { key: "ArrowDown" }); // users section
      fireEvent.keyDown(input, { key: "Enter" });

      expect(screen.getByText("Board Members")).toBeTruthy();
    });

    it("resets search instead of closing on Enter during search", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      render(() => <OmniMenu />);

      const input = screen.getByPlaceholderText(
        "Search commands...",
      ) as HTMLInputElement;
      fireEvent.input(input, { target: { value: "play" } });
      fireEvent.keyDown(input, { key: "ArrowDown" }); // boards section
      fireEvent.keyDown(input, { key: "ArrowDown" }); // Playground
      fireEvent.keyDown(input, { key: "Enter" });

      expect(alertSpy).toHaveBeenCalledWith("Selected: boards > Playground");
      expect(input.value).toBe("");
      expect(screen.getByText("Sprint 1")).toBeTruthy();
      alertSpy.mockRestore();
    });

    it("Escape clears search first, then closes on second Escape", () => {
      render(() => <OmniMenu />);

      const dialog = document.querySelector("dialog");
      if (dialog) {
        dialog.showModal = vi.fn();
        dialog.close = vi.fn();
      }

      const input = screen.getByPlaceholderText(
        "Search commands...",
      ) as HTMLInputElement;
      fireEvent.input(input, { target: { value: "play" } });

      expect(screen.queryByText("Sprint 1")).toBeNull();

      fireEvent.keyDown(input, { key: "Escape" });

      expect(input.value).toBe("");
      expect(screen.getByText("Sprint 1")).toBeTruthy();
    });
  });
});
