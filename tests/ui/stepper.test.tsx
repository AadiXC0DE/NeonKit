import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Step, Stepper } from "@/components/ui/stepper";

function Checkout(props: Partial<React.ComponentProps<typeof Stepper>>) {
  return (
    <Stepper aria-label="Checkout" {...props}>
      <Step title="Cart" description="2 items" />
      <Step title="Shipping" />
      <Step title="Payment" optional />
      <Step title="Review" />
    </Stepper>
  );
}

const steps = () => Array.from(document.querySelectorAll("ol > li"));

describe("Stepper", () => {
  it("renders an ordered list and marks the current step", () => {
    render(<Checkout defaultValue={1} />);
    expect(screen.getByRole("list", { name: "Checkout" }).tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
  });

  it("derives complete, current and upcoming states from the value", () => {
    render(<Checkout value={2} />);
    expect(steps().map((step) => step.getAttribute("data-state"))).toEqual([
      "complete",
      "complete",
      "current",
      "upcoming",
    ]);
    expect(screen.getAllByText(", completed")).toHaveLength(2);
  });

  it("completes every step when the value equals the count", () => {
    render(<Checkout value={4} />);
    expect(steps().every((step) => step.getAttribute("data-state") === "complete")).toBe(true);
    expect(document.querySelector('[aria-current="step"]')).toBeNull();
  });

  it("fills the connector up to the current step", () => {
    const { container } = render(<Checkout value={2} />);
    const fills = Array.from(container.querySelectorAll<HTMLElement>("li > span[aria-hidden] > span"));
    expect(fills).toHaveLength(3);
    expect(fills.map((fill) => fill.style.transform)).toEqual(["scaleX(1)", "scaleX(1)", "scaleX(0)"]);
  });

  it("fills vertically in the vertical orientation", () => {
    const { container } = render(<Checkout value={1} orientation="vertical" />);
    const fill = container.querySelector<HTMLElement>("li > span[aria-hidden] > span");
    expect(fill?.style.transform).toBe("scaleY(1)");
  });

  it("shows optional captions and descriptions", () => {
    render(<Checkout />);
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("renders plain steps when not clickable", () => {
    render(<Checkout />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("makes steps buttons when clickable, uncontrolled", () => {
    const onValueChange = vi.fn();
    render(<Checkout clickable defaultValue={2} onValueChange={onValueChange} />);
    const cart = screen.getByRole("button", { name: /Cart/ });
    expect(screen.getByRole("button", { name: /Payment/ })).toHaveAttribute("aria-current", "step");

    fireEvent.click(cart);
    expect(onValueChange).toHaveBeenCalledWith(0);
    expect(cart).toHaveAttribute("aria-current", "step");
  });

  it("stays put when controlled", () => {
    const onValueChange = vi.fn();
    render(<Checkout clickable value={1} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("button", { name: /Shipping/ })).toHaveAttribute("aria-current", "step");
  });

  it("does not call back for the current step or a disabled one", () => {
    const onValueChange = vi.fn();
    render(
      <Stepper clickable defaultValue={0} onValueChange={onValueChange}>
        <Step title="Account" />
        <Step title="Billing" disabled />
      </Stepper>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Account/ }));
    const billing = screen.getByRole("button", { name: /Billing/ });
    expect(billing).toBeDisabled();
    fireEvent.click(billing);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("marks an errored step for screen readers", () => {
    render(
      <Stepper value={1}>
        <Step title="Build" />
        <Step title="Tests" status="error" />
        <Step title="Deploy" />
      </Stepper>,
    );
    const tests = steps()[1];
    expect(tests).toHaveAttribute("data-status", "error");
    expect(tests).toHaveTextContent("Tests, failed");
  });

  it("applies an explicit color through --neon", () => {
    render(<Checkout color="lime" />);
    expect(screen.getByRole("list").style.getPropertyValue("--neon")).toBe("163 230 53");
  });

  it("throws when a Step is used outside a Stepper", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Step title="Lonely" />)).toThrow(/inside <Stepper>/);
    spy.mockRestore();
  });
});
