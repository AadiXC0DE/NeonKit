import * as React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
});

function Chargers(props: Partial<React.ComponentProps<typeof Drawer>>) {
  return (
    <Drawer {...props}>
      <DrawerTrigger>Find a charger</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Chargers near you</DrawerTitle>
        <DrawerDescription>7 stations within 6 km.</DrawerDescription>
        <DrawerClose>Done</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

// What a Server Component hands over before the client module is linked: a lazy node.
function lazyNode(element: React.ReactElement) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: element,
    _init: (value: React.ReactElement) => value,
  } as unknown as React.ReactElement;
}

const dialogs = () => screen.getAllByRole("dialog", { hidden: true });

describe("Drawer", () => {
  it("opens a modal dialog named and described by its parts, with focus on the panel", () => {
    render(<Chargers />);
    const trigger = screen.getByRole("button", { name: "Find a charger" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Chargers near you" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("7 stations within 6 km.");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement?.getAttribute("tabindex")).toBe("-1");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes from Escape and DrawerClose, returning focus", async () => {
    const onOpenChange = vi.fn();
    render(<Chargers onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Find a charger" });
    trigger.focus();
    fireEvent.click(trigger);

    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(dialogs()[0], cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(dialogs()[0]).not.toHaveAttribute("open"));
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.click(within(dialogs()[0]).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialogs()[0]).not.toHaveAttribute("open"));
  });

  it("ignores Escape when not dismissible", () => {
    const onOpenChange = vi.fn();
    render(<Chargers defaultOpen dismissible={false} onOpenChange={onOpenChange} />);
    fireEvent(dialogs()[0], new Event("cancel", { cancelable: true }));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(dialogs()[0]).toHaveAttribute("open");
  });

  it("turns the handle into a button that steps through snap points", () => {
    const onSnap = vi.fn();
    render(<Chargers defaultOpen snapPoints={[0.4, 0.85]} onActiveSnapPointChange={onSnap} />);
    const handle = screen.getByRole("button", { name: "Expand drawer" });
    fireEvent.click(handle);
    expect(onSnap).toHaveBeenLastCalledWith(0.85);
    expect(screen.getByRole("button", { name: "Collapse drawer" })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("button", { name: "Collapse drawer" }), { key: "ArrowDown" });
    expect(onSnap).toHaveBeenLastCalledWith(0.4);
  });

  it("has a decorative handle without snap points", () => {
    render(<Chargers defaultOpen />);
    expect(screen.queryByRole("button", { name: /drawer/ })).not.toBeInTheDocument();
  });

  it("closes only the topmost drawer on Escape", async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Order #4821</DrawerTitle>
          <Drawer defaultOpen>
            <DrawerContent>
              <DrawerTitle>Delivery time</DrawerTitle>
            </DrawerContent>
          </Drawer>
        </DrawerContent>
      </Drawer>,
    );
    const child = screen.getByRole("dialog", { name: "Delivery time" });
    const parent = screen.getByRole("dialog", { name: "Order #4821" });
    fireEvent(child, new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(child).not.toHaveAttribute("open"));
    expect(parent).toHaveAttribute("open");
  });

  it("keeps asChild triggers and closes that arrive as lazy references", async () => {
    const tree = (
      <Drawer>
        <DrawerTrigger asChild>{lazyNode(<button type="button">Order #4821</button>)}</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Order #4821</DrawerTitle>
          <DrawerClose asChild>{lazyNode(<button type="button">Done</button>)}</DrawerClose>
        </DrawerContent>
      </Drawer>
    );
    expect(renderToString(tree)).toContain('aria-haspopup="dialog"');
    render(tree);
    const trigger = screen.getByRole("button", { name: "Order #4821" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);
    expect(dialogs()[0]).toHaveAttribute("open");
    fireEvent.click(within(dialogs()[0]).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialogs()[0]).not.toHaveAttribute("open"));
  });
});
