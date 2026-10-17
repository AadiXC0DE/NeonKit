"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

export interface DonutChartDatum {
  label: string;
  value: number;
  /** Palette name or hex. The first segment defaults to `--neon`. */
  color?: NeonColor;
}

// Segments after the first fall back to these, in this order (the same as GlowChart).
const FALLBACK_COLORS = ["230 237 247", "251 191 36", "168 85 247", "52 211 153", "255 95 162", "79 139 255"];

const C = 50;
// Room left around the ring for the glow and the lift on the active segment.
const MARGIN = 4;

// Each tube draws on in turn round the ring, like the gas striking along it.
const css = `
@keyframes nk-donut-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes nk-donut-show { from { opacity: 0; } to { opacity: 1; } }
@keyframes nk-donut-strike { 0% { opacity: 0.35; } 35% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
.nk-donut-seg { transition: opacity 220ms cubic-bezier(0.23, 1, 0.32, 1), transform 260ms cubic-bezier(0.23, 1, 0.32, 1); }
.nk-donut-glow { transition: filter 220ms cubic-bezier(0.23, 1, 0.32, 1); }
[data-dim] > .nk-donut-seg:not([data-active]) { opacity: 0.22; }
[data-reveal="armed"] .nk-donut-draw { stroke-dasharray: 1 1; stroke-dashoffset: 1; }
[data-reveal="armed"] .nk-donut-fill, [data-reveal="armed"] .nk-donut-dot { opacity: 0; }
[data-reveal="play"] .nk-donut-draw { stroke-dasharray: 1 1; animation: nk-donut-draw var(--nk-dur) cubic-bezier(0.33, 0.6, 0.4, 1) var(--nk-delay) both; }
[data-reveal="play"] .nk-donut-fill, [data-reveal="play"] .nk-donut-dot { animation: nk-donut-show 320ms ease-out var(--nk-delay) both; }
[data-reveal="play"] .nk-donut-glow { animation: nk-donut-strike 420ms linear calc(var(--nk-delay) + var(--nk-dur)) both; }
@media (prefers-reduced-motion: reduce) {
  .nk-donut-seg, .nk-donut-glow { transition: none; }
  [data-reveal] .nk-donut-draw { stroke-dasharray: none; stroke-dashoffset: 0; animation: none; }
  [data-reveal] .nk-donut-fill, [data-reveal] .nk-donut-dot, [data-reveal] .nk-donut-glow { opacity: 1; animation: none; }
}
`;

const CORE = "color-mix(in srgb, rgb(var(--nk-seg)) 30%, white)";

function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)] as const;
}

const f = (n: number) => n.toFixed(3);

function arc(from: number, to: number, radius: number) {
  const [x1, y1] = polar(from, radius);
  const [x2, y2] = polar(to, radius);
  const large = to - from > 180 ? 1 : 0;
  return `M${f(x1)} ${f(y1)}A${radius} ${radius} 0 ${large} 1 ${f(x2)} ${f(y2)}`;
}

function wedge(from: number, to: number, radius: number) {
  if (to - from >= 359.99) {
    return `M${C} ${C - radius}A${radius} ${radius} 0 1 1 ${C} ${C + radius}A${radius} ${radius} 0 1 1 ${C} ${C - radius}Z`;
  }
  const [x1, y1] = polar(from, radius);
  const [x2, y2] = polar(to, radius);
  const large = to - from > 180 ? 1 : 0;
  return `M${C} ${C}L${f(x1)} ${f(y1)}A${radius} ${radius} 0 ${large} 1 ${f(x2)} ${f(y2)}Z`;
}

function defaultFormat(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatShare(share: number) {
  const percent = share * 100;
  if (percent > 0 && percent < 1) return "<1%";
  return `${percent < 10 ? percent.toFixed(1).replace(/\.0$/, "") : Math.round(percent)}%`;
}

function useInView(ref: React.RefObject<Element | null>, enabled: boolean) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setInView(true);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, enabled]);
  return inView;
}

export interface DonutChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  data: DonutChartDatum[];
  /** `donut` bends each segment into a tube; `pie` fills wedges of tinted glass edged with a tube. */
  variant?: "donut" | "pie";
  /** Diameter in pixels. */
  size?: number;
  /** Tube thickness as a share of the diameter, 0.03 to 0.2. */
  thickness?: number;
  /** Space between segments in pixels, on top of the rounded ends. */
  gap?: number;
  /** The whole the segments are part of. Anything left over shows as an unlit length of tube. */
  max?: number;
  /** What the chart measures. Captions the total and the data table, and leads the summary. */
  label?: string;
  /** What the unlit remainder is called in the legend and the table, when `max` leaves one. */
  remainderLabel?: string;
  /** Formats values in the centre, the legend, the table and announcements. */
  formatValue?: (value: number) => string;
  /** The segment that's lit, by index. `null` lights them all. */
  activeIndex?: number | null;
  defaultActiveIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  showLegend?: boolean;
  /** Caption under the centre value. Defaults to `label`; `null` leaves just the number. */
  centerLabel?: React.ReactNode;
  /** Hide the centre readout. Pies never show one. */
  hideCenter?: boolean;
  /** Draw the tubes on when the chart scrolls into view. */
  animate?: boolean;
  /** Palette name or hex for the first segment. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      className,
      style,
      data,
      variant = "donut",
      size = 220,
      thickness: thicknessProp = 0.075,
      gap = 3,
      max,
      label,
      remainderLabel = "Remaining",
      formatValue = defaultFormat,
      activeIndex: activeProp,
      defaultActiveIndex = null,
      onActiveIndexChange,
      showLegend = true,
      centerLabel,
      hideCenter = false,
      animate = true,
      color,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId();
    const plotRef = React.useRef<HTMLDivElement>(null);
    const inView = useInView(plotRef, animate);
    const [uncontrolled, setUncontrolled] = React.useState<number | null>(defaultActiveIndex);
    const active = activeProp !== undefined ? activeProp : uncontrolled;
    const keyboard = React.useRef(false);

    const setActive = (index: number | null) => {
      if (index === active) return;
      if (activeProp === undefined) setUncontrolled(index);
      onActiveIndexChange?.(index);
    };

    const pie = variant === "pie";
    const items = data.map((d, i) => ({
      ...d,
      value: Number.isFinite(d.value) ? Math.max(0, d.value) : 0,
      rgb: d.color ? toNeonRgb(d.color) : i === 0 ? null : FALLBACK_COLORS[(i - 1) % FALLBACK_COLORS.length],
    }));
    const sum = items.reduce((total, d) => total + d.value, 0);
    const whole = Math.max(sum, max ?? 0);
    const remainder = whole - sum;
    const thickness = Math.min(0.2, Math.max(0.03, thicknessProp)) * 100;
    const radius = pie ? C - MARGIN : C - MARGIN - thickness / 2;
    // Viewbox units per pixel, so gaps stay the same on screen at any size.
    const unit = 100 / size;
    const gapUnits = gap * unit;
    // Round ends reach half a tube past each end, so the gap has to clear them too.
    const capDegrees = pie ? 0 : ((thickness + gapUnits) / (2 * Math.PI * radius)) * 360;
    const pieGap = gapUnits;
    const shown = items.filter((d) => d.value > 0).length + (remainder > 0 ? 1 : 0);

    const spans = items.map((d) => (whole > 0 ? (d.value / whole) * 360 : 0));
    const starts = spans.map((_, i) => spans.slice(0, i).reduce((a, b) => a + b, 0));
    const cursor = spans.reduce((a, b) => a + b, 0);
    const segments = items.map((d, i) => {
      const span = spans[i];
      const start = starts[i];
      const single = shown === 1 && span > 0;
      const from = single ? 0 : start + capDegrees / 2;
      const to = single ? 360 : start + span - capDegrees / 2;
      const middle = start + span / 2;
      return { ...d, index: i, start, span, from, to, middle, share: whole > 0 ? d.value / whole : 0 };
    });
    const rest = remainder > 0 ? { from: cursor + capDegrees / 2, to: 360 - capDegrees / 2 } : null;

    const total = sum;
    const current = active !== null ? segments[active] : undefined;
    const summary = `${label ? `${label}: ` : ""}${segments
      .map((s) => `${s.label} ${formatValue(s.value)} (${formatShare(s.share)})`)
      .join(", ")}${remainder > 0 ? `, ${remainderLabel.toLowerCase()} ${formatValue(remainder)}` : ""}.`;
    const announcement = current ? `${current.label}: ${formatValue(current.value)}, ${formatShare(current.share)}` : "";

    const move = (index: number) => {
      const count = segments.length;
      if (!count) return;
      setActive(((index % count) + count) % count);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const from = active ?? -1;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          move(from + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          move(active === null ? segments.length - 1 : from - 1);
          break;
        case "Home":
          move(0);
          break;
        case "End":
          move(segments.length - 1);
          break;
        case "Escape":
          if (active === null) return;
          setActive(null);
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    const segVar = (s: { rgb: string | null }) =>
      ({ "--nk-seg": s.rgb ?? "var(--neon)" }) as React.CSSProperties;
    const reveal = animate ? (inView ? "play" : "armed") : undefined;
    const sweep = 1100;
    const timing = (start: number, span: number) =>
      ({
        "--nk-delay": `${Math.round((start / 360) * sweep)}ms`,
        "--nk-dur": `${Math.max(140, Math.round((span / 360) * sweep))}ms`,
      }) as React.CSSProperties;

    const glow = (lit: boolean) =>
      lit
        ? `drop-shadow(0 0 ${f(0.9 * unit * 1.6)}px rgb(var(--nk-seg) / var(--neon-glow, 1))) drop-shadow(0 0 ${f(unit * 9)}px rgb(var(--nk-seg) / calc(0.8 * var(--neon-glow, 1))))`
        : `drop-shadow(0 0 ${f(0.9 * unit * 1.2)}px rgb(var(--nk-seg) / calc(0.9 * var(--neon-glow, 1)))) drop-shadow(0 0 ${f(unit * 6)}px rgb(var(--nk-seg) / calc(0.5 * var(--neon-glow, 1))))`;

    const valueSize = Math.max(16, Math.round(size * 0.13));
    const caption = current
      ? size < 150
        ? formatShare(current.share)
        : `${current.label} · ${formatShare(current.share)}`
      : centerLabel !== undefined
        ? centerLabel
        : (label ?? "Total");

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "flex flex-wrap items-center gap-x-10 gap-y-6",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <div
          ref={plotRef}
          role="img"
          tabIndex={0}
          aria-label={ariaLabel ?? summary}
          aria-describedby={`${uid}-hint`}
          data-reveal={reveal}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            let visible = true;
            try {
              visible = event.currentTarget.matches(":focus-visible");
            } catch {
              visible = true;
            }
            if (visible && active === null && segments.length) {
              keyboard.current = true;
              setActive(0);
            }
          }}
          onBlur={() => {
            if (keyboard.current) setActive(null);
            keyboard.current = false;
          }}
          onPointerLeave={() => {
            if (!keyboard.current) setActive(null);
          }}
          className={cn(
            "relative shrink-0 select-none rounded-full outline-none",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]",
          )}
          style={{ width: size, height: size }}
        >
          <svg aria-hidden viewBox="0 0 100 100" className="block size-full overflow-visible">
            {/* The unlit run of tube for whatever `max` leaves over */}
            {rest && !pie && rest.to > rest.from && (
              <g>
                <path d={arc(rest.from, rest.to, radius)} fill="none" strokeWidth={thickness} strokeLinecap="round" stroke="rgb(255 255 255 / 0.05)" />
                <path
                  d={arc(rest.from, rest.to, radius)}
                  fill="none"
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  stroke="rgb(var(--neon) / 0.07)"
                />
                <path
                  d={arc(rest.from, rest.to, radius - thickness * 0.22)}
                  fill="none"
                  strokeWidth={Math.max(0.35, thickness * 0.1)}
                  strokeLinecap="round"
                  stroke="rgb(255 255 255 / 0.06)"
                />
              </g>
            )}
            {rest && pie && <path d={wedge(cursor, 360, radius)} fill="rgb(255 255 255 / 0.03)" stroke="rgb(255 255 255 / 0.08)" strokeWidth={0.4} />}

            <g data-dim={active !== null ? "" : undefined}>
              {segments.map((s) => {
                if (s.span <= 0) return null;
                const isActive = active === s.index;
                const [dx, dy] = polar(s.middle, isActive ? 1.6 : 0);
                const lift = `translate(${f(dx - C)}px, ${f(dy - C)}px)`;
                const vars = { ...segVar(s), ...timing(s.start, s.span), transform: lift };
                if (pie) {
                  // Each wedge slides out along its middle until its edges clear their neighbours by `gap`.
                  const half = (Math.min(s.span, 180) * Math.PI) / 360;
                  const push = s.span >= 359.99 ? 0 : Math.min(pieGap * 3, pieGap / 2 / Math.max(0.05, Math.sin(half)));
                  const [px, py] = polar(s.middle, push);
                  const r = radius - push;
                  return (
                    <g
                      key={s.index}
                      className="nk-donut-seg"
                      data-active={isActive ? "" : undefined}
                      style={vars}
                      onPointerEnter={() => {
                        keyboard.current = false;
                        setActive(s.index);
                      }}
                    >
                      <g transform={`translate(${f(px - C)} ${f(py - C)})`}>
                        <path
                          className="nk-donut-fill"
                          d={wedge(s.start, s.start + s.span, r)}
                          strokeLinejoin="round"
                          strokeWidth={0.5}
                          style={{
                            fill: `rgb(var(--nk-seg) / ${isActive ? 0.3 : 0.15})`,
                            stroke: "rgb(var(--nk-seg) / 0.4)",
                            transition: "fill 220ms cubic-bezier(0.23,1,0.32,1)",
                          }}
                        />
                        <g className="nk-donut-glow" style={{ filter: glow(isActive) }}>
                          <path
                            className="nk-donut-draw"
                            pathLength={1}
                            d={s.span >= 359.99 ? wedge(0, 360, r) : arc(s.start + 0.4, s.start + s.span - 0.4, r)}
                            fill="none"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            style={{ stroke: "rgb(var(--nk-seg))" }}
                          />
                          <path
                            className="nk-donut-draw"
                            pathLength={1}
                            d={s.span >= 359.99 ? wedge(0, 360, r) : arc(s.start + 0.4, s.start + s.span - 0.4, r)}
                            fill="none"
                            strokeWidth={0.8}
                            strokeLinecap="round"
                            style={{ stroke: CORE }}
                          />
                        </g>
                      </g>
                    </g>
                  );
                }
                // Too short to bend: the tube shrinks to a bead.
                const bead = s.to - s.from <= 0.01;
                // A bead never grows past the arc it stands for, so neighbouring beads keep their gap.
                const room = (s.span / 360) * 2 * Math.PI * radius - gapUnits;
                const beadRadius = Math.min(thickness / 2, Math.max(0.9, room / 2));
                const [bx, by] = polar(s.middle, radius);
                const ring = s.to - s.from >= 359.99;
                const d = bead || ring ? "" : arc(s.from, s.to, radius);
                return (
                  <g
                    key={s.index}
                    className="nk-donut-seg"
                    data-active={isActive ? "" : undefined}
                    style={vars}
                    onPointerEnter={() => {
                      keyboard.current = false;
                      setActive(s.index);
                    }}
                  >
                    {/* A wider invisible stroke makes thin tubes easy to hover */}
                    {bead ? (
                      <circle cx={f(bx)} cy={f(by)} r={thickness} fill="transparent" />
                    ) : ring ? (
                      <circle cx={C} cy={C} r={radius} fill="none" stroke="transparent" strokeWidth={thickness + 6} />
                    ) : (
                      <path d={d} fill="none" stroke="transparent" strokeWidth={thickness + 6} />
                    )}
                    <g className="nk-donut-glow" style={{ filter: glow(isActive) }}>
                      {bead ? (
                        <g className="nk-donut-dot">
                          <circle cx={f(bx)} cy={f(by)} r={beadRadius} style={{ fill: "rgb(var(--nk-seg))" }} />
                          <circle cx={f(bx)} cy={f(by)} r={beadRadius * 0.4} style={{ fill: CORE }} />
                        </g>
                      ) : ring ? (
                        <>
                          <circle className="nk-donut-draw" pathLength={1} cx={C} cy={C} r={radius} fill="none" strokeWidth={thickness} style={{ stroke: "rgb(var(--nk-seg))" }} transform={`rotate(-90 ${C} ${C})`} />
                          <circle className="nk-donut-draw" pathLength={1} cx={C} cy={C} r={radius} fill="none" strokeWidth={thickness * 0.4} style={{ stroke: CORE }} transform={`rotate(-90 ${C} ${C})`} />
                        </>
                      ) : (
                        <>
                          <path className="nk-donut-draw" pathLength={1} d={d} fill="none" strokeWidth={thickness} strokeLinecap="round" style={{ stroke: "rgb(var(--nk-seg))" }} />
                          <path className="nk-donut-draw" pathLength={1} d={d} fill="none" strokeWidth={thickness * 0.4} strokeLinecap="round" style={{ stroke: CORE }} />
                        </>
                      )}
                    </g>
                    {/* Glass catching light along the inside of the bend */}
                    {!bead && (
                      <path
                        className="nk-donut-draw"
                        pathLength={1}
                        d={ring ? arc(0, 359.99, radius - thickness * 0.28) : arc(s.from, s.to, radius - thickness * 0.28)}
                        fill="none"
                        strokeWidth={Math.max(0.3, thickness * 0.08)}
                        strokeLinecap="round"
                        stroke="rgb(255 255 255 / 0.22)"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {!pie && !hideCenter && (
            <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[18%] text-center">
              <span
                className="block max-w-full truncate font-semibold leading-none tracking-[-0.02em] text-white/95"
                style={{ fontSize: valueSize }}
              >
                {formatValue(current ? current.value : total)}
              </span>
              {caption != null && caption !== "" && (
                <span
                  className="mt-1.5 block max-w-full truncate text-white/55"
                  style={{ fontSize: Math.max(11, Math.min(14, Math.round(size * 0.058))) }}
                >
                  {caption}
                </span>
              )}
            </div>
          )}
        </div>

        {showLegend && (
          <ul aria-hidden className="flex min-w-[200px] flex-1 flex-col gap-0.5" onPointerLeave={() => setActive(null)}>
            {segments.map((s) => (
              <li
                key={s.index}
                onPointerEnter={() => {
                  keyboard.current = false;
                  setActive(s.index);
                }}
                style={segVar(s)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5 text-[14px] transition-[opacity,background-color] duration-200",
                  active === s.index && "bg-white/[0.04]",
                  active !== null && active !== s.index && "opacity-45",
                )}
              >
                <span
                  className="h-[3px] w-3.5 shrink-0 rounded-full"
                  style={{ background: CORE, boxShadow: "0 0 0 0.5px rgb(var(--nk-seg)), 0 0 6px rgb(var(--nk-seg) / calc(0.8 * var(--neon-glow, 1)))" }}
                />
                <span className="min-w-0 flex-1 truncate text-white/80">{s.label}</span>
                <span className="tabular-nums text-white/90">{formatValue(s.value)}</span>
                <span className="w-11 text-right tabular-nums text-white/50">{formatShare(s.share)}</span>
              </li>
            ))}
            {remainder > 0 && (
              <li className={cn("flex items-center gap-3 px-2 py-1.5 text-[14px] transition-opacity duration-200", active !== null && "opacity-45")}>
                <span className="h-[3px] w-3.5 shrink-0 rounded-full bg-white/15" />
                <span className="min-w-0 flex-1 truncate text-white/55">{remainderLabel}</span>
                <span className="tabular-nums text-white/60">{formatValue(remainder)}</span>
                <span className="w-11 text-right tabular-nums text-white/50">{formatShare(remainder / whole)}</span>
              </li>
            )}
          </ul>
        )}

        <span id={`${uid}-hint`} className="sr-only">
          Use the arrow keys to read each segment.
        </span>
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
        <table className="sr-only">
          <caption>{label ?? "Chart data"}</caption>
          <thead>
            <tr>
              <th scope="col">Segment</th>
              <th scope="col">Value</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.index}>
                <th scope="row">{s.label}</th>
                <td>{formatValue(s.value)}</td>
                <td>{formatShare(s.share)}</td>
              </tr>
            ))}
            {remainder > 0 && (
              <tr>
                <th scope="row">{remainderLabel}</th>
                <td>{formatValue(remainder)}</td>
                <td>{formatShare(remainder / whole)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  },
);
DonutChart.displayName = "DonutChart";

export { DonutChart };
