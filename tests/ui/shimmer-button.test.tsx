import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShimmerButton } from "@/components/ui/shimmer-button";

describe("ShimmerButton", () => {
  it("is a native button named by its label", () => {
    const onClick = vi.fn();
    render(<ShimmerButton onClick={onClick}>Claim your handle</ShimmerButton>);
    const button = screen.getByRole("button", { name: "Claim your handle" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the beam and the sweep out of the accessibility tree", () => {
    const { container } = render(<ShimmerButton>Upgrade</ShimmerButton>);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden");
    expect(container.querySelectorAll(".nk-shimmer-button-beam").length).toBeGreaterThan(0);
    expect(container.querySelector(".nk-shimmer-button-sweep")?.closest("[aria-hidden]")).not.toBeNull();
  });

  it("applies an explicit color and the timing through CSS variables", () => {
    render(
      <ShimmerButton color="lime" beamDuration={6} shimmerDuration={2}>
        Go
      </ShimmerButton>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.style.getPropertyValue("--neon")).toBe("163 230 53");
    expect(button.style.getPropertyValue("--nk-shimmer-button-lap")).toBe("6s");
    expect(button.style.getPropertyValue("--nk-shimmer-button-cycle")).toBe("2s");
  });

  it("disables like a button", () => {
    const onClick = vi.fn();
    render(
      <ShimmerButton disabled onClick={onClick}>
        Pay
      </ShimmerButton>,
    );
    const button = screen.getByRole("button", { name: "Pay" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders its child with asChild, merging classes and handlers", () => {
    const onClick = vi.fn();
    const childClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <ShimmerButton asChild className="ours" onClick={onClick}>
        <a href="/changelog" className="theirs" onClick={childClick}>
          Changelog
        </a>
      </ShimmerButton>,
    );
    const link = screen.getByRole("link", { name: "Changelog" });
    expect(link).toHaveAttribute("href", "/changelog");
    expect(link).toHaveClass("ours", "theirs");
    expect(link.querySelector("svg[aria-hidden]")).not.toBeNull();
    fireEvent.click(link);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("marks an asChild link disabled and takes it out of the tab order", () => {
    render(
      <ShimmerButton asChild disabled>
        <a href="/pricing">Pricing</a>
      </ShimmerButton>,
    );
    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
  });

  it("forwards refs, including through asChild", () => {
    const buttonRef = React.createRef<HTMLButtonElement>();
    const linkRef = React.createRef<HTMLAnchorElement>();
    const { rerender } = render(<ShimmerButton ref={buttonRef}>Go</ShimmerButton>);
    expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);
    rerender(
      <ShimmerButton asChild>
        <a ref={linkRef} href="/docs">
          Docs
        </a>
      </ShimmerButton>,
    );
    expect(linkRef.current).toBeInstanceOf(HTMLAnchorElement);
  });
});
