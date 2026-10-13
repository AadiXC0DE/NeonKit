"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// A struck tube: it catches twice, then holds.
const keyframes = `@keyframes neonkit-calendar-ignite{0%{opacity:.3}14%{opacity:1}24%{opacity:.35}42%{opacity:1}54%{opacity:.55}70%,100%{opacity:1}}`;

/*
 * Date math works on local calendar days built with `new Date(y, m, d)`.
 * Adding milliseconds instead would skip or repeat a day across DST changes,
 * and some zones skip midnight entirely, so only the date parts are trusted.
 */
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const dayNumber = (date: Date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
const compareDays = (a: Date, b: Date) => dayNumber(a) - dayNumber(b);
const isSameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && compareDays(a, b) === 0;
const pad = (value: number) => String(value).padStart(2, "0");
const dayKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Jan 31 plus one month is the last day of February, not March 3. */
function addMonths(date: Date, amount: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + amount;
  const length = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), length));
}

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// CLDR regions whose week doesn't start on Monday, for browsers without Intl week info.
const SUNDAY_FIRST =
  "AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW".split(" ");
const SATURDAY_FIRST = "AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY".split(" ");

type WeekInfo = { firstDay: number };
type LocaleWithWeekInfo = Intl.Locale & { getWeekInfo?: () => WeekInfo; weekInfo?: WeekInfo };

function localeWeekStart(locale: string): Weekday {
  try {
    const intlLocale = new Intl.Locale(locale) as LocaleWithWeekInfo;
    const info = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo;
    // Intl counts Monday as 1 and Sunday as 7.
    if (info?.firstDay) return (info.firstDay % 7) as Weekday;
    const region = intlLocale.maximize().region ?? "";
    if (SUNDAY_FIRST.includes(region)) return 0;
    if (SATURDAY_FIRST.includes(region)) return 6;
    if (region === "MV") return 5;
    return 1;
  } catch {
    return 0;
  }
}

const subscribe = () => () => {};

/** Today's key on the client and nothing on the server, so the dot never mismatches on hydration. */
function useTodayKey() {
  return React.useSyncExternalStore(
    subscribe,
    () => dayKey(new Date()),
    () => "",
  );
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface CalendarBaseProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "color" | "onSelect" | "defaultValue" | "children"
  > {
  /** The first month shown, when controlled. */
  month?: Date;
  /** The first month shown at mount. Defaults to the selection's month, then today's. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Months shown side by side (stacked below `sm`). */
  numberOfMonths?: number;
  /** 0 is Sunday. Defaults to the locale's first day of the week. */
  weekStartsOn?: Weekday;
  /** Days before this can't be picked or focused. */
  minDate?: Date;
  /** Days after this can't be picked or focused. */
  maxDate?: Date;
  /** Return true for days that can't be picked. */
  disabled?: (date: Date) => boolean;
  /** Fill the first and last rows with days from the neighbouring months. */
  showOutsideDays?: boolean;
  /** BCP 47 tag for month names, weekday names, digits and the week start. */
  locale?: string;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Focus the active day on mount, e.g. when the calendar opens in a popover. */
  autoFocus?: boolean;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: "single";
  /** Controlled selection. Pass null for "controlled, nothing picked". */
  selected?: Date | null;
  defaultSelected?: Date;
  onSelect?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  selected?: DateRange | null;
  defaultSelected?: DateRange;
  /** Called with `{ from }` on the first pick and `{ from, to }` on the second. */
  onSelect?: (range: DateRange) => void;
}

export interface CalendarMultipleProps extends CalendarBaseProps {
  mode: "multiple";
  selected?: Date[] | null;
  defaultSelected?: Date[];
  /** Called with every selected day, sorted. */
  onSelect?: (dates: Date[]) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps | CalendarMultipleProps;

type SelectionValue = Date | DateRange | Date[] | null | undefined;

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      mode = "single",
      selected,
      defaultSelected,
      onSelect,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      numberOfMonths = 1,
      weekStartsOn,
      minDate,
      maxDate,
      disabled,
      showOutsideDays = true,
      locale = "en-US",
      color,
      autoFocus = false,
      className,
      style,
      onFocus,
      onBlur,
      onPointerLeave,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const baseId = React.useId();

    const [uncontrolled, setUncontrolled] = React.useState<SelectionValue>(defaultSelected);
    const value: SelectionValue = selected !== undefined ? selected : uncontrolled;

    const range: DateRange | undefined =
      mode === "range" && value && !(value instanceof Date) && !Array.isArray(value)
        ? value
        : undefined;
    const rangeFrom = range?.from ? startOfDay(range.from) : undefined;
    const rangeTo =
      rangeFrom && range?.to && compareDays(range.to, rangeFrom) >= 0 ? startOfDay(range.to) : undefined;
    const selectedDays: Date[] =
      mode === "range"
        ? [rangeFrom, rangeTo].filter((day): day is Date => !!day)
        : mode === "multiple"
          ? Array.isArray(value)
            ? value
            : []
          : value instanceof Date
            ? [value]
            : [];

    const [uncontrolledMonth, setUncontrolledMonth] = React.useState(() =>
      startOfMonth(defaultMonth ?? selectedDays[0] ?? new Date()),
    );
    const displayMonth = startOfMonth(monthProp ?? uncontrolledMonth);
    const months = Array.from({ length: Math.max(1, numberOfMonths) }, (_, index) =>
      addMonths(displayMonth, index),
    );
    const firstShown = monthIndex(months[0]);
    const lastShown = monthIndex(months[months.length - 1]);
    const isShown = (date: Date) => {
      const index = monthIndex(date);
      return index >= firstShown && index <= lastShown;
    };

    const todayKey = useTodayKey();
    const localeStart = React.useMemo(() => localeWeekStart(locale), [locale]);
    const weekStart = weekStartsOn ?? localeStart;

    const format = React.useMemo(() => {
      const day = new Intl.DateTimeFormat(locale, { day: "numeric" });
      const short = new Intl.DateTimeFormat(locale, { weekday: "short" });
      const long = new Intl.DateTimeFormat(locale, { weekday: "long" });
      return {
        caption: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
        full: new Intl.DateTimeFormat(locale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        // Only the number: Japanese and Korean would otherwise add 日 or 일.
        day: (date: Date) =>
          day.formatToParts(date).find((part) => part.type === "day")?.value ?? String(date.getDate()),
        // Jan 4, 2026 is a Sunday, so index 0 lines up with Date#getDay.
        weekdays: Array.from({ length: 7 }, (_, index) => {
          const date = new Date(2026, 0, 4 + index);
          return { short: short.format(date), long: long.format(date) };
        }),
      };
    }, [locale]);

    const isDisabled = (date: Date) =>
      (!!minDate && compareDays(date, minDate) < 0) ||
      (!!maxDate && compareDays(date, maxDate) > 0) ||
      !!disabled?.(date);

    // A range can't run across a day that can't be booked.
    const spansDisabled = (from: Date, to: Date) => {
      if (!disabled) return false;
      for (let day = addDays(from, 1); compareDays(day, to) < 0; day = addDays(day, 1)) {
        if (disabled(day)) return true;
      }
      return false;
    };

    // Roving focus: exactly one day is tabbable.
    const [focusedDay, setFocusedDay] = React.useState<Date | null>(null);
    const pendingFocus = React.useRef(autoFocus);
    const todayDate = todayKey ? parseKey(todayKey) : undefined;

    let activeDay = [focusedDay, ...selectedDays, todayDate].find(
      (day): day is Date => !!day && isShown(day) && !isDisabled(day),
    );
    if (!activeDay) {
      for (let day = months[0]; monthIndex(day) <= lastShown; day = addDays(day, 1)) {
        if (!isDisabled(day)) {
          activeDay = day;
          break;
        }
      }
    }
    const activeKey = dayKey(activeDay ?? months[0]);

    useIsomorphicLayoutEffect(() => {
      if (!pendingFocus.current) return;
      pendingFocus.current = false;
      rootRef.current?.querySelector<HTMLElement>("[data-active-day]")?.focus();
    });

    // Month changes slide in from the direction of travel.
    const shownIndex = firstShown;
    const previousIndex = React.useRef(shownIndex);
    useIsomorphicLayoutEffect(() => {
      const from = previousIndex.current;
      previousIndex.current = shownIndex;
      const root = rootRef.current;
      if (from === shownIndex || !root) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const offset = shownIndex > from ? 14 : -14;
      root.querySelectorAll<HTMLElement>("[data-calendar-slide]").forEach((element) => {
        element.getAnimations?.().forEach((animation) => animation.cancel());
        element.animate?.(
          [
            { opacity: 0, transform: `translateX(${offset}px)` },
            { opacity: 1, transform: "translateX(0)" },
          ],
          { duration: 240, easing: EASE },
        );
      });
    }, [shownIndex]);

    function changeMonth(next: Date) {
      const target = startOfMonth(next);
      if (monthIndex(target) === firstShown) return;
      if (monthProp === undefined) setUncontrolledMonth(target);
      onMonthChange?.(target);
    }

    const [ignition, setIgnition] = React.useState(0);
    const [igniting, setIgniting] = React.useState(false);

    function select(date: Date) {
      if (isDisabled(date)) return;
      const day = startOfDay(date);
      let next: Date | DateRange | Date[];

      if (mode === "range") {
        if (!rangeFrom || rangeTo || compareDays(day, rangeFrom) < 0 || spansDisabled(rangeFrom, day)) {
          next = { from: day };
        } else {
          next = { from: rangeFrom, to: day };
          setIgnition((count) => count + 1);
          setIgniting(true);
        }
      } else if (mode === "multiple") {
        next = selectedDays.some((picked) => isSameDay(picked, day))
          ? selectedDays.filter((picked) => !isSameDay(picked, day))
          : [...selectedDays, day].sort(compareDays);
      } else {
        next = day;
      }

      if (selected === undefined) setUncontrolled(next);
      (onSelect as ((value: typeof next) => void) | undefined)?.(next);
    }

    function focusDay(day: Date) {
      setFocusedDay(day);
      pendingFocus.current = true;
      const index = monthIndex(day);
      if (index < firstShown) changeMonth(day);
      else if (index > lastShown) changeMonth(addMonths(startOfMonth(day), -(months.length - 1)));
    }

    /** Walks from `target` in steps of `step` days until it finds a day that can be focused. */
    function findEnabled(target: Date, step: number) {
      let day = target;
      if (minDate && compareDays(day, minDate) < 0) day = startOfDay(minDate);
      if (maxDate && compareDays(day, maxDate) > 0) day = startOfDay(maxDate);
      for (let guard = 0; guard < 400; guard++) {
        if (!isDisabled(day)) return day;
        day = addDays(day, step);
        if ((minDate && compareDays(day, minDate) < 0) || (maxDate && compareDays(day, maxDate) > 0)) {
          return null;
        }
      }
      return null;
    }

    function handleDayKeyDown(event: React.KeyboardEvent<HTMLDivElement>, date: Date) {
      const column = (date.getDay() - weekStart + 7) % 7;
      let target: Date;
      let step: number;

      switch (event.key) {
        case "ArrowLeft":
          [target, step] = [addDays(date, -1), -1];
          break;
        case "ArrowRight":
          [target, step] = [addDays(date, 1), 1];
          break;
        case "ArrowUp":
          [target, step] = [addDays(date, -7), -7];
          break;
        case "ArrowDown":
          [target, step] = [addDays(date, 7), 7];
          break;
        case "PageUp":
          [target, step] = [addMonths(date, event.shiftKey ? -12 : -1), -1];
          break;
        case "PageDown":
          [target, step] = [addMonths(date, event.shiftKey ? 12 : 1), 1];
          break;
        case "Home":
          [target, step] = [addDays(date, -column), 1];
          break;
        case "End":
          [target, step] = [addDays(date, 6 - column), -1];
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          select(date);
          return;
        default:
          return;
      }

      event.preventDefault();
      const next = findEnabled(target, step);
      if (next) focusDay(next);
    }

    // While the end of a range is being picked, a dim tube previews it.
    const [hoverDay, setHoverDay] = React.useState<Date | null>(null);
    const [focusInside, setFocusInside] = React.useState(false);
    const picking = mode === "range" && !!rangeFrom && !rangeTo;
    const previewEnd = picking ? (hoverDay ?? (focusInside && activeDay ? activeDay : null)) : null;
    const previewTo =
      rangeFrom &&
      previewEnd &&
      compareDays(previewEnd, rangeFrom) > 0 &&
      !isDisabled(previewEnd) &&
      !spansDisabled(rangeFrom, previewEnd)
        ? previewEnd
        : undefined;
    const spanEnd = rangeTo ?? previewTo;
    const span = rangeFrom && spanEnd ? { from: rangeFrom, to: spanEnd, lit: !!rangeTo } : null;
    const inSpan = (date: Date) =>
      !!span && compareDays(date, span.from) >= 0 && compareDays(date, span.to) <= 0;

    const isSelected = (date: Date) =>
      mode === "range"
        ? !!rangeFrom && (rangeTo ? inSpan(date) : isSameDay(date, rangeFrom))
        : selectedDays.some((picked) => isSameDay(picked, date));

    const canGoBack = !minDate || firstShown > monthIndex(minDate);
    const canGoForward = !maxDate || lastShown < monthIndex(maxDate);

    const navButton = cn(
      "pointer-events-auto grid size-8 cursor-pointer place-items-center rounded-lg text-white/55 outline-none",
      "transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.94]",
      "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
      "disabled:pointer-events-none disabled:opacity-25 [&_svg]:size-4",
    );

    return (
      <div
        ref={rootRef}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative w-fit select-none p-3 text-white/90",
          className,
        )}
        onFocus={(event) => {
          onFocus?.(event);
          setFocusInside(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setHoverDay(null);
        }}
        {...props}
      >
        {igniting && <style>{keyframes}</style>}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() => changeMonth(addMonths(displayMonth, -1))}
            className={navButton}
          >
            <ChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={!canGoForward}
            onClick={() => changeMonth(addMonths(displayMonth, 1))}
            className={navButton}
          >
            <ChevronRight aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-x-6 gap-y-5 sm:flex-row">
          {months.map((month, monthPosition) => {
            const captionId = `${baseId}-caption-${monthPosition}`;
            const first = startOfMonth(month);
            const start = addDays(first, -((first.getDay() - weekStart + 7) % 7));
            // Always six rows, so the height holds steady while paging through months.
            const weeks = Array.from({ length: 6 }, (_, week) =>
              Array.from({ length: 7 }, (_, column) => addDays(start, week * 7 + column)),
            );

            return (
              <div key={monthPosition} className="w-max">
                <div
                  id={captionId}
                  aria-live="polite"
                  data-calendar-slide=""
                  className="flex h-8 items-center justify-center px-9 text-sm font-medium text-white/90"
                >
                  {format.caption.format(month)}
                </div>
                <div
                  role="grid"
                  aria-labelledby={captionId}
                  aria-multiselectable={mode !== "single" || undefined}
                  className="mt-2"
                >
                  <div role="row" className="grid grid-cols-[repeat(7,2.25rem)]">
                    {Array.from({ length: 7 }, (_, column) => {
                      const name = format.weekdays[(weekStart + column) % 7];
                      return (
                        <div
                          key={column}
                          role="columnheader"
                          aria-label={name.long}
                          className="flex h-8 items-center justify-center text-[11px] font-medium text-white/55"
                        >
                          <span aria-hidden>{name.short}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div role="rowgroup" data-calendar-slide="" className="mt-1 grid gap-y-1">
                    {weeks.map((week, row) => {
                      const cells = week.map((date) => {
                        const outside = monthIndex(date) !== monthIndex(month);
                        const before = monthIndex(date) < monthIndex(month);
                        // Between two visible months, the neighbour already shows these days.
                        const hidden =
                          outside &&
                          (!showOutsideDays ||
                            (before && monthPosition > 0) ||
                            (!before && monthPosition < months.length - 1));
                        return { date, outside, hidden };
                      });

                      const lit = cells
                        .map((cell, column) => (!cell.hidden && inSpan(cell.date) ? column : -1))
                        .filter((column) => column >= 0);
                      const tube =
                        span && !isSameDay(span.from, span.to) && lit.length > 0
                          ? { start: lit[0], length: lit[lit.length - 1] - lit[0] + 1 }
                          : null;

                      return (
                        <div
                          key={row}
                          role="row"
                          className="relative grid grid-cols-[repeat(7,2.25rem)]"
                        >
                          {tube && (
                            <span
                              key={span?.lit ? `lit-${ignition}` : "preview"}
                              aria-hidden
                              onAnimationEnd={() => setIgniting(false)}
                              style={{
                                left: `calc(${tube.start} * 100% / 7)`,
                                width: `calc(${tube.length} * 100% / 7)`,
                              }}
                              className={cn(
                                "pointer-events-none absolute inset-y-0 rounded-full border",
                                span?.lit
                                  ? "border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--neon)/0.13)] shadow-[0_0_20px_-6px_rgb(var(--neon)/0.6),inset_0_0_12px_rgb(var(--neon)/0.16),inset_0_1px_0_rgb(255_255_255/0.06)]"
                                  : "border-[rgb(var(--neon)/0.22)] bg-[rgb(var(--neon)/0.05)]",
                                span?.lit &&
                                  igniting &&
                                  "[animation:neonkit-calendar-ignite_420ms_linear_both] motion-reduce:[animation:none]",
                              )}
                            />
                          )}
                          {cells.map(({ date, outside, hidden }) => {
                            const key = dayKey(date);
                            if (hidden) return <div key={key} role="gridcell" className="size-9" />;

                            const dayDisabled = isDisabled(date);
                            const picked = isSelected(date);
                            const endpoint =
                              mode === "range"
                                ? isSameDay(date, rangeFrom) || isSameDay(date, rangeTo)
                                : picked;
                            const between = !endpoint && inSpan(date);
                            const previewing = !!previewTo && isSameDay(date, previewTo);
                            const today = key === todayKey;
                            const active = !outside && key === activeKey;

                            return (
                              <div
                                key={key}
                                role="gridcell"
                                tabIndex={active ? 0 : -1}
                                aria-label={format.full.format(date)}
                                aria-selected={picked}
                                aria-disabled={dayDisabled || undefined}
                                aria-current={today ? "date" : undefined}
                                data-day={key}
                                data-active-day={active ? "" : undefined}
                                // Lets a surrounding popover or dialog pick this day as its initial focus.
                                data-autofocus={active && autoFocus ? "" : undefined}
                                data-outside={outside ? "" : undefined}
                                data-selected={picked ? "" : undefined}
                                onClick={() => select(date)}
                                onKeyDown={(event) => handleDayKeyDown(event, date)}
                                onFocus={() => {
                                  if (!outside && !isSameDay(focusedDay, date)) setFocusedDay(date);
                                }}
                                onPointerEnter={() => {
                                  if (picking) setHoverDay(date);
                                }}
                                className={cn(
                                  "relative flex size-9 cursor-pointer items-center justify-center rounded-full text-sm tabular-nums outline-none",
                                  "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.94]",
                                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
                                  endpoint
                                    ? "bg-[rgb(var(--neon))] font-semibold text-[#05060a] shadow-[0_0_0_1px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)/0.55),inset_0_1px_0_rgb(255_255_255/0.45)]"
                                    : between
                                      ? cn(
                                          "hover:bg-[rgb(var(--neon)/0.16)]",
                                          outside ? "text-white/55" : "text-white",
                                        )
                                      : outside
                                        ? "text-white/50 hover:bg-white/[0.05] hover:text-white/60"
                                        : "text-white/80 hover:bg-white/[0.07] hover:text-white",
                                  previewing && "text-white shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.7)]",
                                  dayDisabled &&
                                    "cursor-not-allowed text-white/20 line-through decoration-white/25 hover:bg-transparent hover:text-white/20 active:scale-100",
                                )}
                              >
                                {format.day(date)}
                                {today && (
                                  <span
                                    aria-hidden
                                    className={cn(
                                      "pointer-events-none absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full",
                                      endpoint
                                        ? "bg-[#05060a]/70"
                                        : dayDisabled
                                          ? "bg-white/30"
                                          : "bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]",
                                    )}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
Calendar.displayName = "Calendar";

export { Calendar };
