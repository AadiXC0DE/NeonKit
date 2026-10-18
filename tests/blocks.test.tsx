import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { act, render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { blockCategories, blockPath, blocks } from "@/registry";
import { blockComponents } from "@/registry/blocks.generated";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

// Sections that sit inside a page never own its h1; heroes own exactly one.
const sectionCategories = ["Navigation", "Features", "Social proof", "Testimonials", "Pricing", "FAQ", "Calls to action", "Footers"];

beforeAll(() => {
  // jsdom has no layout observers; blocks and the components inside them use both.
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", Observer);
  vi.stubGlobal("ResizeObserver", Observer);
});

describe.each(blocks.map((block) => [block.slug, block] as const))("%s", (slug, block) => {
  const source = read(blockPath(slug));
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/ .*$/gm, "");

  it("is listed with a known category, a version, a height and a real description", () => {
    expect(blockCategories).toContain(block.category);
    expect(block.addedIn).toMatch(/^\d+\.\d+$/);
    expect(block.height).toBeGreaterThan(0);
    expect(block.description).not.toMatch(/TODO/);
    expect(block.description.length).toBeLessThanOrEqual(120);
  });

  it("sets its color once at the root through neonVars", () => {
    expect(source).toMatch(/style=\{neonVars\(/);
  });

  it("only imports what a copied file can resolve", () => {
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      expect(specifier, specifier).toMatch(/^(react|motion\/react|@\/lib\/(utils|neon)|@\/components\/ui\/[a-z0-9-]+)$/);
    }
  });

  it("avoids utilities that changed meaning between Tailwind 3 and 4", () => {
    // Classes live in string literals; JSX prose ("nothing rounded up") and other props (frame="rounded") don't count.
    const strings = code
      .replace(/\b(?!className\b)[\w-]+="[^"]*"/g, "")
      .match(/"[^"\n]*"|`[^`]*`|'[^'\n]*'/g)
      ?.join("\n") ?? "";
    const banned = [
      /(?<![\w-])shadow-sm(?![\w-])/,
      /(?<![\w-])rounded-sm(?![\w-])/,
      /(?<![\w:-])rounded(?=["'`\s])/,
      /(?<![\w-])bg-gradient-to-/,
      /(?<![\w-])flex-shrink-/,
      /(?<![\w-])flex-grow/,
      /(?<![\w-])bg-opacity-/,
      /(?<![\w-])blur-sm(?![\w-])/,
      /(?<![\w-])backdrop-blur-sm(?![\w-])/,
    ];
    for (const pattern of banned) expect(strings, `${pattern}`).not.toMatch(pattern);
  });

  it("does not depend on this site's theme tokens", () => {
    expect(code).not.toMatch(/\b(?:bg|text|border)-(?:background|surface|elevated|fg|muted|dim|line)\b/);
    expect(code).not.toMatch(/\bfont-neon\b/);
    expect(code).not.toMatch(/\bbg-dots\b/);
  });

  it("does not touch storage", () => {
    expect(code).not.toMatch(/\b(localStorage|sessionStorage)\b/);
  });

  it("has a gallery thumbnail", () => {
    expect(existsSync(path.join(root, "public/thumbs", `${slug}.jpg`))).toBe(true);
  });

  it("renders with sound headings, labelled fields and named buttons", () => {
    const Block = blockComponents[slug];
    expect(Block).toBeDefined();
    vi.useFakeTimers();
    const { container, unmount } = render(<Block />);
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const h1s = container.querySelectorAll("h1").length;
    if (block.category === "Heroes") expect(h1s).toBe(1);
    else if (sectionCategories.includes(block.category)) expect(h1s).toBe(0);
    else expect(h1s).toBeLessThanOrEqual(1);

    const fields = container.querySelectorAll<HTMLElement>(
      "input:not([type=hidden]):not([aria-hidden=true]), textarea, select",
    );
    for (const field of fields) {
      if (field.closest("[aria-hidden=true],[inert]")) continue;
      const labelled =
        field.getAttribute("aria-label") ||
        field.getAttribute("aria-labelledby") ||
        field.closest("label") ||
        (field.id && container.querySelector(`label[for="${CSS.escape(field.id)}"]`));
      expect(labelled, `unlabelled <${field.tagName.toLowerCase()} name="${field.getAttribute("name") ?? ""}">`).toBeTruthy();
    }

    for (const button of container.querySelectorAll<HTMLElement>("button, [role=button]")) {
      if (button.closest("[aria-hidden=true],[inert]")) continue;
      const named =
        button.textContent?.trim() ||
        button.getAttribute("aria-label") ||
        button.getAttribute("aria-labelledby") ||
        button.getAttribute("title");
      expect(named, `unnamed button: ${button.outerHTML.slice(0, 160)}`).toBeTruthy();
    }

    unmount();
    vi.useRealTimers();
  });
});
