import { cleanup, fireEvent, render, screen } from "solid-testing-library";
import { afterEach, describe, expect, it } from "vitest";

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
});
