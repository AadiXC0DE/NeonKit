import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "@/components/ui/separator";

describe("Separator", () => {
  it("is decorative by default and hidden from the accessibility tree", () => {
    const { container } = render(<Separator />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("role", "none");
  });

  it("exposes role and orientation when not decorative", () => {
    render(
      <>
        <Separator decorative={false} data-testid="h" />
        <Separator decorative={false} orientation="vertical" data-testid="v" />
      </>,
    );
    expect(screen.getByTestId("h")).toHaveAttribute("role", "separator");
    expect(screen.getByTestId("h")).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByTestId("v")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("is named by its label when not decorative", () => {
    render(<Separator decorative={false} variant="tube" label="2 new messages" />);
    expect(screen.getByRole("separator", { name: "2 new messages" })).toBeInTheDocument();
  });

  it("still renders a decorative label as text", () => {
    render(<Separator variant="tube" label="or" />);
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("breaks the tube around a label, with caps on every segment", () => {
    const { container } = render(<Separator variant="tube" label="or" />);
    // Two tubes, each made of a cap, the glass and a cap.
    const tubes = container.querySelectorAll("[aria-hidden]");
    expect(tubes).toHaveLength(2);
    for (const tube of tubes) expect(tube.children).toHaveLength(3);
  });

  it("renders a plain line as a single element so className restyles it", () => {
    const { container } = render(<Separator className="bg-white/20" />);
    const line = container.firstElementChild as HTMLElement;
    expect(line.children).toHaveLength(0);
    expect(line.className).toContain("bg-white/20");
  });

  it("applies an explicit color and forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} variant="tube" color="magenta" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("240 70 235");
    expect(ref.current).toHaveAttribute("data-variant", "tube");
  });
});
