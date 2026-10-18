"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The pulse is a stack of dashes on one path, each shorter and hotter than the one under it, all ending
// at the same head: a dim tail, a lit body, a white-hot tip, and two wide faint strokes for the halo. The
// path has pathLength 1, so the dash maths is in shares of the path and survives any resize; only the
// dash offset animates, from CSS, with no script per frame.
const css = `
.nk-signal-beam-pulse { stroke-dashoffset: var(--nk-sb-a); animation: var(--nk-sb-name) var(--nk-sb-cycle) linear var(--nk-sb-delay) infinite both; }
.nk-signal-beam-flash { opacity: 0; animation: var(--nk-sb-flash) var(--nk-sb-cycle) linear var(--nk-sb-delay) infinite both; }
.nk-signal-beam[data-paused] .nk-signal-beam-pulse,
.nk-signal-beam[data-paused] .nk-signal-beam-flash { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .nk-signal-beam-pulse { animation: none; stroke-dashoffset: var(--nk-sb-still); }
  .nk-signal-beam-flash { animation: none; opacity: 0; }
}
`;

// Share of the path left dark either side of the pulse, so no round cap shows before or after a run.
const EDGE = 0.002;

type Layer = { length: number; width: number; stroke: string };

// The halo strokes get shorter as they get wider, so the light tapers off the head instead of ending in a capsule.
const layers = (w: number): Layer[] => [
  { length: 0.5, width: w * 6.5, stroke: "rgb(var(--neon) / calc(0.05 * var(--neon-glow, 1)))" },
  { length: 0.7, width: w * 4, stroke: "rgb(var(--neon) / calc(0.09 * var(--neon-glow, 1)))" },
  { length: 0.9, width: w * 2.2, stroke: "rgb(var(--neon) / calc(0.2 * var(--neon-glow, 1)))" },
  { length: 1, width: w, stroke: "rgb(var(--neon) / 0.3)" },
  { length: 0.62, width: w, stroke: "rgb(var(--neon) / 0.7)" },
  { length: 0.28, width: w, stroke: "color-mix(in srgb, rgb(var(--neon)) 45%, white)" },
  { length: 0.08, width: w * 0.9, stroke: "#fff" },
];

type Geometry = { d: string; ax: number; ay: number; bx: number; by: number };

function radiusOf(node: Element, w: number, h: number) {
  const style = getComputedStyle(node);
  const raw = style.borderTopLeftRadius || style.borderRadius || "0";
  const value = parseFloat(raw) || 0;
  return raw.trim().endsWith("%") ? (value / 100) * Math.min(w, h) : value;
}

/** Where a ray from the centre of a box leaves it: an ellipse for round nodes, the box for the rest. */
function exit(hw: number, hh: number, round: boolean, dx: number, dy: number) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  if (hw <= 0 || hh <= 0) return 0;
  if (round) return 1 / Math.sqrt((ux / hw) ** 2 + (uy / hh) ** 2);
  return Math.min(ux ? hw / Math.abs(ux) : Infinity, uy ? hh / Math.abs(uy) : Infinity);
}


export interface SignalBeamProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "color" | "children"> {
  /** The positioned element both nodes sit in. The beam fills it; place `<SignalBeam>` as its child. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Where the tube starts. */
  fromRef: React.RefObject<HTMLElement | null>;
  /** Where the tube ends. */
  toRef: React.RefObject<HTMLElement | null>;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Bow of the tube in pixels, at its middle. Positive bends to the left of the direction of travel (up, going right). */
  curvature?: number;
  /** Seconds for a pulse to cross. */
  duration?: number;
  /** Seconds before the first pulse. Stagger beams with it. */
  delay?: number;
  /** Seconds of dark between pulses. */
  repeatDelay?: number;
  /** Run the pulse from `to` back to `from`. */
  reverse?: boolean;
  /** Pulses run both ways, half a cycle apart. */
  bidirectional?: boolean;
  /** Length of the pulse as a share of the tube, 0.05 to 1. */
  pulseLength?: number;
  /** Tube thickness in pixels. */
  width?: number;
  /** A dark tube carries no signal: no pulse, no glow. */
  active?: boolean;
  /** Pixels between a node's edge and the end of the tube. */
  gap?: number;
  /** Nudges the start point, in pixels. */
  fromOffset?: [number, number];
  /** Nudges the end point, in pixels. */
  toOffset?: [number, number];
}

const SignalBeam = React.forwardRef<SVGSVGElement, SignalBeamProps>(
  (
    {
      className,
      style,
      color,
      containerRef,
      fromRef,
      toRef,
      curvature = 0,
      duration = 2.4,
      delay = 0,
      repeatDelay = 0.8,
      reverse = false,
      bidirectional = false,
      pulseLength = 0.3,
      width = 2,
      active = true,
      gap = 4,
      fromOffset,
      toOffset,
      ...props
    },
    forwardedRef,
  ) => {
    const svgRef = React.useRef<SVGSVGElement>(null);
    React.useImperativeHandle(forwardedRef, () => svgRef.current as SVGSVGElement);
    const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
    const [geometry, setGeometry] = React.useState<Geometry | null>(null);
    const [paused, setPaused] = React.useState(false);

    const fx = fromOffset?.[0] ?? 0;
    const fy = fromOffset?.[1] ?? 0;
    const tx = toOffset?.[0] ?? 0;
    const ty = toOffset?.[1] ?? 0;

    // A passive effect: nodes that render after the beam only have their refs attached once layout effects
    // have run.
    React.useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;
      let frame = 0;
      const measure = () => {
        frame = 0;
        const a = fromRef.current;
        const b = toRef.current;
        if (!a || !b) return;
        const box = svg.getBoundingClientRect();
        // Inside a scaled parent (a zoomed preview), client rects are scaled but the SVG draws in its own pixels.
        const scale = svg.clientWidth ? box.width / svg.clientWidth : 1;
        const local = (node: Element) => {
          const r = node.getBoundingClientRect();
          const w = r.width / scale;
          const h = r.height / scale;
          return {
            x: (r.left - box.left) / scale + w / 2,
            y: (r.top - box.top) / scale + h / 2,
            hw: w / 2,
            hh: h / 2,
            round: radiusOf(node, w, h) >= Math.min(w, h) * 0.45,
          };
        };
        const A = local(a);
        const B = local(b);
        A.x += fx;
        A.y += fy;
        B.x += tx;
        B.y += ty;
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const span = Math.hypot(dx, dy);
        if (span < 1) {
          setGeometry(null);
          return;
        }
        const cx = (A.x + B.x) / 2 + (dy / span) * curvature;
        const cy = (A.y + B.y) / 2 - (dx / span) * curvature;
        // Each end leaves its node along the tangent toward the control point.
        const ex = (n: typeof A) => {
          const vx = cx - n.x;
          const vy = cy - n.y;
          const len = Math.hypot(vx, vy) || 1;
          const t = exit(n.hw, n.hh, n.round, vx, vy) + gap;
          return [n.x + (vx / len) * t, n.y + (vy / len) * t];
        };
        const [ax, ay] = ex(A);
        const [bx, by] = ex(B);
        const r = (v: number) => Math.round(v * 10) / 10;
        const d = `M ${r(ax)} ${r(ay)} Q ${r(cx)} ${r(cy)} ${r(bx)} ${r(by)}`;
        setGeometry((prev) => (prev?.d === d ? prev : { d, ax: r(ax), ay: r(ay), bx: r(bx), by: r(by) }));
      };
      const queue = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      measure();
      const container = containerRef?.current ?? svg.parentElement;
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(queue);
      [container, fromRef.current, toRef.current].forEach((node) => node && ro?.observe(node));
      window.addEventListener("resize", queue);
      return () => {
        cancelAnimationFrame(frame);
        ro?.disconnect();
        window.removeEventListener("resize", queue);
      };
    }, [containerRef, fromRef, toRef, curvature, gap, fx, fy, tx, ty]);

    // Pulses stop off screen and in background tabs.
    React.useEffect(() => {
      const svg = svgRef.current;
      if (!svg || !active) return;
      let inView = true;
      const sync = () => setPaused(!inView || document.hidden);
      const io =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              inView = entry.isIntersecting;
              sync();
            });
      io?.observe(svg);
      document.addEventListener("visibilitychange", sync);
      return () => {
        io?.disconnect();
        document.removeEventListener("visibilitychange", sync);
      };
    }, [active]);

    const L = Math.min(1, Math.max(0.05, pulseLength));
    const cycle = Math.max(0.1, duration) + Math.max(0, repeatDelay);
    const travel = (Math.max(0.1, duration) / cycle) * 100;
    const arrive = (travel * (1 + EDGE)) / (1 + L + 2 * EDGE);
    const fade = Math.min(100, arrive + (0.45 / cycle) * 100);
    const pct = (n: number) => `${Math.round(n * 100) / 100}%`;
    const keyframes = `
@keyframes nk-sb-run-${id} { 0% { stroke-dashoffset: var(--nk-sb-a); } ${pct(travel)}, 100% { stroke-dashoffset: var(--nk-sb-b); } }
@keyframes nk-sb-flash-${id} { 0%, ${pct(Math.max(0, arrive - 0.5))} { opacity: 0; } ${pct(arrive)} { opacity: 1; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); } ${pct(fade)}, 100% { opacity: 0; } }
`;

    const stack = layers(width);
    const pulse = (backward: boolean, offset: number) => {
      const timing = {
        "--nk-sb-name": `nk-sb-run-${id}`,
        "--nk-sb-flash": `nk-sb-flash-${id}`,
        "--nk-sb-cycle": `${cycle}s`,
        "--nk-sb-delay": `${delay + offset}s`,
      } as React.CSSProperties;
      // Forward, a dash of length l with its head at h sits at offset l - h; backward, at -h.
      const still = 0.62;
      return (
        <g key={backward ? "back" : "fore"} style={timing}>
          {stack.map((layer, i) => {
            const l = layer.length * L;
            const vars = backward
              ? { a: -(1 + EDGE), b: L + EDGE, s: -(1 - still) }
              : { a: l + EDGE, b: l - 1 - L - EDGE, s: l - still };
            return (
              <path
                key={i}
                d={geometry?.d}
                pathLength={1}
                fill="none"
                strokeLinecap="round"
                className="nk-signal-beam-pulse"
                style={{
                  stroke: layer.stroke,
                  strokeWidth: layer.width,
                  strokeDasharray: `${l} ${2 + L}`,
                  "--nk-sb-a": vars.a,
                  "--nk-sb-b": vars.b,
                  "--nk-sb-still": vars.s,
                } as React.CSSProperties}
              />
            );
          })}
          {/* The far node catches the light as the pulse lands. */}
          <circle
            cx={backward ? geometry?.ax : geometry?.bx}
            cy={backward ? geometry?.ay : geometry?.by}
            r={width * 7}
            fill={`url(#nk-sb-spill-${id})`}
            className="nk-signal-beam-flash"
          />
        </g>
      );
    };

    const forward = !reverse;

    return (
      <svg
        ref={svgRef}
        aria-hidden
        fill="none"
        data-paused={paused || undefined}
        data-active={active || undefined}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "nk-signal-beam pointer-events-none absolute inset-0 size-full overflow-visible",
          className,
        )}
        {...props}
      >
        <style>{css + keyframes}</style>
        <defs>
          <radialGradient id={`nk-sb-spill-${id}`}>
            <stop offset="0" style={{ stopColor: "#fff", stopOpacity: "var(--neon-glow, 1)" }} />
            <stop offset="0.25" style={{ stopColor: "rgb(var(--neon))", stopOpacity: "calc(0.5 * var(--neon-glow, 1))" }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        {geometry && (
          <>
            {/* The tube: tinted glass when it carries signal, near-black when it's dark. */}
            <path
              d={geometry.d}
              strokeLinecap="round"
              style={{
                stroke: active ? "rgb(var(--neon) / 0.16)" : "rgb(255 255 255 / 0.07)",
                strokeWidth: width,
                strokeDasharray: active ? undefined : `${width * 2} ${width * 2.5}`,
              }}
            />
            {active && pulse(!forward, 0)}
            {active && bidirectional && pulse(forward, cycle / 2)}
          </>
        )}
      </svg>
    );
  },
);
SignalBeam.displayName = "SignalBeam";

export { SignalBeam };
