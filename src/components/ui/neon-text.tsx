"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const lit =
  "[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_1px_rgb(255_255_255/0.9),0_0_6px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)),0_0_38px_rgb(var(--neon)/0.75),0_0_80px_rgb(var(--neon)/0.45)]";
const unlit = "text-[rgb(var(--neon)/0.16)] [text-shadow:0_1px_0_rgb(255_255_255/0.06)]";

// Opacity keyframes for a tube catching: a couple of stutters, then steady.
const powerOn = [0, 1, 0.1, 0.9, 0.25, 1, 1];
const powerOnTimes = [0, 0.1, 0.18, 0.3, 0.38, 0.55, 1];

export interface NeonTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Element to render. */
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  /** Lit or dark. Flipping to true replays the power-on flicker. */
  on?: boolean;
  /** Letters stutter on one by one when the sign lights up. */
  flicker?: boolean;
  /** Every few seconds a random letter buzzes, like an ageing tube. */
  buzz?: boolean;
}

const NeonText = React.forwardRef<HTMLElement, NeonTextProps>(
  (
    {
      className,
      style,
      color,
      as: Tag = "span",
      on = true,
      flicker = true,
      buzz = false,
      children,
      ...props
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const [buzzing, setBuzzing] = React.useState(-1);
    const [settled, setSettled] = React.useState(false);
    const text = typeof children === "string" ? children : null;
    const letters = React.useMemo(() => (text ? Array.from(text) : []), [text]);

    // Stable pseudo-random stagger per letter, so SSR and client agree.
    const delays = React.useMemo(
      () => letters.map((_, i) => ((i * 7919) % 11) / 22),
      [letters],
    );

    React.useEffect(() => {
      setSettled(false);
      if (!on) return;
      const timeout = setTimeout(() => setSettled(true), 1600);
      return () => clearTimeout(timeout);
    }, [on]);

    React.useEffect(() => {
      if (!buzz || !settled || reduceMotion || letters.length === 0) return;
      let timeout: ReturnType<typeof setTimeout>;
      const schedule = () => {
        timeout = setTimeout(() => {
          const candidates = letters
            .map((char, i) => (char.trim() ? i : -1))
            .filter((i) => i >= 0);
          setBuzzing(candidates[Math.floor(Math.random() * candidates.length)]);
          timeout = setTimeout(() => {
            setBuzzing(-1);
            schedule();
          }, 700);
        }, 2600 + Math.random() * 4200);
      };
      schedule();
      return () => clearTimeout(timeout);
    }, [buzz, settled, reduceMotion, letters]);

    const animateLetter = (i: number) => {
      if (buzzing === i) return { opacity: [1, 0.3, 1, 0.55, 1] };
      if (!on || settled || reduceMotion || !flicker) return { opacity: 1 };
      return { opacity: powerOn };
    };

    return (
      <Tag
        ref={ref as React.Ref<HTMLHeadingElement>}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "transition-[color,text-shadow] duration-150",
          on ? lit : unlit,
          className,
        )}
        {...props}
      >
        {text ? (
          <>
            <span className="sr-only">{text}</span>
            <span aria-hidden>
              {letters.map((char, i) => (
                <motion.span
                  key={`${i}-${on}`}
                  className="inline-block whitespace-pre"
                  initial={on && flicker && !reduceMotion ? { opacity: 0 } : false}
                  animate={animateLetter(i)}
                  transition={
                    buzzing === i
                      ? { duration: 0.6, ease: "linear" }
                      : {
                          duration: 0.9,
                          delay: delays[i],
                          times: powerOnTimes,
                          ease: "linear",
                        }
                  }
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </>
        ) : (
          children
        )}
      </Tag>
    );
  },
);
NeonText.displayName = "NeonText";

export { NeonText };
