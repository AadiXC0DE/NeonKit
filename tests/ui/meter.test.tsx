import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Meter } from "@/components/ui/meter";

const segments = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(".nk-meter-seg"));
const lit = (root: HTMLElement) => root.querySelectorAll("[data-lit]").length;
const peakIndex = (root: HTMLElement) => segments(root).findIndex((node) => node.hasAttribute("data-peak"));

describe("Meter", () => {
  afterEach(() => vi.useRealTimers());

  it("is a meter that reports its level as a percentage", () => {
    render(<Meter aria-label="Input" value={0.5} />);
    const meter = screen.getByRole("meter", { name: "Input" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuenow", "50");
    expect(meter).toHaveAttribute("aria-valuetext", "50%");
  });

  it("is named by its visible label", () => {
    render(<Meter label="L" value={0.3} />);
    expect(screen.getByRole("meter", { name: "L" })).toBeInTheDocument();
  });

  it("lets aria-valuetext be replaced", () => {
    render(<Meter aria-label="Left" value={0.9} aria-valuetext="0 dBFS" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "0 dBFS");
  });

  it("lights segments in proportion to the value", () => {
    const { container, rerender } = render(<Meter aria-label="Level" value={0.5} />);
    expect(segments(container)).toHaveLength(24);
    expect(lit(container)).toBe(12);
    rerender(<Meter aria-label="Level" value={0.33} segments={10} />);
    expect(segments(container)).toHaveLength(10);
    expect(lit(container)).toBe(3);
  });

  it("clamps out-of-range values", () => {
    const { container, rerender } = render(<Meter aria-label="Level" value={1.4} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    expect(lit(container)).toBe(24);
    rerender(<Meter aria-label="Level" value={-2} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "0");
    expect(lit(container)).toBe(0);
  });

  it("colors segments by zone, using the neon color where a zone has none", () => {
    const { container } = render(<Meter aria-label="Level" value={0} />);
    const tint = (i: number) => segments(container)[i].style.getPropertyValue("--nk-meter-seg");
    expect(tint(0)).toBe("var(--neon)");
    expect(tint(18)).toBe("251 191 36");
    expect(tint(23)).toBe("255 77 94");
  });

  it("accepts custom zones in any order", () => {
    const { container } = render(
      <Meter
        aria-label="Level"
        value={0}
        segments={4}
        zones={[
          { from: 0.5, color: "#ff0000" },
          { from: 0, color: "blue" },
        ]}
      />,
    );
    const tints = segments(container).map((node) => node.style.getPropertyValue("--nk-meter-seg"));
    expect(tints).toEqual(["79 139 255", "79 139 255", "255 0 0", "255 0 0"]);
  });

  it("places a fixed peak marker", () => {
    const { container } = render(<Meter aria-label="Level" value={0.25} peak={0.75} segments={20} />);
    expect(peakIndex(container)).toBe(14);
  });

  it("holds the recent peak after the level drops, then lets it fall", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { container, rerender } = render(<Meter aria-label="Level" value={0.8} peakHold={500} />);
    expect(peakIndex(container)).toBe(18);
    rerender(<Meter aria-label="Level" value={0.2} peakHold={500} />);
    expect(lit(container)).toBe(5);
    vi.advanceTimersByTime(300);
    expect(peakIndex(container)).toBe(18);
    vi.advanceTimersByTime(2000);
    expect(peakIndex(container)).toBe(4);
  });

  it("shows no peak when peak is false", () => {
    const { container } = render(<Meter aria-label="Level" value={0.6} peak={false} />);
    expect(peakIndex(container)).toBe(-1);
  });

  it("applies an explicit color through --neon", () => {
    render(<Meter aria-label="Level" value={0.5} color="lime" />);
    expect(screen.getByRole("meter").style.getPropertyValue("--neon")).toBe("163 230 53");
  });

  it("exposes its orientation", () => {
    render(<Meter aria-label="Level" value={0.5} orientation="vertical" />);
    expect(screen.getByRole("meter")).toHaveAttribute("data-orientation", "vertical");
  });
});
