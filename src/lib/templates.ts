import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function filesIn(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? filesIn(path.join(dir, entry.name)) : [path.join(dir, entry.name)])),
  );
  return nested.flat().sort();
}

/** Where each of a template's files lands in the user's app, mirroring scripts/build-registry.mjs. */
export async function templateTargets(slug: string) {
  const sections = path.join(root, "src/components/templates", slug);
  const routes = path.join(root, "app/preview", slug);
  return [
    ...(await filesIn(routes)).map((file) => `app/${slug}/${path.relative(routes, file)}`),
    ...(await filesIn(sections)).map((file) => `components/templates/${slug}/${path.relative(sections, file)}`),
  ];
}
