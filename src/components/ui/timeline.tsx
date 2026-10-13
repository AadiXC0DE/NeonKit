"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export type TimelineStatus = "done" | "current" | "upcoming";
type Orientation = "vertical" | "horizontal";

/** Milliseconds the light takes to travel from one marker to the next on mount. */
const STEP = 130;

// The tube powers on once from the first marker to "now". After that, a newly
// lit segment fills on its own and a new current marker strikes like a tube.
const keyframes = `
@keyframes nk-timeline-fill-y { from { transform: scaleY(0); } }
@keyframes nk-timeline-fill-x { from { transform: scaleX(0); } }
@keyframes nk-timeline-on { from { opacity: 0.3; } }
@keyframes nk-timeline-fade { from { opacity: 0; } }
@keyframes nk-timeline-ignite { 0% { opacity: 0.3; } 12% { opacity: 0.9; } 22% { opacity: 0.35; } 40% { opacity: 1; } 52% { opacity: 0.5; } 68%, 100% { opacity: 1; } }
@keyframes nk-timeline-pulse { 0%, 100% { opacity: 0.4; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }
`;

// The current item is announced through aria-current instead.
type LabelledStatus = Exclude<TimelineStatus, "current">;
const defaultStatusLabels: Record<LabelledStatus, string> = {
  done: "Completed",
  upcoming: "Upcoming",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

// UTC keeps the server and client render identical. Pass formatTime for local time.
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type TimelineContextValue = {
  orientation: Orientation;
  formatTime?: (date: Date) => React.ReactNode;
  statusLabels: Record<LabelledStatus, string>;
  /** False during the mount sequence, while delays are staggered. */
  settled: boolean;
};

type ItemPosition = { index: number; last: boolean; next?: TimelineStatus };

const TimelineContext = React.createContext<TimelineContextValue | null>(null);
const ItemPositionContext = React.createContext<ItemPosition>({ index: 0, last: true });

function useTimeline() {
  const context = React.useContext(TimelineContext);
  if (!context) throw new Error("<TimelineItem> must be used inside <Timeline>.");
  return context;
}

export interface TimelineProps extends Omit<React.OlHTMLAttributes<HTMLOListElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  orientation?: Orientation;
  /** Formats `time` when it is a Date or ISO string. Defaults to a short UTC format. */
  formatTime?: (date: Date) => React.ReactNode;
  /** Visually hidden status words read before done and upcoming titles. */
  statusLabels?: Partial<Record<LabelledStatus, string>>;
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  (
    {
      className,
      style,
      color,
      orientation = "vertical",
      formatTime,
      statusLabels,
      children,
      ...props
    },
    ref,
  ) => {
    const items = React.Children.toArray(children).filter(React.isValidElement);
    const statuses = items.map(
      (child) => (child.props as { status?: TimelineStatus }).status ?? "done",
    );

    const [settled, setSettled] = React.useState(false);
    const settleAfter = (items.length + 4) * STEP;
    React.useEffect(() => {
      const timer = window.setTimeout(() => setSettled(true), settleAfter);
      return () => window.clearTimeout(timer);
    }, [settleAfter]);

    const context = React.useMemo<TimelineContextValue>(
      () => ({
        orientation,
        formatTime,
        statusLabels: { ...defaultStatusLabels, ...statusLabels },
        settled,
      }),
      [orientation, formatTime, statusLabels, settled],
    );

    return (
      <TimelineContext.Provider value={context}>
        <ol
          ref={ref}
          data-orientation={orientation}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "m-0 list-none p-0",
            orientation === "horizontal" ? "flex w-full" : "flex flex-col",
            className,
          )}
          {...props}
        >
          <style>{keyframes}</style>
          {items.map((child, index) => (
            <ItemPositionContext.Provider
              key={child.key ?? index}
              value={{ index, last: index === items.length - 1, next: statuses[index + 1] }}
            >
              {child}
            </ItemPositionContext.Provider>
          ))}
        </ol>
      </TimelineContext.Provider>
    );
  },
);
Timeline.displayName = "Timeline";

function TimeLabel({
  time,
  dateTime,
  formatTime,
  className,
}: {
  time: React.ReactNode | Date;
  dateTime?: string;
  formatTime?: (date: Date) => React.ReactNode;
  className?: string;
}) {
  let date: Date | null = null;
  let dateOnly = false;
  if (time instanceof Date) date = time;
  else if (typeof time === "string" && (ISO_DATE.test(time) || ISO_DATE_TIME.test(time))) {
    dateOnly = ISO_DATE.test(time);
    date = new Date(time);
  }

  if (date) {
    if (Number.isNaN(date.getTime())) return null;
    const machine = typeof time === "string" ? time : date.toISOString();
    const label = formatTime
      ? formatTime(date)
      : (dateOnly ? dateFormat : dateTimeFormat).format(date);
    return (
      <time dateTime={dateTime ?? machine} className={className}>
        {label}
      </time>
    );
  }

  if (time == null || time === false || time === "") return null;
  if (dateTime) {
    return (
      <time dateTime={dateTime} className={className}>
        {time as React.ReactNode}
      </time>
    );
  }
  return <span className={className}>{time as React.ReactNode}</span>;
}

export interface TimelineItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Done and current items light the tube; upcoming items stay unlit glass. */
  status?: TimelineStatus;
  /** A Date or ISO string renders a `<time>`; anything else renders as given. */
  time?: React.ReactNode | Date;
  /** Machine-readable value for a human `time` such as "2 hours ago". */
  dateTime?: string;
  title: React.ReactNode;
  /** Replaces the dot inside the marker. */
  icon?: React.ReactNode;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  (
    { className, status = "done", time, dateTime, title, icon, children, ...props },
    ref,
  ) => {
    const { orientation, formatTime, statusLabels, settled } = useTimeline();
    const { index, last, next } = React.useContext(ItemPositionContext);
    const vertical = orientation === "vertical";

    // Lit up to and including the current item. Past "now" the light bleeds a
    // little way into the glass before it dies out.
    const segment =
      status === "done" && next !== "upcoming"
        ? "lit"
        : status !== "upcoming"
          ? "bleed"
          : "unlit";

    const delay = settled ? 0 : index * STEP;
    const showTime = time != null && time !== false && time !== "";

    const marker = (
      <span aria-hidden className="relative size-6 shrink-0">
        <span
          style={{ animationDelay: `${delay}ms` }}
          className={cn(
            "absolute inset-0",
            status === "current" &&
              "[animation:nk-timeline-ignite_380ms_linear_backwards] motion-reduce:[animation:none]",
            status === "done" &&
              !settled &&
              "[animation:nk-timeline-on_220ms_ease-out_backwards] motion-reduce:[animation:none]",
          )}
        >
          {status === "current" && (
            <span className="absolute -inset-2.5 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.5),transparent)] opacity-70 [animation:nk-timeline-pulse_2.4s_ease-in-out_infinite] motion-reduce:[animation:none]" />
          )}
          <span
            className={cn(
              "absolute inset-0 grid place-items-center rounded-full border",
              "transition-[background-color,border-color,box-shadow,color] duration-300 ease-out",
              "[&_svg]:size-3.5 [&_svg]:shrink-0",
              status === "done" &&
                "border-[rgb(var(--neon)/0.45)] bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))]",
              status === "current" &&
                "border-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.16)] text-[rgb(var(--neon))] shadow-[0_0_0_3px_rgb(var(--neon)/0.1),0_0_16px_rgb(var(--neon)/0.55),inset_0_0_8px_rgb(var(--neon)/0.3)] [&_svg]:[filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.9))]",
              status === "upcoming" && "border-white/10 bg-white/[0.03] text-white/35",
            )}
          >
            {icon ?? (
              <span
                className={cn(
                  "rounded-full",
                  status === "done" && "size-1.5 bg-current shadow-[0_0_6px_rgb(var(--neon)/0.9)]",
                  status === "current" &&
                    "size-2 bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]",
                  status === "upcoming" && "size-1.5 border border-white/25",
                )}
              />
            )}
          </span>
        </span>
      </span>
    );

    const tube = !last && (
      <span
        aria-hidden
        data-state={segment}
        className={cn(
          "relative flex-1 bg-white/[0.035]",
          vertical
            ? "w-1.5 min-h-4 shadow-[inset_1px_0_0_rgb(255_255_255/0.07),inset_-1px_0_0_rgb(255_255_255/0.07)]"
            : "h-1.5 min-w-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),inset_0_-1px_0_rgb(255_255_255/0.07)]",
        )}
      >
        {segment === "lit" && (
          // Tinted glass and the bright core inside it fill together.
          <span
            style={{ animationDelay: `${delay}ms` }}
            className={cn(
              "absolute inset-0 bg-[rgb(var(--neon)/0.14)] motion-reduce:[animation:none]",
              vertical
                ? "origin-top shadow-[inset_1px_0_0_rgb(var(--neon)/0.35),inset_-1px_0_0_rgb(var(--neon)/0.35)]"
                : "origin-left shadow-[inset_0_1px_0_rgb(var(--neon)/0.35),inset_0_-1px_0_rgb(var(--neon)/0.35)]",
              settled
                ? vertical
                  ? "[animation:nk-timeline-fill-y_420ms_cubic-bezier(0.65,0,0.35,1)_backwards]"
                  : "[animation:nk-timeline-fill-x_420ms_cubic-bezier(0.65,0,0.35,1)_backwards]"
                : vertical
                  ? "[animation:nk-timeline-fill-y_130ms_linear_backwards]"
                  : "[animation:nk-timeline-fill-x_130ms_linear_backwards]",
            )}
          >
            <span
              className={cn(
                "absolute bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/0.9),0_0_14px_rgb(var(--neon)/0.45)]",
                vertical ? "inset-x-[2px] inset-y-0" : "inset-x-0 inset-y-[2px]",
              )}
            />
          </span>
        )}
        {segment === "bleed" && (
          <span
            style={{ animationDelay: `${settled ? 0 : delay + STEP}ms` }}
            className={cn(
              "absolute opacity-80 [animation:nk-timeline-fade_400ms_ease-out_backwards] motion-reduce:[animation:none]",
              vertical
                ? "inset-x-[2px] top-0 h-5 bg-[linear-gradient(to_bottom,rgb(var(--neon)),transparent)]"
                : "inset-y-[2px] left-0 w-5 bg-[linear-gradient(to_right,rgb(var(--neon)),transparent)]",
            )}
          />
        )}
      </span>
    );

    const timeClass = cn(
      "text-xs tabular-nums",
      status === "current" ? "text-[rgb(var(--neon)/0.9)]" : "text-white/55",
    );

    const heading = (
      <div
        className={cn(
          "text-sm font-medium leading-5",
          status === "upcoming" ? "text-white/55" : "text-white/90",
        )}
      >
        {status !== "current" && <span className="sr-only">{statusLabels[status]}: </span>}
        {title}
      </div>
    );

    const description = children != null && children !== false && (
      <div className="mt-1 text-sm leading-6 text-white/55">{children}</div>
    );

    return (
      <li
        ref={ref}
        data-status={status}
        aria-current={status === "current" ? "step" : undefined}
        className={cn(
          "relative flex",
          vertical ? "gap-4" : "min-w-[10rem] flex-1 flex-col",
          className,
        )}
        {...props}
      >
        {vertical ? (
          <>
            <div className="flex w-6 shrink-0 flex-col items-center">
              {marker}
              {tube}
            </div>
            <div className={cn("min-w-0 flex-1 pt-0.5", !last && "pb-8")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                {heading}
                {showTime && (
                  <TimeLabel time={time} dateTime={dateTime} formatTime={formatTime} className={timeClass} />
                )}
              </div>
              {description}
            </div>
          </>
        ) : (
          <>
            <div className="flex h-6 items-center">
              {marker}
              {tube}
            </div>
            <div className="min-w-0 pr-6 pt-3">
              {showTime && (
                <TimeLabel
                  time={time}
                  dateTime={dateTime}
                  formatTime={formatTime}
                  className={cn("mb-1 block", timeClass)}
                />
              )}
              {heading}
              {description}
            </div>
          </>
        )}
      </li>
    );
  },
);
TimelineItem.displayName = "TimelineItem";

export { Timeline, TimelineItem };
