import { act } from "@testing-library/react";
import { vi } from "vitest";

// jsdom has no canvas, ResizeObserver or IntersectionObserver. Shared by the canvas background
// tests: every canvas gets a fake 2D context that records its calls, and the observers and
// animation frames are driven by hand.

export type Call = { name: string; args: unknown[] };

export const harness = {
  contexts: new Map<HTMLCanvasElement, Call[]>(),
  frames: [] as FrameRequestCallback[],
  resizeObservers: [] as { callback: () => void }[],
  intersectionObservers: [] as { callback: IntersectionObserverCallback }[],
  reducedMotion: false,
};

function fakeContext(canvas: HTMLCanvasElement, log: Call[]) {
  const state: Record<string | symbol, unknown> = { canvas };
  const gradient = { addColorStop: (...args: unknown[]) => log.push({ name: "addColorStop", args }) };
  return new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args: unknown[]) => {
        log.push({ name: String(key), args });
        if (key === "createImageData") {
          const [w, h] = args as number[];
          return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
        }
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
    harness.resizeObservers.push(this);
  }
  observe() {}
  disconnect() {}
}

class FakeIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {
    harness.intersectionObservers.push(this);
  }
  observe() {}
  disconnect() {}
}

export function setupCanvasHarness({ width = 800, height = 400 } = {}) {
  harness.contexts = new Map();
  harness.frames = [];
  harness.resizeObservers = [];
  harness.intersectionObservers = [];
  harness.reducedMotion = false;
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement) {
    const log: Call[] = [];
    harness.contexts.set(this, log);
    return fakeContext(this, log) as unknown as CanvasRenderingContext2D;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(height);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    harness.frames.push(callback);
    return harness.frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce") && harness.reducedMotion,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

export function teardownCanvasHarness() {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
}

export const resize = () => act(() => harness.resizeObservers.forEach((observer) => observer.callback()));

export const runFrames = (from: number, to: number) => {
  for (let time = from; time < to; time += 16) {
    act(() => {
      const queue = harness.frames;
      harness.frames = [];
      queue.forEach((callback) => callback(time));
    });
  }
};

export const leaveView = () =>
  act(() =>
    harness.intersectionObservers.forEach((observer) =>
      observer.callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver),
    ),
  );

/** Calls since the last full clear on a canvas: what its most recent frame drew. */
export function lastFrame(canvas: HTMLCanvasElement | undefined) {
  const log = (canvas && harness.contexts.get(canvas)) || [];
  return log.slice(log.map((call) => call.name).lastIndexOf("clearRect"));
}

export const count = (calls: Call[], name: string) => calls.filter((call) => call.name === name).length;
