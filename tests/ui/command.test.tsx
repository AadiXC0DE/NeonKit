import * as React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "@/components/ui/command";

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

const input = () => screen.getByRole("combobox");
const activeOption = () => {
  const id = input().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};
const type = (search: string) => fireEvent.change(input(), { target: { value: search } });
const press = (key: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(input(), { key, ...init });

function Palette(props: React.ComponentProps<typeof Command> & { onSelect?: (value: string) => void }) {
  const { onSelect, ...rest } = props;
  return (
    <Command label="Commands" {...rest}>
      <CommandInput />
      <CommandList>
        <CommandEmpty>Nothing lit up.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={onSelect}>Dashboard</CommandItem>
          <CommandItem onSelect={onSelect} keywords={["builds", "releases"]}>
            Deployments
          </CommandItem>
          <CommandItem onSelect={onSelect} disabled>
            Billing
          </CommandItem>
          <CommandItem onSelect={onSelect} shortcut="⌘,">
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem value="theme-cyan" onSelect={onSelect}>
            Cyan
          </CommandItem>
          <CommandItem value="theme-magenta" onSelect={onSelect}>
            Magenta
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command", () => {
  it("wires the input to the list as a combobox and highlights the first item", () => {
    render(<Palette />);
    const listbox = screen.getByRole("listbox");
    expect(input()).toHaveAttribute("aria-controls", listbox.id);
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(activeOption()).toHaveTextContent("Dashboard");
    expect(activeOption()).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("group", { name: "Navigate" })).toBeInTheDocument();
  });

  it("moves with the arrows, skips disabled items and loops", () => {
    render(<Palette />);
    press("ArrowDown");
    expect(activeOption()).toHaveTextContent("Deployments");
    press("ArrowDown");
    expect(activeOption()).toHaveTextContent("Settings");
    press("End");
    expect(activeOption()).toHaveTextContent("Magenta");
    press("ArrowDown");
    expect(activeOption()).toHaveTextContent("Dashboard");
    press("ArrowUp");
    expect(activeOption()).toHaveTextContent("Magenta");
    press("Home");
    expect(activeOption()).toHaveTextContent("Dashboard");
    press("n", { ctrlKey: true });
    expect(activeOption()).toHaveTextContent("Deployments");
  });

  it("stops at the ends with loop={false}", () => {
    render(<Palette loop={false} />);
    press("ArrowUp");
    expect(activeOption()).toHaveTextContent("Dashboard");
  });

  it("jumps between groups with Alt+Arrow", () => {
    render(<Palette />);
    press("ArrowDown", { altKey: true });
    expect(activeOption()).toHaveTextContent("Cyan");
    press("ArrowUp", { altKey: true });
    expect(activeOption()).toHaveTextContent("Dashboard");
  });

  it("selects with Enter and click, passing the value", () => {
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    press("ArrowDown");
    press("Enter");
    expect(onSelect).toHaveBeenLastCalledWith("Deployments");
    fireEvent.click(screen.getByRole("option", { name: "Magenta" }));
    expect(onSelect).toHaveBeenLastCalledWith("theme-magenta");
    fireEvent.click(screen.getByRole("option", { name: "Billing" }));
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("ranks prefix, word start, substring, then subsequence matches", () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem>Delete preview</CommandItem>
          <CommandItem>Independent review</CommandItem>
          <CommandItem>Open deployments</CommandItem>
          <CommandItem>Deploy to production</CommandItem>
          <CommandItem>Invite teammate</CommandItem>
        </CommandList>
      </Command>,
    );
    type("dep");
    expect(screen.queryByRole("option", { name: "Invite teammate" })).not.toBeInTheDocument();
    const seen = [activeOption()?.textContent];
    for (let i = 0; i < 3; i++) {
      press("ArrowDown");
      seen.push(activeOption()?.textContent);
    }
    expect(seen).toEqual(["Deploy to production", "Open deployments", "Independent review", "Delete preview"]);
  });

  it("matches acronyms, keywords and words in any order", () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem>Change theme</CommandItem>
          <CommandItem>Go to deployments</CommandItem>
          <CommandItem keywords={["preferences"]}>Settings</CommandItem>
        </CommandList>
      </Command>,
    );
    type("gtd");
    expect(activeOption()).toHaveTextContent("Go to deployments");
    type("prefer");
    expect(activeOption()).toHaveTextContent("Settings");
    type("deployments go");
    expect(activeOption()).toHaveTextContent("Go to deployments");
  });

  it("lights up the matched characters", () => {
    render(<Palette />);
    type("dep");
    const option = screen.getByRole("option", { name: "Deployments" });
    const lit = option.querySelector("span.truncate > span");
    expect(lit).toHaveTextContent(/^Dep$/);
  });

  it("hides groups without matches and shows the empty state", () => {
    render(<Palette />);
    type("magenta");
    expect(screen.queryByRole("group", { name: "Navigate" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Magenta" })).toBeVisible();

    type("zzzz");
    expect(screen.getByText("Nothing lit up.")).toBeInTheDocument();
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    expect(screen.getByRole("status")).toHaveTextContent("No results");
    // A listbox may only hold options, so the list drops the role while it shows the empty message.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    type("mag");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("reports the highlighted value and follows a controlled value", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Palette value="Settings" onValueChange={onValueChange} />);
    expect(activeOption()).toHaveTextContent("Settings");
    press("ArrowDown");
    expect(onValueChange).toHaveBeenLastCalledWith("theme-cyan");
    expect(activeOption()).toHaveTextContent("Settings");
    rerender(<Palette value="theme-cyan" onValueChange={onValueChange} />);
    expect(activeOption()).toHaveTextContent("Cyan");
  });

  it("supports a controlled search and shouldFilter={false}", () => {
    function Remote() {
      const [search, setSearch] = React.useState("");
      return (
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} />
          <CommandList>
            {search === "react" && <CommandLoading>Searching packages…</CommandLoading>}
            <CommandItem>react-dom</CommandItem>
            <CommandItem>preact</CommandItem>
          </CommandList>
        </Command>
      );
    }
    render(<Remote />);
    type("react");
    expect(input()).toHaveValue("react");
    expect(screen.getByRole("option", { name: "preact" })).toBeVisible();
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Searching packages…")).toBeInTheDocument();
  });

  it("exposes shortcuts through aria-keyshortcuts", () => {
    render(<Palette />);
    expect(screen.getByRole("option", { name: "Settings" })).toHaveAttribute("aria-keyshortcuts", "Meta+,");
  });
});

describe("CommandDialog", () => {
  function DialogPalette() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open palette
        </button>
        <CommandDialog open={open} onOpenChange={setOpen} label="Dev tools">
          <CommandInput />
          <CommandList>
            <CommandItem onSelect={() => setOpen(false)}>Open logs</CommandItem>
          </CommandList>
        </CommandDialog>
      </>
    );
  }

  it("opens as a modal, focuses the input and closes from the esc button", async () => {
    render(<DialogPalette />);
    const trigger = screen.getByRole("button", { name: "Open palette" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Dev tools" });
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByRole("combobox")).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(trigger).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes on Escape (the dialog's cancel event) and after selecting", async () => {
    render(<DialogPalette />);
    fireEvent.click(screen.getByRole("button", { name: "Open palette" }));
    const dialog = screen.getByRole("dialog", { name: "Dev tools" });
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));

    fireEvent.click(screen.getByRole("button", { name: "Open palette" }));
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  });
});
