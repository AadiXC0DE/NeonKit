"use client";

import * as React from "react";
import { Heart, Star, Zap } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const icons = { star: Star, bolt: Zap, heart: Heart } as const;

// Cells touch, so the padding is the visual gap and there are no dead zones.
const sizes = {
  sm: { cell: "p-0.5", icon: "size-4", stroke: 2, label: "text-xs" },
  md: { cell: "p-[3px]", icon: "size-6", stroke: 1.75, label: "text-sm" },
  lg: { cell: "p-1", icon: "size-8", stroke: 1.5, label: "text-sm" },
} as const;

// Each tube strikes, drops out once, then holds. Icons light one after another.
const STAGGER = 70;
const keyframes = `@keyframes neonkit-rating-ignite{0%{opacity:0}14%{opacity:.9}26%{opacity:.2}44%{opacity:1}56%{opacity:.55}72%,100%{opacity:1}}`;

function clamp(value: number, lower: number, upper: number) {
  return Math.min(upper, Math.max(lower, value));
}

function defaultValueText(value: number, max: number) {
  if (value <= 0) return "No rating";
  const shown = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${shown} of ${max}`;
}

type Ignition = {
  display: number;
  /** Bumped per icon each time it goes from dark to lit, to replay the flicker. */
  keys: number[];
  delays: number[];
  /** Last lit fraction, kept while an icon fades out so its clip doesn't jump. */
  fills: number[];
  count: number;
};

export interface RatingProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "color" | "defaultValue" | "onChange" | "children"
  > {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of icons. */
  max?: number;
  /** Allows half values from the pointer (left half of an icon) and the arrow keys. */
  allowHalf?: boolean;
  icon?: keyof typeof icons;
  /** Display only: no focus or input, announced as an image with the value. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Visible label above the icons. Also names the control. */
  label?: React.ReactNode;
  /** Text read to screen readers. Defaults to "3.5 of 5". */
  formatValue?: (value: number, max: number) => string;
  /** Called with the previewed value while the pointer moves over the icons, and null when it leaves. */
  onHoverChange?: (value: number | null) => void;
  /** Submits the value under this name with a surrounding form. */
  name?: string;
  /** Classes for the outer block when a label is set. */
  containerClassName?: string;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      containerClassName,
      style,
      color,
      size = "md",
      value: valueProp,
      defaultValue = 0,
      onValueChange,
      max = 5,
      allowHalf = false,
      icon = "star",
      readOnly = false,
      disabled = false,
      label,
      formatValue = defaultValueText,
      onHoverChange,
      name,
      id: idProp,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      onPointerMove,
      onPointerLeave,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const valueTextId = `${id}-value`;
    const controlRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => controlRef.current as HTMLDivElement);

    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = clamp(isControlled ? valueProp : uncontrolled, 0, max);

    const [hover, setHover] = React.useState<number | null>(null);
    // After a click clears the rating, the pointer is still over that icon.
    // Hold the preview off until it moves to a different value.
    const clearedAt = React.useRef<number | null>(null);

    const interactive = !readOnly && !disabled;
    const display = interactive && hover !== null ? hover : value;
    const Icon = icons[icon];
    const s = sizes[size];
    const valueText = formatValue(value, max);

    const [ignition, setIgnition] = React.useState<Ignition>(() => ({
      display,
      keys: [],
      delays: [],
      fills: Array.from({ length: max }, (_, i) => clamp(display - i, 0, 1)),
      count: 0,
    }));
    if (ignition.display !== display) {
      const keys = [...ignition.keys];
      const delays = [...ignition.delays];
      const fills = [...ignition.fills];
      let order = 0;
      for (let i = 0; i < max; i++) {
        const before = clamp(ignition.display - i, 0, 1);
        const after = clamp(display - i, 0, 1);
        if (after > 0) fills[i] = after;
        if (before === 0 && after > 0 && display > ignition.display) {
          keys[i] = ignition.count + 1;
          delays[i] = order++ * STAGGER;
        }
      }
      setIgnition({ display, keys, delays, fills, count: ignition.count + 1 });
    }

    // A form reset puts the starting rating back.
    const hiddenRef = React.useRef<HTMLInputElement>(null);
    const initialValue = React.useRef(value);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        const initial = initialValue.current;
        if (initial === value) return;
        if (!isControlled) setUncontrolled(initial);
        onValueChange?.(initial);
      };
    });
    React.useEffect(() => {
      const form = hiddenRef.current?.form;
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    function setHoverValue(next: number | null) {
      if (next === hover) return;
      setHover(next);
      onHoverChange?.(next);
    }

    function commit(next: number) {
      const snapped = clamp(allowHalf ? Math.round(next * 2) / 2 : Math.round(next), 0, max);
      if (snapped === value) return;
      if (!isControlled) setUncontrolled(snapped);
      onValueChange?.(snapped);
    }

    function valueFromPointer(event: React.PointerEvent | React.MouseEvent) {
      const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-rating-index]");
      if (!cell || !event.currentTarget.contains(cell)) return null;
      const index = Number(cell.dataset.ratingIndex);
      if (!allowHalf) return index + 1;
      const rect = cell.getBoundingClientRect();
      const rtl = getComputedStyle(cell).direction === "rtl";
      const offset = rtl ? rect.right - event.clientX : event.clientX - rect.left;
      return offset < rect.width / 2 ? index + 0.5 : index + 1;
    }

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
      onPointerMove?.(event);
      if (!interactive || event.pointerType === "touch") return;
      const next = valueFromPointer(event);
      if (next === null) return;
      if (clearedAt.current !== null) {
        if (next === clearedAt.current) return;
        clearedAt.current = null;
      }
      setHoverValue(next);
    }

    function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
      onPointerLeave?.(event);
      clearedAt.current = null;
      setHoverValue(null);
    }

    function handleClick(event: React.MouseEvent<HTMLDivElement>) {
      onClick?.(event);
      if (!interactive || event.defaultPrevented) return;
      const next = valueFromPointer(event);
      if (next === null) return;
      if (next === value) {
        commit(0);
        clearedAt.current = next;
        setHoverValue(null);
      } else {
        commit(next);
      }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (!interactive || event.defaultPrevented) return;
      const step = allowHalf ? 0.5 : 1;
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      let next: number | undefined;
      if (event.key === forward || event.key === "ArrowUp") next = value + step;
      else if (event.key === back || event.key === "ArrowDown") next = value - step;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = max;
      else if (/^[0-9]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        next = Math.min(Number(event.key), max);
      }
      if (next === undefined) return;
      event.preventDefault();
      setHoverValue(null);
      commit(next);
    }

    const accessibleName = label ? labelId : ariaLabelledBy;

    const control = (
      <div
        ref={controlRef}
        id={id}
        {...(readOnly
          ? {
              role: "img",
              "aria-label": ariaLabel ? `${ariaLabel}: ${valueText}` : label ? undefined : valueText,
              "aria-labelledby": accessibleName ? `${accessibleName} ${valueTextId}` : undefined,
            }
          : {
              role: "slider",
              tabIndex: disabled ? -1 : 0,
              "aria-label": ariaLabel,
              "aria-labelledby": accessibleName,
              "aria-valuemin": 0,
              "aria-valuemax": max,
              "aria-valuenow": value,
              "aria-valuetext": valueText,
              "aria-orientation": "horizontal" as const,
              "aria-disabled": disabled || undefined,
            })}
        data-state={hover !== null ? "preview" : value > 0 ? "rated" : "empty"}
        data-disabled={disabled ? "" : undefined}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-flex w-fit select-none items-center rounded-lg outline-none",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          interactive && "cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {ignition.count > 0 && <style>{keyframes}</style>}
        {readOnly && accessibleName && (
          <span id={valueTextId} hidden>
            {valueText}
          </span>
        )}
        {Array.from({ length: max }, (_, i) => {
          const fill = clamp(display - i, 0, 1);
          const shownFill = fill > 0 ? fill : (ignition.fills[i] ?? 1);
          const key = ignition.keys[i] ?? 0;
          return (
            <span key={i} data-rating-index={i} className={cn("relative grid place-items-center", s.cell)}>
              {/* The unlit tube: dark glass that catches a little light on its edge */}
              <Icon
                aria-hidden
                strokeWidth={s.stroke}
                className={cn(
                  "fill-white/[0.03] text-white/[0.16] [filter:drop-shadow(0_1px_0_rgb(255_255_255/0.04))]",
                  "transition-colors duration-150",
                  s.icon,
                )}
              />
              <span
                key={key}
                aria-hidden
                style={key > 0 ? { animationDelay: `${ignition.delays[i] ?? 0}ms` } : undefined}
                className={cn(
                  "pointer-events-none absolute inset-0 grid place-items-center [filter:drop-shadow(0_0_3px_rgb(var(--neon)/0.9))_drop-shadow(0_0_10px_rgb(var(--neon)/0.45))]",
                  fill > 0 ? "opacity-100" : "opacity-0 transition-opacity duration-150 ease-out",
                  fill > 0 &&
                    key > 0 &&
                    "[animation:neonkit-rating-ignite_380ms_linear_backwards] motion-reduce:[animation:none]",
                  s.cell,
                )}
              >
                <Icon
                  strokeWidth={s.stroke}
                  style={{ "--rating-cut": `${(1 - shownFill) * 100}%` } as React.CSSProperties}
                  className={cn(
                    "fill-[rgb(var(--neon)/0.22)] text-[rgb(var(--neon))]",
                    shownFill < 1 &&
                      "[clip-path:inset(0_var(--rating-cut)_0_0)] rtl:[clip-path:inset(0_0_0_var(--rating-cut))]",
                    s.icon,
                  )}
                />
              </span>
            </span>
          );
        })}
      </div>
    );

    const hidden = name ? (
      <input ref={hiddenRef} type="hidden" name={name} value={value} disabled={disabled} />
    ) : null;

    if (!label) {
      return (
        <>
          {control}
          {hidden}
        </>
      );
    }

    return (
      <div className={cn("grid w-fit gap-1.5", containerClassName)}>
        <span
          id={labelId}
          onClick={() => {
            if (interactive) controlRef.current?.focus();
          }}
          className={cn("w-fit font-medium text-white/80", s.label)}
        >
          {label}
        </span>
        {control}
        {hidden}
      </div>
    );
  },
);
Rating.displayName = "Rating";

export { Rating };
