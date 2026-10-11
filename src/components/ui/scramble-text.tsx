"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Each character sits in a cell that keeps the width of its final glyph, so
// the random glyphs (drawn by ::after) never push the line around. Unresolved
// cells glow dim neon, the decode head burns bright, and a locked character
// cools from a flash back to the text color.
const css = `
.nk-scramble-text-c[data-s] { color: transparent; }
.nk-scramble-text-c[data-s]::after {
  content: attr(data-g);
  position: absolute; inset: 0;
  text-align: center;
  color: rgb(var(--neon) / 0.6);
}
.nk-scramble-text-c[data-s="h"]::after {
  color: color-mix(in srgb, rgb(var(--neon)) 40%, white);
  text-shadow: 0 0 0.1em rgb(var(--neon)), 0 0 0.35em rgb(var(--neon) / 0.7);
}
.nk-scramble-text-c[data-s="l"] { color: inherit; animation: nk-scramble-text-lock 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
.nk-scramble-text-c[data-s="l"]::after { content: none; }
@keyframes nk-scramble-text-lock {
  from { color: color-mix(in srgb, rgb(var(--neon)) 40%, white); text-shadow: 0 0 0.1em rgb(var(--neon)), 0 0 0.4em rgb(var(--neon) / 0.6); }
}
@media (prefers-reduced-motion: reduce) { .nk-scramble-text-c[data-s="l"] { animation: none; } }
`;

const charsets = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  hex: "0123456789ABCDEF",
  binary: "01",
  symbols: "!<>-_\\/[]{}=+*^?#%&@$",
} as const;

type Trigger = "mount" | "hover" | "inView";

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

// Lowercase cells get lowercase glyphs, so proportional faces overlap less.
function pick(glyphs: string, final = "") {
  const glyph = glyphs[Math.floor(Math.random() * glyphs.length)] ?? "";
  return final !== final.toUpperCase() ? glyph.toLowerCase() : glyph;
}

export interface ScrambleTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "children"> {
  /** The text it decodes into. Changing it scrambles into the new text. */
  text: string;
  /** When the decode runs: on mount, on every hover, or when it scrolls into view. */
  trigger?: Trigger;
  /** Milliseconds from the first glyph to the last one locking in. */
  duration?: number;
  /** Glyphs to scramble through: a preset or your own string. */
  charset?: keyof typeof charsets | (string & {});
  /** Element to render. */
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const ScrambleText = React.forwardRef<HTMLElement, ScrambleTextProps>(
  (
    {
      className,
      style,
      color,
      text,
      trigger = "inView",
      duration = 900,
      charset = "upper",
      as: Tag = "span",
      onPointerEnter,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLElement>(null);
    const visualRef = React.useRef<HTMLSpanElement>(null);
    const frameRef = React.useRef(0);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLElement);

    const glyphs = charset in charsets ? charsets[charset as keyof typeof charsets] : charset;

    const cells = React.useCallback(
      () => Array.from(visualRef.current?.querySelectorAll<HTMLElement>("[data-c]") ?? []),
      [],
    );

    const arm = React.useCallback(() => {
      for (const cell of cells()) {
        cell.setAttribute("data-s", "s");
        cell.setAttribute("data-g", pick(glyphs, cell.textContent ?? ""));
      }
    }, [cells, glyphs]);

    const play = React.useCallback(() => {
      cancelAnimationFrame(frameRef.current);
      const list = cells();
      const count = list.length;
      if (count === 0) return;
      const start = performance.now();
      const changed = new Array<number>(count).fill(0);
      const locked = new Array<boolean>(count).fill(false);
      arm();

      const frame = (now: number) => {
        const elapsed = now - start;
        let head = -1;
        for (let i = 0; i < count; i++) {
          if (locked[i]) continue;
          // Left to right: the first glyph locks at 30% of the run, the last at 100%.
          if (elapsed >= duration * (0.3 + (0.7 * (i + 1)) / count)) {
            locked[i] = true;
            list[i].setAttribute("data-s", "l");
            list[i].removeAttribute("data-g");
            continue;
          }
          if (head < 0) head = i;
          if (now - changed[i] > 50 + (i % 3) * 14) {
            changed[i] = now;
            list[i].setAttribute("data-g", pick(glyphs, list[i].textContent ?? ""));
          }
          list[i].setAttribute("data-s", i === head ? "h" : "s");
        }
        if (head >= 0) frameRef.current = requestAnimationFrame(frame);
      };
      frameRef.current = requestAnimationFrame(frame);
    }, [arm, cells, duration, glyphs]);

    const reduced = React.useCallback(
      () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
      [],
    );

    // Arm before paint so the final text doesn't flash ahead of the decode.
    useIsoLayoutEffect(() => {
      const list = cells();
      for (const cell of list) {
        cell.removeAttribute("data-s");
        cell.removeAttribute("data-g");
      }
      if (trigger === "hover" || reduced()) return;
      arm();
      const node = rootRef.current;
      if (trigger === "mount" || !node || typeof IntersectionObserver === "undefined") {
        play();
        return () => cancelAnimationFrame(frameRef.current);
      }
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          play();
        },
        { threshold: 0.4 },
      );
      io.observe(node);
      return () => {
        io.disconnect();
        cancelAnimationFrame(frameRef.current);
      };
    }, [text, trigger, arm, play, cells, reduced]);

    const words = text.split(/(\s+)/);

    return (
      <Tag
        ref={rootRef as React.Ref<HTMLHeadingElement>}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", className)}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (trigger === "hover" && !reduced()) play();
        }}
        {...props}
      >
        <style>{css}</style>
        <span className="sr-only">{text}</span>
        <span ref={visualRef} aria-hidden>
          {words.map((word, w) =>
            /^\s+$/.test(word) ? (
              word
            ) : word ? (
              <span key={w} className="inline-block whitespace-nowrap">
                {Array.from(word).map((char, c) => (
                  <span key={c} data-c="" className="nk-scramble-text-c relative inline-block">
                    {char}
                  </span>
                ))}
              </span>
            ) : null,
          )}
        </span>
      </Tag>
    );
  },
);
ScrambleText.displayName = "ScrambleText";

export { ScrambleText };
