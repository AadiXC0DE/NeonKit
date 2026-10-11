import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { componentPath, examplePath, registry } from "@/registry";
import { docs } from "@/registry/docs";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe.each(registry.map((item) => [item.slug, item] as const))("%s", (slug, item) => {
  const source = read(componentPath(slug));
  // Class names live in code; prose in comments is free to say "rounded".
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/ .*$/gm, "");

  it("has docs with at least a demo example and an API table", () => {
    const doc = docs[slug];
    expect(doc).toBeDefined();
    expect(doc.examples[0]?.name).toBe("demo");
    expect(doc.api.length).toBeGreaterThan(0);
  });

  it("has a source file for every example", () => {
    for (const example of docs[slug].examples) {
      expect(existsSync(path.join(root, examplePath(slug, example.name)))).toBe(true);
    }
  });

  it("reads color through --neon with an inherited fallback", () => {
    expect(source).toContain("[--neon:var(--neon-accent,34_211_238)]");
  });

  it("avoids utilities that changed meaning between Tailwind 3 and 4", () => {
    const banned = [
      /(?<![\w-])shadow-sm(?![\w-])/,
      /(?<![\w-])rounded-sm(?![\w-])/,
      /(?<![\w:-])rounded(?=["\s])/,
      /(?<![\w-])bg-gradient-to-/,
      /(?<![\w-])flex-shrink-/,
      /(?<![\w-])flex-grow/,
      /(?<![\w-])bg-opacity-/,
      /(?<![\w-])blur-sm(?![\w-])/,
      /(?<![\w-])backdrop-blur-sm(?![\w-])/,
    ];
    for (const pattern of banned) expect(code, `${pattern}`).not.toMatch(pattern);
  });

  it("does not depend on this site's theme tokens", () => {
    expect(code).not.toMatch(/\b(?:bg|text|border)-(?:background|surface|elevated|fg|muted|dim|line)\b/);
    expect(code).not.toMatch(/\bfont-neon\b/);
  });

  it("is listed with a known category", () => {
    expect(["Forms", "Data Display", "Feedback", "Overlay", "Effects"]).toContain(item.category);
  });
});
