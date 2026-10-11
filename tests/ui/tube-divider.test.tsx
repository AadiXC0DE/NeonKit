import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TubeDivider } from "@/components/ui/tube-divider";

describe("TubeDivider", () => {
  it("is decorative by default", () => {
    const { container } = render(<TubeDivider />);
    expect(screen.queryByRole("separator")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("role", "none");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes a horizontal separator when not decorative", () => {
    render(<TubeDivider decorative={false} aria-label="Line-up" />);
    const separator = screen.getByRole("separator", { name: "Line-up" });
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("draws every shape, with a taller box for bent tubes", () => {
    const heights: Record<string, number> = {};
    for (const shape of ["straight", "wave", "zigzag", "loop"] as const) {
      const { container, unmount } = render(<TubeDivider shape={shape} />);
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute("data-shape", shape);
      expect(container.querySelectorAll("path").length).toBeGreaterThan(4);
      heights[shape] = parseFloat(root.style.height);
      unmount();
    }
    expect(heights.wave).toBeGreaterThan(heights.straight);
    expect(heights.zigzag).toBe(heights.wave);
    expect(heights.loop).toBeGreaterThan(heights.wave);
  });

  it("blacks out the rear tube where the loop crosses itself", () => {
    const { container, rerender } = render(<TubeDivider shape="loop" />);
    const blackouts = () =>
      [...container.querySelectorAll("path")].filter((path) => path.style.stroke === "#07080c" || path.style.stroke === "rgb(7, 8, 12)");
    expect(blackouts()).toHaveLength(1);
    rerender(<TubeDivider shape="wave" />);
    expect(blackouts()).toHaveLength(0);
  });

  it("mounts the tube with clips unless turned off", () => {
    const clipCount = (container: HTMLElement) => container.querySelectorAll("g[transform^='translate']").length;
    const { container, rerender } = render(<TubeDivider />);
    expect(clipCount(container)).toBeGreaterThanOrEqual(2);
    rerender(<TubeDivider clips={false} />);
    expect(clipCount(container)).toBe(0);
  });

  it("goes dark when off and flickers back on", () => {
    const { container, rerender } = render(<TubeDivider />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-state", "on");
    // Steady at mount: no ignition.
    expect(container.querySelector(".nk-tube-divider-ignite")).toBeNull();
    rerender(<TubeDivider on={false} />);
    expect(root).toHaveAttribute("data-state", "off");
    rerender(<TubeDivider on />);
    expect(container.querySelector(".nk-tube-divider-ignite")).not.toBeNull();
  });

  it("only runs the flow pulse when asked", () => {
    const { container, rerender } = render(<TubeDivider />);
    expect(container.querySelector(".nk-tube-divider-flow")).toBeNull();
    rerender(<TubeDivider flow />);
    expect(container.querySelector(".nk-tube-divider-flow")).not.toBeNull();
  });

  it("applies an explicit color and forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<TubeDivider ref={ref} color="amber" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("251 191 36");
  });
});
