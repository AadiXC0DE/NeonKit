import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "@/components/ui/copy-button";

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function click(element: HTMLElement) {
  await act(async () => {
    fireEvent.click(element);
  });
}

describe("CopyButton", () => {
  it('is named "Copy" when it has no label', () => {
    render(<CopyButton value="x" />);
    expect(screen.getByRole("button", { name: "Copy" })).toHaveAttribute("type", "button");
  });

  it("uses its children or aria-label as the name", () => {
    const { rerender } = render(<CopyButton value="x">Copy key</CopyButton>);
    expect(screen.getByRole("button", { name: "Copy key" })).toBeInTheDocument();
    rerender(<CopyButton value="x" aria-label="Copy install command" />);
    expect(screen.getByRole("button", { name: "Copy install command" })).toBeInTheDocument();
  });

  it("copies the value, confirms and announces it, then resets", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const onCopy = vi.fn();
    render(<CopyButton value="npx neonkit" onCopy={onCopy} timeout={1000} />);
    const button = screen.getByRole("button", { name: "Copy" });
    await click(button);
    expect(writeText).toHaveBeenCalledWith("npx neonkit");
    expect(onCopy).toHaveBeenCalledWith("npx neonkit");
    expect(button).toHaveAttribute("data-state", "copied");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    expect(button.querySelector(".nk-copy-button-draw")).not.toBeNull();

    act(() => vi.advanceTimersByTime(1000));
    expect(button).toHaveAttribute("data-state", "idle");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("resolves function and async values on click", async () => {
    const value = vi.fn(async () => "nk_live_123");
    render(<CopyButton value={value} copiedLabel="Key copied" />);
    expect(value).not.toHaveBeenCalled();
    await click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("nk_live_123");
    expect(screen.getByRole("status")).toHaveTextContent("Key copied");
  });

  it("reports failures", async () => {
    const error = new Error("denied");
    writeText.mockRejectedValueOnce(error);
    const onCopyError = vi.fn();
    render(<CopyButton value="x" onCopyError={onCopyError} />);
    const button = screen.getByRole("button");
    await click(button);
    expect(onCopyError).toHaveBeenCalledWith(error);
    expect(button).toHaveAttribute("data-state", "error");
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
  });

  it("falls back to a hidden textarea outside secure contexts", async () => {
    Object.defineProperty(window, "isSecureContext", { value: false, configurable: true });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true });
    render(<CopyButton value="plain http" />);
    const button = screen.getByRole("button");
    button.focus();
    await click(button);
    expect(writeText).not.toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("data-state", "copied");
  });

  it("lets onClick cancel the copy", async () => {
    render(<CopyButton value="x" onClick={(event) => event.preventDefault()} />);
    await click(screen.getByRole("button"));
    expect(writeText).not.toHaveBeenCalled();
  });

  it("can skip the bubble but still announces", async () => {
    const { container } = render(<CopyButton value="x" bubble={false} />);
    await click(screen.getByRole("button"));
    expect(container.querySelector("button > span[aria-hidden]:last-child")?.textContent).not.toBe("Copied");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

  it("forwards its ref and applies color", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<CopyButton ref={ref} value="x" color="violet" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("168 85 247");
  });
});
