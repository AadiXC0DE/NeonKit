import { neonColorNames, neonColors } from "@/lib/neon";

/** One palette entry: a name the `color` prop accepts and its `r g b` channels. */
export type Tube = { name: string; rgb: string };
export type Motion = "full" | "reduced" | "off";

export type Theme = {
  palette: Tube[];
  /** Name of the palette entry used as `--neon-accent`. */
  accent: string;
  /** Glow intensity in percent, 0–150. Written as `--neon-glow: glow / 100`. */
  glow: number;
  /** Radius scale in percent, 0–200. */
  radius: number;
  /** Surface tint, −100 (pure black) … 0 (stock blue-black) … 100 (purple-black). */
  tint: number;
  motion: Motion;
};

export const MAX_TUBES = 16;
export const GLOW = { min: 0, max: 150 } as const;
export const RADIUS = { min: 0, max: 200 } as const;
export const TINT = { min: -100, max: 100 } as const;

export const stockPalette: Tube[] = neonColorNames.map((name) => ({ name, rgb: neonColors[name] }));

export const stockTheme: Theme = {
  palette: stockPalette,
  accent: "cyan",
  glow: 100,
  radius: 100,
  tint: 0,
  motion: "full",
};

// ── Colors ────────────────────────────────────────────────────────────────

export const rgbToHex = (rgb: string) =>
  "#" +
  rgb
    .split(" ")
    .map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))).toString(16).padStart(2, "0"))
    .join("");

export function hexToRgb(hex: string): string | null {
  let h = hex.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(h)) h = h.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/.test(h)) return null;
  const v = parseInt(h, 16);
  return `${(v >> 16) & 255} ${(v >> 8) & 255} ${v & 255}`;
}

function luminance(rgb: string) {
  const [r, g, b] = rgb.split(" ").map((n) => {
    const c = Number(n) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Solid buttons and badges put `#05060a` text on the color. */
export const solidTextContrast = (rgb: string) => contrast(rgb, "5 6 10");

// ── Derived values ────────────────────────────────────────────────────────

const mix = (a: number[], b: number[], t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const BLACK = [0, 0, 0];
const BLUE_BLACK = [5, 6, 10]; // the stock page, #05060a
const PURPLE_BLACK = [10, 6, 17];

/** The page color for a tint, as `r g b`. */
export function surfaceRgb(tint: number) {
  const t = Math.max(-100, Math.min(100, tint)) / 100;
  const c = t < 0 ? mix(BLUE_BLACK, BLACK, -t) : mix(BLUE_BLACK, PURPLE_BLACK, t);
  return c.join(" ");
}

/** Tailwind 4's default radius scale, in rem. */
export const radiusScale = {
  xs: 0.125,
  sm: 0.25,
  md: 0.375,
  lg: 0.5,
  xl: 0.75,
  "2xl": 1,
  "3xl": 1.5,
  "4xl": 2,
} as const;

const rem = (n: number) => `${Number(n.toFixed(4))}rem`;

/** `--radius-*` values for a scale, in rem. */
export function radiusVars(radius: number) {
  const k = radius / 100;
  return Object.fromEntries(Object.entries(radiusScale).map(([key, value]) => [`--radius-${key}`, rem(value * k)]));
}

export const accentOf = (theme: Theme) => theme.palette.find((t) => t.name === theme.accent) ?? theme.palette[0];

// ── Names ─────────────────────────────────────────────────────────────────

/** Palette names become object keys and `color` values: lowercase letters, digits and dashes. */
export function cleanName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^[^a-z]+/, "")
    .replace(/-+/g, "-")
    .replace(/-$/, "")
    .slice(0, 16);
}

export function uniqueName(base: string, taken: string[]) {
  const clean = cleanName(base) || "tube";
  if (!taken.includes(clean)) return clean;
  for (let i = 2; ; i++) if (!taken.includes(`${clean}-${i}`)) return `${clean}-${i}`;
}

// ── URL state ─────────────────────────────────────────────────────────────

const samePalette = (a: Tube[], b: Tube[]) =>
  a.length === b.length && a.every((t, i) => t.name === b[i].name && t.rgb === b[i].rgb);

const clampInt = (v: string | null, min: number, max: number, fallback: number) => {
  if (v === null || v.trim() === "") return fallback;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

/** Only what differs from stock goes in the query string. */
export function encodeTheme(theme: Theme) {
  const params = new URLSearchParams();
  if (!samePalette(theme.palette, stockPalette)) {
    params.set("p", theme.palette.map((t) => `${t.name}.${rgbToHex(t.rgb).slice(1)}`).join("~"));
  }
  if (theme.accent !== stockTheme.accent) params.set("a", theme.accent);
  if (theme.glow !== stockTheme.glow) params.set("g", String(theme.glow));
  if (theme.radius !== stockTheme.radius) params.set("r", String(theme.radius));
  if (theme.tint !== stockTheme.tint) params.set("t", String(theme.tint));
  if (theme.motion !== stockTheme.motion) params.set("m", theme.motion);
  // URLSearchParams escapes "~"; it's unreserved, so keep links readable.
  return params.toString().replace(/%7E/gi, "~");
}

type Query = { get(key: string): string | null };

export function toQuery(input: string | Query | Record<string, string | string[] | undefined>): Query {
  if (typeof input === "string") return new URLSearchParams(input);
  if (typeof (input as Query).get === "function") return input as Query;
  const record = input as Record<string, string | string[] | undefined>;
  return { get: (key) => [record[key]].flat()[0] ?? null };
}

/** Reads a theme back from a query string, ignoring anything malformed. */
export function decodeTheme(input: string | Query | Record<string, string | string[] | undefined>): Theme {
  const q = toQuery(input);
  let palette = stockPalette;
  const p = q.get("p");
  if (p) {
    const parsed: Tube[] = [];
    for (const entry of p.split("~").slice(0, MAX_TUBES)) {
      const [rawName, hex] = entry.split(".");
      const rgb = hex ? hexToRgb(hex) : null;
      const name = cleanName(rawName ?? "");
      if (!rgb || !name || parsed.some((t) => t.name === name)) continue;
      parsed.push({ name, rgb });
    }
    if (parsed.length) palette = parsed;
  }
  const a = q.get("a");
  const accent = a && palette.some((t) => t.name === a) ? a : palette.some((t) => t.name === stockTheme.accent) ? stockTheme.accent : palette[0].name;
  const m = q.get("m");
  return {
    palette,
    accent,
    glow: clampInt(q.get("g"), GLOW.min, GLOW.max, stockTheme.glow),
    radius: clampInt(q.get("r"), RADIUS.min, RADIUS.max, stockTheme.radius),
    tint: clampInt(q.get("t"), TINT.min, TINT.max, stockTheme.tint),
    motion: m === "reduced" || m === "off" ? m : "full",
  };
}

export const isStock = (theme: Theme) => encodeTheme(theme) === "";
