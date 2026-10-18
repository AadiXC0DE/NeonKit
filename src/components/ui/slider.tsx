"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Thumbs travel inside a rail inset by half their width, so they never
// hang past the ends of the track.
const sizes = {
  sm: { root: "h-4", track: "h-1", thumb: "size-3.5", rail: "inset-x-[7px]", radius: 7 },
  md: { root: "h-5", track: "h-1.5", thumb: "size-[18px]", rail: "inset-x-[9px]", radius: 9 },
  lg: { root: "h-6", track: "h-2", thumb: "size-[22px]", rail: "inset-x-[11px]", radius: 11 },
} as const;

const thumbGlow = "shadow-[0_0_18px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))),0_1px_3px_rgb(0_0_0/0.5)]";

function clamp(value: number, lower: number, upper: number) {
  return Math.min(upper, Math.max(lower, value));
}

function decimalsOf(value: number) {
  return (String(value).split(".")[1] ?? "").length;
}

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** One number for a single thumb, two for a range. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Fires once the pointer or key is released. */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Accessible name per thumb. Ranges default to "Minimum" and "Maximum". */
  thumbLabels?: string[];
  /** Formats the value bubble and the value read to screen readers. */
  formatValue?: (value: number) => string;
  /** Shows a value bubble above each thumb, always or on hover, drag and focus. */
  showValue?: boolean | "hover";
  /** Submits each value under this name (`name[]` for ranges). */
  name?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
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
      disabled = false,
      thumbLabels,
      formatValue,
      showValue = false,
      name,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(() => defaultValue ?? [min]);
    const isControlled = valueProp !== undefined;
    const values = isControlled ? valueProp : uncontrolled;
    const isRange = values.length > 1;

    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    // A form reset puts the thumbs back where they started.
    const initialValues = React.useRef(values);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        const initial = initialValues.current;
        if (initial.length === values.length && initial.every((value, i) => value === values[i])) return;
        if (!isControlled) setUncontrolled(initial);
        onValueChange?.(initial);
      };
    });
    React.useEffect(() => {
      const form = rootRef.current?.closest("form");
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    const railRef = React.useRef<HTMLDivElement>(null);
    const thumbRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
    const drag = React.useRef<{ index: number; offset: number } | null>(null);
    const keyChanged = React.useRef(false);
    const [active, setActive] = React.useState<number | null>(null);

    const s = sizes[size];
    const decimals = Math.max(decimalsOf(step), decimalsOf(min));
    const percent = (value: number) =>
      max === min ? 0 : ((clamp(value, min, max) - min) / (max - min)) * 100;

    /** Snaps, keeps the thumb between its neighbours, and reports changes. */
    function setValueAt(index: number, raw: number) {
      const snapped = Number((Math.round((raw - min) / step) * step + min).toFixed(decimals));
      const lower = index > 0 ? values[index - 1] : min;
      const upper = index < values.length - 1 ? values[index + 1] : max;
      const next = clamp(snapped, lower, upper);
      if (next === values[index]) return false;

      const nextValues = values.map((value, i) => (i === index ? next : value));
      if (!isControlled) setUncontrolled(nextValues);
      onValueChange?.(nextValues);
      return true;
    }

    function valueFromPointer(clientX: number) {
      const rect = railRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return min;
      return min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min);
    }

    function closestThumb(raw: number) {
      let index = 0;
      let best = Infinity;
      values.forEach((value, i) => {
        const distance = Math.abs(value - raw);
        // On a tie (stacked thumbs), move the one on the side of the pointer.
        if (distance < best || (distance === best && raw > value)) {
          best = distance;
          index = i;
        }
      });
      return index;
    }

    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
      onPointerDown?.(event);
      if (disabled || event.defaultPrevented || event.button !== 0) return;
      // We move focus to the thumb ourselves.
      event.preventDefault();

      let index = thumbRefs.current.findIndex((thumb) => thumb?.contains(event.target as Node));
      if (index >= 0 && isRange) {
        // Grips overlap when thumbs sit close together; take the one nearest the pointer.
        let best = Infinity;
        thumbRefs.current.forEach((thumb, i) => {
          if (!thumb) return;
          const rect = thumb.getBoundingClientRect();
          const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
          if (distance < best || (distance === best && i === index)) {
            best = distance;
            index = i;
          }
        });
      }
      let offset = 0;
      const grabbed = thumbRefs.current[index];
      if (grabbed) {
        // Grabbing a thumb off-center should not make it jump.
        const rect = grabbed.getBoundingClientRect();
        offset = event.clientX - (rect.left + rect.width / 2);
      } else {
        const raw = valueFromPointer(event.clientX);
        index = closestThumb(raw);
        setValueAt(index, raw);
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { index, offset };
      setActive(index);
      thumbRefs.current[index]?.focus({ preventScroll: true });
    }

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
      onPointerMove?.(event);
      if (!drag.current) return;
      setValueAt(drag.current.index, valueFromPointer(event.clientX - drag.current.offset));
    }

    function endDrag() {
      if (!drag.current) return;
      drag.current = null;
      setActive(null);
      onValueCommit?.(values);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLSpanElement>, index: number) {
      if (disabled) return;
      const current = values[index];
      const page = step * 10;
      const delta: Record<string, number> = {
        ArrowRight: event.shiftKey ? page : step,
        ArrowUp: event.shiftKey ? page : step,
        ArrowLeft: event.shiftKey ? -page : -step,
        ArrowDown: event.shiftKey ? -page : -step,
        PageUp: page,
        PageDown: -page,
        Home: -Infinity,
        End: Infinity,
      };
      if (!(event.key in delta)) return;
      event.preventDefault();
      const target = clamp(current + delta[event.key], min, max);
      if (setValueAt(index, target)) keyChanged.current = true;
    }

    function handleKeyUp() {
      if (!keyChanged.current) return;
      keyChanged.current = false;
      onValueCommit?.(values);
    }

    const first = percent(values[0] ?? min);
    const last = percent(values[values.length - 1] ?? min);

    return (
      <div
        ref={rootRef}
        role={isRange ? "group" : undefined}
        aria-label={isRange ? ariaLabel : undefined}
        aria-labelledby={isRange ? ariaLabelledBy : undefined}
        aria-disabled={disabled || undefined}
        data-orientation="horizontal"
        data-disabled={disabled ? "" : undefined}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "group/slider relative flex w-full touch-none select-none items-center",
          // Taller invisible hit area for touch.
          "before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          s.root,
          className,
        )}
        {...props}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          endDrag();
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          endDrag();
        }}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10",
            s.track,
          )}
        />

        <div ref={railRef} className={cn("absolute inset-y-0", s.rail)}>
          <span
            aria-hidden
            style={{
              left: isRange ? `${first}%` : -s.radius,
              right: `${100 - last}%`,
            }}
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1)))]",
              s.track,
            )}
          />

          {values.map((value, i) => {
            const text = formatValue ? formatValue(value) : String(value);
            const dragging = active === i;
            const label =
              thumbLabels?.[i] ??
              (isRange ? (i === 0 ? "Minimum" : i === values.length - 1 ? "Maximum" : undefined) : ariaLabel);

            return (
              <span key={i} className="absolute inset-y-0 w-0" style={{ left: `${percent(value)}%` }}>
                <span
                  ref={(node) => {
                    thumbRefs.current[i] = node;
                  }}
                  role="slider"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={label}
                  aria-labelledby={!isRange && !thumbLabels?.[i] ? ariaLabelledBy : undefined}
                  // Descriptions belong to the focusable thumbs, not the wrapper.
                  aria-describedby={ariaDescribedBy}
                  aria-valuemin={i > 0 ? values[i - 1] : min}
                  aria-valuemax={i < values.length - 1 ? values[i + 1] : max}
                  aria-valuenow={value}
                  aria-valuetext={formatValue ? text : undefined}
                  aria-orientation="horizontal"
                  aria-disabled={disabled || undefined}
                  data-active={dragging ? "" : undefined}
                  onKeyDown={(event) => handleKeyDown(event, i)}
                  onKeyUp={handleKeyUp}
                  className={cn(
                    "peer absolute left-0 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgb(var(--neon))] bg-[#eef3fa] outline-none",
                    // A larger invisible grip, so the thumb is easy to catch with a finger.
                    "before:absolute before:-inset-3 before:rounded-full before:content-['']",
                    "shadow-[0_0_8px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1))),0_1px_3px_rgb(0_0_0/0.5)]",
                    "transition-[transform,scale,box-shadow] duration-150 ease-out motion-reduce:transition-none",
                    "focus-visible:scale-110 focus-visible:shadow-[0_0_18px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))),0_1px_3px_rgb(0_0_0/0.5)]",
                    "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
                    dragging
                      ? cn("scale-110", thumbGlow)
                      : !disabled &&
                          "hover:shadow-[0_0_12px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))),0_1px_3px_rgb(0_0_0/0.5)]",
                    s.thumb,
                  )}
                />
                {showValue && (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute bottom-full left-0 mb-1.5 -translate-x-1/2 origin-bottom whitespace-nowrap rounded-md border border-white/10 bg-[#0a0b11] px-1.5 py-0.5 text-xs font-medium leading-4 tabular-nums text-white/90 shadow-[0_4px_12px_rgb(0_0_0/0.5)]",
                      "transition-[opacity,transform,scale] duration-150 ease-out motion-reduce:transition-none",
                      showValue === true || dragging
                        ? "scale-100 opacity-100"
                        : cn(
                            "scale-[0.96] opacity-0 peer-focus-visible:scale-100 peer-focus-visible:opacity-100",
                            !disabled && "group-hover/slider:scale-100 group-hover/slider:opacity-100",
                          ),
                    )}
                  >
                    {text}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {name &&
          values.map((value, i) => (
            <input key={i} type="hidden" name={isRange ? `${name}[]` : name} value={value} disabled={disabled} />
          ))}
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
