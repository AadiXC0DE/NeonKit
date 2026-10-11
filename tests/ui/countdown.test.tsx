import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Countdown } from "@/components/ui/countdown";

const NOW = new Date("2026-10-11T12:00:00Z").getTime();
const spoken = () => screen.getByRole("timer").querySelector(".sr-only")?.textContent;
const tick = (ms = 0) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("is a timer that renders placeholders until the first tick", () => {
    render(<Countdown to={NOW + 5000} variant="digital" />);
    expect(screen.getByRole("timer")).toBeInTheDocument();
    expect(spoken()).toBe("");
    tick();
    expect(spoken()).toBe("0 days, 0 hours, 0 minutes, 5 seconds");
  });

  it("splits the remaining time into units", () => {
    render(<Countdown to={new Date(NOW + ((2 * 24 + 14) * 3600 + 7 * 60 + 33) * 1000)} />);
    tick();
    expect(spoken()).toBe("2 days, 14 hours, 7 minutes, 33 seconds");
  });

  it("uses singular words for one", () => {
    render(<Countdown to={NOW + (86400 + 3600 + 60 + 1) * 1000} />);
    tick();
    expect(spoken()).toBe("1 day, 1 hour, 1 minute, 1 second");
  });

  it("accepts ISO strings", () => {
    render(<Countdown to="2026-10-11T12:01:30Z" units={["minutes", "seconds"]} />);
    tick();
    expect(spoken()).toBe("1 minute, 30 seconds");
  });

  it("lets the largest unit carry the overflow", () => {
    render(<Countdown to={NOW + 50 * 3600 * 1000} units={["hours", "minutes", "seconds"]} />);
    tick();
    expect(spoken()).toBe("50 hours, 0 minutes, 0 seconds");
  });

  it("counts down once a second", () => {
    render(<Countdown to={NOW + 3000} units={["seconds"]} />);
    tick();
    expect(spoken()).toBe("3 seconds");
    // Each tick lands just after the whole second.
    tick(1010);
    expect(spoken()).toBe("2 seconds");
    tick(1000);
    expect(spoken()).toBe("1 second");
  });

  it("calls onComplete once at zero", () => {
    const onComplete = vi.fn();
    render(<Countdown to={NOW + 2000} onComplete={onComplete} />);
    tick();
    expect(onComplete).not.toHaveBeenCalled();
    tick(2100);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(spoken()).toBe("0 days, 0 hours, 0 minutes, 0 seconds");
    tick(5000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("completes straight away when the moment has passed", () => {
    const onComplete = vi.fn();
    render(<Countdown to={NOW - 60_000} onComplete={onComplete} />);
    tick();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows, renames or hides the captions", () => {
    const { rerender } = render(<Countdown to={NOW + 61_000} units={["minutes", "seconds"]} />);
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    rerender(<Countdown to={NOW + 61_000} units={["minutes", "seconds"]} labels={{ minutes: "Min", seconds: "Sec" }} />);
    expect(screen.getByText("Min")).toBeInTheDocument();
    tick();
    expect(spoken()).toBe("1 Min, 1 Sec");
    rerender(<Countdown to={NOW + 61_000} units={["minutes", "seconds"]} labels={false} />);
    expect(screen.queryByText("Min")).toBeNull();
  });

  it("renders each variant's digits", () => {
    const { container, rerender } = render(<Countdown to={NOW + 42_000} units={["seconds"]} variant="flip" />);
    tick();
    expect(container.textContent).toContain("42");
    rerender(<Countdown to={NOW + 42_000} units={["seconds"]} variant="digital" />);
    expect(container.querySelectorAll("svg")).toHaveLength(4);
    rerender(<Countdown to={NOW + 42_000} units={["seconds"]} variant="sign" />);
    expect(container.querySelectorAll("svg path")).toHaveLength(4);
  });

  it("takes a color and a name", () => {
    render(<Countdown to={NOW} color="amber" aria-label="Doors open in" />);
    const timer = screen.getByRole("timer", { name: "Doors open in" });
    expect(timer.style.getPropertyValue("--neon")).toBe("251 191 36");
  });
});
