import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Terminal, Typewriter, type TerminalLine } from "@/components/ui/terminal";

const matchMedia = window.matchMedia;
const session: TerminalLine[] = [
  { kind: "comment", text: "# ship it" },
  { kind: "input", text: "npm run build" },
  { kind: "success", text: "Compiled in 4.2s" },
];

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("Terminal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.matchMedia = matchMedia;
  });

  it("gives screen readers the whole transcript at once", () => {
    const { container } = render(<Terminal title="build" lines={session} />);
    expect(container.querySelector("pre.sr-only")?.textContent).toBe("# ship it\n$ npm run build\nCompiled in 4.2s");
    expect(screen.getByText("build")).toBeInTheDocument();
  });

  it("types input lines and prints the rest, then shows a prompt", () => {
    const { container } = render(<Terminal lines={session} startOnView={false} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-state", "running");
    advance(900);
    expect(root).toHaveAttribute("data-state", "typing");
    advance(200);
    const typed = root.querySelector('[aria-hidden="true"] > div:nth-child(2) > span:nth-child(2)');
    expect(typed?.textContent?.length).toBeGreaterThan(0);
    expect(typed?.textContent?.length).toBeLessThan("npm run build".length);
    advance(3000);
    expect(root).toHaveAttribute("data-state", "done");
    expect(screen.getByRole("button", { name: "Replay" })).toBeInTheDocument();
  });

  it("starts over from Replay", () => {
    const { container } = render(<Terminal lines={session} startOnView={false} />);
    advance(5000);
    fireEvent.click(screen.getByRole("button", { name: "Replay" }));
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveAttribute("data-state", "done");
    expect(screen.queryByRole("button", { name: "Replay" })).toBeNull();
    advance(5000);
    expect(root).toHaveAttribute("data-state", "done");
  });

  it("loops without a Replay button", () => {
    const { container } = render(<Terminal lines={session} startOnView={false} loop />);
    const root = container.firstElementChild as HTMLElement;
    advance(4000);
    expect(root).toHaveAttribute("data-state", "done");
    expect(screen.queryByRole("button", { name: "Replay" })).toBeNull();
    advance(3300);
    expect(root).not.toHaveAttribute("data-state", "done");
  });

  it("uses a custom prompt", () => {
    const { container } = render(<Terminal lines={session} prompt="❯" />);
    expect(container.querySelector("pre.sr-only")?.textContent).toContain("❯ npm run build");
  });

  it("shows the finished session under reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { container } = render(<Terminal lines={session} startOnView={false} />);
    expect(container.firstElementChild).toHaveAttribute("data-state", "done");
    expect(container.querySelectorAll(".invisible")).toHaveLength(0);
  });

  it("forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Terminal ref={ref} lines={session} />);
    expect(ref.current?.tagName).toBe("DIV");
  });
});

describe("Typewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.matchMedia = matchMedia;
  });

  const visible = (container: HTMLElement) => container.querySelector('[aria-hidden="true"]')?.textContent;

  it("reads all words as one phrase", () => {
    render(<Typewriter words={["dashboards", "landing pages"]} />);
    expect(screen.getByText("dashboards, landing pages")).toHaveClass("sr-only");
  });

  it("deletes and types the next word", () => {
    const { container } = render(<Typewriter words={["ab", "xyz"]} pause={1000} typeSpeed={50} deleteSpeed={20} />);
    expect(visible(container)).toBe("ab");
    advance(1000);
    expect(visible(container)).toBe("a");
    expect(container.firstElementChild).toHaveAttribute("data-typing");
    advance(1000);
    expect(visible(container)).toBe("xyz");
    expect(container.firstElementChild).not.toHaveAttribute("data-typing");
  });

  it("stops on the last word without loop", () => {
    const { container } = render(<Typewriter words={["ab", "cd"]} loop={false} pause={500} />);
    advance(10000);
    expect(visible(container)).toBe("cd");
  });

  it("swaps words without typing under reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { container } = render(<Typewriter words={["ab", "cd"]} pause={500} />);
    advance(500);
    expect(visible(container)).toBe("cd");
    expect(container.firstElementChild).not.toHaveAttribute("data-typing");
  });

  it("hides the caret when asked", () => {
    const { container } = render(<Typewriter words={["ab"]} cursor={false} />);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });
});
