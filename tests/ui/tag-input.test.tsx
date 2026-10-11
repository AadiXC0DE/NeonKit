import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TagInput } from "@/components/ui/tag-input";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateEmail = (tag: string) => emailPattern.test(tag) || "Enter a full email address.";

function textbox() {
  return screen.getByRole("textbox");
}

function chips() {
  return screen.queryAllByRole("listitem").map((chip) => chip.textContent);
}

describe("TagInput", () => {
  it("commits the typed text on Enter and comma", () => {
    const onValueChange = vi.fn();
    render(<TagInput label="Skills" onValueChange={onValueChange} />);
    fireEvent.change(textbox(), { target: { value: "React" } });
    fireEvent.keyDown(textbox(), { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(["React"]);
    expect(textbox()).toHaveValue("");

    fireEvent.change(textbox(), { target: { value: "Rust" } });
    fireEvent.keyDown(textbox(), { key: "," });
    expect(onValueChange).toHaveBeenLastCalledWith(["React", "Rust"]);
    expect(chips()).toEqual(["React", "Rust"]);
  });

  it("commits when a separator arrives through the value", () => {
    render(<TagInput label="Skills" />);
    fireEvent.change(textbox(), { target: { value: "Go," } });
    expect(chips()).toEqual(["Go"]);
    expect(textbox()).toHaveValue("");
  });

  it("uses custom separators", () => {
    render(<TagInput label="Skills" separators={[" ", "Tab"]} />);
    fireEvent.change(textbox(), { target: { value: "SQL" } });
    fireEvent.keyDown(textbox(), { key: " " });
    expect(chips()).toEqual(["SQL"]);
    fireEvent.change(textbox(), { target: { value: "Figma" } });
    fireEvent.keyDown(textbox(), { key: "Enter" });
    expect(chips()).toEqual(["SQL"]);
  });

  it("splits pasted text on commas and newlines", () => {
    render(<TagInput label="To" />);
    fireEvent.paste(textbox(), {
      clipboardData: { getData: () => "ana@lumen.dev, ben@lumen.dev\ncho@lumen.dev" },
    });
    expect(chips()).toEqual(["ana@lumen.dev", "ben@lumen.dev", "cho@lumen.dev"]);
  });

  it("keeps an invalid tag in the input and shows the reason", () => {
    const onValueChange = vi.fn();
    render(<TagInput label="To" validate={validateEmail} onValueChange={onValueChange} />);
    fireEvent.change(textbox(), { target: { value: "ana@lumen" } });
    fireEvent.keyDown(textbox(), { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(textbox()).toHaveValue("ana@lumen");
    expect(textbox()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByText("Enter a full email address.")[0]).toBeInTheDocument();

    fireEvent.change(textbox(), { target: { value: "ana@lumen.dev" } });
    expect(textbox()).not.toHaveAttribute("aria-invalid");
  });

  it("commits the valid part of a paste and leaves the rest to fix", () => {
    render(<TagInput label="To" validate={validateEmail} />);
    fireEvent.paste(textbox(), { clipboardData: { getData: () => "ana@lumen.dev, nope, ben@lumen.dev" } });
    expect(chips()).toEqual(["ana@lumen.dev", "ben@lumen.dev"]);
    expect(textbox()).toHaveValue("nope");
  });

  it("rejects duplicates case-insensitively unless allowed", () => {
    const { unmount } = render(<TagInput label="Skills" defaultValue={["React"]} />);
    fireEvent.change(textbox(), { target: { value: "react" } });
    fireEvent.keyDown(textbox(), { key: "Enter" });
    expect(chips()).toEqual(["React"]);
    expect(screen.getAllByText("“react” is already added.")[0]).toBeInTheDocument();
    unmount();

    render(<TagInput label="Skills" defaultValue={["React"]} allowDuplicates />);
    fireEvent.change(textbox(), { target: { value: "React" } });
    fireEvent.keyDown(textbox(), { key: "Enter" });
    expect(chips()).toEqual(["React", "React"]);
  });

  it("stops at max", () => {
    render(<TagInput label="Skills" defaultValue={["Go", "Rust"]} max={2} />);
    fireEvent.change(textbox(), { target: { value: "Zig" } });
    fireEvent.keyDown(textbox(), { key: "Enter" });
    expect(chips()).toEqual(["Go", "Rust"]);
    expect(screen.getAllByText("You can add up to 2 tags.")[0]).toBeInTheDocument();
  });

  it("arms the last chip on the first Backspace and removes it on the second", () => {
    const onValueChange = vi.fn();
    render(<TagInput label="Skills" defaultValue={["Go", "Rust"]} onValueChange={onValueChange} />);
    fireEvent.keyDown(textbox(), { key: "Backspace" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(chips()).toEqual(["Go", "Rust"]);
    fireEvent.keyDown(textbox(), { key: "Backspace" });
    expect(onValueChange).toHaveBeenLastCalledWith(["Go"]);
  });

  it("disarms when another key is pressed", () => {
    const onValueChange = vi.fn();
    render(<TagInput label="Skills" defaultValue={["Go"]} onValueChange={onValueChange} />);
    fireEvent.keyDown(textbox(), { key: "Backspace" });
    fireEvent.keyDown(textbox(), { key: "Shift" });
    fireEvent.keyDown(textbox(), { key: "Backspace" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("moves between chips with the arrow keys and removes the focused one", () => {
    const onValueChange = vi.fn();
    render(<TagInput label="Skills" defaultValue={["Go", "Rust", "Zig"]} onValueChange={onValueChange} />);
    textbox().focus();
    fireEvent.keyDown(textbox(), { key: "ArrowLeft" });
    const [go, rust, zig] = screen.getAllByRole("listitem");
    expect(zig).toHaveFocus();
    fireEvent.keyDown(zig, { key: "ArrowLeft" });
    expect(rust).toHaveFocus();
    fireEvent.keyDown(rust, { key: "Backspace" });
    expect(onValueChange).toHaveBeenLastCalledWith(["Go", "Zig"]);
    expect(go).toHaveFocus();
    fireEvent.keyDown(go, { key: "ArrowRight" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(textbox()).toHaveFocus();
  });

  it("removes a chip from its button", () => {
    render(<TagInput label="Skills" defaultValue={["Go", "Rust"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Go" }));
    expect(chips()).toEqual(["Rust"]);
  });

  it("commits what's typed when the field is left", () => {
    render(<TagInput label="Skills" />);
    fireEvent.change(textbox(), { target: { value: "Elixir" } });
    fireEvent.blur(textbox());
    expect(chips()).toEqual(["Elixir"]);
  });

  it("follows a controlled value", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<TagInput label="Skills" value={["Go"]} onValueChange={onValueChange} />);
    fireEvent.change(textbox(), { target: { value: "Rust" } });
    fireEvent.keyDown(textbox(), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["Go", "Rust"]);
    expect(chips()).toEqual(["Go"]);
    rerender(<TagInput label="Skills" value={["Go", "Rust"]} onValueChange={onValueChange} />);
    expect(chips()).toEqual(["Go", "Rust"]);
  });

  it("filters suggestions and picks one with the keyboard", () => {
    render(<TagInput label="Skills" suggestions={["TypeScript", "Terraform", "Rust"]} defaultValue={["Rust"]} />);
    const input = screen.getByRole("combobox", { name: "Skills" });
    fireEvent.change(input, { target: { value: "t" } });
    const options = screen.getAllByRole("option");
    // Already-added tags aren't offered again; prefix matches come first.
    expect(options.map((option) => option.textContent)).toEqual(["TypeScript", "Terraform"]);
    expect(input).toHaveAttribute("aria-activedescendant", options[0].id);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", options[1].id);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(chips()).toEqual(["Rust", "Terraform"]);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("submits each tag through a hidden input", () => {
    const { container } = render(<TagInput label="Skills" name="skills" defaultValue={["Go", "Rust"]} />);
    const hidden = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="skills"]'));
    expect(hidden.map((element) => element.value)).toEqual(["Go", "Rust"]);
  });
});
