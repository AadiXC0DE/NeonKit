import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NeonIcon } from "@/components/ui/neon-icon";

const litLevels = (container: HTMLElement) => container.querySelectorAll('[data-part="level"][data-lit]').length;

describe("NeonIcon", () => {
  it("is an image that describes its level", () => {
    render(<NeonIcon icon="signal" value={0.75} />);
    expect(screen.getByRole("img", { name: "Signal: 3 of 4 bars" })).toHaveAttribute("data-level", "3");
  });

  it("lights at least one segment for any value above zero", () => {
    const { container, rerender } = render(<NeonIcon icon="wifi" value={0.05} />);
    expect(litLevels(container)).toBe(1);
    expect(screen.getByRole("img")).toHaveAccessibleName("Wi-Fi: 1 of 3 bars");
    rerender(<NeonIcon icon="wifi" value={0} />);
    expect(litLevels(container)).toBe(0);
    expect(screen.getByRole("img")).toHaveAccessibleName("Wi-Fi off");
    rerender(<NeonIcon icon="wifi" value={1} />);
    expect(litLevels(container)).toBe(3);
  });

  it("clamps out-of-range values", () => {
    const { container } = render(<NeonIcon icon="battery" value={1.6} />);
    expect(litLevels(container)).toBe(4);
    expect(screen.getByRole("img")).toHaveAccessibleName("Battery 100%");
  });

  it("plays a rising change in sequence from the old level", () => {
    const { container, rerender } = render(<NeonIcon icon="signal" value={0.25} />);
    const animations = () =>
      [...container.querySelectorAll('[data-part="level"] g g')].map((g) => (g as HTMLElement).style.animation);
    // Steady on mount.
    expect(animations().every((a) => a === "")).toBe(true);
    rerender(<NeonIcon icon="signal" value={1} />);
    const after = animations();
    expect(after[0]).toBe("");
    expect(after[1]).toContain("linear 0ms");
    expect(after[2]).toContain("linear 90ms");
    expect(after[3]).toContain("linear 180ms");
  });

  it("goes out from the top when the level falls", () => {
    const { container, rerender } = render(<NeonIcon icon="signal" value={1} />);
    rerender(<NeonIcon icon="signal" value={0.25} />);
    const delays = [...container.querySelectorAll('[data-part="level"] > g')].map((g) => (g as HTMLElement).style.transition);
    expect(delays[0]).toBe("none");
    expect(delays[3]).toContain("0ms");
    expect(delays[2]).toContain("60ms");
    expect(delays[1]).toContain("120ms");
  });

  it("describes charging and searching", () => {
    const { rerender } = render(<NeonIcon icon="battery" value={0.64} animated />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Battery 64%, charging");
    rerender(<NeonIcon icon="signal" value={0} animated />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Searching for signal");
    rerender(<NeonIcon icon="bell" animated />);
    expect(screen.getByRole("img")).toHaveAccessibleName("New notifications");
  });

  it("treats single-part icons as on or off", () => {
    const { container, rerender } = render(<NeonIcon icon="power" />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Power on");
    expect(container.querySelectorAll("[data-lit]").length).toBe(2);
    rerender(<NeonIcon icon="power" value={0} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Power off");
    expect(container.querySelectorAll("[data-lit]").length).toBe(0);
  });

  it("lights the bell's sound arcs only while ringing", () => {
    const { container, rerender } = render(<NeonIcon icon="bell" />);
    expect(container.querySelectorAll('[data-part="ring"][data-lit]').length).toBe(0);
    rerender(<NeonIcon icon="bell" animated />);
    expect(container.querySelectorAll('[data-part="ring"][data-lit]').length).toBe(2);
  });

  it("turns a low battery red unless a color is given", () => {
    const { rerender } = render(<NeonIcon icon="battery" value={0.15} />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("255 77 94");
    rerender(<NeonIcon icon="battery" value={0.15} animated />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("");
    rerender(<NeonIcon icon="battery" value={0.15} color="amber" />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("251 191 36");
  });

  it("takes a label, a size and drops its role when hidden", () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { rerender } = render(<NeonIcon ref={ref} icon="heart" label="Liked" size="lg" />);
    expect(screen.getByRole("img", { name: "Liked" })).toBe(ref.current);
    expect(ref.current?.style.width).toBe("24px");
    rerender(<NeonIcon ref={ref} icon="heart" size={40} aria-hidden />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(ref.current).not.toHaveAttribute("aria-label");
    expect(ref.current?.style.height).toBe("40px");
  });
});
