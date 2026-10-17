// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compile } from "@tailwindcss/node";
import { findHandWorkMisses, findUntokenedGlow, rewriteText, transformSource } from "../scripts/neon-glow-codemod.mjs";

const uiDir = path.resolve(import.meta.dirname, "../src/components/ui");
const uiFiles = fs.readdirSync(uiDir).filter((f) => f.endsWith(".tsx"));
const read = (f: string) => fs.readFileSync(path.join(uiDir, f), "utf8");

describe("neon-glow codemod", () => {
  it("scales blurred neon layers and leaves rings, depth and sheen alone", () => {
    const { text } = rewriteText(
      "shadow-[0_0_0_1px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.45),inset_0_1px_0_rgb(255_255_255/0.45),0_8px_20px_-8px_rgb(0_0_0/0.8)]",
      null,
    );
    expect(text).toBe(
      "shadow-[0_0_0_1px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45),0_8px_20px_-8px_rgb(0_0_0/0.8)]",
    );
  });

  it("handles drop-shadow chains, text-shadow, gradients and variants", () => {
    const { text } = rewriteText(
      "hover:[filter:drop-shadow(0_0_2px_rgb(var(--neon)))_drop-shadow(0_0_8px_rgb(var(--neon)/0.75))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.3),transparent)]",
      null,
    );
    expect(text).toContain("drop-shadow(0_0_2px_rgb(var(--neon)/var(--neon-glow,1)))_drop-shadow(0_0_8px_rgb(var(--neon)/CALC(0.75*var(--neon-glow,1))))");
    expect(text).toContain("[text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]");
    expect(text).toContain("radial-gradient(closest-side,rgb(var(--neon)/CALC(0.3*var(--neon-glow,1))),transparent)");
  });

  it("leaves gradients that end in a color alone: those are fills, like a lit lens", () => {
    const lens = 'const LENS = "radial-gradient(circle at 50% 58%, #fff 0 9%, rgb(var(--neon)) 56%, rgb(0 0 0 / 0.55) 100%)";';
    expect(transformSource(lens).text).toBe(lens);
  });

  it("rewrites CSS in style tags and shadows in style objects, interpolations included", () => {
    const source = [
      "const css = `.a { text-shadow: 0 0 0.4em rgb(var(--neon) / 0.6); filter: brightness(1.2); }`;",
      "const el = <span style={{ boxShadow: on ? `0 0 8px rgb(${rgb}), 0 0 0 1px #000` : \"none\" }} />;",
      "const glow = (u: number) => `drop-shadow(0 0 ${u * 2}px rgb(var(--seg) / 0.8))`;",
    ].join("\n");
    const { text, changed } = transformSource(source);
    expect(changed).toBe(3);
    expect(text).toContain("text-shadow: 0 0 0.4em rgb(var(--neon) / calc(0.6 * var(--neon-glow, 1)));");
    expect(text).toContain("filter: brightness(1.2)");
    expect(text).toContain("`0 0 8px rgb(${rgb} / var(--neon-glow, 1)), 0 0 0 1px #000`");
    expect(text).toContain("drop-shadow(0 0 ${u * 2}px rgb(var(--seg) / calc(0.8 * var(--neon-glow, 1))))");
  });

  it("is idempotent and finds nothing left after a run", () => {
    const source = 'const a = "shadow-[0_0_24px_rgb(var(--neon)/0.5)] [text-shadow:0_0_12px_#fff]";';
    const once = transformSource(source).text;
    expect(transformSource(once).text).toBe(once);
    expect(findUntokenedGlow(source)).toHaveLength(1);
    expect(findUntokenedGlow(once)).toHaveLength(0);
  });

  // Tailwind 3 respaces everything after a lowercase calc( in an arbitrary value
  // (`drop-shadow` → `drop - shadow`), so Tailwind output must use CALC(.
  it("never writes a lowercase calc into a Tailwind class", () => {
    const { text } = rewriteText("[filter:drop-shadow(0_0_3px_rgb(var(--neon)/0.9))_drop-shadow(0_0_10px_rgb(var(--neon)/0.45))]", null);
    expect(text).not.toMatch(/calc\(/);
  });

  it("compiles on Tailwind 4 to a glow that reads the token", async () => {
    const classes = [
      rewriteText("shadow-[0_0_14px_-2px_rgb(var(--neon)/0.35),0_8px_20px_-8px_rgb(0_0_0/0.8)]", null).text,
      rewriteText("[filter:drop-shadow(0_0_1.5px_rgb(var(--neon)))_drop-shadow(0_0_7px_rgb(var(--neon)/0.55))]", null).text,
    ];
    const compiler = await compile('@import "tailwindcss/utilities" layer(utilities);', {
      base: process.cwd(),
      onDependency() {},
    });
    const css = compiler.build(classes);
    expect(css).toContain("--tw-shadow: 0 0 14px -2px var(--tw-shadow-color, rgb(var(--neon)/CALC(0.35*var(--neon-glow,1))))");
    expect(css).toContain(
      "filter: drop-shadow(0 0 1.5px rgb(var(--neon)/var(--neon-glow,1))) drop-shadow(0 0 7px rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))));",
    );
  });
});

describe("hand-work detector", () => {
  it("flags canvas glow, blurred halos and SVG blur filters that ignore the token", () => {
    const canvas = 'const c = el.getContext("2d"); c.shadowBlur = 8; c.shadowColor = "rgb(0 255 0)";';
    expect(findHandWorkMisses(canvas)).toHaveLength(1);
    const unchecked = canvas + ' const g = parseFloat(getComputedStyle(el).getPropertyValue("--neon-glow")) || 1;';
    expect(findHandWorkMisses(unchecked)[0].text).toMatch(/finite check/);
    const halo = 'const a = <span className="opacity-75 blur-[6px]" />;';
    expect(findHandWorkMisses(halo)).toHaveLength(1);
    expect(findHandWorkMisses('const a = <span className="opacity-75 [filter:blur(6px)_opacity(var(--neon-glow,1))]" />;')).toEqual([]);
    expect(findHandWorkMisses('const a = <div className="backdrop-blur-[6px]" />;')).toEqual([]);
    const svg = 'const a = <svg><filter id={`${uid}-glow`}><feGaussianBlur stdDeviation={2} /></filter><path filter={`url(#${uid}-glow)`} /></svg>;';
    expect(findHandWorkMisses(svg)).toHaveLength(1);
    expect(findHandWorkMisses(svg.replace("<path ", '<path style={{ opacity: "var(--neon-glow, 1)" }} '))).toEqual([]);
  });
});

const canvasFiles = ["cursor-glow", "equalizer", "led-matrix", "light-rays", "oscilloscope", "particles", "rain-glass", "starfield"];

describe.skipIf(!uiFiles.some((f) => read(f).includes("--neon-glow")))("canvas components read --neon-glow", () => {
  it.each(canvasFiles)("%s", (slug) => {
    const source = read(`${slug}.tsx`);
    expect(source).toMatch(/getPropertyValue\(\s*"--neon-glow"\s*\)/);
    expect(source).toMatch(/Number\.isFinite/);
  });
});

// Until the codemod has run on the library this would fail on every file, so it waits
// for the first component that reads the token. From then on, any glow that doesn't fails.
const applied = uiFiles.some((f) => read(f).includes("--neon-glow"));

describe.skipIf(!applied)("every glow in src/components/ui reads --neon-glow", () => {
  it.each(uiFiles)("%s", (file) => {
    const source = read(file);
    expect([...findUntokenedGlow(source, file), ...findHandWorkMisses(source, file)]).toEqual([]);
  });
});
