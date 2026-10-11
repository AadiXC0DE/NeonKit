import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LedMatrix } from "@/components/ui/led-matrix";

function stubCanvas() {
  const ctx = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: "",
    shadowColor: "",
    shadowBlur: 0,
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  const paths: { arcs: number }[] = [];
  vi.stubGlobal(
    "Path2D",
    class {
      arcs = 0;
      constructor() {
        paths.push(this);
      }
      moveTo() {}
      arc() {
        this.arcs++;
      }
    },
  );
  return { ctx, paths };
}

describe("LedMatrix", () => {
  // jsdom has no canvas; start every test without a context, as it really is there.
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("is an image labelled with the text, with the canvas hidden", () => {
    const { container } = render(<LedMatrix text="Next train 23:14" />);
    expect(screen.getByRole("img", { name: "Next train 23:14" })).toBeInTheDocument();
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders without a 2D context", () => {
    expect(() => render(<LedMatrix text="Hello" />)).not.toThrow();
  });

  it("sizes the canvas from rows, dot size and gap", () => {
    const { container } = render(<LedMatrix text="OPEN" rows={9} dotSize={4} gap={2} />);
    expect(container.querySelector("canvas")?.style.height).toBe(`${9 * 6 - 2}px`);
  });

  it("lights one dot per font pixel when held still", () => {
    const { paths } = stubCanvas();
    render(<LedMatrix text="I" columns={20} speed={0} />);
    // "I" is 3 columns wide: a top bar, a stem and a bottom bar = 11 lit pixels.
    const [halo] = paths.slice(-2);
    expect(halo.arcs).toBe(11);
  });

  it("draws nothing lit for a blank message", () => {
    const { paths } = stubCanvas();
    render(<LedMatrix text="   " columns={20} speed={0} />);
    expect(paths.slice(-2).map((path) => path.arcs)).toEqual([0, 0]);
  });

  it("fixes the width in dots with columns", () => {
    stubCanvas();
    const { container } = render(<LedMatrix text="42" columns={13} dotSize={5} gap={1} />);
    expect(container.querySelector("canvas")?.style.width).toBe(`${13 * 6 - 1}px`);
  });

  it("takes a color and spreads props", () => {
    render(<LedMatrix text="ON AIR" color="red" aria-label="On air" data-testid="sign" />);
    const sign = screen.getByTestId("sign");
    expect(sign).toHaveAccessibleName("On air");
    expect(sign.style.getPropertyValue("--neon")).toBe("255 77 94");
  });
});
