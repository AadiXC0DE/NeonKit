import * as React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Lasers } from "@/components/ui/lasers";
import { count, harness, lastFrame, leaveView, resize, runFrames, setupCanvasHarness, teardownCanvasHarness } from "./canvas-harness";

beforeEach(() => setupCanvasHarness());
afterEach(teardownCanvasHarness);

const canvas = (container: HTMLElement) => container.querySelector("canvas") as HTMLCanvasElement;

describe("Lasers", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Lasers />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<Lasers />)).not.toThrow();
  });

  it("forwards the ref and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Lasers ref={ref} color="magenta" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("240 70 235");
  });

  it("draws four strokes per beam per projector: smoke sheath, bloom, glow and core", () => {
    harness.reducedMotion = true;
    const { container } = render(<Lasers beams={5} sources={2} />);
    resize();
    expect(count(lastFrame(canvas(container)), "stroke")).toBe(5 * 2 * 4);
  });

  it("puts the projectors on the chosen edge", () => {
    harness.reducedMotion = true;
    const bottom = render(<Lasers origin="bottom" beams={1} />);
    resize();
    const fromBottom = lastFrame(canvas(bottom.container)).find((call) => call.name === "moveTo");
    expect(fromBottom?.args[1]).toBeGreaterThan(400);
    bottom.unmount();
    harness.resizeObservers = [];
    const top = render(<Lasers origin="top" beams={1} />);
    resize();
    const fromTop = lastFrame(canvas(top.container)).find((call) => call.name === "moveTo");
    expect(fromTop?.args[1]).toBeLessThan(0);
  });

  it("caps the backing store at twice the CSS size", () => {
    vi.stubGlobal("devicePixelRatio", 4);
    const { container } = render(<Lasers />);
    resize();
    expect([canvas(container).width, canvas(container).height]).toEqual([1600, 800]);
  });

  it("animates, pauses offscreen, and cancels on unmount", () => {
    const { unmount } = render(<Lasers />);
    resize();
    expect(harness.frames).toHaveLength(1);
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
    const { container } = render(<Lasers />);
    resize();
    expect(harness.frames).toHaveLength(0);
    expect(count(lastFrame(canvas(container)), "stroke")).toBeGreaterThan(0);
    harness.reducedMotion = false;
    harness.resizeObservers = [];
    render(<Lasers speed={0} />);
    resize();
    expect(harness.frames).toHaveLength(0);
  });
});
