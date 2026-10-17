"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// Cells strike instantly and decay, like LEDs behind a diffuser. The last lit cell blinks when critical.
const css = `
.nk-ctx-cell{background-color:color-mix(in srgb,var(--c) 13%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255/.03),inset 0 0 0 1px color-mix(in srgb,var(--c) 7%,transparent);transition:background-color 220ms ease-out,box-shadow 220ms ease-out,opacity 160ms ease-out}
.nk-ctx-cell[data-lit]{background-color:color-mix(in srgb,var(--c) 84%,white);box-shadow:inset 0 0 2px 1px rgb(255 255 255 / calc(.35 * var(--neon-glow, 1))),0 0 4px color-mix(in srgb, color-mix(in srgb,var(--c) 85%,transparent) calc(clamp(0, var(--neon-glow, 1), 1) * 100%), transparent),0 0 12px color-mix(in srgb, color-mix(in srgb,var(--c) 40%,transparent) calc(clamp(0, var(--neon-glow, 1), 1) * 100%), transparent);transition-duration:0ms,0ms,160ms}
.nk-ctx-cell[data-partial]{opacity:var(--f)}
.nk-ctx[data-focus] .nk-ctx-cell[data-lit]:not([data-focused]){opacity:.28}
@keyframes nk-ctx-blink{0%,55%{opacity:1}56%,100%{opacity:.18}}
.nk-ctx-cell[data-blink]{animation:nk-ctx-blink 1.1s steps(1,end) infinite}
@media (prefers-reduced-motion:reduce){.nk-ctx-cell{transition:none}.nk-ctx-cell[data-blink]{animation:none}}
`;

const AMBER = toNeonRgb("amber");
const RED = toNeonRgb("red");

export interface ContextPart {
  /** "System prompt", "Conversation", "Files", "Tools". */
  label: string;
  tokens: number;
  /** Palette name or hex. Parts without one take shades of the meter's color. */
  color?: NeonColor;
}

export type ContextStatus = "ok" | "warn" | "critical" | "full";

// The first part reads as fixed overhead in white; the rest are shades of --neon.
const SHADES = [
  "rgb(214 221 233)",
  "rgb(var(--neon))",
  "color-mix(in oklab, rgb(var(--neon)) 52%, rgb(244 247 252))",
  "color-mix(in oklab, rgb(var(--neon)) 66%, rgb(36 42 58))",
  "color-mix(in oklab, rgb(var(--neon)) 70%, rgb(255 138 61))",
];

function tintFor(part: ContextPart, index: number, count: number) {
  if (part.color) return `rgb(${toNeonRgb(part.color)})`;
  if (count === 1) return "rgb(var(--neon))";
  return SHADES[index % SHADES.length];
}

/** 48210 → "48.2k", 142300 → "142.3k", 200000 → "200k", 1048576 → "1.05M". */
function formatTokens(tokens: number) {
  const n = Math.max(0, Math.round(tokens));
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${Number(k.toFixed(1))}k`;
  }
  const m = n / 1_000_000;
  return `${Number(m.toFixed(m >= 10 ? 1 : 2))}M`;
}

const exact = new Intl.NumberFormat("en-US");

type Cell = { tint: string; part: number; lit: boolean; fraction: number };

/**
 * Splits `cells` LEDs between the parts by largest remainder, so the lit count always matches the total
 * and any part with tokens keeps at least one cell. The cell the total ends in lights partially.
 */
function layoutCells(parts: ContextPart[], tints: string[], limit: number, cells: number): Cell[] {
  const units = parts.map((part) => (Math.max(0, part.tokens) / limit) * cells);
  const total = Math.min(cells, units.reduce((sum, u) => sum + u, 0));
  let whole = Math.floor(total + 1e-9);
  const fraction = total - whole;
  if (fraction > 0.92) whole = Math.min(cells, whole + 1);
  const counts = units.map((u) => Math.floor(u));
  const nonzero = units.map((u) => u > 0);
  let assigned = counts.reduce((sum, c) => sum + c, 0);
  // Guarantee every part one cell if there's room.
  if (whole >= nonzero.filter(Boolean).length) {
    counts.forEach((c, i) => {
      if (nonzero[i] && c === 0) {
        counts[i] = 1;
        assigned += 1;
      }
    });
  }
  const order = units
    .map((u, i) => ({ i, r: u - Math.floor(u) }))
    .filter(({ i }) => nonzero[i])
    .sort((a, b) => b.r - a.r);
  for (let k = 0; assigned < whole && order.length; k = (k + 1) % order.length) {
    counts[order[k].i] += 1;
    assigned += 1;
  }
  while (assigned > whole) {
    // Take back from the largest part.
    let largest = 0;
    counts.forEach((c, i) => (c > counts[largest] ? (largest = i) : undefined));
    counts[largest] -= 1;
    assigned -= 1;
  }

  const out: Cell[] = [];
  counts.forEach((count, part) => {
    for (let j = 0; j < count; j++) out.push({ tint: tints[part], part, lit: true, fraction: 1 });
  });
  if (out.length < cells && fraction >= 0.08 && fraction <= 0.92) {
    const last = Math.max(0, parts.length - 1 - [...units].reverse().findIndex((u) => u > 0));
    out.push({ tint: tints[last] ?? tints[0], part: last, lit: true, fraction: 0.35 + fraction * 0.55 });
  }
  while (out.length < cells) out.push({ tint: "rgb(255 255 255)", part: -1, lit: false, fraction: 0 });
  return out;
}

const sizes = {
  sm: { cells: 10, cellW: "w-[3px]", cellH: "h-3", gap: "gap-[2px]", housing: "p-[3px] rounded-[4px]" },
  md: { cells: 24, cellW: "flex-1", cellH: "h-2", gap: "gap-[2px]", housing: "p-[3px] rounded-[5px]" },
  lg: { cells: 40, cellW: "flex-1", cellH: "h-4", gap: "gap-[3px]", housing: "p-1 rounded-[6px]" },
} as const;

export interface ContextMeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** What fills the window, in order. Free space is what's left of `limit`. */
  parts?: ContextPart[];
  /** Total tokens used, when you don't have a breakdown. Ignored if `parts` is set. */
  used?: number;
  /** The window size in tokens. */
  limit: number;
  /** sm sits in a composer toolbar, md in a sidebar, lg in a settings panel. */
  size?: "sm" | "md" | "lg";
  /** Fraction where it turns amber. */
  warnAt?: number;
  /** Fraction where it turns red and the last cell blinks. */
  criticalAt?: number;
  /** sm and md only: the meter becomes a button that opens the full breakdown. */
  breakdown?: boolean;
  /** sm only: what the readout prints. */
  readout?: "tokens" | "percent" | "none";
  /** Names the meter. */
  label?: string;
  /** A line under the breakdown, such as when older turns get summarised. */
  note?: React.ReactNode;
  /** Replaces the 48.2k formatting. */
  format?: (tokens: number) => string;
  /** LED count. Defaults to 10, 24 and 40 by size. */
  cells?: number;
  color?: NeonColor;
}

function statusOf(ratio: number, warnAt: number, criticalAt: number): ContextStatus {
  if (ratio >= 1) return "full";
  if (ratio >= criticalAt) return "critical";
  if (ratio >= warnAt) return "warn";
  return "ok";
}

const statusText: Record<ContextStatus, string> = {
  ok: "",
  warn: "Near the limit",
  critical: "Almost full",
  full: "Full",
};

const statusTone: Record<ContextStatus, string> = {
  ok: "text-white/55",
  warn: "text-[#fbbf24]",
  critical: "text-[#ff4d5e]",
  full: "text-[#ff4d5e]",
};

interface Reading {
  parts: ContextPart[];
  tints: string[];
  used: number;
  free: number;
  ratio: number;
  percent: number;
  status: ContextStatus;
}

function useReading(
  partsProp: ContextPart[] | undefined,
  used: number | undefined,
  limit: number,
  warnAt: number,
  criticalAt: number,
): Reading {
  const parts = partsProp ?? [{ label: "Used", tokens: used ?? 0 }];
  const total = parts.reduce((sum, part) => sum + Math.max(0, part.tokens), 0);
  const safeLimit = Math.max(1, limit);
  const ratio = total / safeLimit;
  return {
    parts,
    tints: parts.map((part, i) => tintFor(part, i, parts.length)),
    used: total,
    free: Math.max(0, safeLimit - total),
    ratio,
    // Never print 100% until it's actually full.
    percent: ratio >= 1 ? 100 : Math.min(99, Math.floor(ratio * 100)),
    status: statusOf(ratio, warnAt, criticalAt),
  };
}

function Cells({
  reading,
  limit,
  count,
  size,
  warnAt,
  criticalAt,
  stateTint,
  focus,
  onFocusPart,
}: {
  reading: Reading;
  limit: number;
  count: number;
  size: keyof typeof sizes;
  warnAt: number;
  criticalAt: number;
  /** Paint every lit cell in the status color instead of by part. */
  stateTint: boolean;
  focus: number | null;
  onFocusPart?: (part: number | null) => void;
}) {
  const s = sizes[size];
  const cells = React.useMemo(
    () => layoutCells(reading.parts, reading.tints, Math.max(1, limit), count),
    [reading.parts, reading.tints, limit, count],
  );
  const litCount = cells.filter((cell) => cell.lit).length;
  const stateColor =
    reading.status === "ok" ? "rgb(var(--neon))" : reading.status === "warn" ? `rgb(${AMBER})` : `rgb(${RED})`;
  const blinkAt = reading.status === "critical" || reading.status === "full" ? litCount - 1 : -1;

  return (
    <span
      aria-hidden
      data-focus={focus !== null ? "" : undefined}
      onPointerLeave={onFocusPart ? () => onFocusPart(null) : undefined}
      className={cn(
        "nk-ctx flex min-w-0 border border-white/10 bg-[#07080c]",
        "shadow-[inset_0_1px_3px_rgb(0_0_0/0.7),0_1px_0_rgb(255_255_255/0.03)]",
        s.housing,
        s.gap,
        size !== "sm" && "w-full",
      )}
    >
      {cells.map((cell, i) => {
        const at = (i + 0.5) / count;
        // Unlit cells past the thresholds are printed in the zone's color, like the red line on a gauge.
        const zone = at >= criticalAt ? `rgb(${RED})` : at >= warnAt ? `rgb(${AMBER})` : "rgb(255 255 255)";
        const tint = cell.lit ? (stateTint ? stateColor : cell.tint) : zone;
        return (
          <span
            key={i}
            data-lit={cell.lit ? "" : undefined}
            data-partial={cell.lit && cell.fraction < 1 ? "" : undefined}
            data-focused={focus !== null && cell.part === focus ? "" : undefined}
            data-blink={i === blinkAt ? "" : undefined}
            onPointerEnter={onFocusPart && cell.lit ? () => onFocusPart(cell.part) : undefined}
            style={{ "--c": tint, "--f": cell.fraction } as React.CSSProperties}
            className={cn("nk-ctx-cell min-w-0 rounded-[1.5px]", s.cellW, s.cellH)}
          />
        );
      })}
    </span>
  );
}

/** The large layout: readout, bar, scale and the table of parts. Also the content of the breakdown popover. */
function Panel({
  reading,
  limit,
  cells,
  warnAt,
  criticalAt,
  label,
  note,
  format,
  headingId,
}: {
  reading: Reading;
  limit: number;
  cells: number;
  warnAt: number;
  criticalAt: number;
  label: string;
  note?: React.ReactNode;
  format: (tokens: number) => string;
  headingId?: string;
}) {
  const [focus, setFocus] = React.useState<number | null>(null);
  const status = reading.status;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-1">
        <p id={headingId} className="col-span-2 text-[13.5px] font-medium text-white/80">
          {label}
        </p>
        <p className="flex min-w-0 items-baseline gap-2 font-mono tabular-nums">
          <span className={cn("text-[30px] leading-none tracking-[-0.03em]", status === "ok" ? "text-white/95" : statusTone[status])}>
            {format(reading.used)}
          </span>
          <span className="text-[13px] text-white/45">/ {format(limit)}</span>
        </p>
        <p className="text-right text-[13px] leading-5">
          {status === "ok" ? (
            <span className="text-white/55">
              <span className="font-mono tabular-nums text-white/80">{format(reading.free)}</span> free
            </span>
          ) : (
            <span className={statusTone[status]}>
              {statusText[status]} <span className="font-mono tabular-nums">{reading.percent}%</span>
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-1.5">
        <Cells
          reading={reading}
          limit={limit}
          count={cells}
          size="lg"
          warnAt={warnAt}
          criticalAt={criticalAt}
          stateTint={false}
          focus={focus}
          onFocusPart={setFocus}
        />
        <div aria-hidden className="relative h-4 font-mono text-[10.5px] tabular-nums text-white/35">
          {ticks.map((tick) => (
            <span
              key={tick}
              className={cn(
                "absolute top-0 flex flex-col gap-0.5",
                tick === 0 ? "left-0 items-start" : tick === 1 ? "right-0 items-end" : "-translate-x-1/2 items-center",
              )}
              style={tick > 0 && tick < 1 ? { left: `${tick * 100}%` } : undefined}
            >
              {format(limit * tick)}
            </span>
          ))}
        </div>
      </div>

      <table className="w-full border-collapse text-[13px]">
        <caption className="sr-only">What fills the {label.toLowerCase()}</caption>
        <tbody>
          {reading.parts.map((part, i) => (
            <tr
              key={`${i}-${part.label}`}
              onPointerEnter={() => setFocus(i)}
              onPointerLeave={() => setFocus(null)}
              data-focused={focus === i ? "" : undefined}
              className="group/row text-white/70 transition-colors duration-150 data-[focused]:text-white/95"
            >
              <th scope="row" className="py-[5px] pr-3 text-left font-normal">
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    data-lit=""
                    style={{ "--c": reading.tints[i] } as React.CSSProperties}
                    className="nk-ctx-cell h-3 w-[7px] shrink-0 rounded-[1.5px]"
                  />
                  <span className="truncate">{part.label}</span>
                </span>
              </th>
              <td className="py-[5px] text-right font-mono tabular-nums text-white/80 group-data-[focused]/row:text-white">
                <span aria-hidden>{format(part.tokens)}</span>
                <span className="sr-only">{exact.format(part.tokens)} tokens</span>
              </td>
              <td className="w-14 py-[5px] text-right font-mono tabular-nums text-white/45">
                {formatShare(part.tokens / Math.max(1, limit))}
              </td>
            </tr>
          ))}
          <tr className="border-t border-white/[0.07] text-white/50">
            <th scope="row" className="pb-[3px] pr-3 pt-2 text-left font-normal">
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  style={{ "--c": "rgb(255 255 255)" } as React.CSSProperties}
                  className="nk-ctx-cell h-3 w-[7px] shrink-0 rounded-[1.5px]"
                />
                Free
              </span>
            </th>
            <td className="pb-[3px] pt-2 text-right font-mono tabular-nums">
              <span aria-hidden>{format(reading.free)}</span>
              <span className="sr-only">{exact.format(reading.free)} tokens</span>
            </td>
            <td className="w-14 pb-[3px] pt-2 text-right font-mono tabular-nums text-white/40">
              {formatShare(reading.free / Math.max(1, limit))}
            </td>
          </tr>
        </tbody>
      </table>

      {note && <p className="text-[13px] leading-relaxed text-white/50">{note}</p>}
    </div>
  );
}

function formatShare(share: number) {
  const percent = share * 100;
  if (percent > 0 && percent < 1) return "<1%";
  return `${Math.round(percent)}%`;
}

const ContextMeter = React.forwardRef<HTMLDivElement, ContextMeterProps>(
  (
    {
      parts: partsProp,
      used,
      limit,
      size = "md",
      warnAt = 0.8,
      criticalAt = 0.95,
      breakdown = false,
      readout = "tokens",
      label = "Context window",
      note,
      format = formatTokens,
      cells,
      color,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const reading = useReading(partsProp, used, limit, warnAt, criticalAt);
    const count = Math.max(4, Math.round(cells ?? sizes[size].cells));
    const headingId = React.useId();
    const statusSuffix = reading.status === "ok" ? "" : `, ${statusText[reading.status].toLowerCase()}`;
    const valueText = `${reading.percent}% used, ${format(reading.used)} of ${format(limit)} tokens${statusSuffix}`;
    // The trigger's name starts with the readout it shows, so voice control users can say what they see.
    const triggerName =
      size !== "sm" || readout === "tokens"
        ? `${label}, ${format(reading.used)} / ${format(limit)} tokens, ${reading.percent}% used${statusSuffix}. Show breakdown`
        : `${label}: ${valueText}. Show breakdown`;

    // Announce crossings into a warning zone, not the reading on mount.
    const [announcement, setAnnouncement] = React.useState("");
    const lastStatus = React.useRef(reading.status);
    React.useEffect(() => {
      const previous = lastStatus.current;
      lastStatus.current = reading.status;
      if (previous === reading.status) return;
      const rank = { ok: 0, warn: 1, critical: 2, full: 3 };
      setAnnouncement(rank[reading.status] > rank[previous] ? `${label} ${reading.percent}% full` : "");
    }, [reading.status, reading.percent, label]);

    const live = (
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    );

    const rootClass = cn("[--neon:var(--neon-accent,34_211_238)]", "text-white/90");

    if (size === "lg") {
      return (
        <div
          ref={ref}
          role="meter"
          aria-labelledby={headingId}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(reading.used, limit)}
          aria-valuetext={valueText}
          data-status={reading.status}
          style={neonVars(color, style)}
          className={cn(rootClass, "w-full min-w-0", className)}
          {...props}
        >
          <style href="nk-context-meter" precedence="nk">{css}</style>
          <Panel
            reading={reading}
            limit={limit}
            cells={cells ?? sizes.lg.cells}
            warnAt={warnAt}
            criticalAt={criticalAt}
            label={label}
            note={note}
            format={format}
            headingId={headingId}
          />
          {live}
        </div>
      );
    }

    const compact =
      size === "sm" ? (
        <>
          <Cells
            reading={reading}
            limit={limit}
            count={count}
            size="sm"
            warnAt={warnAt}
            criticalAt={criticalAt}
            stateTint
            focus={null}
          />
          {readout !== "none" && (
            <span
              aria-hidden
              className={cn(
                "whitespace-nowrap font-mono text-[12px] tabular-nums leading-none",
                reading.status === "ok" ? "text-white/75" : statusTone[reading.status],
              )}
            >
              {readout === "percent" ? (
                `${reading.percent}%`
              ) : (
                <>
                  {format(reading.used)}
                  <span className={reading.status === "ok" ? "text-white/40" : "opacity-60"}> / {format(limit)}</span>
                </>
              )}
            </span>
          )}
        </>
      ) : (
        <span className="grid w-full min-w-0 gap-2">
          <span aria-hidden className="flex min-w-0 items-baseline justify-between gap-3 text-[13px] leading-5">
            <span className="truncate text-white/70">{label}</span>
            <span
              className={cn(
                "shrink-0 font-mono text-[12px] tabular-nums",
                reading.status === "ok" ? "text-white/75" : statusTone[reading.status],
              )}
            >
              {format(reading.used)}
              <span className={reading.status === "ok" ? "text-white/40" : "opacity-60"}> / {format(limit)}</span>
            </span>
          </span>
          <Cells
            reading={reading}
            limit={limit}
            count={count}
            size="md"
            warnAt={warnAt}
            criticalAt={criticalAt}
            stateTint={false}
            focus={null}
          />
        </span>
      );

    if (!breakdown) {
      return (
        <div
          ref={ref}
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(reading.used, limit)}
          aria-valuetext={valueText}
          data-status={reading.status}
          style={neonVars(color, style)}
          className={cn(
            rootClass,
            size === "sm" ? "inline-flex h-8 items-center gap-2 px-1.5" : "flex w-full min-w-0",
            className,
          )}
          {...props}
        >
          <style href="nk-context-meter" precedence="nk">{css}</style>
          {compact}
          {live}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        data-status={reading.status}
        style={neonVars(color, style)}
        className={cn(rootClass, size === "sm" ? "inline-flex" : "flex w-full min-w-0", className)}
        {...props}
      >
        <style href="nk-context-meter" precedence="nk">{css}</style>
        <Popover>
          <PopoverTrigger
            aria-label={triggerName}
            className={cn(
              "cursor-pointer outline-none transition-[background-color,transform] duration-150 ease-out",
              "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0c12]",
              size === "sm"
                ? "inline-flex h-8 items-center gap-2 rounded-lg px-2 hover:bg-white/[0.06] active:scale-[0.97] data-[state=open]:bg-white/[0.06]"
                : "-m-2 flex w-[calc(100%+16px)] min-w-0 rounded-[10px] p-2 text-left hover:bg-white/[0.04] data-[state=open]:bg-white/[0.04]",
            )}
          >
            {compact}
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align={size === "sm" ? "start" : "center"}
            aria-label={label}
            initialFocus="content"
            className="w-[min(22rem,calc(100vw-24px))] p-4"
          >
            <Panel
              reading={reading}
              limit={limit}
              cells={cells && cells > 24 ? cells : sizes.lg.cells}
              warnAt={warnAt}
              criticalAt={criticalAt}
              label={label}
              note={note}
              format={format}
            />
          </PopoverContent>
        </Popover>
        {live}
      </div>
    );
  },
);
ContextMeter.displayName = "ContextMeter";

export { ContextMeter, formatTokens };
