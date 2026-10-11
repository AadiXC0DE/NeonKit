import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function Shell(props: React.ComponentProps<typeof SidebarProvider> & { onNavigate?: (id: string) => void }) {
  const { onNavigate, ...rest } = props;
  const [active, setActive] = React.useState("inbox");
  const go = (id: string) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (
    <SidebarProvider {...rest}>
      <Sidebar>
        <SidebarHeader>Orbit</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem icon={<svg />} badge={3} active={active === "inbox"} onClick={() => go("inbox")}>
              Inbox
            </SidebarItem>
          </SidebarGroup>
          <SidebarGroup label="Workspace">
            <SidebarItem icon={<svg />} active={active === "projects"} onClick={() => go("projects")}>
              Projects
            </SidebarItem>
            <SidebarItem icon={<svg />} href="/roadmap" active={active === "roadmap"}>
              Roadmap
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarItem icon={<svg />} disabled>
              Billing
            </SidebarItem>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <p>Page</p>
      </SidebarInset>
    </SidebarProvider>
  );
}

const panel = () => document.querySelector<HTMLElement>("[data-side]")!;

describe("Sidebar", () => {
  it("renders a labelled nav with grouped items and marks the active one", () => {
    render(<Shell />);
    expect(screen.getByRole("navigation", { name: "Sidebar" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Inbox/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Projects" })).not.toHaveAttribute("aria-current");
  });

  it("renders links for href and buttons otherwise", () => {
    render(<Shell />);
    expect(screen.getByRole("link", { name: "Roadmap" })).toHaveAttribute("href", "/roadmap");
    expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute("type", "button");
  });

  it("moves the active state on click", () => {
    const onNavigate = vi.fn();
    render(<Shell onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    expect(onNavigate).toHaveBeenCalledWith("projects");
    expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /Inbox/ })).not.toHaveAttribute("aria-current");
  });

  it("disables items", () => {
    render(<Shell />);
    expect(screen.getByRole("button", { name: "Billing" })).toBeDisabled();
  });

  it("toggles the rail from the trigger, uncontrolled", () => {
    const onCollapsedChange = vi.fn();
    render(<Shell onCollapsedChange={onCollapsedChange} />);
    const trigger = screen.getByRole("button", { name: "Toggle sidebar" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", panel().id);
    expect(panel()).toHaveAttribute("data-state", "expanded");

    fireEvent.click(trigger);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel()).toHaveAttribute("data-state", "collapsed");
  });

  it("stays put when controlled", () => {
    const onCollapsedChange = vi.fn();
    render(<Shell collapsed={false} onCollapsedChange={onCollapsedChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(panel()).toHaveAttribute("data-state", "expanded");
  });

  it("toggles with ⌘B and Ctrl+B", () => {
    render(<Shell />);
    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(panel()).toHaveAttribute("data-state", "collapsed");
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(panel()).toHaveAttribute("data-state", "expanded");
    fireEvent.keyDown(window, { key: "b" });
    expect(panel()).toHaveAttribute("data-state", "expanded");
  });

  it("supports a custom shortcut key and turning it off", () => {
    const { unmount } = render(<Shell shortcut="j" />);
    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(panel()).toHaveAttribute("data-state", "expanded");
    fireEvent.keyDown(window, { key: "j", metaKey: true });
    expect(panel()).toHaveAttribute("data-state", "collapsed");
    unmount();

    render(<Shell shortcut={false} />);
    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(panel()).toHaveAttribute("data-state", "expanded");
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).not.toHaveAttribute("aria-keyshortcuts");
  });

  it("leaves ⌘B alone inside rich-text editors", () => {
    render(
      <>
        <Shell />
        <div contentEditable suppressContentEditableWarning data-testid="editor">
          Draft
        </div>
      </>,
    );
    fireEvent.keyDown(screen.getByTestId("editor"), { key: "b", metaKey: true });
    expect(panel()).toHaveAttribute("data-state", "expanded");
  });

  it("starts collapsed with defaultCollapsed and keeps item names on the rail", () => {
    render(<Shell defaultCollapsed />);
    expect(panel()).toHaveAttribute("data-state", "collapsed");
    expect(screen.getByRole("button", { name: "Projects" })).toBeInTheDocument();
  });

  it("shows a hover label with the badge on the rail", () => {
    render(<Shell defaultCollapsed />);
    const inbox = screen.getByRole("button", { name: /Inbox/ });
    fireEvent.pointerEnter(inbox, { pointerType: "mouse" });
    const hint = document.querySelector("[data-sidebar-hint]");
    expect(hint).toHaveTextContent("Inbox3");
    expect(hint).toHaveAttribute("aria-hidden", "true");
  });

  it("does not show hover labels while expanded", () => {
    render(<Shell />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Projects" }), { pointerType: "mouse" });
    expect(document.querySelector("[data-sidebar-hint]")).toBeNull();
  });

  it("hides the hover label on Escape", async () => {
    render(<Shell defaultCollapsed />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Projects" }), { pointerType: "mouse" });
    expect(document.querySelector("[data-sidebar-hint]")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(document.querySelector("[data-sidebar-hint]")).toBeNull();
  });

  it("merges onto a child with asChild", () => {
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarItem asChild active icon={<svg />}>
                <a href="/docs" onClick={onClick}>
                  Docs
                </a>
              </SidebarItem>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.className).toContain("rounded-lg");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("exposes state through useSidebar", () => {
    function Status() {
      const { collapsed, toggle } = useSidebar();
      return (
        <button type="button" onClick={toggle}>
          {collapsed ? "Rail" : "Full"}
        </button>
      );
    }
    render(
      <SidebarProvider>
        <Sidebar />
        <Status />
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Full" }));
    expect(screen.getByRole("button", { name: "Rail" })).toBeInTheDocument();
  });

  it("throws outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Orphan() {
      useSidebar();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/SidebarProvider/);
    spy.mockRestore();
  });

  it("applies an explicit color through --neon", () => {
    render(
      <SidebarProvider>
        <Sidebar color="lime" />
      </SidebarProvider>,
    );
    expect(panel().style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});
