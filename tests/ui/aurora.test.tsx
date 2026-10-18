import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Aurora } from "@/components/ui/aurora";

const bands = (root: Element) => Array.from(root.querySelectorAll<HTMLElement>("[class*='nk-aurora-band']"));
const curtains = (root: Element) => Array.from(root.querySelectorAll<HTMLElement>("div")).filter((node) => node.style.getPropertyValue("--nk-c"));

describe("Aurora", () => {
  it("is a decorative layer that fills its parent", () => {
    const { container } = render(<Aurora />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
  });

  it("draws three drifting curtains, each with rippling rays", () => {
    const { container } = render(<Aurora />);
    expect(bands(container)).toHaveLength(3);
    for (const band of bands(container)) expect(band.querySelector(".nk-aurora-rays")).toBeInTheDocument();
  });

  it("derives every default tint from --neon", () => {
    const { container } = render(<Aurora />);
    for (const curtain of curtains(container)) expect(curtain.style.getPropertyValue("--nk-c")).toContain("var(--neon)");
  });

  it("takes custom colors front to back and keeps the derived tint for the rest", () => {
    const { container } = render(<Aurora colors={["green", "#9effd0"]} />);
    const tints = curtains(container).map((curtain) => curtain.style.getPropertyValue("--nk-c"));
    expect(tints[0]).toBe("rgb(52 211 153)");
    expect(tints[1]).toBe("rgb(158 255 208)");
    expect(tints[2]).toContain("var(--neon)");
  });

  it("holds still at speed 0", () => {
    const { container } = render(<Aurora speed={0} />);
    expect(bands(container)).toHaveLength(0);
    expect(container.querySelector(".nk-aurora-rays")).toBeNull();
  });

  it("scales every duration with speed", () => {
    const slow = render(<Aurora speed={0.5} />);
    const fast = render(<Aurora speed={2} />);
    const duration = (root: Element) => parseFloat(bands(root)[0].style.getPropertyValue("--nk-d"));
    expect(duration(slow.container)).toBeCloseTo(duration(fast.container) * 4);
  });

  it("ships prefixed keyframes with a reduced-motion fallback", () => {
    const { container } = render(<Aurora />);
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("@keyframes nk-aurora-drift-0");
    expect(css).not.toMatch(/@keyframes (?!nk-aurora-)/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[^}]*animation: none/);
  });

  it("forwards the ref, applies color and opacity, and keeps the caller's style", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Aurora ref={ref} color="violet" opacity={0.4} style={{ zIndex: 0 }} />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("168 85 247");
    expect(ref.current?.style.opacity).toBe("0.4");
    expect(ref.current?.style.zIndex).toBe("0");
  });
});
