import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrambleText } from "@/components/ui/scramble-text";

const matchMedia = window.matchMedia;
const cellsOf = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-c]"));
const states = (container: HTMLElement) => cellsOf(container).map((cell) => cell.getAttribute("data-s"));

describe("ScrambleText", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.matchMedia = matchMedia;
  });

  it("gives screen readers the real text and hides the cells", () => {
    const { container } = render(<ScrambleText text="ACCESS GRANTED" />);
    expect(screen.getByText("ACCESS GRANTED")).toHaveClass("sr-only");
    const cells = cellsOf(container);
    expect(cells).toHaveLength(13);
    expect(cells[0].closest("[aria-hidden]")).not.toBeNull();
  });

  it("decodes left to right on mount", () => {
    const { container } = render(<ScrambleText text="NEON" trigger="mount" duration={1000} />);
    expect(states(container).every((s) => s === "s")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(560);
    });
    // The first glyph locks at 30% + 70% / 4 of the run; the rest are still scrambling.
    expect(states(container)).toEqual(["l", "h", "s", "s"]);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(states(container)).toEqual(["l", "l", "l", "l"]);
    expect(cellsOf(container).map((cell) => cell.textContent).join("")).toBe("NEON");
  });

  it("scrambles through the chosen charset", () => {
    const { container } = render(<ScrambleText text="READY" trigger="mount" charset="binary" />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    for (const cell of cellsOf(container)) {
      if (cell.getAttribute("data-s") !== "l") expect(["0", "1"]).toContain(cell.getAttribute("data-g"));
    }
  });

  it("decodes immediately in view when IntersectionObserver is missing", () => {
    const { container } = render(<ScrambleText text="GO" />);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(states(container)).toEqual(["l", "l"]);
  });

  it("waits for a hover", () => {
    const { container } = render(<ScrambleText text="Docs" trigger="hover" duration={400} />);
    expect(states(container)).toEqual([null, null, null, null]);
    fireEvent.pointerEnter(container.firstElementChild as HTMLElement);
    expect(states(container).every((s) => s === "s")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(states(container)).toEqual(["l", "l", "l", "l"]);
  });

  it("replays when the link around it is hovered or focused", () => {
    const { container } = render(
      <a href="#docs">
        <ScrambleText text="Docs" trigger="hover" duration={400} />
      </a>,
    );
    const link = container.querySelector("a") as HTMLAnchorElement;
    fireEvent.pointerEnter(link);
    expect(states(container).every((s) => s === "s")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(states(container)).toEqual(["l", "l", "l", "l"]);
    act(() => link.focus());
    expect(states(container).every((s) => s === "s")).toBe(true);
  });

  it("scrambles into new text", () => {
    const { container, rerender } = render(<ScrambleText text="ONE" trigger="mount" duration={300} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    rerender(<ScrambleText text="FOUR" trigger="mount" duration={300} />);
    expect(screen.getByText("FOUR")).toHaveClass("sr-only");
    expect(states(container).every((s) => s === "s")).toBe(true);
  });

  it("shows the final text under reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { container } = render(<ScrambleText text="CALM" trigger="mount" />);
    expect(states(container)).toEqual([null, null, null, null]);
    fireEvent.pointerEnter(container.firstElementChild as HTMLElement);
    expect(states(container)).toEqual([null, null, null, null]);
  });

  it("renders the requested element and forwards the ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(<ScrambleText ref={ref} as="h2" text="Uplink" />);
    expect(screen.getByRole("heading", { level: 2, name: "Uplink" })).toBe(ref.current);
  });
});
