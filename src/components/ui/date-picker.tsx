"use client";

import * as React from "react";
import { CalendarDays, X } from "@/components/ui/icons";

import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";


// Intl pads ranges and times with thin or narrow no-break spaces, and Node and
// browsers disagree on which. Plain spaces keep server and client text identical.
const plainSpaces = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ");
const INVALID = "255 77 94";

const sizes = {
  sm: {
    field: "h-8 rounded-md text-xs",
    trigger: "gap-1.5 px-2.5 [&_svg]:size-3.5",
    clear: "mr-1.5 size-5 rounded-[4px] [&_svg]:size-3",
    label: "text-xs",
  },
  md: {
    field: "h-10 rounded-lg text-sm",
    trigger: "gap-2 px-3 [&_svg]:size-4",
    clear: "mr-2 size-6 rounded-md [&_svg]:size-3.5",
    label: "text-sm",
  },
  lg: {
    field: "h-12 rounded-xl text-base",
    trigger: "gap-2.5 px-4 [&_svg]:size-[18px]",
    clear: "mr-2.5 size-7 rounded-md [&_svg]:size-4",
    label: "text-sm",
  },
} as const;

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

const pad = (value: number) => String(value).padStart(2, "0");
const isoDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const sameDay = (a?: Date, b?: Date) => (!a || !b ? a === b : isoDay(a) === isoDay(b));
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia("(min-width: 640px)");
  query.addEventListener?.("change", onChange);
  return () => query.removeEventListener?.("change", onChange);
};

/** Two months for ranges from the sm breakpoint up; one on phones and on the server. */
function useWide() {
  return React.useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia("(min-width: 640px)").matches,
    () => false,
  );
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

export interface DatePickerPreset<T> {
  label: string;
  value: T;
}

interface DatePickerBaseProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "color" | "value" | "defaultValue" | "onChange" | "children" | "type" | "name"
  > {
  /** Shown while nothing is picked. */
  placeholder?: React.ReactNode;
  /** How the picked date reads in the field. Ranges collapse shared parts: Oct 12 – 16, 2026. */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** BCP 47 tag for the field text and the calendar. */
  locale?: string;
  minDate?: Date;
  maxDate?: Date;
  /** Return true for days that can't be picked. */
  isDateDisabled?: (date: Date) => boolean;
  /** 0 is Sunday. Defaults to the locale's first day of the week. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Months in the calendar. Defaults to 2 for ranges from the sm breakpoint up, else 1. */
  numberOfMonths?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Submits yyyy-mm-dd (or yyyy-mm-dd/yyyy-mm-dd for a range) under this name. */
  name?: string;
  /** Blocks form submission until a date (or a full range) is picked. */
  required?: boolean;
  label?: React.ReactNode;
  /** Helper text under the field. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Classes for the field box. */
  className?: string;
  /** Classes for the outer block holding the label, field and message. */
  containerClassName?: string;
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  mode?: "single";
  /** Controlled value. Pass null for "controlled, nothing picked". */
  value?: Date | null;
  defaultValue?: Date;
  /** Called with the picked day, or undefined when cleared. */
  onValueChange?: (date: Date | undefined) => void;
  presets?: DatePickerPreset<Date>[];
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: "range";
  value?: DateRange | null;
  defaultValue?: DateRange;
  /** Called with a complete { from, to }, or undefined when cleared. */
  onValueChange?: (range: DateRange | undefined) => void;
  presets?: DatePickerPreset<DateRange>[];
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

type Picked = Date | DateRange | undefined;

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      mode = "single",
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder,
      presets,
      formatOptions,
      locale = "en-US",
      minDate,
      maxDate,
      isDateDisabled,
      weekStartsOn,
      numberOfMonths,
      color,
      size = "md",
      disabled,
      name,
      required = false,
      label,
      description,
      error,
      className,
      containerClassName,
      style,
      id: idProp,
      onKeyDown,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const valueId = `${id}-value`;
    const errored = Boolean(error);
    const message = errored ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${errored ? "error" : "description"}` : undefined;
    const s = sizes[size];
    const range = mode === "range";

    const [uncontrolled, setUncontrolled] = React.useState<Picked>(defaultValue);
    const value: Picked = valueProp !== undefined ? (valueProp ?? undefined) : uncontrolled;
    const single = !range && value instanceof Date ? value : undefined;
    const span = range && value && !(value instanceof Date) && value.from ? value : undefined;
    const hasValue = Boolean(single ?? span);

    const [open, setOpen] = React.useState(false);
    // A range in progress stays here until its end is picked; closing early discards it.
    const [draft, setDraft] = React.useState<DateRange | null>(null);
    const [month, setMonth] = React.useState(() => startOfMonth(single ?? span?.from ?? new Date()));
    const wide = useWide();
    const months = numberOfMonths ?? (range && wide ? 2 : 1);

    const formatter = React.useMemo(
      () => new Intl.DateTimeFormat(locale, formatOptions ?? DEFAULT_FORMAT),
      [locale, formatOptions],
    );

    let text: React.ReactNode = placeholder ?? (range ? "Pick a date range" : "Pick a date");
    if (single) text = plainSpaces(formatter.format(single));
    else if (span?.from && span.to) text = plainSpaces(formatter.formatRange(span.from, span.to));
    else if (span?.from) text = `${plainSpaces(formatter.format(span.from))} –`;

    function setOpenState(next: boolean) {
      if (next) {
        setMonth(startOfMonth(single ?? span?.from ?? new Date()));
        setDraft(null);
      }
      setOpen(next);
    }

    function commit(next: Picked) {
      if (valueProp === undefined) setUncontrolled(next);
      (onValueChange as ((value: Picked) => void) | undefined)?.(next);
    }

    function pickPreset(preset: DatePickerPreset<Date> | DatePickerPreset<DateRange>) {
      const picked = preset.value;
      const anchor = picked instanceof Date ? picked : picked.from;
      if (anchor) setMonth(startOfMonth(anchor));
      setDraft(null);
      commit(picked);
      setOpen(false);
    }

    const isPresetActive = (preset: DatePickerPreset<Date> | DatePickerPreset<DateRange>) =>
      preset.value instanceof Date
        ? sameDay(preset.value, single)
        : !!span && sameDay(preset.value.from, span.from) && sameDay(preset.value.to, span.to);

    // A form reset goes back to the date the picker started with.
    const proxyRef = React.useRef<HTMLInputElement>(null);
    const initialValue = React.useRef(value);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        const initial = initialValue.current;
        setOpen(false);
        setDraft(null);
        if (initial === value) return;
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

    const formValue = single
      ? isoDay(single)
      : span?.from && span.to
        ? `${isoDay(span.from)}/${isoDay(span.to)}`
        : "";
    const rejected = useRejected(proxyRef, formValue);
    const invalid = errored || rejected;

    const calendarProps = {
      month,
      onMonthChange: setMonth,
      numberOfMonths: months,
      minDate,
      maxDate,
      disabled: isDateDisabled,
      weekStartsOn,
      locale,
      autoFocus: true,
    };

    return (
      <div
        style={neonVars(color)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-1.5", containerClassName)}
      >
        {label && (
          <label
            id={labelId}
            htmlFor={id}
            onClick={(event) => {
              // Focus the trigger like a native field label, without opening the calendar.
              event.preventDefault();
              triggerRef.current?.focus();
            }}
            className={cn("w-fit font-medium text-white/80", s.label)}
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
        <Popover open={open && !disabled} onOpenChange={setOpenState}>
          <div
            data-state={open ? "open" : "closed"}
            style={invalid ? ({ "--neon": INVALID, ...style } as React.CSSProperties) : style}
            className={cn(
              "group/field relative flex w-full items-center border border-white/10 bg-white/[0.03] text-white/90",
              "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
              "focus-within:border-[rgb(var(--neon)/0.8)] focus-within:bg-[rgb(var(--neon)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
              open &&
                "border-[rgb(var(--neon)/0.8)] bg-[rgb(var(--neon)/0.04)] shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
              !disabled && !open && "hover:[&:not(:focus-within)]:border-white/20",
              invalid && "border-[rgb(var(--neon)/0.55)]",
              invalid && !open && "hover:[&:not(:focus-within)]:border-[rgb(var(--neon)/0.75)]",
              disabled && "cursor-not-allowed opacity-50",
              s.field,
              className,
            )}
          >
            <PopoverTrigger asChild>
              <button
                ref={triggerRef}
                id={id}
                type="button"
                disabled={disabled}
                aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
                aria-describedby={[ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined}
                onKeyDown={(event) => {
                  onKeyDown?.(event);
                  if (event.defaultPrevented || open || disabled) return;
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpenState(true);
                  }
                }}
                className={cn(
                  // The panel reads its color from here, so the red error state stays on the field.
                  "[--neon:var(--neon-accent,34_211_238)]",
                  "flex h-full min-w-0 flex-1 cursor-pointer items-center rounded-[inherit] text-left outline-none disabled:cursor-not-allowed",
                  "[&_svg]:shrink-0 [&_svg]:text-white/40 [&_svg]:transition-colors [&_svg]:duration-200",
                  invalid
                    ? "group-focus-within/field:[&_svg]:text-[#ff4d5e] group-data-[state=open]/field:[&_svg]:text-[#ff4d5e]"
                    : "group-focus-within/field:[&_svg]:text-[rgb(var(--neon)/0.9)] group-data-[state=open]/field:[&_svg]:text-[rgb(var(--neon)/0.9)]",
                  s.trigger,
                  hasValue && !disabled && "pr-1.5",
                )}
                {...props}
              >
                <CalendarDays aria-hidden />
                <span id={valueId} className={cn("min-w-0 flex-1 truncate tabular-nums", !hasValue && "text-white/50")}>
                  {text}
                </span>
              </button>
            </PopoverTrigger>
            {hasValue && !disabled && (
              <button
                type="button"
                aria-label={range ? "Clear dates" : "Clear date"}
                onClick={() => {
                  commit(undefined);
                  triggerRef.current?.focus();
                }}
                className={cn(
                  "grid shrink-0 cursor-pointer place-items-center text-white/40 outline-none",
                  "transition-[background-color,color] duration-150 ease-out hover:bg-white/[0.08] hover:text-white",
                  "focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                  s.clear,
                )}
              >
                <X aria-hidden />
              </button>
            )}
            {/* Carries the date into forms, under the field so a validation bubble points at it. */}
            <input
              ref={proxyRef}
              aria-hidden
              tabIndex={-1}
              autoComplete="off"
              name={name}
              value={formValue}
              required={required}
              disabled={disabled}
              onChange={() => {}}
              onFocus={() => triggerRef.current?.focus()}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
            />
          </div>
          <PopoverContent align="start" className="w-auto p-0">
            <div className="flex flex-col sm:flex-row">
              {presets && presets.length > 0 && (
                <div
                  role="group"
                  aria-label="Presets"
                  className="flex gap-1 overflow-x-auto border-b border-white/10 p-2 sm:w-40 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r"
                >
                  {(presets as (DatePickerPreset<Date> | DatePickerPreset<DateRange>)[]).map((preset) => {
                    const active = isPresetActive(preset);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickPreset(preset)}
                        className={cn(
                          "relative shrink-0 cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-[13px] outline-none",
                          "transition-[background-color,color] duration-150 ease-out",
                          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                          active
                            ? "bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))]"
                            : "text-white/65 hover:bg-white/[0.06] hover:text-white",
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute inset-y-1.5 left-0 hidden w-0.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))] sm:block"
                          />
                        )}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <div>
                {range ? (
                  <Calendar
                    mode="range"
                    selected={draft ?? span ?? null}
                    onSelect={(next) => {
                      if (next.from && next.to) {
                        setDraft(null);
                        commit(next);
                        setOpen(false);
                      } else setDraft(next);
                    }}
                    {...calendarProps}
                  />
                ) : (
                  <Calendar
                    selected={single ?? null}
                    onSelect={(next) => {
                      commit(next);
                      setOpen(false);
                    }}
                    {...calendarProps}
                  />
                )}
                {range && (
                  <p aria-live="polite" className="border-t border-white/10 px-4 py-2.5 text-xs text-white/55">
                    {draft?.from ? (
                      <>
                        Starts <span className="text-white/90">{plainSpaces(formatter.format(draft.from))}</span>. Pick the last day.
                      </>
                    ) : (
                      "Pick the first day, then the last."
                    )}
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {message && (
          <p id={messageId} className={cn("text-xs leading-5", errored ? "text-[#ff4d5e]" : "text-white/55")}>
            {message}
          </p>
        )}
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
