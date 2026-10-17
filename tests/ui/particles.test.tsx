import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Particles } from "@/components/ui/particles";

// jsdom has no canvas, ResizeObserver or IntersectionObserver. These fakes record
// what the component draws and let each test drive resizes, visibility and frames.
let calls: { name: string; args: unknown[] }[] = [];
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
      return (...args: unknown[]) => {
        calls.push({ name: String(key), args });
      };
    },
    set(target, key, value) {
      if (key === "fillStyle" || key === "strokeStyle") calls.push({ name: String(key), args: [value] });
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
const runFrames = (from: number, to: number) => {
  for (let time = from; time < to; time += 16) {
    act(() => {
      const queue = frames;
      frames = [];
      queue.forEach((callback) => callback(time));
    });
  }
};
const pointAt = (x: number, y: number) =>
  act(() => {
    window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: x, clientY: y, pointerType: "mouse" }));
  });

/** Particle centers from the most recent frame. */
function lastFrameParticles() {
  const start = calls.map((call) => call.name).lastIndexOf("clearRect");
  return calls
    .slice(start)
    .filter((call) => call.name === "arc")
    .map((call) => ({ x: call.args[0] as number, y: call.args[1] as number }));
}

const near = (points: { x: number; y: number }[], x: number, y: number, r: number) =>
  points.filter((p) => Math.hypot(p.x - x, p.y - y) < r).length;

beforeEach(() => {
  calls = [];
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
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 640, bottom: 360, width: 640, height: 360, x: 0, y: 0, toJSON: () => ({}),
  } as DOMRect);
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

describe("Particles", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Particles />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<Particles connect />)).not.toThrow();
  });

  it("forwards the ref, spreads props and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Particles ref={ref} color="#ff8a3d" data-testid="dust" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("255 138 61");
    expect(ref.current).toHaveAttribute("data-testid", "dust");
  });

  it("scales the particle count with the area and density", () => {
    render(<Particles density={2} />);
    resize();
    // 640 x 360 is 23.04 blocks of 10,000 px².
    expect(lastFrameParticles()).toHaveLength(46);
  });

  it("only draws links when connect is on", () => {
    const { unmount } = render(<Particles density={4} />);
    resize();
    expect(calls.some((call) => call.name === "lineTo")).toBe(false);
    unmount();
    calls = [];
    render(<Particles density={4} connect />);
    resize();
    expect(calls.some((call) => call.name === "lineTo")).toBe(true);
  });

  it("pushes particles away from the cursor with repel", () => {
    render(<Particles density={6} speed={0} interaction="repel" />);
    resize();
    pointAt(320, 180);
    runFrames(0, 1500);
    expect(near(lastFrameParticles(), 320, 180, 40)).toBe(0);
  });

  it("gathers particles around the cursor with attract", () => {
    render(<Particles density={6} speed={0} interaction="attract" />);
    resize();
    const before = near(lastFrameParticles(), 320, 180, 60);
    pointAt(320, 180);
    runFrames(0, 2500);
    expect(near(lastFrameParticles(), 320, 180, 60)).toBeGreaterThan(before);
  });

  it("ignores the cursor with interaction none", () => {
    render(<Particles density={6} speed={0} interaction="none" />);
    resize();
    const before = lastFrameParticles();
    pointAt(320, 180);
    runFrames(0, 500);
    expect(lastFrameParticles()).toEqual(before);
  });

  it("pauses offscreen and cancels its frame on unmount", () => {
    const { unmount } = render(<Particles />);
    resize();
    expect(frames).toHaveLength(1);
    act(() => intersectionObservers[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    runFrames(0, 32);
    expect(frames).toHaveLength(0);
    act(() => intersectionObservers[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(frames).toHaveLength(1);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("draws one still frame and ignores the cursor under reduced motion", () => {
    reducedMotion = true;
    render(<Particles density={6} />);
    resize();
    expect(frames).toHaveLength(0);
    const before = lastFrameParticles();
    expect(before.length).toBeGreaterThan(0);
    pointAt(320, 180);
    expect(frames).toHaveLength(0);
  });

  it("re-reads --neon when the color prop changes", () => {
    reducedMotion = true;
    const { rerender } = render(<Particles connect />);
    resize();
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ color: "rgb(163, 230, 53)", getPropertyValue: () => "" } as unknown as CSSStyleDeclaration);
    calls = [];
    rerender(<Particles connect color="lime" />);
    // Links are stroked in the raw color.
    expect(calls.some((call) => call.name === "strokeStyle" && String(call.args[0]).includes("163 230 53"))).toBe(true);
  });

  it("drops the halo sprites at --neon-glow 0 and keeps the motes", () => {
    reducedMotion = true;
    const { rerender } = render(<Particles />);
    resize();
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(34, 211, 238)",
      getPropertyValue: (name: string) => (name === "--neon-glow" ? "0" : ""),
    } as unknown as CSSStyleDeclaration);
    calls = [];
    rerender(<Particles color="cyan" />);
    expect(calls.some((call) => call.name === "drawImage")).toBe(false);
    expect(calls.some((call) => call.name === "arc")).toBe(true);
  });
});
