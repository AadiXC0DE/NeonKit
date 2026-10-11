import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

describe("Button", () => {
  it("applies an explicit color through --neon", () => {
    render(<Button color="lime">Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).style.getPropertyValue("--neon")).toBe("163 230 53");
  });

  it("disables itself and announces busy while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("renders its child with asChild", () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });
});

describe("Switch", () => {
  it("toggles uncontrolled and reports changes", () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Wi-Fi" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control).toHaveAttribute("aria-checked", "false");
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("stays put when controlled", () => {
    render(<Switch aria-label="Airplane" checked={false} />);
    const control = screen.getByRole("switch", { name: "Airplane" });
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("labels itself from the label prop", () => {
    render(<Switch label="Low power" />);
    expect(screen.getByRole("switch", { name: "Low power" })).toBeInTheDocument();
  });

  it("submits with forms when named", () => {
    const { container } = render(<Switch name="alerts" defaultChecked aria-label="Alerts" />);
    const input = container.querySelector('input[name="alerts"]') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });
});

