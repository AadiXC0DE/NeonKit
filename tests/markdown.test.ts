// @vitest-environment node
import { describe, expect, it } from "vitest";
import { componentMarkdown, llmsFullTxt, llmsTxt } from "@/lib/markdown";
import { registry } from "@/registry";

describe("llms.txt", () => {
  const text = llmsTxt();

  it("follows the llms.txt shape: title, summary, sections", () => {
    expect(text.startsWith("# NeonKit\n\n> ")).toBe(true);
    expect(text).toContain("## Docs");
    expect(text).toContain("## Optional");
  });

  it("links every component's markdown page", () => {
    for (const item of registry) expect(text).toContain(`/components/${item.slug}.md`);
  });
});

describe("component markdown", () => {
  it("includes install, usage, props and source", async () => {
    const md = await componentMarkdown("button");
    expect(md).toContain("# Button");
    expect(md).toContain("npx shadcn@latest add");
    expect(md).toContain("## API reference");
    expect(md).toContain("const Button = React.forwardRef");
  });

  it("escapes pipes inside table cells", async () => {
    const md = (await componentMarkdown("button"))!;
    const variantRow = md.split("\n").find((line) => line.startsWith("| `variant`"))!;
    expect(variantRow).toContain('"solid" \\| "outline"');
  });

  it("returns null for unknown components", async () => {
    expect(await componentMarkdown("nope")).toBeNull();
  });

  it("builds the full file with every component", async () => {
    const full = await llmsFullTxt();
    for (const item of registry) expect(full).toContain(`# Component: ${item.name}`);
  });
});
