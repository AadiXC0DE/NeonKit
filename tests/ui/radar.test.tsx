import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Radar } from "@/components/ui/radar";

const blips = [
  { angle: 38, distance: 0.62, label: "BAW 117" },
  { angle: 205, distance: 0.78 },
];

describe("Radar", () => {
  it("names itself with a summary of the contacts", () => {
    render(<Radar blips={blips} />);
    expect(screen.getByRole("img", { name: "Radar: 2 contacts. BAW 117 at bearing 038, 62% range" })).toBeInTheDocument();
  });

  it("uses the label and counts a single contact", () => {
    render(<Radar label="Approach" blips={[{ angle: 0, distance: 0.5 }]} />);
    expect(screen.getByRole("img", { name: "Approach: 1 contact" })).toBeInTheDocument();
  });

  it("lets aria-label replace the summary", () => {
    render(<Radar blips={blips} aria-label="Three aircraft inbound" />);
    expect(screen.getByRole("img", { name: "Three aircraft inbound" })).toBeInTheDocument();
  });

  it("plots each blip by bearing and distance", () => {
    const { container } = render(
      <Radar
        blips={[
          { angle: 90, distance: 1 },
          { angle: 180, distance: 0.5 },
        ]}
      />,
    );
    const [east, south] = Array.from(container.querySelectorAll<HTMLElement>("[data-radar-blip]"));
    expect(east.style.left).toBe("98%");
    expect(east.style.top).toBe("50%");
    expect(south.style.left).toBe("50%");
    expect(south.style.top).toBe("74%");
  });

  it("draws labels and per-blip colors", () => {
    const { container } = render(<Radar blips={[{ angle: 300, distance: 0.4, label: "UNKNOWN", color: "amber" }]} />);
    const blip = container.querySelector<HTMLElement>("[data-radar-blip]")!;
    expect(blip).toHaveTextContent("UNKNOWN");
    expect(blip.style.getPropertyValue("--nk-radar-tint")).toBe("251 191 36");
  });

  it("draws the requested number of range rings", () => {
    const { container } = render(<Radar rings={6} />);
    const scope = container.querySelectorAll("svg")[1];
    expect(scope.querySelectorAll("circle")).toHaveLength(6);
  });

  it("sets the sweep period from speed", () => {
    render(<Radar speed={2.5} />);
    expect(screen.getByRole("img").style.getPropertyValue("--nk-radar-period")).toBe("2500ms");
  });

  it("accepts a named size or a diameter", () => {
    const { rerender } = render(<Radar size="lg" />);
    expect(screen.getByRole("img")).toHaveClass("w-[360px]", "aspect-square");
    rerender(<Radar size={180} />);
    expect(screen.getByRole("img").style.width).toBe("180px");
  });

  it("starts its animations once mounted", () => {
    render(<Radar blips={blips} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-live");
  });

  it("applies an explicit color through --neon", () => {
    render(<Radar color="green" />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("52 211 153");
  });
  it("rounds every trig-derived coordinate so server and browser markup match", () => {
    const { container } = render(<Radar blips={[{ angle: 47, distance: 0.63, label: "AB12" }]} />);
    const attrs = Array.from(container.querySelectorAll("line, text")).flatMap((node) =>
      ["x", "y", "x1", "y1", "x2", "y2"].map((name) => node.getAttribute(name)).filter(Boolean),
    );
    expect(attrs.length).toBeGreaterThan(0);
    for (const value of attrs) expect(value).toMatch(/^-?\d+(\.\d{1,3})?$/);
    const blip = container.querySelector<HTMLElement>("[data-radar-blip]");
    expect(blip?.style.left).toMatch(/^\d+(\.\d{1,3})?%$/);
  });
});
