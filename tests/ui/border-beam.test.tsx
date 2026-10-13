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
    for (const beam of beams) expect(beam).toHaveAttribute("aria-hidden", "true");
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
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{ \.nk-beam \{ animation: none/);
  });

  it("forwards the ref and takes its color through --neon", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<BorderBeam ref={ref} color="pink" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("255 95 162");
  });
});
