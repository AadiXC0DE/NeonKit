import * as React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  // jsdom has no showModal; the open attribute is all these tests need.
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

function Settings(props: Omit<React.ComponentProps<typeof Sheet>, "children"> & { side?: "top" | "right" | "bottom" | "left" }) {
  const { side, ...rest } = props;
  return (
    <Sheet {...rest}>
      <SheetTrigger>Edit environment</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Environment variables</SheetTitle>
          <SheetDescription>Changes apply to the next deployment.</SheetDescription>
        </SheetHeader>
        <input aria-label="DATABASE_URL" />
        <SheetFooter>
          <SheetClose>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const sheet = () => screen.getByRole("dialog", { hidden: true });

describe("Sheet", () => {
  it("opens a modal dialog named and described by its title and description", () => {
    render(<Settings />);
    const trigger = screen.getByRole("button", { name: "Edit environment" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(sheet()).not.toHaveAttribute("open");

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Environment variables" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("Changes apply to the next deployment.");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("closes on Escape after the exit animation and returns focus", async () => {
    const onOpenChange = vi.fn();
    render(<Settings onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Edit environment" });
    trigger.focus();
    fireEvent.click(trigger);

    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(sheet(), cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(sheet()).not.toHaveAttribute("open"));
    expect(trigger).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes from SheetClose and the X button", async () => {
    render(<Settings />);
    fireEvent.click(screen.getByRole("button", { name: "Edit environment" }));
    fireEvent.click(within(sheet()).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(sheet()).not.toHaveAttribute("open"));

    fireEvent.click(screen.getByRole("button", { name: "Edit environment" }));
    fireEvent.click(within(sheet()).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(sheet()).not.toHaveAttribute("open"));
  });

  it("stays open when controlled", () => {
    const onOpenChange = vi.fn();
    render(<Settings open onOpenChange={onOpenChange} />);
    fireEvent.click(within(sheet()).getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(sheet()).toHaveAttribute("open");
  });

  it("slides from the chosen side, with a grab handle on bottom sheets", () => {
    const { container, unmount } = render(<Settings defaultOpen side="bottom" />);
    expect(container.ownerDocument.querySelector(".cursor-grab")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Environment variables" }).closest(".rounded-t-2xl")).not.toBeNull();
    unmount();

    render(<Settings defaultOpen side="left" />);
    expect(document.querySelector(".cursor-grab")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Environment variables" }).closest(".border-r")).not.toBeNull();
  });

  it("merges onto its child with asChild and respects preventDefault", () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <a href="#filters" onClick={(event) => event.preventDefault()}>
            Filters
          </a>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Filters</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    const link = screen.getByRole("link", { name: "Filters" });
    expect(link).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(link);
    expect(sheet()).not.toHaveAttribute("open");
  });

  it("opens from a render-prop trigger, as the shadcn CLI writes it in base-* projects", () => {
    render(
      <Sheet>
        <SheetTrigger render={<button type="button" className="menu" />}>Menu</SheetTrigger>
        <SheetContent>
          <SheetTitle>Menu</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger).toHaveClass("menu");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);
    expect(sheet()).toHaveAttribute("open");
  });

  it("applies color through --neon on the dialog", () => {
    render(<Settings color="lime" defaultOpen />);
    expect(sheet().style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});
