import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Calendar } from "@/components/ui/calendar";

const day = (name: string) => screen.getByRole("gridcell", { name });
const press = (key: string, init: Partial<KeyboardEventInit> = {}) =>
  fireEvent.keyDown(document.activeElement as Element, { key, ...init });
const key = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;

describe("Calendar", () => {
  it("renders the month, weekday headers and a grid per month", () => {
    render(<Calendar defaultMonth={new Date(2026, 9, 1)} />);
    const grid = screen.getByRole("grid", { name: "October 2026" });
    const headers = within(grid).getAllByRole("columnheader");
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveAccessibleName("Sunday");
    expect(headers[6]).toHaveAccessibleName("Saturday");
  });

  it("takes the week start and names from the locale", () => {
    render(<Calendar locale="de-DE" defaultMonth={new Date(2026, 2, 1)} />);
    const grid = screen.getByRole("grid", { name: "März 2026" });
    expect(within(grid).getAllByRole("columnheader")[0]).toHaveAccessibleName("Montag");
  });

  it("lets weekStartsOn override the locale", () => {
    render(<Calendar weekStartsOn={1} defaultMonth={new Date(2026, 9, 1)} />);
    expect(screen.getAllByRole("columnheader")[0]).toHaveAccessibleName("Monday");
  });

  it("shows plain day numbers for locales that add a suffix", () => {
    render(<Calendar locale="ja-JP" defaultMonth={new Date(2026, 9, 1)} />);
    const grid = screen.getByRole("grid", { name: "2026年10月" });
    expect(within(grid).getAllByRole("gridcell").some((cell) => cell.textContent === "15")).toBe(true);
  });

  it("keeps exactly one day tabbable: the selected one", () => {
    render(<Calendar defaultSelected={new Date(2026, 9, 14)} />);
    const tabbable = screen.getAllByRole("gridcell").filter((cell) => cell.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("Wednesday, October 14, 2026");
    expect(tabbable[0]).toHaveAttribute("aria-selected", "true");
  });

  it("selects a day on click when uncontrolled", () => {
    const onSelect = vi.fn();
    render(<Calendar defaultMonth={new Date(2026, 9, 1)} onSelect={onSelect} />);
    fireEvent.click(day("Friday, October 9, 2026"));
    expect(day("Friday, October 9, 2026")).toHaveAttribute("aria-selected", "true");
    expect(key(onSelect.mock.calls[0][0])).toBe("2026-10-9 0:0");
  });

  it("stays put when controlled", () => {
    const onSelect = vi.fn();
    render(<Calendar selected={new Date(2026, 9, 2)} onSelect={onSelect} />);
    fireEvent.click(day("Monday, October 12, 2026"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(day("Monday, October 12, 2026")).toHaveAttribute("aria-selected", "false");
    expect(day("Friday, October 2, 2026")).toHaveAttribute("aria-selected", "true");
  });

  it("moves focus with the arrow keys, Home and End, and selects with Enter", () => {
    const onSelect = vi.fn();
    render(<Calendar defaultSelected={new Date(2026, 9, 14)} onSelect={onSelect} />);
    act(() => day("Wednesday, October 14, 2026").focus());

    press("ArrowRight");
    expect(document.activeElement).toHaveAccessibleName("Thursday, October 15, 2026");
    press("ArrowDown");
    expect(document.activeElement).toHaveAccessibleName("Thursday, October 22, 2026");
    press("ArrowLeft");
    press("ArrowUp");
    expect(document.activeElement).toHaveAccessibleName("Wednesday, October 14, 2026");
    press("Home");
    expect(document.activeElement).toHaveAccessibleName("Sunday, October 11, 2026");
    press("End");
    expect(document.activeElement).toHaveAccessibleName("Saturday, October 17, 2026");
    expect(document.activeElement).toHaveAttribute("tabindex", "0");

    press("Enter");
    expect(key(onSelect.mock.calls[0][0])).toBe("2026-10-17 0:0");
    press(" ");
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("follows the keyboard into the next month", () => {
    const onMonthChange = vi.fn();
    render(<Calendar defaultSelected={new Date(2026, 9, 30)} onMonthChange={onMonthChange} />);
    act(() => day("Friday, October 30, 2026").focus());
    press("ArrowDown");
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName("Friday, November 6, 2026");
    expect(key(onMonthChange.mock.calls[0][0])).toBe("2026-11-1 0:0");
  });

  it("clamps PageDown to the end of a shorter month", () => {
    render(<Calendar defaultSelected={new Date(2026, 0, 31)} />);
    act(() => day("Saturday, January 31, 2026").focus());
    press("PageDown");
    expect(document.activeElement).toHaveAccessibleName("Saturday, February 28, 2026");
    press("PageUp");
    expect(document.activeElement).toHaveAccessibleName("Wednesday, January 28, 2026");
  });

  it("moves a year with Shift+PageUp and lands Feb 29 on Feb 28", () => {
    render(<Calendar defaultSelected={new Date(2028, 1, 29)} />);
    act(() => day("Tuesday, February 29, 2028").focus());
    press("PageUp", { shiftKey: true });
    expect(screen.getByRole("grid", { name: "February 2027" })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName("Sunday, February 28, 2027");
    press("PageDown", { shiftKey: true });
    expect(document.activeElement).toHaveAccessibleName("Monday, February 28, 2028");
  });

  it("skips disabled days and refuses to select them", () => {
    const onSelect = vi.fn();
    const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    render(<Calendar defaultSelected={new Date(2026, 9, 16)} disabled={weekend} onSelect={onSelect} />);
    const saturday = day("Saturday, October 17, 2026");
    expect(saturday).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(saturday);
    expect(onSelect).not.toHaveBeenCalled();

    act(() => day("Friday, October 16, 2026").focus());
    press("ArrowRight");
    expect(document.activeElement).toHaveAccessibleName("Monday, October 19, 2026");
  });

  it("respects minDate and maxDate, including the month buttons", () => {
    render(
      <Calendar
        defaultMonth={new Date(2027, 2, 1)}
        minDate={new Date(2027, 2, 5)}
        maxDate={new Date(2027, 3, 20)}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    expect(day("Thursday, March 4, 2027")).toHaveAttribute("aria-disabled", "true");
    // The first day that can be picked takes the tab stop.
    expect(day("Friday, March 5, 2027")).toHaveAttribute("tabindex", "0");

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    act(() => day("Tuesday, April 20, 2027").focus());
    press("ArrowRight");
    expect(document.activeElement).toHaveAccessibleName("Tuesday, April 20, 2027");
  });

  it("pages months with the buttons and reports the first of the month", () => {
    const onMonthChange = vi.fn();
    render(<Calendar defaultMonth={new Date(2026, 0, 15)} onMonthChange={onMonthChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: "December 2025" })).toBeInTheDocument();
    expect(key(onMonthChange.mock.calls[0][0])).toBe("2025-12-1 0:0");
  });

  it("only moves when the month is controlled and updated", () => {
    const onMonthChange = vi.fn();
    render(<Calendar month={new Date(2026, 4, 1)} onMonthChange={onMonthChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("grid", { name: "May 2026" })).toBeInTheDocument();
  });

  it("marks today with aria-current", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 11, 15, 30));
    render(<Calendar />);
    expect(day("Sunday, October 11, 2026")).toHaveAttribute("aria-current", "date");
    expect(day("Sunday, October 11, 2026")).toHaveAttribute("tabindex", "0");
    vi.useRealTimers();
  });

  it("renders several months and hides the days they share", () => {
    render(<Calendar numberOfMonths={2} defaultMonth={new Date(2026, 9, 1)} />);
    const october = screen.getByRole("grid", { name: "October 2026" });
    const november = screen.getByRole("grid", { name: "November 2026" });
    // November 1 lives in November's grid only.
    expect(within(october).queryByRole("gridcell", { name: "Sunday, November 1, 2026" })).toBeNull();
    expect(within(november).getByRole("gridcell", { name: "Sunday, November 1, 2026" })).toBeInTheDocument();
    expect(october).not.toHaveAttribute("aria-multiselectable");
  });

  it("hides outside days when asked", () => {
    render(<Calendar showOutsideDays={false} defaultMonth={new Date(2026, 9, 1)} />);
    expect(screen.queryByRole("gridcell", { name: "Wednesday, September 30, 2026" })).toBeNull();
  });

  it("applies an explicit color through --neon", () => {
    const { container } = render(<Calendar color="magenta" />);
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--neon")).toBe("240 70 235");
  });

  it("focuses the active day on mount with autoFocus", () => {
    render(<Calendar autoFocus defaultSelected={new Date(2026, 9, 14)} />);
    expect(document.activeElement).toHaveAccessibleName("Wednesday, October 14, 2026");
  });

  it("autofocuses without scrolling, so a calendar in an unplaced popover doesn't jump the page", () => {
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    render(<Calendar autoFocus defaultSelected={new Date(2026, 9, 14)} />);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    focus.mockRestore();
  });
});

describe("Calendar range", () => {
  it("picks a start, then an end, and selects every day between", () => {
    const onSelect = vi.fn();
    render(<Calendar mode="range" defaultMonth={new Date(2026, 9, 1)} onSelect={onSelect} />);
    expect(screen.getByRole("grid")).toHaveAttribute("aria-multiselectable", "true");

    fireEvent.click(day("Thursday, October 8, 2026"));
    expect(onSelect.mock.calls[0][0].to).toBeUndefined();
    fireEvent.click(day("Tuesday, October 13, 2026"));
    const { from, to } = onSelect.mock.calls[1][0];
    expect([key(from), key(to)]).toEqual(["2026-10-8 0:0", "2026-10-13 0:0"]);

    expect(day("Sunday, October 11, 2026")).toHaveAttribute("aria-selected", "true");
    expect(day("Wednesday, October 14, 2026")).toHaveAttribute("aria-selected", "false");
  });

  it("restarts when the second pick is before the start or after a full range", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="range"
        defaultSelected={{ from: new Date(2026, 9, 8) }}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(day("Monday, October 5, 2026"));
    expect(key(onSelect.mock.calls[0][0].from)).toBe("2026-10-5 0:0");
    expect(onSelect.mock.calls[0][0].to).toBeUndefined();

    fireEvent.click(day("Wednesday, October 7, 2026"));
    fireEvent.click(day("Friday, October 23, 2026"));
    expect(key(onSelect.mock.calls[2][0].from)).toBe("2026-10-23 0:0");
  });

  it("allows a one-day range", () => {
    const onSelect = vi.fn();
    render(<Calendar mode="range" defaultSelected={{ from: new Date(2026, 9, 8) }} onSelect={onSelect} />);
    fireEvent.click(day("Thursday, October 8, 2026"));
    expect(key(onSelect.mock.calls[0][0].to)).toBe("2026-10-8 0:0");
  });

  it("won't run a range across a disabled day", () => {
    const onSelect = vi.fn();
    const booked = (date: Date) => date.getMonth() === 9 && date.getDate() === 10;
    render(
      <Calendar
        mode="range"
        defaultSelected={{ from: new Date(2026, 9, 8) }}
        disabled={booked}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(day("Monday, October 12, 2026"));
    expect(key(onSelect.mock.calls[0][0].from)).toBe("2026-10-12 0:0");
    expect(onSelect.mock.calls[0][0].to).toBeUndefined();
  });

  it("completes a range from the keyboard", () => {
    const onSelect = vi.fn();
    render(<Calendar mode="range" defaultSelected={{ from: new Date(2026, 9, 8) }} onSelect={onSelect} />);
    act(() => day("Thursday, October 8, 2026").focus());
    press("ArrowDown");
    press("Enter");
    expect(key(onSelect.mock.calls[0][0].to)).toBe("2026-10-15 0:0");
  });
});

describe("Calendar multiple", () => {
  it("toggles days in and out, sorted", () => {
    const onSelect = vi.fn();
    render(<Calendar mode="multiple" defaultMonth={new Date(2026, 9, 1)} onSelect={onSelect} />);
    fireEvent.click(day("Thursday, October 15, 2026"));
    fireEvent.click(day("Monday, October 5, 2026"));
    expect(onSelect.mock.calls[1][0].map(key)).toEqual(["2026-10-5 0:0", "2026-10-15 0:0"]);
    fireEvent.click(day("Thursday, October 15, 2026"));
    expect(onSelect.mock.calls[2][0].map(key)).toEqual(["2026-10-5 0:0"]);
    expect(day("Thursday, October 15, 2026")).toHaveAttribute("aria-selected", "false");
  });
});

describe.each([
  // Clocks fall back at 2:00 on Nov 1, so that day has 25 hours.
  ["America/New_York", [2026, 10, 1], "Sunday, November 1, 2026", "Monday, November 2, 2026"],
  // Clocks spring forward at midnight on Nov 4, so 00:00 never happens that day.
  ["America/Sao_Paulo", [2018, 10, 3], "Saturday, November 3, 2018", "Sunday, November 4, 2018"],
] as const)("Calendar across a DST change in %s", (zone, [year, month, date], startName, nextName) => {
  const original = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = zone;
  });
  afterAll(() => {
    process.env.TZ = original;
  });

  it("renders every day of the month exactly once", () => {
    render(<Calendar defaultMonth={new Date(year, month, 1)} showOutsideDays={false} />);
    const days = screen
      .getAllByRole("gridcell")
      .map((cell) => cell.getAttribute("data-day"))
      .filter(Boolean);
    expect(days).toHaveLength(30);
    expect(new Set(days).size).toBe(30);
  });

  it("steps one day at a time with the arrow keys", () => {
    render(<Calendar defaultSelected={new Date(year, month, date)} />);
    act(() => day(startName).focus());
    press("ArrowRight");
    expect(document.activeElement).toHaveAccessibleName(nextName);
    press("ArrowRight");
    press("ArrowLeft");
    expect(document.activeElement).toHaveAccessibleName(nextName);
    press("ArrowDown");
    press("ArrowUp");
    expect(document.activeElement).toHaveAccessibleName(nextName);
  });

  it("selects local midnight even when midnight is skipped", () => {
    const onSelect = vi.fn();
    render(<Calendar defaultMonth={new Date(year, month, 1)} onSelect={onSelect} />);
    fireEvent.click(day(nextName));
    const picked: Date = onSelect.mock.calls[0][0];
    expect(picked.getDate()).toBe(date + 1);
    expect(picked.getHours()).toBeLessThanOrEqual(1);
  });
});
