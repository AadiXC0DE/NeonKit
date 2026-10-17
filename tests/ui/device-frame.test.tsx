import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeviceFrame } from "@/components/ui/device-frame";

describe("DeviceFrame", () => {
  it("renders children on the browser screen under a URL bar", () => {
    const { container } = render(
      <DeviceFrame url="relay.dev/acme/pipelines">
        <div role="img" aria-label="Pipelines dashboard" />
      </DeviceFrame>,
    );
    expect(screen.getByRole("img", { name: "Pipelines dashboard" })).toBeInTheDocument();
    expect(screen.getByText("relay.dev")).toHaveClass("text-white/80");
    expect(screen.getByText("/acme/pipelines")).toHaveClass("text-white/40");
    // Window buttons are decoration.
    const lights = container.querySelector(".rounded-full.size-3")?.parentElement;
    expect(lights).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the screen at its aspect ratio and makes it a size container", () => {
    render(
      <DeviceFrame aspectRatio="16 / 9">
        <p>screen</p>
      </DeviceFrame>,
    );
    const screenNode = screen.getByText("screen").parentElement?.parentElement as HTMLElement;
    expect(screenNode.style.aspectRatio).toBe("16 / 9");
    expect(screenNode.className).toContain("[container-type:inline-size]");
  });

  it("adds a tab strip and toolbar when given tabs, with the active one in front", () => {
    render(<DeviceFrame url="relay.dev" tabs={["Docs", "Pricing", "Blog"]} activeTab={1} />);
    expect(screen.getByText("Pricing")).toHaveClass("text-white/85");
    expect(screen.getByText("Docs")).toHaveClass("text-white/45");
  });

  it("switches window buttons between traffic and minimal", () => {
    const { container, rerender } = render(<DeviceFrame />);
    expect(container.querySelector(".bg-\\[\\#ff5f57\\]")).not.toBeNull();
    rerender(<DeviceFrame controls="minimal" />);
    expect(container.querySelector(".bg-\\[\\#ff5f57\\]")).toBeNull();
  });

  it("draws a phone with an island, a status bar and a 9 / 19.5 screen", () => {
    const { container } = render(
      <DeviceFrame variant="phone" time="9:41">
        <p>app</p>
      </DeviceFrame>,
    );
    expect(screen.getByText("9:41")).toBeInTheDocument();
    expect(screen.getByText("app")).toBeInTheDocument();
    expect(container.querySelector("[style*='aspect-ratio']")?.getAttribute("style")).toContain("9 / 19.5");
    expect(container.querySelector(".rounded-full.bg-black")).toHaveAttribute("aria-hidden", "true");
  });

  it("swaps the island for a notch or nothing", () => {
    const { container, rerender } = render(<DeviceFrame variant="phone" cutout="notch" />);
    expect(container.querySelector(".rounded-b-\\[5cqw\\]")).not.toBeNull();
    rerender(<DeviceFrame variant="phone" cutout="none" />);
    expect(container.querySelector(".bg-black")).toBeNull();
  });

  it("tilts in perspective and turns the other way for negative angles", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<DeviceFrame ref={ref} tilt />);
    expect(ref.current?.style.transform).toBe("perspective(2000px) rotateX(4.5deg) rotateY(-10deg)");
    rerender(<DeviceFrame ref={ref} tilt={-6} />);
    expect(ref.current?.style.transform).toContain("rotateY(6deg)");
  });

  it("lights the rim through --neon unless rim is off", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container, rerender } = render(<DeviceFrame ref={ref} color="violet" variant="phone" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("168 85 247");
    const rims = () => container.querySelectorAll("[class*='inset_0_0_0_1px_rgb(var(--neon)']");
    expect(rims().length).toBe(1);
    rerender(<DeviceFrame ref={ref} variant="phone" rim={false} />);
    expect(rims().length).toBe(0);
  });

  it("spreads props onto the root", () => {
    render(<DeviceFrame data-testid="frame" className="max-w-2xl" />);
    expect(screen.getByTestId("frame").className).toContain("max-w-2xl");
  });
});
