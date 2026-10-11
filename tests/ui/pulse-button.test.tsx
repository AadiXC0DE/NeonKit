import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PulseButton } from "@/components/ui/pulse-button";

describe("PulseButton", () => {
  it("pulses by default with two staggered rings", () => {
    const { container } = render(<PulseButton>Join the call</PulseButton>);
    const button = screen.getByRole("button", { name: "Join the call" });
    expect(button).toHaveAttribute("data-pulse");
    const rings = container.querySelectorAll<HTMLElement>(".nk-pulse-button-ring");
    expect(rings).toHaveLength(2);
    expect(rings[0].style.animationDelay).toBe("0s");
    expect(rings[1].style.animationDelay).toBe("-1.1s");
  });

  it("stops pulsing when pulse is false or the button is disabled", () => {
    const { rerender } = render(<PulseButton pulse={false}>Open</PulseButton>);
    expect(screen.getByRole("button", { name: "Open" })).not.toHaveAttribute("data-pulse");
    rerender(<PulseButton disabled>Open</PulseButton>);
    const button = screen.getByRole("button", { name: "Open" });
    expect(button).not.toHaveAttribute("data-pulse");
    expect(button).toBeDisabled();
  });

  it("can switch the pulse off once the user acts", () => {
    function Acknowledge() {
      const [seen, setSeen] = React.useState(false);
      return (
        <PulseButton pulse={!seen} onClick={() => setSeen(true)}>
          What&apos;s new
        </PulseButton>
      );
    }
    render(<Acknowledge />);
    const button = screen.getByRole("button", { name: "What's new" });
    expect(button).toHaveAttribute("data-pulse");
    fireEvent.click(button);
    expect(button).not.toHaveAttribute("data-pulse");
  });

  it("takes the ring count, period and color", () => {
    const { container } = render(
      <PulseButton rings={3} period={1.5} color="red" size="icon" aria-label="Stop recording">
        <svg />
      </PulseButton>,
    );
    const button = screen.getByRole("button", { name: "Stop recording" });
    expect(container.querySelectorAll(".nk-pulse-button-ring")).toHaveLength(3);
    expect(button.style.getPropertyValue("--nk-pulse-button-period")).toBe("1.5s");
    expect(button.style.getPropertyValue("--neon")).toBe("255 77 94");
  });

  it("renders its child with asChild", () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <PulseButton asChild onClick={onClick}>
        <a href="/live">Watch live</a>
      </PulseButton>,
    );
    const link = screen.getByRole("link", { name: "Watch live" });
    expect(link).toHaveAttribute("href", "/live");
    expect(link).toHaveAttribute("data-pulse");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards its ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<PulseButton ref={ref}>Go</PulseButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
