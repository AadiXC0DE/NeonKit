import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RotatingText } from "@/components/ui/rotating-text";

const words = ["billing", "search", "auth"];
const states = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(".nk-rt-word"), (node) => node.dataset.state ?? "");

beforeEach(() => {
  vi.useFakeTimers();
  // Each word is 10px a letter wide.
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return (this.textContent?.length ?? 0) * 5;
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("RotatingText", () => {
  it("reads every word once, in place, and keeps the animated copy from screen readers", () => {
    const { container } = render(
      <h1>
        Wire up <RotatingText words={words} /> today
      </h1>,
    );
    expect(screen.getByRole("heading")).toHaveAccessibleName("Wire up billing, search, auth today");
    expect(container.querySelector("[aria-live]")).toBeNull();
    for (const word of container.querySelectorAll(".nk-rt-word")) expect(word.closest("[aria-hidden]")).not.toBeNull();
  });

  it("announces each word politely when live", () => {
    const { container } = render(<RotatingText words={words} live interval={1000} />);
    const region = container.querySelector("[aria-live='polite']");
    expect(region).toHaveTextContent("billing");
    act(() => vi.advanceTimersByTime(1000));
    expect(region).toHaveTextContent("search");
  });

  it("starts lit, then powers the old word off and strikes the next", () => {
    const onIndexChange = vi.fn();
    const { container } = render(<RotatingText words={words} interval={1000} onIndexChange={onIndexChange} />);
    expect(states(container)).toEqual(["on", "", ""]);
    act(() => vi.advanceTimersByTime(1000));
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(states(container)).toEqual(["out", "in", ""]);
    act(() => vi.advanceTimersByTime(700));
    expect(states(container)).toEqual(["", "in", ""]);
    act(() => vi.advanceTimersByTime(300));
    expect(states(container)).toEqual(["", "out", "in"]);
    // Round to the first word again, with the last one gone.
    act(() => vi.advanceTimersByTime(1000));
    expect(states(container)).toEqual(["in", "", "out"]);
    act(() => vi.advanceTimersByTime(750));
    expect(states(container)).toEqual(["in", "", ""]);
  });

  it("eases its width to the lit word", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<RotatingText ref={ref} words={words} interval={1000} />);
    // The measured node holds the word twice (glass and lit), 10px a letter.
    expect(ref.current?.style.width).toBe("70px");
    act(() => vi.advanceTimersByTime(1000));
    expect(ref.current?.style.width).toBe("60px");
    expect(ref.current?.className).toContain("transition-[width]");
  });

  it("holds while the pointer is on the line, and while paused", () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(
      <p data-testid="line">
        Ship <RotatingText words={words} interval={1000} onIndexChange={onIndexChange} />
      </p>,
    );
    fireEvent.pointerEnter(screen.getByTestId("line"));
    act(() => vi.advanceTimersByTime(3000));
    expect(onIndexChange).not.toHaveBeenCalled();
    fireEvent.pointerLeave(screen.getByTestId("line"));
    act(() => vi.advanceTimersByTime(1000));
    expect(onIndexChange).toHaveBeenCalledTimes(1);
    rerender(
      <p data-testid="line">
        Ship <RotatingText words={words} interval={1000} onIndexChange={onIndexChange} paused />
      </p>,
    );
    act(() => vi.advanceTimersByTime(5000));
    expect(onIndexChange).toHaveBeenCalledTimes(1);
  });

  it("holds while the tab is hidden", () => {
    const onIndexChange = vi.fn();
    render(<RotatingText words={words} interval={1000} onIndexChange={onIndexChange} />);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => vi.advanceTimersByTime(3000));
    expect(onIndexChange).not.toHaveBeenCalled();
    hidden.mockRestore();
  });

  it("follows a controlled index and only asks to move on", () => {
    const onIndexChange = vi.fn();
    const { container, rerender } = render(<RotatingText words={words} index={2} onIndexChange={onIndexChange} interval={1000} />);
    expect(states(container)[2]).toBe("on");
    act(() => vi.advanceTimersByTime(1000));
    expect(onIndexChange).toHaveBeenCalledWith(0);
    expect(states(container)[2]).toBe("on");
    rerender(<RotatingText words={words} index={0} onIndexChange={onIndexChange} interval={1000} />);
    expect(states(container)).toEqual(["in", "", "out"]);
  });

  it("cross-fades with no flicker under reduced motion, and fades up with flicker off", () => {
    const { container, rerender } = render(<RotatingText words={words} />);
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*\.nk-rt-word\[data-state\] \.nk-rt-lit \{ animation: none; \}/);
    rerender(<RotatingText words={words} flicker={false} />);
    expect(container.firstElementChild).toHaveAttribute("data-flicker", "false");
  });

  it("takes its color through --neon", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<RotatingText ref={ref} words={words} color="lime" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});
