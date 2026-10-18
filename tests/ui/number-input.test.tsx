import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NumberInput } from "@/components/ui/number-input";

const usd = { style: "currency", currency: "USD" } as const;

function spinbutton() {
  return screen.getByRole("spinbutton");
}

describe("NumberInput", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a spinbutton with its range and formatted text", () => {
    render(<NumberInput label="Price" defaultValue={1299.5} min={0} max={5000} formatOptions={usd} locale="en-US" />);
    const input = screen.getByRole("spinbutton", { name: "Price" });
    expect(input).toHaveValue("$1,299.50");
    expect(input).toHaveAttribute("aria-valuenow", "1299.5");
    expect(input).toHaveAttribute("aria-valuemin", "0");
    expect(input).toHaveAttribute("aria-valuemax", "5000");
    expect(input).toHaveAttribute("aria-valuetext", "$1,299.50");
  });

  it("steps with the arrow keys, Shift and Page keys", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Seats" defaultValue={5} onValueChange={onValueChange} />);
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(6);
    fireEvent.keyDown(spinbutton(), { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp", shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    fireEvent.keyDown(spinbutton(), { key: "PageUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(20);
    fireEvent.keyDown(spinbutton(), { key: "PageDown" });
    expect(spinbutton()).toHaveValue("10");
  });

  it("snaps to the step grid when stepping from an off-grid value", () => {
    render(<NumberInput label="Width" defaultValue={12} step={5} />);
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp" });
    expect(spinbutton()).toHaveValue("15");
    fireEvent.keyDown(spinbutton(), { key: "ArrowDown" });
    fireEvent.keyDown(spinbutton(), { key: "ArrowDown" });
    expect(spinbutton()).toHaveValue("5");
  });

  it("avoids floating point noise with decimal steps", () => {
    render(<NumberInput label="Opacity" defaultValue={0.1} step={0.1} />);
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp" });
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp" });
    expect(spinbutton()).toHaveAttribute("aria-valuenow", "0.3");
  });

  it("clamps to the bounds and jumps there with Home and End", () => {
    render(<NumberInput label="Seats" defaultValue={9} min={1} max={10} />);
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp", shiftKey: true });
    expect(spinbutton()).toHaveValue("10");
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    fireEvent.keyDown(spinbutton(), { key: "Home" });
    expect(spinbutton()).toHaveValue("1");
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
    fireEvent.keyDown(spinbutton(), { key: "End" });
    expect(spinbutton()).toHaveValue("10");
  });

  it("parses leniently and formats on blur", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Price" formatOptions={usd} locale="en-US" onValueChange={onValueChange} />);
    fireEvent.change(spinbutton(), { target: { value: "$1,250.5" } });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.blur(spinbutton());
    expect(onValueChange).toHaveBeenCalledWith(1250.5);
    expect(spinbutton()).toHaveValue("$1,250.50");
  });

  it("reads percent input as a fraction", () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput label="Discount" formatOptions={{ style: "percent" }} locale="en-US" onValueChange={onValueChange} />,
    );
    fireEvent.change(spinbutton(), { target: { value: "15%" } });
    fireEvent.keyDown(spinbutton(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(0.15);
    expect(spinbutton()).toHaveValue("15%");
  });

  it("parses with the locale's separators", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Betrag" locale="de-DE" onValueChange={onValueChange} />);
    fireEvent.change(spinbutton(), { target: { value: "1.234,5" } });
    fireEvent.blur(spinbutton());
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5);
    fireEvent.change(spinbutton(), { target: { value: "12.5" } });
    fireEvent.blur(spinbutton());
    expect(onValueChange).toHaveBeenLastCalledWith(12.5);
  });

  it("reads compact suffixes back", () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput
        label="Requests"
        defaultValue={12000}
        formatOptions={{ notation: "compact" }}
        locale="en-US"
        onValueChange={onValueChange}
      />,
    );
    expect(spinbutton()).toHaveValue("12K");
    fireEvent.change(spinbutton(), { target: { value: "2.5M" } });
    fireEvent.blur(spinbutton());
    expect(onValueChange).toHaveBeenLastCalledWith(2500000);
  });

  it("clamps typed values, reverts nonsense and empties to null", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Seats" defaultValue={4} min={1} max={50} onValueChange={onValueChange} />);
    fireEvent.change(spinbutton(), { target: { value: "120" } });
    fireEvent.blur(spinbutton());
    expect(onValueChange).toHaveBeenLastCalledWith(50);

    fireEvent.change(spinbutton(), { target: { value: "lots" } });
    fireEvent.blur(spinbutton());
    expect(spinbutton()).toHaveValue("50");

    fireEvent.change(spinbutton(), { target: { value: "" } });
    fireEvent.blur(spinbutton());
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(spinbutton()).not.toHaveAttribute("aria-valuenow");
  });

  it("drops the draft on Escape", () => {
    render(<NumberInput label="Seats" defaultValue={4} />);
    fireEvent.change(spinbutton(), { target: { value: "9" } });
    fireEvent.keyDown(spinbutton(), { key: "Escape" });
    expect(spinbutton()).toHaveValue("4");
  });

  it("steps from the typed text", () => {
    render(<NumberInput label="Seats" defaultValue={4} />);
    fireEvent.change(spinbutton(), { target: { value: "30" } });
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp" });
    expect(spinbutton()).toHaveValue("31");
  });

  it("repeats while a stepper is held", () => {
    vi.useFakeTimers();
    const onValueChange = vi.fn();
    render(<NumberInput label="Seats" defaultValue={1} onValueChange={onValueChange} />);
    const increase = screen.getByRole("button", { name: "Increase" });
    fireEvent.pointerDown(increase, { button: 0, pointerType: "mouse" });
    expect(onValueChange).toHaveBeenLastCalledWith(2);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const held = onValueChange.mock.lastCall?.[0] as number;
    expect(held).toBeGreaterThan(4);
    fireEvent.pointerUp(increase);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onValueChange).toHaveBeenLastCalledWith(held);
  });

  it("steps once for keyboard or assistive-tech clicks on a stepper", () => {
    render(<NumberInput label="Seats" defaultValue={3} />);
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }), { detail: 0 });
    expect(spinbutton()).toHaveValue("2");
  });

  it("scrubs when the label is dragged sideways", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Width" defaultValue={100} onValueChange={onValueChange} />);
    const label = screen.getByText("Width");
    fireEvent.pointerDown(label, { button: 0, pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(label, { pointerId: 1, clientX: 104 });
    fireEvent.pointerMove(label, { pointerId: 1, clientX: 124 });
    expect(onValueChange).toHaveBeenLastCalledWith(110);
    // Shift switches to largeStep and continues from the current value.
    fireEvent.pointerMove(label, { pointerId: 1, clientX: 124, shiftKey: true });
    fireEvent.pointerMove(label, { pointerId: 1, clientX: 132, shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(130);
    fireEvent.pointerUp(label, { pointerId: 1, clientX: 132 });
    fireEvent.pointerMove(label, { pointerId: 1, clientX: 200 });
    expect(onValueChange).toHaveBeenLastCalledWith(130);
  });

  it("doesn't scrub when scrub is off or disabled", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Width" defaultValue={100} scrub={false} onValueChange={onValueChange} />);
    const label = screen.getByText("Width");
    fireEvent.pointerDown(label, { button: 0, pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(label, { pointerId: 1, clientX: 160 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("follows a controlled value", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<NumberInput label="Seats" value={3} onValueChange={onValueChange} />);
    fireEvent.keyDown(spinbutton(), { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenCalledWith(4);
    expect(spinbutton()).toHaveValue("3");
    rerender(<NumberInput label="Seats" value={8} onValueChange={onValueChange} />);
    expect(spinbutton()).toHaveValue("8");
  });

  it("submits the raw number through a hidden input", () => {
    const { container } = render(
      <NumberInput label="Price" name="price" defaultValue={49} formatOptions={usd} locale="en-US" />,
    );
    expect(container.querySelector('input[type="hidden"][name="price"]')).toHaveValue("49");
  });
});
