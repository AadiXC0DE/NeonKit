import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock, tokenize } from "@/components/ui/code-block";

let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
});

const kinds = (code: string, lang: string) => tokenize(code, lang).filter(([k]) => k !== "plain");

describe("tokenize", () => {
  it("colors keywords, strings, functions and types in TS", () => {
    const tokens = kinds(`import { x } from "y";\nconst a: Props = make(1);`, "ts");
    expect(tokens).toContainEqual(["keyword", "import"]);
    expect(tokens).toContainEqual(["string", '"y"']);
    expect(tokens).toContainEqual(["type", "Props"]);
    expect(tokens).toContainEqual(["function", "make"]);
    expect(tokens).toContainEqual(["number", "1"]);
  });

  it("reads JSX text without treating apostrophes as strings", () => {
    const tokens = kinds(`return <p className="a">Don't {n} go</p>;`, "tsx");
    expect(tokens).toContainEqual(["tag", "p"]);
    expect(tokens).toContainEqual(["attr", "className"]);
    expect(tokens.some(([k, t]) => k === "string" && t.includes("Don"))).toBe(false);
  });

  it("handles shell prompts, commands, flags and variables", () => {
    const tokens = kinds(`$ NODE_ENV=prod npm run build --profile # go`, "bash");
    expect(tokens[0]).toEqual(["prompt", "$"]);
    expect(tokens).toContainEqual(["variable", "NODE_ENV"]);
    expect(tokens).toContainEqual(["function", "npm"]);
    expect(tokens).toContainEqual(["attr", "--profile"]);
    expect(tokens).toContainEqual(["comment", "# go"]);
  });

  it("tells CSS selectors from declarations and JSON keys from values", () => {
    const css = kinds(`a:hover { color: #fff; --x: 2px; }`, "css");
    expect(css).toContainEqual(["tag", "a"]);
    expect(css).toContainEqual(["keyword", ":hover"]);
    expect(css).toContainEqual(["property", "color"]);
    expect(css).toContainEqual(["variable", "--x"]);
    const json = kinds(`{ "a": "b", "n": true }`, "json");
    expect(json).toContainEqual(["property", '"a"']);
    expect(json).toContainEqual(["string", '"b"']);
    expect(json).toContainEqual(["number", "true"]);
  });

  it("returns plain text for unknown languages", () => {
    expect(tokenize("SELECT 1", "sql")).toEqual([["plain", "SELECT 1"]]);
  });
});

describe("CodeBlock", () => {
  it("renders the filename, language and a named, focusable code region", () => {
    render(<CodeBlock filename="app/page.tsx" code={"const a = 1;\nconst b = 2;"} />);
    expect(screen.getByText("page.tsx")).toBeInTheDocument();
    expect(screen.getByText("TSX")).toBeInTheDocument();
    const region = screen.getByRole("region", { name: "app/page.tsx" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region.querySelectorAll(".nk-code-row")).toHaveLength(2);
  });

  it("lights highlighted lines, including ranges", () => {
    const { container } = render(<CodeBlock code={"a\nb\nc\nd"} highlight={[1, [3, 4]]} />);
    const rows = container.querySelectorAll(".nk-code-row");
    expect(Array.from(rows).map((row) => row.hasAttribute("data-highlight"))).toEqual([true, false, true, true]);
  });

  it("marks diff lines and copies the file as it reads after the change", async () => {
    const { container } = render(<CodeBlock language="ts" diff code={" keep\n-old\n+new"} />);
    const rows = container.querySelectorAll(".nk-code-row");
    expect(rows[1]).toHaveAttribute("data-diff", "remove");
    expect(rows[2]).toHaveAttribute("data-diff", "add");
    expect(rows[2]).toHaveTextContent("Added:");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    });
    expect(writeText).toHaveBeenCalledWith("keep\nnew");
  });

  it("toggles wrap with aria-pressed", () => {
    const onWrapChange = vi.fn();
    render(<CodeBlock code="x" onWrapChange={onWrapChange} />);
    const toggle = screen.getByRole("button", { name: "Wrap lines" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onWrapChange).toHaveBeenCalledWith(true);
  });

  it("switches files with tabs and arrow keys", () => {
    const onValueChange = vi.fn();
    render(
      <CodeBlock
        onValueChange={onValueChange}
        files={[
          { filename: "a.ts", code: "const a = 1;" },
          { filename: "b.css", code: "a { top: 0 }" },
        ]}
      />,
    );
    const [a, b] = screen.getAllByRole("tab");
    expect(a).toHaveAttribute("aria-selected", "true");
    expect(b).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledWith("b.css");
    expect(b).toHaveAttribute("aria-selected", "true");
    expect(b).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("top");
    fireEvent.keyDown(b, { key: "Home" });
    expect(a).toHaveAttribute("aria-selected", "true");
  });

  it("numbers excerpts from startLine and hides the header on request", () => {
    const { container } = render(<CodeBlock code={"a\nb"} startLine={41} header={false} />);
    expect(container.querySelector(".nk-code-gutter")).toHaveTextContent("41");
    expect(screen.queryByRole("button", { name: "Wrap lines" })).toBeNull();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });
});
