import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Suggestion, Suggestions } from "@/components/ui/suggestions";

function Row(props: Partial<React.ComponentProps<typeof Suggestions>> & { disabledSecond?: boolean }) {
  const { disabledSecond, ...rest } = props;
  return (
    <Suggestions aria-label="Starters" {...rest}>
      <Suggestion>Why did deploy #4127 fail?</Suggestion>
      <Suggestion value="summarize:482" disabled={disabledSecond}>
        Summarize PR #482
      </Suggestion>
      <Suggestion icon={<svg data-testid="icon" />}>Draft release notes</Suggestion>
    </Suggestions>
  );
}

const chip = (name: RegExp) => screen.getByRole("button", { name });

describe("Suggestions", () => {
  it("is a named toolbar with one tab stop", () => {
    render(<Row />);
    expect(screen.getByRole("toolbar", { name: "Starters" })).toHaveAttribute("aria-orientation", "horizontal");
    const tabbable = screen.getAllByRole("button").filter((b) => b.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent("Why did deploy");
  });

  it("selects with the chip's text, or its value", () => {
    const onSelect = vi.fn();
    render(<Row onSelect={onSelect} />);
    fireEvent.click(chip(/deploy #4127/));
    expect(onSelect).toHaveBeenLastCalledWith("Why did deploy #4127 fail?");
    fireEvent.click(chip(/PR #482/));
    expect(onSelect).toHaveBeenLastCalledWith("summarize:482");
  });

  it("lets onClick cancel the selection", () => {
    const onSelect = vi.fn();
    render(
      <Suggestions onSelect={onSelect}>
        <Suggestion onClick={(e) => e.preventDefault()}>No</Suggestion>
      </Suggestions>,
    );
    fireEvent.click(chip(/No/));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("moves with arrow keys, wraps, and jumps with Home and End", () => {
    render(<Row />);
    const [first, second, third] = screen.getAllByRole("button");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(second).toHaveFocus();
    expect(second.tabIndex).toBe(0);
    expect(first.tabIndex).toBe(-1);
    fireEvent.keyDown(second, { key: "End" });
    expect(third).toHaveFocus();
    fireEvent.keyDown(third, { key: "ArrowRight" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(third).toHaveFocus();
    fireEvent.keyDown(third, { key: "Home" });
    expect(first).toHaveFocus();
  });

  it("skips disabled chips and can disable the whole row", () => {
    const onSelect = vi.fn();
    const { rerender } = render(<Row disabledSecond onSelect={onSelect} />);
    const [first, second, third] = screen.getAllByRole("button");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(third).toHaveFocus();
    expect(second).toBeDisabled();
    rerender(<Row disabled onSelect={onSelect} />);
    expect(screen.getByRole("toolbar")).toHaveAttribute("aria-disabled", "true");
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });

  it("marks the picked chip so it strikes once", () => {
    render(<Row />);
    const first = chip(/deploy #4127/);
    expect(first).not.toHaveAttribute("data-fired");
    fireEvent.click(first);
    expect(first).toHaveAttribute("data-fired");
  });

  it("hides icons from assistive tech and turns off the strike under reduced motion", () => {
    const { container } = render(<Row />);
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
    const css = container.querySelector("style")?.textContent ?? document.head.textContent ?? "";
    expect(css).toMatch(/prefers-reduced-motion:reduce\)\{\.nk-suggestion\[data-fired\]\{animation:none/);
  });

  it("only fades the edges in wrap mode below the breakpoint", () => {
    render(<Row wrap />);
    expect(screen.getByRole("toolbar")).toHaveAttribute("data-wrap");
    expect(screen.getByRole("toolbar").style.getPropertyValue("--nk-fade-l")).toBe("0px");
  });
});
