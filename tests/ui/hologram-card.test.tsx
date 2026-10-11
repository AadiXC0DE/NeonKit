import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HologramCard } from "@/components/ui/hologram-card";

const motionSettings = vi.hoisted(() => ({ reduced: false }));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => motionSettings.reduced };
});

afterEach(() => {
  motionSettings.reduced = false;
});

// jsdom has no layout; give the card a 200 x 280 box at the origin.
function sized(card: HTMLElement) {
  Object.defineProperty(card, "offsetWidth", { configurable: true, value: 200 });
  Object.defineProperty(card, "offsetHeight", { configurable: true, value: 280 });
  card.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 200, bottom: 280, width: 200, height: 280, x: 0, y: 0, toJSON() {} }) as DOMRect;
  return card;
}

function tiltOf(card: HTMLElement) {
  const match = /rotateX\((-?[\d.]+)deg\) rotateY\((-?[\d.]+)deg\)/.exec(card.style.transform);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
}

describe("HologramCard", () => {
  it("renders its content and reads color through --neon", () => {
    render(
      <HologramCard data-testid="card" color="magenta">
        <h3>Kowloon Nights</h3>
      </HologramCard>,
    );
    expect(screen.getByRole("heading", { name: "Kowloon Nights" })).toBeInTheDocument();
    expect(screen.getByTestId("card").style.getPropertyValue("--neon")).toBe("240 70 235");
  });

  it("keeps every light layer away from assistive tech and the pointer", () => {
    render(
      <HologramCard data-testid="card">
        <a href="/changelog">Release 1.2</a>
      </HologramCard>,
    );
    const card = screen.getByTestId("card");
    const decorative = Array.from(card.children).filter((child) => child.tagName === "DIV");
    expect(decorative.length).toBeGreaterThan(0);
    for (const layer of decorative) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
      expect(layer.className).toContain("pointer-events-none");
    }
    expect(screen.getByRole("link", { name: "Release 1.2" })).toBeInTheDocument();
  });

  it("applies the chosen foil texture", () => {
    const { container } = render(<HologramCard foil="glitter">Pass</HologramCard>);
    const foils = container.querySelectorAll("[data-foil]");
    expect(foils.length).toBeGreaterThan(0);
    foils.forEach((foil) => expect(foil).toHaveAttribute("data-foil", "glitter"));
  });

  it("tilts toward the pointer and springs back flat when it leaves", async () => {
    render(<HologramCard data-testid="card">Card</HologramCard>);
    const card = sized(screen.getByTestId("card"));

    fireEvent.pointerEnter(card, { clientX: 190, clientY: 20 });
    fireEvent.pointerMove(card, { clientX: 190, clientY: 20 });
    // Pointer at the top right: the top edge leans back, the right edge comes forward.
    await waitFor(() => {
      const tilt = tiltOf(card);
      expect(tilt?.x).toBeLessThan(-6);
      expect(tilt?.y).toBeLessThan(-6);
    });
    const tilt = tiltOf(card)!;
    expect(Math.abs(tilt.x)).toBeLessThanOrEqual(12.5);
    expect(Math.abs(tilt.y)).toBeLessThanOrEqual(12.5);

    fireEvent.pointerLeave(card);
    await waitFor(
      () => {
        const settled = tiltOf(card);
        expect(Math.abs(settled?.x ?? 1)).toBeLessThan(0.05);
        expect(Math.abs(settled?.y ?? 1)).toBeLessThan(0.05);
      },
      { timeout: 3000 },
    );
  });

  it("respects maxTilt", async () => {
    render(
      <HologramCard data-testid="card" maxTilt={4}>
        Card
      </HologramCard>,
    );
    const card = sized(screen.getByTestId("card"));
    fireEvent.pointerEnter(card, { clientX: 0, clientY: 280 });
    await waitFor(() => expect(tiltOf(card)?.x).toBeGreaterThan(3));
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(tiltOf(card)!.x).toBeLessThanOrEqual(4.4);
  });

  it("tilts slightly when keyboard focus lands inside", async () => {
    render(
      <HologramCard data-testid="card">
        <a href="/changelog">Release 1.2</a>
      </HologramCard>,
    );
    const card = screen.getByTestId("card");
    // jsdom never reports :focus-visible; pretend the focus came from the keyboard.
    const matches = Element.prototype.matches;
    const spy = vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, selector: string) {
      return selector === ":focus-visible" ? true : matches.call(this, selector);
    });
    screen.getByRole("link").focus();
    spy.mockRestore();
    await waitFor(() => expect(Math.abs(tiltOf(card)?.y ?? 0)).toBeGreaterThan(1));
    expect(Math.abs(tiltOf(card)!.y)).toBeLessThan(6);
  });

  it("calls the consumer's pointer and focus handlers", () => {
    const onPointerMove = vi.fn();
    const onFocus = vi.fn();
    render(
      <HologramCard data-testid="card" onPointerMove={onPointerMove} onFocus={onFocus}>
        <button type="button">Flip</button>
      </HologramCard>,
    );
    fireEvent.pointerMove(sized(screen.getByTestId("card")), { clientX: 10, clientY: 10 });
    screen.getByRole("button", { name: "Flip" }).focus();
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("stays flat under reduced motion", async () => {
    motionSettings.reduced = true;
    render(<HologramCard data-testid="card">Card</HologramCard>);
    const card = sized(screen.getByTestId("card"));
    fireEvent.pointerEnter(card, { clientX: 190, clientY: 20 });
    fireEvent.pointerMove(card, { clientX: 190, clientY: 20 });
    fireEvent.pointerLeave(card);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(card.style.transform).toBe("");
    // The still sheen keeps its pose instead of drifting back to the centre.
    const glare = card.querySelector("[class*='mix-blend-soft-light']") as HTMLElement;
    expect(glare.style.opacity).toBe("0.55");
  });
});
