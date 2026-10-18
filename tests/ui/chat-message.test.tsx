import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatMarkdown, ChatMessage, ChatReasoning, ChatToolCall } from "@/components/ui/chat-message";

afterEach(() => vi.useRealTimers());

describe("ChatMarkdown", () => {
  it("renders paragraphs, lists, inline code, bold and safe links", () => {
    const { container } = render(
      <ChatMarkdown>{"Hello **world** and `x`.\n\n- one\n- two\n\n[docs](https://a.dev) [bad](javascript:alert(1))"}</ChatMarkdown>,
    );
    expect(container.querySelector("strong")).toHaveTextContent("world");
    expect(container.querySelector("code")).toHaveTextContent("x");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute("rel", "noreferrer noopener");
    expect(screen.queryByRole("link", { name: "bad" })).toBeNull();
  });

  it("renders fenced code as a code block, with filename and highlighted lines", () => {
    const { container } = render(<ChatMarkdown>{"```ts src/a.ts {2}\nconst a = 1;\nconst b = 2;\n```"}</ChatMarkdown>);
    expect(screen.getByRole("region", { name: "src/a.ts" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-highlight]")).toHaveLength(1);
  });

  it("shows the caret while streaming and formats an unclosed fence", () => {
    const { container, rerender } = render(<ChatMarkdown streaming>{"Here:\n\n```ts\nconst a"}</ChatMarkdown>);
    expect(container.querySelector("[data-slot=caret]")).not.toBeNull();
    expect(screen.getByRole("region")).toHaveTextContent("const a");
    rerender(<ChatMarkdown>{"Here:\n\n```ts\nconst a = 1;\n```"}</ChatMarkdown>);
    expect(container.querySelector("[data-slot=caret]")).toBeNull();
  });
});

describe("ChatMessage", () => {
  it("is an article named by its sender", () => {
    render(<ChatMessage from="assistant" name="Argon" time="10:42" content="Hi" />);
    expect(screen.getByRole("article", { name: "Argon" })).toBeInTheDocument();
    expect(screen.getByText("10:42").tagName).toBe("TIME");
  });

  it("marks streaming messages busy and hides their actions", () => {
    const { rerender } = render(<ChatMessage from="assistant" name="Argon" content="Hal" streaming onRetry={() => {}} />);
    expect(screen.getByRole("article")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("toolbar")).toBeNull();
    rerender(<ChatMessage from="assistant" name="Argon" content="Hello" onRetry={() => {}} />);
    expect(screen.getByRole("toolbar", { name: "Message actions" })).toBeInTheDocument();
  });

  it("toggles feedback and clears it on a second press", () => {
    const onFeedbackChange = vi.fn();
    render(<ChatMessage from="assistant" name="Argon" content="Hi" onFeedbackChange={onFeedbackChange} />);
    const up = screen.getByRole("button", { name: "Good response" });
    fireEvent.click(up);
    expect(up).toHaveAttribute("aria-pressed", "true");
    expect(onFeedbackChange).toHaveBeenLastCalledWith("up");
    fireEvent.click(up);
    expect(onFeedbackChange).toHaveBeenLastCalledWith(null);
  });

  it("edits your own message inline", () => {
    const onEdit = vi.fn();
    render(<ChatMessage from="user" content="Rename it" onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit message" }));
    const box = screen.getByRole("textbox", { name: "Edit message" });
    expect(box).toHaveValue("Rename it");
    fireEvent.change(box, { target: { value: "Rename it everywhere" } });
    fireEvent.keyDown(box, { key: "Enter", metaKey: true });
    expect(onEdit).toHaveBeenCalledWith("Rename it everywhere");
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("cancels editing with Escape", () => {
    const onEdit = vi.fn();
    render(<ChatMessage from="user" content="Rename it" onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit message" }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Rename it")).toBeInTheDocument();
  });

  it("shows errors as an alert with Try again", () => {
    const onRetry = vi.fn();
    render(<ChatMessage from="assistant" name="Argon" content="Half" error="Dropped." onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Dropped.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("shows image attachments as named images and files as chips", () => {
    render(
      <ChatMessage
        from="user"
        content="See"
        attachments={[
          { name: "shot.png", type: "image/png", url: "data:image/png;base64,AA" },
          { name: "log.csv", size: 2048 },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "shot.png" })).toBeInTheDocument();
    expect(screen.getByText("log.csv")).toBeInTheDocument();
    expect(screen.getByText("CSV · 2 KB")).toBeInTheDocument();
  });
});

describe("ChatReasoning", () => {
  it("opens while streaming and folds itself away when done", () => {
    const { rerender } = render(<ChatReasoning streaming>Thinking hard</ChatReasoning>);
    const trigger = screen.getByRole("button", { name: /Thinking/ });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    rerender(<ChatReasoning duration={4}>Thinking hard</ChatReasoning>);
    expect(screen.getByRole("button", { name: "Thought for 4s" })).toHaveAttribute("aria-expanded", "false");
  });

  it("stays as the reader left it", () => {
    const { rerender } = render(<ChatReasoning streaming>Thinking</ChatReasoning>);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    rerender(<ChatReasoning duration={2}>Thinking</ChatReasoning>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });
});

describe("ChatToolCall", () => {
  it("summarises args, reports status and expands to show input and output", () => {
    render(<ChatToolCall name="read_file" args={{ path: "a.ts" }} status="done" duration={0.4} result="ok" />);
    const row = screen.getByRole("button", { name: /read_file/ });
    expect(row).toHaveTextContent('path: "a.ts"');
    expect(row).toHaveTextContent("0.4s");
    expect(row).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Arguments")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
  });

  it("names its state for screen readers", () => {
    render(<ChatToolCall name="deploy" status="running" />);
    expect(screen.getByText("deploy").closest("[data-status]")).toHaveAttribute("data-status", "running");
    expect(screen.getAllByText(/Running/).length).toBeGreaterThan(0);
  });
});

it("counts elapsed reasoning time", () => {
  vi.useFakeTimers();
  render(<ChatReasoning streaming>…</ChatReasoning>);
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole("button")).toHaveTextContent(/\ds/);
});
