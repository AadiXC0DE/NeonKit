import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContextMeter, formatTokens } from "@/components/ui/context-meter";

const PARTS = [
  { label: "System prompt", tokens: 3_100 },
  { label: "Conversation", tokens: 88_500 },
  { label: "Files", tokens: 38_900 },
  { label: "Tools", tokens: 11_800 },
];

describe("ContextMeter", () => {
  it("formats tokens the way they're read aloud", () => {
    expect(formatTokens(950)).toBe("950");
    expect(formatTokens(48_210)).toBe("48.2k");
    expect(formatTokens(142_300)).toBe("142.3k");
    expect(formatTokens(200_000)).toBe("200k");
    expect(formatTokens(1_000_000)).toBe("1M");
    expect(formatTokens(1_048_576)).toBe("1.05M");
  });

  it("is a meter with tokens as its value and a readable value text", () => {
    render(<ContextMeter parts={PARTS} limit={200_000} />);
    const meter = screen.getByRole("meter", { name: "Context window" });
    expect(meter).toHaveAttribute("aria-valuemax", "200000");
    expect(meter).toHaveAttribute("aria-valuenow", "142300");
    expect(meter).toHaveAttribute("aria-valuetext", "71% used, 142.3k of 200k tokens");
    expect(meter).toHaveAttribute("data-status", "ok");
  });

  it("lights one cell per tenth in the compact size", () => {
    const { container } = render(<ContextMeter size="sm" parts={PARTS} limit={200_000} />);
    expect(container.querySelectorAll(".nk-ctx-cell")).toHaveLength(10);
    expect(container.querySelectorAll(".nk-ctx-cell[data-lit]:not([data-partial])")).toHaveLength(7);
    // 71.15% lands a little way into the eighth cell, which glows faintly.
    expect(container.querySelectorAll(".nk-ctx-cell[data-partial]")).toHaveLength(1);
  });

  it("gives a small part at least one cell", () => {
    const { container } = render(
      <ContextMeter size="lg" parts={[{ label: "System", tokens: 500 }, { label: "Chat", tokens: 60_000 }]} limit={200_000} />,
    );
    const lit = container.querySelectorAll("[role=meter] > div .nk-ctx > [data-lit]");
    expect(lit.length).toBeGreaterThanOrEqual(12);
    expect(lit[0].getAttribute("style")).toContain("214 221 233");
  });

  it("warns, then goes critical, then full", () => {
    const { rerender } = render(<ContextMeter used={168_900} limit={200_000} />);
    expect(screen.getByRole("meter")).toHaveAttribute("data-status", "warn");
    expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toMatch(/near the limit$/);
    rerender(<ContextMeter used={193_700} limit={200_000} />);
    expect(screen.getByRole("meter")).toHaveAttribute("data-status", "critical");
    expect(screen.getByText("Context window 96% full")).toBeInTheDocument();
    rerender(<ContextMeter used={204_000} limit={200_000} />);
    expect(screen.getByRole("meter")).toHaveAttribute("data-status", "full");
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "200000");
  });

  it("doesn't announce the reading it mounts with", () => {
    render(<ContextMeter used={193_700} limit={200_000} />);
    expect(screen.queryByText(/% full$/)).toBeNull();
  });

  it("lists every part and the free space in the large size", () => {
    render(<ContextMeter size="lg" parts={PARTS} limit={200_000} note="Summarised at 90%." />);
    expect(screen.getByRole("rowheader", { name: /Conversation/ })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: /Free/ })).toBeInTheDocument();
    expect(screen.getByText("88,500 tokens")).toBeInTheDocument();
    expect(screen.getByText("57,700 tokens")).toBeInTheDocument();
    expect(screen.getByText("Summarised at 90%.")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Context window" })).toBeInTheDocument();
  });

  it("opens the breakdown from the compact button", () => {
    render(<ContextMeter size="sm" breakdown parts={PARTS} limit={200_000} />);
    const button = screen.getByRole("button", { name: "Context window, 142.3k / 200k tokens, 71% used. Show breakdown" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const dialog = screen.getByRole("dialog", { name: "Context window" });
    expect(dialog).toHaveTextContent("Tools");
    expect(dialog).toHaveTextContent("Free");
  });

  it("prints a percentage when asked", () => {
    render(<ContextMeter size="sm" used={142_300} limit={200_000} readout="percent" />);
    expect(screen.getByText("71%")).toBeInTheDocument();
  });
});
