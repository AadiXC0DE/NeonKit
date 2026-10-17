"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Every word is two stacked layers: tinted glass (the unlit tube) and the lit tube over it. A swap powers
// the old tube off, slides its glass out, slides the new glass in while the width follows, then strikes
// the new tube with a stutter. Only opacity and transform animate; the width eases once per swap.
const css = `
.nk-rt-word { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; }
.nk-rt-word[data-state="on"] { opacity: 1; }
.nk-rt-word[data-state="in"] { animation: nk-rt-glass-in 320ms cubic-bezier(0.23, 1, 0.32, 1) 180ms both; }
.nk-rt-word[data-state="out"] { animation: nk-rt-glass-out 300ms cubic-bezier(0.23, 1, 0.32, 1) 160ms both; }
.nk-rt-word[data-state="in"] .nk-rt-lit { animation: nk-rt-strike 820ms linear 420ms both; }
.nk-rt-word[data-state="out"] .nk-rt-lit { animation: nk-rt-kill 200ms linear both; }
.nk-rt-root[data-flicker="false"] .nk-rt-word[data-state="in"] .nk-rt-lit { animation: nk-rt-fade 260ms cubic-bezier(0.23, 1, 0.32, 1) 380ms both; }
@keyframes nk-rt-glass-in { from { opacity: 0; transform: translateY(0.18em); } to { opacity: 1; transform: none; } }
@keyframes nk-rt-glass-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-0.18em); } }
@keyframes nk-rt-strike {
  0% { opacity: 0; } 9% { opacity: 1; } 16% { opacity: 0.08; } 27% { opacity: 0.85; } 34% { opacity: 0.2; } 52%, 100% { opacity: 1; }
}
@keyframes nk-rt-kill { 0% { opacity: 1; } 30% { opacity: 0.25; } 45% { opacity: 0.7; } 100% { opacity: 0; } }
@keyframes nk-rt-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .nk-rt-root { transition: none !important; }
  .nk-rt-word[data-state="in"] { animation: nk-rt-fade 300ms ease-out both; }
  .nk-rt-word[data-state="out"] { animation: nk-rt-fade 200ms ease-out reverse both; }
  .nk-rt-word[data-state] .nk-rt-lit { animation: none; }
}
`;

const lit =
  "[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_0.015em_rgb(255_255_255/CALC(0.9*var(--neon-glow,1))),0_0_max(1.5px,0.05em)_rgb(var(--neon)/var(--neon-glow,1)),0_0_max(4px,0.14em)_rgb(var(--neon)/var(--neon-glow,1)),0_0_0.38em_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))),0_0_0.9em_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1)))]";
const glass = "text-[rgb(var(--neon)/0.16)] [text-shadow:0_-0.014em_0_rgb(255_255_255/0.08)]";

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export interface RotatingTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  /** The inserts it cycles through. */
  words: string[];
  /** Milliseconds each word stays lit. */
  interval?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** The lit word, controlled. */
  index?: number;
  /** The first lit word, uncontrolled. */
  defaultIndex?: number;
  /** Fires when the timer moves to the next word. */
  onIndexChange?: (index: number) => void;
  /** Hold the current word. Hovering the line, focus inside it, a hidden tab and scrolling away also hold it. */
  paused?: boolean;
  /** Stutter on like a striking tube. Off, the new word fades up. */
  flicker?: boolean;
  /** Announce each new word to screen readers. Off, they read every word once, in place. */
  live?: boolean;
}

const RotatingText = React.forwardRef<HTMLSpanElement, RotatingTextProps>(
  (
    {
      className,
      style,
      color,
      words,
      interval = 2600,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      paused = false,
      flicker = true,
      live = false,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLSpanElement>(null);
    const stageRef = React.useRef<HTMLSpanElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLSpanElement);

    const count = words.length;
    const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
    const controlled = indexProp !== undefined;
    const index = count ? ((((controlled ? indexProp : uncontrolled) % count) + count) % count) : 0;

    // The word going out, and whether the current one arrived by a swap (and so strikes) or was there first.
    const [previous, setPrevious] = React.useState(-1);
    const [swapped, setSwapped] = React.useState(false);
    const [shown, setShown] = React.useState(index);
    if (shown !== index) {
      setPrevious(shown);
      setSwapped(true);
      setShown(index);
    }

    const [widths, setWidths] = React.useState<number[] | null>(null);
    const [held, setHeld] = React.useState(false);

    useIsoLayoutEffect(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const measure = () => {
        const next = Array.from(stage.children, (node) => (node as HTMLElement).offsetWidth);
        setWidths((prev) => (prev && prev.length === next.length && prev.every((w, i) => w === next[i]) ? prev : next));
      };
      measure();
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
      Array.from(stage.children).forEach((node) => ro?.observe(node));
      return () => ro?.disconnect();
    }, [words]);

    // Hold while the pointer is on the line, focus is inside it, the tab is hidden or it's off screen.
    React.useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const line = root.parentElement ?? root;
      let hover = false;
      let focus = false;
      let inView = true;
      const sync = () => setHeld(hover || focus || !inView || document.hidden);
      const enter = () => {
        hover = true;
        sync();
      };
      const leave = () => {
        hover = false;
        sync();
      };
      const focusIn = () => {
        focus = true;
        sync();
      };
      const focusOut = (event: FocusEvent) => {
        if (!line.contains(event.relatedTarget as Node | null)) {
          focus = false;
          sync();
        }
      };
      const io =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              inView = entry.isIntersecting;
              sync();
            });
      io?.observe(root);
      line.addEventListener("pointerenter", enter);
      line.addEventListener("pointerleave", leave);
      line.addEventListener("focusin", focusIn);
      line.addEventListener("focusout", focusOut);
      document.addEventListener("visibilitychange", sync);
      return () => {
        io?.disconnect();
        line.removeEventListener("pointerenter", enter);
        line.removeEventListener("pointerleave", leave);
        line.removeEventListener("focusin", focusIn);
        line.removeEventListener("focusout", focusOut);
        document.removeEventListener("visibilitychange", sync);
      };
    }, []);

    const advance = React.useRef(() => {});
    advance.current = () => {
      const next = (index + 1) % count;
      if (!controlled) setUncontrolled(next);
      onIndexChange?.(next);
    };

    React.useEffect(() => {
      if (paused || held || count < 2) return;
      const timer = setTimeout(() => advance.current(), Math.max(800, interval));
      return () => clearTimeout(timer);
    }, [index, paused, held, count, interval]);

    // Once the old word is gone, drop it so it can come back later with a fresh animation.
    React.useEffect(() => {
      if (previous < 0) return;
      const timer = setTimeout(() => setPrevious(-1), 700);
      return () => clearTimeout(timer);
    }, [previous, index]);

    const width = widths?.[index];

    return (
      <span
        ref={rootRef}
        data-flicker={flicker ? undefined : "false"}
        style={neonVars(color, {
          width: width === undefined ? undefined : `${width}px`,
          ...style,
        })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "nk-rt-root relative inline-block whitespace-nowrap text-left align-bottom",
          "transition-[width] delay-150 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {live ? (
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {words[index]}
          </span>
        ) : (
          <span className="sr-only">{words.join(", ")}</span>
        )}
        {/* Holds the line height and baseline; its width only counts before the words are measured. */}
        <span aria-hidden className="invisible">
          {words[index]}
        </span>
        <span ref={stageRef} aria-hidden>
          {words.map((word, i) => (
            <span
              key={`${i}-${word}`}
              className="nk-rt-word"
              data-state={i === index ? (swapped ? "in" : "on") : i === previous ? "out" : undefined}
            >
              <span className={glass}>{word}</span>
              <span className={cn("nk-rt-lit absolute inset-0", lit)}>{word}</span>
            </span>
          ))}
        </span>
      </span>
    );
  },
);
RotatingText.displayName = "RotatingText";

export { RotatingText };
