import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColorPicker } from "@/components/ui/color-picker";

const hexField = () => screen.getByRole("textbox", { name: "Hex color" });

describe("ColorPicker", () => {
  afterEach(() => {
    delete (window as { EyeDropper?: unknown }).EyeDropper;
  });

  it("is a labelled group showing the hex", () => {
    render(<ColorPicker label="Brand neon" defaultValue="#ff5fa2" />);
    expect(screen.getByRole("group", { name: "Brand neon" })).toBeInTheDocument();
    expect(hexField()).toHaveValue("FF5FA2");
  });

  it("applies six hex digits as you type", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" onValueChange={onValueChange} />);
    fireEvent.change(hexField(), { target: { value: "A855F7" } });
    expect(onValueChange).toHaveBeenLastCalledWith("#a855f7");
  });

  it("applies three digits on Enter", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" onValueChange={onValueChange} />);
    const field = hexField();
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "#f0a" } });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("#ff00aa");
    expect(field).toHaveValue("FF00AA");
  });

  it("flags invalid hex and restores on Escape", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" defaultValue="#22d3ee" onValueChange={onValueChange} />);
    const field = hexField();
    fireEvent.change(field, { target: { value: "22d3eg" } });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Use 3 or 6 hex digits, like 22D3EE.");
    fireEvent.keyDown(field, { key: "Escape" });
    expect(field).toHaveValue("22D3EE");
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("flags an incomplete hex only once you try to apply it", () => {
    render(<ColorPicker aria-label="Accent" />);
    const field = hexField();
    fireEvent.change(field, { target: { value: "22d3" } });
    expect(field).not.toHaveAttribute("aria-invalid");
    fireEvent.keyDown(field, { key: "Enter" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    fireEvent.blur(field);
    expect(field).toHaveValue("22D3EE");
  });

  it("picks gels by click and arrow keys", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" defaultValue="#22d3ee" onValueChange={onValueChange} />);
    const group = screen.getByRole("radiogroup", { name: "Preset colors" });
    const cyan = screen.getByRole("radio", { name: "Cyan" });
    expect(cyan).toHaveAttribute("aria-checked", "true");
    expect(cyan).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Blue" })).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(cyan, { key: "ArrowRight" });
    const blue = screen.getByRole("radio", { name: "Blue" });
    expect(blue).toHaveFocus();
    expect(blue).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("#4f8bff");

    fireEvent.click(screen.getByRole("radio", { name: "Lime" }));
    expect(onValueChange).toHaveBeenLastCalledWith("#a3e635");
    expect(group.querySelectorAll('[aria-checked="true"]')).toHaveLength(1);
  });

  it("takes custom swatches with labels", () => {
    render(
      <ColorPicker
        aria-label="Label color"
        swatches={[{ value: "#ff4d5e", label: "Signal red" }, "violet", "#0f0"]}
      />,
    );
    expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("aria-label"))).toEqual([
      "Signal red",
      "Violet",
      "#00FF00",
    ]);
  });

  it("turns the hue knob with the keyboard, wrapping around", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" defaultValue="#ff0000" onValueChange={onValueChange} />);
    const knob = screen.getByRole("slider", { name: "Hue" });
    expect(knob).toHaveAttribute("aria-valuenow", "0");
    fireEvent.keyDown(knob, { key: "ArrowLeft" });
    expect(knob).toHaveAttribute("aria-valuenow", "359");
    fireEvent.keyDown(knob, { key: "Home" });
    fireEvent.keyDown(knob, { key: "ArrowRight", shiftKey: true });
    expect(knob).toHaveAttribute("aria-valuenow", "10");
    fireEvent.keyDown(knob, { key: "PageUp" });
    expect(knob).toHaveAttribute("aria-valuetext", "25 degrees");
    expect(onValueChange).toHaveBeenCalled();
  });

  it("keeps the hue when saturation drops to grey", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" defaultValue="#00ff00" onValueChange={onValueChange} />);
    const saturation = screen.getByRole("slider", { name: "Saturation" });
    expect(saturation).toHaveAttribute("aria-valuenow", "100");
    fireEvent.keyDown(saturation, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith("#808080");
    expect(screen.getByRole("slider", { name: "Hue" })).toHaveAttribute("aria-valuenow", "120");
    fireEvent.keyDown(saturation, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith("#00ff00");
  });

  it("steps lightness", () => {
    render(<ColorPicker aria-label="Accent" defaultValue="#808080" />);
    const lightness = screen.getByRole("slider", { name: "Lightness" });
    fireEvent.keyDown(lightness, { key: "End" });
    expect(hexField()).toHaveValue("FFFFFF");
    expect(lightness).toHaveAttribute("aria-valuetext", "100%");
  });

  it("stays put when controlled", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" value="#22d3ee" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Pink" }));
    expect(onValueChange).toHaveBeenCalledWith("#ff5fa2");
    expect(hexField()).toHaveValue("22D3EE");
    expect(screen.getByRole("radio", { name: "Cyan" })).toHaveAttribute("aria-checked", "true");
  });

  it("follows a controlled value", () => {
    function Controlled() {
      const [color, setColor] = React.useState("#22d3ee");
      return <ColorPicker aria-label="Accent" value={color} onValueChange={setColor} />;
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("radio", { name: "Amber" }));
    expect(hexField()).toHaveValue("FBBF24");
  });

  it("hides the hex field when asked", () => {
    render(<ColorPicker aria-label="Accent" showInput={false} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("submits with forms when named", () => {
    const { container } = render(<ColorPicker aria-label="Accent" name="accent" defaultValue="#A855F7" />);
    expect((container.querySelector('input[name="accent"]') as HTMLInputElement).value).toBe("#a855f7");
  });

  it("offers the eye dropper only where supported", () => {
    render(<ColorPicker aria-label="Accent" />);
    expect(screen.queryByRole("button", { name: "Pick a color from the screen" })).not.toBeInTheDocument();
  });

  it("samples a color with the eye dropper", async () => {
    const open = vi.fn().mockResolvedValue({ sRGBHex: "#f046eb" });
    (window as { EyeDropper?: unknown }).EyeDropper = class {
      open = open;
    };
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Accent" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick a color from the screen" }));
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("#f046eb"));
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("disables every control", () => {
    render(<ColorPicker aria-label="Accent" disabled />);
    expect(screen.getByRole("group", { name: "Accent" })).toHaveAttribute("aria-disabled", "true");
    expect(hexField()).toBeDisabled();
    expect(screen.getByRole("slider", { name: "Hue" })).toHaveAttribute("tabindex", "-1");
    screen.getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled());
  });
});
