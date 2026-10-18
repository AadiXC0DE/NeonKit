import * as React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Haze } from "@/components/ui/haze";
import { count, harness, lastFrame, leaveView, resize, runFrames, setupCanvasHarness, teardownCanvasHarness } from "./canvas-harness";

beforeEach(() => setupCanvasHarness());
afterEach(teardownCanvasHarness);

const canvas = (container: HTMLElement) => container.querySelector("canvas") as HTMLCanvasElement;

describe("Haze", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Haze />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<Haze />)).not.toThrow();
  });

  it("forwards the ref and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Haze ref={ref} color="violet" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("168 85 247");
  });

  it("renders at half the CSS size, whatever the device ratio", () => {
    vi.stubGlobal("devicePixelRatio", 2);
    const { container } = render(<Haze />);
    resize();
    expect([canvas(container).width, canvas(container).height]).toEqual([400, 200]);
  });

  it("composites three lit layers of smoke", () => {
    harness.reducedMotion = true;
    const { container } = render(<Haze />);
    resize();
    expect(count(lastFrame(canvas(container)), "drawImage")).toBe(3);
  });

  it("moves the light with the light prop", () => {
    harness.reducedMotion = true;
    const source = (light: "bottom" | "left") => {
      harness.resizeObservers = [];
      const { container, unmount } = render(<Haze light={light} />);
      resize();
      const gradient = lastFrame(canvas(container)).find((call) => call.name === "createRadialGradient");
      unmount();
      return gradient?.args.slice(0, 2) as number[];
    };
    const [bx, by] = source("bottom");
    const [lx] = source("left");
    expect(by).toBeGreaterThan(200);
    expect(bx).toBeCloseTo(200);
    expect(lx).toBeLessThan(0);
  });

  it("animates, pauses offscreen, and cancels on unmount", () => {
    const { unmount } = render(<Haze />);
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
    render(<Haze />);
    resize();
    expect(harness.frames).toHaveLength(0);
    harness.reducedMotion = false;
    harness.resizeObservers = [];
    render(<Haze speed={0} />);
    resize();
    expect(harness.frames).toHaveLength(0);
  });
});
