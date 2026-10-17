"use client";

import * as React from "react";
import { useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// Small dials print larger (in dial units) so the legends stay readable. `px` is rendered
// pixels per dial unit, used to keep numerals from shrinking below a readable 7.5px.
const sizes = {
  sm: { root: "w-40", legend: 10, numeral: 12, px: 0.8 },
  md: { root: "w-56", legend: 8, numeral: 10.5, px: 1.12 },
  lg: { root: "w-72", legend: 7.5, numeral: 10, px: 1.44 },
} as const;

// Rough advance of a tabular numeral (or the minus sign) in em, with room for the gap between labels.
const NUMERAL_EM = 0.72;

// The dial is drawn in a 200-unit box and sweeps 240°, leaving the bottom for the readout.
const SWEEP = 240;
const ARC_R = 87;
const RED = "255 77 94";
const CORE = "color-mix(in srgb, rgb(var(--neon)) 30%, white)";
const RED_CORE = `color-mix(in srgb, rgb(${RED}) 35%, white)`;
const NEEDLE = "M100 30 L102.8 100 L101.8 117 L98.2 117 L97.2 100 Z";

function clamp(value: number, lower: number, upper: number) {
  return Math.min(upper, Math.max(lower, value));
}

function decimalsOf(value: number) {
  return Math.min(2, (String(value).split(".")[1] ?? "").length);
}

function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [100 + radius * Math.cos(rad), 100 + radius * Math.sin(rad)] as const;
}

function arcPath(from: number, to: number, radius: number) {
  const [x1, y1] = polar(from, radius);
  const [x2, y2] = polar(to, radius);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// Printed scales use a true minus sign, not a hyphen.
const minus = (text: string) => text.replace(/^-/, "\u2212");

function trim(value: number) {
  return minus(String(Number(value.toFixed(2))));
}

export type GaugeZone = { from: number; to: number; color: NeonColor };

export interface GaugeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  value: number;
  min?: number;
  max?: number;
  /** Legend printed on the dial. Also names the meter. */
  label?: string;
  /** Printed under the readout and read after the value. */
  unit?: string;
  /** Number of numbered intervals on the scale. */
  ticks?: number;
  /** Everything from here to max is the red zone: printed red, and the arc burns red past it. */
  redline?: number;
  /** Colored bands printed inside the scale. The band holding the value lights up. */
  zones?: GaugeZone[];
  /** Formats the readout and the value read to screen readers. */
  formatValue?: (value: number) => string;
}

const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(
  (
    {
      className,
      style,
      color,
      size = "md",
      value: valueProp,
      min = 0,
      max = 100,
      label,
      unit,
      ticks = 10,
      redline,
      zones,
      formatValue,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const s = sizes[size];
    const reduceMotion = useReducedMotion();
    const value = clamp(valueProp, min, max);
    const range = max - min || 1;
    const decimals = decimalsOf(value);
    const format = (v: number) => {
      const shown = Number(v.toFixed(decimals));
      return formatValue ? formatValue(shown) : minus(shown.toFixed(decimals));
    };
    const fraction = (v: number) => (clamp(v, min, max) - min) / range;
    const angleOf = (v: number) => -SWEEP / 2 + fraction(v) * SWEEP;
    const red = redline !== undefined && redline < max ? clamp(redline, min, max) : undefined;

    // The spring drives the needle, the lit arc and the readout through direct
    // DOM writes. React renders the first value only, so it never fights the spring.
    const spring = useSpring(value, { stiffness: 150, damping: 13, mass: 1 });
    const [initial] = React.useState(value);
    const needleRef = React.useRef<SVGGElement>(null);
    const shadowRef = React.useRef<SVGGElement>(null);
    const arcRefs = React.useRef<(SVGPathElement | null)[]>([]);
    const redRefs = React.useRef<(SVGPathElement | null)[]>([]);
    const maskRef = React.useRef<SVGPathElement>(null);
    const readoutRef = React.useRef<SVGTextElement>(null);

    const draw = (v: number) => {
      const angle = angleOf(v);
      needleRef.current?.setAttribute("transform", `rotate(${angle.toFixed(2)} 100 100)`);
      shadowRef.current?.setAttribute("transform", `translate(1.5 3) rotate(${angle.toFixed(2)} 100 100)`);
      const lit = red === undefined ? fraction(v) : Math.min(fraction(v), fraction(red));
      for (const path of arcRefs.current) path?.setAttribute("stroke-dasharray", `${(lit * 1000).toFixed(1)} 1000`);
      maskRef.current?.setAttribute("stroke-dasharray", `${(fraction(v) * 1000).toFixed(1)} 1000`);
      if (red !== undefined) {
        const over = clamp((v - red) / (max - red || 1), 0, 1);
        for (const path of redRefs.current) path?.setAttribute("stroke-dasharray", `${(over * 1000).toFixed(1)} 1000`);
      }
      if (readoutRef.current) readoutRef.current.textContent = format(v);
    };
    const drawRef = React.useRef(draw);

    React.useEffect(() => {
      drawRef.current = draw;
      // Props like min, max or formatValue may have changed what the current position means.
      draw(spring.get());
    });

    React.useEffect(() => {
      if (reduceMotion) spring.jump(value);
      else spring.set(value);
    }, [spring, value, reduceMotion]);

    useMotionValueEvent(spring, "change", (v) => drawRef.current(v));

    const start = -SWEEP / 2;
    const end = SWEEP / 2;
    const initialLit = red === undefined ? fraction(initial) : Math.min(fraction(initial), fraction(red));
    const initialOver = red === undefined ? 0 : clamp((initial - red) / (max - red || 1), 0, 1);

    const intervals = Math.max(0, Math.round(ticks));
    const minorsPer = intervals > 10 ? 2 : 5;
    const marks: { angle: number; major: boolean; value: number }[] = [];
    if (intervals > 0) {
      const count = intervals * minorsPer;
      for (let i = 0; i <= count; i++) {
        const v = min + (i / count) * range;
        marks.push({ angle: angleOf(v), major: i % minorsPer === 0, value: v });
      }
    }
    // Fit the numerals to the room between them: shrink first, and once they would drop below a
    // readable size, number every 2nd (3rd, …) major tick instead, preferring a step that still
    // numbers the last one.
    const majors = marks.filter((mark) => mark.major);
    const spacing = intervals > 0 ? ((SWEEP / intervals) * Math.PI * 54) / 180 : 0;
    const longest = Math.max(1, ...majors.map((mark) => trim(mark.value).length));
    const fitFor = (step: number) => (spacing * step * 0.75) / (longest * NUMERAL_EM);
    const floor = Math.max(7, 7.5 / s.px);
    const steps = Array.from({ length: Math.max(1, intervals) }, (_, i) => i + 1).filter((step) => fitFor(step) >= floor);
    const step = steps.find((n) => intervals % n === 0) ?? steps[0] ?? Math.max(1, intervals);
    const numeralSize = clamp(fitFor(step), floor, s.numeral);
    const numerals = majors.filter((_, i) => i % step === 0);
    // Long legends ("×1000 r/min") shrink to stay between the end numerals.
    const legendSize = label ? Math.min(s.legend, 68 / (label.length * 0.9)) : s.legend;
    const isRed = (v: number) => red !== undefined && v >= red - 1e-9;
    const activeZone = zones?.findIndex((zone) => value >= Math.min(zone.from, zone.to) && value <= Math.max(zone.from, zone.to));
    const text = format(value);
    const maskId = `nk-gauge-${uid}-ticks`;

    return (
      <div
        ref={ref}
        role="meter"
        aria-label={ariaLabel ?? label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={unit ? `${text} ${unit}` : text}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative aspect-square shrink-0 select-none rounded-full",
          s.root,
          className,
        )}
        {...props}
      >
        {/* Bezel, face and printed scale */}
        <svg aria-hidden viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id={`nk-gauge-${uid}-bezel`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5b616d" />
              <stop offset="0.45" stopColor="#1d2027" />
              <stop offset="1" stopColor="#0a0b0e" />
            </linearGradient>
            <radialGradient id={`nk-gauge-${uid}-face`} cx="0.5" cy="0.42" r="0.6">
              <stop offset="0" stopColor="#12151c" />
              <stop offset="1" stopColor="#05060a" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="99" fill="#030405" />
          <circle cx="100" cy="100" r="97" fill="none" stroke={`url(#nk-gauge-${uid}-bezel)`} strokeWidth="3.5" />
          <circle cx="100" cy="100" r="95" fill={`url(#nk-gauge-${uid}-face)`} />
          <circle cx="100" cy="100" r="95" fill="none" stroke="rgb(0 0 0 / 0.8)" strokeWidth="1.5" />

          <path d={arcPath(start, end, ARC_R)} fill="none" strokeWidth="3.5" className="stroke-[rgb(var(--neon)/0.12)]" />

          {zones?.map((zone, i) => {
            const from = angleOf(Math.min(zone.from, zone.to));
            const to = angleOf(Math.max(zone.from, zone.to));
            if (to - from < 0.1) return null;
            const rgb = toNeonRgb(zone.color);
            const active = activeZone === i;
            return (
              <path
                key={i}
                d={arcPath(from, to, 80.5)}
                fill="none"
                strokeWidth="3"
                className="transition-[stroke] duration-300"
                style={{ stroke: `rgb(${rgb} / ${active ? 1 : 0.35})` }}
              />
            );
          })}
          {red !== undefined && (
            <path d={arcPath(angleOf(red), end, 80.5)} fill="none" strokeWidth="3" style={{ stroke: `rgb(${RED} / 0.6)` }} />
          )}

          {marks.map((mark, i) => {
            const [x1, y1] = polar(mark.angle, 76);
            const [x2, y2] = polar(mark.angle, mark.major ? 66 : 71);
            return (
              <line
                key={i}
                x1={x1.toFixed(2)}
                y1={y1.toFixed(2)}
                x2={x2.toFixed(2)}
                y2={y2.toFixed(2)}
                strokeWidth={mark.major ? 1.8 : 1}
                strokeLinecap="round"
                style={{ stroke: isRed(mark.value) ? `rgb(${RED} / 0.75)` : mark.major ? "rgb(255 255 255 / 0.4)" : "rgb(255 255 255 / 0.2)" }}
              />
            );
          })}
          {numerals.map((mark, i) => {
            const [x, y] = polar(mark.angle, 54);
            return (
              <text
                key={i}
                x={x.toFixed(2)}
                y={y.toFixed(2)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={numeralSize}
                fontWeight={500}
                style={{
                  fill: isRed(mark.value) ? `rgb(${RED} / 0.9)` : "rgb(255 255 255 / 0.62)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {trim(mark.value)}
              </text>
            );
          })}
          {label && (
            // Printed under the hub, clear of the numerals and the needle's sweep.
            <text
              x="100"
              y="125"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={legendSize}
              fontWeight={600}
              letterSpacing={legendSize * 0.2}
              style={{ fill: "rgb(255 255 255 / 0.5)" }}
            >
              {label.toUpperCase()}
            </text>
          )}
          {unit && (
            <text x="100" y={160 + s.legend} textAnchor="middle" fontSize={s.legend} fontWeight={500} letterSpacing={s.legend * 0.12} style={{ fill: "rgb(255 255 255 / 0.45)" }}>
              {unit}
            </text>
          )}
        </svg>

        {/* Everything that is lit: the arc, the ticks it has passed, and the readout */}
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="pointer-events-none absolute inset-0 size-full overflow-visible [filter:drop-shadow(0_0_2px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))))_drop-shadow(0_0_7px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))))]"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
              <path
                ref={maskRef}
                d={arcPath(start, end, 71)}
                pathLength={1000}
                fill="none"
                stroke="white"
                strokeWidth="14"
                strokeDasharray={`${(fraction(initial) * 1000).toFixed(1)} 1000`}
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            {marks.map((mark, i) => {
              if (isRed(mark.value)) return null;
              const [x1, y1] = polar(mark.angle, 76);
              const [x2, y2] = polar(mark.angle, mark.major ? 66 : 71);
              return (
                <line
                  key={i}
                  x1={x1.toFixed(2)}
                  y1={y1.toFixed(2)}
                  x2={x2.toFixed(2)}
                  y2={y2.toFixed(2)}
                  strokeWidth={mark.major ? 1.8 : 1}
                  strokeLinecap="round"
                  style={{ stroke: mark.major ? CORE : "rgb(var(--neon) / 0.8)" }}
                />
              );
            })}
          </g>
          {[
            { width: 3.5, stroke: "rgb(var(--neon))" },
            { width: 1.4, stroke: CORE },
          ].map((layer, i) => (
            <path
              key={i}
              ref={(node) => {
                arcRefs.current[i] = node;
              }}
              d={arcPath(start, end, ARC_R)}
              pathLength={1000}
              fill="none"
              strokeWidth={layer.width}
              strokeDasharray={`${(initialLit * 1000).toFixed(1)} 1000`}
              style={{ stroke: layer.stroke }}
            />
          ))}
          <text
            ref={readoutRef}
            x="100"
            y="150"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="22"
            fontWeight={600}
            letterSpacing="-0.3"
            style={{ fill: CORE, fontVariantNumeric: "tabular-nums" }}
          >
            {format(initial)}
          </text>
        </svg>

        {/* Past the redline the arc burns red */}
        {red !== undefined && (
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="pointer-events-none absolute inset-0 size-full overflow-visible [filter:drop-shadow(0_0_2px_rgb(255_77_94/var(--neon-glow,1)))_drop-shadow(0_0_7px_rgb(255_77_94/CALC(0.55*var(--neon-glow,1))))]"
          >
            {[
              { width: 3.5, stroke: `rgb(${RED})` },
              { width: 1.4, stroke: RED_CORE },
            ].map((layer, i) => (
              <path
                key={i}
                ref={(node) => {
                  redRefs.current[i] = node;
                }}
                d={arcPath(angleOf(red), end, ARC_R)}
                pathLength={1000}
                fill="none"
                strokeWidth={layer.width}
                strokeDasharray={`${(initialOver * 1000).toFixed(1)} 1000`}
                style={{ stroke: layer.stroke }}
              />
            ))}
          </svg>
        )}

        {/* The needle floats over the face and throws a shadow on it */}
        <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 size-full overflow-visible [filter:blur(1.5px)]">
          <g ref={shadowRef} transform={`translate(1.5 3) rotate(${angleOf(initial).toFixed(2)} 100 100)`}>
            <path d={NEEDLE} fill="rgb(0 0 0 / 0.6)" />
          </g>
        </svg>
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="pointer-events-none absolute inset-0 size-full overflow-visible [filter:drop-shadow(0_0_1.5px_rgb(var(--neon)/var(--neon-glow,1)))_drop-shadow(0_0_6px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]"
        >
          <g ref={needleRef} transform={`rotate(${angleOf(initial).toFixed(2)} 100 100)`}>
            <path d={NEEDLE} style={{ fill: "rgb(var(--neon))" }} />
            <path d="M100 32 L100.9 100 L99.1 100 Z" style={{ fill: CORE }} />
          </g>
        </svg>
        <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <circle cx="100" cy="100" r="9" fill="#0b0c10" stroke="rgb(0 0 0 / 0.8)" />
          <circle cx="100" cy="100" r="7" fill={`url(#nk-gauge-${uid}-bezel)`} />
          <circle cx="100" cy="100" r="2" fill="#05060a" />
        </svg>

        {/* Glass over the dial */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[3%] rounded-full bg-[linear-gradient(155deg,rgb(255_255_255/0.07),rgb(255_255_255/0.015)_38%,transparent_52%)]"
        />
      </div>
    );
  },
);
Gauge.displayName = "Gauge";

export { Gauge };
