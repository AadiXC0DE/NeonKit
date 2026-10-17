import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import registry from "@/registry/registry.json";

/*
 * Size budgets. What people install is source, so this measures source: each component file gzipped, and its
 * installed footprint (the file plus every NeonKit component it pulls in). The limits sit a little above the
 * largest today, so they catch a component that quietly doubles rather than forcing anything to shrink.
 *
 * The icon set is one shared file that bundlers tree-shake to the glyphs you import, so it has its own budget
 * and isn't counted in every footprint that uses a single icon.
 */
const FILE_BUDGET = 16 * 1024;
const FOOTPRINT_BUDGET = 52 * 1024;
const SHARED = new Set(["icons"]);
/** Bigger by nature: the whole icon set is one file. */
const FILE_EXCEPTIONS: Record<string, number> = { icons: 32 * 1024 };

const root = path.resolve(__dirname, "..");
const bySlug = new Map(registry.items.map((item) => [item.slug, item]));
const gz = new Map<string, number>();

function gzipped(slug: string) {
  if (!gz.has(slug)) {
    const file = path.join(root, "src/components/ui", `${slug}.tsx`);
    gz.set(slug, existsSync(file) ? gzipSync(readFileSync(file)).length : 0);
  }
  return gz.get(slug)!;
}

function closure(slug: string, seen = new Set<string>()) {
  if (seen.has(slug)) return seen;
  seen.add(slug);
  for (const dep of bySlug.get(slug)?.registryDependencies ?? []) {
    const name = dep.replace(/^.*\//, "").replace(/\.json$/, "");
    if (bySlug.has(name)) closure(name, seen);
  }
  return seen;
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

describe("bundle budget", () => {
  it.each(registry.items.map((item) => item.slug))("%s source stays under its gzip budget", (slug) => {
    const budget = FILE_EXCEPTIONS[slug] ?? FILE_BUDGET;
    const size = gzipped(slug);
    expect(size, `${slug}.tsx is ${kb(size)} gzipped (budget ${kb(budget)})`).toBeLessThanOrEqual(budget);
  });

  it.each(registry.items.map((item) => item.slug))("%s installs under the footprint budget", (slug) => {
    const all = [...closure(slug)].filter((name) => name === slug || !SHARED.has(name));
    const size = all.reduce((sum, name) => sum + gzipped(name), 0);
    expect(size, `${slug} installs ${all.join(", ")}: ${kb(size)} gzipped (budget ${kb(FOOTPRINT_BUDGET)})`).toBeLessThanOrEqual(
      FOOTPRINT_BUDGET,
    );
  });
});
