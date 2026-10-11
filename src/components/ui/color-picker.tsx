"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonColorNames, neonColors, neonVars, type NeonColor, type NeonColorName } from "@/lib/neon";

const INVALID = "#ff4d5e";
const DEFAULT_HEX = "#22d3ee";
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const TICKS = 36;

const sizes = {
  sm: {
    panel: "gap-2.5 rounded-lg p-2.5",
    row: "gap-3",
    knob: 56,
    preview: "h-11 rounded-md",
    tube: "inset-x-5 h-1.5",
    electrode: "h-2.5 w-2",
    electrodeSides: ["left-3.5", "right-3.5"],
    strip: "h-3",
    track: "h-1.5",
    thumb: "size-3",
    rail: "inset-x-1.5",
    gel: "h-5 w-3.5",
    gelTube: "h-4 w-1",
    field: "h-8 rounded-md text-xs",
    fieldPad: "pr-2.5",
    hash: "pl-2.5",
    button: "size-8 rounded-md [&_svg]:size-3.5",
    label: "text-xs",
    meta: "text-[10px]",
  },
  md: {
    panel: "gap-3 rounded-xl p-3",
    row: "gap-4",
    knob: 72,
    preview: "h-14 rounded-lg",
    tube: "inset-x-6 h-2",
    electrode: "h-3 w-2.5",
    electrodeSides: ["left-4", "right-4"],
    strip: "h-4",
    track: "h-2",
    thumb: "size-4",
    rail: "inset-x-2",
    gel: "h-6 w-4",
    gelTube: "h-5 w-1.5",
    field: "h-10 rounded-lg text-sm",
    fieldPad: "pr-3",
    hash: "pl-3",
    button: "size-10 rounded-lg [&_svg]:size-4",
    label: "text-sm",
    meta: "text-[11px]",
  },
  lg: {
    panel: "gap-4 rounded-xl p-4",
    row: "gap-5",
    knob: 88,
    preview: "h-16 rounded-lg",
    tube: "inset-x-7 h-2.5",
    electrode: "h-3.5 w-3",
    electrodeSides: ["left-[18px]", "right-[18px]"],
    strip: "h-5",
    track: "h-2.5",
    thumb: "size-5",
    rail: "inset-x-2.5",
    gel: "h-7 w-5",
    gelTube: "h-6 w-2",
    field: "h-12 rounded-xl text-base",
    fieldPad: "pr-4",
    hash: "pl-4",
    button: "size-12 rounded-xl [&_svg]:size-[18px]",
    label: "text-sm",
    meta: "text-xs",
  },
} as const;

type Size = keyof typeof sizes;
type Hsl = { h: number; s: number; l: number };
type Rgb = [number, number, number];

// The tube strikes, drops out once, then holds.
const keyframes = `@keyframes neonkit-color-ignite{0%{opacity:.25}16%{opacity:1}30%{opacity:.4}50%,100%{opacity:1}}`;

function clamp(value: number, lower: number, upper: number) {
  return Math.min(upper, Math.max(lower, value));
}

function normalizeHex(input: string | undefined): string | null {
  const match = HEX.exec((input ?? "").trim());
  if (!match) return null;
  let hex = match[1].toLowerCase();
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  return `#${hex}`;
}

function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(rgb: Rgb) {
  return `#${rgb.map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0")).join("")}`;
}

/** A palette name, `#rgb`/`#rrggbb`, or the `rgb(…)` string some browsers return from EyeDropper. */
function toHex(color: string): string | null {
  if (color in neonColors) {
    return rgbToHex(neonColors[color as NeonColorName].split(" ").map(Number) as Rgb);
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(color.trim());
  if (rgb) return rgbToHex([Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]);
  return normalizeHex(color);
}

function rgbToHsl([r, g, b]: Rgb): Hsl {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === rn ? ((gn - bn) / d) % 6 : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }: Hsl) {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return (ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  };
  return rgbToHex([f(0), f(8), f(4)]);
}

/** Greys, black and white have no hue (and black and white no saturation); keep the old ones. */
function hslFromHex(hex: string, previous?: Hsl): Hsl {
  const next = rgbToHsl(hexToRgb(hex));
  if (!previous) return next;
  const extreme = next.l < 0.5 || next.l > 99.5;
  if (extreme) return { h: previous.h, s: previous.s, l: next.l };
  if (next.s < 0.5) return { ...next, h: previous.h };
  return next;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** A swatch is a palette name, a hex string, or `{ value, label }`. */
export type ColorSwatch = NeonColor | { value: NeonColor; label?: string };

const defaultSwatches: ColorSwatch[] = neonColorNames.map((name) => ({ value: name, label: capitalize(name) }));

type EyeDropperConstructor = new () => { open: () => Promise<{ sRGBHex: string }> };

const subscribeNothing = () => () => {};

function useEyeDropperSupport() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => "EyeDropper" in window,
    () => false,
  );
}

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";

function PipetteIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  );
}

interface HueKnobProps {
  hue: number;
  onChange: (hue: number) => void;
  size: Size;
  disabled: boolean;
}

/** A rotary hue control: drag around it, scroll on it, or use the arrow keys. */
function HueKnob({ hue, onChange, size, disabled }: HueKnobProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const degrees = Math.round(hue) % 360;
  const px = sizes[size].knob;

  // The wheel listener is bound once, so it reads the latest values from here.
  const latest = React.useRef({ hue, onChange, disabled });
  React.useEffect(() => {
    latest.current = { hue, onChange, disabled };
  });

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const current = latest.current;
      if (current.disabled) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (delta === 0) return;
      event.preventDefault();
      const next = (Math.round(current.hue) + Math.sign(delta) * (event.shiftKey ? 10 : 2) + 360) % 360;
      current.hue = next;
      current.onChange(next);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  function angleFromPointer(event: React.PointerEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    if (x === 0 && y === 0) return degrees;
    return Math.round((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;
  }

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={degrees}
      aria-valuetext={`${degrees} degrees`}
      aria-disabled={disabled || undefined}
      data-dragging={dragging ? "" : undefined}
      style={{ width: px, height: px }}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        onChange(angleFromPointer(event));
      }}
      onPointerMove={(event) => {
        if (dragging) onChange(angleFromPointer(event));
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        if (disabled) return;
        const step = event.shiftKey ? 10 : 1;
        const moves: Record<string, number> = {
          ArrowRight: degrees + step,
          ArrowUp: degrees + step,
          ArrowLeft: degrees - step,
          ArrowDown: degrees - step,
          PageUp: degrees + 15,
          PageDown: degrees - 15,
          Home: 0,
          End: 359,
        };
        if (!(event.key in moves)) return;
        event.preventDefault();
        onChange((moves[event.key] + 360) % 360);
      }}
      className={cn(
        "relative shrink-0 touch-none select-none rounded-full outline-none",
        focusRing,
        disabled ? "cursor-not-allowed" : dragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      {/* Scale ticks, each tinted with the hue it stands for */}
      <svg viewBox="0 0 72 72" aria-hidden className="absolute inset-0 size-full">
        {Array.from({ length: TICKS }, (_, i) => {
          const angle = (i / TICKS) * Math.PI * 2;
          const tickHue = (i / TICKS) * 360;
          const near = Math.abs(((tickHue - hue + 540) % 360) - 180) < 360 / TICKS;
          const outer = i % 3 === 0 ? 35 : 33.5;
          return (
            <line
              key={i}
              x1={36 + Math.sin(angle) * 31}
              y1={36 - Math.cos(angle) * 31}
              x2={36 + Math.sin(angle) * outer}
              y2={36 - Math.cos(angle) * outer}
              stroke={`hsl(${tickHue} 95% 62%)`}
              strokeOpacity={near && !disabled ? 1 : 0.32}
              strokeWidth={1.2}
              strokeLinecap="round"
              className="transition-[stroke-opacity] duration-150"
            />
          );
        })}
      </svg>
      {/* The cap turns with the value; its pointer glows in the pure hue */}
      <div
        aria-hidden
        style={{ transform: `rotate(${hue}deg)` }}
        className="absolute inset-[12.5%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,#262a36,#0c0e14_70%)] shadow-[0_6px_14px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.08)]"
      >
        <span
          style={{
            background: `hsl(${hue} 95% 62%)`,
            boxShadow: `0 0 6px hsl(${hue} 95% 62%), 0 0 12px hsl(${hue} 95% 62% / 0.8)`,
          }}
          className="absolute left-1/2 top-[9%] h-[22%] w-[2px] -translate-x-1/2 rounded-full"
        />
        <span className="absolute inset-[16%] rounded-full border border-dashed border-white/[0.05]" />
      </div>
    </div>
  );
}

interface StripProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  background: string;
  thumbColor: string;
  size: Size;
  disabled: boolean;
}

/** A gradient tube with one thumb, for saturation and lightness (0 to 100). */
function Strip({ label, value, onChange, background, thumbColor, size, disabled }: StripProps) {
  const railRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLSpanElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const percent = Math.round(value);
  const s = sizes[size];

  function valueFromPointer(clientX: number) {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return value;
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  }

  return (
    <div className="grid gap-1.5">
      <div aria-hidden className={cn("flex items-baseline justify-between", s.meta)}>
        <span className="text-white/55">{label}</span>
        <span className="font-mono tabular-nums text-white/80">{percent}%</span>
      </div>
      <div
        className={cn(
          "relative flex touch-none select-none items-center",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          s.strip,
        )}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          thumbRef.current?.focus({ preventScroll: true });
          onChange(valueFromPointer(event.clientX));
        }}
        onPointerMove={(event) => {
          if (dragging) onChange(valueFromPointer(event.clientX));
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <span
          aria-hidden
          style={{ background }}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_2px_rgb(0_0_0/0.45)]",
            s.track,
          )}
        />
        <div ref={railRef} className={cn("absolute inset-y-0", s.rail)}>
          <span
            ref={thumbRef}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent}%`}
            aria-disabled={disabled || undefined}
            onKeyDown={(event) => {
              if (disabled) return;
              const step = event.shiftKey ? 10 : 1;
              const moves: Record<string, number> = {
                ArrowRight: percent + step,
                ArrowUp: percent + step,
                ArrowLeft: percent - step,
                ArrowDown: percent - step,
                PageUp: percent + 10,
                PageDown: percent - 10,
                Home: 0,
                End: 100,
              };
              if (!(event.key in moves)) return;
              event.preventDefault();
              onChange(clamp(moves[event.key], 0, 100));
            }}
            style={{ left: `${value}%`, background: thumbColor }}
            className={cn(
              "absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#eef3fa] outline-none",
              "shadow-[0_0_0_1px_rgb(0_0_0/0.35),0_2px_6px_rgb(0_0_0/0.5)] transition-[transform,scale] duration-150 ease-out motion-reduce:transition-none",
              focusRing,
              dragging && "scale-110",
              s.thumb,
            )}
          />
        </div>
      </div>
    </div>
  );
}

export interface ColorPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** Controlled hex color, like "#22d3ee". */
  value?: string;
  defaultValue?: string;
  /** Called with a lowercase 6-digit hex like "#ff5fa2". */
  onValueChange?: (hex: string) => void;
  /** Gel presets: palette names, hex strings or `{ value, label }`. Defaults to the neon palette. */
  swatches?: ColorSwatch[];
  /** Show the hex field. */
  showInput?: boolean;
  /** Offer the screen color sampler where the browser supports `window.EyeDropper`. */
  eyeDropper?: boolean;
  label?: React.ReactNode;
  size?: Size;
  disabled?: boolean;
  /** Submits the hex value under this name with a surrounding form. */
  name?: string;
  /** Accent for focus rings and the hex field. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Classes for the panel. */
  className?: string;
  /** Classes for the outer block holding the label and panel. */
  containerClassName?: string;
}

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      swatches = defaultSwatches,
      showInput = true,
      eyeDropper = true,
      label,
      size = "md",
      disabled = false,
      name,
      color,
      id: idProp,
      className,
      containerClassName,
      style,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const hexInputId = `${id}-hex`;
    const hexErrorId = `${id}-hex-error`;
    const s = sizes[size];

    const [uncontrolled, setUncontrolled] = React.useState(() => normalizeHex(defaultValue) ?? DEFAULT_HEX);
    const isControlled = valueProp !== undefined;
    const hex = (isControlled ? normalizeHex(valueProp) : null) ?? uncontrolled;

    // HSL lives alongside the hex so the knob keeps its place on greys and
    // dragging doesn't round-trip through 8-bit channels.
    const [hsl, setHsl] = React.useState(() => hslFromHex(hex));
    const [hslHex, setHslHex] = React.useState(hex);
    if (hslHex !== hex) {
      setHslHex(hex);
      setHsl(hslFromHex(hex, hsl));
    }

    const [ignitions, setIgnitions] = React.useState(0);
    const [draft, setDraft] = React.useState<string | null>(null);
    const [attempted, setAttempted] = React.useState(false);
    const canSample = useEyeDropperSupport() && eyeDropper;

    const rgb = hexToRgb(hex).join(" ");

    function emit(nextHex: string) {
      if (nextHex === hex) return;
      if (!isControlled) setUncontrolled(nextHex);
      onValueChange?.(nextHex);
    }

    function commitHsl(next: Hsl) {
      const nextHex = hslToHex(next);
      setHsl(next);
      setHslHex(nextHex);
      emit(nextHex);
    }

    /** Discrete picks (gels, hex, sampler) re-strike the tube. */
    function commitHex(nextHex: string) {
      setHsl(hslFromHex(nextHex, hsl));
      setHslHex(nextHex);
      if (nextHex !== hex) setIgnitions((count) => count + 1);
      emit(nextHex);
    }

    async function sample() {
      const EyeDropper = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
      if (!EyeDropper) return;
      try {
        const result = await new EyeDropper().open();
        const picked = toHex(result.sRGBHex);
        if (picked) commitHex(picked);
      } catch {
        // Dismissed with Escape.
      }
    }

    const draftValid = draft !== null && HEX.test(draft);
    const hexInvalid =
      draft !== null && (/[^0-9a-f#]/i.test(draft) || draft.replace("#", "").length > 6 || (attempted && !draftValid));

    function handleHexChange(event: React.ChangeEvent<HTMLInputElement>) {
      const next = event.target.value.trim();
      setDraft(next);
      setAttempted(false);
      // Six digits is unambiguous, so apply it live. Three waits for Enter or blur.
      if (/^#?[0-9a-f]{6}$/i.test(next)) commitHex(normalizeHex(next)!);
    }

    function finishHex() {
      if (draft !== null && draftValid) commitHex(normalizeHex(draft)!);
      setDraft(null);
      setAttempted(false);
    }

    const swatchList = swatches
      .map((swatch) => {
        const raw = typeof swatch === "string" ? swatch : swatch.value;
        const swatchHex = toHex(raw);
        if (!swatchHex) return null;
        const label =
          typeof swatch !== "string" && swatch.label
            ? swatch.label
            : raw in neonColors
              ? capitalize(raw)
              : swatchHex.toUpperCase();
        return { hex: swatchHex, label, rgb: hexToRgb(swatchHex).join(" ") };
      })
      .filter((swatch) => swatch !== null);
    const checkedIndex = swatchList.findIndex((swatch) => swatch.hex === hex);

    function handleGelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      const gels = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
      const index = gels.indexOf(event.target as HTMLButtonElement);
      if (index === -1 || disabled) return;
      const last = gels.length - 1;
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const next = (
        {
          ArrowRight: rtl ? index - 1 : index + 1,
          ArrowDown: index + 1,
          ArrowLeft: rtl ? index + 1 : index - 1,
          ArrowUp: index - 1,
          Home: 0,
          End: last,
        } as Record<string, number>
      )[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const wrapped = next < 0 ? last : next > last ? 0 : next;
      gels[wrapped].focus();
      commitHex(swatchList[wrapped].hex);
    }

    const samplerButton = canSample && (
      <button
        type="button"
        onClick={sample}
        disabled={disabled}
        aria-label="Pick a color from the screen"
        title="Pick from screen"
        className={cn(
          "grid shrink-0 cursor-pointer place-items-center border border-white/10 bg-white/[0.03] text-white/55 outline-none",
          "transition-[border-color,color,background-color,transform,scale] duration-150 ease-out active:scale-[0.97]",
          "hover:border-white/20 hover:text-white/90 disabled:pointer-events-none",
          focusRing,
          s.button,
        )}
      >
        <PipetteIcon />
      </button>
    );

    return (
      <div className={cn("grid w-full gap-1.5", containerClassName)}>
        {label && (
          <span id={labelId} className={cn("w-fit font-medium text-white/80", s.label)}>
            {label}
          </span>
        )}
        <div
          ref={ref}
          id={id}
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : ariaLabel}
          aria-disabled={disabled || undefined}
          data-disabled={disabled ? "" : undefined}
          style={{ ...neonVars(color, style), "--swatch": rgb } as React.CSSProperties}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "grid w-full border border-white/10 bg-white/[0.03]",
            disabled && "pointer-events-none opacity-50",
            s.panel,
            className,
          )}
          {...props}
        >
          {ignitions > 0 && <style>{keyframes}</style>}

          {/* The preview: a mounted tube lit in the chosen color, washing the wall behind it */}
          <div
            aria-hidden
            className={cn("relative overflow-hidden border border-white/[0.06] bg-[#07080d]", s.preview)}
          >
            <div
              key={ignitions}
              className={cn(
                "absolute inset-0",
                ignitions > 0 && "[animation:neonkit-color-ignite_420ms_linear] motion-reduce:[animation:none]",
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(60%_110%_at_50%_50%,rgb(var(--swatch)/0.24),transparent_72%)]" />
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--swatch))]",
                  "shadow-[0_0_4px_rgb(var(--swatch)),0_0_14px_rgb(var(--swatch)/0.75),0_0_36px_rgb(var(--swatch)/0.4)]",
                  "transition-[background-color,box-shadow] duration-150 ease-out",
                  s.tube,
                )}
              >
                <span
                  style={{ opacity: 0.2 + (hsl.l / 100) * 0.55 }}
                  className="absolute inset-x-[3px] top-1/2 h-px -translate-y-1/2 rounded-full bg-white"
                />
              </div>
            </div>
            {/* Electrodes at the ends and two clips holding the tube to the wall */}
            {s.electrodeSides.map((side) => (
              <span
                key={side}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 rounded-[3px] border border-white/[0.06] bg-[linear-gradient(180deg,#2a2e3a,#111319)] shadow-[0_1px_2px_rgb(0_0_0/0.6)]",
                  s.electrode,
                  side,
                )}
              />
            ))}
            {["left-[30%]", "right-[30%]"].map((side) => (
              <span
                key={side}
                className={cn(
                  "absolute top-1/2 h-[45%] w-1 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#3a3f4c,#14161d)] shadow-[0_1px_2px_rgb(0_0_0/0.7)]",
                  side,
                )}
              />
            ))}
          </div>

          <div className={cn("flex items-center", s.row)}>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <HueKnob
                hue={hsl.h}
                size={size}
                disabled={disabled}
                onChange={(h) => commitHsl({ ...hsl, h })}
              />
              <span aria-hidden className={cn("font-mono tabular-nums text-white/55", s.meta)}>
                {String(Math.round(hsl.h) % 360).padStart(3, "0")}°
              </span>
            </div>
            <div className="grid min-w-0 flex-1 gap-2.5">
              <Strip
                label="Saturation"
                value={hsl.s}
                size={size}
                disabled={disabled}
                thumbColor={`rgb(${hexToRgb(hex).join(",")})`}
                background={`linear-gradient(90deg, hsl(${hsl.h} 0% ${hsl.l}%), hsl(${hsl.h} 100% ${hsl.l}%))`}
                onChange={(sat) => commitHsl({ ...hsl, s: sat })}
              />
              <Strip
                label="Lightness"
                value={hsl.l}
                size={size}
                disabled={disabled}
                thumbColor={`rgb(${hexToRgb(hex).join(",")})`}
                background={`linear-gradient(90deg, #000, hsl(${hsl.h} ${hsl.s}% 50%), #fff)`}
                onChange={(light) => commitHsl({ ...hsl, l: light })}
              />
            </div>
          </div>

          {swatchList.length > 0 && (
            <div className="flex items-center justify-between gap-2">
              <div
                role="radiogroup"
                aria-label="Preset colors"
                onKeyDown={handleGelKeyDown}
                className="flex flex-wrap gap-1"
              >
                {swatchList.map((swatch, i) => {
                  const checked = i === checkedIndex;
                  const tabbable = checked || (checkedIndex === -1 && i === 0);
                  return (
                    <button
                      key={`${swatch.hex}-${i}`}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      aria-label={swatch.label}
                      title={swatch.label}
                      tabIndex={tabbable && !disabled ? 0 : -1}
                      disabled={disabled}
                      onClick={() => commitHex(swatch.hex)}
                      className={cn(
                        "group/gel grid cursor-pointer place-items-center rounded-md outline-none",
                        focusRing,
                        s.gel,
                      )}
                    >
                      <span
                        style={{
                          background: `rgb(${swatch.rgb})`,
                          boxShadow: checked
                            ? `0 0 8px rgb(${swatch.rgb}), 0 0 16px rgb(${swatch.rgb} / 0.6)`
                            : "inset 0 0 0 1px rgb(255 255 255 / 0.12)",
                        }}
                        className={cn(
                          "rounded-full transition-[transform,scale,box-shadow,opacity] duration-150 ease-out motion-reduce:transition-none",
                          checked ? "scale-y-110" : "opacity-50 group-hover/gel:opacity-100",
                          s.gelTube,
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              {!showInput && samplerButton}
            </div>
          )}

          {showInput && (
            <div className="grid gap-1.5">
              <div className="flex items-center gap-2">
                <div
                  style={hexInvalid ? neonVars(INVALID) : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 cursor-text items-center border border-white/10 bg-white/[0.03] text-white/90",
                    "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
                    "focus-within:border-[rgb(var(--neon)/0.8)] focus-within:bg-[rgb(var(--neon)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
                    "hover:[&:not(:focus-within)]:border-white/20",
                    hexInvalid && "border-[rgb(var(--neon)/0.55)]",
                    s.field,
                  )}
                >
                  <label htmlFor={hexInputId} className={cn("shrink-0 cursor-text font-mono text-white/35", s.hash)}>
                    <span aria-hidden>#</span>
                    <span className="sr-only">Hex color</span>
                  </label>
                  <input
                    id={hexInputId}
                    value={draft ?? hex.slice(1).toUpperCase()}
                    disabled={disabled}
                    maxLength={7}
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="characters"
                    aria-invalid={hexInvalid || undefined}
                    aria-describedby={hexInvalid ? hexErrorId : undefined}
                    onChange={handleHexChange}
                    onBlur={finishHex}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (draft === null) return;
                        if (draftValid) finishHex();
                        else setAttempted(true);
                      } else if (event.key === "Escape" && draft !== null) {
                        event.preventDefault();
                        setDraft(null);
                        setAttempted(false);
                      }
                    }}
                    className={cn(
                      "h-full w-full min-w-0 flex-1 bg-transparent pl-1 font-mono uppercase tracking-[0.08em] text-inherit outline-none",
                      s.fieldPad,
                    )}
                  />
                </div>
                {samplerButton}
              </div>
              {hexInvalid && (
                <p id={hexErrorId} className="text-xs leading-5 text-[#ff4d5e]">
                  Use 3 or 6 hex digits, like 22D3EE.
                </p>
              )}
            </div>
          )}
        </div>
        {name && <input type="hidden" name={name} value={hex} disabled={disabled} />}
      </div>
    );
  },
);
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
