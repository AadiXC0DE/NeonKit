"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The dial is drawn in a 100-unit box, so every size shares one geometry.
// `travel` is how many pixels of vertical drag sweep the whole range.
const sizes = {
  sm: { dial: "size-14 text-[10px]", minors: false, tick: 2, travel: 160, label: "text-[12px]", value: "text-[11px]" },
  md: { dial: "size-20 text-[14px]", minors: true, tick: 1.4, travel: 200, label: "text-[12px]", value: "text-xs" },
  lg: { dial: "size-28 text-[19px]", minors: true, tick: 1.1, travel: 240, label: "text-[12px]", value: "text-[13px]" },
} as const;

const RING = 39;
const CORE = "color-mix(in srgb, rgb(var(--neon)) 30%, white)";

// A detent catches the cap, which rings past it for a moment like a spring ball
// dropping into its notch. The value itself lands exactly on the detent.
const settleClass = {
  none: "",
  ease: "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
  snap: "transition-transform duration-300 ease-[cubic-bezier(0.34,2.4,0.64,1)] motion-reduce:transition-none",
} as const;

function clamp(value: number, lower: number, upper: number) {
  return Math.min(upper, Math.max(lower, value));
}

function decimalsOf(value: number) {
  return (String(value).split(".")[1] ?? "").length;
}

function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [50 + radius * Math.cos(rad), 50 + radius * Math.sin(rad)] as const;
}

function arcPath(from: number, to: number, radius: number) {
  const [x1, y1] = polar(from, radius);
  const [x2, y2] = polar(to, radius);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${radius} ${radius} 0 ${large} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

type Settle = keyof typeof settleClass;

export interface KnobProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange" | "children"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Fires once a drag, key press or wheel gesture ends. */
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Values the cap clicks into while dragging or scrolling, like a center detent on a pan pot. */
  detents?: number[];
  /** Degrees of rotation from min to max. */
  arc?: number;
  /** Engraved legend under the dial. Also names the control. */
  label?: React.ReactNode;
  /** Prints the value under the label. */
  showValue?: boolean;
  /** Formats the printed value and the value read to screen readers. */
  formatValue?: (value: number) => string;
  /** Submits the value under this name with a surrounding form. */
  name?: string;
  disabled?: boolean;
}

const Knob = React.forwardRef<HTMLDivElement, KnobProps>(
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
      detents,
      arc: arcProp = 270,
      label,
      showValue = false,
      formatValue,
      name,
      disabled = false,
      id: idProp,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      onDoubleClick,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const labelId = `${idProp ?? autoId}-label`;
    const dialRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => dialRef.current as HTMLDivElement);

    const [uncontrolled, setUncontrolled] = React.useState(() => clamp(defaultValue ?? min, min, max));
    const isControlled = valueProp !== undefined;
    const value = clamp(isControlled ? valueProp : uncontrolled, min, max);

    const [dragging, setDragging] = React.useState(false);
    const [settle, setSettle] = React.useState<Settle>("none");
    const drag = React.useRef<{ y: number; raw: number; start: number } | null>(null);
    const keyChanged = React.useRef(false);
    const wheel = React.useRef({ last: -Infinity, inside: false, raw: null as number | null, start: 0, latest: 0, timer: 0 });
    const wheelHandler = React.useRef<(event: WheelEvent) => void>(() => {});

    const s = sizes[size];
    const arc = clamp(arcProp, 30, 340);
    const range = max - min || 1;
    const decimals = Math.max(decimalsOf(step), decimalsOf(min));
    // Bipolar ranges (pan, detune) light from zero outwards.
    const origin = min < 0 && max > 0 ? 0 : min;
    const angleOf = (v: number) => -arc / 2 + ((clamp(v, min, max) - min) / range) * arc;
    const angle = angleOf(value);
    const originAngle = angleOf(origin);
    const litFraction = Math.abs(angle - originAngle) / arc;

    function snapToStep(raw: number) {
      return clamp(Number((Math.round((raw - min) / step) * step + min).toFixed(decimals)), min, max);
    }

    /** Lands on a detent when the raw position is close enough, otherwise on a step. */
    function resolve(raw: number) {
      const zone = range * 0.03;
      const detent = detents?.find((d) => Math.abs(raw - d) <= zone);
      return detent !== undefined ? clamp(detent, min, max) : snapToStep(raw);
    }

    function setValue(next: number, mode: Settle) {
      if (next === value) return false;
      if (!isControlled) setUncontrolled(next);
      setSettle(mode);
      onValueChange?.(next);
      return true;
    }

    /** Pointer and wheel moves: detents get the springy settle, everything else tracks 1:1. */
    function moveTo(raw: number) {
      const next = resolve(raw);
      const crossesDetent = detents?.some((d) => d === next || d === value) ?? false;
      setValue(next, crossesDetent ? "snap" : "none");
      return next;
    }

    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
      onPointerDown?.(event);
      if (disabled || event.defaultPrevented || event.button !== 0) return;
      // Keeps text from selecting while dragging; we focus the dial ourselves.
      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { y: event.clientY, raw: value, start: value };
      setDragging(true);
    }

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
      onPointerMove?.(event);
      const d = drag.current;
      if (!d) return;
      const factor = event.shiftKey ? 0.1 : event.altKey ? 4 : 1;
      d.raw = clamp(d.raw + ((d.y - event.clientY) * factor * range) / s.travel, min, max);
      d.y = event.clientY;
      moveTo(d.raw);
    }

    function endDrag() {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      setDragging(false);
      if (value !== d.start) onValueCommit?.(value);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
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

    function handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyUp?.(event);
      if (!keyChanged.current) return;
      keyChanged.current = false;
      onValueCommit?.(value);
    }

    function handleWheel(event: WheelEvent) {
      const gesture = wheel.current;
      if (disabled || !gesture.inside) return;
      // Shift turns the wheel sideways on some systems, so take whichever axis moved.
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      // At the end of its travel the knob lets go, and the rest of the gesture scrolls the page.
      const current = gesture.raw ?? value;
      if ((delta > 0 && current <= min) || (delta < 0 && current >= max)) {
        gesture.inside = false;
        return;
      }
      event.preventDefault();
      const pixels = event.deltaMode === 1 ? delta * 16 : delta;
      const factor = event.shiftKey ? 0.1 : event.altKey ? 4 : 1;
      if (gesture.raw === null) gesture.start = value;
      const raw = clamp((gesture.raw ?? value) - (pixels * factor * range) / 2000, min, max);
      gesture.raw = raw;
      gesture.latest = moveTo(raw);
      window.clearTimeout(gesture.timer);
      gesture.timer = window.setTimeout(() => {
        if (gesture.latest !== gesture.start) onValueCommit?.(gesture.latest);
      }, 300);
    }

    React.useEffect(() => {
      wheelHandler.current = handleWheel;
    });

    React.useEffect(() => {
      const node = dialRef.current;
      if (!node) return;
      const gesture = wheel.current;
      // The wheel belongs to the page until the knob has been picked up: only a
      // gesture that begins on a focused knob turns it, so resting the pointer on
      // one while reading never hijacks the scroll.
      const track = (event: WheelEvent) => {
        if (event.timeStamp - gesture.last > 300) {
          gesture.inside = node.contains(event.target as Node) && document.activeElement === node;
          gesture.raw = null;
        }
        gesture.last = event.timeStamp;
      };
      const turn = (event: WheelEvent) => wheelHandler.current(event);
      window.addEventListener("wheel", track, { capture: true, passive: true });
      node.addEventListener("wheel", turn, { passive: false });
      return () => {
        window.removeEventListener("wheel", track, { capture: true });
        node.removeEventListener("wheel", turn);
        window.clearTimeout(gesture.timer);
      };
    }, []);

    const text = formatValue ? formatValue(value) : String(value);
    const lit = !disabled;
    // A stepped knob with a handful of positions marks each one; otherwise a 0–10 scale.
    const positions = Math.round(range / step);
    const stepped = positions <= 12 && Math.abs(positions * step - range) < 1e-9;
    const divisions = stepped ? positions : s.minors ? 20 : 10;
    const ticks: { angle: number; major: boolean }[] = [];
    for (let i = 0; i <= divisions; i++) {
      ticks.push({ angle: -arc / 2 + (i / divisions) * arc, major: stepped || !s.minors || i % 2 === 0 });
    }
    const litFrom = Math.min(angle, originAngle);
    const litTo = Math.max(angle, originAngle);

    return (
      <div
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex w-fit select-none flex-col items-center gap-2",
          disabled && "opacity-50",
          className,
        )}
      >
        <div
          ref={dialRef}
          id={idProp}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy ?? (label && !ariaLabel ? labelId : undefined)}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue ? text : undefined}
          aria-disabled={disabled || undefined}
          data-state={dragging ? "dragging" : undefined}
          data-disabled={disabled ? "" : undefined}
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
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onDoubleClick={(event) => {
            onDoubleClick?.(event);
            if (disabled || event.defaultPrevented || defaultValue === undefined) return;
            const next = snapToStep(clamp(defaultValue, min, max));
            if (setValue(next, "snap")) onValueCommit?.(next);
          }}
          className={cn(
            "group/knob relative shrink-0 touch-none rounded-full outline-none",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            disabled ? "cursor-not-allowed" : "cursor-ns-resize",
            s.dial,
          )}
        >
          {/* Light from the ring falling on the panel around the knob */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-[22%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.2),rgb(var(--neon)/0.06)_60%,transparent)] transition-opacity duration-200"
            style={{ opacity: lit ? 0.25 + litFraction * 0.75 : 0 }}
          />

          {/* Printed scale and the unlit LED ring */}
          <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full overflow-visible">
            {ticks.map((tick, i) => {
              const [x1, y1] = polar(tick.angle, 44.5);
              const [x2, y2] = polar(tick.angle, tick.major ? 49 : 47);
              const inLit = lit && tick.angle >= litFrom - 0.01 && tick.angle <= litTo + 0.01 && litTo > litFrom;
              return (
                <line
                  key={i}
                  x1={x1.toFixed(2)}
                  y1={y1.toFixed(2)}
                  x2={x2.toFixed(2)}
                  y2={y2.toFixed(2)}
                  strokeWidth={s.tick}
                  strokeLinecap="round"
                  className={cn(
                    "transition-[stroke] duration-150",
                    inLit ? "stroke-[rgb(var(--neon)/0.6)]" : tick.major ? "stroke-white/25" : "stroke-white/[0.13]",
                  )}
                />
              );
            })}
            {detents?.map((d) => {
              const [x, y] = polar(angleOf(d), 53);
              return (
                <circle
                  key={d}
                  cx={x.toFixed(2)}
                  cy={y.toFixed(2)}
                  r={s.tick * 1.1}
                  className={cn(
                    "transition-[fill] duration-150",
                    lit && value === d ? "fill-[rgb(var(--neon))]" : "fill-white/30",
                  )}
                />
              );
            })}
            <path
              d={arcPath(-arc / 2, arc / 2, RING)}
              fill="none"
              strokeWidth={3.4}
              strokeLinecap="round"
              className="stroke-[rgb(var(--neon)/0.13)]"
            />
          </svg>

          {/* The lit part of the ring: a colored body with a near-white core */}
          {lit && litTo - litFrom > 0.01 && (
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              className={cn(
                "pointer-events-none absolute inset-0 size-full overflow-visible transition-[filter] duration-200",
                "[filter:drop-shadow(0_0_1.5px_rgb(var(--neon)))_drop-shadow(0_0_5px_rgb(var(--neon)/0.55))]",
                "group-hover/knob:[filter:drop-shadow(0_0_2px_rgb(var(--neon)))_drop-shadow(0_0_8px_rgb(var(--neon)/0.75))]",
                "group-focus-visible/knob:[filter:drop-shadow(0_0_2px_rgb(var(--neon)))_drop-shadow(0_0_8px_rgb(var(--neon)/0.75))]",
                "group-data-[state=dragging]/knob:[filter:drop-shadow(0_0_2px_rgb(var(--neon)))_drop-shadow(0_0_9px_rgb(var(--neon)/0.85))]",
              )}
            >
              <path
                d={arcPath(litFrom, litTo, RING)}
                fill="none"
                strokeWidth={3.4}
                strokeLinecap="round"
                className="stroke-[rgb(var(--neon))]"
              />
              <path
                d={arcPath(litFrom, litTo, RING)}
                fill="none"
                strokeWidth={1.3}
                strokeLinecap="round"
                style={{ stroke: CORE }}
              />
            </svg>
          )}

          {/* The cap. Lighting stays put while the knurl and pointer turn. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[19%] rounded-full bg-[#090a0e] shadow-[0_0.3em_0.55em_rgb(0_0_0/0.75),0_0.08em_0.12em_rgb(0_0_0/0.9)]"
          >
            <span
              className={cn("absolute inset-0 rounded-full", settleClass[settle])}
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <span className="absolute inset-0 rounded-full bg-[repeating-conic-gradient(rgb(255_255_255/0.09)_0deg_2.5deg,rgb(0_0_0/0.3)_2.5deg_5deg)]" />
            </span>
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgb(255_255_255/0.16),rgb(255_255_255/0.02)_40%,rgb(0_0_0/0.5))] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.5)]" />
            <span className="absolute inset-[13%] rounded-full bg-[repeating-radial-gradient(circle,rgb(255_255_255/0.025)_0_1px,transparent_1px_2.5px),conic-gradient(from_200deg,#1c1f27,#3a3f4c_9%,#191b22_23%,#2d313c_38%,#15171d_52%,#353a46_67%,#17191f_83%,#1c1f27)] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-1px_1px_rgb(0_0_0/0.6),0_0_0_1px_rgb(0_0_0/0.55)]" />
            <span
              className={cn("absolute inset-0 rounded-full", settleClass[settle])}
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <span
                className={cn(
                  "absolute left-1/2 top-[15%] h-[27%] w-[0.14em] min-w-[1.5px] -translate-x-1/2 rounded-full transition-[background-color,box-shadow] duration-200",
                  lit
                    ? "shadow-[0_0_0.15em_rgb(var(--neon)),0_0_0.45em_rgb(var(--neon)/0.7)]"
                    : "bg-[rgb(var(--neon)/0.16)]",
                )}
                style={lit ? { backgroundColor: CORE } : undefined}
              />
            </span>
          </span>
        </div>

        {label && (
          <span
            id={labelId}
            onClick={() => {
              if (!disabled) dialRef.current?.focus();
            }}
            className={cn("font-medium leading-none tracking-[0.01em] text-white/60", s.label)}
          >
            {label}
          </span>
        )}
        {showValue && (
          <span
            aria-hidden
            className={cn(
              "leading-none tabular-nums transition-[color,text-shadow] duration-150",
              dragging
                ? "text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]"
                : "text-white/80",
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
Knob.displayName = "Knob";

export { Knob };
