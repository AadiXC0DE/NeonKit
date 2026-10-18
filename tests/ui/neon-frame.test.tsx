import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NeonFrame } from "@/components/ui/neon-frame";

describe("NeonFrame", () => {
  it("renders its content inside four bracket corners", () => {
    const { container } = render(<NeonFrame>Uplink 412 Mbps</NeonFrame>);
    expect(screen.getByText("Uplink 412 Mbps")).toBeInTheDocument();
    const corners = [...container.querySelectorAll("[data-corner]")].map((svg) => svg.getAttribute("data-corner"));
    expect(corners).toEqual(["topLeft", "topRight", "bottomRight", "bottomLeft"]);
    for (const svg of container.querySelectorAll("svg")) expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("puts the label and tabs on the edges, in reading order", () => {
    const { container } = render(
      <NeonFrame label="Relay KX-7" tabs={{ topRight: "Ch 04", bottomLeft: "52.52 N", bottomRight: "Live" }}>
        <p>Body</p>
      </NeonFrame>,
    );
    // The component's <style> comes first in textContent; the visible text follows in order.
    expect(container.firstElementChild).toHaveTextContent(/\}\s*Relay KX-7Ch 04Body52\.52 NLive$/);
  });

  it("names landmark elements by the label", () => {
    render(
      <NeonFrame as="section" label="Relay KX-7">
        Body
      </NeonFrame>,
    );
    expect(screen.getByRole("region", { name: "Relay KX-7" })).toBeInTheDocument();
  });

  it("leaves divs unnamed and respects an explicit aria-label", () => {
    const { container, rerender } = render(<NeonFrame label="Relay KX-7">Body</NeonFrame>);
    expect(container.firstElementChild).not.toHaveAttribute("aria-labelledby");
    rerender(
      <NeonFrame as="figure" label="Cam 03" aria-label="Camera 3, loading dock">
        Feed
      </NeonFrame>,
    );
    expect(screen.getByRole("figure", { name: "Camera 3, loading dock" })).not.toHaveAttribute("aria-labelledby");
  });

  it("is armed until it scrolls into view, unless animation is off", () => {
    const { container } = render(<NeonFrame>Body</NeonFrame>);
    expect(container.firstElementChild).toHaveAttribute("data-state", "armed");
    const { container: still } = render(<NeonFrame animate={false}>Body</NeonFrame>);
    expect(still.firstElementChild).toHaveAttribute("data-state", "lit");
  });

  it("locks on, parks in standby, or stays lit", () => {
    const { container, rerender } = render(<NeonFrame>Body</NeonFrame>);
    const root = container.firstElementChild!;
    expect(root).not.toHaveAttribute("data-active");
    rerender(<NeonFrame active>Body</NeonFrame>);
    expect(root).toHaveAttribute("data-active", "true");
    rerender(<NeonFrame active={false}>Body</NeonFrame>);
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("draws a scan line only when asked", () => {
    const { container, rerender } = render(<NeonFrame>Body</NeonFrame>);
    expect(container.querySelector(".nk-neon-frame-scan")).toBeNull();
    rerender(<NeonFrame scanline>Body</NeonFrame>);
    expect(container.querySelector(".nk-neon-frame-scan")).not.toBeNull();
  });

  it("sizes the brackets, applies a color and forwards the ref", () => {
    const ref = React.createRef<HTMLElement>();
    const { container } = render(
      <NeonFrame ref={ref} as="article" bracket={12} color="amber">
        Body
      </NeonFrame>,
    );
    expect(ref.current?.tagName).toBe("ARTICLE");
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(container.querySelector("[data-corner]")).toHaveAttribute("viewBox", "0 0 14 14");
  });
});
