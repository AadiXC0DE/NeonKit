import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LightRays } from "@/components/ui/light-rays";

// jsdom has no canvas, ResizeObserver or IntersectionObserver. Each canvas gets a
// fake context that records its calls, so tests can tell the beams from the dust.
type Call = { name: string; args: unknown[] };
let contexts: Map<HTMLCanvasElement, Call[]>;
let frames: FrameRequestCallback[] = [];
let resizeObservers: { callback: () => void }[] = [];
let intersectionObservers: { callback: IntersectionObserverCallback }[] = [];
let reducedMotion = false;

function fakeContext(log: Call[]) {
  const state: Record<string | symbol, unknown> = {};
  const gradient = { addColorStop: (...args: unknown[]) => log.push({ name: "addColorStop", args }) };
  return new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args: unknown[]) => {
        log.push({ name: String(key), args });
        if (typeof key === "string" && key.startsWith("create")) return gradient;
      };
    },
    set(target, key, value) {
      log.push({ name: `set ${String(key)}`, args: [value] });
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

/** Calls from the most recent frame drawn on each canvas. */
function canvases(container: HTMLElement) {
  const [beams, dust] = Array.from(container.querySelectorAll("canvas"));
  const lastFrame = (log: Call[] = []) => log.slice(log.map((call) => call.name).lastIndexOf("clearRect"));
  return { beams, dust, beamCalls: lastFrame(contexts.get(beams)), dustCalls: lastFrame(contexts.get(dust)) };
}

beforeEach(() => {
  contexts = new Map();
  frames = [];
  resizeObservers = [];
  intersectionObservers = [];
  reducedMotion = false;
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement) {
    const log: Call[] = [];
    contexts.set(this, log);
    return fakeContext(log) as unknown as CanvasRenderingContext2D;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
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

describe("LightRays", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<LightRays />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
    expect(root.querySelectorAll("canvas")).toHaveLength(2);
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<LightRays />)).not.toThrow();
  });

  it("forwards the ref and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<LightRays ref={ref} color="amber" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("251 191 36");
  });

  it("renders soft beams at half resolution and dust at the device ratio", () => {
    vi.stubGlobal("devicePixelRatio", 2);
    const { container } = render(<LightRays />);
    resize();
    const { beams, dust } = canvases(container);
    expect([beams.width, beams.height]).toEqual([400, 200]);
    expect([dust.width, dust.height]).toEqual([1600, 800]);
  });

  it("draws one beam per ray, fanned from the origin", () => {
    reducedMotion = true;
    const { container } = render(<LightRays rays={5} origin="left" />);
    resize();
    const wedges = canvases(container).beamCalls.filter((call) => call.name === "createConicGradient");
    // Five beams plus the wide haze under them.
    expect(wedges).toHaveLength(6);
    // "left" sits just outside the left edge, a little above the middle.
    for (const wedge of wedges) {
      expect(wedge.args[1]).toBeCloseTo(-80);
      expect(wedge.args[2]).toBeCloseTo(120);
    }
  });

  it("moves the source with origin", () => {
    reducedMotion = true;
    const { container } = render(<LightRays origin="bottom" />);
    resize();
    const wedge = canvases(container).beamCalls.find((call) => call.name === "createConicGradient");
    expect(wedge?.args[1]).toBeCloseTo(400);
    expect(wedge?.args[2]).toBeGreaterThan(400);
  });

  it("only draws dust when dust is on", () => {
    reducedMotion = true;
    const lit = render(<LightRays dust={3} intensity={1} />);
    resize();
    expect(canvases(lit.container).dustCalls.some((call) => call.name === "arc")).toBe(true);
    lit.unmount();
    resizeObservers = [];
    const dark = render(<LightRays dust={false} />);
    resize();
    expect(canvases(dark.container).dustCalls.some((call) => call.name === "arc")).toBe(false);
  });

  it("animates, pauses offscreen, and cancels on unmount", () => {
    const { unmount } = render(<LightRays />);
    resize();
    expect(frames).toHaveLength(1);
    runFrames(0, 64);
    expect(frames).toHaveLength(1);
    act(() => intersectionObservers[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    runFrames(64, 96);
    expect(frames).toHaveLength(0);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("holds still with speed 0 or reduced motion", () => {
    render(<LightRays speed={0} />);
    resize();
    expect(frames).toHaveLength(0);
    reducedMotion = true;
    resizeObservers = [];
    render(<LightRays />);
    resize();
    expect(frames).toHaveLength(0);
  });

  it("re-reads --neon when the color prop changes", () => {
    reducedMotion = true;
    const { container, rerender } = render(<LightRays />);
    resize();
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ color: "rgb(251, 191, 36)" } as CSSStyleDeclaration);
    rerender(<LightRays color="amber" />);
    const stops = canvases(container).beamCalls.filter((call) => call.name === "addColorStop");
    expect(stops.some((stop) => String(stop.args[1]).includes("251 191 36"))).toBe(true);
  });
});
