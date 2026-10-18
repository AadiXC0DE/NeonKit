import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sparks, fireSparks, useSparks } from "@/components/ui/sparks";

let calls: { name: string; args: unknown[] }[] = [];
let frames: FrameRequestCallback[] = [];
let reducedMotion = false;

function fakeContext() {
  const state: Record<string | symbol, unknown> = {};
  const gradient = { addColorStop: () => {} };
  return new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (typeof key === "string" && key.startsWith("create")) {
        return (...args: unknown[]) => {
          calls.push({ name: String(key), args });
          return gradient;
        };
      }
      return (...args: unknown[]) => {
        calls.push({ name: String(key), args });
      };
    },
    set(target, key, value) {
      if (key === "strokeStyle" || key === "fillStyle") calls.push({ name: String(key), args: [value] });
      target[key] = value;
      return true;
    },
  });
}

const layer = () => document.querySelector<HTMLCanvasElement>("canvas[data-nk-sparks]");
const step = (ms: number) => {
  for (let time = 16; time <= ms; time += 16) {
    act(() => {
      const queue = frames;
      frames = [];
      queue.forEach((callback) => callback(performance.now() + time));
    });
  }
};
const stroked = () => calls.filter((call) => call.name === "stroke").length;

beforeEach(() => {
  calls = [];
  frames = [];
  reducedMotion = false;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () => fakeContext() as unknown as CanvasRenderingContext2D,
  );
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
  // Let any burst burn out so the shared layer is gone before the next test.
  step(4000);
  vi.restoreAllMocks();
});

describe("fireSparks", () => {
  it("adds one fixed, inert canvas over the page and removes it when the last spark dies", () => {
    fireSparks({ x: 100, y: 100 });
    const canvas = layer();
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas?.style.position).toBe("fixed");
    expect(canvas?.style.pointerEvents).toBe("none");
    fireSparks({ x: 200, y: 100 });
    expect(document.querySelectorAll("canvas[data-nk-sparks]")).toHaveLength(1);
    step(200);
    expect(stroked()).toBeGreaterThan(0);
    step(4000);
    expect(layer()).toBeNull();
  });

  it("caps the backing store at twice the CSS pixels", () => {
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 });
    fireSparks({ x: 10, y: 10 });
    expect(layer()?.width).toBe(window.innerWidth * 2);
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });
  });

  it("takes its color from the origin's --neon, or from color", () => {
    const origin = document.createElement("button");
    origin.style.setProperty("--neon", "163 230 53");
    document.body.appendChild(origin);
    fireSparks({ origin, count: 6 });
    step(32);
    expect(calls.some((call) => call.name === "strokeStyle" && String(call.args[0]).startsWith("rgb(163 230 53"))).toBe(true);
    calls = [];
    fireSparks({ origin, color: "pink", count: 6 });
    step(32);
    expect(calls.some((call) => call.name === "strokeStyle" && String(call.args[0]).startsWith("rgb(255 95 162"))).toBe(true);
    origin.remove();
  });

  it("falls with gravity", () => {
    fireSparks({ x: 300, y: 300, count: 30, angle: -90, spread: 0, velocity: 400, gravity: 2000, drag: 0 });
    step(48);
    const early = calls.filter((call) => call.name === "lineTo").map((call) => call.args[1] as number);
    calls = [];
    step(700);
    const late = calls.filter((call) => call.name === "lineTo").map((call) => call.args[1] as number);
    expect(Math.min(...early)).toBeLessThan(300);
    expect(Math.max(...late)).toBeGreaterThan(Math.max(...early));
  });

  it("drops a running burst when the tab is hidden", () => {
    fireSparks({ x: 10, y: 10 });
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(layer()).toBeNull();
    hidden.mockRestore();
  });

  it("blooms in place instead of throwing sparks under reduced motion", () => {
    reducedMotion = true;
    fireSparks({ x: 50, y: 50, count: 80 });
    step(100);
    expect(stroked()).toBe(0);
    expect(calls.some((call) => call.name === "createRadialGradient")).toBe(true);
    step(800);
    expect(layer()).toBeNull();
  });
});

describe("useSparks", () => {
  it("fires from the element its ref is on, with the defaults it was given", () => {
    function Deploy() {
      const { ref, fire } = useSparks<HTMLButtonElement>({ count: 3 });
      return (
        <button ref={ref} type="button" onClick={() => fire()}>
          Deploy
        </button>
      );
    }
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 100, top: 200, width: 80, height: 40, right: 180, bottom: 240, x: 100, y: 200, toJSON: () => ({}),
    } as DOMRect);
    render(<Deploy />);
    fireEvent.click(screen.getByRole("button", { name: "Deploy" }));
    step(16);
    const heads = calls.filter((call) => call.name === "moveTo");
    expect(heads.length).toBeGreaterThan(0);
    // Three sparks, each one glow stroke and three tapering segments.
    expect(calls.filter((call) => call.name === "stroke")).toHaveLength(3 * 4);
  });
});

describe("Sparks", () => {
  it("fires on a click inside, adds no box, and stays quiet when disabled", () => {
    const { rerender, container } = render(
      <Sparks>
        <button type="button">Star</button>
      </Sparks>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("contents");
    fireEvent.click(screen.getByRole("button", { name: "Star" }), { clientX: 40, clientY: 50, detail: 1 });
    expect(layer()).not.toBeNull();
    step(4000);
    rerender(
      <Sparks disabled>
        <button type="button">Star</button>
      </Sparks>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Star" }), { clientX: 40, clientY: 50, detail: 1 });
    expect(layer()).toBeNull();
  });

  it("fires from the button's centre for a keyboard click", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 100, top: 200, width: 80, height: 40, right: 180, bottom: 240, x: 100, y: 200, toJSON: () => ({}),
    } as DOMRect);
    render(
      <Sparks count={4} velocity={0}>
        <button type="button">Like</button>
      </Sparks>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Like" }), { detail: 0 });
    step(16);
    const head = calls.find((call) => call.name === "lineTo");
    expect(head?.args[0]).toBeCloseTo(140, 0);
  });

  it("ignores clicks on disabled buttons and passes onClick through", () => {
    const onClick = vi.fn();
    render(
      <Sparks onClick={onClick}>
        <button type="button" disabled>
          Off
        </button>
        <span>text</span>
      </Sparks>,
    );
    fireEvent.click(screen.getByText("text"), { clientX: 5, clientY: 5, detail: 1 });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
