"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Every size derives from the digit window's height, so `sm:[--odo-h:56px]`
// resizes a whole counter.
const H = "var(--odo-h,40px)";
const W = `calc(${H} * 0.64)`;
// Ten faces round a drum: each face sits this far from the axle (in face heights).
const RADIUS = 0.5 / Math.tan(Math.PI / 10);
const STEP = 36;

const sizes = {
  sm: "[--odo-h:28px]",
  md: "[--odo-h:40px]",
  lg: "[--odo-h:64px]",
} as const;

const css = `
.nk-odo-face { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.nk-odo-ink { opacity: calc(0.16 + 0.84 * var(--nk-odo-lit, 1)); }
.nk-odo[data-variant="lit"] .nk-odo-face { background: linear-gradient(180deg, #0e1016, #08090d); }
.nk-odo[data-variant="lit"] .nk-odo-ink {
  color: color-mix(in srgb, rgb(var(--neon)) 30%, white);
  text-shadow: 0 0 0.02em rgb(255 255 255 / 0.7), 0 0 0.12em rgb(var(--neon)), 0 0 0.36em rgb(var(--neon) / 0.6);
}
.nk-odo[data-variant="lit"] .nk-odo-frac .nk-odo-face { background: linear-gradient(180deg, #13151c, #0b0c11); }
.nk-odo[data-variant="lit"] .nk-odo-frac .nk-odo-ink { color: color-mix(in srgb, rgb(var(--neon)) 55%, white); opacity: 0.78; }
.nk-odo[data-variant="backlit"] .nk-odo-face {
  background: radial-gradient(ellipse 90% 75% at 50% 50%, color-mix(in srgb, rgb(var(--neon)) 52%, white), rgb(var(--neon)) 58%, color-mix(in srgb, rgb(var(--neon)) 62%, black));
}
.nk-odo[data-variant="backlit"] .nk-odo-ink { color: #16110a; text-shadow: 0 0 0.04em rgb(0 0 0 / 0.35); }
.nk-odo[data-variant="backlit"] .nk-odo-window { box-shadow: 0 0 0.3em rgb(var(--neon) / 0.45), 0 0 0.9em rgb(var(--neon) / 0.2); }
.nk-odo[data-variant="backlit"] .nk-odo-frac .nk-odo-face { background: linear-gradient(180deg, #1a1712, #0f0d0a); }
.nk-odo[data-variant="backlit"] .nk-odo-frac .nk-odo-ink { color: color-mix(in srgb, rgb(var(--neon)) 70%, white); text-shadow: 0 0 0.2em rgb(var(--neon) / 0.6); }
.nk-odo[data-variant="cream"] .nk-odo-face { background: linear-gradient(180deg, #f4ecda, #e2d5b8); }
.nk-odo[data-variant="cream"] .nk-odo-ink { color: #17140f; }
.nk-odo[data-variant="cream"] .nk-odo-frac .nk-odo-face { background: linear-gradient(180deg, color-mix(in srgb, rgb(var(--neon)) 78%, black), color-mix(in srgb, rgb(var(--neon)) 60%, black)); }
.nk-odo[data-variant="cream"] .nk-odo-frac .nk-odo-ink { color: #fbf6ea; }
.nk-odo-sep, .nk-odo-affix { opacity: calc(0.25 + 0.75 * var(--nk-odo-lit, 1)); }
`;

type Variant = "lit" | "backlit" | "cream";

type Token =
  | { kind: "drum"; place: number; fraction: boolean }
  | { kind: "sep"; char: string; after: number };

const clamp = (value: number, lower: number, upper: number) => Math.min(upper, Math.max(lower, value));

function integerDigits(scaled: number, decimals: number) {
  const whole = Math.floor(Math.max(0, scaled) / Math.pow(10, decimals) + 1e-9);
  return whole < 1 ? 1 : Math.floor(Math.log10(whole) + 1e-9) + 1;
}

/**
 * Where a drum sits, 0 to 10, for a reading `n` in its smallest unit. The units
 * drum turns continuously; every other drum only turns while all the drums to
 * its right roll from 9 to 0, which is how the gearing carries.
 */
function drumPosition(n: number, place: number) {
  const value = Math.max(0, n);
  const unit = Math.pow(10, place);
  const whole = Math.floor(value / unit);
  const rest = value - whole * unit;
  const turn = place === 0 ? rest : Math.max(0, rest - (unit - 1));
  return (whole % 10) + turn;
}

/** How lit a drum is: leading drums sit dim until the count reaches them. */
function drumLit(n: number, place: number, decimals: number) {
  if (place <= decimals) return 1;
  return clamp(n - (Math.pow(10, place) - 1), 0, 1);
}

function buildLayout(locale: string, integers: number, decimals: number, grouping: boolean) {
  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  });
  const sample = Number("1".padEnd(integers, "0")) + (decimals ? Math.pow(10, -decimals) : 0);
  const raw: ({ kind: "drum"; fraction: boolean } | { kind: "sep"; char: string })[] = [];
  for (const part of format.formatToParts(sample)) {
    if (part.type === "integer" || part.type === "fraction") {
      for (let i = 0; i < Array.from(part.value).length; i++) raw.push({ kind: "drum", fraction: part.type === "fraction" });
    } else if (part.type === "group" || part.type === "decimal") {
      raw.push({ kind: "sep", char: part.value });
    }
  }
  const drums = raw.filter((token) => token.kind === "drum").length;
  let seen = 0;
  return raw.map<Token>((token) => {
    if (token.kind === "drum") return { kind: "drum", place: drums - 1 - seen++, fraction: token.fraction };
    return { kind: "sep", char: token.char, after: drums - seen };
  });
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Motion blur kicks in as a drum passes more than a quarter of a digit per frame.
const BLUR = [0, 0.9, 2.2, 4.5];
function blurLevel(digitsPerFrame: number) {
  if (digitsPerFrame > 1.2) return 3;
  if (digitsPerFrame > 0.6) return 2;
  if (digitsPerFrame > 0.25) return 1;
  return 0;
}

export interface OdometerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children" | "prefix"> {
  /** The reading. Rolls there from the last one. Negative values show as zero. */
  value: number;
  /** Start here and roll to `value` once the counter scrolls into view. */
  from?: number;
  /** Fixed number of decimal places, each on its own drum. */
  decimals?: number;
  /** Fewest whole-number drums. Unused ones show a dim zero, like a real counter. */
  minDigits?: number;
  /** BCP 47 locale for separators and digits. Fixed by default so the server and client agree. */
  locale?: string;
  /** Print group separators (1,204,880). */
  grouping?: boolean;
  /** Printed on the faceplate before the drums, e.g. "$". */
  prefix?: React.ReactNode;
  /** Printed on the faceplate after the drums, e.g. "km" or "ms". */
  suffix?: React.ReactNode;
  /** `lit` glows digits on dark drums; `backlit` prints dark ink on drums lit from behind; `cream` is ivory with black ink. */
  variant?: Variant;
  /** Digit window height preset or pixels. Leave unset to inherit `--odo-h`, or 40px. */
  size?: keyof typeof sizes | number;
  /** Milliseconds for a roll. By default it grows with the distance travelled. */
  duration?: number;
  /** Draw the housing around the drums. Turn off to set a counter inline with text. */
  housing?: boolean;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const Odometer = React.forwardRef<HTMLSpanElement, OdometerProps>(
  (
    {
      className,
      style,
      value: valueProp,
      from,
      decimals = 0,
      minDigits = 1,
      locale = "en-US",
      grouping = true,
      prefix,
      suffix,
      variant = "lit",
      size,
      duration,
      housing = true,
      color,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId().replace(/:/g, "");
    const dec = clamp(Math.round(decimals), 0, 6);
    const scale = Math.pow(10, dec);
    const value = Number.isFinite(valueProp) ? Math.max(0, valueProp) : 0;
    const target = Math.round(value * scale);
    const start = from !== undefined && Number.isFinite(from) ? Math.round(Math.max(0, from) * scale) : target;

    // The reading the drums show right now, in the smallest unit. The engine
    // moves it every frame without re-rendering.
    const reading = React.useRef(start);
    const [span, setSpan] = React.useState(() =>
      Math.max(minDigits, integerDigits(start, dec), integerDigits(target, dec)),
    );
    const [armed, setArmed] = React.useState(from === undefined);

    const rootRef = React.useRef<HTMLSpanElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLSpanElement);
    const drums = React.useRef(new Map<number, { window: HTMLElement; lens: HTMLElement; drum: HTMLElement }>());
    const seps = React.useRef(new Map<number, HTMLElement>());
    const frame = React.useRef(0);
    const blurs = React.useRef(new Map<number, number>());

    const apply = React.useCallback(
      (n: number, velocity = 0) => {
        drums.current.forEach((node, place) => {
          node.drum.style.transform = `translateZ(calc(${H} * ${-RADIUS})) rotateX(${(drumPosition(n, place) * STEP).toFixed(3)}deg)`;
          node.window.style.setProperty("--nk-odo-lit", drumLit(n, place, dec).toFixed(3));
          const level = blurLevel((velocity * 16) / Math.pow(10, place));
          if (blurs.current.get(place) !== level) {
            blurs.current.set(place, level);
            node.lens.style.filter = level ? `url(#${uid}-blur-${level})` : "";
          }
        });
        seps.current.forEach((node, after) => {
          node.style.setProperty("--nk-odo-lit", drumLit(n, after, dec).toFixed(3));
        });
      },
      [dec, uid],
    );

    // A fresh counter holds its starting reading until it's on screen.
    React.useEffect(() => {
      if (armed) return;
      const node = rootRef.current;
      if (!node || typeof IntersectionObserver === "undefined") {
        setArmed(true);
        return;
      }
      let timer: ReturnType<typeof setTimeout> | undefined;
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          timer = setTimeout(() => setArmed(true), 200);
        },
        { threshold: 0.4 },
      );
      observer.observe(node);
      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }, [armed]);

    React.useEffect(() => {
      if (!armed) return;
      const finalSpan = Math.max(minDigits, integerDigits(target, dec));
      const from = reading.current;
      cancelAnimationFrame(frame.current);
      if (from === target || prefersReducedMotion() || typeof requestAnimationFrame !== "function") {
        reading.current = target;
        apply(target);
        setSpan(finalSpan);
        return;
      }
      // Grow first so a new leading drum is there to carry into.
      setSpan(Math.max(finalSpan, integerDigits(from, dec)));
      const delta = target - from;
      const direction = Math.sign(delta);
      const length = duration ?? clamp(380 + 320 * Math.log10(1 + Math.abs(delta)), 460, 2400);
      // The drums ride a little past their detent and settle back.
      const overshoot = Math.min(1, Math.abs(delta)) * 0.12;
      let began = 0;
      let last = 0;
      let previous = from;
      const tick = (now: number) => {
        if (!began) {
          began = now;
          last = now;
        }
        const t = Math.min(1, (now - began) / length);
        const eased = 1 - Math.pow(1 - t, 4);
        const s = clamp((t - 0.62) / 0.38, 0, 1);
        const settle = t > 0.62 ? Math.sin(s * Math.PI * 2) * Math.pow(1 - s, 2) * overshoot * direction : 0;
        const n = t >= 1 ? target : from + delta * eased + settle;
        const dt = Math.max(1, now - last);
        last = now;
        apply(n, Math.abs(n - previous) / dt);
        previous = n;
        reading.current = n;
        if (t < 1) {
          frame.current = requestAnimationFrame(tick);
        } else {
          setSpan(finalSpan);
        }
      };
      frame.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame.current);
    }, [armed, target, dec, minDigits, duration, apply]);

    // New drums mount at the current reading; keep everything in step after a re-layout.
    useIsomorphicLayoutEffect(() => {
      apply(reading.current);
    }, [span, apply]);

    const tokens = React.useMemo(() => buildLayout(locale, span, dec, grouping), [locale, span, dec, grouping]);
    const glyphs = React.useMemo(() => {
      const format = new Intl.NumberFormat(locale, { useGrouping: false });
      return Array.from({ length: 10 }, (_, digit) => format.format(digit));
    }, [locale]);
    const spoken = React.useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: dec,
          maximumFractionDigits: dec,
          useGrouping: grouping,
        }).format(target / scale),
      [locale, dec, grouping, target, scale],
    );

    const n = reading.current;
    const sized = typeof size === "number" ? ({ "--odo-h": `${size}px` } as React.CSSProperties) : undefined;
    const affix = "nk-odo-affix flex items-center self-stretch px-[calc(var(--odo-h,40px)*0.1)] text-[calc(var(--odo-h,40px)*0.46)] font-medium leading-none text-white/60";

    return (
      <span
        ref={rootRef}
        data-variant={variant}
        style={neonVars(color, { ...sized, ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "nk-odo relative inline-flex max-w-full align-middle",
          typeof size === "string" && sizes[size],
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <span aria-live="polite" aria-atomic="true" className="sr-only">
          {prefix}
          {spoken}
          {suffix != null && <> {suffix}</>}
        </span>
        <svg aria-hidden width="0" height="0" className="absolute">
          {BLUR.slice(1).map((amount, i) => (
            <filter key={amount} id={`${uid}-blur-${i + 1}`} x="0" y="-50%" width="100%" height="200%">
              <feGaussianBlur stdDeviation={`0 ${amount}`} />
            </filter>
          ))}
        </svg>
        <span
          aria-hidden
          className={cn(
            "inline-flex select-none items-stretch font-semibold [font-stretch:90%]",
            housing &&
              "rounded-[calc(var(--odo-h,40px)*0.22)] border border-white/[0.07] bg-[linear-gradient(180deg,#15171e,#0a0b0f)] p-[calc(var(--odo-h,40px)*0.13)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06),inset_0_-1px_0_rgb(0_0_0/0.5),0_12px_32px_-14px_rgb(0_0_0/0.9)]",
          )}
          style={{ gap: `calc(${H} * 0.05)`, fontSize: `calc(${H} * 0.66)` }}
        >
          {prefix != null && <span className={cn(affix, "pr-[calc(var(--odo-h,40px)*0.14)]")}>{prefix}</span>}
          {tokens.map((token) => {
            if (token.kind === "sep") {
              return (
                <span
                  key={`sep-${token.after}`}
                  ref={(node) => {
                    if (node) seps.current.set(token.after, node);
                    else seps.current.delete(token.after);
                  }}
                  className="nk-odo-sep -mx-[calc(var(--odo-h,40px)*0.02)] flex items-end justify-center pb-[calc(var(--odo-h,40px)*0.1)] leading-none text-white/55"
                  style={{ width: `calc(${H} * 0.2)`, height: H, "--nk-odo-lit": drumLit(n, token.after, dec) } as React.CSSProperties}
                >
                  {token.char}
                </span>
              );
            }
            const { place } = token;
            return (
              <span
                key={place}
                ref={(node) => {
                  const lens = node?.firstElementChild as HTMLElement | null;
                  const drum = lens?.firstElementChild as HTMLElement | null;
                  if (node && lens && drum) drums.current.set(place, { window: node, lens, drum });
                  else drums.current.delete(place);
                }}
                className={cn(
                  "nk-odo-window relative isolate shrink-0 overflow-hidden rounded-[calc(var(--odo-h,40px)*0.08)] bg-black",
                  token.fraction && "nk-odo-frac",
                )}
                style={{ width: W, height: H, "--nk-odo-lit": drumLit(n, place, dec) } as React.CSSProperties}
              >
                <span className="absolute inset-0" style={{ perspective: `calc(${H} * 5)` }}>
                  <span
                    className="absolute inset-0 [transform-style:preserve-3d]"
                    style={{
                      transform: `translateZ(calc(${H} * ${-RADIUS})) rotateX(${(drumPosition(n, place) * STEP).toFixed(3)}deg)`,
                    }}
                  >
                    {glyphs.map((glyph, digit) => (
                      <span
                        key={digit}
                        className="nk-odo-face absolute inset-0 flex items-center justify-center"
                        style={{ transform: `rotateX(${-digit * STEP}deg) translateZ(calc(${H} * ${RADIUS}))` }}
                      >
                        <span className="nk-odo-ink leading-none">{glyph}</span>
                      </span>
                    ))}
                  </span>
                </span>
                {/* The drum's curve falling into shadow, the slot's lip and a glint on the window */}
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.78),rgb(0_0_0/0.22)_24%,transparent_42%,transparent_58%,rgb(0_0_0/0.22)_76%,rgb(0_0_0/0.82))] shadow-[inset_0_2px_3px_rgb(0_0_0/0.75),inset_0_-1px_2px_rgb(0_0_0/0.6),inset_0_0_0_1px_rgb(0_0_0/0.6)]" />
                <span className="pointer-events-none absolute inset-x-0 top-[6%] h-[14%] bg-[linear-gradient(180deg,rgb(255_255_255/0.07),transparent)]" />
              </span>
            );
          })}
          {suffix != null && <span className={cn(affix, "pl-[calc(var(--odo-h,40px)*0.16)]")}>{suffix}</span>}
        </span>
      </span>
    );
  },
);
Odometer.displayName = "Odometer";

export { Odometer };
