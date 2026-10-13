import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const trail = ["Help Center", "Billing", "Invoices", "Taxes", "EU VAT"];

function Trail({ maxItems, color }: { maxItems?: number; color?: string }) {
  return (
    <Breadcrumb maxItems={maxItems} color={color}>
      <BreadcrumbList>
        {trail.map((label) => (
          <React.Fragment key={label}>
            <BreadcrumbItem>
              <BreadcrumbLink href={`#${label}`}>{label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>Reverse charge</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("renders a labelled nav with an ordered list and the current page", () => {
    render(<Trail />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("list").tagName).toBe("OL");
    expect(within(nav).getAllByRole("link")).toHaveLength(5);
    expect(screen.getByText("Reverse charge")).toHaveAttribute("aria-current", "page");
  });

  it("hides separators from assistive tech and draws a chevron by default", () => {
    const { container } = render(<Trail />);
    const separators = container.querySelectorAll('li[role="presentation"]');
    expect(separators).toHaveLength(5);
    separators.forEach((separator) => {
      expect(separator).toHaveAttribute("aria-hidden", "true");
      expect(separator.querySelector("svg")).not.toBeNull();
    });
  });

  it("lets children replace the separator", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/src">src</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>ui</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(container.querySelector('li[role="presentation"]')).toHaveTextContent("/");
  });

  it("collapses the middle into an ellipsis button with maxItems", () => {
    render(<Trail maxItems={3} />);
    const links = screen.getAllByRole("link").map((link) => link.textContent);
    expect(links).toEqual(["Help Center", "EU VAT"]);
    expect(screen.getByRole("button", { name: "Show 3 more items" })).toBeInTheDocument();
    expect(screen.getByText("Reverse charge")).toBeInTheDocument();
  });

  it("expands inline and moves focus to the first revealed link", () => {
    render(<Trail maxItems={3} />);
    fireEvent.click(screen.getByRole("button", { name: "Show 3 more items" }));
    expect(screen.queryByRole("button", { name: /more/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Billing" })).toHaveFocus();
  });

  it("collapses again when the trail changes", () => {
    function Path({ leaf }: { leaf: string }) {
      return (
        <Breadcrumb maxItems={2}>
          <BreadcrumbList>
            {["src", "components", leaf].map((name) => (
              <BreadcrumbItem key={name}>
                <BreadcrumbLink href={`#${name}`}>{name}</BreadcrumbLink>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
    const { rerender } = render(<Path leaf="ui" />);
    fireEvent.click(screen.getByRole("button", { name: "Show 1 more item" }));
    expect(screen.getAllByRole("link")).toHaveLength(3);

    rerender(<Path leaf="site" />);
    expect(screen.getByRole("button", { name: "Show 1 more item" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("does not collapse when the trail fits", () => {
    render(<Trail maxItems={6} />);
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders its child with asChild and keeps the child's handler", () => {
    const onClick = vi.fn();
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button" onClick={onClick}>
                components
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    const button = screen.getByRole("button", { name: "components" });
    expect(button.className).toContain("text-white/55");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards refs to the native elements", () => {
    const navRef = React.createRef<HTMLElement>();
    const linkRef = React.createRef<HTMLAnchorElement>();
    render(
      <Breadcrumb ref={navRef}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink ref={linkRef} href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(navRef.current?.tagName).toBe("NAV");
    expect(linkRef.current?.tagName).toBe("A");
  });

  it("applies an explicit color through --neon", () => {
    render(<Trail color="lime" />);
    expect(screen.getByRole("navigation").style.getPropertyValue("--neon")).toBe("163 230 53");
  });

  it("exports a standalone ellipsis button", () => {
    render(<BreadcrumbEllipsis />);
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("type", "button");
  });

  it("collapses children that a Server Component passes as lazy references", () => {
    // Before a client module is linked, React hands its elements over with a lazy type.
    const lazy = <T,>(component: T) =>
      ({ $$typeof: Symbol.for("react.lazy"), _payload: component, _init: (value: T) => value }) as unknown as T;
    const Item = lazy(BreadcrumbItem);
    const Separator = lazy(BreadcrumbSeparator);

    render(
      <Breadcrumb maxItems={3}>
        <BreadcrumbList>
          {trail.map((label) => (
            <React.Fragment key={label}>
              <Item>
                <BreadcrumbLink href={`#${label}`}>{label}</BreadcrumbLink>
              </Item>
              <Separator />
            </React.Fragment>
          ))}
          <Item>
            <BreadcrumbPage>Reverse charge</BreadcrumbPage>
          </Item>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole("button", { name: "Show 3 more items" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Billing" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "EU VAT" })).toBeInTheDocument();
  });

  it("merges onto an asChild link passed as a lazy node", () => {
    const anchor = <a href="/billing">Billing</a>;
    const lazyNode = {
      $$typeof: Symbol.for("react.lazy"),
      _payload: anchor,
      _init: (value: React.ReactElement) => value,
    } as unknown as React.ReactElement;
    render(<BreadcrumbLink asChild>{lazyNode}</BreadcrumbLink>);
    expect(screen.getByRole("link", { name: "Billing" }).className).toContain("text-white/55");
  });
});
