import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModelSelect, type ModelOption } from "@/components/ui/model-select";

const MODELS: ModelOption[] = [
  { value: "argon-2", name: "Argon 2", context: 200_000, speed: 78, price: { input: 3, output: 15 } },
  { value: "mini", name: "Argon 2 Mini", context: 200_000, speed: 190, price: { input: 0.25, output: 1.25 } },
  { value: "preview", name: "Argon 3 Preview", context: 400_000, speed: 55, disabled: true, note: "Team plan" },
  { value: "long", name: "Argon 2 Long", context: 1_000_000, speed: 41, price: { input: 6, output: 22.5 } },
];

const trigger = () => screen.getByRole("button", { name: /^Model: / });

describe("ModelSelect", () => {
  it("names the trigger after the chosen model and opens a listbox with it selected", () => {
    render(<ModelSelect models={MODELS} defaultValue="argon-2" />);
    expect(trigger()).toHaveAccessibleName("Model: Argon 2");
    fireEvent.click(trigger());
    const list = screen.getByRole("listbox", { name: "Model" });
    expect(list).toHaveFocus();
    expect(screen.getByRole("option", { name: "Argon 2" })).toHaveAttribute("aria-selected", "true");
    expect(list.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "Argon 2" }).id);
  });

  it("describes each option's readouts in words", () => {
    render(<ModelSelect models={MODELS} defaultOpen />);
    expect(screen.getByRole("option", { name: "Argon 2 Long" })).toHaveAccessibleDescription(
      "1M token context, 41 tokens per second, $6 in, $22.50 out per million tokens",
    );
  });

  it("moves with the arrows, skips disabled models and chooses with Enter", () => {
    const onValueChange = vi.fn();
    render(<ModelSelect models={MODELS} defaultValue="argon-2" onValueChange={onValueChange} />);
    fireEvent.click(trigger());
    const list = screen.getByRole("listbox");
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(list.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "Argon 2 Long" }).id);
    fireEvent.keyDown(list, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("long");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAccessibleName("Model: Argon 2 Long");
  });

  it("jumps with Home, End and typeahead", () => {
    render(<ModelSelect models={MODELS} defaultValue="mini" />);
    fireEvent.click(trigger());
    const list = screen.getByRole("listbox");
    const active = () => document.getElementById(list.getAttribute("aria-activedescendant")!)!;
    fireEvent.keyDown(list, { key: "End" });
    expect(active()).toHaveTextContent("Argon 2 Long");
    fireEvent.keyDown(list, { key: "Home" });
    expect(active()).toHaveTextContent("Argon 2");
    fireEvent.keyDown(list, { key: "a", timeStamp: 1000 });
    expect(active()).toHaveTextContent("Argon 2 Mini");
  });

  it("ignores clicks on a disabled model", () => {
    const onValueChange = vi.fn();
    render(<ModelSelect models={MODELS} defaultOpen onValueChange={onValueChange} />);
    const preview = screen.getByRole("option", { name: "Argon 3 Preview" });
    expect(preview).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(preview);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("closes on Escape and stays controlled", () => {
    const { rerender } = render(<ModelSelect models={MODELS} value="argon-2" />);
    fireEvent.click(trigger());
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    rerender(<ModelSelect models={MODELS} value="mini" />);
    expect(trigger()).toHaveAccessibleName("Model: Argon 2 Mini");
  });

  it("drops columns no model has", () => {
    render(<ModelSelect models={MODELS.map(({ price, ...m }) => (void price, m))} defaultOpen />);
    expect(screen.queryByText("Per 1M, in / out")).toBeNull();
    expect(screen.getByText("Speed")).toBeInTheDocument();
  });
});
