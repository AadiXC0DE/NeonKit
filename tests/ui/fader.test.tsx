import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Fader } from "@/components/ui/fader";

// jsdom has no layout. Give every element the same box: a 200px rail starting at y=100 (x=100).
const rect = { x: 100, y: 100, top: 100, left: 100, width: 200, height: 200, right: 300, bottom: 300 };

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ ...rect, toJSON: () => rect } as DOMRect);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** The pressable slot around the cap. */
function track(cap: HTMLElement) {
  return cap.parentElement!.parentElement!.parentElement!;
}

describe("Fader", () => {
  it("is a vertical slider named by its label", () => {
    render(<Fader label="Vox" defaultValue={70} />);
    const cap = screen.getByRole("slider", { name: "Vox" });
    expect(cap).toHaveAttribute("aria-orientation", "vertical");
    expect(cap).toHaveAttribute("aria-valuemin", "0");
    expect(cap).toHaveAttribute("aria-valuemax", "100");
    expect(cap).toHaveAttribute("aria-valuenow", "70");
    expect(cap).toHaveAttribute("tabindex", "0");
  });

  it("can lie horizontally", () => {
    render(<Fader aria-label="Crossfader" orientation="horizontal" />);
    expect(screen.getByRole("slider", { name: "Crossfader" })).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("reads and prints the formatted value", () => {
    render(<Fader aria-label="Gain" min={-60} max={10} defaultValue={-6} showValue formatValue={(v) => `${v} dB`} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "-6 dB");
    expect(screen.getByText("-6 dB")).toBeInTheDocument();
  });

  it("moves with arrows, Shift, Page keys, Home and End", () => {
    const onValueChange = vi.fn();
    render(<Fader aria-label="Level" defaultValue={50} onValueChange={onValueChange} />);
    const cap = screen.getByRole("slider");
    fireEvent.keyDown(cap, { key: "ArrowUp" });
    fireEvent.keyDown(cap, { key: "ArrowDown", shiftKey: true });
    fireEvent.keyDown(cap, { key: "PageUp" });
    fireEvent.keyDown(cap, { key: "Home" });
    fireEvent.keyDown(cap, { key: "ArrowRight" });
    fireEvent.keyDown(cap, { key: "End" });
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([51, 41, 51, 0, 1, 100]);
  });

  it("commits once when the key is released", () => {
    const onValueCommit = vi.fn();
    render(<Fader aria-label="Level" defaultValue={10} onValueCommit={onValueCommit} />);
    const cap = screen.getByRole("slider");
    fireEvent.keyDown(cap, { key: "ArrowUp" });
    fireEvent.keyUp(cap, { key: "ArrowUp" });
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(11);
  });

  it("follows the cap without jumping when grabbed off-center", () => {
    const onValueCommit = vi.fn();
    render(<Fader aria-label="Level" defaultValue={50} onValueCommit={onValueCommit} />);
    const cap = screen.getByRole("slider");
    // The cap's center sits at y=200; grab it 5px low.
    fireEvent.pointerDown(cap, { pointerId: 1, button: 0, clientY: 205 });
    expect(cap).toHaveAttribute("aria-valuenow", "50");
    fireEvent.pointerMove(cap, { pointerId: 1, clientY: 165 });
    expect(cap).toHaveAttribute("aria-valuenow", "70");
    fireEvent.pointerUp(cap, { pointerId: 1 });
    expect(onValueCommit).toHaveBeenCalledWith(70);
  });

  it("moves a fifth as far with Shift held", () => {
    render(<Fader aria-label="Level" defaultValue={50} />);
    const cap = screen.getByRole("slider");
    fireEvent.pointerDown(cap, { pointerId: 1, button: 0, clientY: 200 });
    fireEvent.pointerMove(cap, { pointerId: 1, clientY: 180, shiftKey: true });
    expect(cap).toHaveAttribute("aria-valuenow", "52");
  });

  it("glides to a press on the slot and keeps dragging", () => {
    render(<Fader aria-label="Level" defaultValue={50} />);
    const cap = screen.getByRole("slider");
    fireEvent.pointerDown(track(cap), { pointerId: 1, button: 0, clientY: 150 });
    expect(cap).toHaveAttribute("aria-valuenow", "75");
    expect(cap).toHaveFocus();
    fireEvent.pointerMove(track(cap), { pointerId: 1, clientY: 290 });
    expect(cap).toHaveAttribute("aria-valuenow", "5");
  });

  it("increases to the right when horizontal", () => {
    render(<Fader aria-label="Blend" orientation="horizontal" defaultValue={0} />);
    const cap = screen.getByRole("slider");
    fireEvent.pointerDown(track(cap), { pointerId: 1, button: 0, clientX: 250 });
    expect(cap).toHaveAttribute("aria-valuenow", "75");
  });

  it("returns to defaultValue on double-click", () => {
    render(<Fader aria-label="Gain" min={-60} max={10} defaultValue={0} />);
    const cap = screen.getByRole("slider");
    fireEvent.keyDown(cap, { key: "Home" });
    fireEvent.doubleClick(cap);
    expect(cap).toHaveAttribute("aria-valuenow", "0");
  });

  it("prints the scale it is given", () => {
    render(
      <Fader
        aria-label="Gain"
        min={-60}
        max={10}
        ticks={[{ value: 10, label: "+10" }, 0, { value: -30, label: null }, { value: -60, label: "−∞" }]}
      />,
    );
    expect(screen.getByText("+10")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("−∞")).toBeInTheDocument();
    expect(screen.queryByText("-30")).not.toBeInTheDocument();
  });

  it("numbers every other mark of an even scale", () => {
    render(<Fader aria-label="Level" />);
    for (const n of ["0", "20", "40", "60", "80", "100"]) expect(screen.getByText(n)).toBeInTheDocument();
    expect(screen.queryByText("10")).not.toBeInTheDocument();
  });

  it("lights the meter to the level", () => {
    const { container, rerender } = render(<Fader aria-label="Level" level={0.5} />);
    const meter = container.querySelector("[data-meter]")!;
    expect(meter).toHaveAttribute("aria-hidden", "true");
    expect(meter.querySelectorAll("[data-lit]")).toHaveLength(9);
    rerender(<Fader aria-label="Level" level={1} />);
    expect(meter.querySelectorAll("[data-lit]")).toHaveLength(18);
    rerender(<Fader aria-label="Level" />);
    expect(container.querySelector("[data-meter]")).toBeNull();
  });

  it("stays put when controlled", () => {
    const onValueChange = vi.fn();
    render(<Fader aria-label="Level" value={20} onValueChange={onValueChange} />);
    const cap = screen.getByRole("slider");
    fireEvent.keyDown(cap, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenCalledWith(21);
    expect(cap).toHaveAttribute("aria-valuenow", "20");
  });

  it("follows a controlled value", () => {
    function Controlled() {
      const [value, setValue] = React.useState(0);
      return <Fader aria-label="Level" value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    const cap = screen.getByRole("slider");
    fireEvent.keyDown(cap, { key: "End" });
    expect(cap).toHaveAttribute("aria-valuenow", "100");
  });

  it("submits its value through a hidden input", () => {
    const { container } = render(<Fader aria-label="Level" name="level" defaultValue={42} />);
    const input = container.querySelector('input[type="hidden"]');
    expect(input).toHaveAttribute("name", "level");
    expect(input).toHaveAttribute("value", "42");
  });

  it("ignores input while disabled", () => {
    const onValueChange = vi.fn();
    render(<Fader aria-label="Level" defaultValue={30} disabled onValueChange={onValueChange} />);
    const cap = screen.getByRole("slider");
    expect(cap).toHaveAttribute("aria-disabled", "true");
    expect(cap).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(cap, { key: "ArrowUp" });
    fireEvent.pointerDown(track(cap), { pointerId: 1, button: 0, clientY: 120 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("puts the ref and native props on the cap", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Fader ref={ref} aria-label="Level" data-testid="cap" />);
    expect(ref.current).toBe(screen.getByRole("slider"));
    expect(screen.getByTestId("cap")).toBe(ref.current);
  });
});
