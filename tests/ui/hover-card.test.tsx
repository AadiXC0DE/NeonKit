import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function Mention(props: { onOpenChange?: (open: boolean) => void; open?: boolean; defaultOpen?: boolean; openDelay?: number }) {
  return (
    <p>
      Reviewed by{" "}
      <HoverCard {...props}>
        <HoverCardTrigger href="/people/mara">@mara</HoverCardTrigger>
        <HoverCardContent>
          <p>Mara Okafor</p>
          <p>Design engineer, Lisbon</p>
        </HoverCardContent>
      </HoverCard>
    </p>
  );
}

const trigger = () => screen.getByRole("link", { name: "@mara" });
const card = () => screen.queryByText("Design engineer, Lisbon");

describe("HoverCard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens after the open delay on mouse hover and describes the trigger", () => {
    const onOpenChange = vi.fn();
    render(<Mention onOpenChange={onOpenChange} />);
    fireEvent.pointerEnter(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(400));
    expect(card()).toBeNull();
    act(() => vi.advanceTimersByTime(150));
    expect(card()).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const content = card()!.closest("[id]")!;
    expect(trigger()).toHaveAttribute("aria-describedby", content.id);
    expect(trigger()).toHaveAttribute("data-state", "open");
  });

  it("ignores touch", () => {
    render(<Mention />);
    fireEvent.pointerEnter(trigger(), { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(1000));
    expect(card()).toBeNull();
  });

  it("cancels if the pointer leaves before the delay", () => {
    render(<Mention />);
    fireEvent.pointerEnter(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.pointerLeave(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(1000));
    expect(card()).toBeNull();
  });

  it("stays open while the pointer crosses onto the card, then closes after the close delay", () => {
    const onOpenChange = vi.fn();
    render(<Mention onOpenChange={onOpenChange} openDelay={0} />);
    fireEvent.pointerEnter(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(0));
    expect(card()).toBeInTheDocument();

    fireEvent.pointerLeave(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.pointerEnter(card()!, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(1000));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    fireEvent.pointerLeave(card()!, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(250));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger()).toHaveAttribute("data-state", "closed");
  });

  it("opens on keyboard focus and closes on blur", () => {
    const matches = HTMLElement.prototype.matches;
    const spy = vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (this: HTMLElement, selector) {
      return selector === ":focus-visible" ? true : matches.call(this, selector);
    });
    try {
      const onOpenChange = vi.fn();
      render(<Mention onOpenChange={onOpenChange} />);
      act(() => trigger().focus());
      act(() => vi.advanceTimersByTime(500));
      expect(card()).toBeInTheDocument();
      act(() => trigger().blur());
      act(() => vi.advanceTimersByTime(200));
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    } finally {
      spy.mockRestore();
    }
  });

  it("doesn't open when focus comes from a mouse press", () => {
    render(<Mention />);
    act(() => trigger().focus());
    act(() => vi.advanceTimersByTime(600));
    expect(card()).toBeNull();
  });

  it("closes on Escape", () => {
    const onOpenChange = vi.fn();
    render(<Mention defaultOpen onOpenChange={onOpenChange} />);
    expect(card()).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("can be controlled", () => {
    const { rerender } = render(<Mention open={false} />);
    fireEvent.pointerEnter(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(600));
    expect(card()).toBeNull();
    rerender(<Mention open />);
    expect(card()).toBeInTheDocument();
  });

  it("merges onto a child with asChild", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild>
          <button type="button" aria-describedby="hint">
            northlight/web
          </button>
        </HoverCardTrigger>
        <HoverCardContent color="violet">Production · 14 deploys today</HoverCardContent>
      </HoverCard>,
    );
    const button = screen.getByRole("button", { name: "northlight/web" });
    const content = screen.getByText("Production · 14 deploys today").closest("[id]")!;
    expect(button.getAttribute("aria-describedby")).toBe(`hint ${content.id}`);
    expect((content.parentElement as HTMLElement).style.getPropertyValue("--neon")).toBe("168 85 247");
  });
});

