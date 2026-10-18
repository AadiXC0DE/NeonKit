import * as React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogConfirmInput,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

function DeleteProject(props: { onAction?: () => void; onOpenChange?: (open: boolean) => void; confirmText?: string }) {
  return (
    <AlertDialog confirmText={props.confirmText} onOpenChange={props.onOpenChange}>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete acme-web?</AlertDialogTitle>
        <AlertDialogDescription>214 deployments go with it.</AlertDialogDescription>
        {props.confirmText && <AlertDialogConfirmInput />}
        <AlertDialogFooter>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction variant="danger" onClick={props.onAction}>
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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

const dialog = () => screen.getByRole("alertdialog", { hidden: true });

describe("AlertDialog", () => {
  it("opens an alertdialog named and described by its parts, with Cancel focused", () => {
    render(<DeleteProject />);
    const trigger = screen.getByRole("button", { name: "Delete" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);

    const alert = screen.getByRole("alertdialog", { name: "Delete acme-web?" });
    expect(alert).toHaveAttribute("open");
    expect(alert).toHaveAttribute("aria-modal", "true");
    expect(alert).toHaveAccessibleDescription("214 deployments go with it.");
    expect(screen.getByRole("button", { name: "Keep project" })).toHaveFocus();
  });

  it("cancels on Escape and returns focus to the trigger", async () => {
    const onOpenChange = vi.fn();
    render(<DeleteProject onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Delete" });
    trigger.focus();
    fireEvent.click(trigger);

    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(dialog(), cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(dialog()).not.toHaveAttribute("open"));
    expect(trigger).toHaveFocus();
  });

  it("does not close when the overlay is clicked", () => {
    const onOpenChange = vi.fn();
    render(<DeleteProject onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const overlay = dialog().querySelector("[aria-hidden]") as HTMLElement;
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(dialog()).toHaveAttribute("open");
  });

  it("runs the action and closes", async () => {
    const onAction = vi.fn();
    render(<DeleteProject onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const action = within(dialog()).getByRole("button", { name: "Delete project" });
    expect(action).toBeEnabled();
    expect(action).toHaveAttribute("data-state", "lit");
    fireEvent.click(action);
    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(dialog()).not.toHaveAttribute("open"));
  });

  it("keeps the action unlit until confirmText is typed, then Enter confirms", async () => {
    const onAction = vi.fn();
    render(<DeleteProject confirmText="acme-web" onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const action = within(dialog()).getByRole("button", { name: "Delete project" });
    const input = within(dialog()).getByLabelText(/to confirm/);
    expect(input).toHaveAccessibleName("Type acme-web to confirm");
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute("data-state", "unlit");

    fireEvent.change(input, { target: { value: "acme-x" } });
    expect(input).toHaveAttribute("aria-invalid", "true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAction).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "acme-web" } });
    expect(action).toBeEnabled();
    expect(action).toHaveAttribute("data-state", "lit");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(dialog()).not.toHaveAttribute("open"));
  });

  it("clears the confirmation when reopened", async () => {
    render(<DeleteProject confirmText="acme-web" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.change(within(dialog()).getByLabelText(/to confirm/), { target: { value: "acme-web" } });
    fireEvent.click(within(dialog()).getByRole("button", { name: "Keep project" }));
    await waitFor(() => expect(dialog()).not.toHaveAttribute("open"));

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(within(dialog()).getByLabelText(/to confirm/)).toHaveValue("");
    expect(within(dialog()).getByRole("button", { name: "Delete project" })).toBeDisabled();
  });

  it("stays open when the action handler prevents default", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Leave workspace?</AlertDialogTitle>
          <AlertDialogCancel>Stay</AlertDialogCancel>
          <AlertDialogAction onClick={(event) => event.preventDefault()}>Leave</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(within(dialog()).getByRole("button", { name: "Leave" }));
    expect(dialog()).toHaveAttribute("open");
  });

  it("keeps asChild triggers and cancels that arrive as lazy references", async () => {
    const tree = (
      <AlertDialog>
        <AlertDialogTrigger asChild>{lazyNode(<button type="button">Revoke</button>)}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Revoke this key?</AlertDialogTitle>
          <AlertDialogCancel asChild>{lazyNode(<button type="button">Cancel</button>)}</AlertDialogCancel>
          <AlertDialogAction>Revoke key</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(renderToString(tree)).toContain('aria-haspopup="dialog"');
    render(tree);
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    const cancel = within(dialog()).getByRole("button", { name: "Cancel" });
    expect(cancel).toHaveFocus();
    fireEvent.click(cancel);
    await waitFor(() => expect(dialog()).not.toHaveAttribute("open"));
  });
});
