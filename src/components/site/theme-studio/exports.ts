import { siteConfig } from "@/config/site";
import {
  accentOf,
  encodeTheme,
  radiusScale,
  radiusVars,
  rgbToHex,
  stockPalette,
  surfaceRgb,
  type Theme,
  type Tube,
} from "./state";

const IDENT = /^[a-z_$][a-z0-9_$]*$/i;
const key = (name: string) => (IDENT.test(name) ? name : JSON.stringify(name));
const access = (name: string) => (IDENT.test(name) ? `neonColors.${name}` : `neonColors[${JSON.stringify(name)}]`);
const glowValue = (theme: Theme) => String(Number((theme.glow / 100).toFixed(2)));
const scaleLabel = (theme: Theme) => `×${(theme.radius / 100).toFixed(2)}`;
const tintLabel = (tint: number) => (tint === 0 ? "stock blue-black" : tint < 0 ? "toward pure black" : "toward purple-black");

export function shareUrl(theme: Theme) {
  const qs = encodeTheme(theme);
  return `${siteConfig.url}/theme${qs ? `?${qs}` : ""}`;
}

export function registryItemUrl(theme: Theme) {
  const qs = encodeTheme(theme);
  return `${siteConfig.url}/r/theme${qs ? `?${qs}` : ""}`;
}

/** Shells read `?` and `&`, so a URL with a query goes in quotes. */
export function installCommand(theme: Theme) {
  const url = registryItemUrl(theme);
  return `npx shadcn@latest add ${url.includes("?") ? `"${url}"` : url}`;
}

const motionRules = {
  reduced: { "animation-duration": "0.01ms !important", "animation-iteration-count": "1 !important" },
  off: {
    "animation-duration": "0.01ms !important",
    "animation-iteration-count": "1 !important",
    "transition-duration": "0s !important",
    "transition-delay": "0s !important",
  },
} as const;

// ── globals.css ───────────────────────────────────────────────────────────

export function globalsCss(theme: Theme) {
  const accent = accentOf(theme);
  const surface = rgbToHex(surfaceRgb(theme.tint));
  const out: string[] = [];
  out.push(`/* NeonKit theme: ${shareUrl(theme)} */`);
  out.push(":root {");
  out.push(`  --neon-accent: ${accent.rgb}; /* ${accent.name}, the default for every component */`);
  out.push(`  --neon-glow: ${glowValue(theme)}; /* glow intensity: 0 is flat, 1 is stock, 1.5 is hot */`);
  out.push("}");
  out.push("");
  out.push("body {");
  out.push(`  background: ${surface}; /* ${tintLabel(theme.tint)} */`);
  out.push("}");
  if (theme.radius !== 100) {
    out.push("");
    out.push(`/* Corner radius ${scaleLabel(theme)} (Tailwind 4). Arbitrary radii like rounded-[14px] keep their size. */`);
    out.push("@theme {");
    for (const [name, value] of Object.entries(radiusVars(theme.radius))) out.push(`  ${name}: ${value};`);
    out.push("}");
  }
  if (theme.motion !== "full") {
    const rules = motionRules[theme.motion];
    out.push("");
    out.push(
      theme.motion === "reduced"
        ? "/* Motion: reduced. Loops and flicker stop; state changes still ease. */"
        : "/* Motion: off. Nothing animates or transitions. */",
    );
    out.push("*,");
    out.push("*::before,");
    out.push("*::after {");
    for (const [prop, value] of Object.entries(rules)) out.push(`  ${prop}: ${value};`);
    out.push("}");
  }
  return out.join("\n") + "\n";
}

// ── lib/neon.ts ───────────────────────────────────────────────────────────

/** The library's `lib/neon.ts`, word for word, with this palette in it. */
export function neonTs(theme: Theme) {
  const accent = accentOf(theme);
  const entries = theme.palette.map((t) => `  ${key(t.name)}: "${t.rgb}",`).join("\n");
  return `import type * as React from "react";

/**
 * The NeonKit palette, stored as space-separated RGB channels so components
 * can apply any alpha with \`rgb(var(--neon) / 0.4)\`.
 */
export const neonColors = {
${entries}
} as const;

export type NeonColorName = keyof typeof neonColors;

/** A palette name or any hex color (\`#0ff\`, \`#ff00aa\`). */
export type NeonColor = NeonColorName | (string & {});

export const neonColorNames = Object.keys(neonColors) as NeonColorName[];

/** Resolves a palette name or hex string to \`"r g b"\` channels. */
export function toNeonRgb(color: NeonColor): string {
  if (color in neonColors) return neonColors[color as NeonColorName];

  let hex = color.trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/i.test(hex)) return ${access(accent.name)};

  const value = parseInt(hex, 16);
  return \`\${(value >> 16) & 255} \${(value >> 8) & 255} \${value & 255}\`;
}

/**
 * Inline style that sets a component's neon color.
 *
 * Components read \`--neon\`. Leave \`color\` undefined and they inherit
 * \`--neon-accent\` from any ancestor, falling back to ${accent.name}.
 */
export function neonVars(
  color?: NeonColor,
  style?: React.CSSProperties,
): React.CSSProperties | undefined {
  if (!color) return style;
  const rgb = toNeonRgb(color);
  return { "--neon": rgb, "--neon-accent": rgb, ...style } as React.CSSProperties;
}
`;
}

// ── tailwind.config (Tailwind 3) ──────────────────────────────────────────

/** Tailwind 3's defaults differ below md; NeonKit never uses `rounded` or `rounded-sm`, but scale them anyway. */
const tw3Scale = { sm: 0.125, DEFAULT: 0.25, md: 0.375, lg: 0.5, xl: 0.75, "2xl": 1, "3xl": 1.5 } as const;

export function tailwind3Radius(theme: Theme) {
  const k = theme.radius / 100;
  return Object.fromEntries(Object.entries(tw3Scale).map(([name, value]) => [name, `${Number((value * k).toFixed(4))}rem`]));
}

export function tailwindConfig(theme: Theme) {
  const lines = Object.entries(tailwind3Radius(theme))
    .map(([name, value]) => `        ${IDENT.test(name) ? name : JSON.stringify(name)}: "${value}",`)
    .join("\n");
  return `// Tailwind 3 only: corner radius ${scaleLabel(theme)}. Tailwind 4 reads the @theme block in globals.css.
// Arbitrary radii like rounded-[14px] keep their size.
export default {
  theme: {
    extend: {
      borderRadius: {
${lines}
      },
    },
  },
};
`;
}

// ── registry:theme ────────────────────────────────────────────────────────

const samePalette = (a: Tube[], b: Tube[]) =>
  a.length === b.length && a.every((t, i) => t.name === b[i].name && t.rgb === b[i].rgb);

type Vars = Record<string, string>;

/** The parts of shadcn's registry-item schema a theme uses. */
export type RegistryThemeItem = {
  $schema: string;
  name: string;
  type: "registry:theme";
  title: string;
  description: string;
  cssVars: { theme?: Vars; light: Vars };
  css: { "@layer base": Record<string, Vars> };
  tailwind?: { config: { theme: { extend: { borderRadius: Vars } } } };
  files?: { path: string; type: "registry:lib"; content: string }[];
};

/** A shadcn `registry:theme` item. `npx shadcn add <url>` merges it into globals.css and writes lib/neon.ts. */
export function registryItem(theme: Theme): RegistryThemeItem {
  const accent = accentOf(theme);
  const surface = rgbToHex(surfaceRgb(theme.tint));
  const radius = theme.radius !== 100;
  const base: Record<string, Vars> = { body: { background: surface } };
  if (theme.motion !== "full") base["*, *::before, *::after"] = { ...motionRules[theme.motion] };

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "neonkit-theme",
    type: "registry:theme",
    title: "NeonKit theme",
    description: `Accent ${accent.name}, glow ${theme.glow}%, corners ${scaleLabel(theme)}, ${theme.palette.length} colors. ${shareUrl(theme)}`,
    cssVars: {
      ...(radius
        ? {
            theme: Object.fromEntries(
              Object.entries(radiusVars(theme.radius)).map(([name, value]) => [name.replace(/^--/, ""), value]),
            ),
          }
        : {}),
      light: { "neon-accent": accent.rgb, "neon-glow": glowValue(theme) },
    },
    css: { "@layer base": base },
    ...(radius ? { tailwind: { config: { theme: { extend: { borderRadius: tailwind3Radius(theme) } } } } } : {}),
    ...(samePalette(theme.palette, stockPalette)
      ? {}
      : { files: [{ path: "lib/neon.ts", type: "registry:lib" as const, content: neonTs(theme) }] }),
  };
}

export const registryJson = (theme: Theme) => JSON.stringify(registryItem(theme), null, 2) + "\n";

/** The keys in Tailwind 4's radius scale, for display. */
export const radiusKeys = Object.keys(radiusScale);
