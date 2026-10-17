import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Rating } from "@/components/ui/rating";

function cell(slider: HTMLElement, index: number) {
  return slider.querySelector(`[data-rating-index="${index}"]`) as HTMLElement;
}

describe("Rating", () => {
  it("is a slider with a readable value", () => {
    render(<Rating aria-label="Your rating" defaultValue={3} />);
    const slider = screen.getByRole("slider", { name: "Your rating" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "5");
    expect(slider).toHaveAttribute("aria-valuenow", "3");
    expect(slider).toHaveAttribute("aria-valuetext", "3 of 5");
    expect(slider).toHaveAttribute("tabindex", "0");
  });

  it("says when nothing is rated", () => {
    render(<Rating aria-label="Your rating" />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "No rating");
  });

  it("is named by its visible label", () => {
    render(<Rating label="Overall" />);
    expect(screen.getByRole("slider", { name: "Overall" })).toBeInTheDocument();
  });

  it("moves with the arrow keys, Home and End", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" defaultValue={2} onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "3");
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(slider).toHaveAttribute("aria-valuenow", "2");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuenow", "5");
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(slider).toHaveAttribute("aria-valuenow", "5");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([3, 2, 5, 0]);
  });

  it("steps by halves when allowed", () => {
    render(<Rating aria-label="Score" allowHalf defaultValue={3} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "3.5");
    expect(slider).toHaveAttribute("aria-valuetext", "3.5 of 5");
  });

  it("jumps with number keys", () => {
    render(<Rating aria-label="Rating" />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "4" });
    expect(slider).toHaveAttribute("aria-valuenow", "4");
    fireEvent.keyDown(slider, { key: "9" });
    expect(slider).toHaveAttribute("aria-valuenow", "5");
  });

  it("sets on click and clears when the same value is clicked again", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.click(cell(slider, 3));
    expect(slider).toHaveAttribute("aria-valuenow", "4");
    fireEvent.click(cell(slider, 3));
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([4, 0]);
  });

  it("previews on hover and reports it", () => {
    const onHoverChange = vi.fn();
    render(<Rating aria-label="Rating" defaultValue={1} onHoverChange={onHoverChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.pointerMove(cell(slider, 2), { pointerType: "mouse" });
    expect(onHoverChange).toHaveBeenLastCalledWith(3);
    expect(slider).toHaveAttribute("data-state", "preview");
    // The value itself doesn't change until a click.
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    fireEvent.pointerLeave(slider);
    expect(onHoverChange).toHaveBeenLastCalledWith(null);
    expect(slider).toHaveAttribute("data-state", "rated");
  });

  it("stays put when controlled", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" value={2} onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(slider).toHaveAttribute("aria-valuenow", "2");
  });

  it("follows a controlled value", () => {
    function Controlled() {
      const [value, setValue] = React.useState(1);
      return <Rating aria-label="Rating" value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuenow", "5");
  });

  it("renders as an image with the value when read-only", () => {
    const onValueChange = vi.fn();
    render(<Rating readOnly value={4.6} aria-label="Average rating" onValueChange={onValueChange} />);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    const image = screen.getByRole("img", { name: "Average rating: 4.6 of 5" });
    fireEvent.click(cell(image, 1));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("ignores input while disabled", () => {
    const onValueChange = vi.fn();
    render(<Rating aria-label="Rating" disabled onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.click(cell(slider, 2));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("uses a custom value text and max", () => {
    render(<Rating aria-label="Love" max={3} defaultValue={2} formatValue={(v, max) => `${v} hearts out of ${max}`} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "2 hearts out of 3");
  });

  it("submits with forms when named", () => {
    const { container } = render(<Rating aria-label="Rating" name="stars" defaultValue={4} />);
    expect((container.querySelector('input[name="stars"]') as HTMLInputElement).value).toBe("4");
  });

  it("applies an explicit color through --neon", () => {
    render(<Rating aria-label="Rating" color="amber" />);
    expect(screen.getByRole("slider").style.getPropertyValue("--neon")).toBe("251 191 36");
  });

  it("crops the star's view box so it reads at the size of the other icons", () => {
    const { container, rerender } = render(<Rating aria-label="Rating" defaultValue={2} />);
    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBeGreaterThan(0);
    stars.forEach((svg) => expect(svg).toHaveAttribute("viewBox", "3 3 18 18"));
    rerender(<Rating aria-label="Rating" icon="heart" defaultValue={2} />);
    container.querySelectorAll("svg").forEach((svg) => expect(svg).toHaveAttribute("viewBox", "0 0 24 24"));
  });
});
