"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const sizes = {
  sm: {
    field: "h-8 rounded-md text-xs",
    leading: "pl-2.5 [&_svg]:size-3.5",
    track: "px-2.5",
    afterLeading: "pl-1.5",
    segment: "h-6 rounded-[4px] px-[3px]",
    label: "text-xs",
  },
  md: {
    field: "h-10 rounded-lg text-sm",
    leading: "pl-3 [&_svg]:size-4",
    track: "px-3",
    afterLeading: "pl-2",
    segment: "h-7 rounded-md px-1",
    label: "text-sm",
  },
  lg: {
    field: "h-12 rounded-xl text-base",
    leading: "pl-4 [&_svg]:size-[18px]",
    track: "px-4",
    afterLeading: "pl-2.5",
    segment: "h-8 rounded-md px-[5px]",
    label: "text-sm",
  },
} as const;

type Part = "hour" | "minute" | "second" | "period";
type Parts = Record<Part, number | null>;
type Pending = { part: Part; text: string };

const EMPTY: Parts = { hour: null, minute: null, second: null, period: null };
const NAMES: Record<Part, string> = { hour: "Hours", minute: "Minutes", second: "Seconds", period: "AM/PM" };
const SEPARATORS = ":.,/- ";

const pad = (value: number) => String(value).padStart(2, "0");

function fromTime(hours: number, minutes: number, seconds: number, cycle: 12 | 24): Parts {
  return cycle === 12
    ? { hour: hours % 12 || 12, minute: minutes, second: seconds, period: hours >= 12 ? 1 : 0 }
    : { hour: hours, minute: minutes, second: seconds, period: null };
}

/** Reads "HH:mm" or "HH:mm:ss" in 24-hour time. */
function parse(value: string | undefined, cycle: 12 | 24): Parts {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value?.trim() ?? "");
  if (!match) return EMPTY;
  const [hours, minutes, seconds] = [match[1], match[2], match[3] ?? "0"].map(Number);
  if (hours > 23 || minutes > 59 || seconds > 59) return EMPTY;
  return fromTime(hours, minutes, seconds, cycle);
}

/** Reads pasted text like "14:30", "9.05", "2:30 pm" or "09:15:40". */
function parseLoose(text: string, cycle: 12 | 24): Parts | null {
  const match = /(\d{1,2})\s*[:.h]\s*(\d{2})(?:\s*[:.]\s*(\d{2}))?\s*([ap])?/i.exec(text);
  if (!match) return null;
  const [typedHours, minutes, seconds] = [match[1], match[2], match[3] ?? "0"].map(Number);
  const period = match[4]?.toLowerCase();
  if (period && (typedHours < 1 || typedHours > 12)) return null;
  const hours = period ? (typedHours % 12) + (period === "p" ? 12 : 0) : typedHours;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return fromTime(hours, minutes, seconds, cycle);
}

function format(parts: Parts, cycle: 12 | 24, showSeconds: boolean) {
  const { hour, minute, second, period } = parts;
  if (hour === null || minute === null) return "";
  if (showSeconds && second === null) return "";
  if (cycle === 12 && period === null) return "";
  const hours = cycle === 12 ? (hour % 12) + (period ? 12 : 0) : hour;
  return `${pad(hours)}:${pad(minute)}${showSeconds ? `:${pad(second ?? 0)}` : ""}`;
}

function convert(parts: Parts, from: 12 | 24, to: 12 | 24): Parts {
  if (from === to || parts.hour === null) return { ...parts, period: to === 12 ? parts.period : null };
  if (to === 12) return { ...parts, hour: parts.hour % 12 || 12, period: parts.hour >= 12 ? 1 : 0 };
  // A 12-hour value without AM or PM yet reads as AM.
  return { ...parts, hour: (parts.hour % 12) + (parts.period ? 12 : 0), period: null };
}

/** Moves one step up or down a segment's values, wrapping at the ends and snapping to `step`. */
function stepValue(current: number | null, direction: 1 | -1, min: number, max: number, step: number) {
  const count = Math.floor((max - min) / step) + 1;
  let slot: number;
  if (current === null) slot = direction > 0 ? 0 : count - 1;
  else {
    const position = (current - min) / step;
    slot = direction > 0 ? Math.floor(position) + 1 : Math.ceil(position) - 1;
  }
  return min + (((slot % count) + count) % count) * step;
}

const subscribe = () => () => {};

/** The runtime locale on the client; on the server, the explicit locale or en-US. */
function useResolvedLocale(locale?: string) {
  return React.useSyncExternalStore(
    subscribe,
    () => locale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US"),
    () => locale ?? "en-US",
  );
}

function readLocale(locale: string) {
  try {
    const hourCycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
    const twelve = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hourCycle: "h12" });
    const periodOf = (hours: number) =>
      twelve.formatToParts(new Date(2000, 0, 1, hours)).find((part) => part.type === "dayPeriod")?.value;
    const order = twelve.formatToParts(new Date(2000, 0, 1, 9)).map((part) => part.type);
    return {
      cycle: (hourCycle === "h11" || hourCycle === "h12" ? 12 : 24) as 12 | 24,
      periods: [periodOf(9) ?? "AM", periodOf(21) ?? "PM"] as const,
      // Korean, Japanese and Chinese put the day period first: 오전 9:00.
      periodFirst: order.indexOf("dayPeriod") < order.indexOf("hour"),
    };
  } catch {
    return { cycle: 24 as const, periods: ["AM", "PM"] as const, periodFirst: false };
  }
}

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

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

export interface TimeInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** Controlled value, "HH:mm" or "HH:mm:ss" in 24-hour time. Empty string for no time. */
  value?: string;
  defaultValue?: string;
  /** Called with "HH:mm" (or "HH:mm:ss") once every segment is filled, and "" when it's cleared. */
  onValueChange?: (value: string) => void;
  /** 12 shows an AM/PM segment. Defaults to the locale's clock. */
  hourCycle?: 12 | 24;
  /** BCP 47 tag for the default clock and the AM/PM labels. Defaults to the browser's language. */
  locale?: string;
  /** Adds a seconds segment and includes seconds in the value. */
  showSeconds?: boolean;
  /** Arrow keys and scrubbing move minutes by this much. Typed minutes can be anything. */
  minuteStep?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  disabled?: boolean;
  /** Submits the value under this name with a surrounding form. */
  name?: string;
  /** Blocks form submission until every segment is filled. */
  required?: boolean;
  /** Icon before the time. Pass null to remove the clock. */
  leading?: React.ReactNode;
  label?: React.ReactNode;
  /** Helper text under the field. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Classes for the field box around the segments. */
  className?: string;
  /** Classes for the outer block holding the label, field and message. */
  containerClassName?: string;
}

const TimeInput = React.forwardRef<HTMLDivElement, TimeInputProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      hourCycle: hourCycleProp,
      locale,
      showSeconds = false,
      minuteStep = 1,
      color,
      size = "md",
      disabled = false,
      name,
      required = false,
      leading = <ClockIcon />,
      label,
      description,
      error,
      className,
      containerClassName,
      style,
      id: idProp,
      onMouseDown,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const errored = Boolean(error);
    const message = errored ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${errored ? "error" : "description"}` : undefined;
    const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;
    const s = sizes[size];

    const resolvedLocale = useResolvedLocale(locale);
    const localeInfo = React.useMemo(() => readLocale(resolvedLocale), [resolvedLocale]);
    const cycle = hourCycleProp ?? localeInfo.cycle;
    const step = Math.min(Math.max(1, Math.round(minuteStep)), 30);

    const [parts, setParts] = React.useState<Parts>(() => parse(value ?? defaultValue, cycle));
    const [pending, setPending] = React.useState<Pending | null>(null);
    const [active, setActive] = React.useState(-1);

    // Follow the clock and controlled value when they change from outside.
    const [seenCycle, setSeenCycle] = React.useState(cycle);
    const [seenValue, setSeenValue] = React.useState(value);
    let current = parts;
    if (seenCycle !== cycle) {
      current = convert(parts, seenCycle, cycle);
      setSeenCycle(cycle);
      setParts(current);
    }
    if (value !== undefined && value !== seenValue) {
      setSeenValue(value);
      if (value !== format(current, cycle, showSeconds)) {
        current = parse(value, cycle);
        setParts(current);
        setPending(null);
      }
    }

    const segments: Part[] = [
      ...(cycle === 12 && localeInfo.periodFirst ? (["period"] as const) : []),
      "hour",
      "minute",
      ...(showSeconds ? (["second"] as const) : []),
      ...(cycle === 12 && !localeInfo.periodFirst ? (["period"] as const) : []),
    ];

    const bounds = (part: Part): [number, number] =>
      part === "hour" ? (cycle === 12 ? [1, 12] : [0, 23]) : part === "period" ? [0, 1] : [0, 59];

    const segmentRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
    const trackRef = React.useRef<HTMLDivElement>(null);
    const tubeRef = React.useRef<HTMLSpanElement>(null);
    const tubeShown = React.useRef(false);

    // The lit tube glides under whichever segment has focus. Measured, then moved with transform only.
    useIsomorphicLayoutEffect(() => {
      const tube = tubeRef.current;
      if (!tube) return;
      const segment = active >= 0 ? segmentRefs.current[active] : null;
      if (!segment) {
        tube.style.opacity = "0";
        tubeShown.current = false;
        return;
      }
      const inset = 2;
      const width = Math.max(segment.offsetWidth - inset * 2, 4);
      const x = segment.offsetLeft + inset;
      const y = segment.offsetTop + segment.offsetHeight + 1;
      const transform = `translate(${x}px, ${y}px) scaleX(${width / 16})`;
      if (!tubeShown.current) {
        // Appear in place instead of sliding in from wherever it was last.
        tube.style.transition = "none";
        tube.style.transform = transform;
        void tube.offsetWidth;
        tube.style.transition = "";
      } else {
        tube.style.transform = transform;
      }
      tube.style.opacity = "1";
      tubeShown.current = true;
    });

    function commit(next: Parts) {
      const before = format(current, cycle, showSeconds);
      const after = format(next, cycle, showSeconds);
      setParts(next);
      if (after !== before) onValueChange?.(after);
    }

    function focusSegment(index: number) {
      segmentRefs.current[Math.max(0, Math.min(index, segments.length - 1))]?.focus();
    }

    /** Applies typed characters from `index` on. Returns where focus should end up. */
    function type(index: number, text: string) {
      let next = { ...current };
      let nextPending = pending;
      let at = index;

      for (const char of text) {
        const part = segments[at];
        if (/\d/.test(char) && part !== "period") {
          const [min, max] = bounds(part);
          let typed = (nextPending?.part === part ? nextPending.text : "") + char;
          if (Number(typed) > max || typed.length > 2) typed = char;
          const number = Number(typed);
          // On a 12-hour clock "0" waits for a second digit, and "00" means 12.
          if (number >= min) next = { ...next, [part]: number };
          else if (typed.length === 2) next = { ...next, [part]: max };
          const done = typed.length === 2 || number * 10 > max;
          nextPending = done ? null : { part, text: typed };
          if (done && at < segments.length - 1) at += 1;
        } else if (part === "period" && /\p{L}/u.test(char)) {
          const letter = char.toLowerCase();
          const [am, pm] = localeInfo.periods.map((label) => label.toLowerCase());
          const period = letter === "a" || am.startsWith(letter) ? 0 : letter === "p" || pm.startsWith(letter) ? 1 : null;
          if (period === null) continue;
          next = { ...next, period };
          nextPending = null;
          if (at < segments.length - 1) at += 1;
        } else if (SEPARATORS.includes(char)) {
          nextPending = null;
          if (at < segments.length - 1) at += 1;
        }
      }

      if (at !== index) focusSegment(at);
      setPending(nextPending);
      commit(next);
    }

    function adjust(part: Part, direction: 1 | -1, amount = 1) {
      const [min, max] = bounds(part);
      let next = current[part];
      for (let i = 0; i < amount; i++) {
        next = stepValue(next, direction, min, max, part === "minute" ? step : 1);
      }
      setPending(null);
      commit({ ...current, [part]: next });
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLSpanElement>, index: number) {
      if (disabled) return;
      const part = segments[index];
      const { key } = event;

      switch (key) {
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          adjust(part, key === "ArrowUp" ? 1 : -1);
          return;
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          focusSegment(index + (key === "ArrowLeft" ? -1 : 1));
          return;
        case "Home":
        case "End": {
          event.preventDefault();
          const [min, max] = bounds(part);
          setPending(null);
          commit({ ...current, [part]: key === "Home" ? min : stepValue(null, -1, min, max, part === "minute" ? step : 1) });
          return;
        }
        case "Backspace":
        case "Delete":
          event.preventDefault();
          setPending(null);
          if (current[part] === null && key === "Backspace") focusSegment(index - 1);
          else commit({ ...current, [part]: null });
          return;
        case "Enter":
          event.preventDefault();
          event.currentTarget.closest("form")?.requestSubmit();
          return;
      }

      if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        type(index, key);
      }
    }

    // Mobile keyboards often send "Unidentified" keydowns; the text arrives in beforeinput.
    const typeRef = React.useRef(type);
    const keyRef = React.useRef(handleKeyDown);
    useIsomorphicLayoutEffect(() => {
      typeRef.current = type;
      keyRef.current = handleKeyDown;
    });
    React.useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      const onBeforeInput = (event: InputEvent) => {
        const index = segmentRefs.current.indexOf(event.target as HTMLSpanElement);
        event.preventDefault();
        if (index < 0) return;
        if (event.inputType.startsWith("delete")) {
          const synthetic = { key: "Backspace", preventDefault() {}, currentTarget: event.target } as unknown;
          keyRef.current(synthetic as React.KeyboardEvent<HTMLSpanElement>, index);
        } else if (event.data) {
          typeRef.current(index, event.data);
        }
      };
      track.addEventListener("beforeinput", onBeforeInput);
      return () => track.removeEventListener("beforeinput", onBeforeInput);
    }, []);

    // Drag a segment up or down to scrub through its values.
    const scrub = React.useRef<{ pointer: number; y: number; start: Parts; part: Part; moved: boolean } | null>(null);

    function handlePointerMove(event: React.PointerEvent<HTMLSpanElement>) {
      const state = scrub.current;
      if (!state || state.pointer !== event.pointerId) return;
      const distance = state.y - event.clientY;
      if (!state.moved && Math.abs(distance) < 4) return;
      state.moved = true;
      event.preventDefault();
      const steps = Math.trunc(distance / 10);
      const [min, max] = bounds(state.part);
      let next = state.start[state.part];
      for (let i = 0; i < Math.abs(steps); i++) {
        next = stepValue(next, steps > 0 ? 1 : -1, min, max, state.part === "minute" ? step : 1);
      }
      if (next !== current[state.part]) commit({ ...current, [state.part]: next });
    }

    const filled = format(current, cycle, showSeconds);

    // A form reset goes back to the time the field started with.
    const proxyRef = React.useRef<HTMLInputElement>(null);
    const rejected = useRejected(proxyRef, filled);
    const invalid = errored || rejected;
    const initialValue = React.useRef(value ?? defaultValue ?? "");
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        setPending(null);
        const initial = parse(initialValue.current, cycle);
        if (segments.every((part) => initial[part] === current[part])) return;
        commit(initial);
      };
    });
    React.useEffect(() => {
      const form = proxyRef.current?.form;
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    // A half-filled time reads as empty to the form; say what's missing instead.
    const partial = !filled && segments.some((part) => current[part] !== null);
    React.useEffect(() => {
      proxyRef.current?.setCustomValidity(required && partial ? "Enter a complete time." : "");
    }, [required, partial]);

    const focusFirstEmpty = () => {
      const empty = segments.findIndex((part) => current[part] === null);
      focusSegment(empty >= 0 ? empty : 0);
    };

    return (
      <div
        style={neonVars(color)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-1.5", containerClassName)}
      >
        {label && (
          <label
            id={labelId}
            onClick={() => {
              if (!disabled) focusSegment(0);
            }}
            className={cn("w-fit font-medium text-white/80", s.label)}
          >
            {label}
            {required && (
              <span
                aria-hidden
                title="Required"
                className="relative -top-px ml-1.5 inline-block size-[5px] rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_4px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_10px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))]"
              />
            )}
          </label>
        )}
        <div
          ref={ref}
          id={id}
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          aria-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          style={invalid ? neonVars(INVALID, style) : style}
          onMouseDown={(event) => {
            onMouseDown?.(event);
            // Clicks on the padding or the icon land in the first empty segment, like a native field.
            if (disabled || (event.target as HTMLElement).closest("[role=spinbutton]")) return;
            event.preventDefault();
            focusFirstEmpty();
          }}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/field relative flex w-full cursor-text items-center border border-white/10 bg-white/[0.03] text-white/90",
            "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
            "focus-within:border-[rgb(var(--neon)/0.8)] focus-within:bg-[rgb(var(--neon)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))),inset_0_0_12px_-2px_rgb(var(--neon)/CALC(0.14*var(--neon-glow,1)))]",
            !disabled && "hover:[&:not(:focus-within)]:border-white/20",
            invalid && "border-[rgb(var(--neon)/0.55)] hover:[&:not(:focus-within)]:border-[rgb(var(--neon)/0.75)]",
            disabled && "cursor-not-allowed opacity-50",
            s.field,
            className,
          )}
          {...props}
        >
          {leading && (
            <span
              className={cn(
                "flex shrink-0 items-center text-white/50 [&_svg]:transition-colors [&_svg]:duration-200 group-focus-within/field:[&_svg]:text-[rgb(var(--neon)/0.9)]",
                s.leading,
              )}
            >
              {leading}
            </span>
          )}
          <div
            ref={trackRef}
            className={cn("relative flex h-full flex-1 items-center tabular-nums", s.track, leading != null && s.afterLeading)}
          >
            {segments.map((part, index) => {
              const [min, max] = bounds(part);
              const number = current[part];
              const typing = pending?.part === part ? pending.text : null;
              const text =
                part === "period"
                  ? number === null
                    ? "--"
                    : localeInfo.periods[number]
                  : typing !== null
                    ? typing.padStart(2, "0")
                    : number === null
                      ? "--"
                      : pad(number);
              const empty = number === null && typing === null;
              const separator =
                index > 0 &&
                (part === "period" || segments[index - 1] === "period" ? (
                  <span aria-hidden className="w-1.5" />
                ) : (
                  <span aria-hidden className="px-px text-white/30">
                    :
                  </span>
                ));

              return (
                <React.Fragment key={part}>
                  {separator}
                  <span
                    ref={(node) => {
                      segmentRefs.current[index] = node;
                    }}
                    role="spinbutton"
                    tabIndex={disabled ? -1 : 0}
                    aria-label={NAMES[part]}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={number ?? undefined}
                    aria-valuetext={number === null ? "Empty" : part === "period" ? localeInfo.periods[number] : String(number)}
                    aria-invalid={invalid || undefined}
                    aria-disabled={disabled || undefined}
                    aria-describedby={describedBy}
                    data-placeholder={empty ? "" : undefined}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    inputMode={part === "period" ? "text" : "numeric"}
                    enterKeyHint="next"
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={(event) => {
                      event.preventDefault();
                      const pasted = parseLoose(event.clipboardData.getData("text"), cycle);
                      if (pasted) {
                        setPending(null);
                        commit(pasted);
                      } else type(index, event.clipboardData.getData("text"));
                    }}
                    onDrop={(event) => event.preventDefault()}
                    onFocus={() => setActive(index)}
                    onBlur={(event) => {
                      setPending((state) => (state?.part === part ? null : state));
                      if (!segmentRefs.current.includes(event.relatedTarget as HTMLSpanElement)) setActive(-1);
                    }}
                    onPointerDown={(event) => {
                      if (disabled || event.button !== 0) return;
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      scrub.current = { pointer: event.pointerId, y: event.clientY, start: current, part, moved: false };
                    }}
                    onPointerMove={handlePointerMove}
                    onPointerUp={() => {
                      scrub.current = null;
                    }}
                    onPointerCancel={() => {
                      scrub.current = null;
                    }}
                    className={cn(
                      "relative inline-flex min-w-[2ch] cursor-ns-resize touch-none items-center justify-center whitespace-nowrap outline-none caret-transparent selection:bg-transparent",
                      "transition-[background-color,color] duration-150 ease-out",
                      empty ? "text-white/50" : "text-white/90",
                      !disabled &&
                        "focus:bg-[rgb(var(--neon)/0.12)] focus:text-white focus:[text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
                      empty && "focus:text-white/70",
                      disabled && "cursor-not-allowed",
                      s.segment,
                    )}
                  >
                    {text}
                  </span>
                </React.Fragment>
              );
            })}
            <span
              ref={tubeRef}
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-0 top-0 h-0.5 w-4 origin-left rounded-full opacity-0",
                "bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_2px_rgb(var(--neon)/var(--neon-glow,1))]",
                "transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              )}
            />
          </div>
          {/* Carries the time into forms, under the field so a validation bubble points at it. */}
          <input
            ref={proxyRef}
            aria-hidden
            tabIndex={-1}
            autoComplete="off"
            name={name}
            value={filled}
            required={required}
            disabled={disabled}
            onChange={() => {}}
            onFocus={focusFirstEmpty}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
          />
        </div>
        {message && (
          <p
            id={messageId}
            className={cn("text-xs leading-5", errored ? "text-[#ff4d5e]" : "text-white/55")}
          >
            {message}
          </p>
        )}
      </div>
    );
  },
);
TimeInput.displayName = "TimeInput";

export { TimeInput };
