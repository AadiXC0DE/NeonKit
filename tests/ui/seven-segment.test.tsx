import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SevenSegment } from "@/components/ui/seven-segment";

// Two stacked SVGs: unlit glass first, lit segments second.
const lit = () => screen.getByRole("img").querySelectorAll("svg")[1];
const digits = () => lit().querySelectorAll("[data-digit]");
const litPerDigit = () =>
  Array.from(digits()).map((digit) => digit.querySelectorAll("polygon[data-on]").length);

describe("SevenSegment", () => {
  it("is an image labelled with the value", () => {
    render(<SevenSegment value="12:45" />);
    expect(screen.getByRole("img", { name: "12:45" })).toBeInTheDocument();
  });

  it("accepts its own label", () => {
    render(<SevenSegment value="12:48" aria-label="12 minutes 48 seconds left" />);
    expect(screen.getByRole("img", { name: "12 minutes 48 seconds left" })).toBeInTheDocument();
  });

  it("lights the right segments for each digit", () => {
    render(<SevenSegment value="8170" />);
    expect(litPerDigit()).toEqual([7, 2, 3, 6]);
  });

  it("renders hex letters, minus and space", () => {
    render(<SevenSegment value="Ab- F" />);
    expect(litPerDigit()).toEqual([6, 5, 1, 0, 4]);
  });

  it("renders colons as their own narrow cell", () => {
    render(<SevenSegment value="12:34" />);
    expect(digits()).toHaveLength(4);
    expect(lit().querySelectorAll("[data-colon]")).toHaveLength(1);
  });

  it("attaches a point to the digit before it", () => {
    render(<SevenSegment value="12.5" />);
    expect(digits()).toHaveLength(3);
    const points = Array.from(digits()).map((digit) => digit.querySelector("circle")?.hasAttribute("data-on"));
    expect(points).toEqual([false, true, false]);
  });

  it("leaves out point slots when the value has no point", () => {
    render(<SevenSegment value="1234" />);
    expect(lit().querySelector("circle")).toBeNull();
  });

  it("pads with unlit digits", () => {
    render(<SevenSegment value={7} digits={3} />);
    expect(litPerDigit()).toEqual([0, 0, 3]);
  });

  it("renders unknown characters blank", () => {
    render(<SevenSegment value="Q" />);
    expect(litPerDigit()).toEqual([0]);
  });

  it("sets the unlit level", () => {
    render(<SevenSegment value="1" unlit={0.2} />);
    expect(screen.getByRole("img").querySelector("svg")?.style.fill).toContain("0.2");
  });

  it("sizes digits through --segment-h", () => {
    const { rerender } = render(<SevenSegment value="1" size={60} />);
    expect(screen.getByRole("img").style.getPropertyValue("--segment-h")).toBe("60px");
    rerender(<SevenSegment value="1" size="lg" />);
    expect(screen.getByRole("img")).toHaveClass("[--segment-h:72px]");
    rerender(<SevenSegment value="1" className="[--segment-h:20px]" />);
    expect(screen.getByRole("img")).toHaveClass("[--segment-h:20px]");
    expect(screen.getByRole("img")).not.toHaveClass("[--segment-h:48px]");
  });

  it("blinks colons only when asked", () => {
    const { rerender } = render(<SevenSegment value="12:00" />);
    expect(lit().querySelector("[data-colon]")).not.toHaveClass("nk-seven-segment-blink");
    rerender(<SevenSegment value="12:00" colonBlink />);
    expect(lit().querySelector("[data-colon]")).toHaveClass("nk-seven-segment-blink");
  });

  it("takes a color", () => {
    render(<SevenSegment value="0" color="red" />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("255 77 94");
  });
});
