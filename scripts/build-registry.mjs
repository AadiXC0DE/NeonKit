// Builds shadcn-compatible registry items into public/r/ and checks that
// every component only imports what its registry entry declares.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public/r");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://get-neonkit.vercel.app").replace(/\/$/, "");
const SCHEMA_ITEM = "https://ui.shadcn.com/schema/registry-item.json";

const { items } = JSON.parse(await readFile(path.join(root, "src/registry/registry.json"), "utf8"));
const docsIndex = await readFile(path.join(root, "src/registry/docs/index.ts"), "utf8");

const errors = [];
const always = new Set(["react", "@/lib/utils", "@/lib/neon"]);

function importsOf(source) {
  const specifiers = new Set();
  for (const match of source.matchAll(/(?:import|export)\s[^"';]*?from\s+["']([^"']+)["']/g)) specifiers.add(match[1]);
  for (const match of source.matchAll(/import\s+["']([^"']+)["']/g)) specifiers.add(match[1]);
  return [...specifiers];
}

const packageName = (specifier) =>
  specifier.startsWith("@") && !specifier.startsWith("@/")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const neonSource = await readFile(path.join(root, "src/lib/neon.ts"), "utf8");
await writeFile(
  path.join(outDir, "neon.json"),
  JSON.stringify(
    {
      $schema: SCHEMA_ITEM,
      name: "neon",
      type: "registry:lib",
      title: "Neon helpers",
      description: "The NeonKit palette and the neonVars() color helper.",
      files: [{ path: "lib/neon.ts", type: "registry:lib", content: neonSource }],
    },
    null,
    2,
  ),
);

for (const item of items) {
  const file = path.join(root, "src/components/ui", `${item.slug}.tsx`);
  if (!existsSync(file)) {
    errors.push(`${item.slug}: missing src/components/ui/${item.slug}.tsx`);
    continue;
  }
  if (!existsSync(path.join(root, "src/registry/docs", `${item.slug}.tsx`))) {
    errors.push(`${item.slug}: missing src/registry/docs/${item.slug}.tsx`);
  }
  if (!docsIndex.includes(`"${item.slug}"`)) {
    errors.push(`${item.slug}: not listed in src/registry/docs/index.ts`);
  }

  const source = await readFile(file, "utf8");
  const declared = new Set(item.dependencies);
  const used = new Set();
  for (const specifier of importsOf(source)) {
    if (always.has(specifier)) continue;
    const pkg = packageName(specifier);
    used.add(pkg);
    if (!declared.has(pkg)) errors.push(`${item.slug}: imports "${specifier}" but registry.json does not list "${pkg}"`);
  }
  for (const dep of declared) {
    if (!used.has(dep)) errors.push(`${item.slug}: registry.json lists "${dep}" but the component never imports it`);
  }

  await writeFile(
    path.join(outDir, `${item.slug}.json`),
    JSON.stringify(
      {
        $schema: SCHEMA_ITEM,
        name: item.slug,
        type: "registry:ui",
        title: item.name,
        description: item.description,
        dependencies: item.dependencies,
        registryDependencies: ["utils", `${siteUrl}/r/neon.json`],
        files: [{ path: `components/ui/${item.slug}.tsx`, type: "registry:ui", content: source }],
      },
      null,
      2,
    ),
  );
}

await writeFile(
  path.join(outDir, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "neonkit",
      homepage: siteUrl,
      items: [
        { name: "neon", type: "registry:lib", files: [{ path: "lib/neon.ts", type: "registry:lib" }] },
        ...items.map((item) => ({
          name: item.slug,
          type: "registry:ui",
          title: item.name,
          description: item.description,
          dependencies: item.dependencies,
          registryDependencies: ["utils", `${siteUrl}/r/neon.json`],
          files: [{ path: `components/ui/${item.slug}.tsx`, type: "registry:ui" }],
        })),
      ],
    },
    null,
    2,
  ),
);

if (errors.length) {
  console.error(`\nRegistry check failed:\n  ${errors.join("\n  ")}\n`);
  process.exit(1);
}

console.log(`Registry: ${items.length} components + neon helper written to public/r`);
