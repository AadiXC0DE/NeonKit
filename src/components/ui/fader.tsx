"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Everything inside the strip is sized in em, so one font size scales the hardware.
const sizes = {
  sm: { root: "text-[12px]", label: "text-[10px]", value: "text-[11px]" },
  md: { root: "text-[14px]", label: "text-[10px]", value: "text-xs" },
  lg: { root: "text-[16px]", label: "text-[11px]", value: "text-[13px]" },
} as const;

const CORE = "color-mix(in srgb, rgb(var(--neon)) 30%, white)";
const METER_SEGMENTS = 18;
const AMBER = "251 191 36";
const RED = "255 77 94";

const settleClass = {
  none: "",
  ease: "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
  glide: "transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
} as const;

function clamp(value: number, lower: number, upper: number) {
  return Math.min(upper, Math.max(lower, value));
}

function decimalsOf(value: number) {
  return (String(value).split(".")[1] ?? "").length;
}

export type FaderTick = number | { value: number; label?: React.ReactNode | null };

export interface FaderProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "defaultValue" | "onChange" | "children"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Fires once the cap is let go or a key is released. */
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: "vertical" | "horizontal";
  /** Printed scale: a count of evenly spaced marks, or the exact marks with optional labels. */
  ticks?: number | FaderTick[];
  /** Signal level from 0 to 1. Shows an LED meter beside the track when set. */
  level?: number;
  /** Engraved legend under the strip. Also names the control. */
  label?: React.ReactNode;
  /** Prints the value under the label. */
  showValue?: boolean;
  /** Formats the printed value and the value read to screen readers. */
  formatValue?: (value: number) => string;
  /** Submits the value under this name with a surrounding form. */
  name?: string;
  disabled?: boolean;
}

type Settle = keyof typeof settleClass;

const Fader = React.forwardRef<HTMLSpanElement, FaderProps>(
  (
    {
      className,
      style,
      color,
      size = "md",
      value: valueProp,
      defaultValue,
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      orientation = "vertical",
      ticks = 11,
      level,
      label,
      showValue = false,
      formatValue,
      name,
      disabled = false,
      id: idProp,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      onKeyDown,
      onKeyUp,
      onDoubleClick,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const labelId = `${idProp ?? autoId}-label`;
    const capRef = React.useRef<HTMLSpanElement>(null);
    const railRef = React.useRef<HTMLSpanElement>(null);
    React.useImperativeHandle(ref, () => capRef.current as HTMLSpanElement);

    const [uncontrolled, setUncontrolled] = React.useState(() => clamp(defaultValue ?? min, min, max));
    const isControlled = valueProp !== undefined;
    const value = clamp(isControlled ? valueProp : uncontrolled, min, max);

    const [dragging, setDragging] = React.useState(false);
    const [settle, setSettle] = React.useState<Settle>("none");
    const drag = React.useRef<{ offset: number; last: number; raw: number; start: number } | null>(null);
    const keyChanged = React.useRef(false);

    const vertical = orientation === "vertical";
    const s = sizes[size];
    const range = max - min || 1;
    const decimals = Math.max(decimalsOf(step), decimalsOf(min));
    const fraction = (v: number) => (clamp(v, min, max) - min) / range;
    // Position along the rail from its start (top or left), as a fraction.
    const along = (v: number) => (vertical ? 1 - fraction(v) : fraction(v));

    function snapToStep(raw: number) {
      return clamp(Number((Math.round((raw - min) / step) * step + min).toFixed(decimals)), min, max);
    }

    function setValue(next: number, mode: Settle) {
      if (next === value) return false;
      if (!isControlled) setUncontrolled(next);
      setSettle(mode);
      onValueChange?.(next);
      return true;
    }

    function railMetrics() {
      const rect = railRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const length = vertical ? rect.height : rect.width;
      return length > 0 ? { start: vertical ? rect.top : rect.left, length } : null;
    }

    function valueAt(position: number) {
      const rail = railMetrics();
      if (!rail) return value;
      const t = clamp((position - rail.start) / rail.length, 0, 1);
      return min + (vertical ? 1 - t : t) * range;
    }

    function handlePointerDown(event: React.PointerEvent<HTMLSpanElement>) {
      if (disabled || event.button !== 0) return;
      event.preventDefault();
      const position = vertical ? event.clientY : event.clientX;
      const rail = railMetrics();
      const capPosition = rail ? rail.start + along(value) * rail.length : position;
      const onCap = capRef.current?.contains(event.target as Node) ?? false;
      // Grabbing the cap never makes it jump; pressing the slot glides it there.
      const offset = onCap ? position - capPosition : 0;
      let raw = value;
      if (!onCap) {
        raw = valueAt(position);
        setValue(snapToStep(raw), "glide");
      }
      // Capture on the cap itself when it was grabbed, so a double-click still lands on it.
      (onCap && capRef.current ? capRef.current : event.currentTarget).setPointerCapture(event.pointerId);
      drag.current = { offset, last: position, raw, start: value };
      setDragging(true);
      capRef.current?.focus({ preventScroll: true });
    }

    function handlePointerMove(event: React.PointerEvent<HTMLSpanElement>) {
      const d = drag.current;
      const rail = railMetrics();
      if (!d || !rail) return;
      const position = vertical ? event.clientY : event.clientX;
      if (event.shiftKey) {
        // Fine: a fifth of the travel, and re-anchor so letting go of Shift doesn't jump.
        const delta = ((position - d.last) / rail.length) * range * 0.2;
        d.raw = clamp(d.raw + (vertical ? -delta : delta), min, max);
        d.offset = position - (rail.start + along(d.raw) * rail.length);
      } else {
        d.raw = valueAt(position - d.offset);
      }
      d.last = position;
      setValue(snapToStep(d.raw), "none");
    }

    function endDrag() {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      setDragging(false);
      if (value !== d.start) onValueCommit?.(value);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
      onKeyDown?.(event);
      if (disabled || event.defaultPrevented) return;
      const big = Math.max(step, Math.round(range / 10 / step) * step);
      const arrow = event.shiftKey ? big : step;
      const delta: Record<string, number> = {
        ArrowUp: arrow,
        ArrowRight: arrow,
        ArrowDown: -arrow,
        ArrowLeft: -arrow,
        PageUp: big,
        PageDown: -big,
        Home: -Infinity,
        End: Infinity,
      };
      if (!(event.key in delta)) return;
      event.preventDefault();
      if (setValue(snapToStep(clamp(value + delta[event.key], min, max)), "ease")) keyChanged.current = true;
    }

    function handleKeyUp(event: React.KeyboardEvent<HTMLSpanElement>) {
      onKeyUp?.(event);
      if (!keyChanged.current) return;
      keyChanged.current = false;
      onValueCommit?.(value);
    }

    const text = formatValue ? formatValue(value) : String(value);
    const lit = !disabled;

    const marks = (() => {
      if (Array.isArray(ticks)) {
        return ticks.map((tick) => {
          const t = typeof tick === "number" ? { value: tick } : tick;
          // An explicit null or empty label prints the line without a number.
          const label = t.label === undefined ? String(t.value) : t.label || null;
          return { value: t.value, label, major: true };
        });
      }
      const count = Math.max(0, Math.floor(ticks));
      if (count < 2) return [];
      const every = count > 6 ? 2 : 1;
      return Array.from({ length: count }, (_, i) => {
        const v = Number((min + (i / (count - 1)) * range).toFixed(decimals));
        const major = i % every === 0 || i === count - 1;
        return { value: v, label: major ? String(v) : null, major };
      });
    })();

    const segments = level === undefined ? 0 : METER_SEGMENTS;
    const litSegments = clamp(level ?? 0, 0, 1) * segments;

    // Half the cap's length: the rail and scale are inset by this so the cap never overhangs.
    const half = vertical ? "inset-y-[0.8em]" : "inset-x-[0.8em]";

    return (
      <div
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex select-none flex-col items-center gap-2.5",
          vertical ? "h-60" : "w-60",
          disabled && "opacity-50",
          className,
        )}
      >
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1",
            vertical ? "flex-row items-stretch" : "w-full flex-col items-stretch",
            s.root,
          )}
        >
          {marks.some((mark) => mark.label !== null) && (
            <span
              aria-hidden
              className={cn(
                "relative shrink-0 text-[0.62em] leading-none tabular-nums text-white/40",
                vertical ? "order-first mr-[0.5em] w-[2.6em]" : "order-last mt-[0.55em] h-[1em]",
              )}
            >
              <span className={cn("absolute", vertical ? "inset-x-0 inset-y-[1.3em]" : "inset-y-0 inset-x-[1.3em]")}>
                {marks.map((mark, i) =>
                  mark.label === null ? null : (
                    <span
                      key={i}
                      className={cn(
                        "absolute whitespace-nowrap",
                        vertical ? "right-0 -translate-y-1/2" : "top-0 -translate-x-1/2",
                      )}
                      style={vertical ? { top: `${along(mark.value) * 100}%` } : { left: `${along(mark.value) * 100}%` }}
                    >
                      {mark.label}
                    </span>
                  ),
                )}
              </span>
            </span>
          )}

          <span
            className={cn(
              "relative touch-none",
              vertical ? "w-[2.9em] self-stretch" : "h-[2.9em] w-full",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* Printed scale lines; the slot and cap sit on top of them */}
            <span aria-hidden className={cn("pointer-events-none absolute", vertical ? `inset-x-0 ${half}` : `inset-y-0 ${half}`)}>
              {marks.map((mark, i) => (
                <span
                  key={i}
                  className={cn(
                    "absolute",
                    mark.major ? "bg-white/[0.22]" : "bg-white/[0.11]",
                    vertical
                      ? cn("h-px -translate-y-1/2", mark.major ? "inset-x-[0.15em]" : "inset-x-[0.6em]")
                      : cn("w-px -translate-x-1/2", mark.major ? "inset-y-[0.15em]" : "inset-y-[0.6em]"),
                  )}
                  style={vertical ? { top: `${along(mark.value) * 100}%` } : { left: `${along(mark.value) * 100}%` }}
                />
              ))}
            </span>

            {/* The slot */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute rounded-full bg-[#020304] shadow-[inset_0_0.1em_0.2em_rgb(0_0_0/0.95),0_1px_0_rgb(255_255_255/0.07),0_0_0_1px_rgb(0_0_0/0.5)]",
                vertical
                  ? "inset-y-[0.35em] left-1/2 w-[0.32em] -translate-x-1/2"
                  : "inset-x-[0.35em] top-1/2 h-[0.32em] -translate-y-1/2",
              )}
            />

            <span ref={railRef} className={cn("pointer-events-none absolute", vertical ? `inset-x-0 ${half}` : `inset-y-0 ${half}`)}>
              <span
                className={cn("absolute inset-0", settleClass[settle])}
                style={{
                  transform: vertical
                    ? `translateY(${along(value) * 100}%)`
                    : `translateX(${along(value) * 100}%)`,
                }}
              >
                {/* Light from the cap's line falling on the panel */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.24),rgb(var(--neon)/0.06)_55%,transparent)] transition-opacity duration-200",
                    vertical
                      ? "left-1/2 top-0 h-[3.4em] w-[6em] -translate-x-1/2 -translate-y-1/2"
                      : "left-0 top-1/2 h-[6em] w-[3.4em] -translate-x-1/2 -translate-y-1/2",
                    lit ? (dragging ? "opacity-100" : "opacity-70") : "opacity-0",
                  )}
                />
                <span
                  ref={capRef}
                  id={idProp}
                  role="slider"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={ariaLabel}
                  aria-labelledby={ariaLabelledBy ?? (label && !ariaLabel ? labelId : undefined)}
                  aria-valuemin={min}
                  aria-valuemax={max}
                  aria-valuenow={value}
                  aria-valuetext={formatValue ? text : undefined}
                  aria-orientation={orientation}
                  aria-disabled={disabled || undefined}
                  data-state={dragging ? "dragging" : undefined}
                  data-orientation={orientation}
                  {...props}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onDoubleClick={(event) => {
                    onDoubleClick?.(event);
                    if (disabled || event.defaultPrevented || defaultValue === undefined) return;
                    const next = snapToStep(clamp(defaultValue, min, max));
                    if (setValue(next, "glide")) onValueCommit?.(next);
                  }}
                  className={cn(
                    "pointer-events-auto absolute block rounded-[0.22em] border border-black/80 outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
                    "shadow-[0_0.45em_0.7em_-0.1em_rgb(0_0_0/0.85),0_0.12em_0.2em_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.2)]",
                    vertical
                      ? "left-1/2 top-0 h-[1.6em] w-[2.9em] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,#4b515e,#2a2e37_40%,#15171c_50%,#1d2027_60%,#2b2f39)]"
                      : "left-0 top-1/2 h-[2.9em] w-[1.6em] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(90deg,#4b515e,#2a2e37_40%,#15171c_50%,#1d2027_60%,#2b2f39)]",
                    disabled ? "cursor-not-allowed" : dragging ? "cursor-grabbing" : "cursor-grab",
                  )}
                >
                  {/* Grip ribs on both slopes of the cap */}
                  {(["start", "end"] as const).map((side) => (
                    <span
                      key={side}
                      aria-hidden
                      className={cn(
                        "absolute",
                        vertical
                          ? cn(
                              "inset-x-[10%] h-[28%] bg-[repeating-linear-gradient(180deg,rgb(0_0_0/0.5)_0_1px,rgb(255_255_255/0.07)_1px_2px,transparent_2px_3.5px)]",
                              side === "start" ? "top-[9%]" : "bottom-[9%]",
                            )
                          : cn(
                              "inset-y-[10%] w-[28%] bg-[repeating-linear-gradient(90deg,rgb(0_0_0/0.5)_0_1px,rgb(255_255_255/0.07)_1px_2px,transparent_2px_3.5px)]",
                              side === "start" ? "left-[9%]" : "right-[9%]",
                            ),
                      )}
                    />
                  ))}
                  {/* The lit line */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute rounded-full transition-[background-color,box-shadow] duration-200",
                      vertical
                        ? "inset-x-[7%] top-1/2 h-[0.13em] min-h-[1.5px] -translate-y-1/2"
                        : "inset-y-[7%] left-1/2 w-[0.13em] min-w-[1.5px] -translate-x-1/2",
                      lit
                        ? dragging
                          ? "shadow-[0_0_0.2em_rgb(var(--neon)),0_0_0.6em_rgb(var(--neon)/0.9)]"
                          : "shadow-[0_0_0.15em_rgb(var(--neon)),0_0_0.45em_rgb(var(--neon)/0.7)]"
                        : "bg-[rgb(var(--neon)/0.16)]",
                    )}
                    style={lit ? { backgroundColor: CORE } : undefined}
                  />
                </span>
              </span>
            </span>
          </span>

          {segments > 0 && (
            <span
              aria-hidden
              data-meter=""
              className={cn(
                "relative flex shrink-0 gap-[0.14em]",
                vertical ? "ml-[0.55em] w-[0.42em] flex-col-reverse py-[0.35em]" : "order-first mb-[0.55em] h-[0.42em] flex-row px-[0.35em]",
              )}
            >
              {Array.from({ length: segments }, (_, i) => {
                const zone = i >= segments - 2 ? RED : i >= segments - 5 ? AMBER : "var(--neon)";
                const on = lit && litSegments > i;
                return (
                  <span
                    key={i}
                    data-lit={on ? "" : undefined}
                    style={{ "--seg": zone } as React.CSSProperties}
                    className="relative flex-1 rounded-[1px] bg-[rgb(var(--seg)/0.13)]"
                  >
                    <span
                      className={cn(
                        "absolute inset-0 rounded-[1px] bg-[rgb(var(--seg))] shadow-[0_0_0.35em_rgb(var(--seg)/0.75)]",
                        on ? "opacity-100" : "opacity-0 transition-opacity duration-300 ease-out",
                      )}
                    />
                  </span>
                );
              })}
            </span>
          )}
        </div>

        {label && (
          <span
            id={labelId}
            onClick={() => {
              if (!disabled) capRef.current?.focus();
            }}
            className={cn("font-medium uppercase leading-none tracking-[0.16em] text-white/55", s.label)}
          >
            {label}
          </span>
        )}
        {showValue && (
          <span
            aria-hidden
            className={cn(
              "leading-none tabular-nums transition-[color,text-shadow] duration-150",
              dragging ? "text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]" : "text-white/80",
              s.value,
            )}
          >
            {text}
          </span>
        )}
        {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
      </div>
    );
  },
);
Fader.displayName = "Fader";

export { Fader };
