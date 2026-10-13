import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GlitchText } from "@/components/ui/glitch-text";

const matchMedia = window.matchMedia;

describe("GlitchText", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.matchMedia = matchMedia;
  });

  it("is read once, with the colored copies hidden", () => {
    const { container } = render(<GlitchText as="h2">Signal lost</GlitchText>);
    expect(screen.getByRole("heading", { level: 2, name: "Signal lost" })).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it("glitches while active in manual mode", () => {
    const { container, rerender } = render(<GlitchText trigger="manual">Static</GlitchText>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveAttribute("data-active");
    rerender(
      <GlitchText trigger="manual" active>
        Static
      </GlitchText>,
    );
    expect(root).toHaveAttribute("data-active");
  });

  it("ignores active outside manual mode", () => {
    const { container } = render(
      <GlitchText trigger="hover" active>
        Static
      </GlitchText>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveAttribute("data-active");
    expect(root).toHaveAttribute("data-trigger", "hover");
  });

  it("fires short bursts every few seconds when always on", () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const { container } = render(<GlitchText intensity="heavy">Static</GlitchText>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveAttribute("data-burst");
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(root).toHaveAttribute("data-burst");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(root).not.toHaveAttribute("data-burst");
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(root).toHaveAttribute("data-burst");
  });

  it("bursts once when it comes into view", () => {
    vi.useFakeTimers();
    const { container } = render(<GlitchText trigger="inView">404</GlitchText>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-burst");
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(root).not.toHaveAttribute("data-burst");
  });

  it("stays still under reduced motion", () => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { container } = render(<GlitchText>Static</GlitchText>);
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(container.firstElementChild).not.toHaveAttribute("data-burst");
  });

  it("takes both split colors", () => {
    const { container } = render(
      <GlitchText color="lime" colorAlt="#ff00aa">
        Static
      </GlitchText>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--neon")).toBe("163 230 53");
    expect(root.style.getPropertyValue("--nk-glitch-alt")).toBe("rgb(255 0 170)");
  });

  it("forwards the ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <GlitchText ref={ref} as="p" id="g">
        Static
      </GlitchText>,
    );
    expect(ref.current?.tagName).toBe("P");
  });
  it("lets a hover-triggered glitch follow the link or button around it, keyboard focus included", () => {
    const { container } = render(
      <a href="#lab">
        <GlitchText trigger="hover">Lab</GlitchText>
      </a>,
    );
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain(':is(a, button):is(:hover, :focus-visible) .nk-glitch-text[data-trigger="hover"]');
  });
});
