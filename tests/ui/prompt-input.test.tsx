import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptInput } from "@/components/ui/prompt-input";

const box = () => screen.getByRole("textbox", { name: "Message" });

describe("PromptInput", () => {
  it("disables send until there's content, then sends on Enter and clears", () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();
    fireEvent.change(box(), { target: { value: "  hello  " } });
    expect(send).toBeEnabled();
    fireEvent.keyDown(box(), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith({ text: "hello", attachments: [] });
    expect(box()).toHaveValue("");
  });

  it("keeps Shift+Enter for new lines", () => {
    const onSubmit = vi.fn();
    render(<PromptInput defaultValue="a" onSubmit={onSubmit} />);
    fireEvent.keyDown(box(), { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("never sends while an IME composition is open", () => {
    const onSubmit = vi.fn();
    render(<PromptInput defaultValue="にほん" onSubmit={onSubmit} />);
    fireEvent.keyDown(box(), { key: "Enter", isComposing: true });
    fireEvent.keyDown(box(), { key: "Enter", keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sends with ⌘/Ctrl+Enter when submitOn is mod-enter", () => {
    const onSubmit = vi.fn();
    render(<PromptInput defaultValue="note" submitOn="mod-enter" onSubmit={onSubmit} />);
    fireEvent.keyDown(box(), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(box(), { key: "Enter", ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledWith({ text: "note", attachments: [] });
  });

  it("swaps send for Stop while streaming; Escape stops too", () => {
    const onStop = vi.fn();
    render(<PromptInput streaming onStop={onStop} />);
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    fireEvent.keyDown(box(), { key: "Escape" });
    expect(onStop).toHaveBeenCalledTimes(2);
  });

  it("counts characters against a limit and blocks sending past it", () => {
    render(<PromptInput counter="characters" limit={5} defaultValue="abcdef" />);
    expect(box()).toHaveAttribute("aria-invalid", "true");
    expect(box()).toHaveAccessibleDescription("6 of 5 characters");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("adds files from the picker and paste, filters them, and removes them", () => {
    const onRejectFiles = vi.fn();
    const onSubmit = vi.fn();
    const { container } = render(
      <PromptInput accept=".csv,image/*" maxFiles={2} onRejectFiles={onRejectFiles} onSubmit={onSubmit} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const csv = new File(["a,b"], "data.csv", { type: "text/csv" });
    const zip = new File(["z"], "x.zip", { type: "application/zip" });
    fireEvent.change(input, { target: { files: [csv, zip] } });
    expect(onRejectFiles).toHaveBeenCalledWith([zip], "type");
    expect(screen.getByText("data.csv")).toBeInTheDocument();

    const pasted = new File(["p"], "notes.csv", { type: "text/csv" });
    fireEvent.paste(box(), { clipboardData: { files: [pasted] } });
    expect(screen.getByText("notes.csv")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove data.csv" }));
    expect(screen.queryByText("data.csv")).toBeNull();
    expect(box()).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit.mock.calls[0][0].attachments[0].name).toBe("notes.csv");
    expect(screen.queryByText("notes.csv")).toBeNull();
  });

  it("disables everything together", () => {
    render(<PromptInput disabled defaultValue="x" />);
    expect(box()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Attach files" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("works controlled", () => {
    const onValueChange = vi.fn();
    render(<PromptInput value="fixed" onValueChange={onValueChange} />);
    fireEvent.change(box(), { target: { value: "fixed!" } });
    expect(onValueChange).toHaveBeenCalledWith("fixed!");
    expect(box()).toHaveValue("fixed");
  });
});
