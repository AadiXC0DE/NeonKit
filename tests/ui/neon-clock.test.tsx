import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NeonClock } from "@/components/ui/neon-clock";

// 03:04:05 UTC is 12:04:05 in Tokyo.
const NOW = new Date("2026-10-11T03:04:05Z");
const spoken = () => screen.getByRole("timer").querySelector(".sr-only")?.textContent;
const face = () => screen.getByRole("timer").querySelector<HTMLElement>(".nk-neon-clock-face");
const digits = () =>
  Array.from(face()?.querySelectorAll<HTMLElement>("[data-digit]") ?? [])
    .map((digit) => (digit.style.display === "none" ? "" : digit.textContent))
    .join("");
const tick = (ms = 0) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("NeonClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("is a timer named by its label", () => {
    render(<NeonClock label="Tokyo" timeZone="Asia/Tokyo" />);
    expect(screen.getByRole("timer", { name: "Tokyo" })).toBeInTheDocument();
  });

  it("renders nothing time-based until the first tick", () => {
    render(<NeonClock variant="digital" timeZone="Asia/Tokyo" hourCycle={24} />);
    expect(spoken()).toBe("");
    expect(digits()).toBe("------");
    expect(face()).not.toHaveAttribute("data-lit");
  });

  it("shows the time in a time zone", () => {
    render(<NeonClock variant="digital" timeZone="Asia/Tokyo" hourCycle={24} />);
    tick();
    expect(spoken()).toBe("12:04:05");
    expect(digits()).toBe("120405");
    expect(face()).toHaveAttribute("data-lit");
  });

  it("updates every second without React re-rendering", () => {
    render(<NeonClock variant="digital" timeZone="Asia/Tokyo" hourCycle={24} />);
    tick();
    // Each tick lands just after the whole second.
    tick(1010);
    expect(spoken()).toBe("12:04:06");
    tick(55_000);
    expect(spoken()).toBe("12:05:01");
  });

  it("uses a 12-hour cycle with AM/PM and no leading zero", () => {
    render(<NeonClock variant="digital" timeZone="UTC" hourCycle={12} />);
    tick();
    expect(spoken()).toBe("3:04:05 AM");
    const meridiem = face()?.lastElementChild as HTMLElement;
    expect(meridiem).not.toHaveAttribute("hidden");
    expect(meridiem.textContent).toBe("AM");
    expect(digits()).toBe("30405");
  });

  it("drops the seconds when asked", () => {
    render(<NeonClock variant="digital" timeZone="Asia/Tokyo" hourCycle={24} showSeconds={false} />);
    tick();
    expect(spoken()).toBe("12:04");
    expect(digits()).toBe("1204");
  });

  it("blinks the colon on the second", () => {
    render(<NeonClock variant="digital" timeZone="Asia/Tokyo" hourCycle={24} />);
    tick();
    const colon = face()?.querySelector(".nk-neon-clock-colon");
    expect(colon).not.toHaveAttribute("data-off");
    tick(600);
    expect(colon).toHaveAttribute("data-off");
  });

  it("lights the hands and turns them to the time", () => {
    const { container } = render(<NeonClock timeZone="Asia/Tokyo" />);
    const hands = container.querySelector("svg g.nk-neon-clock-dark");
    expect(hands).not.toBeNull();
    tick();
    expect(hands).toHaveClass("nk-neon-clock-lit");
    const [hour, minute, second] = Array.from(hands!.children) as SVGGElement[];
    // From the 10:10:30 pose the hands only move forward: 12:04:05 is 57° further for the hour hand.
    expect(hour.style.transform).toMatch(/^rotate\(362\.04/);
    expect(minute.style.transform).toBe("rotate(384.5deg)");
    expect(second.style.transform).toBe("rotate(390deg)");
    tick(1010);
    expect(second.style.transform).toBe("rotate(396deg)");
  });

  it("keeps turning forward when props change", () => {
    const { container, rerender } = render(<NeonClock timeZone="Asia/Tokyo" />);
    tick();
    const hour = () => container.querySelector<SVGGElement>("svg g.nk-neon-clock-lit > g");
    const before = parseFloat(hour()!.style.transform.slice(7));
    rerender(<NeonClock timeZone="Asia/Tokyo" showSeconds={false} />);
    tick();
    expect(parseFloat(hour()!.style.transform.slice(7))).toBeCloseTo(before, 1);
  });

  it("leaves out the seconds hand", () => {
    const { container } = render(<NeonClock timeZone="Asia/Tokyo" showSeconds={false} />);
    expect(container.querySelector("svg g.nk-neon-clock-dark")?.children).toHaveLength(2);
  });

  it("falls back to local time for an unknown zone", () => {
    expect(() => {
      render(<NeonClock variant="digital" timeZone="Mars/Olympus" hourCycle={24} />);
      tick();
    }).not.toThrow();
    expect(spoken()).toMatch(/^\d\d:\d\d:\d\d$/);
  });

  it("takes a color", () => {
    render(<NeonClock color="pink" />);
    expect(screen.getByRole("timer").style.getPropertyValue("--neon")).toBe("255 95 162");
  });
});
