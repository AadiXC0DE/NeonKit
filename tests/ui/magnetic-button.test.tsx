import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MagneticButton } from "@/components/ui/magnetic-button";

let frames: FrameRequestCallback[] = [];
let now = 0;

function runFrames(ms: number) {
  act(() => {
    const end = now + ms;
    while (now < end && frames.length) {
      now += 16;
      const queue = frames;
      frames = [];
      queue.forEach((callback) => callback(now));
    }
  });
}

function mockMedia({ fine = true, reduce = false } = {}) {
  window.matchMedia = ((query: string) =>
    ({
      matches: query.includes("pointer: fine") ? fine : query.includes("reduce") ? reduce : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
}

function place(element: HTMLElement) {
  element.getBoundingClientRect = () =>
    ({ left: 100, top: 100, right: 220, bottom: 140, width: 120, height: 40, x: 100, y: 100, toJSON() {} }) as DOMRect;
}

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  frames = [];
  now = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

describe("MagneticButton", () => {
  it("is a native button that clicks normally", () => {
    const onClick = vi.fn();
    render(<MagneticButton onClick={onClick}>Start a conversation</MagneticButton>);
    fireEvent.click(screen.getByRole("button", { name: "Start a conversation" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("leans toward a nearby pointer, label further, and springs back", () => {
    mockMedia();
    render(<MagneticButton>Book</MagneticButton>);
    const button = screen.getByRole("button", { name: "Book" });
    place(button);
    const label = button.querySelector("span:last-child") as HTMLElement;

    // Right of the button's center, inside it.
    fireEvent.pointerMove(window, { clientX: 210, clientY: 120, pointerType: "mouse" });
    runFrames(1500);
    const [x, y] = button.style.translate.split(" ").map(parseFloat);
    expect(x).toBeGreaterThan(5);
    expect(Math.abs(y)).toBeLessThan(0.5);
    const [labelX] = label.style.translate.split(" ").map(parseFloat);
    expect(labelX).toBeGreaterThan(0);
    expect(labelX).toBeLessThan(x);
    expect(Number(button.style.getPropertyValue("--nk-magnetic-button-pull"))).toBeGreaterThan(0.9);

    // Far away: back to rest.
    fireEvent.pointerMove(window, { clientX: 600, clientY: 600, pointerType: "mouse" });
    runFrames(3000);
    expect(parseFloat(button.style.translate)).toBeCloseTo(0, 1);
  });

  it("ignores pointers beyond the radius", () => {
    mockMedia();
    render(<MagneticButton radius={20}>Book</MagneticButton>);
    const button = screen.getByRole("button", { name: "Book" });
    place(button);
    fireEvent.pointerMove(window, { clientX: 260, clientY: 120, pointerType: "mouse" });
    runFrames(500);
    expect(button.style.translate).toBe("");
  });

  it("stays still for touch, coarse pointers, reduced motion and when disabled", () => {
    mockMedia({ fine: false });
    const { unmount } = render(<MagneticButton>Book</MagneticButton>);
    let button = screen.getByRole("button", { name: "Book" });
    place(button);
    fireEvent.pointerMove(window, { clientX: 210, clientY: 120, pointerType: "mouse" });
    runFrames(500);
    expect(button.style.translate).toBe("");
    unmount();

    mockMedia({ reduce: true });
    const second = render(<MagneticButton>Book</MagneticButton>);
    button = screen.getByRole("button", { name: "Book" });
    place(button);
    fireEvent.pointerMove(window, { clientX: 210, clientY: 120, pointerType: "mouse" });
    runFrames(500);
    expect(button.style.translate).toBe("");
    second.unmount();

    mockMedia();
    render(<MagneticButton disabled>Book</MagneticButton>);
    button = screen.getByRole("button", { name: "Book" });
    place(button);
    fireEvent.pointerMove(window, { clientX: 210, clientY: 120, pointerType: "touch" });
    runFrames(500);
    expect(button.style.translate).toBe("");
    expect(button).toBeDisabled();
  });

  it("renders its child with asChild and forwards refs", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <MagneticButton asChild ref={ref}>
        <a href="https://github.com/AadiXC0DE/NeonKit">Star on GitHub</a>
      </MagneticButton>,
    );
    const link = screen.getByRole("link", { name: "Star on GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/AadiXC0DE/NeonKit");
    expect(ref.current).toBe(link);
  });

  it("cleans up its listeners on unmount", () => {
    mockMedia();
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<MagneticButton>Book</MagneticButton>);
    unmount();
    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(["pointermove", "pointerout", "blur"]));
  });
});
