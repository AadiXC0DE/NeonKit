import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toggle, ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function Range(props: Partial<React.ComponentProps<typeof ToggleGroup>>) {
  return (
    <ToggleGroup aria-label="Range" {...(props as object)}>
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="quarter" disabled>
        Quarter
      </ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
    </ToggleGroup>
  );
}

describe("Toggle", () => {
  it("toggles aria-pressed when uncontrolled and reports changes", () => {
    const onPressedChange = vi.fn();
    render(<Toggle aria-label="Pin" onPressedChange={onPressedChange} />);
    const toggle = screen.getByRole("button", { name: "Pin" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("stays put when controlled", () => {
    const onPressedChange = vi.fn();
    render(<Toggle aria-label="Mute" pressed={false} onPressedChange={onPressedChange} />);
    const toggle = screen.getByRole("button", { name: "Mute" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("applies an explicit color through --neon", () => {
    render(<Toggle aria-label="Star" color="lime" />);
    expect(screen.getByRole("button", { name: "Star" }).style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});

describe("ToggleGroup single", () => {
  it("renders a radiogroup of radios", () => {
    render(<Range defaultValue="week" />);
    expect(screen.getByRole("radiogroup", { name: "Range" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "false");
  });

  it("selects on click and does not deselect the checked item", () => {
    const onValueChange = vi.fn();
    render(<Range defaultValue="day" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Month" }));
    expect(screen.getByRole("radio", { name: "Month" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("month");
    fireEvent.click(screen.getByRole("radio", { name: "Month" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("keeps only the selected item in the Tab order", () => {
    render(<Range defaultValue="week" />);
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("tabindex");
  });

  it("moves focus and selection with arrows, skipping disabled items and wrapping", () => {
    const onValueChange = vi.fn();
    render(<Range defaultValue="week" onValueChange={onValueChange} />);
    const week = screen.getByRole("radio", { name: "Week" });
    week.focus();
    fireEvent.keyDown(week, { key: "ArrowRight" });
    const month = screen.getByRole("radio", { name: "Month" });
    expect(month).toHaveFocus();
    expect(month).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("month");

    fireEvent.keyDown(month, { key: "ArrowRight" });
    expect(screen.getByRole("radio", { name: "Day" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(month).toHaveFocus();
    fireEvent.keyDown(month, { key: "Home" });
    expect(screen.getByRole("radio", { name: "Day" })).toHaveFocus();
  });

  it("hands focus from the group to the first item when nothing is selected", () => {
    render(<Range />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("tabindex", "0");
    group.focus();
    expect(screen.getByRole("radio", { name: "Day" })).toHaveFocus();
  });

  it("follows a controlled value", () => {
    const { rerender } = render(<Range value="day" />);
    fireEvent.click(screen.getByRole("radio", { name: "Week" }));
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true");
    rerender(<Range value="week" />);
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true");
  });

  it("disables every item from the group", () => {
    render(<Range defaultValue="day" disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });
});

describe("ToggleGroup multiple", () => {
  function Formatting(props: { onValueChange?: (value: string[]) => void; value?: string[] }) {
    return (
      <ToggleGroup type="multiple" aria-label="Formatting" defaultValue={["bold"]} {...props}>
        <ToggleGroupItem value="bold" aria-label="Bold" />
        <ToggleGroupItem value="italic" aria-label="Italic" />
        <ToggleGroupItem value="underline" aria-label="Underline" />
      </ToggleGroup>
    );
  }

  it("renders a toolbar of pressed buttons", () => {
    render(<Formatting />);
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles items independently", () => {
    const onValueChange = vi.fn();
    render(<Formatting onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["italic"]);
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
  });

  it("moves focus with arrows without pressing", () => {
    render(<Formatting />);
    const bold = screen.getByRole("button", { name: "Bold" });
    bold.focus();
    fireEvent.keyDown(bold, { key: "ArrowRight" });
    const italic = screen.getByRole("button", { name: "Italic" });
    expect(italic).toHaveFocus();
    expect(italic).toHaveAttribute("aria-pressed", "false");
    expect(italic).toHaveAttribute("tabindex", "0");
    expect(bold).toHaveAttribute("tabindex", "-1");
    // Vertical arrows don't move a horizontal toolbar.
    fireEvent.keyDown(italic, { key: "ArrowDown" });
    expect(italic).toHaveFocus();
  });
});
