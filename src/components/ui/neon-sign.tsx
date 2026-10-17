"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The lit tube is a near-white core inside a colored halo. Unlit, it's tinted
// glass with a faint highlight along the top edge. Everything is in em so the
// light scales with the lettering.
const css = `
.nk-neon-sign-glass { color: rgb(var(--neon) / 0.16); text-shadow: 0 -0.014em 0 rgb(255 255 255 / 0.07); }
.nk-neon-sign-tube {
  color: color-mix(in srgb, rgb(var(--neon)) 28%, white);
  text-shadow: 0 0 0.015em rgb(255 255 255 / calc(0.9 * var(--neon-glow, 1))), 0 0 max(2px, 0.05em) rgb(var(--neon) / var(--neon-glow, 1)), 0 0 max(5px, 0.14em) rgb(var(--neon) / var(--neon-glow, 1)), 0 0 0.38em rgb(var(--neon) / calc(0.75 * var(--neon-glow, 1))), 0 0 0.85em rgb(var(--neon) / calc(0.45 * var(--neon-glow, 1)));
}
.nk-neon-sign-art { color: color-mix(in srgb, rgb(var(--neon)) 28%, white); }
.nk-neon-sign-glow { filter: drop-shadow(0 0 max(1.5px, 0.03em) rgb(var(--neon) / var(--neon-glow, 1))) drop-shadow(0 0 max(4px, 0.11em) rgb(var(--neon) / calc(0.9 * var(--neon-glow, 1)))) drop-shadow(0 0 0.34em rgb(var(--neon) / calc(0.55 * var(--neon-glow, 1)))); }
.nk-neon-sign-plate {
  background: linear-gradient(160deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.018) 34%, rgb(255 255 255 / 0.01) 62%, rgb(255 255 255 / 0.035));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.08), inset 0 -1px 0 rgb(0 0 0 / 0.4), 0 0.42em 0.9em -0.28em rgb(0 0 0 / 0.85);
}
.nk-neon-sign-sheen { background: linear-gradient(112deg, transparent 16%, rgb(255 255 255 / 0.04) 22%, transparent 31%, transparent 66%, rgb(255 255 255 / 0.022) 70%, transparent 76%); }
.nk-neon-sign-edge { box-shadow: inset 0 0 0 1px rgb(var(--neon) / 0.3), inset 0 0 0.55em rgb(var(--neon) / calc(0.12 * var(--neon-glow, 1))), 0 0 1.3em -0.3em rgb(var(--neon) / calc(0.4 * var(--neon-glow, 1))); }
.nk-neon-sign-standoff {
  background: radial-gradient(circle, transparent 0 58%, rgb(0 0 0 / 0.4) 64%, transparent 72%), conic-gradient(from 210deg, #b9bec7, #4f5562, #d6dae0, #434955, #9ba1ac, #383d47, #b9bec7);
  box-shadow: 0.02em 0.05em 0.07em rgb(0 0 0 / 0.75), 0 0 0 max(1px, 0.012em) rgb(0 0 0 / 0.55);
}
.nk-neon-sign-l, .nk-neon-sign-f { opacity: 0; transition: opacity 0.14s ease-out; }
.nk-neon-sign-on .nk-neon-sign-l { opacity: 1; animation: var(--nk-a) var(--nk-t, 1s) linear var(--nk-d, 0s) both; }
.nk-neon-sign-on .nk-neon-sign-f { opacity: 1; animation: var(--nk-fa) var(--nk-ft) linear both; }
.nk-neon-sign-on .nk-neon-sign-x { animation: var(--nk-a) var(--nk-t, 1s) linear var(--nk-d, 0s) both, nk-neon-sign-die 9.7s linear calc(var(--nk-d, 0s) + 1.1s) infinite; }
.nk-neon-sign-on .nk-neon-sign-x2 { animation: nk-neon-sign-die2 4.3s linear 2.6s infinite; }
@keyframes nk-neon-sign-a { 0% { opacity: 0 } 10% { opacity: 1 } 18% { opacity: 0.1 } 30% { opacity: 0.9 } 38% { opacity: 0.25 } 55%, 100% { opacity: 1 } }
@keyframes nk-neon-sign-b { 0%, 8% { opacity: 0 } 11% { opacity: 0.75 } 14% { opacity: 0 } 44% { opacity: 0 } 47% { opacity: 1 } 53% { opacity: 0.3 } 60%, 100% { opacity: 1 } }
@keyframes nk-neon-sign-c { 0% { opacity: 0 } 20% { opacity: 0.25 } 24% { opacity: 0 } 50% { opacity: 0.9 } 53% { opacity: 0.15 } 66%, 100% { opacity: 1 } }
@keyframes nk-neon-sign-clean { 0% { opacity: 0 } 30% { opacity: 0.8 } 100% { opacity: 1 } }
@keyframes nk-neon-sign-flood { 0% { opacity: 0 } 12% { opacity: 0.5 } 20% { opacity: 0.15 } 38% { opacity: 0.7 } 48% { opacity: 0.4 } 70%, 100% { opacity: 1 } }
@keyframes nk-neon-sign-die {
  0%, 12% { opacity: 1 } 12.4% { opacity: 0.15 } 13% { opacity: 0.85 } 13.5% { opacity: 0.08 } 14.5% { opacity: 0.6 } 15% { opacity: 0.04 }
  29% { opacity: 0.07 } 29.4% { opacity: 0.45 } 29.9% { opacity: 0.06 } 37% { opacity: 0.08 } 37.3% { opacity: 1 } 38% { opacity: 0.3 } 38.5% { opacity: 1 }
  60% { opacity: 1 } 60.3% { opacity: 0.2 } 60.9% { opacity: 1 } 61.4% { opacity: 0.1 } 62% { opacity: 0.8 } 62.4% { opacity: 0.12 }
  76% { opacity: 0.1 } 76.5% { opacity: 0.9 } 77% { opacity: 0.35 } 77.5%, 100% { opacity: 1 }
}
@keyframes nk-neon-sign-die2 { 0%, 40% { opacity: 1 } 40.6% { opacity: 0.35 } 41.2% { opacity: 1 } 41.8% { opacity: 0.6 } 42.4%, 100% { opacity: 1 } }
@media (prefers-reduced-motion: reduce) {
  .nk-neon-sign-on .nk-neon-sign-l, .nk-neon-sign-on .nk-neon-sign-f, .nk-neon-sign-on .nk-neon-sign-x2 { animation: none; }
  .nk-neon-sign-on .nk-neon-sign-x { animation: none; opacity: 0.1; }
}
`;

const sizes = {
  sm: "text-[28px]",
  md: "text-[clamp(30px,8vw,44px)]",
  lg: "text-[clamp(38px,11vw,64px)]",
  xl: "text-[clamp(46px,14vw,96px)]",
} as const;

// Three ignition patterns, spread over the letters so no two neighbours catch alike.
const patterns = ["nk-neon-sign-a", "nk-neon-sign-b", "nk-neon-sign-c"];

type Flicker = "clean" | "stutter" | "dying";
// A template literal, so the repo's Tailwind 3/4 check doesn't read it as the bare `rounded` utility.
type Frame = "none" | `rounded` | "pill";

export type NeonSignLine =
  | string
  | {
      text: string;
      /** Tube color for this line. Defaults to the sign's color. */
      color?: NeonColor;
      /** Classes for this line, e.g. a different font or a smaller size in em. */
      className?: string;
    };

type Box = { w: number; h: number; fs: number };

function letterVars(index: number, flicker: Flicker): React.CSSProperties {
  if (flicker === "clean") {
    return { "--nk-a": "nk-neon-sign-clean", "--nk-t": "0.3s", "--nk-d": `${(index % 4) * 0.02}s` } as React.CSSProperties;
  }
  // Stable pseudo-random stagger so the server and client agree.
  return {
    "--nk-a": patterns[(index * 5) % 3],
    "--nk-d": `${(((index * 7919) % 13) / 26).toFixed(2)}s`,
  } as React.CSSProperties;
}

// A rounded rectangle that starts and ends at the bottom centre, leaving a gap
// where the tube's two electrodes turn back through the plate.
function framePath(w: number, h: number, r: number, gap: number, sw: number) {
  const x0 = sw / 2;
  const y0 = sw / 2;
  const x1 = w - sw / 2;
  const y1 = h - sw / 2;
  const rr = Math.max(0, Math.min(r, (y1 - y0) / 2, (x1 - x0) / 2));
  const cx = w / 2;
  return [
    `M ${cx + gap / 2} ${y1}`,
    `H ${x1 - rr}`,
    `A ${rr} ${rr} 0 0 0 ${x1} ${y1 - rr}`,
    `V ${y0 + rr}`,
    `A ${rr} ${rr} 0 0 0 ${x1 - rr} ${y0}`,
    `H ${x0 + rr}`,
    `A ${rr} ${rr} 0 0 0 ${x0} ${y0 + rr}`,
    `V ${y1 - rr}`,
    `A ${rr} ${rr} 0 0 0 ${x0 + rr} ${y1}`,
    `H ${cx - gap / 2}`,
  ].join(" ");
}

function FrameTube({
  box,
  shape,
  flicker,
}: {
  box: Box;
  shape: Exclude<Frame, "none">;
  flicker: Flicker;
}) {
  const { w, h, fs } = box;
  const sw = Math.max(2, fs * 0.065);
  const r = shape === "pill" ? h / 2 : Math.min(h / 2, fs * 0.42);
  // Below this size the boots and clips read as noise, so the loop closes.
  const detail = fs >= 24;
  const gap = detail ? fs * 0.5 : 0;
  const d = framePath(w, h, r, gap, sw);
  const y = h - sw / 2;
  const cx = w / 2;
  const capW = sw * 2.6;
  const capH = sw * 2.1;
  const straight = Math.max(r + sw, w * 0.2);
  // [x, y, vertical]: two supports along the top and bottom runs, one per side if there's a straight.
  const clips: [number, number, boolean][] = detail
    ? [
        [straight, sw / 2, false],
        [w - straight, sw / 2, false],
        [straight, y, false],
        [w - straight, y, false],
        ...(h - 2 * r > sw * 6
          ? ([
              [sw / 2, h / 2, true],
              [w - sw / 2, h / 2, true],
            ] as [number, number, boolean][])
          : []),
      ]
    : [];
  const svg = "pointer-events-none absolute left-0 top-0 overflow-visible";
  const anim = (
    flicker === "clean"
      ? { "--nk-a": "nk-neon-sign-clean", "--nk-t": "0.3s" }
      : { "--nk-a": "nk-neon-sign-c", "--nk-d": "0.06s" }
  ) as Record<string, string> as React.CSSProperties;

  return (
    <>
      <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={svg}>
        <path d={d} fill="none" strokeLinecap="round" strokeWidth={sw} style={{ stroke: "rgb(var(--neon) / 0.16)" }} />
        <path
          d={d}
          fill="none"
          strokeLinecap="round"
          strokeWidth={sw * 0.28}
          stroke="rgb(255 255 255 / 0.07)"
          transform={`translate(${-sw * 0.12} ${-sw * 0.2})`}
        />
      </svg>
      <svg
        aria-hidden
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={anim}
        className={cn(svg, "nk-neon-sign-l nk-neon-sign-glow")}
      >
        <path
          d={d}
          fill="none"
          strokeLinecap="round"
          strokeWidth={sw}
          style={{ stroke: "color-mix(in srgb, rgb(var(--neon)) 28%, white)" }}
        />
      </svg>
      <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={svg}>
        {/* Clear tube supports holding the frame to the plate */}
        {clips.map(([x, cy, vertical], i) => (
          <rect
            key={i}
            x={x - (vertical ? capW : sw * 0.9) / 2}
            y={cy - (vertical ? sw * 0.9 : capW) / 2}
            width={vertical ? capW : sw * 0.9}
            height={vertical ? sw * 0.9 : capW}
            rx={sw * 0.3}
            fill="rgb(255 255 255 / 0.08)"
            stroke="rgb(255 255 255 / 0.16)"
            strokeWidth={0.6}
          />
        ))}
        {/* Electrode boots where the tube ends dive through the plate */}
        {(detail ? [cx - gap / 2 - capW * 0.75, cx + gap / 2 - capW * 0.25] : []).map((x, i) => (
          <g key={i}>
            <rect x={x} y={y - capH / 2} width={capW} height={capH} rx={capH * 0.34} fill="#101217" stroke="rgb(255 255 255 / 0.09)" strokeWidth={0.6} />
            <rect x={i === 0 ? x + capW * 0.1 : x + capW * 0.8} y={y - capH / 2 + 0.6} width={capW * 0.1} height={capH - 1.2} fill="#272b33" />
            <rect
              x={x + capH * 0.28}
              y={y - capH / 2 + 0.8}
              width={capW - capH * 0.56}
              height={Math.max(0.6, capH * 0.13)}
              rx={0.3}
              fill="rgb(255 255 255 / 0.16)"
            />
          </g>
        ))}
      </svg>
    </>
  );
}

// The power lead: it leaves from behind the plate, sags, and drops out of the
// light. The stretch nearest the sign catches a rim of its color.
function Cable({ side, id }: { side: "left" | "right" | "bottom"; id: string }) {
  const bottom = side === "bottom";
  const d = bottom
    ? "M 9 8 C 9 18, 13 26, 13 40 C 13 54, 11 62, 11 72"
    : "M 9.6 4.3 C 18 4.3, 25 8.5, 29 21 C 33 37, 30 52, 31 72";
  const rim = bottom ? "translate(-1.1 0)" : "translate(-1.1 -0.4)";
  const position = bottom
    ? "left-[68%] top-[calc(100%-0.45em)] h-[3.6em] w-[1.1em]"
    : side === "right"
      ? "left-[calc(100%-0.5em)] top-[60%] h-[3.6em] w-[2.2em]"
      : "right-[calc(100%-0.5em)] top-[60%] h-[3.6em] w-[2.2em]";
  const vb = bottom ? "0 0 22 72" : "0 0 44 72";
  const mirror = side === "left" ? "translate(44 0) scale(-1 1)" : undefined;

  return (
    <svg
      aria-hidden
      data-part="cable"
      data-side={side}
      viewBox={vb}
      preserveAspectRatio="xMidYMin meet"
      className={cn("pointer-events-none absolute overflow-visible", position)}
    >
      <defs>
        <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="72">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.25" stopColor="#fff" />
          <stop offset="0.82" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="34">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="90" height="160">
          <rect x="-20" y="-20" width="90" height="160" fill={`url(#${id}-fade)`} />
        </mask>
        <mask id={`${id}-rim-mask`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="90" height="160">
          <rect x="-20" y="-20" width="90" height="160" fill={`url(#${id}-rim)`} />
        </mask>
      </defs>
      <g transform={mirror}>
        <g mask={`url(#${id}-mask)`}>
          <path d={d} fill="none" stroke="#0b0c10" strokeWidth={2.6} strokeLinecap="round" />
          <path d={d} fill="none" stroke="#1d2027" strokeWidth={1.7} strokeLinecap="round" />
          <path d={d} fill="none" stroke="rgb(255 255 255 / 0.13)" strokeWidth={0.45} strokeLinecap="round" transform="translate(-0.5 -0.3)" />
        </g>
        <g mask={`url(#${id}-rim-mask)`} className="nk-neon-sign-f">
          <path d={d} fill="none" strokeWidth={0.5} strokeLinecap="round" transform={rim} style={{ stroke: "rgb(var(--neon) / 0.5)" }} />
        </g>
      </g>
    </svg>
  );
}

// A rubber grommet where the lead passes the plate's edge. One viewBox unit
// of the cable is 0.05em, so these line up with the path above.
const grommets = {
  bottom: "left-[calc(68%+0.45em)] top-full h-[0.26em] w-[0.2em]",
  right: "left-full top-[calc(60%+0.215em)] h-[0.2em] w-[0.26em]",
  left: "left-0 top-[calc(60%+0.215em)] h-[0.2em] w-[0.26em]",
};

function Grommet({ side }: { side: keyof typeof grommets }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[0.07em] bg-[linear-gradient(#2b2e36,#111318)] shadow-[0_0.03em_0.06em_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.1)]",
        grommets[side],
      )}
    />
  );
}

const corners = [
  { at: "left-[0.24em] top-[0.24em]", light: "78% 78%" },
  { at: "right-[0.24em] top-[0.24em]", light: "22% 78%" },
  { at: "bottom-[0.24em] left-[0.24em]", light: "78% 22%" },
  { at: "bottom-[0.24em] right-[0.24em]", light: "22% 22%" },
];

function Backplate() {
  return (
    <span
      aria-hidden
      data-part="plate"
      className="nk-neon-sign-plate pointer-events-none absolute inset-0 rounded-[0.32em] border border-white/[0.07]"
    >
      <span className="nk-neon-sign-sheen absolute inset-0 rounded-[inherit]" />
      <span className="nk-neon-sign-edge nk-neon-sign-f absolute -inset-px rounded-[inherit]" />
      {corners.map((corner) => (
        <span
          key={corner.at}
          data-part="standoff"
          className={cn("nk-neon-sign-standoff absolute size-[max(7px,0.2em)] rounded-full", corner.at)}
        >
          <span
            className="nk-neon-sign-f absolute inset-0 rounded-full mix-blend-screen"
            style={{ background: `radial-gradient(circle at ${corner.light}, rgb(var(--neon) / calc(0.8 * var(--neon-glow, 1))), transparent 62%)` }}
          />
        </span>
      ))}
    </span>
  );
}

function useFrameBox(enabled: boolean) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<Box | null>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const next = {
        w: node.offsetWidth,
        h: node.offsetHeight,
        fs: parseFloat(getComputedStyle(node).fontSize) || 16,
      };
      setBox((prev) =>
        prev && prev.w === next.w && prev.h === next.h && prev.fs === next.fs ? prev : next,
      );
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [enabled]);

  return [ref, box] as const;
}

export interface NeonSignProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Lit or dark. Turning it on replays the flicker profile. */
  on?: boolean;
  /** The sign's color: the frame, plate edge and any line without its own. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** One tube per line, each with an optional color and className. A string child works too (`\n` splits lines). */
  lines?: NeonSignLine[];
  /** A tube bent around the lettering. */
  frame?: Frame;
  /** Clear acrylic plate with four standoffs behind the tubes. */
  backplate?: boolean;
  /** The power lead, leaving the plate on this side. */
  cable?: "left" | "right" | "bottom" | false;
  /** How the tubes catch: `clean`, letter-by-letter `stutter`, or `dying` (one letter never settles). */
  flicker?: Flicker;
  /** Which letter is dying, counting letters across all lines and skipping spaces. */
  dyingLetter?: number;
  /** Every few seconds a random letter buzzes, like an ageing transformer. */
  buzz?: boolean;
  size?: keyof typeof sizes;
}

const NeonSign = React.forwardRef<HTMLDivElement, NeonSignProps>(
  (
    {
      className,
      style,
      color,
      on = true,
      lines,
      frame = "none",
      backplate = true,
      cable = false,
      flicker = "stutter",
      dyingLetter,
      buzz = false,
      size = "md",
      children,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const id = `nk-sign-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const [frameRef, box] = useFrameBox(frame !== "none");

    const source = lines ?? (typeof children === "string" ? children.split("\n") : null);
    const parsed = (source ?? []).map((line) => (typeof line === "string" ? { text: line } : line));

    let count = 0;
    const model = parsed.map((line) => ({
      ...line,
      glyphs: Array.from(line.text).map((char) => ({ char, index: char.trim() ? count++ : -1 })),
    }));
    // Default dying letter: picked from the text itself, so it's stable across renders.
    const dying =
      flicker !== "dying" || count === 0
        ? -1
        : dyingLetter !== undefined
          ? Math.min(Math.max(0, Math.round(dyingLetter)), count - 1)
          : Array.from(parsed.map((line) => line.text).join("")).reduce((sum, c) => sum + c.charCodeAt(0), 0) % count;

    React.useEffect(() => {
      const root = rootRef.current;
      if (!buzz || !on || !root) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      let timer: ReturnType<typeof setTimeout>;
      let running: Animation | undefined;
      const tick = () => {
        const letters = root.querySelectorAll<HTMLElement>("[data-nk-letter]:not(.nk-neon-sign-x)");
        const letter = letters[Math.floor(Math.random() * letters.length)];
        if (letter && typeof letter.animate === "function") {
          running = letter.animate(
            [{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }],
            { duration: 600, easing: "linear" },
          );
        }
        timer = setTimeout(tick, 2600 + Math.random() * 4200);
      };
      timer = setTimeout(tick, 1800 + Math.random() * 2400);
      return () => {
        clearTimeout(timer);
        running?.cancel();
      };
    }, [buzz, on]);

    const srText = parsed.map((line) => line.text.trim()).filter(Boolean).join(" ");

    const body = source ? (
      model.map((line, i) => (
        <span
          key={i}
          data-part="line"
          style={neonVars(line.color)}
          className={cn("relative block whitespace-pre text-center", line.className)}
        >
          <span
            aria-hidden
            className="nk-neon-sign-f pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[3.4em] w-[calc(100%+3.2em)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(var(--neon)/CALC(0.3*var(--neon-glow,1))),rgb(var(--neon)/CALC(0.11*var(--neon-glow,1)))_48%,transparent)] mix-blend-screen"
          />
          {/* Glass and lit copies share one box, so the line's own padding can't offset them */}
          <span className="relative inline-block">
            <span aria-hidden className="nk-neon-sign-glass">
              {line.glyphs.map((g, j) => (g.index < 0 ? g.char : <span key={j}>{g.char}</span>))}
            </span>
            <span aria-hidden className="nk-neon-sign-tube absolute inset-0">
              {line.glyphs.map((g, j) =>
                g.index < 0 ? (
                  g.char
                ) : (
                  <span
                    key={j}
                    data-nk-letter={g.index}
                    data-dying={g.index === dying || undefined}
                    style={letterVars(g.index, flicker)}
                    className={cn("nk-neon-sign-l", g.index === dying && "nk-neon-sign-x")}
                  >
                    {g.index === dying ? <span className="nk-neon-sign-x2">{g.char}</span> : g.char}
                  </span>
                ),
              )}
            </span>
          </span>
        </span>
      ))
    ) : children ? (
      <span data-part="art" className="relative block">
        <span className="nk-neon-sign-glass block">{children}</span>
        <span
          aria-hidden
          style={letterVars(0, flicker === "dying" ? "stutter" : flicker)}
          className="nk-neon-sign-art nk-neon-sign-glow nk-neon-sign-l absolute inset-0 block"
        >
          {children}
        </span>
      </span>
    ) : null;

    const flood = (
      flicker === "clean"
        ? { "--nk-fa": "nk-neon-sign-clean", "--nk-ft": "0.3s" }
        : { "--nk-fa": "nk-neon-sign-flood", "--nk-ft": "1.1s" }
    ) as Record<string, string> as React.CSSProperties;

    return (
      <div
        ref={rootRef}
        data-state={on ? "on" : "off"}
        data-flicker={flicker}
        style={neonVars(color, { ...flood, ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative isolate inline-flex flex-col items-center leading-[1.12]",
          backplate ? (frame === "none" ? "px-[0.8em] py-[0.42em]" : "p-[0.55em]") : "p-[0.1em]",
          sizes[size],
          // Room for the lead to hang into, so it doesn't run over what follows.
          cable && "mb-[2.2em]",
          on && "nk-neon-sign-on",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {source && srText && <span className="sr-only">{srText}</span>}
        <span
          aria-hidden
          data-part="wash"
          className="nk-neon-sign-f pointer-events-none absolute -inset-x-[1.6em] -inset-y-[1.3em] -z-10 bg-[radial-gradient(closest-side,rgb(var(--neon)/CALC(0.16*var(--neon-glow,1))),rgb(var(--neon)/CALC(0.06*var(--neon-glow,1)))_55%,transparent)]"
        />
        {cable && <Cable side={cable} id={id} />}
        {backplate && <Backplate />}
        {backplate && cable && <Grommet side={cable} />}
        {frame !== "none" ? (
          <div
            ref={frameRef}
            data-part="frame"
            data-shape={frame}
            className={cn(
              "relative select-none py-[0.24em]",
              frame === "pill" ? "px-[0.8em]" : "px-[0.48em]",
            )}
          >
            {box && <FrameTube box={box} shape={frame} flicker={flicker} />}
            <span className="relative block">{body}</span>
          </div>
        ) : (
          <span className="relative block select-none">{body}</span>
        )}
      </div>
    );
  },
);
NeonSign.displayName = "NeonSign";

export { NeonSign };
