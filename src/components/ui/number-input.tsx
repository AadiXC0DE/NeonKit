"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Minus, Plus } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// Pixels of drag per step while scrubbing: Shift moves by largeStep, Alt slows down for precision.
const SCRUB = {
  normal: { pixels: 2, large: false },
  coarse: { pixels: 4, large: true },
  fine: { pixels: 10, large: false },
} as const;
type ScrubMode = keyof typeof SCRUB;

const sizes = {
  sm: {
    field: "h-8 rounded-md text-xs",
    input: "px-2.5",
    leading: "pl-2.5 [&_svg]:size-3.5",
    trailing: "pr-2.5 [&_svg]:size-3.5",
    afterLeading: "pl-1.5",
    beforeTrailing: "pr-1.5",
    stepper: "w-7 [&_svg]:size-3.5",
    label: "text-xs",
  },
  md: {
    field: "h-10 rounded-lg text-sm",
    input: "px-3",
    leading: "pl-3 [&_svg]:size-4",
    trailing: "pr-3 [&_svg]:size-4",
    afterLeading: "pl-2",
    beforeTrailing: "pr-2",
    stepper: "w-8 [&_svg]:size-4",
    label: "text-sm",
  },
  lg: {
    field: "h-12 rounded-xl text-base",
    input: "px-4",
    leading: "pl-4 [&_svg]:size-[18px]",
    trailing: "pr-4 [&_svg]:size-[18px]",
    afterLeading: "pl-2.5",
    beforeTrailing: "pr-2.5",
    stepper: "w-10 [&_svg]:size-[18px]",
    label: "text-sm",
  },
} as const;

type PageCursor = { cursor: string; userSelect: string };

/** Holds the scrub cursor on the whole page while dragging, and returns what was there. */
function setPageCursor(next: PageCursor): PageCursor {
  const style = document.documentElement.style;
  const previous = { cursor: style.cursor, userSelect: style.userSelect };
  style.cursor = next.cursor;
  style.userSelect = next.userSelect;
  return previous;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function decimals(value: number) {
  if (!Number.isFinite(value)) return 0;
  const [mantissa, exponent] = value.toExponential().split("e");
  const fraction = mantissa.split(".")[1]?.length ?? 0;
  return Math.max(0, fraction - Number(exponent));
}

function roundTo(value: number, places: number) {
  const factor = 10 ** Math.min(places, 12);
  return Math.round(value * factor) / factor;
}

/**
 * Reads what people type: "$1,299.50", "1 299,5" (in a comma-decimal locale), "15%", "-3 kg".
 * Returns null for an empty field and NaN for text with no number in it.
 */
function parseNumber(text: string, locale: string | undefined, options: Intl.NumberFormatOptions) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((part) => part.type === "group")?.value ?? ",";
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";

  let body = trimmed.replace(/[\u2212\u2012\u2013]/g, "-");
  const negative = /^[^\d]*[-(]/.test(body);

  // "12.5" typed in a comma-decimal locale reads as a decimal, unless it looks like grouping ("1.250").
  if (decimal !== "." && !body.includes(decimal) && /^\D*\d+\.(\d{1,2}|\d{4,})\D*$/.test(body)) {
    body = body.replace(".", decimal);
  }

  // Group separators go, including the spaces some locales use for them.
  body = body.split(group).join("");
  if (/\s/.test(group)) body = body.replace(/[\s\u00a0\u202f]/g, "");
  if (decimal !== ".") body = body.split(".").join("").split(decimal).join(".");

  const digits = body.replace(/[^\d.]/g, "");
  const firstDot = digits.indexOf(".");
  const normalized =
    firstDot === -1 ? digits : digits.slice(0, firstDot + 1) + digits.slice(firstDot + 1).replace(/\./g, "");
  if (!/\d/.test(normalized)) return Number.NaN;

  let result = Number(normalized);
  if (options.style === "percent") result /= 100;
  if (options.notation === "compact") result = Number((result * compactMultiplier(trimmed, locale)).toPrecision(15));
  return negative ? -result : result;
}

/** Reads a compact suffix back into its magnitude: "12.5K" is 12,500, "3 Mio." is 3,000,000. */
function compactMultiplier(text: string, locale: string | undefined) {
  const compact = new Intl.NumberFormat(locale, { notation: "compact" });
  const lower = text.toLowerCase();
  for (const magnitude of [1e12, 1e9, 1e6, 1e3]) {
    const symbol = compact.formatToParts(magnitude).find((part) => part.type === "compact")?.value;
    if (symbol && lower.includes(symbol.toLowerCase())) return magnitude;
  }
  return 1;
}

/**
 * True once the browser rejects the field on submit (required, type, pattern), until it's
 * edited, its value changes or the form resets. The browser still shows its own message;
 * this keeps the field red after that bubble fades.
 */
function useRejected(ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, value?: string) {
  const [rejected, setRejected] = React.useState<{ value?: string } | null>(null);
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  });
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const form = element.form;
    const flag = () => setRejected({ value: valueRef.current });
    const clear = () => setRejected(null);
    element.addEventListener("invalid", flag);
    element.addEventListener("input", clear);
    form?.addEventListener("reset", clear);
    return () => {
      element.removeEventListener("invalid", flag);
      element.removeEventListener("input", clear);
      form?.removeEventListener("reset", clear);
    };
  }, [ref]);
  return rejected !== null && rejected.value === value;
}

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "color" | "size" | "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
  > {
  /** Controlled value. `null` is an empty field. */
  value?: number | null;
  defaultValue?: number | null;
  /** Called when a value is committed: on blur, Enter, stepping and scrubbing. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Amount for the arrow keys, the stepper buttons and scrubbing. */
  step?: number;
  /** Amount for Shift+Arrow, PageUp and PageDown, and Shift while scrubbing. */
  largeStep?: number;
  /** How the value displays: currency, percent, units, fraction digits. */
  formatOptions?: Intl.NumberFormatOptions;
  /** BCP 47 locale for formatting and parsing. Defaults to the browser's. */
  locale?: string;
  /** Drag the label or leading addon sideways to change the value. */
  scrub?: boolean;
  /** Icon or text addon before the value. Scrubs when `scrub` is on. */
  leading?: React.ReactNode;
  /** Icon or text addon after the value, before the steppers. */
  trailing?: React.ReactNode;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  label?: React.ReactNode;
  /** Helper text under the field. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Classes for the field box: the bordered wrapper around the input and steppers. */
  className?: string;
  /** Classes for the outer block holding the label, field and message. */
  containerClassName?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      min,
      max,
      step = 1,
      largeStep = 10,
      formatOptions,
      locale,
      scrub = true,
      leading,
      trailing,
      color,
      size = "md",
      label,
      description,
      error,
      name,
      disabled,
      readOnly,
      required,
      id: idProp,
      className,
      containerClassName,
      style,
      onKeyDown,
      onBlur,
      onFocus,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const errored = Boolean(error);
    const message = errored ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${errored ? "error" : "description"}` : undefined;
    const rejected = useRejected(inputRef);
    const invalid = errored || rejected;
    const s = sizes[size];
    const locked = Boolean(disabled || readOnly);

    const [uncontrolled, setUncontrolled] = React.useState<number | null>(defaultValue);
    const value = valueProp !== undefined ? valueProp : uncontrolled;
    // What's being typed, until it's committed. null means "show the formatted value".
    const [draft, setDraft] = React.useState<string | null>(null);
    const [scrubbing, setScrubbing] = React.useState(false);

    const optionsKey = JSON.stringify(formatOptions ?? {});
    const formatter = React.useMemo(
      () => new Intl.NumberFormat(locale, JSON.parse(optionsKey) as Intl.NumberFormatOptions),
      [locale, optionsKey],
    );
    const formatted = value === null ? "" : formatter.format(value);
    const text = draft ?? formatted;

    // Timers and drags read the latest value without waiting for a render.
    const valueRef = React.useRef(value);
    useIsomorphicLayoutEffect(() => {
      valueRef.current = value;
    });

    const repeat = React.useRef<number | null>(null);
    const drag = React.useRef<{
      pointerId: number;
      startX: number;
      startValue: number;
      mode: ScrubMode;
      moved: boolean;
      fromLeading: boolean;
    } | null>(null);
    const suppressLabelClick = React.useRef(false);
    const savedCursor = React.useRef<{ cursor: string; userSelect: string } | null>(null);

    const precision = Math.max(decimals(step), decimals(largeStep), min !== undefined ? decimals(min) : 0);
    const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

    function setValue(next: number | null) {
      const previous = valueRef.current;
      valueRef.current = next;
      if (valueProp === undefined) setUncontrolled(next);
      if (next !== previous) onValueChange?.(next);
    }

    /** Commits the typed text, returning the value that's now in place. */
    function commitDraft() {
      if (draft === null) return valueRef.current;
      setDraft(null);
      const parsed = parseNumber(draft, locale, formatOptions ?? {});
      if (Number.isNaN(parsed)) return valueRef.current;
      const next = parsed === null ? null : clamp(parsed);
      setValue(next);
      return next;
    }

    function tick(direction: 1 | -1) {
      const input = inputRef.current;
      if (!input || typeof input.animate !== "function" || prefersReducedMotion()) return;
      // Up comes in from below, down from above, like a counter rolling over.
      input.animate(
        [
          { transform: `translateY(${direction * 6}px)`, opacity: 0.2 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        { duration: 180, easing: EASE },
      );
    }

    /** Moves to the next multiple of `amount` in `direction`, so 12 steps by 5 to 15 rather than 17. */
    function stepFrom(base: number | null, direction: 1 | -1, amount: number) {
      if (base === null) return clamp(min ?? 0);
      const origin = min ?? 0;
      const offset = (base - origin) / amount;
      const index =
        direction > 0 ? Math.floor(offset + 1e-9) + 1 : Math.ceil(offset - 1e-9) - 1;
      return clamp(roundTo(origin + index * amount, Math.max(precision, decimals(base))));
    }

    /** Returns false once the value can't move further that way. */
    function stepBy(direction: 1 | -1, amount: number, base = valueRef.current) {
      const next = stepFrom(base, direction, amount);
      if (next === base) return false;
      setValue(next);
      tick(direction);
      return true;
    }

    // A form reset puts the starting number back and drops anything half typed.
    const initialValue = React.useRef(value);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        setDraft(null);
        setValue(initialValue.current);
      };
    });
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    function stopRepeat() {
      if (repeat.current !== null) window.clearTimeout(repeat.current);
      repeat.current = null;
    }

    React.useEffect(
      () => () => {
        stopRepeat();
        const saved = savedCursor.current;
        if (saved) setPageCursor(saved);
      },
      [],
    );

    function startRepeat(event: React.PointerEvent<HTMLButtonElement>, direction: 1 | -1) {
      if (event.button !== 0 || locked) return;
      event.preventDefault();
      // Keep typing focus in the field, but don't summon a touch keyboard for a tap on +.
      if (event.pointerType !== "touch") inputRef.current?.focus({ preventScroll: true });
      stopRepeat();
      const base = commitDraft();
      if (!stepBy(direction, step, base)) return;
      let delay = 90;
      const run = () => {
        if (!stepBy(direction, step)) return stopRepeat();
        delay = Math.max(35, delay * 0.92);
        repeat.current = window.setTimeout(run, delay);
      };
      repeat.current = window.setTimeout(run, 400);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented || locked) return;

      const amount = (large: boolean) => (large ? largeStep : step);
      let direction: 1 | -1 | 0 = 0;
      let large = false;
      switch (event.key) {
        case "ArrowUp":
          direction = 1;
          large = event.shiftKey;
          break;
        case "ArrowDown":
          direction = -1;
          large = event.shiftKey;
          break;
        case "PageUp":
          direction = 1;
          large = true;
          break;
        case "PageDown":
          direction = -1;
          large = true;
          break;
        case "Home":
        case "End": {
          const bound = event.key === "Home" ? min : max;
          if (bound === undefined) return;
          event.preventDefault();
          const before = commitDraft();
          if (before !== bound) {
            setValue(bound);
            tick(event.key === "Home" ? -1 : 1);
          }
          return;
        }
        case "Enter":
          // Commit synchronously so a submitting form reads the new value.
          if (draft !== null) flushSync(() => commitDraft());
          return;
        case "Escape":
          if (draft !== null) {
            event.preventDefault();
            event.stopPropagation();
            setDraft(null);
          }
          return;
        default:
          return;
      }

      event.preventDefault();
      stepBy(direction, amount(large), commitDraft());
    }

    function scrubMode(event: React.PointerEvent): ScrubMode {
      if (event.altKey) return "fine";
      if (event.shiftKey) return "coarse";
      return "normal";
    }

    const canScrub = scrub && !locked;

    function scrubStart(event: React.PointerEvent<HTMLElement>, fromLeading: boolean) {
      if (!canScrub || event.button !== 0) return;
      const base = commitDraft();
      drag.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startValue: base ?? clamp(min ?? 0),
        mode: scrubMode(event),
        moved: false,
        fromLeading,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    function scrubMove(event: React.PointerEvent<HTMLElement>) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;

      if (!current.moved) {
        // A few pixels of slack, so a click on the label still just focuses the field.
        if (Math.abs(event.clientX - current.startX) < 3) return;
        current.moved = true;
        current.startX = event.clientX;
        setScrubbing(true);
        savedCursor.current = setPageCursor({ cursor: "ew-resize", userSelect: "none" });
      }

      // Changing modifiers mid-drag continues from here instead of jumping.
      const mode = scrubMode(event);
      if (mode !== current.mode) {
        current.mode = mode;
        current.startX = event.clientX;
        current.startValue = valueRef.current ?? current.startValue;
      }

      const { pixels, large } = SCRUB[current.mode];
      const amount = large ? largeStep : step;
      const units = Math.trunc((event.clientX - current.startX) / pixels);
      const raw = roundTo(current.startValue + units * amount, Math.max(precision, decimals(current.startValue)));
      const next = clamp(raw);
      // Pinned at a bound, so reversing direction responds at once.
      if (next !== raw) {
        current.startValue = next;
        current.startX = event.clientX;
      }
      if (next !== valueRef.current) setValue(next);
    }

    function scrubEnd(event: React.PointerEvent<HTMLElement>) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      drag.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (current.moved) {
        suppressLabelClick.current = !current.fromLeading;
        setScrubbing(false);
        const saved = savedCursor.current;
        savedCursor.current = null;
        if (saved) setPageCursor(saved);
      } else if (current.fromLeading && event.pointerType !== "touch") {
        inputRef.current?.focus();
      }
    }


    // Clicks on the padding land in the input, like a native field.
    function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
      const target = event.target as HTMLElement;
      if (target === inputRef.current) return;
      if (target.closest("button, a, input, [data-scrub-handle]")) return;
      event.preventDefault();
      inputRef.current?.focus();
    }

    const atMin = value !== null && min !== undefined && value <= min;
    const atMax = value !== null && max !== undefined && value >= max;
    const integerOnly =
      Number.isInteger(step) && min !== undefined && min >= 0 && formatOptions?.style !== "percent";

    const stepperButton = (direction: 1 | -1) => {
      const blocked = locked || (direction > 0 ? atMax : atMin);
      return (
        <button
          type="button"
          tabIndex={-1}
          aria-label={direction > 0 ? "Increase" : "Decrease"}
          aria-controls={id}
          disabled={blocked}
          onPointerDown={(event) => startRepeat(event, direction)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          onPointerCancel={stopRepeat}
          onContextMenu={(event) => event.preventDefault()}
          onClick={(event) => {
            // Pointer presses are handled on pointerdown; this is for keyboard and assistive tech clicks.
            if (event.detail === 0) stepBy(direction, step, commitDraft());
          }}
          className={cn(
            "flex h-full shrink-0 cursor-pointer select-none items-center justify-center text-white/50 outline-none touch-manipulation",
            "transition-[background-color,color] duration-150 ease-out",
            "hover:bg-white/[0.04] hover:text-white/90",
            "active:bg-[rgb(var(--neon)/0.1)] active:text-[rgb(var(--neon))] active:[&_svg]:[filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.8))]",
            "disabled:cursor-not-allowed disabled:text-white/20 disabled:hover:bg-transparent",
            direction > 0 && "border-l border-white/[0.06]",
            s.stepper,
          )}
        >
          {direction > 0 ? <Plus aria-hidden /> : <Minus aria-hidden />}
        </button>
      );
    };

    return (
      <div
        style={neonVars(color)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-1.5", containerClassName)}
      >
        {label && (
          <label
            htmlFor={id}
            onPointerDown={canScrub ? (event) => scrubStart(event, false) : undefined}
            onPointerMove={canScrub ? scrubMove : undefined}
            onPointerUp={canScrub ? scrubEnd : undefined}
            onPointerCancel={canScrub ? scrubEnd : undefined}
            onClick={(event) => {
              if (suppressLabelClick.current) {
                suppressLabelClick.current = false;
                event.preventDefault();
              }
            }}
            className={cn(
              "w-fit select-none font-medium text-white/80 transition-[color,text-shadow] duration-150",
              canScrub && "cursor-ew-resize touch-none hover:text-white",
              scrubbing && "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]",
              s.label,
            )}
          >
            {label}
            {required && (
              <span
                aria-hidden
                title="Required"
                className="relative -top-px ml-1.5 inline-block size-[5px] rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_4px_rgb(var(--neon)/0.9),0_0_10px_rgb(var(--neon)/0.5)]"
              />
            )}
          </label>
        )}
        <div
          style={neonVars(invalid ? INVALID : undefined, style)}
          onMouseDown={handleMouseDown}
          data-scrubbing={scrubbing || undefined}
          className={cn(
            "group/field relative flex w-full cursor-text items-center overflow-hidden border border-white/10 bg-white/[0.03] text-white/90",
            "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
            "focus-within:border-[rgb(var(--neon)/0.8)] focus-within:bg-[rgb(var(--neon)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
            scrubbing &&
              "border-[rgb(var(--neon)/0.8)] bg-[rgb(var(--neon)/0.04)] shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
            !disabled && "hover:[&:not(:focus-within)]:border-white/20",
            invalid && "border-[rgb(var(--neon)/0.55)] hover:[&:not(:focus-within)]:border-[rgb(var(--neon)/0.75)]",
            readOnly &&
              "border-white/[0.08] bg-transparent text-white/70 focus-within:border-[rgb(var(--neon)/0.45)] focus-within:bg-transparent focus-within:shadow-none",
            disabled && "cursor-not-allowed opacity-50",
            s.field,
            className,
          )}
        >
          {leading && (
            <span
              data-scrub-handle={canScrub || undefined}
              onPointerDown={canScrub ? (event) => scrubStart(event, true) : undefined}
              onPointerMove={canScrub ? scrubMove : undefined}
              onPointerUp={canScrub ? scrubEnd : undefined}
              onPointerCancel={canScrub ? scrubEnd : undefined}
              className={cn(
                "flex h-full shrink-0 select-none items-center text-white/50",
                "[&_svg]:transition-colors [&_svg]:duration-200 group-focus-within/field:[&_svg]:text-[rgb(var(--neon)/0.9)]",
                canScrub && "cursor-ew-resize touch-none hover:text-white/70",
                scrubbing && "text-[rgb(var(--neon))]",
                s.leading,
              )}
            >
              {leading}
            </span>
          )}
          <input
            {...props}
            ref={inputRef}
            id={id}
            type="text"
            role="spinbutton"
            inputMode={integerOnly ? "numeric" : "decimal"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-valuenow={value ?? undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={formatted || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={[ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined}
            value={text}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={(event) => {
              onBlur?.(event);
              commitDraft();
            }}
            className={cn(
              "h-full w-full min-w-0 flex-1 bg-transparent tabular-nums text-inherit outline-none placeholder:text-white/50",
              "transition-[color,text-shadow] duration-150 disabled:cursor-not-allowed",
              scrubbing && "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.5)]",
              s.input,
              leading && s.afterLeading,
              trailing && s.beforeTrailing,
            )}
          />
          {trailing && (
            <span className={cn("flex shrink-0 items-center text-white/50", s.trailing)}>{trailing}</span>
          )}
          <div className="flex h-full shrink-0 items-stretch border-l border-white/10">
            {stepperButton(-1)}
            {stepperButton(1)}
          </div>
        </div>
        {name && <input type="hidden" name={name} value={value ?? ""} disabled={disabled} />}
        {message && (
          <p id={messageId} className={cn("text-xs leading-5", errored ? "text-[#ff4d5e]" : "text-white/55")}>
            {message}
          </p>
        )}
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
