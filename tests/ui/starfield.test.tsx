import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Starfield } from "@/components/ui/starfield";

// jsdom has no canvas, ResizeObserver or IntersectionObserver. These fakes record
// what the component draws and let each test drive resizes, visibility and frames.
const styles: string[] = [];
let frames: FrameRequestCallback[] = [];
let resizeObservers: { callback: () => void }[] = [];
let intersectionObservers: { callback: IntersectionObserverCallback }[] = [];
let reducedMotion = false;

function fakeContext() {
  const state: Record<string | symbol, unknown> = {};
  const gradient = { addColorStop: () => {} };
  return new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (typeof key === "string" && key.startsWith("create")) return () => gradient;
      return () => {};
    },
    set(target, key, value) {
      if (key === "fillStyle" && typeof value === "string") styles.push(`fill ${value}`);
      if (key === "strokeStyle" && typeof value === "string") styles.push(`stroke ${value}`);
      target[key] = value;
      return true;
    },
  });
}

class FakeResizeObserver {
  constructor(public callback: () => void) {
    resizeObservers.push(this);
  }
  observe() {}
  disconnect() {}
}

class FakeIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {
    intersectionObservers.push(this);
  }
  observe() {}
  disconnect() {}
}

const resize = () => act(() => resizeObservers.forEach((observer) => observer.callback()));
const runFrame = (time: number) =>
  act(() => {
    const queue = frames;
    frames = [];
    queue.forEach((callback) => callback(time));
  });

beforeEach(() => {
  styles.length = 0;
  frames = [];
  resizeObservers = [];
  intersectionObservers = [];
  reducedMotion = false;
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () => fakeContext() as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(640);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(360);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce") && reducedMotion,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Starfield", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Starfield data-testid="stars" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<Starfield warp />)).not.toThrow();
  });

  it("forwards the ref, merges className and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Starfield ref={ref} color="magenta" className="opacity-70" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("240 70 235");
    expect(ref.current?.className).toContain("opacity-70");
  });

  it("sizes the canvas to the box with the pixel ratio capped at 2", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    const { container } = render(<Starfield />);
    resize();
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(720);
  });

  it("animates with requestAnimationFrame and cancels it on unmount", () => {
    const { unmount } = render(<Starfield />);
    resize();
    expect(frames).toHaveLength(1);
    runFrame(16);
    runFrame(32);
    expect(frames).toHaveLength(1);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("pauses offscreen and resumes when scrolled back into view", () => {
    render(<Starfield />);
    resize();
    act(() => intersectionObservers[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    // A frame already in flight finishes but doesn't book another.
    runFrame(16);
    expect(frames).toHaveLength(0);
    act(() => intersectionObservers[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(frames).toHaveLength(1);
  });

  it("pauses while the tab is hidden", () => {
    render(<Starfield />);
    resize();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    runFrame(16);
    expect(frames).toHaveLength(0);
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(frames).toHaveLength(1);
  });

  it("draws a single still frame under reduced motion", () => {
    reducedMotion = true;
    render(<Starfield warp />);
    resize();
    expect(frames).toHaveLength(0);
    expect(styles.length).toBeGreaterThan(0);
  });

  it("re-reads --neon when the color prop changes", () => {
    const { rerender } = render(<Starfield tint={1} />);
    resize();
    const computed = vi.spyOn(window, "getComputedStyle").mockReturnValue({ color: "rgb(240, 70, 235)" } as CSSStyleDeclaration);
    styles.length = 0;
    rerender(<Starfield tint={1} color="magenta" />);
    runFrame(16);
    runFrame(32);
    expect(computed).toHaveBeenCalled();
    expect(styles.some((style) => style.includes("240 70 235"))).toBe(true);
  });

  it("stretches the stars into streaks during warp, and only then", () => {
    const { rerender } = render(<Starfield />);
    resize();
    for (let t = 0; t < 400; t += 16) runFrame(t);
    // Resting stars are filled; streaks are stroked.
    expect(styles.some((style) => style.startsWith("stroke"))).toBe(false);
    rerender(<Starfield warp />);
    for (let t = 400; t < 1600; t += 16) runFrame(t);
    expect(styles.some((style) => style.startsWith("stroke"))).toBe(true);
  });
});
