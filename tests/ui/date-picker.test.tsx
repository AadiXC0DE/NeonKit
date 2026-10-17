import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { DatePicker } from "@/components/ui/date-picker";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const day = (name: string) => screen.getByRole("gridcell", { name });
const iso = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

describe("DatePicker", () => {
  it("renders a labelled trigger that reads the value", () => {
    render(<DatePicker label="Departure" defaultValue={new Date(2026, 9, 14)} />);
    const trigger = screen.getByRole("button", { name: "Departure Oct 14, 2026" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the visible date in the name when labelled with aria-label", () => {
    render(<DatePicker aria-label="Start date" defaultValue={new Date(2026, 9, 12)} />);
    expect(screen.getByRole("button", { name: "Start date Oct 12, 2026" })).toBeInTheDocument();
  });

  it("shows the placeholder with nothing picked and no clear button", () => {
    render(<DatePicker label="Departure" placeholder="Any day" />);
    expect(screen.getByRole("button", { name: "Departure Any day" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  });

  it("opens the calendar on the value's month and focuses the picked day", async () => {
    render(<DatePicker label="Departure" defaultValue={new Date(2027, 2, 9)} />);
    fireEvent.click(screen.getByRole("button", { name: /Departure/ }));
    expect(screen.getByRole("dialog", { name: /Departure/ })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "March 2027" })).toBeInTheDocument();
    await waitFor(() => expect(day("Tuesday, March 9, 2027")).toHaveFocus());
  });

  it("picks a day, reports it, closes and refocuses the trigger", async () => {
    const onValueChange = vi.fn();
    render(<DatePicker label="Departure" defaultValue={new Date(2027, 2, 9)} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: /Departure/ });
    fireEvent.click(trigger);
    fireEvent.click(day("Friday, March 19, 2027"));
    expect(iso(onValueChange.mock.calls[0][0])).toBe("2027-3-19");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveAccessibleName("Departure Mar 19, 2027");
  });

  it("opens with ArrowDown and closes with Escape", async () => {
    render(<DatePicker label="Departure" defaultValue={new Date(2027, 2, 9)} />);
    const trigger = screen.getByRole("button", { name: /Departure/ });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await waitFor(() => expect(day("Tuesday, March 9, 2027")).toHaveFocus());
    fireEvent.keyDown(day("Tuesday, March 9, 2027"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it("clears the value", () => {
    const onValueChange = vi.fn();
    render(<DatePicker label="Departure" defaultValue={new Date(2027, 2, 9)} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(screen.getByRole("button", { name: "Departure Pick a date" })).toHaveFocus();
  });

  it("stays put when controlled", () => {
    render(<DatePicker label="Departure" value={new Date(2027, 2, 9)} />);
    fireEvent.click(screen.getByRole("button", { name: /Departure/ }));
    fireEvent.click(day("Friday, March 19, 2027"));
    expect(screen.getByRole("button", { name: /Departure/ })).toHaveAccessibleName("Departure Mar 9, 2027");
  });

  it("formats with formatOptions and locale", () => {
    render(
      <DatePicker
        label="Abreise"
        locale="de-DE"
        formatOptions={{ weekday: "long", day: "numeric", month: "long" }}
        defaultValue={new Date(2027, 2, 9)}
      />,
    );
    expect(screen.getByRole("button", { name: "Abreise Dienstag, 9. März" })).toBeInTheDocument();
  });

  it("submits yyyy-mm-dd when named", () => {
    const { container } = render(<DatePicker name="due" aria-label="Due" defaultValue={new Date(2027, 0, 5)} />);
    expect(container.querySelector<HTMLInputElement>('input[name="due"]')?.value).toBe("2027-01-05");
  });

  it("wires the error message and keeps the panel out of the red", () => {
    render(<DatePicker label="Expiry" error="Must be six months out." color="violet" />);
    const trigger = screen.getByRole("button", { name: /Expiry/ });
    expect(trigger).toHaveAccessibleDescription("Must be six months out.");
    const field = trigger.parentElement as HTMLElement;
    expect(field.style.getPropertyValue("--neon")).toBe("255 77 94");
    // The trigger resets --neon to the accent, which the popover copies.
    expect(trigger.className).toContain("[--neon:var(--neon-accent,34_211_238)]");
  });

  it("does nothing when disabled", () => {
    render(<DatePicker label="Ship date" disabled defaultValue={new Date(2027, 0, 5)} />);
    const trigger = screen.getByRole("button", { name: /Ship date/ });
    expect(trigger).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  });

  it("focuses the trigger from its label without opening", () => {
    render(<DatePicker label="Departure" />);
    fireEvent.click(screen.getByText("Departure"));
    expect(screen.getByRole("button", { name: /Departure/ })).toHaveFocus();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("applies presets and marks the active one", async () => {
    const onValueChange = vi.fn();
    const launch = new Date(2027, 4, 4);
    render(
      <DatePicker
        label="Launch"
        onValueChange={onValueChange}
        presets={[
          { label: "Launch day", value: launch },
          { label: "Day after", value: new Date(2027, 4, 5) },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Launch/ }));
    fireEvent.click(screen.getByRole("button", { name: "Launch day" }));
    expect(iso(onValueChange.mock.calls[0][0])).toBe("2027-5-4");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /Launch/ }));
    expect(screen.getByRole("button", { name: "Launch day" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("grid", { name: "May 2027" })).toBeInTheDocument();
  });
});

describe("DatePicker range", () => {
  it("keeps the first pick as a draft and commits on the second", async () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker
        mode="range"
        label="Stay"
        defaultValue={{ from: new Date(2027, 2, 9), to: new Date(2027, 2, 12) }}
        onValueChange={onValueChange}
        numberOfMonths={1}
      />,
    );
    const trigger = screen.getByRole("button", { name: /^Stay Mar 9\s–\s12, 2027$/ });
    fireEvent.click(trigger);
    fireEvent.click(day("Monday, March 15, 2027"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Pick the last day/)).toBeInTheDocument();

    fireEvent.click(day("Friday, March 19, 2027"));
    const { from, to } = onValueChange.mock.calls[0][0];
    expect([iso(from), iso(to)]).toEqual(["2027-3-15", "2027-3-19"]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // Intl puts thin spaces around the dash.
    expect(trigger).toHaveAccessibleName(/^Stay Mar 15\s–\s19, 2027$/);
  });

  it("drops an unfinished range when it closes", async () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker
        mode="range"
        label="Stay"
        defaultValue={{ from: new Date(2027, 2, 9), to: new Date(2027, 2, 12) }}
        onValueChange={onValueChange}
        numberOfMonths={1}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Stay/ }));
    fireEvent.click(day("Monday, March 15, 2027"));
    fireEvent.keyDown(day("Monday, March 15, 2027"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Stay/ }));
    expect(day("Wednesday, March 10, 2027")).toHaveAttribute("aria-selected", "true");
  });

  it("submits an ISO interval when named", () => {
    const { container } = render(
      <DatePicker
        mode="range"
        name="stay"
        aria-label="Stay"
        defaultValue={{ from: new Date(2027, 2, 9), to: new Date(2027, 2, 12) }}
      />,
    );
    expect(container.querySelector<HTMLInputElement>('input[name="stay"]')?.value).toBe("2027-03-09/2027-03-12");
    expect(screen.getByRole("button", { name: "Clear dates" })).toBeInTheDocument();
  });
});
