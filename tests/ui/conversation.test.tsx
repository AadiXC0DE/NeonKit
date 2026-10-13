import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Conversation, ConversationDivider, type ConversationActions } from "@/components/ui/conversation";

// jsdom has no layout: give every element a tall scroll area before mounting.
function tall() {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", { value: 2000, configurable: true });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { value: 400, configurable: true });
}

afterEach(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollHeight;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight;
});

const pill = () => document.querySelector<HTMLButtonElement>("button[aria-label^='Jump to latest']")!;

describe("Conversation", () => {
  it("is a focusable log that holds announcements while streaming", () => {
    render(
      <Conversation streaming>
        <p>Hi</p>
      </Conversation>,
    );
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("tabindex", "0");
    expect(log).toHaveAttribute("aria-busy", "true");
  });

  it("shows the empty slot when there are no children", () => {
    render(<Conversation empty={<p>Nothing yet</p>} />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });

  it("shows Jump to latest with an unread count after scrolling up, and jumps back", async () => {
    tall();
    const actions = React.createRef<ConversationActions>();
    const { rerender } = render(
      <Conversation actionsRef={actions}>
        <p>One</p>
      </Conversation>,
    );
    const log = screen.getByRole("log");
    expect(pill()).toHaveAttribute("tabindex", "-1");
    expect(pill()).toHaveAttribute("aria-hidden", "true");

    log.scrollTop = 1600;
    fireEvent.scroll(log);
    fireEvent.wheel(log, { deltaY: -200 });
    log.scrollTop = 800;
    fireEvent.scroll(log);
    expect(actions.current?.isAtBottom()).toBe(false);

    rerender(
      <Conversation actionsRef={actions}>
        <p>One</p>
        <p>Two</p>
        <p>Three</p>
      </Conversation>,
    );
    await act(async () => {});
    expect(screen.getByRole("button", { name: "Jump to latest, 2 new" })).toHaveAttribute("tabindex", "0");

    fireEvent.click(screen.getByRole("button", { name: /Jump to latest/ }));
    expect(actions.current?.isAtBottom()).toBe(true);
  });

  it("doesn't count dividers as unread", async () => {
    tall();
    const actions = React.createRef<ConversationActions>();
    const { rerender } = render(
      <Conversation actionsRef={actions} initialScroll="top">
        <p>One</p>
      </Conversation>,
    );
    rerender(
      <Conversation actionsRef={actions} initialScroll="top">
        <p>One</p>
        <ConversationDivider>Today</ConversationDivider>
        <p>Two</p>
      </Conversation>,
    );
    await act(async () => {});
    expect(screen.getByRole("button", { name: "Jump to latest, 1 new" })).toBeInTheDocument();
  });

  it("labels dividers as separators", () => {
    render(<ConversationDivider>Yesterday</ConversationDivider>);
    expect(screen.getByRole("separator", { name: "Yesterday" })).toBeInTheDocument();
  });
});
