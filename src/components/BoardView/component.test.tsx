import { describe, it, expect } from "vitest";
import { render } from "solid-testing-library";
import BoardView from "./component";

describe("BoardView", () => {
  it("renders board view component", () => {
    const { container } = render(() => <BoardView title="Test Board" />);
    expect(container).toBeTruthy();
  });

  it("renders lanes", () => {
    const { container } = render(() => <BoardView title="Test Board" />);
    const lanes = container.querySelectorAll(
      "[class*='flex'][class*='flex-col']",
    );
    expect(lanes.length).toBeGreaterThan(0);
  });

  it("renders create card button in default lane", () => {
    const { queryByText } = render(() => <BoardView title="Test Board" />);
    const createButton = queryByText("Create Card");
    expect(createButton).toBeTruthy();
  });

  it("shows watchers section in default lane", () => {
    const { queryByText } = render(() => <BoardView title="Test Board" />);
    const watchersText = queryByText("Watching for new cards");
    expect(watchersText).toBeTruthy();
  });

  it("renders stop watching button", () => {
    const { queryByText } = render(() => <BoardView title="Test Board" />);
    const stopButton = queryByText("Stop Watching");
    expect(stopButton).toBeTruthy();
  });

  it("renders all default lanes", () => {
    const { container } = render(() => <BoardView title="Test Board" />);
    // Default lanes are Not Now, Maybe, Done (3 lanes)
    expect(container.innerHTML).toContain("Not Now");
    expect(container.innerHTML).toContain("Maybe");
    expect(container.innerHTML).toContain("Done");
  });

  it("renders avatars for visible watchers", () => {
    const { container } = render(() => <BoardView title="Test Board" />);
    const avatars = container.querySelectorAll("[class*='avatar']");
    expect(avatars.length).toBeGreaterThan(0);
  });

  it("shows hidden watcher count when applicable", () => {
    const { container } = render(() => <BoardView title="Test Board" />);
    const html = container.innerHTML;
    // 17 total watchers, 7 visible, so should show +10
    expect(html).toContain("+10");
  });
});
