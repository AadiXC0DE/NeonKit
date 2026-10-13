import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimeInput } from "@/components/ui/time-input";

const segment = (name: string) => screen.getByRole("spinbutton", { name });
const type = (keys: string) => {
  for (const key of keys) fireEvent.keyDown(document.activeElement as Element, { key });
};
const press = (key: string) => fireEvent.keyDown(document.activeElement as Element, { key });

describe("TimeInput", () => {
  it("renders a labelled group of spinbuttons with placeholders", () => {
    render(<TimeInput label="Alarm" hourCycle={12} />);
    expect(screen.getByRole("group", { name: "Alarm" })).toBeInTheDocument();
    const hours = segment("Hours");
    expect(hours).toHaveTextContent("--");
    expect(hours).toHaveAttribute("aria-valuetext", "Empty");
    expect(hours).toHaveAttribute("aria-valuemin", "1");
    expect(hours).toHaveAttribute("aria-valuemax", "12");
    expect(segment("Minutes")).toBeInTheDocument();
    expect(segment("AM/PM")).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "Seconds" })).toBeNull();
  });

  it("takes the clock from the locale unless hourCycle is set", () => {
    const { unmount } = render(<TimeInput aria-label="Start" locale="de-DE" />);
    expect(screen.queryByRole("spinbutton", { name: "AM/PM" })).toBeNull();
    expect(segment("Hours")).toHaveAttribute("aria-valuemax", "23");
    unmount();
    render(<TimeInput aria-label="Start" locale="en-US" />);
    expect(segment("AM/PM")).toBeInTheDocument();
  });

  it("puts the day period first where the locale does", () => {
    render(<TimeInput aria-label="Start" locale="ko-KR" hourCycle={12} defaultValue="09:00" />);
    const parts = screen.getAllByRole("spinbutton").map((node) => node.getAttribute("aria-label"));
    expect(parts).toEqual(["AM/PM", "Hours", "Minutes"]);
    expect(segment("AM/PM")).toHaveTextContent("오전");
  });

  it("fills segments from typed digits and advances on its own", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={12} onValueChange={onValueChange} />);
    act(() => segment("Hours").focus());
    type("9");
    expect(segment("Hours")).toHaveTextContent("09");
    expect(document.activeElement).toBe(segment("Minutes"));
    type("45");
    expect(document.activeElement).toBe(segment("AM/PM"));
    expect(onValueChange).not.toHaveBeenCalled();
    type("p");
    expect(segment("AM/PM")).toHaveTextContent("PM");
    expect(onValueChange).toHaveBeenLastCalledWith("21:45");
  });

  it("waits for a second digit when one could follow", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={24} onValueChange={onValueChange} />);
    act(() => segment("Hours").focus());
    type("1");
    expect(document.activeElement).toBe(segment("Hours"));
    type("4");
    expect(document.activeElement).toBe(segment("Minutes"));
    type("3");
    expect(segment("Minutes")).toHaveTextContent("03");
    type("0");
    expect(onValueChange).toHaveBeenLastCalledWith("14:30");
  });

  it("starts over when the second digit would overflow", () => {
    render(<TimeInput aria-label="Start" hourCycle={12} />);
    act(() => segment("Hours").focus());
    type("13");
    expect(segment("Hours")).toHaveTextContent("03");
    expect(document.activeElement).toBe(segment("Minutes"));
  });

  it("reads 00 as 12 on a 12-hour clock", () => {
    render(<TimeInput aria-label="Start" hourCycle={12} />);
    act(() => segment("Hours").focus());
    type("00");
    expect(segment("Hours")).toHaveTextContent("12");
  });

  it("moves on with a separator key", () => {
    render(<TimeInput aria-label="Start" hourCycle={24} />);
    act(() => segment("Hours").focus());
    type("1:");
    expect(segment("Hours")).toHaveTextContent("01");
    expect(document.activeElement).toBe(segment("Minutes"));
  });

  it("increments and wraps with the arrow keys", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={24} defaultValue="23:59" onValueChange={onValueChange} />);
    act(() => segment("Minutes").focus());
    press("ArrowUp");
    expect(segment("Minutes")).toHaveTextContent("00");
    expect(onValueChange).toHaveBeenLastCalledWith("23:00");
    press("ArrowLeft");
    expect(document.activeElement).toBe(segment("Hours"));
    press("ArrowUp");
    expect(segment("Hours")).toHaveTextContent("00");
    press("ArrowDown");
    expect(segment("Hours")).toHaveTextContent("23");
  });

  it("wraps 12-hour hours from 12 to 1 and toggles the period", () => {
    render(<TimeInput aria-label="Start" hourCycle={12} defaultValue="12:00" />);
    act(() => segment("Hours").focus());
    press("ArrowUp");
    expect(segment("Hours")).toHaveTextContent("01");
    act(() => segment("AM/PM").focus());
    press("ArrowDown");
    expect(segment("AM/PM")).toHaveTextContent("AM");
  });

  it("steps minutes by minuteStep and snaps to it", () => {
    render(<TimeInput aria-label="Start" hourCycle={24} defaultValue="10:07" minuteStep={15} />);
    act(() => segment("Minutes").focus());
    press("ArrowUp");
    expect(segment("Minutes")).toHaveTextContent("15");
    press("ArrowDown");
    press("ArrowDown");
    expect(segment("Minutes")).toHaveTextContent("45");
    press("End");
    expect(segment("Minutes")).toHaveTextContent("45");
    press("Home");
    expect(segment("Minutes")).toHaveTextContent("00");
  });

  it("starts an empty segment at the bottom or top of its range", () => {
    render(<TimeInput aria-label="Start" hourCycle={24} />);
    act(() => segment("Hours").focus());
    press("ArrowUp");
    expect(segment("Hours")).toHaveTextContent("00");
    act(() => segment("Minutes").focus());
    press("ArrowDown");
    expect(segment("Minutes")).toHaveTextContent("59");
  });

  it("clears with Backspace, then steps back to the previous segment", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={24} defaultValue="08:15" onValueChange={onValueChange} />);
    act(() => segment("Minutes").focus());
    press("Backspace");
    expect(segment("Minutes")).toHaveTextContent("--");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    press("Backspace");
    expect(document.activeElement).toBe(segment("Hours"));
  });

  it("includes seconds when shown", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={24} showSeconds defaultValue="07:05:09" onValueChange={onValueChange} />);
    expect(segment("Seconds")).toHaveTextContent("09");
    act(() => segment("Seconds").focus());
    press("ArrowUp");
    expect(onValueChange).toHaveBeenLastCalledWith("07:05:10");
  });

  it("follows a controlled value", () => {
    const { rerender } = render(<TimeInput aria-label="Start" hourCycle={24} value="09:30" />);
    expect(segment("Hours")).toHaveTextContent("09");
    rerender(<TimeInput aria-label="Start" hourCycle={24} value="18:05" />);
    expect(segment("Hours")).toHaveTextContent("18");
    expect(segment("Minutes")).toHaveTextContent("05");
    rerender(<TimeInput aria-label="Start" hourCycle={24} value="" />);
    expect(segment("Hours")).toHaveTextContent("--");
  });

  it("fills every segment from pasted text", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={24} onValueChange={onValueChange} />);
    fireEvent.paste(segment("Hours"), { clipboardData: { getData: () => "2:30 pm" } });
    expect(onValueChange).toHaveBeenLastCalledWith("14:30");
    expect(segment("Hours")).toHaveTextContent("14");
  });

  it("scrubs a segment by dragging it vertically", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={24} defaultValue="10:30" onValueChange={onValueChange} />);
    const minutes = segment("Minutes");
    fireEvent.pointerDown(minutes, { pointerId: 1, button: 0, clientY: 100 });
    fireEvent.pointerMove(minutes, { pointerId: 1, clientY: 70 });
    fireEvent.pointerUp(minutes, { pointerId: 1, clientY: 70 });
    expect(onValueChange).toHaveBeenLastCalledWith("10:33");
  });

  it("submits with forms when named, and on Enter", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const { container } = render(
      <form onSubmit={onSubmit}>
        <TimeInput aria-label="Start" hourCycle={12} name="start" defaultValue="16:20" />
      </form>,
    );
    expect(container.querySelector<HTMLInputElement>('input[name="start"]')?.value).toBe("16:20");
    act(() => segment("Hours").focus());
    press("Enter");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("wires the error message and invalid state", () => {
    render(<TimeInput label="Pickup" hourCycle={24} error="The shop opens at 8:00." description="Hidden" />);
    const hours = segment("Hours");
    expect(hours).toHaveAttribute("aria-invalid", "true");
    expect(hours).toHaveAccessibleDescription("The shop opens at 8:00.");
    expect(screen.queryByText("Hidden")).toBeNull();
    expect(screen.getByRole("group").style.getPropertyValue("--neon")).toBe("255 77 94");
  });

  it("takes segments out of the tab order when disabled", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" hourCycle={24} disabled defaultValue="10:00" onValueChange={onValueChange} />);
    const hours = segment("Hours");
    expect(hours).toHaveAttribute("tabindex", "-1");
    expect(hours).toHaveAttribute("aria-disabled", "true");
    fireEvent.keyDown(hours, { key: "ArrowUp" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("focuses the first segment from its label", () => {
    render(<TimeInput label="Doors open" hourCycle={24} />);
    fireEvent.click(screen.getByText("Doors open"));
    expect(document.activeElement).toBe(segment("Hours"));
  });

  it("applies an explicit color through --neon", () => {
    render(<TimeInput aria-label="Start" color="lime" />);
    // Set on the outer block, so the label's required dot shares the color.
    expect(screen.getByRole("group").parentElement?.style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});
