import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Oscilloscope } from "@/components/ui/oscilloscope";

describe("Oscilloscope", () => {
  beforeEach(() => {
    // jsdom has no canvas; the component must cope without a 2D context.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => vi.restoreAllMocks());

  it("is decorative unless it is given a name", () => {
    const { container, rerender } = render(<Oscilloscope />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    rerender(<Oscilloscope aria-label="Sine wave at 200 Hz" />);
    expect(screen.getByRole("img", { name: "Sine wave at 200 Hz" })).toBeInTheDocument();
  });

  it("renders children over the screen", () => {
    render(
      <Oscilloscope>
        <span>CH1 500 mV/div</span>
      </Oscilloscope>,
    );
    expect(screen.getByText("CH1 500 mV/div")).toBeInTheDocument();
  });

  it("hides the graticule when grid is false", () => {
    const { container, rerender } = render(<Oscilloscope />);
    const grid = () => container.querySelectorAll("canvas")[0];
    expect(grid()).not.toHaveClass("hidden");
    rerender(<Oscilloscope grid={false} />);
    expect(grid()).toHaveClass("hidden");
  });

  it("applies an explicit color through --neon", () => {
    const { container } = render(<Oscilloscope color="#ff8800" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--neon")).toBe("255 136 0");
  });

  it("accepts every waveform and a live source without a canvas", () => {
    const source = { fftSize: 2048, getFloatTimeDomainData: vi.fn() } as unknown as AnalyserNode;
    const { rerender } = render(<Oscilloscope wave="square" />);
    for (const wave of ["saw", "triangle", "noise", "sine"] as const) rerender(<Oscilloscope wave={wave} />);
    rerender(<Oscilloscope source={source} persistence={0.95} speed={0} />);
    expect(source.getFloatTimeDomainData).not.toHaveBeenCalled();
  });

  it("forwards its ref and extra props to the root", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Oscilloscope ref={ref} data-testid="scope" className="h-40" />);
    const root = screen.getByTestId("scope");
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("h-40");
  });
});
