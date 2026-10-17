import * as React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tunnel } from "@/components/ui/tunnel";
import { count, harness, lastFrame, leaveView, resize, runFrames, setupCanvasHarness, teardownCanvasHarness } from "./canvas-harness";

beforeEach(() => setupCanvasHarness());
afterEach(teardownCanvasHarness);

const canvases = (container: HTMLElement) => {
  const [halo, core] = Array.from(container.querySelectorAll("canvas"));
  return { halo, core };
};

describe("Tunnel", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Tunnel />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<Tunnel />)).not.toThrow();
  });

  it("forwards the ref and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Tunnel ref={ref} color="violet" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("168 85 247");
  });

  it("renders halos at half resolution and tubes at the capped device ratio", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    const { container } = render(<Tunnel />);
    resize();
    const { halo, core } = canvases(container);
    expect([halo.width, halo.height]).toEqual([400, 200]);
    expect([core.width, core.height]).toEqual([1600, 800]);
  });

  it("draws round rings or rectangular frames", () => {
    harness.reducedMotion = true;
    const round = render(<Tunnel />);
    resize();
    const roundCalls = lastFrame(canvases(round.container).core);
    expect(count(roundCalls, "arc")).toBeGreaterThan(5);
    expect(count(roundCalls, "roundRect")).toBe(0);
    round.unmount();
    harness.resizeObservers = [];
    const square = render(<Tunnel shape="square" />);
    resize();
    const squareCalls = lastFrame(canvases(square.container).core);
    expect(count(squareCalls, "roundRect")).toBeGreaterThan(5);
    expect(count(squareCalls, "arc")).toBe(0);
  });

  it("animates, pauses offscreen, and cancels on unmount", () => {
    const { unmount } = render(<Tunnel />);
    resize();
    runFrames(0, 64);
    expect(harness.frames).toHaveLength(1);
    leaveView();
    runFrames(64, 96);
    expect(harness.frames).toHaveLength(0);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("holds one still frame with speed 0 or reduced motion", () => {
    harness.reducedMotion = true;
    const { container } = render(<Tunnel />);
    resize();
    expect(harness.frames).toHaveLength(0);
    expect(count(lastFrame(canvases(container).core), "stroke")).toBeGreaterThan(0);
    harness.reducedMotion = false;
    harness.resizeObservers = [];
    render(<Tunnel speed={0} />);
    resize();
    expect(harness.frames).toHaveLength(0);
  });
});
