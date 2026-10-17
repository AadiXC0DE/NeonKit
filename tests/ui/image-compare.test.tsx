import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageCompare } from "@/components/ui/image-compare";

const layers = { before: <div>Raw</div>, after: <div>Graded</div> };

describe("ImageCompare", () => {
  it("is a slider named after its sides", () => {
    render(<ImageCompare {...layers} beforeLabel="Raw" afterLabel="Graded" />);
    const slider = screen.getByRole("slider", { name: "Raw and Graded" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(slider).toHaveAttribute("aria-valuetext", "50% Raw, 50% Graded");
    expect(slider).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("moves with the keys and commits on key up", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(<ImageCompare {...layers} defaultValue={40} onValueChange={onValueChange} onValueCommit={onValueCommit} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    fireEvent.keyDown(slider, { key: "PageDown" });
    fireEvent.keyDown(slider, { key: "End" });
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([41, 40, 50, 100, 0]);
    fireEvent.keyUp(slider, { key: "Home" });
    expect(onValueCommit).toHaveBeenCalledWith(0);
  });

  it("follows a controlled value", () => {
    const { rerender } = render(<ImageCompare {...layers} value={20} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "20");
    rerender(<ImageCompare {...layers} value={75} />);
    expect(slider).toHaveAttribute("aria-valuenow", "75");
  });

  it("jumps to a press and tracks the drag", () => {
    const onValueChange = vi.fn();
    const { container } = render(<ImageCompare {...layers} onValueChange={onValueChange} />);
    const root = container.firstElementChild as HTMLElement;
    root.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => {} });
    fireEvent.pointerDown(root, { pointerId: 1, button: 0, clientX: 150, clientY: 50 });
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 20, clientY: 50 });
    fireEvent.pointerUp(root, { pointerId: 1 });
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([75, 10]);
  });

  it("clips the before layer to the divider", () => {
    const { container } = render(<ImageCompare {...layers} defaultValue={30} orientation="vertical" />);
    const before = container.querySelector("[style*='clip-path']") as HTMLElement;
    expect(before.style.clipPath).toBe("inset(0 0 70% 0)");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("ignores input and leaves the tab order when disabled", () => {
    const onValueChange = vi.fn();
    render(<ImageCompare {...layers} disabled onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("tabindex", "-1");
    expect(slider).toHaveAttribute("aria-disabled", "true");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
