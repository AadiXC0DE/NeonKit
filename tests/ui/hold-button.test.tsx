import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoldButton } from "@/components/ui/hold-button";

let frames: FrameRequestCallback[] = [];
let now = 0;

/** Steps the rAF loop in 16ms frames for `ms` milliseconds. */
function hold(ms: number) {
  act(() => {
    const end = now + ms;
    while (now < end) {
      now += 16;
      const queue = frames;
      frames = [];
      queue.forEach((callback) => callback(now));
    }
  });
}

function progress(button: HTMLElement) {
  return Number(button.style.getPropertyValue("--nk-hold-button-progress") || 0);
}

beforeEach(() => {
  frames = [];
  now = 0;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("HoldButton", () => {
  it("describes how to use it", () => {
    render(<HoldButton>Hold to deploy</HoldButton>);
    const button = screen.getByRole("button", { name: "Hold to deploy" });
    expect(button).toHaveAccessibleDescription("Press and hold to confirm.");
    expect(button).toHaveAttribute("data-state", "idle");
  });

  it("confirms after a full pointer hold, once", () => {
    const onHoldStart = vi.fn();
    const onComplete = vi.fn();
    render(
      <HoldButton duration={1000} onHoldStart={onHoldStart} onComplete={onComplete}>
        Hold to deploy
      </HoldButton>,
    );
    const button = screen.getByRole("button", { name: "Hold to deploy" });
    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    expect(onHoldStart).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("data-state", "holding");
    hold(500);
    expect(progress(button)).toBeGreaterThan(0.4);
    expect(progress(button)).toBeLessThan(0.6);
    expect(onComplete).not.toHaveBeenCalled();
    hold(600);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("data-state", "complete");
    expect(progress(button)).toBe(1);
    hold(1000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("drains when released early and reports how far it got", () => {
    const onHoldCancel = vi.fn();
    const onComplete = vi.fn();
    render(
      <HoldButton duration={1000} onHoldCancel={onHoldCancel} onComplete={onComplete}>
        Hold to delete
      </HoldButton>,
    );
    const button = screen.getByRole("button", { name: "Hold to delete" });
    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    hold(600);
    fireEvent.pointerUp(button, { button: 0, pointerId: 1 });
    expect(onHoldCancel).toHaveBeenCalledTimes(1);
    expect(onHoldCancel.mock.calls[0][0]).toBeCloseTo(0.6, 1);
    expect(button).toHaveAttribute("data-state", "draining");
    const before = progress(button);
    hold(100);
    expect(progress(button)).toBeLessThan(before);
    hold(1000);
    expect(button).toHaveAttribute("data-state", "idle");
    expect(progress(button)).toBe(0);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("ignores secondary mouse buttons", () => {
    const onHoldStart = vi.fn();
    render(<HoldButton onHoldStart={onHoldStart}>Hold</HoldButton>);
    fireEvent.pointerDown(screen.getByRole("button"), { button: 2, pointerId: 1 });
    expect(onHoldStart).not.toHaveBeenCalled();
  });

  it("holds with Space or Enter and ignores key repeat", () => {
    const onHoldStart = vi.fn();
    const onComplete = vi.fn();
    render(
      <HoldButton duration={800} onHoldStart={onHoldStart} onComplete={onComplete}>
        Hold to sign
      </HoldButton>,
    );
    const button = screen.getByRole("button", { name: "Hold to sign" });
    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyDown(button, { key: " ", repeat: true });
    expect(onHoldStart).toHaveBeenCalledTimes(1);
    hold(300);
    fireEvent.keyUp(button, { key: " " });
    expect(button).toHaveAttribute("data-state", "draining");
    hold(1000);

    fireEvent.keyDown(button, { key: "Enter" });
    hold(900);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("lets go on Escape and on blur", () => {
    const onHoldCancel = vi.fn();
    render(<HoldButton onHoldCancel={onHoldCancel}>Hold</HoldButton>);
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter" });
    hold(200);
    fireEvent.keyDown(button, { key: "Escape" });
    expect(onHoldCancel).toHaveBeenCalledTimes(1);
    hold(2000);

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    hold(200);
    fireEvent.blur(button);
    expect(onHoldCancel).toHaveBeenCalledTimes(2);
  });

  it("shows and announces the complete label, then drains and re-arms", () => {
    const onHoldStart = vi.fn();
    render(
      <HoldButton duration={500} resetDelay={800} completeLabel="Deployed" onHoldStart={onHoldStart}>
        Hold to deploy
      </HoldButton>,
    );
    const button = screen.getByRole("button", { name: "Hold to deploy" });
    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    hold(600);
    expect(button).toHaveAccessibleName("Deployed");
    expect(screen.getByRole("status")).toHaveTextContent("Deployed");
    fireEvent.pointerUp(button, { button: 0, pointerId: 1 });

    // Still lit until resetDelay passes.
    act(() => vi.advanceTimersByTime(700));
    expect(button).toHaveAttribute("data-state", "complete");
    act(() => vi.advanceTimersByTime(200));
    expect(button).toHaveAttribute("data-state", "draining");
    expect(screen.getByRole("status")).toHaveTextContent("");

    // A press while it drains after a confirm doesn't start a new hold.
    fireEvent.pointerDown(button, { button: 0, pointerId: 2 });
    expect(onHoldStart).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(button, { button: 0, pointerId: 2 });
    hold(2000);
    expect(button).toHaveAttribute("data-state", "idle");
    expect(button).toHaveAccessibleName("Hold to deploy");

    fireEvent.pointerDown(button, { button: 0, pointerId: 3 });
    expect(onHoldStart).toHaveBeenCalledTimes(2);
  });

  it("stays confirmed with resetDelay Infinity", () => {
    render(
      <HoldButton duration={300} resetDelay={Infinity}>
        Hold to delete
      </HoldButton>,
    );
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    hold(400);
    fireEvent.pointerUp(button, { button: 0, pointerId: 1 });
    act(() => vi.advanceTimersByTime(60_000));
    hold(500);
    expect(button).toHaveAttribute("data-state", "complete");
  });

  it("does nothing when disabled", () => {
    const onHoldStart = vi.fn();
    render(
      <HoldButton disabled onHoldStart={onHoldStart}>
        Hold
      </HoldButton>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.keyDown(button, { key: " " });
    expect(onHoldStart).not.toHaveBeenCalled();
  });

  it("forwards its ref and keeps the caller's describedby", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <>
        <p id="warning">This cannot be undone.</p>
        <HoldButton ref={ref} aria-describedby="warning" hint="">
          Hold
        </HoldButton>
      </>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAccessibleDescription("This cannot be undone.");
  });
});
