import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpotlightCard } from "@/components/ui/spotlight-card";

describe("SpotlightCard", () => {
  it("moves the light with the pointer through CSS variables", () => {
    render(<SpotlightCard data-testid="card">Edge cached</SpotlightCard>);
    const card = screen.getByTestId("card");
    card.getBoundingClientRect = () => ({ left: 10, top: 20, right: 310, bottom: 220, width: 300, height: 200, x: 10, y: 20, toJSON: () => ({}) });
    fireEvent.pointerMove(card, { clientX: 110, clientY: 70 });
    expect(card.style.getPropertyValue("--x")).toBe("100px");
    expect(card.style.getPropertyValue("--y")).toBe("50px");
  });

  it("still calls the consumer's pointer handler", () => {
    const onPointerMove = vi.fn();
    render(<SpotlightCard data-testid="card" onPointerMove={onPointerMove} />);
    fireEvent.pointerMove(screen.getByTestId("card"));
    expect(onPointerMove).toHaveBeenCalledTimes(1);
  });

  it("sizes the light from radius and forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<SpotlightCard ref={ref} radius={480} />);
    expect(ref.current?.style.getPropertyValue("--r")).toBe("240px");
  });
});
