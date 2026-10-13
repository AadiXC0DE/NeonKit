import * as React from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NeonText } from "@/components/ui/neon-text";

const matchMedia = window.matchMedia;

describe("NeonText", () => {
  afterEach(() => {
    window.matchMedia = matchMedia;
  });

  // Runs first: motion reads the preference once, on its first use in the file.
  it("starts dark on the first frame even under reduced motion, matching the server markup", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as typeof window.matchMedia;
    const html = renderToString(<NeonText>open</NeonText>);
    expect(html.match(/opacity:0/g)).toHaveLength(4);
  });

  it("gives screen readers the whole string once and hides the letters", () => {
    const { container } = render(<NeonText>open late</NeonText>);
    expect(screen.getByText("open late")).toHaveClass("sr-only");
    const letters = container.querySelectorAll("[aria-hidden] > span");
    expect(letters).toHaveLength("open late".length);
  });

  it("renders the element it is asked for and forwards the ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <NeonText as="h2" ref={ref}>
        Bar
      </NeonText>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });

  it("swaps the lit tube for unlit glass when switched off", () => {
    const { container, rerender } = render(<NeonText>Taxi</NeonText>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("text-shadow:0_0_0.015em");
    rerender(<NeonText on={false}>Taxi</NeonText>);
    expect(root.className).toContain("text-[rgb(var(--neon)/0.16)]");
    expect(root.className).not.toContain("text-shadow:0_0_0.015em");
  });

  it("sizes the glow in em so it scales with the lettering", () => {
    const { container } = render(<NeonText>Live</NeonText>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/0_0_\d+px_rgb/);
  });

  it("lights non-string children as one piece", () => {
    render(
      <NeonText>
        <b>24</b>h
      </NeonText>,
    );
    expect(screen.getByText("24").tagName).toBe("B");
  });

  it("takes its color through --neon", () => {
    const { container } = render(<NeonText color="pink">Bar</NeonText>);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--neon")).toBe("255 95 162");
  });
});
