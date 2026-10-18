import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reasoning } from "@/components/ui/reasoning";

afterEach(() => vi.useRealTimers());

const live = () => document.querySelector("[aria-live=polite]")!;

describe("Reasoning", () => {
  it("is a disclosure that stays folded while streaming by default", () => {
    render(<Reasoning streaming>{"Reading the config. Checking the offset"}</Reasoning>);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", screen.getByRole("region", { hidden: true }).id);
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("shows the sentence being written as the live line", () => {
    const { container } = render(<Reasoning streaming>{"First the config. Then the offset in date"}</Reasoning>);
    expect(container.querySelector("button")).toHaveTextContent("Then the offset in date");
    expect(container.querySelector("button")).not.toHaveTextContent("First the config");
  });

  it("prefers an explicit status line", () => {
    render(
      <Reasoning streaming status="Comparing 3 query plans">
        {"Long trace"}
      </Reasoning>,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Comparing 3 query plans");
  });

  it("reads Thought for N when done", () => {
    render(<Reasoning duration={12}>Done</Reasoning>);
    expect(screen.getByRole("button", { name: "Thought for 12s" })).toBeInTheDocument();
  });

  it("counts elapsed time while streaming", () => {
    vi.useFakeTimers();
    render(<Reasoning streaming>…</Reasoning>);
    act(() => vi.advanceTimersByTime(1200));
    expect(screen.getByRole("button")).toHaveTextContent(/\d\.\ds/);
  });

  it("announces state changes, not tokens", () => {
    const { rerender } = render(<Reasoning>{""}</Reasoning>);
    expect(live()).toHaveTextContent("");
    rerender(<Reasoning streaming>{"One"}</Reasoning>);
    expect(live()).toHaveTextContent("Thinking");
    rerender(<Reasoning streaming>{"One two three"}</Reasoning>);
    expect(live()).toHaveTextContent(/^Thinking$/);
    rerender(<Reasoning duration={4}>{"One two three"}</Reasoning>);
    expect(live()).toHaveTextContent("Thought for 4 seconds");
  });

  it("follows streaming when asked, until toggled by hand", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Reasoning streaming followStreaming onOpenChange={onOpenChange}>
        Thinking
      </Reasoning>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    rerender(
      <Reasoning duration={2} followStreaming onOpenChange={onOpenChange}>
        Thinking
      </Reasoning>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports controlled open", () => {
    const onOpenChange = vi.fn();
    render(
      <Reasoning open={false} onOpenChange={onOpenChange} duration={3}>
        Trace
      </Reasoning>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("hides a closed trace from assistive tech and marks the filament state", () => {
    const { container, rerender } = render(<Reasoning streaming>Trace</Reasoning>);
    expect(container.firstElementChild).toHaveAttribute("data-state", "streaming");
    // Closed panels use visibility: hidden, which takes them out of the accessibility tree.
    expect(screen.getByRole("region", { hidden: true })).toHaveClass("invisible");
    rerender(<Reasoning duration={1}>Trace</Reasoning>);
    expect(container.firstElementChild).toHaveAttribute("data-state", "done");
  });
});
