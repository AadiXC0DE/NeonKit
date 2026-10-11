import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PowerButton } from "@/components/ui/power-button";

describe("PowerButton", () => {
  it("is a toggle button named Power by default", () => {
    render(<PowerButton />);
    const key = screen.getByRole("button", { name: "Power" });
    expect(key).toHaveAttribute("aria-pressed", "false");
    expect(key).toHaveAttribute("type", "button");
    expect(key).toHaveAttribute("data-state", "off");
  });

  it("toggles uncontrolled and reports changes", () => {
    const onPressedChange = vi.fn();
    render(<PowerButton aria-label="Monitor power" onPressedChange={onPressedChange} />);
    const key = screen.getByRole("button", { name: "Monitor power" });
    fireEvent.click(key);
    expect(key).toHaveAttribute("aria-pressed", "true");
    expect(key).toHaveAttribute("data-state", "on");
    fireEvent.click(key);
    expect(key).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange.mock.calls.map(([pressed]) => pressed)).toEqual([true, false]);
  });

  it("stays put when controlled", () => {
    const onPressedChange = vi.fn();
    render(<PowerButton pressed={false} onPressedChange={onPressedChange} />);
    const key = screen.getByRole("button", { name: "Power" });
    fireEvent.click(key);
    expect(key).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("ignites only when it turns on, not when it mounts on", () => {
    const { container } = render(<PowerButton defaultPressed />);
    const key = screen.getByRole("button", { name: "Power" });
    expect(key).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".nk-power-button-ring")).toBeNull();
    fireEvent.click(key);
    expect(container.querySelector(".nk-power-button-ring")).toBeNull();
    fireEvent.click(key);
    expect(container.querySelector(".nk-power-button-ring")).not.toBeNull();
    expect(container.querySelector(".nk-power-button-glyph")).not.toBeNull();
    expect(container.querySelector(".nk-power-button-spill")).not.toBeNull();
  });

  it("lets onClick cancel the toggle", () => {
    render(<PowerButton onClick={(event) => event.preventDefault()} />);
    const key = screen.getByRole("button", { name: "Power" });
    fireEvent.click(key);
    expect(key).toHaveAttribute("aria-pressed", "false");
  });

  it("uses aria-labelledby instead of the default name", () => {
    render(
      <>
        <span id="lobby">Lobby display</span>
        <PowerButton aria-labelledby="lobby" />
      </>,
    );
    const key = screen.getByRole("button", { name: "Lobby display" });
    expect(key).not.toHaveAttribute("aria-label");
  });

  it("submits with forms when named", () => {
    const { container } = render(<PowerButton name="kiosk" defaultPressed />);
    const input = container.querySelector('input[name="kiosk"]') as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(input.value).toBe("on");
    fireEvent.click(screen.getByRole("button", { name: "Power" }));
    expect(input.checked).toBe(false);
  });

  it("ignores presses when disabled", () => {
    const onPressedChange = vi.fn();
    render(<PowerButton disabled onPressedChange={onPressedChange} />);
    const key = screen.getByRole("button", { name: "Power" });
    expect(key).toBeDisabled();
    fireEvent.click(key);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("swaps in a custom glyph and applies color", () => {
    render(<PowerButton color="amber" icon={<svg data-testid="fan" />} aria-label="Fans" />);
    const key = screen.getByRole("button", { name: "Fans" });
    expect(key.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(screen.getAllByTestId("fan")).toHaveLength(2);
  });

  it("forwards its ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<PowerButton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
