import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HardwareSwitch } from "@/components/ui/hardware-switch";

describe("HardwareSwitch", () => {
  it("is a switch named by its label, off by default", () => {
    render(<HardwareSwitch label="Mains" />);
    const sw = screen.getByRole("switch", { name: "Mains" });
    expect(sw.tagName).toBe("BUTTON");
    expect(sw).toHaveAttribute("type", "button");
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(sw).toHaveAttribute("data-variant", "rocker");
  });

  it("flips on click and reports the new state", () => {
    const onCheckedChange = vi.fn();
    render(<HardwareSwitch aria-label="Arm" variant="flip" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "Arm" });
    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(sw).toHaveAttribute("data-state", "checked");
    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange.mock.calls.map(([v]) => v)).toEqual([true, false]);
  });

  it("flips when its label is clicked", () => {
    render(<HardwareSwitch variant="key" label="Deploy" />);
    fireEvent.click(screen.getByText("Deploy"));
    expect(screen.getByRole("switch", { name: "Deploy" })).toHaveAttribute("aria-checked", "true");
  });

  it.each(["rocker", "flip", "key"] as const)("renders the %s variant", (variant) => {
    render(<HardwareSwitch variant={variant} aria-label="Power" defaultChecked />);
    const sw = screen.getByRole("switch", { name: "Power" });
    expect(sw).toHaveAttribute("data-variant", variant);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("stays put when controlled", () => {
    const onCheckedChange = vi.fn();
    render(<HardwareSwitch aria-label="Pump" checked={false} onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("follows a controlled value", () => {
    function Controlled() {
      const [on, setOn] = React.useState(true);
      return <HardwareSwitch aria-label="Pump" checked={on} onCheckedChange={setOn} />;
    }
    render(<Controlled />);
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("lets onClick cancel the flip", () => {
    render(<HardwareSwitch aria-label="Arm" onClick={(event) => event.preventDefault()} />);
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("submits like a checkbox when named", () => {
    const { container } = render(<HardwareSwitch aria-label="Deploys" name="deploys" />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).toHaveAttribute("name", "deploys");
    expect(input).toHaveAttribute("value", "on");
    expect(input.checked).toBe(false);
    fireEvent.click(screen.getByRole("switch"));
    expect(input.checked).toBe(true);
  });

  it("submits a custom value", () => {
    const { container } = render(
      <form>
        <HardwareSwitch aria-label="Mode" name="mode" value="armed" defaultChecked />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("mode")).toBe("armed");
    fireEvent.click(screen.getByRole("switch"));
    expect(new FormData(form).get("mode")).toBeNull();
  });

  it("ignores clicks while disabled", () => {
    const onCheckedChange = vi.fn();
    render(<HardwareSwitch aria-label="Locked" disabled onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch");
    expect(sw).toBeDisabled();
    fireEvent.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("puts the ref and native props on the button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<HardwareSwitch ref={ref} aria-label="Power" data-testid="device" />);
    expect(ref.current).toBe(screen.getByRole("switch"));
    expect(screen.getByTestId("device")).toBe(ref.current);
  });
});
