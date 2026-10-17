import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RainGlass } from "@/components/ui/rain-glass";

// jsdom has no canvas, ResizeObserver or IntersectionObserver. Every canvas, including
// the offscreen bead layers, gets a fake context that records its calls.
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
const lastFrame = (log: Call[] = []) => log.slice(log.map((call) => call.name).lastIndexOf("clearRect"));
const allCalls = () => Array.from(contexts.values()).flat();
const wipes = () =>
  allCalls().filter((call) => call.name === "set globalCompositeOperation" && call.args[0] === "destination-out").length;

function canvases(container: HTMLElement) {
  const [back, glass] = Array.from(container.querySelectorAll("canvas"));
  return { back, glass, backCalls: lastFrame(contexts.get(back)), glassCalls: lastFrame(contexts.get(glass)) };
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
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 400, bottom: 240, width: 400, height: 240, x: 0, y: 0, toJSON: () => ({}),
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

describe("RainGlass", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<RainGlass />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
    expect(root.querySelectorAll("canvas")).toHaveLength(2);
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<RainGlass wipe />)).not.toThrow();
  });

  it("forwards the ref and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<RainGlass ref={ref} color="pink" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("255 95 162");
  });

  it("draws the lights at half resolution and the water at the device ratio, capped at 2", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    const { container } = render(<RainGlass />);
    resize();
    const { back, glass } = canvases(container);
    expect([back.width, back.height]).toEqual([200, 120]);
    expect([glass.width, glass.height]).toEqual([800, 480]);
  });

  it("is already wet on the first frame", () => {
    reducedMotion = true;
    const { container } = render(<RainGlass />);
    resize();
    const { glassCalls } = canvases(container);
    // Each drop clips to its outline to refract the lights behind it.
    expect(glassCalls.filter((call) => call.name === "clip").length).toBeGreaterThan(3);
    expect(frames).toHaveLength(0);
  });

  it("leaves the glass transparent with bokeh off", () => {
    reducedMotion = true;
    const { container } = render(<RainGlass bokeh={false} />);
    resize();
    const { backCalls, glassCalls } = canvases(container);
    expect(backCalls.some((call) => call.name === "createRadialGradient")).toBe(false);
    // No lights to refract, so drops skip the lens and only get their shading.
    expect(glassCalls.some((call) => call.name === "clip")).toBe(false);
    expect(glassCalls.some((call) => call.name === "drawImage")).toBe(true);
  });

  it("wipes the glass under the pointer only when wipe is on", () => {
    reducedMotion = true;
    const dry = render(<RainGlass />);
    resize();
    let before = wipes();
    act(() => {
      window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 200, clientY: 120, pointerType: "mouse" }));
    });
    expect(wipes()).toBe(before);
    dry.unmount();

    resizeObservers = [];
    render(<RainGlass wipe />);
    resize();
    before = wipes();
    act(() => {
      window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 200, clientY: 120, pointerType: "mouse" }));
    });
    expect(wipes()).toBeGreaterThan(before);
  });

  it("animates, pauses offscreen, and cancels on unmount", () => {
    const { unmount } = render(<RainGlass />);
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

  it("freezes with speed 0", () => {
    render(<RainGlass speed={0} />);
    resize();
    expect(frames).toHaveLength(0);
  });

  it("re-reads --neon when the color prop changes", () => {
    reducedMotion = true;
    const { container, rerender } = render(<RainGlass />);
    resize();
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ color: "rgb(255, 95, 162)", getPropertyValue: () => "" } as unknown as CSSStyleDeclaration);
    rerender(<RainGlass color="pink" />);
    const stops = canvases(container).backCalls.filter((call) => call.name === "addColorStop");
    expect(stops.some((stop) => String(stop.args[1]).includes("255 95 162"))).toBe(true);
  });
});
