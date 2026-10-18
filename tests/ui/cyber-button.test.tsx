import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CyberButton } from "@/components/ui/cyber-button";

describe("CyberButton", () => {
  it("is named once, even though the glitch copies the label", () => {
    const { container } = render(<CyberButton>Connect</CyberButton>);
    const button = screen.getByRole("button", { name: "Connect" });
    const copies = container.querySelectorAll(".nk-cyber-button-split");
    expect(copies).toHaveLength(2);
    copies.forEach((copy) => expect(copy).toHaveAttribute("aria-hidden", "true"));
    expect(button).toBeInTheDocument();
  });

  it("clicks like a button", () => {
    const onClick = vi.fn();
    render(<CyberButton onClick={onClick}>Scan again</CyberButton>);
    fireEvent.click(screen.getByRole("button", { name: "Scan again" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sets the chamfer, colors and scan timing through CSS variables", () => {
    render(
      <CyberButton size="lg" color="amber" colorAlt="red" scanDuration={5}>
        Override
      </CyberButton>,
    );
    const button = screen.getByRole("button", { name: "Override" });
    expect(button.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(button.style.getPropertyValue("--nk-cyber-button-alt")).toBe("255 77 94");
    expect(button.style.getPropertyValue("--nk-cyber-button-base")).toBe("11px");
    expect(button.style.getPropertyValue("--nk-cyber-button-scan")).toBe("5s");
  });

  it("drops the scan line when scanDuration is 0", () => {
    const { container, rerender } = render(<CyberButton>Decrypt</CyberButton>);
    expect(container.querySelector(".nk-cyber-button-scan")).not.toBeNull();
    rerender(<CyberButton scanDuration={0}>Decrypt</CyberButton>);
    expect(container.querySelector(".nk-cyber-button-scan")).toBeNull();
  });

  it("disables like a button", () => {
    render(<CyberButton disabled>Jack out</CyberButton>);
    expect(screen.getByRole("button", { name: "Jack out" })).toBeDisabled();
  });

  it("renders its child with asChild and forwards refs", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <CyberButton asChild ref={ref} disabled>
        <a href="#tickets">Get your pass</a>
      </CyberButton>,
    );
    const link = screen.getByRole("link", { name: "Get your pass" });
    expect(link).toHaveAttribute("href", "#tickets");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveClass("nk-cyber-button");
    expect(ref.current).toBe(link);
  });
});
