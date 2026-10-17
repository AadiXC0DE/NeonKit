"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type Shape = "straight" | "wave" | "zigzag" | "loop";
type Pt = [number, number];

const sizes = {
  sm: { tube: 2, amp: 5, period: 44, loop: 16 },
  md: { tube: 3, amp: 7, period: 56, loop: 22 },
  lg: { tube: 4, amp: 9, period: 72, loop: 28 },
} as const;

const CAP = 8; // electrode housing at each end
const BLOCKOUT = 7; // painted-over glass next to each electrode
const LEAD = 14; // straight run before the bends start

const css = `
@keyframes nk-tube-divider-ignite { 0% { opacity: 0; } 8% { opacity: 0.8; } 15% { opacity: 0.08; } 28% { opacity: 0.95; } 36% { opacity: 0.3; } 52% { opacity: 1; } 62% { opacity: 0.65; } 74%, 100% { opacity: 1; } }
@keyframes nk-tube-divider-flow { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
.nk-tube-divider-ignite { animation: nk-tube-divider-ignite 720ms linear both; }
.nk-tube-divider-flow { animation: nk-tube-divider-flow 3.6s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .nk-tube-divider-ignite { animation: none; }
  .nk-tube-divider-flow { display: none; }
}
`;

const f = (n: number) => n.toFixed(2);

// Catmull-Rom through evenly spaced points, as cubic Béziers. Returns only the
// curve commands, so straight leads can be joined on with plain lines.
function smooth(points: Pt[]) {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)},${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)},${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

// Straight lead in, the bent run, straight lead out.
function run(from: number, to: number, mid: number, points: Pt[]) {
  const [x0, y0] = points[0];
  return `M${f(from)},${f(mid)}L${f(x0)},${f(y0)}${smooth(points)}L${f(to)},${f(mid)}`;
}

// A polyline with each interior corner bent on a small radius, like heated glass.
function bent(points: Pt[], radius: number) {
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    const l1 = Math.hypot(x - px, y - py);
    const l2 = Math.hypot(nx - x, ny - y);
    const r = Math.min(radius, l1 / 2.2, l2 / 2.2);
    d += `L${f(x + ((px - x) * r) / l1)},${f(y + ((py - y) * r) / l1)}`;
    d += `Q${f(x)},${f(y)} ${f(x + ((nx - x) * r) / l2)},${f(y + ((ny - y) * r) / l2)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${f(last[0])},${f(last[1])}`;
}

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

type Geometry = {
  height: number;
  mid: number;
  glass: string;
  lit: string;
  clips: { x: number; y: number; angle: number }[];
  crossing?: { under: string; over: string };
};

function geometry(shape: Shape, size: keyof typeof sizes, width: number): Geometry {
  const { tube, amp, period, loop } = sizes[size];
  const glassStart = CAP - 1;
  const glassEnd = width - CAP + 1;
  const litStart = CAP + BLOCKOUT;
  const litEnd = width - CAP - BLOCKOUT;
  const s = CAP + LEAD;
  const e = Math.max(s + 1, width - CAP - LEAD);
  const span = e - s;

  if (shape === "loop") {
    // A prolate cycloid: one loop that leaves and rejoins the line with a level tangent.
    const b = loop;
    const a = b * 0.3;
    const c = b * 0.62;
    const height = 2 * c + tube * 3 + 14;
    const mid = height - tube * 1.5 - 7;
    const cx = width / 2;
    const at = (t: number): Pt => [cx + a * t - b * Math.sin(t), mid - c * (1 + Math.cos(t))];
    const samples = (from: number, to: number, count: number) =>
      Array.from({ length: count + 1 }, (_, i) => at(from + ((to - from) * i) / count));
    const curl = samples(-Math.PI, Math.PI, 96);
    const path = (from: number, to: number) => run(from, to, mid, curl);

    // Where the tube crosses itself: a·t = b·sin t, solved by bisection on (0, π).
    let lo = 0.1;
    let hi = Math.PI;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (a * m - b * Math.sin(m) < 0) lo = m;
      else hi = m;
    }
    // Neon benders paint the rear tube black where another passes in front of it.
    const segment = (from: number, to: number) => {
      const points = samples(from, to, 12);
      return `M${f(points[0][0])},${f(points[0][1])}${smooth(points)}`;
    };
    const crossing = { under: segment(-lo - 0.2, -lo + 0.2), over: segment(lo - 0.5, lo + 0.5) };

    const left = cx - a * Math.PI;
    const right = cx + a * Math.PI;
    const side = (from: number, to: number) => {
      const count = Math.max(1, Math.round((to - from) / 220));
      return Array.from({ length: count }, (_, k) => ({ x: from + ((k + 0.5) * (to - from)) / count, y: mid, angle: 0 }));
    };
    const clips = left - s > 40 ? [...side(s, left - 12), ...side(right + 12, e)] : [];

    return { height, mid, glass: path(glassStart, glassEnd), lit: path(litStart, litEnd), clips, crossing };
  }

  const bends = shape === "wave" || shape === "zigzag";
  const height = (bends ? amp * 2 : 0) + tube * 4 + 10;
  const mid = height / 2;
  const cycles = Math.max(1, Math.round(span / period));
  const p = span / cycles;

  // Clip positions: spread along the run, snapped to where the tube crosses its midline.
  const count = Math.max(2, Math.round(span / 220));
  const snapped = Array.from({ length: count }, (_, k) => {
    const x = s + ((k + 0.5) * span) / count;
    if (!bends) return x;
    const j = Math.min(cycles * 2 - 1, Math.max(1, Math.round((x - s) / (p / 2))));
    return s + (j * p) / 2;
  });
  // On a short run two clips can snap to the same crossing.
  const clipXs = [...new Set(snapped)];

  if (shape === "zigzag") {
    const corners: Pt[] = [];
    for (let k = 0; k < cycles * 2; k++) corners.push([s + p / 4 + (k * p) / 2, mid + (k % 2 === 0 ? -amp : amp)]);
    const path = (from: number, to: number) => bent([[from, mid], [s, mid], ...corners, [e, mid], [to, mid]], 1.5 + tube * 0.5);
    const slope = amp / (p / 4);
    const clips = clipXs.map((x) => {
      const j = Math.round((x - s) / (p / 2));
      const rising = j % 2 === 0;
      return { x, y: mid, angle: (Math.atan(rising ? -slope : slope) * 180) / Math.PI };
    });
    return { height, mid, glass: path(glassStart, glassEnd), lit: path(litStart, litEnd), clips };
  }

  if (shape === "wave") {
    // The amplitude eases in over the first half-wave, so the tube leaves the lead without a kink.
    const y = (x: number) => {
      const t = x - s;
      const envelope = smoothstep(Math.min(t, span - t) / (p / 2));
      return mid - amp * envelope * Math.sin((2 * Math.PI * t) / p);
    };
    const steps = Math.max(8, Math.round(span / 3));
    const points: Pt[] = Array.from({ length: steps + 1 }, (_, i) => {
      const x = s + (span * i) / steps;
      return [x, y(x)];
    });
    const path = (from: number, to: number) => run(from, to, mid, points);
    const clips = clipXs.map((x) => ({
      x,
      y: y(x),
      angle: (Math.atan2(y(x + 0.5) - y(x - 0.5), 1) * 180) / Math.PI,
    }));
    return { height, mid, glass: path(glassStart, glassEnd), lit: path(litStart, litEnd), clips };
  }

  const line = (from: number, to: number) => `M${f(from)},${f(mid)}H${f(to)}`;
  return {
    height,
    mid,
    glass: line(glassStart, glassEnd),
    lit: line(litStart, litEnd),
    clips: clipXs.map((x) => ({ x, y: mid, angle: 0 })),
  };
}

export interface TubeDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** How the glass is bent. */
  shape?: Shape;
  /** Tube thickness, and how far it bends. */
  size?: keyof typeof sizes;
  /** Lit or dark. Turning it on replays the ignition flicker. */
  on?: boolean;
  /** Metal clips holding the tube to the wall. */
  clips?: boolean;
  /** A brighter pulse of current travels along the tube. */
  flow?: boolean;
  /**
   * Purely visual (the default): hidden from assistive tech.
   * Set false when it separates real sections, to expose `role="separator"`.
   */
  decorative?: boolean;
}

const TubeDivider = React.forwardRef<HTMLDivElement, TubeDividerProps>(
  (
    {
      className,
      style,
      color,
      shape = "straight",
      size = "md",
      on = true,
      clips = true,
      flow = false,
      decorative = true,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const rootRef = React.useRef<HTMLDivElement>(null);
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const [measured, setMeasured] = React.useState<number | null>(null);
    useIsomorphicLayoutEffect(() => {
      const node = rootRef.current;
      if (!node) return;
      const measure = () => {
        const next = Math.round(node.getBoundingClientRect().width);
        if (next > 0) setMeasured((previous) => (previous === next ? previous : next));
      };
      measure();
      if (typeof ResizeObserver === "undefined") {
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
      }
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    // Count off-to-on changes; each remounts the light so the flicker replays.
    const [ignitions, setIgnitions] = React.useState(0);
    const [previous, setPrevious] = React.useState(on);
    if (previous !== on) {
      setPrevious(on);
      if (on) setIgnitions((count) => count + 1);
    }

    const width = Math.max(measured ?? 480, CAP * 2 + LEAD * 2 + 24);
    const { tube } = sizes[size];
    const g = React.useMemo(() => geometry(shape, size, width), [shape, size, width]);
    const ignite = on && ignitions > 0 ? "nk-tube-divider-ignite" : undefined;

    const stroke = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
    const core = "color-mix(in srgb, rgb(var(--neon)) 30%, white)";

    const semantics = decorative
      ? { role: "none" as const }
      : { role: "separator" as const, "aria-orientation": "horizontal" as const };

    return (
      <div
        ref={setRefs}
        data-shape={shape}
        data-state={on ? "on" : "off"}
        style={neonVars(color, { height: g.height, ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative w-full shrink-0",
          className,
        )}
        {...semantics}
        {...props}
      >
        <style>{css}</style>

        {/* Light thrown on the wall behind the tube */}
        <div
          key={`spill-${ignitions}`}
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-[4%] -inset-y-6 bg-[radial-gradient(50%_50%_at_50%_50%,rgb(var(--neon)/CALC(0.13*var(--neon-glow,1))),transparent)] transition-opacity duration-300",
            ignite,
          )}
          style={{ opacity: on ? 1 : 0 }}
        />

        <svg
          aria-hidden
          viewBox={`0 0 ${width} ${g.height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            <filter id={`${uid}-wide`} filterUnits="userSpaceOnUse" x={-40} y={-40} width={width + 80} height={g.height + 80}>
              <feGaussianBlur stdDeviation={tube * 1.6} />
            </filter>
            <filter id={`${uid}-tight`} filterUnits="userSpaceOnUse" x={-20} y={-20} width={width + 40} height={g.height + 40}>
              <feGaussianBlur stdDeviation={tube * 0.55} />
            </filter>
            <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5b606c" />
              <stop offset="0.45" stopColor="#2a2d36" />
              <stop offset="1" stopColor="#15171d" />
            </linearGradient>
            <linearGradient id={`${uid}-catch`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0 }} />
              <stop offset="0.5" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0.55 }} />
              <stop offset="1" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* The glass, visible lit or not */}
          <path d={g.glass} {...stroke} strokeWidth={tube + 1.4} style={{ stroke: "rgb(var(--neon) / 0.15)" }} />
          <path
            d={g.glass}
            {...stroke}
            strokeWidth={Math.max(0.6, tube * 0.28)}
            transform={`translate(0 ${-tube * 0.28})`}
            className="transition-opacity duration-300"
            style={{ stroke: "rgb(255 255 255 / 0.09)", opacity: on ? 0 : 1 }}
          />

          {/* The gas, lit */}
          <g
            key={ignitions}
            className={cn("transition-opacity duration-200 ease-out", ignite)}
            style={{ opacity: on ? 1 : 0 }}
          >
            <path d={g.lit} {...stroke} strokeWidth={tube * 3} filter={`url(#${uid}-wide)`} style={{ stroke: "rgb(var(--neon))", opacity: "calc(0.45 * var(--neon-glow, 1))" }} />
            <path d={g.lit} {...stroke} strokeWidth={tube * 1.3} filter={`url(#${uid}-tight)`} style={{ stroke: "rgb(var(--neon))", opacity: "var(--neon-glow, 1)" }} />
            <path d={g.lit} {...stroke} strokeWidth={tube} style={{ stroke: "rgb(var(--neon))" }} />
            <path d={g.lit} {...stroke} strokeWidth={tube * 0.45} style={{ stroke: core }} />
            {flow && (
              <path
                d={g.lit}
                {...stroke}
                pathLength={100}
                strokeDasharray="7 93"
                strokeWidth={tube * 0.9}
                filter={`url(#${uid}-tight)`}
                className="nk-tube-divider-flow"
                style={{ stroke: core, opacity: "var(--neon-glow, 1)" }}
              />
            )}
          </g>

          {/* Where the loop crosses itself, the rear pass is blacked out and the front one runs over it */}
          {g.crossing && (
            <g>
              <path d={g.crossing.under} {...stroke} strokeWidth={tube + 1.6} style={{ stroke: "#07080c", opacity: 0.9 }} />
              <path d={g.crossing.under} {...stroke} strokeWidth={tube + 1.4} style={{ stroke: "rgb(var(--neon) / 0.1)" }} />
              <g className={cn("transition-opacity duration-200 ease-out", ignite)} style={{ opacity: on ? 1 : 0 }}>
                <path d={g.crossing.over} {...stroke} strokeLinecap="butt" strokeWidth={tube * 1.3} filter={`url(#${uid}-tight)`} style={{ stroke: "rgb(var(--neon))", opacity: "var(--neon-glow, 1)" }} />
                <path d={g.crossing.over} {...stroke} strokeLinecap="butt" strokeWidth={tube} style={{ stroke: "rgb(var(--neon))" }} />
                <path d={g.crossing.over} {...stroke} strokeLinecap="butt" strokeWidth={tube * 0.45} style={{ stroke: core }} />
              </g>
            </g>
          )}

          {/* Electrodes */}
          {[0, width - CAP].map((x, i) => (
            <g key={x}>
              <rect
                x={x}
                y={g.mid - tube / 2 - 3}
                width={CAP}
                height={tube + 6}
                rx={2}
                fill={`url(#${uid}-metal)`}
              />
              <rect
                x={i === 0 ? x + CAP - 1.5 : x}
                y={g.mid - tube / 2 - 3}
                width={1.5}
                height={tube + 6}
                rx={0.75}
                fill={`url(#${uid}-catch)`}
                className="transition-opacity duration-300"
                style={{ opacity: on ? 1 : 0 }}
              />
            </g>
          ))}

          {/* Mounting clips */}
          {clips &&
            g.clips.map((clip) => (
              <g key={clip.x} transform={`translate(${f(clip.x)} ${f(clip.y)}) rotate(${f(clip.angle)})`}>
                <rect x={-2.5} y={-(tube / 2 + 2.75)} width={5} height={tube + 5.5} rx={1.5} fill={`url(#${uid}-metal)`} />
                <rect
                  x={-2.5}
                  y={-(tube / 2 + 2.75)}
                  width={5}
                  height={tube + 5.5}
                  rx={1.5}
                  fill={`url(#${uid}-catch)`}
                  className="transition-opacity duration-300"
                  style={{ opacity: on ? 0.6 : 0 }}
                />
                <rect x={-2.5} y={-(tube / 2 + 2.75)} width={5} height={0.75} rx={0.375} style={{ fill: "rgb(255 255 255 / 0.18)" }} />
              </g>
            ))}
        </svg>
      </div>
    );
  },
);
TubeDivider.displayName = "TubeDivider";

export { TubeDivider };
