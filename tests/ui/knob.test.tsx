import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Knob } from "@/components/ui/knob";

describe("Knob", () => {
  it("is a slider with a range and a name from its label", () => {
    render(<Knob label="Cutoff" defaultValue={40} />);
    const knob = screen.getByRole("slider", { name: "Cutoff" });
    expect(knob).toHaveAttribute("aria-valuemin", "0");
    expect(knob).toHaveAttribute("aria-valuemax", "100");
    expect(knob).toHaveAttribute("aria-valuenow", "40");
    expect(knob).toHaveAttribute("tabindex", "0");
    expect(knob).not.toHaveAttribute("aria-valuetext");
  });

  it("prefers aria-label over the visible legend", () => {
    render(<Knob label="A" aria-label="Attack" />);
    expect(screen.getByRole("slider", { name: "Attack" })).toBeInTheDocument();
  });

  it("reads and prints the formatted value", () => {
    render(<Knob aria-label="Pan" min={-50} max={50} defaultValue={-12} showValue formatValue={(v) => `L${-v}`} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "L12");
    expect(screen.getByText("L12")).toBeInTheDocument();
  });

  it("moves with arrows, Shift, Page keys, Home and End", () => {
    const onValueChange = vi.fn();
    render(<Knob aria-label="Level" defaultValue={50} onValueChange={onValueChange} />);
    const knob = screen.getByRole("slider");
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    fireEvent.keyDown(knob, { key: "ArrowLeft" });
    fireEvent.keyDown(knob, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(knob, { key: "PageDown" });
    fireEvent.keyDown(knob, { key: "End" });
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    fireEvent.keyDown(knob, { key: "Home" });
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([51, 50, 60, 50, 100, 0]);
    expect(knob).toHaveAttribute("aria-valuenow", "0");
  });

  it("snaps keyboard moves to the step", () => {
    render(<Knob aria-label="Ratio" min={1} max={20} step={0.5} defaultValue={4} />);
    const knob = screen.getByRole("slider");
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    expect(knob).toHaveAttribute("aria-valuenow", "4.5");
    fireEvent.keyDown(knob, { key: "PageUp" });
    expect(knob).toHaveAttribute("aria-valuenow", "6.5");
  });

  it("commits once when the key is released", () => {
    const onValueCommit = vi.fn();
    render(<Knob aria-label="Level" defaultValue={10} onValueCommit={onValueCommit} />);
    const knob = screen.getByRole("slider");
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    expect(onValueCommit).not.toHaveBeenCalled();
    fireEvent.keyUp(knob, { key: "ArrowUp" });
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(12);
  });

  it("turns with a vertical drag, finer with Shift", () => {
    const onValueCommit = vi.fn();
    render(<Knob aria-label="Level" defaultValue={50} onValueCommit={onValueCommit} />);
    const knob = screen.getByRole("slider");
    // md: 200px of travel sweeps the whole range.
    fireEvent.pointerDown(knob, { pointerId: 1, button: 0, clientY: 300 });
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 280 });
    expect(knob).toHaveAttribute("aria-valuenow", "60");
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 260, shiftKey: true });
    expect(knob).toHaveAttribute("aria-valuenow", "61");
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 400 });
    expect(knob).toHaveAttribute("aria-valuenow", "0");
    fireEvent.pointerUp(knob, { pointerId: 1 });
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(0);
  });

  it("catches on a detent while dragging", () => {
    render(<Knob aria-label="Pan" min={-50} max={50} defaultValue={-10} detents={[0]} />);
    const knob = screen.getByRole("slider");
    fireEvent.pointerDown(knob, { pointerId: 1, button: 0, clientY: 300 });
    // 16px is 8 units: raw -2 is within the detent's reach of 3.
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 284 });
    expect(knob).toHaveAttribute("aria-valuenow", "0");
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 280 });
    expect(knob).toHaveAttribute("aria-valuenow", "0");
    // Still inside the reach at raw 2, out of it at raw 5.
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 276 });
    expect(knob).toHaveAttribute("aria-valuenow", "0");
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 270 });
    expect(knob).toHaveAttribute("aria-valuenow", "5");
  });

  it("turns with the wheel once focused, when the scroll starts on it", () => {
    render(<Knob aria-label="Level" defaultValue={50} />);
    const knob = screen.getByRole("slider");
    knob.focus();
    fireEvent.wheel(knob, { deltaY: -100 });
    expect(knob).toHaveAttribute("aria-valuenow", "55");
  });

  it("commits a wheel gesture once it settles", () => {
    vi.useFakeTimers();
    const onValueCommit = vi.fn();
    render(<Knob aria-label="Level" defaultValue={50} onValueCommit={onValueCommit} />);
    const knob = screen.getByRole("slider");
    knob.focus();
    fireEvent.wheel(knob, { deltaY: -100 });
    fireEvent.wheel(knob, { deltaY: -100 });
    expect(onValueCommit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(60);
    vi.useRealTimers();
  });

  it("lets a page scroll that started elsewhere pass over it", () => {
    render(
      <div>
        <p>Above</p>
        <Knob aria-label="Level" defaultValue={50} />
      </div>,
    );
    fireEvent.wheel(screen.getByText("Above"), { deltaY: 100 });
    fireEvent.wheel(screen.getByRole("slider"), { deltaY: 100 });
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  });

  it("leaves the wheel to the page while it isn't focused", () => {
    render(<Knob aria-label="Level" defaultValue={50} />);
    const knob = screen.getByRole("slider");
    const wheel = new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true });
    knob.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(false);
    expect(knob).toHaveAttribute("aria-valuenow", "50");
  });

  it("lets the page scroll once it reaches the end of its travel", () => {
    render(<Knob aria-label="Level" defaultValue={0} />);
    const knob = screen.getByRole("slider");
    knob.focus();
    const down = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    knob.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(false);
    expect(knob).toHaveAttribute("aria-valuenow", "0");
  });

  it("returns to defaultValue on double-click", () => {
    const onValueChange = vi.fn();
    render(<Knob aria-label="Pan" min={-50} max={50} defaultValue={0} onValueChange={onValueChange} />);
    const knob = screen.getByRole("slider");
    fireEvent.keyDown(knob, { key: "End" });
    fireEvent.doubleClick(knob);
    expect(knob).toHaveAttribute("aria-valuenow", "0");
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("stays put when controlled", () => {
    const onValueChange = vi.fn();
    render(<Knob aria-label="Level" value={20} onValueChange={onValueChange} />);
    const knob = screen.getByRole("slider");
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenCalledWith(21);
    expect(knob).toHaveAttribute("aria-valuenow", "20");
  });

  it("follows a controlled value", () => {
    function Controlled() {
      const [value, setValue] = React.useState(5);
      return <Knob aria-label="Level" value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    const knob = screen.getByRole("slider");
    fireEvent.keyDown(knob, { key: "PageUp" });
    expect(knob).toHaveAttribute("aria-valuenow", "15");
  });

  it("clamps values outside the range", () => {
    render(<Knob aria-label="Level" value={140} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "100");
  });

  it("submits its value through a hidden input", () => {
    const { container } = render(<Knob aria-label="Level" name="level" defaultValue={33} />);
    const input = container.querySelector('input[type="hidden"]');
    expect(input).toHaveAttribute("name", "level");
    expect(input).toHaveAttribute("value", "33");
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    expect(input).toHaveAttribute("value", "34");
  });

  it("ignores input while disabled", () => {
    const onValueChange = vi.fn();
    render(<Knob aria-label="Level" defaultValue={30} disabled onValueChange={onValueChange} />);
    const knob = screen.getByRole("slider");
    expect(knob).toHaveAttribute("aria-disabled", "true");
    expect(knob).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    fireEvent.pointerDown(knob, { pointerId: 1, button: 0, clientY: 300 });
    fireEvent.pointerMove(knob, { pointerId: 1, clientY: 200 });
    fireEvent.wheel(knob, { deltaY: -100 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("puts the ref and native props on the dial", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Knob ref={ref} aria-label="Level" data-testid="dial" />);
    expect(ref.current).toBe(screen.getByRole("slider"));
    expect(screen.getByTestId("dial")).toBe(ref.current);
  });
});
