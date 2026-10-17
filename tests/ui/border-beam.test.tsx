import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BorderBeam } from "@/components/ui/border-beam";

describe("BorderBeam", () => {
  it("wraps its children and hides the beam from assistive tech", () => {
    const { container } = render(
      <BorderBeam>
        <p>Build #2841</p>
      </BorderBeam>,
    );
    expect(screen.getByText("Build #2841")).toBeInTheDocument();
    const beams = container.querySelectorAll(".nk-beam");
    expect(beams).toHaveLength(2);
    for (const beam of beams) expect(beam.closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "true");
  });

  it("passes speed, length, width and direction to the beam", () => {
    const { container } = render(<BorderBeam duration={3} size={120} borderWidth={2} reverse colorTo="magenta" />);
    const beam = container.querySelector<HTMLElement>(".nk-beam");
    expect(beam?.style.getPropertyValue("--nk-beam-duration")).toBe("3s");
    expect(beam?.style.getPropertyValue("--nk-beam-size")).toBe("120deg");
    expect(beam?.style.padding).toBe("2px");
    expect(beam?.style.animationDirection).toBe("reverse");
    expect(beam?.style.getPropertyValue("--nk-beam-to")).not.toBe("var(--neon)");
  });

  it("ends the beam in a white-hot head and holds it still under reduced motion", () => {
    const { container } = render(<BorderBeam />);
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("color-mix(in srgb, rgb(var(--neon)) 35%, white)");
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.nk-beam \{ animation: none/);
    expect(css).toMatch(/\.nk-beam-head \{ animation: none; offset-distance: calc\(30% - var\(--nk-beam-lag/);
    const head = container.querySelector<HTMLElement>(".nk-beam-head");
    expect(head?.style.background).toContain("35%, white");
  });

  it("forwards the ref and takes its color through --neon", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<BorderBeam ref={ref} color="pink" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("255 95 162");
  });

  it("sizes the head as a share of the outline and runs it backwards when reversed", () => {
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 300 });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 100 });
    try {
      const ref = React.createRef<HTMLDivElement>();
      const { container } = render(<BorderBeam ref={ref} size={90} reverse />);
      // A square-cornered 300 by 100 box has an 800px outline; 90 degrees is a quarter of it.
      expect(ref.current?.style.getPropertyValue("--nk-beam-length")).toBe("200px");
      expect(ref.current?.style.getPropertyValue("--nk-beam-radius")).toBe("0px");
      expect(container.querySelector(".nk-beam")).toHaveAttribute("data-reverse");
      // Two layers (beam and glow) of 12 segments, each a twelfth of the beam further behind.
      const heads = container.querySelectorAll<HTMLElement>(".nk-beam-head");
      expect(heads).toHaveLength(24);
      expect(heads[0].style.getPropertyValue("--nk-beam-delay")).toBe("-6s");
      expect(heads[1].style.getPropertyValue("--nk-beam-delay")).toBe(`${-6 * (1 - 0.25 / 12)}s`);
    } finally {
      if (width) Object.defineProperty(HTMLElement.prototype, "offsetWidth", width);
      if (height) Object.defineProperty(HTMLElement.prototype, "offsetHeight", height);
    }
  });
});
