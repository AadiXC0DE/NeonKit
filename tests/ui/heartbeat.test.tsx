import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Heartbeat } from "@/components/ui/heartbeat";

// jsdom has no layout; give the strip a width so it draws.
function withWidth(width: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width,
    height: 96,
    top: 0,
    left: 0,
    right: width,
    bottom: 96,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe("Heartbeat", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("reads out the rate", () => {
    const { rerender } = render(<Heartbeat bpm={71.6} />);
    expect(screen.getByRole("img", { name: "Heart rate 72 beats per minute" })).toBeInTheDocument();
    rerender(<Heartbeat bpm={0} />);
    expect(screen.getByRole("img", { name: "Flat line, no heart rate" })).toBeInTheDocument();
  });

  it("lets aria-label describe something else", () => {
    render(<Heartbeat aria-label="API is up" />);
    expect(screen.getByRole("img", { name: "API is up" })).toBeInTheDocument();
  });

  it("sets its height and color", () => {
    render(<Heartbeat height={40} color="red" />);
    const root = screen.getByRole("img");
    expect(root.style.height).toBe("40px");
    expect(root.style.getPropertyValue("--neon")).toBe("255 77 94");
  });

  it("draws the strip once it knows its width", () => {
    withWidth(400);
    const { container } = render(<Heartbeat />);
    const paths = container.querySelectorAll("path");
    // Halo, glow and core, each drawn for the screen and its wrapped copy.
    expect(paths).toHaveLength(6);
    expect(paths[0].getAttribute("d")).toMatch(/^M0\.0 [\d.]+L/);
  });

  it("calls onBeat as R peaks pass the dot", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    withWidth(400);
    const onBeat = vi.fn();
    render(<Heartbeat bpm={120} onBeat={onBeat} />);
    vi.advanceTimersByTime(3000);
    // Two beats a second, give or take the starting position.
    expect(onBeat.mock.calls.length).toBeGreaterThanOrEqual(5);
    expect(onBeat.mock.calls.length).toBeLessThanOrEqual(7);
  });

  it("stays flat and quiet at zero bpm", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    withWidth(300);
    const onBeat = vi.fn();
    const { container } = render(<Heartbeat bpm={0} onBeat={onBeat} />);
    vi.advanceTimersByTime(2000);
    expect(onBeat).not.toHaveBeenCalled();
    expect(container.querySelector("path")?.getAttribute("d")).toMatch(/^M0 [\d.]+H600/);
  });
});
