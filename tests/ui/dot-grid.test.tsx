import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DotGrid } from "@/components/ui/dot-grid";
import { count, harness, lastFrame, leaveView, resize, runFrames, setupCanvasHarness, teardownCanvasHarness } from "./canvas-harness";

const canvases = (container: HTMLElement) => {
  const [base, lit] = Array.from(container.querySelectorAll("canvas"));
  return { base, lit };
};

const pointerAt = (x: number, y: number) =>
  act(() => {
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: x, clientY: y }) as PointerEvent);
  });

beforeEach(() => {
  setupCanvasHarness();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 800, bottom: 400, width: 800, height: 400, x: 0, y: 0, toJSON: () => ({}),
  } as DOMRect);
});
afterEach(teardownCanvasHarness);

describe("DotGrid", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<DotGrid />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
    expect(root.querySelectorAll("canvas")).toHaveLength(2);
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<DotGrid />)).not.toThrow();
  });

  it("forwards the ref, applies a color and passes props through", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DotGrid ref={ref} color="amber" data-testid="grid" className="opacity-50" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(ref.current).toHaveAttribute("data-testid", "grid");
    expect(ref.current?.className).toContain("opacity-50");
  });

  it("fades toward the edges only when asked", () => {
    const { container, rerender } = render(<DotGrid />);
    expect((container.firstElementChild as HTMLElement).className).toContain("mask-image");
    rerender(<DotGrid fade={false} />);
    expect((container.firstElementChild as HTMLElement).className).not.toContain("mask-image");
  });

  it("caps the backing store at twice the CSS size", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    const { container } = render(<DotGrid />);
    resize();
    const { lit } = canvases(container);
    expect([lit.width, lit.height]).toEqual([1600, 800]);
  });

  it("draws one unlit dot per grid point, centered", () => {
    harness.reducedMotion = true;
    const { container } = render(<DotGrid spacing={20} />);
    resize();
    // 800 / 20 + 1 columns, 400 / 20 + 1 rows.
    expect(count(lastFrame(canvases(container).base), "arc")).toBe(41 * 21);
  });

  it("lights dots near the pointer, and stays dark without it", () => {
    const { container } = render(<DotGrid ripples={false} />);
    resize();
    runFrames(0, 48);
    expect(count(lastFrame(canvases(container).lit), "drawImage")).toBe(0);
    pointerAt(400, 200);
    runFrames(48, 400);
    expect(count(lastFrame(canvases(container).lit), "drawImage")).toBeGreaterThan(20);
  });

  it("ignores the pointer with radius 0", () => {
    const { container } = render(<DotGrid ripples={false} radius={0} />);
    resize();
    pointerAt(400, 200);
    runFrames(0, 400);
    expect(count(lastFrame(canvases(container).lit), "drawImage")).toBe(0);
  });

  it("sleeps once everything has settled", () => {
    render(<DotGrid ripples={false} />);
    resize();
    pointerAt(400, 200);
    runFrames(0, 600);
    // The pointer is resting: once every dot reaches its level, no more frames are asked for.
    expect(harness.frames).toHaveLength(0);
  });

  it("pauses offscreen and cancels on unmount", () => {
    const { unmount } = render(<DotGrid />);
    resize();
    expect(harness.frames.length).toBeGreaterThan(0);
    leaveView();
    runFrames(0, 64);
    expect(harness.frames).toHaveLength(0);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("draws one still pool of light under reduced motion and never animates", () => {
    harness.reducedMotion = true;
    const { container } = render(<DotGrid />);
    resize();
    expect(harness.frames).toHaveLength(0);
    expect(count(lastFrame(canvases(container).lit), "drawImage")).toBeGreaterThan(0);
    pointerAt(100, 100);
    expect(harness.frames).toHaveLength(0);
  });
});
