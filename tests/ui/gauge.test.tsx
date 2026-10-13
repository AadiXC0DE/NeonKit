import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Gauge } from "@/components/ui/gauge";

describe("Gauge", () => {
  it("is a meter named by its label", () => {
    render(<Gauge label="Speed" unit="km/h" value={88} max={260} />);
    const meter = screen.getByRole("meter", { name: "Speed" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "260");
    expect(meter).toHaveAttribute("aria-valuenow", "88");
    expect(meter).toHaveAttribute("aria-valuetext", "88 km/h");
  });

  it("prefers aria-label over the printed legend", () => {
    render(<Gauge label="RPM" aria-label="Engine speed" value={3} max={8} />);
    expect(screen.getByRole("meter", { name: "Engine speed" })).toBeInTheDocument();
  });

  it("clamps the reading to the scale", () => {
    const { rerender } = render(<Gauge aria-label="Load" value={140} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    rerender(<Gauge aria-label="Load" value={-5} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "0");
  });

  it("formats the readout and the value read aloud", () => {
    render(<Gauge aria-label="CPU" value={42} formatValue={(v) => `${v}%`} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "42%");
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("keeps the precision of the value in the readout", () => {
    render(<Gauge aria-label="Boost" value={1.25} max={2} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "1.25");
  });

  it("numbers each interval of the scale", () => {
    render(<Gauge aria-label="Fuel" value={50} ticks={4} />);
    for (const n of ["0", "25", "50", "75", "100"]) expect(screen.getAllByText(n).length).toBeGreaterThan(0);
  });

  it("hides the dial from assistive tech", () => {
    const { container } = render(<Gauge aria-label="Temp" value={90} min={50} max={130} />);
    for (const svg of container.querySelectorAll("svg")) expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("follows a new value", () => {
    const { rerender } = render(<Gauge aria-label="Speed" value={10} />);
    rerender(<Gauge aria-label="Speed" value={60} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "60");
  });

  it("renders with a redline and zones", () => {
    render(
      <Gauge
        aria-label="Coolant"
        value={92}
        min={50}
        max={130}
        redline={115}
        zones={[
          { from: 50, to: 70, color: "blue" },
          { from: 80, to: 105, color: "#34d399" },
        ]}
      />,
    );
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "92");
  });

  it("forwards the ref and native props to the root", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Gauge ref={ref} aria-label="Speed" value={1} data-testid="gauge" />);
    expect(ref.current).toBe(screen.getByRole("meter"));
    expect(screen.getByTestId("gauge")).toBe(ref.current);
  });
  it("prints the legend under the hub, clear of the numerals", () => {
    const { container } = render(<Gauge value={40} label="Coolant" />);
    const legend = Array.from(container.querySelectorAll("text")).find((t) => t.textContent === "COOLANT");
    expect(Number(legend?.getAttribute("y"))).toBeGreaterThan(110);
  });

  it("uses a true minus sign on the scale and readout", () => {
    const { container } = render(<Gauge value={-62} min={-100} max={-30} />);
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("\u2212100");
    expect(texts).toContain("\u221262");
    expect(texts.some((t) => t?.startsWith("-"))).toBe(false);
  });
});
