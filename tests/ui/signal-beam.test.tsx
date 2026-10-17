import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignalBeam, type SignalBeamProps } from "@/components/ui/signal-beam";

let intersection: IntersectionObserverCallback | null = null;

class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersection = callback;
  }
  observe() {}
  disconnect() {}
}

// Rects come from a data-rect="left top width height" attribute; the SVG sits at the origin.
function rectOf(node: Element) {
  const [left, top, width, height] = (node.getAttribute("data-rect") ?? "0 0 400 200").split(" ").map(Number);
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

function Diagram(props: Partial<SignalBeamProps> & { round?: boolean }) {
  const { round, ...beam } = props;
  const container = React.useRef<HTMLDivElement>(null);
  const from = React.useRef<HTMLSpanElement>(null);
  const to = React.useRef<HTMLSpanElement>(null);
  return (
    <div ref={container} data-rect="0 0 400 200">
      <span ref={from} data-rect="20 80 40 40" style={{ borderTopLeftRadius: round ? "50%" : "8px" }} />
      <span ref={to} data-rect="340 80 40 40" />
      <SignalBeam containerRef={container} fromRef={from} toRef={to} {...beam} />
    </div>
  );
}

const tube = (container: HTMLElement) => container.querySelector("svg > path") as SVGPathElement;

beforeEach(() => {
  intersection = null;
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    return rectOf(this);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SignalBeam", () => {
  it("is a decorative SVG that fills its container and takes its color through --neon", () => {
    const ref = React.createRef<SVGSVGElement>();
    function WithRef() {
      const from = React.useRef<HTMLSpanElement>(null);
      const to = React.useRef<HTMLSpanElement>(null);
      return (
        <div>
          <span ref={from} />
          <span ref={to} />
          <SignalBeam ref={ref} fromRef={from} toRef={to} color="pink" data-testid="beam" />
        </div>
      );
    }
    render(<WithRef />);
    expect(ref.current).toHaveAttribute("aria-hidden", "true");
    expect(ref.current).toHaveAttribute("data-testid", "beam");
    expect(ref.current?.getAttribute("class")).toContain("absolute inset-0");
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("255 95 162");
  });

  it("runs the tube from edge to edge, leaving a gap at each node", () => {
    const { container } = render(<Diagram gap={4} />);
    // Boxes end at x = 60 and start at x = 340, both centred on y = 100.
    expect(tube(container).getAttribute("d")).toBe("M 64 100 Q 200 100 336 100");
  });

  it("leaves a round node from its rim, not its bounding box", () => {
    const { container } = render(<Diagram round curvature={60} gap={0} />);
    const [, x, y] = tube(container).getAttribute("d")!.match(/^M ([\d.]+) ([\d.]+)/)!.map(Number);
    // The from node is a circle of radius 20 round (40, 100).
    expect(Math.hypot(x - 40, y - 100)).toBeCloseTo(20, 0);
    // Positive curvature bows up when travelling right.
    expect(tube(container).getAttribute("d")).toContain("Q 200 40");
  });

  it("stacks a pulse of dashes that all end at one head, and flashes the far node", () => {
    const { container } = render(<Diagram pulseLength={0.4} />);
    const pulses = container.querySelectorAll<SVGPathElement>(".nk-signal-beam-pulse");
    expect(pulses.length).toBeGreaterThan(4);
    for (const pulse of pulses) {
      expect(pulse.getAttribute("pathLength")).toBe("1");
      const dash = parseFloat(pulse.style.strokeDasharray);
      // Forward: offset = length - head, so a = length + edge at the start.
      expect(parseFloat(pulse.style.getPropertyValue("--nk-sb-a"))).toBeCloseTo(dash + 0.002, 5);
    }
    const flash = container.querySelector(".nk-signal-beam-flash");
    expect(flash?.getAttribute("cx")).toBe("336");
  });

  it("reverses and runs both ways", () => {
    const { container, rerender } = render(<Diagram reverse />);
    const pulse = container.querySelector<SVGPathElement>(".nk-signal-beam-pulse")!;
    expect(parseFloat(pulse.style.getPropertyValue("--nk-sb-a"))).toBeLessThan(-1);
    expect(container.querySelector(".nk-signal-beam-flash")?.getAttribute("cx")).toBe("64");
    rerender(<Diagram bidirectional duration={2} repeatDelay={1} />);
    const groups = container.querySelectorAll("svg > g");
    expect(groups).toHaveLength(2);
    expect((groups[1] as SVGGElement).style.getPropertyValue("--nk-sb-delay")).toBe("1.5s");
  });

  it("draws a dark, dashed tube with no pulse when inactive", () => {
    const { container } = render(<Diagram active={false} />);
    expect(container.querySelectorAll(".nk-signal-beam-pulse")).toHaveLength(0);
    expect(tube(container).style.strokeDasharray).not.toBe("");
  });

  it("times the run and the landing flash in its own keyframes", () => {
    const { container } = render(<Diagram duration={3} repeatDelay={1} pulseLength={0.25} />);
    const css = container.querySelector("style")?.textContent ?? "";
    // The head crosses in 3 of 4 seconds and reaches the end a fifth of the way before the tail does.
    expect(css).toMatch(/@keyframes nk-sb-run-\w+ \{ 0% \{[^}]+\} 75%, 100%/);
    expect(css).toMatch(/@keyframes nk-sb-flash-\w+ \{ 0%, 59\.\d+%/);
  });

  it("holds each pulse still under reduced motion and pauses off screen", () => {
    const { container } = render(<Diagram />);
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.nk-signal-beam-pulse \{ animation: none; stroke-dashoffset: var\(--nk-sb-still\)/);
    const svg = container.querySelector("svg")!;
    expect(svg).not.toHaveAttribute("data-paused");
    act(() => intersection?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(svg).toHaveAttribute("data-paused");
    expect(css).toContain("[data-paused] .nk-signal-beam-pulse");
  });

  it("corrects for a scaled parent", () => {
    vi.spyOn(SVGSVGElement.prototype, "clientWidth", "get").mockReturnValue(200);
    const { container } = render(<Diagram gap={0} />);
    // Rects are twice the SVG's own pixels, so every coordinate halves.
    expect(tube(container).getAttribute("d")).toBe("M 30 50 Q 100 50 170 50");
  });
});
