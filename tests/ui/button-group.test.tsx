import * as React from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";

// What a Server Component hands over before the client module is linked: a lazy node.
function lazyNode(element: React.ReactElement) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: element,
    _init: (value: React.ReactElement) => value,
  } as unknown as React.ReactElement;
}

describe("ButtonGroup", () => {
  it("renders a labelled group that squares inner corners and overlaps seams with CSS", () => {
    render(
      <ButtonGroup aria-label="Pager">
        <Button>Previous</Button>
        <ButtonGroupText>3 of 12</ButtonGroupText>
        <Button>Next</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Pager" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveClass(
      "[&>*+*]:-ml-px",
      "[&>*:not(:first-child)]:rounded-l-none",
      "[&>*:not(:last-child)]:rounded-r-none",
      "[&>*:focus-visible]:z-30",
    );
    // Children are left untouched: nothing is cloned or inspected.
    expect(screen.getByRole("button", { name: "Previous" })).not.toHaveClass("rounded-r-none");
  });

  it("reaches an Input's field box, which draws its corners", () => {
    render(
      <ButtonGroup aria-label="Logs">
        <Input aria-label="Search logs" />
        <Button>Search</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Logs" });
    expect(group).toHaveClass("[&>*:not(:last-child)>[class~='group/field']]:rounded-r-none");
    const field = screen.getByRole("textbox", { name: "Search logs" }).parentElement!;
    expect(field.classList).toContain("group/field");
    expect(field.parentElement!.parentElement).toBe(group);
  });

  it("keeps children that arrive as lazy references, on the client and the server", () => {
    const tree = (
      <ButtonGroup aria-label="Promote">
        {lazyNode(<button type="button">Promote</button>)}
        <ButtonGroupSeparator />
        {lazyNode(<button type="button">More</button>)}
      </ButtonGroup>
    );
    render(tree);
    expect(screen.getByRole("button", { name: "Promote" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
    expect(renderToString(tree)).toContain(">More</button>");
  });

  it("squares top and bottom when vertical, with a horizontal separator", () => {
    render(
      <ButtonGroup orientation="vertical" aria-label="Zoom">
        <Button>Zoom in</Button>
        <ButtonGroupSeparator />
        <Button>Zoom out</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Zoom" })).toHaveClass(
      "[&>*+*]:-mt-px",
      "[&>*:not(:first-child)]:rounded-t-none",
      "[&>*:not(:last-child)]:rounded-b-none",
    );
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("sizes text segments like buttons", () => {
    render(<ButtonGroupText size="sm">Text</ButtonGroupText>);
    expect(screen.getByText("Text")).toHaveClass("h-8");
  });

  it("spaces nested groups as a toolbar", () => {
    render(
      <ButtonGroup aria-label="Formatting">
        <ButtonGroup aria-label="Style">
          <Button>Bold</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Align">
          <Button>Left</Button>
        </ButtonGroup>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Formatting" })).toHaveClass(
      "has-[>[data-slot=button-group]]:gap-2",
      "[&>[data-slot=button-group]]:m-0",
    );
    expect(screen.getByRole("group", { name: "Style" })).toHaveAttribute("data-slot", "button-group");
  });
});
