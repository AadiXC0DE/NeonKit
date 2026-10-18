import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : file.endsWith(".tsx") ? [file] : [];
  });
}

// In base-* shadcn projects the CLI rewrites `<X asChild><a …/></X>` into `<X render={<a …/>} />`, and silently
// drops the child when it's a variable. Blocks and examples get copied into those projects, so every asChild
// there needs a written-out JSX element as its child. (Templates have the same check in templates.test.tsx.)
describe("asChild in copied code", () => {
  const files = ["src/components/blocks", "src/registry/examples"].flatMap((dir) => walk(path.join(root, dir)));

  it("always wraps a JSX element", () => {
    const problems: string[] = [];
    for (const file of files) {
      // Blank out comments and string contents so a `>` inside them can't end the tag early.
      const code = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, (m) => " ".repeat(m.length))
        .replace(/"[^"\n]*"/g, (m) => `"${" ".repeat(m.length - 2)}"`);
      for (const match of code.matchAll(/\sasChild\b/g)) {
        // Walk to the end of the opening tag, skipping `>` inside {expressions}.
        let depth = 0;
        let i = match.index!;
        for (; i < code.length; i++) {
          if (code[i] === "{") depth++;
          else if (code[i] === "}") depth--;
          else if (code[i] === ">" && depth === 0) break;
        }
        const next = code.slice(i + 1).trimStart()[0];
        if (code[i - 1] === "/" || next !== "<") {
          problems.push(`${path.relative(root, file)}:${code.slice(0, match.index).split("\n").length}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});
