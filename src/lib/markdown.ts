import "server-only";

import { registryUrl, siteConfig } from "@/config/site";
import { readSource } from "@/lib/highlight";
import { neonColorNames } from "@/lib/neon";
import { blocks, categories, componentPath, examplePath, getItem, registry } from "@/registry";
import { docs } from "@/registry/docs";

const fence = (code: string, lang = "tsx") => `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``;
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const pageUrl = (slug: string) => `${siteConfig.url}/components/${slug}`;

export const guides = {
  installation: `## Installation

NeonKit needs React 18+ and Tailwind CSS 3.4 or 4. Components are published as a shadcn registry.

Add one with the shadcn CLI (run \`npx shadcn@latest init\` first in a new project):

${fence(`npx shadcn@latest add ${registryUrl("switch")}`, "bash")}

Or register the namespace once in \`components.json\` and use short names:

${fence(`{
  "registries": {
    "@neonkit": "${siteConfig.url}/r/{name}.json"
  }
}`, "json")}

${fence("npx shadcn@latest add @neonkit/switch @neonkit/tabs @neonkit/toast", "bash")}

The CLI writes \`components/ui/<name>.tsx\`, installs npm dependencies and adds \`lib/neon.ts\`. Use \`--overwrite\` to replace an existing shadcn file with the same name.

Manual install: \`npm install clsx tailwind-merge\`, add \`lib/utils.ts\` (exports \`cn\`) and \`lib/neon.ts\`, then paste a component's source into \`components/ui\`. Components import from \`@/lib/utils\` and \`@/lib/neon\`.

NeonKit is dark only. Glows are tuned for backgrounds near \`#05060a\`.`,

  theming: `## Theming

Every component reads its color from one CSS variable, \`--neon\`, holding space-separated RGB channels.

- Per component: \`<Button color="magenta">\` or any hex, \`<Badge color="#ff6a00">\`.
- Per section: components without a \`color\` inherit \`--neon-accent\` from the nearest ancestor. \`neonVars(color)\` from \`@/lib/neon\` returns the style object: \`<section style={neonVars("lime")}>\`.
- App-wide: \`:root { --neon-accent: 255 95 162; }\` in global CSS.
- Default when nothing is set: cyan.

Palette names: ${neonColorNames.join(", ")}. Edit \`neonColors\` in \`lib/neon.ts\` to change or add colors.`,

  conventions: `## Conventions

- Props: \`color\`, \`variant\`, \`size\` ("sm" | "md" | "lg"), \`disabled\`. Controlled/uncontrolled pairs use \`checked\`/\`defaultChecked\`/\`onCheckedChange\` and \`value\`/\`defaultValue\`/\`onValueChange\`.
- Components forward refs, spread native props onto the root and accept \`className\`.
- Motion comes from the \`motion\` package (\`motion/react\`); icons from \`lucide-react\`.
- Everything respects \`prefers-reduced-motion\` and is keyboard accessible.`,
};

export async function componentMarkdown(slug: string) {
  const item = getItem(slug);
  const doc = docs[slug];
  if (!item || !doc) return null;

  const [source, examples] = await Promise.all([
    readSource(componentPath(slug)),
    Promise.all(
      doc.examples.map(async (example) => ({
        ...example,
        code: await readSource(examplePath(slug, example.name)),
      })),
    ),
  ]);

  const deps = item.dependencies.length ? item.dependencies.map((d) => `\`${d}\``).join(", ") : "none";

  const sections = [
    `# ${item.name}`,
    `> ${item.description}`,
    `Category: ${item.category}. Docs: ${pageUrl(slug)}`,
    `## Installation`,
    fence(`npx shadcn@latest add ${registryUrl(slug)}`, "bash"),
    `With the \`@neonkit\` namespace configured: \`npx shadcn@latest add @neonkit/${slug}\`.`,
    `npm dependencies: ${deps}. Also needs \`lib/utils.ts\` (\`cn\`) and \`lib/neon.ts\` (\`neonVars\`), which the CLI adds.`,
    ...(item.registryDependencies?.length
      ? [`Builds on: ${item.registryDependencies.map((dep) => `[${getItem(dep)?.name ?? dep}](${pageUrl(dep)}.md)`).join(", ")}. The CLI installs them too.`]
      : []),
    `## Usage`,
    fence(doc.usage),
    `## Examples`,
    ...examples.flatMap((example) => [
      `### ${example.title}`,
      ...(example.description ? [example.description] : []),
      fence(example.code),
    ]),
    `## API reference`,
    ...doc.api.flatMap((part) => [
      `### ${part.name}`,
      ...(part.description ? [part.description] : []),
      [
        "| Prop | Type | Default | Description |",
        "| --- | --- | --- | --- |",
        ...part.props.map(
          (row) => `| \`${cell(row.prop)}\` | \`${cell(row.type)}\` | ${row.default ? `\`${cell(row.default)}\`` : "—"} | ${cell(row.description)} |`,
        ),
      ].join("\n"),
    ]),
    ...(doc.notes?.length ? [`## Accessibility`, doc.notes.map((note) => `- ${note}`).join("\n")] : []),
    `## Source`,
    `\`components/ui/${slug}.tsx\``,
    fence(source),
  ];

  return sections.join("\n\n") + "\n";
}

export function llmsTxt() {
  const lines = [
    `# NeonKit`,
    `> ${siteConfig.description}`,
    `NeonKit is a shadcn-compatible registry of ${registry.length} React components with neon glow effects, for dark interfaces. Components are copied into the user's project (not imported from a package). Notes for agents:`,
    [
      `- Install: \`npx shadcn@latest add ${siteConfig.url}/r/<name>.json\`, or \`npx shadcn@latest add @neonkit/<name>\` after adding \`"@neonkit": "${siteConfig.url}/r/{name}.json"\` to \`registries\` in components.json.`,
      `- Files land in \`components/ui/<name>.tsx\` and import \`cn\` from \`@/lib/utils\` and \`neonVars\` from \`@/lib/neon\`.`,
      `- Color: pass \`color\` (a palette name like "cyan" or "magenta", or any hex). Omit it to inherit \`--neon-accent\` from an ancestor, set with \`style={neonVars("lime")}\` or in CSS. Default is cyan.`,
      `- Works with Tailwind CSS 3.4 and 4 and React 18 and 19. Dark backgrounds only (around #05060a).`,
      `- Each component page below has a markdown version with install, usage, examples, props and full source.`,
    ].join("\n"),
    `## Docs`,
    [
      `- [Introduction](${siteConfig.url}/docs): what NeonKit is and how it works`,
      `- [Installation](${siteConfig.url}/docs/installation): shadcn CLI, namespaced registry, manual setup`,
      `- [Theming](${siteConfig.url}/docs/theming): the --neon variable, palette and custom colors`,
      `- [Use with AI](${siteConfig.url}/docs/ai): MCP, Cursor, Copilot, v0 and prompts`,
    ].join("\n"),
    ...categories.flatMap((category) => [
      `## ${category}`,
      registry
        .filter((item) => item.category === category)
        .map((item) => `- [${item.name}](${pageUrl(item.slug)}.md): ${item.description}`)
        .join("\n"),
    ]),
    ...(blocks.length
      ? [
          `## Blocks`,
          [
            `Whole sections built from NeonKit components. Gallery: ${siteConfig.url}/blocks`,
            ...blocks.map(
              (block) => `- [${block.name}](${registryUrl(block.slug)}): ${block.description} Install: \`npx shadcn@latest add ${registryUrl(block.slug)}\``,
            ),
          ].join("\n"),
        ]
      : []),
    `## Optional`,
    [
      `- [Full documentation](${siteConfig.url}/llms-full.txt): every guide and component, including source, in one file`,
      `- [Registry index](${siteConfig.url}/r/registry.json): machine-readable list of registry items`,
      `- [GitHub](${siteConfig.github}): source, issues and component requests`,
    ].join("\n"),
  ];
  return lines.join("\n\n") + "\n";
}

export async function llmsFullTxt() {
  const components = await Promise.all(registry.map((item) => componentMarkdown(item.slug)));
  const neon = await readSource("src/lib/neon.ts");
  const utils = await readSource("src/lib/utils.ts");
  return [
    `# NeonKit`,
    `> ${siteConfig.description}`,
    guides.installation,
    `### lib/utils.ts\n\n${fence(utils, "ts")}`,
    `### lib/neon.ts\n\n${fence(neon, "ts")}`,
    guides.theming,
    guides.conventions,
    ...components.map((md) => (md ?? "").replace(/^# /m, "# Component: ")),
  ].join("\n\n---\n\n");
}
