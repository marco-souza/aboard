import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import OmniMenu from "./component";

describe("OmniMenu UI", () => {
  it("renders the trigger button", () => {
    render(() => <OmniMenu />);
    expect(
      screen.getByRole("button", { name: /Open Omni Menu/i }),
    ).toBeTruthy();
  });

  it("renders the dialog element", () => {
    render(() => <OmniMenu />);
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeTruthy();
  });
});
