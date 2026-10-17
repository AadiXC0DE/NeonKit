import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CrtOverlay } from "@/components/ui/crt-overlay";

const screenOf = (container: HTMLElement) => container.querySelector("[data-phase]") as HTMLElement;
const contentOf = () => screen.getByText("Insert coin").parentElement as HTMLElement;

// Without AnimationEvent, React listens for the prefixed name; send both.
function endAnimation(element: HTMLElement) {
  fireEvent(element, new Event("webkitAnimationEnd", { bubbles: true }));
  fireEvent.animationEnd(element);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("CrtOverlay", () => {
  it("wraps content and reads color through --neon", () => {
    const { container } = render(
      <CrtOverlay color="amber">
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(screen.getByText("Insert coin")).toBeVisible();
    expect(root).toHaveAttribute("data-state", "on");
    expect(root.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(screenOf(container)).toHaveAttribute("data-phase", "on");
  });

  it("only plays the power-on animation at mount when asked", () => {
    const { container, rerender } = render(
      <CrtOverlay>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    expect(screenOf(container)).toHaveAttribute("data-phase", "on");
    rerender(
      <CrtOverlay key="again" animateOnMount>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    expect(screenOf(container)).toHaveAttribute("data-phase", "booting");
  });

  it("powers off through a collapse, then hides the content from assistive tech", () => {
    const onPowerComplete = vi.fn();
    const { container, rerender } = render(
      <CrtOverlay onPowerComplete={onPowerComplete}>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    rerender(
      <CrtOverlay on={false} onPowerComplete={onPowerComplete}>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    const tube = screenOf(container);
    expect(tube).toHaveAttribute("data-phase", "shutting");
    expect(container.firstElementChild).toHaveAttribute("data-state", "off");
    expect(contentOf()).toHaveAttribute("aria-hidden", "true");
    expect(contentOf().inert).toBe(true);
    // A phosphor dot is left behind as the picture collapses.
    expect(container.querySelector(".nk-crt-overlay-afterglow")).not.toBeNull();

    endAnimation(tube);
    expect(tube).toHaveAttribute("data-phase", "off");
    expect(onPowerComplete).toHaveBeenCalledWith(false);
  });

  it("powers back on and restores the content", () => {
    const onPowerComplete = vi.fn();
    const { container, rerender } = render(
      <CrtOverlay on={false} onPowerComplete={onPowerComplete}>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    expect(screenOf(container)).toHaveAttribute("data-phase", "off");
    // Mounting dark leaves no afterglow: nothing was switched off.
    expect(container.querySelector(".nk-crt-overlay-afterglow")).toBeNull();

    rerender(
      <CrtOverlay on onPowerComplete={onPowerComplete}>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    const tube = screenOf(container);
    expect(tube).toHaveAttribute("data-phase", "booting");
    expect(contentOf()).not.toHaveAttribute("aria-hidden");
    expect(contentOf().inert).toBe(false);

    endAnimation(tube);
    expect(tube).toHaveAttribute("data-phase", "on");
    expect(onPowerComplete).toHaveBeenCalledWith(true);
  });

  it("finishes the power cycle even if animationend never fires", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <CrtOverlay>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    rerender(
      <CrtOverlay on={false}>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screenOf(container)).toHaveAttribute("data-phase", "off");
  });

  it("ignores animationend bubbling up from inner layers", () => {
    const { container, rerender } = render(
      <CrtOverlay>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    rerender(
      <CrtOverlay on={false}>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    endAnimation(container.querySelector(".nk-crt-overlay-flash") as HTMLElement);
    expect(screenOf(container)).toHaveAttribute("data-phase", "shutting");
  });

  it("switches individual effects off", () => {
    const { container, rerender } = render(
      <CrtOverlay>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    expect(container.querySelector(".nk-crt-overlay-flicker")).not.toBeNull();
    expect(contentOf().style.textShadow).not.toBe("");

    rerender(
      <CrtOverlay flicker={false} chromatic={false} glow={false}>
        <p>Insert coin</p>
      </CrtOverlay>,
    );
    expect(container.querySelector(".nk-crt-overlay-flicker")).toBeNull();
    expect(container.querySelector(".nk-crt-overlay-roll")).toBeNull();
    expect(contentOf().style.textShadow).toBe("");
  });

  it("keeps every overlay away from assistive tech and the pointer", () => {
    const { container } = render(
      <CrtOverlay phosphor curvature>
        <button type="button">Dial in</button>
      </CrtOverlay>,
    );
    expect(screen.getByRole("button", { name: "Dial in" })).toBeInTheDocument();
    const layers = container.querySelectorAll('[aria-hidden="true"]');
    expect(layers.length).toBeGreaterThan(0);
    layers.forEach((layer) => expect(layer.className).toContain("pointer-events-none"));
  });
});
