import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

// What a Server Component hands over before the client module is linked: a lazy node.
function lazyNode(element: React.ReactElement) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: element,
    _init: (value: React.ReactElement) => value,
  } as unknown as React.ReactElement;
}

describe("Dialog", () => {
  it("merges the trigger onto an asChild element", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="btn">
            Edit profile
          </button>
        </DialogTrigger>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Edit profile" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveClass("btn");
  });

  it("keeps an asChild trigger that arrives as a lazy reference", () => {
    // Slot used to drop anything that wasn't already a plain element, so the trigger vanished.
    render(
      <Dialog>
        <DialogTrigger asChild>{lazyNode(<button type="button">Edit profile</button>)}</DialogTrigger>
        <DialogClose asChild>{lazyNode(<button type="button">Cancel</button>)}</DialogClose>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("server-renders a lazy asChild trigger", () => {
    const html = renderToString(
      <Dialog>
        <DialogTrigger asChild>{lazyNode(<button type="button">Edit profile</button>)}</DialogTrigger>
      </Dialog>,
    );
    expect(html).toContain('aria-haspopup="dialog"');
  });

  it("closes only the topmost dialog on Escape", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Dialog open onOpenChange={outer}>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <Dialog open onOpenChange={inner}>
            <DialogContent size="sm">
              <DialogTitle>Discard changes?</DialogTitle>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>,
    );
    const top = screen.getByText("Discard changes?").closest("dialog")!;
    // The browser sends cancel to the topmost modal only; React used to pass it up to the parent too.
    fireEvent(top, new Event("cancel", { cancelable: true }));
    expect(inner).toHaveBeenCalledWith(false);
    expect(outer).not.toHaveBeenCalled();

    fireEvent(screen.getByText("Edit profile").closest("dialog")!, new Event("cancel", { cancelable: true }));
    expect(outer).toHaveBeenCalledWith(false);
  });
});
