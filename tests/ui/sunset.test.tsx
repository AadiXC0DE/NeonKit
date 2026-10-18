import * as React from "react";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Sunset } from "@/components/ui/sunset";
import { count, harness, leaveView, resize, runFrames, setupCanvasHarness, teardownCanvasHarness } from "./canvas-harness";

beforeEach(() => setupCanvasHarness());
afterEach(teardownCanvasHarness);

const sunCalls = (container: HTMLElement) => harness.contexts.get(container.querySelector("canvas") as HTMLCanvasElement) ?? [];

describe("Sunset", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Sunset />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
  });

  it("forwards the ref and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Sunset ref={ref} color="pink" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("255 95 162");
  });

  it("renders the same mountains on the server and the client", () => {
    const server = renderToString(<Sunset seed={9} />);
    const again = renderToString(<Sunset seed={9} />);
    expect(server).toBe(again);
    expect(renderToString(<Sunset seed={10} />)).not.toBe(server);
  });

  it("draws mountains and the horizon line only when asked", () => {
    const { container, rerender } = render(<Sunset />);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    rerender(<Sunset mountains={false} />);
    expect(container.querySelectorAll("svg")).toHaveLength(0);
    const lines = () => Array.from(container.querySelectorAll("div")).filter((el) => el.className.includes("h-px"));
    expect(lines()).toHaveLength(1);
    rerender(<Sunset mountains={false} line={false} />);
    expect(lines()).toHaveLength(0);
  });

  it("puts the horizon where it's told", () => {
    const { container } = render(<Sunset horizon={0.7} />);
    const line = Array.from(container.querySelectorAll("div")).find((el) => el.className.includes("h-px"));
    expect(line?.style.top).toBe("70%");
  });

  it("cuts one slit per slits into the disc", () => {
    harness.reducedMotion = true;
    const { container } = render(<Sunset slits={5} />);
    resize();
    const calls = sunCalls(container);
    const frame = calls.slice(calls.map((call) => call.name).lastIndexOf("arc"));
    expect(count(frame, "clearRect")).toBe(5);
  });

  it("animates the slits, pauses offscreen, and cancels on unmount", () => {
    const { unmount } = render(<Sunset />);
    resize();
    runFrames(0, 64);
    expect(harness.frames).toHaveLength(1);
    leaveView();
    runFrames(64, 96);
    expect(harness.frames).toHaveLength(0);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("holds the slits still under reduced motion or speed 0", () => {
    harness.reducedMotion = true;
    const { container } = render(<Sunset />);
    resize();
    expect(harness.frames).toHaveLength(0);
    expect(count(sunCalls(container), "arc")).toBeGreaterThan(0);
    harness.reducedMotion = false;
    harness.resizeObservers = [];
    render(<Sunset speed={0} />);
    resize();
    expect(harness.frames).toHaveLength(0);
  });
});
