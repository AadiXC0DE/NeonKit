import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RetroGrid } from "@/components/ui/retro-grid";

describe("RetroGrid", () => {
  it("is decorative", () => {
    const { container } = render(<RetroGrid />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("pointer-events-none");
  });

  it("passes cell size, speed and line opacity through CSS variables", () => {
    const { container } = render(<RetroGrid cellSize={40} speed={0.8} opacity={0.3} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--cell")).toBe("40px");
    expect(root.style.getPropertyValue("--speed")).toBe("0.8s");
    expect(root.style.getPropertyValue("--line")).toBe("0.3");
  });

  it("only animates when it has a speed, and stops under reduced motion", () => {
    const { container, rerender } = render(<RetroGrid />);
    expect(container.querySelector(".nk-retro-grid")).not.toBeNull();
    expect(container.querySelector("style")?.textContent).toContain("prefers-reduced-motion: reduce");
    rerender(<RetroGrid speed={0} />);
    expect(container.querySelector(".nk-retro-grid")).toBeNull();
  });

  it("drops the horizon line and sky glow when asked", () => {
    const { container, rerender } = render(<RetroGrid />);
    const withHorizon = container.querySelectorAll("div").length;
    rerender(<RetroGrid horizon={false} />);
    expect(container.querySelectorAll("div").length).toBe(withHorizon - 2);
  });

  it("tilts the floor by angle and forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<RetroGrid ref={ref} angle={60} />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(container.querySelector<HTMLElement>("[style*='rotateX']")?.style.transform).toContain("rotateX(60deg)");
  });

  it("sets perspective from the angle so the horizon sits on the line", () => {
    const { container, rerender } = render(<RetroGrid angle={60} />);
    // tan(60°) ≈ 1.732: perspective is the floor height times that.
    expect(container.querySelector<HTMLElement>("[style*='perspective']")?.style.perspective).toMatch(/173\.2/);
    rerender(<RetroGrid angle={120} />);
    expect(container.querySelector<HTMLElement>("[style*='rotateX']")?.style.transform).toContain("rotateX(88deg)");
  });
});
