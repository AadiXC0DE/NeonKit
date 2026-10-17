"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// A classic 5×7 font, one hex byte per column (bit 0 is the top row).
// Blank side columns are trimmed, so narrow glyphs like "I" and "." take less room.
const font: Record<string, string> = {
  A: "7e1111117e", B: "7f49494936", C: "3e41414122", D: "7f4141221c", E: "7f49494941",
  F: "7f09090101", G: "3e4149497a", H: "7f0808087f", I: "00417f4100", J: "2040413f01",
  K: "7f08142241", L: "7f40404040", M: "7f020c027f", N: "7f0408107f", O: "3e4141413e",
  P: "7f09090906", Q: "3e4151215e", R: "7f09192946", S: "4649494931", T: "01017f0101",
  U: "3f4040403f", V: "1f2040201f", W: "3f4038403f", X: "6314081463", Y: "0708700807",
  Z: "6151494543",
  "0": "3e5149453e", "1": "00427f4000", "2": "4261514946", "3": "2141454b31", "4": "1814127f10",
  "5": "2745454539", "6": "3c4a494930", "7": "0171090503", "8": "3649494936", "9": "064949291e",
  "!": "00005f0000", '"': "0007000700", "#": "147f147f14", $: "242a7f2a12", "%": "2313086462",
  "&": "3649552250", "'": "0005030000", "(": "001c224100", ")": "0041221c00", "*": "14083e0814",
  "+": "08083e0808", ",": "0050300000", "-": "0808080808", ".": "0060600000", "/": "2010080402",
  ":": "0036360000", ";": "0056360000", "<": "0814224100", "=": "1414141414", ">": "0041221408",
  "?": "0201510906", "@": "324979413e", "[": "007f414100", "]": "0041417f00", _: "4040404040",
  "·": "0018180000", "°": "0006090600", "→": "08082a1c08", "←": "081c2a0808",
  "▲": "10181c1810", "▼": "040c1c0c04",
};

const glyphCache = new Map<string, number[]>();

function glyph(char: string) {
  const key = font[char] ? char : char.toUpperCase();
  const cached = glyphCache.get(key);
  if (cached) return cached;
  const hex = font[key];
  let columns = hex ? (hex.match(/../g) ?? []).map((byte) => parseInt(byte, 16)) : [0, 0, 0];
  if (hex) {
    while (columns.length > 1 && columns[0] === 0) columns = columns.slice(1);
    while (columns.length > 1 && columns[columns.length - 1] === 0) columns = columns.slice(0, -1);
  }
  glyphCache.set(key, columns);
  return columns;
}

/** Lays text out as one 7-bit column per entry, one blank column between glyphs. */
function rasterize(text: string) {
  const columns: number[] = [];
  Array.from(text).forEach((char, index) => {
    if (index > 0) columns.push(0);
    columns.push(...glyph(char));
  });
  return columns;
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The theme's glow multiplier. A finite check, not `|| 1`, so 0 stays 0. */
function readGlow(node: Element) {
  const value = parseFloat(getComputedStyle(node).getPropertyValue("--neon-glow"));
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/\d+(\.\d+)?/g);
  if (!match || match.length < 3) return [34, 211, 238];
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

export interface LedMatrixProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** The message. A–Z, 0–9 and common punctuation; lowercase is shown as uppercase. */
  text: string;
  /** Dot rows. The 7-row font is centered vertically in taller displays. */
  rows?: number;
  /** Fixed width in dots. Leave unset to fill the parent's width. */
  columns?: number;
  /** Dot diameter in pixels. */
  dotSize?: number;
  /** Space between dots in pixels. */
  gap?: number;
  /** Scroll speed in pixels per second. 0 holds the text still, centered. */
  speed?: number;
  /** Which way the text travels. */
  direction?: "left" | "right";
  /**
   * With `speed` 0, text too wide for the display scrolls at this speed instead of being cut off.
   * 0 clips it.
   */
  overflowSpeed?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const LedMatrix = React.forwardRef<HTMLDivElement, LedMatrixProps>(
  (
    {
      className,
      style,
      text,
      rows = 7,
      columns: fixedColumns,
      dotSize = 6,
      gap = 2,
      speed = 60,
      direction = "left",
      overflowSpeed = 40,
      color,
      ...props
    },
    ref,
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const probeRef = React.useRef<HTMLSpanElement>(null);
    const bitmap = React.useMemo(() => rasterize(text), [text]);
    const pitch = dotSize + gap;
    const height = rows * pitch - gap;

    React.useEffect(() => {
      const canvas = canvasRef.current;
      const probe = probeRef.current;
      const box = canvas?.parentElement;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !probe || !box || !ctx) return;

      let width = 0;
      let cols = 0;
      let dpr = 1;
      let rgb = parseRgb(getComputedStyle(probe).color);
      let glow = readGlow(probe);
      let unlit: HTMLCanvasElement | null = null;
      let offset = 0;
      let drawnShift = Number.NaN;
      let raf = 0;
      let last = 0;
      let onscreen = true;
      let reduce = prefersReducedMotion();
      const top = Math.max(0, Math.floor((rows - 7) / 2));
      const radius = dotSize / 2;

      const center = (index: number) => index * pitch + radius;
      // A held message that doesn't fit runs like a ticker rather than losing its end.
      const pace = () => (speed > 0 ? speed : bitmap.length > cols ? Math.max(0, overflowSpeed) : 0);

      // Unlit dots never change between frames, so they're painted once and stamped.
      const paintUnlit = () => {
        unlit = null;
        // A hidden display (display: none) measures zero, and a zero-size canvas can't be stamped.
        if (!canvas.width || !canvas.height) return;
        unlit = document.createElement("canvas");
        unlit.width = canvas.width;
        unlit.height = canvas.height;
        const g = unlit.getContext("2d");
        if (!g) return;
        g.scale(dpr, dpr);
        g.fillStyle = `rgba(${rgb.join(", ")}, 0.13)`;
        g.beginPath();
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            g.moveTo(center(c) + radius, center(r));
            g.arc(center(c), center(r), radius, 0, Math.PI * 2);
          }
        }
        g.fill();
        // Big enough dots show the lens: a pin of reflected room light on each one.
        if (dotSize >= 4) {
          g.fillStyle = "rgba(255, 255, 255, 0.07)";
          g.beginPath();
          const r2 = radius * 0.32;
          for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
              const x = center(c) - radius * 0.32;
              const y = center(r) - radius * 0.32;
              g.moveTo(x + r2, y);
              g.arc(x, y, r2, 0, Math.PI * 2);
            }
          }
          g.fill();
        }
      };

      const startColumn = (shift: number) => {
        const length = bitmap.length;
        if (pace() === 0 || reduce) return length <= cols ? Math.floor((cols - length) / 2) : 0;
        const span = length + cols;
        const travelled = ((shift % span) + span) % span;
        return direction === "left" ? cols - travelled : travelled - length;
      };

      const draw = (force = false) => {
        const shift = Math.floor(offset);
        if (!force && shift === drawnShift) return;
        drawnShift = shift;
        if (!canvas.width || !canvas.height) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (unlit) ctx.drawImage(unlit, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const start = startColumn(shift);
        const halo = new Path2D();
        const core = new Path2D();
        for (let c = 0; c < cols; c++) {
          const bits = bitmap[c - start];
          if (!bits) continue;
          for (let r = 0; r < rows; r++) {
            const row = r - top;
            if (row < 0 || row > 6 || !((bits >> row) & 1)) continue;
            halo.moveTo(center(c) + radius, center(r));
            halo.arc(center(c), center(r), radius, 0, Math.PI * 2);
            core.moveTo(center(c) + radius * 0.5, center(r));
            core.arc(center(c), center(r), radius * 0.5, 0, Math.PI * 2);
          }
        }
        const [r, g, b] = rgb;
        // shadowBlur ignores the transform, so it's scaled by hand.
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${Math.min(1, glow)})`;
        ctx.shadowBlur = glow > 0 ? Math.max(4, dotSize * 2.2) * dpr : 0;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill(halo);
        // The second pass only stacks the halo; above 1 a third makes it run hot.
        if (glow > 0) ctx.fill(halo);
        if (glow > 1) ctx.fill(halo);
        ctx.shadowBlur = 0;
        const mix = (channel: number) => Math.round(channel * 0.45 + 255 * 0.55);
        ctx.fillStyle = `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
        ctx.fill(core);
      };

      const resize = (measured: number) => {
        width = fixedColumns ? fixedColumns * pitch - gap : measured;
        cols = Math.max(1, Math.floor((width + gap) / pitch));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        paintUnlit();
        draw(true);
      };

      const frame = (now: number) => {
        offset += (Math.min(now - last, 100) / 1000) * (pace() / pitch);
        last = now;
        draw();
        raf = requestAnimationFrame(frame);
      };

      const sync = () => {
        const moving = pace() > 0 && !reduce && onscreen && document.visibilityState === "visible";
        if (moving && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!moving && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        if (!moving) draw(true);
      };

      // A CSS variable can't reach into a canvas. The probe's color and letter-spacing
      // transition whenever --neon or --neon-glow changes, and we re-read them.
      const recolor = () => {
        rgb = parseRgb(getComputedStyle(probe).color);
        glow = readGlow(probe);
        paintUnlit();
        draw(true);
      };

      const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      const onMotion = () => {
        reduce = prefersReducedMotion();
        sync();
      };

      resize(box.clientWidth);
      sync();

      // Dragging the window to a screen with another pixel ratio needs a fresh backing store.
      let dprQuery: MediaQueryList | undefined;
      const onDpr = () => {
        resize(box.clientWidth);
        watchDpr();
      };
      const watchDpr = () => {
        dprQuery?.removeEventListener?.("change", onDpr);
        dprQuery = window.matchMedia?.(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
        dprQuery?.addEventListener?.("change", onDpr);
      };
      watchDpr();

      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(([entry]) => {
              resize(entry.contentRect.width);
              sync();
            });
      resizeObserver?.observe(box);
      const intersectionObserver =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              onscreen = entry.isIntersecting;
              sync();
            });
      intersectionObserver?.observe(canvas);
      document.addEventListener("visibilitychange", sync);
      motion?.addEventListener?.("change", onMotion);
      probe.addEventListener("transitionend", recolor);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion?.removeEventListener?.("change", onMotion);
        dprQuery?.removeEventListener?.("change", onDpr);
        probe.removeEventListener("transitionend", recolor);
      };
    }, [bitmap, rows, fixedColumns, dotSize, gap, pitch, height, speed, direction, overflowSpeed, color]);

    return (
      <div
        ref={ref}
        role="img"
        aria-label={text}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative overflow-hidden rounded-lg border border-white/10 bg-[#030304] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_24px_rgb(0_0_0/0.8)]",
          fixedColumns ? "inline-block max-w-full" : "block w-full",
          className,
        )}
        {...props}
      >
        <span
          ref={probeRef}
          aria-hidden
          className="pointer-events-none absolute size-0 overflow-hidden"
          style={{
            color: "rgb(var(--neon))",
            letterSpacing: "calc(var(--neon-glow, 1) * 1px)",
            transition: "color 1ms, letter-spacing 1ms",
          }}
        />
        <div className="relative" style={{ height }}>
          <canvas ref={canvasRef} aria-hidden className="block" style={{ height }} />
        </div>
      </div>
    );
  },
);
LedMatrix.displayName = "LedMatrix";

export { LedMatrix };
