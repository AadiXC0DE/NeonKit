"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Unlit tubes are dark glass; lit ones have a near-white core and a colored halo.
const css = `
@keyframes nk-neon-clock-ignite { 0% { opacity: 0.25; } 12% { opacity: 0.9; } 22% { opacity: 0.3; } 40% { opacity: 1; } 52% { opacity: 0.55; } 68%, 100% { opacity: 1; } }
.nk-neon-clock-lit { opacity: 1; animation: nk-neon-clock-ignite 700ms linear both; }
.nk-neon-clock-dark { opacity: 0.25; }
.nk-neon-clock-face { color: rgb(var(--neon) / 0.16); text-shadow: 0 1px 0 rgb(255 255 255 / 0.05); }
.nk-neon-clock-face[data-lit] {
  color: color-mix(in srgb, rgb(var(--neon)) 30%, white);
  text-shadow: 0 0 1px rgb(255 255 255 / 0.9), 0 0 0.06em rgb(var(--neon)), 0 0 0.16em rgb(var(--neon)), 0 0 0.4em rgb(var(--neon) / 0.75), 0 0 0.9em rgb(var(--neon) / 0.4);
}
.nk-neon-clock-face[data-lit] .nk-neon-clock-tube { animation: nk-neon-clock-ignite 700ms linear both; }
.nk-neon-clock-colon { transition: background-color 120ms ease-out, box-shadow 120ms ease-out; }
.nk-neon-clock-face:not([data-lit]) .nk-neon-clock-colon, .nk-neon-clock-colon[data-off] { background-color: rgb(var(--neon) / 0.16); box-shadow: none; }
@media (prefers-reduced-motion: reduce) {
  .nk-neon-clock-lit, .nk-neon-clock-face[data-lit] .nk-neon-clock-tube { animation: none; }
  .nk-neon-clock-colon { transition: none; }
}
`;

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createFormatter(timeZone: string | undefined) {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  };
  try {
    return new Intl.DateTimeFormat("en-US", { ...options, timeZone });
  } catch {
    // An unknown time zone falls back to the viewer's own.
    return new Intl.DateTimeFormat("en-US", options);
  }
}

function readTime(formatter: Intl.DateTimeFormat) {
  const parts = formatter.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { hours: get("hour") % 24, minutes: get("minute"), seconds: get("second") };
}

function resolveCycle(hourCycle: 12 | 24 | undefined): 12 | 24 {
  if (hourCycle) return hourCycle;
  const resolved = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle;
  return resolved === "h11" || resolved === "h12" ? 12 : 24;
}

function spoken(hours: number, minutes: number, seconds: number, cycle: 12 | 24, withSeconds: boolean) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const tail = withSeconds ? `:${pad(seconds)}` : "";
  if (cycle === 24) return `${pad(hours)}:${pad(minutes)}${tail}`;
  return `${hours % 12 || 12}:${pad(minutes)}${tail} ${hours < 12 ? "AM" : "PM"}`;
}

// Turns forward only, so 59 → 0 seconds ticks on instead of spinning back.
const forward = (from: number, to: number) => from + ((((to - from) % 360) + 360) % 360);

// The classic 10:10 pose holds until the first tick, then the hands sweep to the time.
const POSE = { hour: 305, minute: 60, second: 180 };

// Classes, not inline sizes, so a responsive class like `lg:[--clock-size:260px]` can win.
const sizes = {
  analog: { sm: "[--clock-size:128px]", md: "[--clock-size:184px]", lg: "[--clock-size:260px]" },
  digital: { sm: "text-[32px]", md: "text-[52px]", lg: "text-[80px]" },
} as const;

export interface NeonClockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** A dial with tube hands, or neon numerals. */
  variant?: "analog" | "digital";
  /** IANA zone such as "Asia/Tokyo". Defaults to the viewer's. */
  timeZone?: string;
  /** Show the seconds hand (analog) or digits (digital). */
  showSeconds?: boolean;
  /** 12 or 24 hours for the digital face. Defaults to the viewer's locale. */
  hourCycle?: 12 | 24;
  /** Caption under the clock, e.g. a city. Also names the clock for screen readers. */
  label?: React.ReactNode;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: "sm" | "md" | "lg";
}

const NeonClock = React.forwardRef<HTMLDivElement, NeonClockProps>(
  (
    {
      className,
      style,
      variant = "analog",
      timeZone,
      showSeconds = true,
      hourCycle,
      label,
      color,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const glowId = `nk-neon-clock-glow-${id}`;
    const labelId = `nk-neon-clock-label-${id}`;

    const hourHand = React.useRef<SVGGElement>(null);
    const minuteHand = React.useRef<SVGGElement>(null);
    const secondHand = React.useRef<SVGGElement>(null);
    const hands = React.useRef<SVGGElement>(null);
    const digits = React.useRef<(HTMLSpanElement | null)[]>([]);
    const colons = React.useRef<(HTMLSpanElement | null)[]>([]);
    const meridiem = React.useRef<HTMLSpanElement>(null);
    const face = React.useRef<HTMLDivElement>(null);
    const announce = React.useRef<HTMLSpanElement>(null);
    // Survives prop changes, so the hands keep turning forward from where they are.
    const dial = React.useRef({ ...POSE });

    // One timer per clock writes straight to the DOM each second; React never re-renders for time.
    React.useEffect(() => {
      const formatter = createFormatter(timeZone);
      const cycle = resolveCycle(hourCycle);
      const reduce = prefersReducedMotion();
      const angles = dial.current;
      // A freshly mounted dial still shows the pose; one that's already lit just carries on.
      const fresh = hands.current?.getAttribute("class") !== "nk-neon-clock-lit";
      if (fresh) Object.assign(angles, POSE);
      let first = true;
      let timer: ReturnType<typeof setTimeout>;
      let blink: ReturnType<typeof setTimeout>;
      let settle: ReturnType<typeof setTimeout>;

      const turn = (node: SVGGElement | null, degrees: number) => {
        if (node) node.style.transform = `rotate(${degrees}deg)`;
      };

      const analog = (hours: number, minutes: number, seconds: number) => {
        const from = angles.second;
        angles.hour = forward(angles.hour, (hours % 12) * 30 + minutes * 0.5 + seconds / 120);
        angles.minute = forward(angles.minute, minutes * 6 + seconds * 0.1);
        angles.second = forward(angles.second, seconds * 6);

        if (first && fresh) {
          const sweep = reduce ? "none" : "transform 1100ms cubic-bezier(0.65, 0, 0.35, 1)";
          for (const node of [hourHand.current, minuteHand.current, secondHand.current]) {
            if (node) node.style.transition = sweep;
          }
          hands.current?.setAttribute("class", "nk-neon-clock-lit");
          settle = setTimeout(() => {
            for (const node of [hourHand.current, minuteHand.current, secondHand.current]) {
              if (node) node.style.transition = "none";
            }
          }, 1150);
        }
        turn(hourHand.current, angles.hour);
        turn(minuteHand.current, angles.minute);

        const hand = secondHand.current;
        if (!first && hand) hand.style.transition = "none";
        turn(hand, angles.second);
        if (!first && !reduce && hand && typeof hand.animate === "function" && angles.second - from <= 6) {
          // A quartz tick: overshoot, recoil, settle.
          const to = angles.second;
          hand.animate(
            [
              { transform: `rotate(${from}deg)` },
              { transform: `rotate(${to + 1.8}deg)`, offset: 0.32 },
              { transform: `rotate(${to - 0.7}deg)`, offset: 0.58 },
              { transform: `rotate(${to + 0.25}deg)`, offset: 0.8 },
              { transform: `rotate(${to}deg)` },
            ],
            { duration: 380, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
          );
        }
      };

      const digital = (hours: number, minutes: number, seconds: number) => {
        const shown = cycle === 12 ? hours % 12 || 12 : hours;
        const text = `${String(shown).padStart(2, cycle === 12 ? " " : "0")}${String(minutes).padStart(2, "0")}${String(seconds).padStart(2, "0")}`;
        digits.current.forEach((node, index) => {
          if (!node) return;
          const char = text[index] ?? "";
          if (node.textContent !== char) node.textContent = char;
          // A dark leading digit on a 12-hour face collapses, like a real sign without that tube.
          node.style.display = char === " " ? "none" : "";
        });
        if (meridiem.current) {
          meridiem.current.hidden = cycle !== 12;
          if (cycle === 12) meridiem.current.textContent = hours < 12 ? "AM" : "PM";
        }
        if (first) face.current?.setAttribute("data-lit", "");
        for (const colon of colons.current) colon?.removeAttribute("data-off");
        if (!reduce) {
          blink = setTimeout(() => {
            for (const colon of colons.current) colon?.setAttribute("data-off", "");
          }, 500);
        }
      };

      const tick = () => {
        const { hours, minutes, seconds } = readTime(formatter);
        if (variant === "analog") analog(hours, minutes, seconds);
        else digital(hours, minutes, seconds);
        const words = spoken(hours, minutes, seconds, cycle, showSeconds);
        if (announce.current && announce.current.textContent !== words) announce.current.textContent = words;
        first = false;
        timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 4);
      };

      timer = setTimeout(tick, 0);
      return () => {
        clearTimeout(timer);
        clearTimeout(blink);
        clearTimeout(settle);
      };
    }, [variant, timeZone, hourCycle, showSeconds]);

    const caption = label ? (
      <span
        id={labelId}
        className="text-[13px] font-medium leading-none text-white/60"
      >
        {label}
      </span>
    ) : null;

    const handStyle: React.CSSProperties = {
      transformBox: "view-box",
      transformOrigin: "50% 50%",
    };

    if (variant === "digital") {
      const groups = showSeconds ? 3 : 2;
      return (
        <div
          ref={ref}
          role="timer"
          aria-labelledby={label ? labelId : undefined}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "inline-flex flex-col items-center gap-3",
            sizes.digital[size],
            className,
          )}
          {...props}
        >
          <style>{css}</style>
          <span ref={announce} className="sr-only" />
          <div
            ref={face}
            aria-hidden
            className="nk-neon-clock-face flex items-center leading-none tabular-nums"
          >
            {Array.from({ length: groups }, (_, group) => (
              <React.Fragment key={group}>
                {group > 0 && (
                  <span className="flex flex-col justify-center gap-[0.22em] px-[0.12em]" style={{ height: "0.8em" }}>
                    {[0, 1].map((dot) => (
                      <span
                        key={dot}
                        ref={(node) => {
                          colons.current[(group - 1) * 2 + dot] = node;
                        }}
                        data-off=""
                        className="nk-neon-clock-colon nk-neon-clock-tube block size-[0.11em] rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.8)]"
                      />
                    ))}
                  </span>
                )}
                {[0, 1].map((position) => (
                  <span
                    key={position}
                    ref={(node) => {
                      digits.current[group * 2 + position] = node;
                    }}
                    data-digit=""
                    className="nk-neon-clock-tube inline-block w-[0.62em] text-center"
                  >
                    -
                  </span>
                ))}
              </React.Fragment>
            ))}
            <span
              ref={meridiem}
              hidden={hourCycle !== 12}
              className="ml-[0.18em] self-start pt-[0.08em] text-[0.22em] font-semibold tracking-[0.08em]"
            >
              --
            </span>
          </div>
          {caption}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="timer"
        aria-labelledby={label ? labelId : undefined}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex flex-col items-center gap-3",
          sizes.analog[size],
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <span ref={announce} className="sr-only" />
        <div
          aria-hidden
          className="relative shrink-0 rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_35%,#12151c,#07080b_70%)] shadow-[inset_0_2px_14px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.06),0_24px_50px_-24px_rgb(0_0_0/0.9)]"
          style={{ width: "var(--clock-size,184px)", height: "var(--clock-size,184px)" }}
        >
          {/* The hands light the dial they sit on */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(var(--neon)/0.13),transparent_62%)]" />
          <svg viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible" fill="none" strokeLinecap="round">
            <defs>
              {/* User-space bounds: a straight hand has a zero-width box, which would clip the glow. */}
              <filter id={glowId} filterUnits="userSpaceOnUse" x={-20} y={-20} width={240} height={240}>
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="near" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="far" />
                <feMerge>
                  <feMergeNode in="far" />
                  <feMergeNode in="far" />
                  <feMergeNode in="near" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {Array.from({ length: 60 }, (_, index) => {
              const angle = index * 6;
              const hour = index % 5 === 0;
              const quarter = index % 15 === 0;
              return (
                <line
                  key={index}
                  x1={100}
                  y1={hour ? (quarter ? 12 : 15) : 16}
                  x2={100}
                  y2={hour ? 25 : 19}
                  transform={`rotate(${angle} 100 100)`}
                  stroke={hour ? "rgb(var(--neon) / 0.32)" : "rgb(255 255 255 / 0.16)"}
                  strokeWidth={hour ? (quarter ? 4 : 3) : 1}
                />
              );
            })}
            <g ref={hands} className="nk-neon-clock-dark">
              <g ref={hourHand} style={{ ...handStyle, transform: `rotate(${POSE.hour}deg)` }}>
                <line x1={100} y1={112} x2={100} y2={54} stroke="rgb(var(--neon))" strokeWidth={7} filter={`url(#${glowId})`} />
                <line x1={100} y1={112} x2={100} y2={54} stroke="color-mix(in srgb, rgb(var(--neon)) 30%, white)" strokeWidth={2.6} />
              </g>
              <g ref={minuteHand} style={{ ...handStyle, transform: `rotate(${POSE.minute}deg)` }}>
                <line x1={100} y1={114} x2={100} y2={30} stroke="rgb(var(--neon))" strokeWidth={5.5} filter={`url(#${glowId})`} />
                <line x1={100} y1={114} x2={100} y2={30} stroke="color-mix(in srgb, rgb(var(--neon)) 30%, white)" strokeWidth={2.2} />
              </g>
              {showSeconds && (
                <g ref={secondHand} style={{ ...handStyle, transform: `rotate(${POSE.second}deg)` }}>
                  <g filter={`url(#${glowId})`}>
                    <line x1={100} y1={126} x2={100} y2={20} stroke="rgb(var(--neon))" strokeWidth={1.6} />
                    <circle cx={100} cy={119} r={3.2} fill="rgb(var(--neon))" />
                  </g>
                </g>
              )}
            </g>
            <circle cx={100} cy={100} r={5.5} fill="#171a22" stroke="rgb(255 255 255 / 0.12)" />
            <circle cx={100} cy={100} r={1.6} fill="color-mix(in srgb, rgb(var(--neon)) 30%, white)" />
          </svg>
        </div>
        {caption}
      </div>
    );
  },
);
NeonClock.displayName = "NeonClock";

export { NeonClock };
