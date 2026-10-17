import * as React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Circuit } from "@/components/ui/circuit";
import { count, harness, lastFrame, leaveView, resize, runFrames, setupCanvasHarness, teardownCanvasHarness } from "./canvas-harness";

const canvases = (container: HTMLElement) => {
  const [board, light] = Array.from(container.querySelectorAll("canvas"));
  return { board, light };
};

/** The board as a list of drawing calls, for comparing layouts. */
function boardCalls(seed: number, density = 0.6) {
  harness.resizeObservers = [];
  const { container, unmount } = render(<Circuit seed={seed} density={density} />);
  resize();
  const calls = JSON.stringify(lastFrame(canvases(container).board));
  unmount();
  return calls;
}

beforeEach(() => setupCanvasHarness({ width: 1200, height: 600 }));
afterEach(teardownCanvasHarness);

describe("Circuit", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Circuit />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<Circuit />)).not.toThrow();
  });

  it("forwards the ref and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Circuit ref={ref} color="green" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("52 211 153");
  });

  it("routes the same board for the same seed, and a new one for another", () => {
    harness.reducedMotion = true;
    const first = boardCalls(7);
    expect(boardCalls(7)).toBe(first);
    expect(boardCalls(8)).not.toBe(first);
  });

  it("draws chips, traces and vias", () => {
    harness.reducedMotion = true;
    const { container } = render(<Circuit />);
    resize();
    const calls = lastFrame(canvases(container).board);
    expect(count(calls, "roundRect")).toBeGreaterThan(0);
    expect(count(calls, "lineTo")).toBeGreaterThan(20);
    expect(count(calls, "arc")).toBeGreaterThan(0);
  });

  it("adds detail with density", () => {
    harness.reducedMotion = true;
    const sparse = JSON.parse(boardCalls(3, 0)).filter((call: { name: string }) => call.name === "lineTo").length;
    const dense = JSON.parse(boardCalls(3, 1)).filter((call: { name: string }) => call.name === "lineTo").length;
    expect(dense).toBeGreaterThan(sparse);
  });

  it("sends pulses while animating, pauses offscreen and cancels on unmount", () => {
    const { container, unmount } = render(<Circuit pulses={4} />);
    resize();
    runFrames(0, 1000);
    expect(count(lastFrame(canvases(container).light), "createLinearGradient")).toBeGreaterThan(0);
    leaveView();
    runFrames(1000, 1100);
    expect(harness.frames).toHaveLength(0);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("holds a still frame with pulses mid-flight under reduced motion or speed 0", () => {
    harness.reducedMotion = true;
    const { container } = render(<Circuit />);
    resize();
    expect(harness.frames).toHaveLength(0);
    expect(count(lastFrame(canvases(container).light), "createLinearGradient")).toBeGreaterThan(0);
    harness.reducedMotion = false;
    harness.resizeObservers = [];
    render(<Circuit speed={0} />);
    resize();
    expect(harness.frames).toHaveLength(0);
  });
});
