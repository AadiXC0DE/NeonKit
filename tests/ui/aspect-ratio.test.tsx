import * as React from "react";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AspectRatio } from "@/components/ui/aspect-ratio";

describe("AspectRatio", () => {
  it("sets aspect-ratio from a number or a string", () => {
    const { container, rerender } = render(<AspectRatio ratio={16 / 9} data-testid="box" />);
    const box = container.firstElementChild as HTMLElement;
    const ratio = () => parseFloat(box.style.aspectRatio);
    expect(ratio()).toBeCloseTo(16 / 9);
    rerender(<AspectRatio ratio="4:3" />);
    expect(ratio()).toBeCloseTo(4 / 3);
    rerender(<AspectRatio ratio="21/9" />);
    expect(ratio()).toBeCloseTo(21 / 9);
  });

  it("falls back to a square for nonsense", () => {
    const { container, rerender } = render(<AspectRatio ratio="wide" />);
    const ratio = () => parseFloat((container.firstElementChild as HTMLElement).style.aspectRatio);
    expect(ratio()).toBe(1);
    rerender(<AspectRatio ratio={-2} />);
    expect(ratio()).toBe(1);
  });

  it("puts children in a clipped fill box and forwards ref, className and props", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { getByText, container } = render(
      <AspectRatio ref={ref} className="max-w-md" id="poster" aria-label="Poster">
        <span>Stage</span>
      </AspectRatio>,
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("max-w-md");
    expect(ref.current).toHaveAttribute("id", "poster");
    expect(getByText("Stage").parentElement).toHaveClass("absolute", "inset-0", "overflow-hidden");
  });

  it("draws a frame with a decorative tick on the chosen corner", () => {
    const { container, rerender } = render(<AspectRatio frame />);
    const tick = () => container.querySelector("[data-corner]");
    expect(tick()).toHaveAttribute("data-corner", "top-left");
    expect(tick()).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("border");
    rerender(<AspectRatio frame="bottom-right" />);
    expect(tick()).toHaveAttribute("data-corner", "bottom-right");
    rerender(<AspectRatio />);
    expect(tick()).toBeNull();
  });

  it("takes a color through --neon and renders on the server", () => {
    const { container } = render(<AspectRatio frame color="lime" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--neon")).toBe("163 230 53");
    expect(renderToString(<AspectRatio ratio={2} frame />)).toContain("aspect-ratio:2");
  });
});
