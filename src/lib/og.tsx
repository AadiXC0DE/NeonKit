import { registry } from "@/registry";

/*
 * Shared pieces for the Open Graph cards. They're rendered at build time by next/og (Satori), which needs
 * TTF/OTF data rather than the woff2 the site serves, so each font is fetched from Google Fonts as a subset
 * of just the characters on the card. If the network isn't there the card still renders in the fallback face.
 */

type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 700; style: "normal" };

async function googleFont(family: string, text: string, weight?: number) {
  const axis = weight ? `:wght@${weight}` : "";
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}${axis}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`No TTF for ${family}`);
  return (await fetch(src)).arrayBuffer();
}

/** Loads the faces a card uses. Pass every string that appears on it. */
export async function ogFonts(texts: { sign?: string; sans?: string; mono?: string }) {
  const jobs: Promise<Font | null>[] = [];
  const load = (name: string, family: string, text: string | undefined, weight: Font["weight"]) => {
    if (!text) return;
    jobs.push(
      googleFont(family, text, weight === 400 ? undefined : weight)
        .then((data) => ({ name, data, weight, style: "normal" as const }))
        .catch(() => null),
    );
  };
  load("Tilt Neon", "Tilt Neon", texts.sign, 400);
  load("Mona Sans", "Mona Sans", texts.sans, 400);
  load("Mona Sans", "Mona Sans", texts.sans, 600);
  load("Fragment Mono", "Fragment Mono", texts.mono, 400);
  return (await Promise.all(jobs)).filter((font): font is Font => font !== null);
}

export const og = {
  size: { width: 1200, height: 630 },
  page: "#05060a",
  fg: "#e8edf5",
  muted: "#8a93a6",
  cyan: "34 211 238",
};

/** "139 components, 60 blocks, 5 templates and 412 icons" — kept in one place so every card agrees. */
export function inventory(blocks: number, templates: number, icons: number) {
  return `${registry.length} components, ${blocks} blocks, ${templates} templates and ${icons} icons`;
}

/** The NeonKit mark, lit: a tube frame and an N, with a white core over the colored glass. */
export function Mark({ size = 40, color = og.cyan }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="3" width="26" height="26" rx="4.5" stroke={`rgb(${color})`} strokeWidth="2.6" />
      <path d="M11 22V10l10 12V10" stroke={`rgb(${color})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="3" width="26" height="26" rx="4.5" stroke="white" strokeOpacity="0.85" strokeWidth="0.9" />
      <path
        d="M11 22V10l10 12V10"
        stroke="white"
        strokeOpacity="0.85"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A screw head for the sign's backplate. */
export function Screw({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 14,
        height: 14,
        borderRadius: 7,
        background: "radial-gradient(circle at 32% 30%, #4a505d, #12141b 70%)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.6)",
        ...style,
      }}
    />
  );
}
