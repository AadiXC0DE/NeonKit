import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Globe, type GlobeMarker } from "@/components/ui/globe";

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
      if (key === "measureText") return (text: string) => ({ width: text.length * 6 });
      if (typeof key === "string" && key.startsWith("create")) return () => gradient;
      return (...args: unknown[]) => {
        calls.push({ name: String(key), args });
      };
    },
    set(target, key, value) {
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

/** Land dots (rects) from the most recent frame. */
function lastDots() {
  const start = calls.map((call) => call.name).lastIndexOf("clearRect");
  return calls.slice(start).filter((call) => call.name === "rect").map((call) => call.args.slice(0, 2).join(","));
}
const lastLabels = () => {
  const start = calls.map((call) => call.name).lastIndexOf("clearRect");
  return calls.slice(start).filter((call) => call.name === "fillText").map((call) => call.args[0]);
};

const markers: GlobeMarker[] = [
  { id: "fra", lat: 50.03, lng: 8.57, label: "fra1" },
  { id: "jnb", lat: -26.14, lng: 28.24, label: "jnb1", live: false },
];

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
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(480);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(480);
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

describe("Globe", () => {
  it("is a focusable group named after its locations, with instructions", () => {
    render(<Globe markers={markers} />);
    const globe = screen.getByRole("group", { name: "Globe with 2 locations: fra1, jnb1" });
    expect(globe).toHaveAttribute("tabindex", "0");
    expect(globe).toHaveAttribute("aria-roledescription", "globe");
    expect(globe).toHaveAccessibleDescription(/arrow keys to rotate/);
  });

  it("is a plain image, out of the tab order, when not interactive", () => {
    render(<Globe interactive={false} aria-label="Our regions" />);
    const globe = screen.getByRole("img", { name: "Our regions" });
    expect(globe).not.toHaveAttribute("tabindex");
  });

  it("forwards the ref, spreads props and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Globe ref={ref} color="amber" data-testid="globe" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(ref.current).toHaveAttribute("data-testid", "globe");
  });

  it("renders without a canvas context or observers", () => {
    vi.unstubAllGlobals();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<Globe markers={markers} arcs={[{ from: "fra", to: "jnb" }]} />)).not.toThrow();
  });

  it("draws land as dots, labels the markers it can see and caps the pixel ratio", () => {
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 });
    const { container } = render(<Globe markers={markers} longitude={15} tilt={10} />);
    resize();
    expect(lastDots().length).toBeGreaterThan(800);
    expect(lastLabels()).toEqual(["fra1", "jnb1"]);
    expect(container.querySelector("canvas")?.width).toBe(960);
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });
  });

  it("hides markers on the far side", () => {
    render(<Globe markers={markers} longitude={-170} tilt={0} />);
    resize();
    expect(lastLabels()).toEqual([]);
  });

  it("spins on its own and stops off screen", () => {
    render(<Globe speed={30} />);
    resize();
    const before = lastDots();
    runFrames(0, 500);
    expect(lastDots()).not.toEqual(before);
    act(() => intersectionObservers[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    runFrames(500, 532);
    expect(frames).toHaveLength(0);
  });

  it("turns with the arrow keys and Home resets the view, under reduced motion too", () => {
    reducedMotion = true;
    render(<Globe />);
    resize();
    expect(frames).toHaveLength(0);
    const start = lastDots();
    const globe = screen.getByRole("group");
    fireEvent.keyDown(globe, { key: "ArrowRight" });
    const turned = lastDots();
    expect(turned).not.toEqual(start);
    fireEvent.keyDown(globe, { key: "ArrowUp" });
    expect(lastDots()).not.toEqual(turned);
    fireEvent.keyDown(globe, { key: "Home" });
    expect(lastDots()).toEqual(start);
  });

  it("follows a drag", () => {
    reducedMotion = true;
    const { container } = render(<Globe />);
    resize();
    const start = lastDots();
    const canvas = container.querySelector("canvas")!;
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 300, clientY: 200, button: 0 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 220, clientY: 200 });
    fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 220, clientY: 200 });
    expect(lastDots()).not.toEqual(start);
  });

  it("ignores keys and drags when not interactive", () => {
    reducedMotion = true;
    const { container } = render(<Globe interactive={false} />);
    resize();
    const start = lastDots();
    fireEvent.keyDown(screen.getByRole("img"), { key: "ArrowRight" });
    const canvas = container.querySelector("canvas")!;
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 300, clientY: 200, button: 0 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 100, clientY: 200 });
    expect(lastDots()).toEqual(start);
  });

  it("drops the halos at --neon-glow 0 and keeps the markers", () => {
    reducedMotion = true;
    const { rerender } = render(<Globe markers={markers} arcs={[{ from: "fra", to: [1.36, 103.99] }]} />);
    resize();
    expect(calls.some((call) => call.name === "drawImage")).toBe(true);
    const real = window.getComputedStyle;
    vi.spyOn(window, "getComputedStyle").mockImplementation((node: Element) => {
      const style = real(node);
      return {
        ...style,
        color: "rgb(34, 211, 238)",
        fontFamily: "sans-serif",
        getPropertyValue: (name: string) => (name === "--neon-glow" ? "0" : style.getPropertyValue(name)),
      } as CSSStyleDeclaration;
    });
    rerender(<Globe markers={markers} arcs={[{ from: "fra", to: [1.36, 103.99] }]} color="cyan" />);
    const frame = calls.slice(calls.map((call) => call.name).lastIndexOf("clearRect"));
    expect(frame.some((call) => call.name === "drawImage")).toBe(false);
    expect(frame.some((call) => call.name === "fillText")).toBe(true);
  });
});
