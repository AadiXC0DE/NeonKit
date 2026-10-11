import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Cityscape } from "@/components/ui/cityscape";

let reducedMotion = false;

beforeEach(() => {
  reducedMotion = false;
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const litPaths = (root: Element) =>
  Array.from(root.querySelectorAll(".nk-cityscape-lights path"))
    .map((path) => path.getAttribute("d") ?? "")
    .join("");
const liveOpacities = (root: Element) =>
  Array.from(root.querySelectorAll<SVGRectElement>("[data-live]")).map((node) => node.style.opacity);

describe("Cityscape", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Cityscape />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("inset-0");
  });

  it("stacks the sky, far, middle and near rows as bottom-anchored SVG layers", () => {
    const { container } = render(<Cityscape />);
    const layers = container.querySelectorAll("svg");
    expect(layers).toHaveLength(4);
    for (const layer of layers) {
      expect(layer).toHaveAttribute("viewBox", "0 0 1600 400");
      expect(layer).toHaveAttribute("preserveAspectRatio", "xMidYMax slice");
    }
  });

  it("builds the same skyline for the same seed and a different one for another", () => {
    const a = render(<Cityscape seed={3} />);
    const b = render(<Cityscape seed={3} />);
    const c = render(<Cityscape seed={4} />);
    const skyline = (root: HTMLElement) =>
      Array.from(root.querySelectorAll("svg path"))
        .map((path) => path.getAttribute("d"))
        .join("|");
    expect(skyline(a.container)).toBe(skyline(b.container));
    expect(skyline(a.container)).not.toBe(skyline(c.container));
  });

  it("lights more windows as lights goes up", () => {
    const late = render(<Cityscape seed={9} lights={0.05} />);
    const evening = render(<Cityscape seed={9} lights={0.5} />);
    expect(litPaths(evening.container).length).toBeGreaterThan(litPaths(late.container).length * 2);
  });

  it("puts each sign on a roof, with a halo and a whitened core", () => {
    const { container } = render(<Cityscape signs={["NOODLES", { text: "BAR", color: "amber" }]} />);
    const texts = Array.from(container.querySelectorAll("text")).map((node) => node.textContent);
    expect(texts.filter((text) => text === "NOODLES")).toHaveLength(2);
    expect(texts.filter((text) => text === "BAR")).toHaveLength(2);
    const bar = Array.from(container.querySelectorAll<SVGGElement>("g")).find(
      (group) => group.style.getPropertyValue("--nk-sign") === "rgb(251 191 36)",
    );
    expect(bar).toBeDefined();
  });

  it("renders no signs when given an empty list", () => {
    const { container } = render(<Cityscape signs={[]} />);
    expect(container.querySelectorAll("text")).toHaveLength(0);
  });

  it("forwards the ref, spreads props and applies an explicit color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Cityscape ref={ref} color="violet" data-testid="city" className="top-auto h-64" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("168 85 247");
    expect(ref.current).toHaveAttribute("data-testid", "city");
    expect(ref.current?.className).toContain("top-auto");
  });

  it("switches windows and blinks beacons on a timer, without re-rendering", () => {
    vi.useFakeTimers();
    const { container } = render(<Cityscape seed={7} />);
    const before = liveOpacities(container).join();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(liveOpacities(container).join()).not.toBe(before);
    const beacons = Array.from(container.querySelectorAll<SVGGElement>("[data-beacon]"));
    expect(beacons.some((node) => node.style.opacity !== "")).toBe(true);
  });

  it("stays still with flicker off or under reduced motion", () => {
    vi.useFakeTimers();
    const off = render(<Cityscape flicker={false} />);
    reducedMotion = true;
    const reduced = render(<Cityscape />);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(liveOpacities(off.container).every((value) => value === "")).toBe(true);
    expect(liveOpacities(reduced.container).every((value) => value === "")).toBe(true);
  });

  it("stops the timer and restores every light on unmount", () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<Cityscape />);
    const windows = Array.from(container.querySelectorAll<SVGRectElement>("[data-live]"));
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    unmount();
    expect(windows.every((node) => node.style.opacity === "")).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("drifts the back rows on scroll when parallax is on", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const { container } = render(<Cityscape parallax={40} />);
    const [, far, mid] = Array.from(container.querySelectorAll("svg"));
    act(() => {
      document.dispatchEvent(new Event("scroll"));
    });
    expect(far.style.transform).toMatch(/^translate3d\(0, -?[\d.]+px, 0\)$/);
    const travel = (layer: SVGSVGElement) => Math.abs(parseFloat(layer.style.transform.split(",")[1]));
    expect(travel(far)).toBeGreaterThan(travel(mid));
  });

  it("leaves the layers in place without parallax or under reduced motion", () => {
    reducedMotion = true;
    const { container } = render(<Cityscape parallax />);
    act(() => {
      document.dispatchEvent(new Event("scroll"));
    });
    for (const layer of container.querySelectorAll("svg")) expect(layer.style.transform).toBe("");
  });
});
