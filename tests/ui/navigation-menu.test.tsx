import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

function SiteNav(props: { value?: string; onValueChange?: (value: string) => void }) {
  return (
    <>
      <NavigationMenu {...props}>
        <NavigationMenuList>
          <NavigationMenuItem value="product">
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent className="w-96 p-2">
              <NavigationMenuLink href="#edge">Edge Functions</NavigationMenuLink>
              <NavigationMenuLink href="#storage">Storage</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="developers">
            <NavigationMenuTrigger>Developers</NavigationMenuTrigger>
            <NavigationMenuContent className="w-72 p-2">
              <NavigationMenuLink href="#docs">Documentation</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" active>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <button type="button">Sign in</button>
    </>
  );
}

const product = () => screen.getByRole("button", { name: "Product" });
const developers = () => screen.getByRole("button", { name: "Developers" });

describe("NavigationMenu", () => {
  afterEach(() => vi.useRealTimers());

  it("renders a labelled nav with the current page marked", () => {
    render(<SiteNav />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("aria-current", "page");
    expect(product()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Edge Functions" })).toBeNull();
  });

  it("opens on click into one shared panel wired to its trigger", () => {
    const onValueChange = vi.fn();
    render(<SiteNav onValueChange={onValueChange} />);
    fireEvent.click(product());
    expect(onValueChange).toHaveBeenCalledWith("product");
    expect(product()).toHaveAttribute("aria-expanded", "true");
    const link = screen.getByRole("link", { name: "Edge Functions" });
    const pane = link.closest("[data-value]")!;
    expect(product()).toHaveAttribute("aria-controls", pane.id);
    expect(pane).toHaveAttribute("aria-labelledby", product().id);

    fireEvent.click(developers());
    expect(developers()).toHaveAttribute("aria-expanded", "true");
    expect(product()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Documentation" })).toBeInTheDocument();
  });

  it("opens on hover after the intent delay, then switches instantly", () => {
    vi.useFakeTimers();
    render(<SiteNav />);
    fireEvent.pointerEnter(product(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(100));
    expect(product()).toHaveAttribute("aria-expanded", "false");
    act(() => vi.advanceTimersByTime(100));
    expect(product()).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerLeave(product(), { pointerType: "mouse" });
    fireEvent.pointerEnter(developers(), { pointerType: "mouse" });
    expect(developers()).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerLeave(developers(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(200));
    expect(developers()).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps a hover-opened panel open when its trigger is clicked", () => {
    vi.useFakeTimers();
    render(<SiteNav />);
    fireEvent.pointerEnter(product(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.click(product());
    expect(product()).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(product());
    expect(product()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens from the keyboard and moves focus into the panel", () => {
    render(<SiteNav />);
    act(() => product().focus());
    fireEvent.keyDown(product(), { key: "Enter" });
    expect(product()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Edge Functions" })).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(screen.getByRole("link", { name: "Storage" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(screen.getByRole("link", { name: "Edge Functions" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(<SiteNav />);
    fireEvent.keyDown(product(), { key: "ArrowDown" });
    expect(screen.getByRole("link", { name: "Edge Functions" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(product()).toHaveAttribute("aria-expanded", "false");
    expect(product()).toHaveFocus();
  });

  it("moves between top-level items with the arrow keys", () => {
    render(<SiteNav />);
    act(() => product().focus());
    fireEvent.keyDown(product(), { key: "ArrowRight" });
    expect(developers()).toHaveFocus();
    fireEvent.keyDown(developers(), { key: "ArrowRight" });
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(product()).toHaveFocus();
    fireEvent.keyDown(product(), { key: "End" });
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveFocus();
  });

  it("swaps panels when arrowing along the bar while one is open", () => {
    render(<SiteNav />);
    fireEvent.click(product());
    act(() => product().focus());
    fireEvent.keyDown(product(), { key: "ArrowRight" });
    expect(developers()).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(developers(), { key: "ArrowRight" });
    expect(developers()).toHaveAttribute("aria-expanded", "false");
  });

  it("tabs from the panel's last link to the next item in the bar", () => {
    render(<SiteNav />);
    fireEvent.keyDown(product(), { key: "Enter" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(screen.getByRole("link", { name: "Storage" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(developers()).toHaveFocus();
    expect(product()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when a link in the panel is followed or the pointer goes down outside", async () => {
    render(<SiteNav />);
    fireEvent.click(product());
    fireEvent.click(screen.getByRole("link", { name: "Storage" }));
    expect(product()).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("link", { name: "Storage" })).toBeNull());

    fireEvent.click(developers());
    fireEvent.pointerDown(screen.getByRole("button", { name: "Sign in" }));
    expect(developers()).toHaveAttribute("aria-expanded", "false");
  });

  it("can be controlled", () => {
    const { rerender } = render(<SiteNav value="" />);
    fireEvent.click(product());
    expect(product()).toHaveAttribute("aria-expanded", "false");
    rerender(<SiteNav value="developers" />);
    expect(developers()).toHaveAttribute("aria-expanded", "true");
  });

  it("renders a router link with asChild", () => {
    render(
      <NavigationMenu color="violet">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild active>
              <a href="/changelog" className="custom">
                Changelog
              </a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByRole("link", { name: "Changelog" });
    expect(link).toHaveClass("custom");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("navigation").style.getPropertyValue("--neon")).toBe("168 85 247");
  });
});
