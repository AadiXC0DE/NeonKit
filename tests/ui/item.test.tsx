import * as React from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";

// What a Server Component hands over before the client module is linked: a lazy node.
function lazyNode(element: React.ReactElement) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: element,
    _init: (value: React.ReactElement) => value,
  } as unknown as React.ReactElement;
}

describe("Item", () => {
  it("renders a row with its parts and variant", () => {
    render(
      <Item variant="outline" size="sm" data-testid="row">
        <ItemMedia variant="icon">K</ItemMedia>
        <ItemContent>
          <ItemTitle>Passkeys</ItemTitle>
          <ItemDescription>2 registered</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button">Manage</button>
        </ItemActions>
      </Item>,
    );
    const row = screen.getByTestId("row");
    expect(row).toHaveAttribute("data-variant", "outline");
    expect(row).toHaveAttribute("data-size", "sm");
    expect(row).toHaveClass("border-white/10");
    expect(screen.getByText("2 registered")).toHaveClass("line-clamp-2");
    expect(screen.getByRole("button", { name: "Manage" })).toBeInTheDocument();
  });

  it("renders as a link with asChild and keeps the link role inside a group", () => {
    render(
      <ItemGroup aria-label="Security">
        <Item>
          <ItemTitle>Two-factor</ItemTitle>
        </Item>
        <ItemSeparator />
        <Item asChild active>
          <a href="#sessions">
            <ItemTitle>Active sessions</ItemTitle>
          </a>
        </Item>
      </ItemGroup>,
    );
    const list = screen.getByRole("list", { name: "Security" });
    expect(list.querySelectorAll(":scope > [role=listitem]")).toHaveLength(2);
    const link = screen.getByRole("link", { name: "Active sessions" });
    expect(link).toHaveAttribute("href", "#sessions");
    expect(link).toHaveAttribute("data-active", "");
    expect(link.parentElement).toHaveAttribute("role", "listitem");
  });

  it("supports Base UI's render prop", () => {
    render(<Item render={<a href="/files" />}>Files</Item>);
    expect(screen.getByRole("link", { name: "Files" })).toHaveAttribute("href", "/files");
  });

  it("clamps descriptions to one line when asked", () => {
    render(<ItemDescription lines={1}>ana@acme.dev</ItemDescription>);
    expect(screen.getByText("ana@acme.dev")).toHaveClass("truncate");
  });

  it("hides separators from assistive tech", () => {
    const { container } = render(<ItemSeparator inset={70} />);
    const rule = container.firstElementChild as HTMLElement;
    expect(rule).toHaveAttribute("aria-hidden", "true");
    expect(rule.style.marginLeft).toBe("70px");
  });

  it("renders an asChild link that arrives as a lazy reference", () => {
    const tree = (
      <Item asChild active>
        {lazyNode(<a href="#sessions">Active sessions</a>)}
      </Item>
    );
    expect(renderToString(tree)).toContain('href="#sessions"');
    render(tree);
    const link = screen.getByRole("link", { name: "Active sessions" });
    expect(link).toHaveAttribute("data-active", "");
    expect(link).toHaveClass("group/item");
  });
});
