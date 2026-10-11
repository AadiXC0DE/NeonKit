"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Geometry in viewBox units. A digit is 56 × 100 with 11-unit segments;
// the pointed (mitred) ends leave a hairline seam where segments meet.
const DW = 56;
const DH = 100;
const T = 11;
const SEAM = 1.6;
const DP = 15; // room after each digit for its decimal point
const COLON = 22;
const PITCH = 10; // space between characters

const h = T / 2;

function horizontal(y: number) {
  const x1 = h + SEAM;
  const x2 = DW - h - SEAM;
  return `${x1},${y} ${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h}`;
}

function vertical(x: number, y1: number, y2: number) {
  return `${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h} ${x - h},${y1 + h}`;
}

const mid = DH / 2;
const segments = [
  horizontal(h), // a
  vertical(DW - h, h + SEAM, mid - SEAM), // b
  vertical(DW - h, mid + SEAM, DH - h - SEAM), // c
  horizontal(DH - h), // d
  vertical(h, mid + SEAM, DH - h - SEAM), // e
  vertical(h, h + SEAM, mid - SEAM), // f
  horizontal(mid), // g
];

// Bit order: a b c d e f g.
const glyphs: Record<string, string> = {
  "0": "1111110",
  "1": "0110000",
  "2": "1101101",
  "3": "1111001",
  "4": "0110011",
  "5": "1011011",
  "6": "1011111",
  "7": "1110000",
  "8": "1111111",
  "9": "1111011",
  A: "1110111",
  B: "0011111",
  C: "1001110",
  D: "0111101",
  E: "1001111",
  F: "1000111",
  G: "1011110",
  H: "0110111",
  I: "0110000",
  J: "0111100",
  L: "0001110",
  N: "0010101",
  O: "1111110",
  P: "1100111",
  R: "0000101",
  S: "1011011",
  T: "0001111",
  U: "0111110",
  Y: "0111011",
  "-": "0000001",
  _: "0001000",
  " ": "0000000",
};
// Lowercase forms that read differently on seven segments.
const lower: Record<string, string> = { h: "0010111", o: "0011101", u: "0011100", c: "0001101" };

function maskFor(char: string) {
  return (lower[char] ?? glyphs[char.toUpperCase()] ?? glyphs[" "]).split("").map((bit) => bit === "1");
}

type Token = { kind: "digit"; mask: boolean[]; dot: boolean } | { kind: "colon" };

function tokenize(text: string, digits: number) {
  const tokens: Token[] = [];
  for (const char of Array.from(text)) {
    const previous = tokens[tokens.length - 1];
    if (char === "." || char === ",") {
      // The point belongs to the digit before it, like on real hardware.
      if (previous?.kind === "digit" && !previous.dot) previous.dot = true;
      else tokens.push({ kind: "digit", mask: maskFor(" "), dot: true });
    } else if (char === ":") {
      tokens.push({ kind: "colon" });
    } else {
      tokens.push({ kind: "digit", mask: maskFor(char), dot: false });
    }
  }
  const count = tokens.filter((token) => token.kind === "digit").length;
  const pad: Token[] = Array.from({ length: Math.max(0, digits - count) }, () => ({
    kind: "digit",
    mask: maskFor(" "),
    dot: false,
  }));
  return [...pad, ...tokens];
}

// Digit height lives in one variable, so `lg:[--segment-h:96px]` resizes a display.
const H = "var(--segment-h,48px)";
const sizes = { sm: "[--segment-h:32px]", md: "[--segment-h:48px]", lg: "[--segment-h:72px]" } as const;

const css = `
@keyframes nk-seven-segment-blink { 0%, 49.9% { opacity: 1; } 50%, 100% { opacity: 0; } }
.nk-seven-segment-blink { animation: nk-seven-segment-blink 1s steps(1, end) infinite; }
.nk-seven-segment-lit [data-on] { transition: opacity 50ms linear; }
.nk-seven-segment-lit [data-off] { transition: opacity 160ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .nk-seven-segment-blink { animation: none; }
  .nk-seven-segment-lit [data-on], .nk-seven-segment-lit [data-off] { transition: none; }
}
`;

export interface SevenSegmentProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  /** What to show: 0–9, A–F (plus H J L P U n o r t u y), minus, colon, dot and space. */
  value: string | number;
  /** Pads on the left with unlit digits up to this count. Colons and dots don't count. */
  digits?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Digit height: 32, 48 or 72px, or any pixel value. Also settable with a `--segment-h` class. */
  size?: keyof typeof sizes | number;
  /** Forward lean in degrees. */
  skew?: number;
  /** Opacity of unlit segments, 0 to 1. */
  unlit?: number;
  /** Blink colons once a second, like a clock. */
  colonBlink?: boolean;
}

const SevenSegment = React.forwardRef<HTMLSpanElement, SevenSegmentProps>(
  (
    {
      className,
      style,
      value,
      digits = 0,
      color,
      size = "md",
      skew = 8,
      unlit = 0.08,
      colonBlink = false,
      ...props
    },
    ref,
  ) => {
    const text = String(value);
    const tokens = tokenize(text, digits);
    const lean = Math.tan((skew * Math.PI) / 180) * DH;
    // Decimal-point slots only appear when the value has a point, so clocks stay tight.
    const hasPoints = /[.,]/.test(text);
    const advance = DW + (hasPoints ? DP : 0);

    let x = 0;
    const placed = tokens.map((token) => {
      const at = x;
      x += (token.kind === "colon" ? COLON : advance) + PITCH;
      return { token, at };
    });
    const width = Math.max(x - PITCH + Math.abs(lean), 1);
    const viewBox = `0 0 ${width} ${DH}`;
    const transform = `translate(${Math.max(0, lean)} 0) skewX(${-skew})`;
    const box = { width: `calc(${H} * ${(width / DH).toFixed(4)})`, height: H };

    const shapes = (lit: boolean) =>
      placed.map(({ token, at }, index) => {
        if (token.kind === "colon") {
          return (
            <g
              key={index}
              data-colon=""
              className={lit && colonBlink ? "nk-seven-segment-blink" : undefined}
              transform={`translate(${at + COLON / 2} 0)`}
            >
              <rect x={-h} y={DH * 0.3 - h} width={T} height={T} rx={1.5} />
              <rect x={-h} y={DH * 0.7 - h} width={T} height={T} rx={1.5} />
            </g>
          );
        }
        return (
          <g key={index} data-digit="" transform={`translate(${at} 0)`}>
            {segments.map((shape, s) => (
              <polygon
                key={s}
                points={shape}
                data-on={lit && token.mask[s] ? "" : undefined}
                data-off={lit && !token.mask[s] ? "" : undefined}
                opacity={lit ? (token.mask[s] ? 1 : 0) : undefined}
              />
            ))}
            {hasPoints && (
              <circle
                cx={DW + DP / 2}
                cy={DH - h}
                r={h * 0.95}
                data-on={lit && token.dot ? "" : undefined}
                data-off={lit && !token.dot ? "" : undefined}
                opacity={lit ? (token.dot ? 1 : 0) : undefined}
              />
            )}
          </g>
        );
      });

    const glow = `drop-shadow(0 0 calc(${H} * 0.03) rgb(var(--neon))) drop-shadow(0 0 calc(${H} * 0.14) rgb(var(--neon) / 0.55))`;

    return (
      <span
        ref={ref}
        role="img"
        aria-label={text}
        style={neonVars(
          color,
          typeof size === "number" ? ({ "--segment-h": `${size}px`, ...style } as React.CSSProperties) : style,
        )}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-block shrink-0 align-middle",
          typeof size === "string" && sizes[size],
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <svg
          aria-hidden
          viewBox={viewBox}
          className="block overflow-visible"
          style={{ ...box, fill: `rgb(var(--neon) / ${unlit})` }}
        >
          <g transform={transform}>{shapes(false)}</g>
        </svg>
        <svg
          aria-hidden
          viewBox={viewBox}
          className="nk-seven-segment-lit absolute inset-0 block overflow-visible"
          style={{ ...box, fill: "color-mix(in srgb, rgb(var(--neon)) 72%, white)", filter: glow }}
        >
          <g transform={transform}>{shapes(true)}</g>
        </svg>
      </span>
    );
  },
);
SevenSegment.displayName = "SevenSegment";

export { SevenSegment };
