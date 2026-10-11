"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Progress lives in one CSS variable written from a rAF loop; every layer reads
// it, so React only renders when the phase changes.
const css = `
@keyframes nk-hold-button-flash{0%{opacity:0}10%{opacity:.9}100%{opacity:0}}
@keyframes nk-hold-button-burst{0%{outline-offset:0;opacity:.9}100%{outline-offset:var(--nk-hold-button-reach);opacity:0}}
.nk-hold-button-flash{animation:nk-hold-button-flash 560ms cubic-bezier(0.23,1,0.32,1) both}
.nk-hold-button-burst{animation:nk-hold-button-burst 700ms cubic-bezier(0.23,1,0.32,1) both}
@media (prefers-reduced-motion:reduce){.nk-hold-button-flash,.nk-hold-button-burst{animation:none;opacity:0}}
`;

const sizes = {
  sm: { root: "h-8 gap-1.5 rounded-md px-3 text-xs", reach: "10px" },
  md: { root: "h-10 gap-2 rounded-lg px-4 text-sm", reach: "13px" },
  lg: { root: "h-12 gap-2.5 rounded-xl px-6 text-base", reach: "16px" },
} as const;

type Phase = "idle" | "holding" | "draining" | "complete";

const P = "var(--nk-hold-button-progress,0)";

export interface HoldButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Milliseconds of holding to confirm. */
  duration?: number;
  /** Fires once when the tube fills. */
  onComplete?: () => void;
  /** Fires when a hold starts (pointer down, or Space/Enter down). */
  onHoldStart?: () => void;
  /** Fires when a hold is released early, with how full the tube got (0 to 1). */
  onHoldCancel?: (progress: number) => void;
  /** Label shown, and announced, once confirmed. */
  completeLabel?: React.ReactNode;
  /** Milliseconds the tube stays lit after confirming before it drains and re-arms. `Infinity` keeps it confirmed. */
  resetDelay?: number;
  /** Screen reader instructions, linked with aria-describedby. */
  hint?: string;
}

const HoldButton = React.forwardRef<HTMLButtonElement, HoldButtonProps>(
  (
    {
      className,
      style,
      color,
      size = "md",
      duration = 1500,
      onComplete,
      onHoldStart,
      onHoldCancel,
      completeLabel,
      resetDelay = 1200,
      hint = "Press and hold to confirm.",
      disabled,
      children,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onPointerMove,
      onKeyDown,
      onKeyUp,
      onBlur,
      onContextMenu,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) => {
    const hintId = React.useId();
    const s = sizes[size];
    const [phase, setPhase] = React.useState<Phase>("idle");
    const [completions, setCompletions] = React.useState(0);

    const rootRef = React.useRef<HTMLButtonElement | null>(null);
    const engine = React.useRef({
      phase: "idle" as Phase,
      progress: 0,
      frame: 0,
      last: 0,
      held: false,
      // Draining after a confirm: it has to empty before it re-arms.
      cooling: false,
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    });
    // The loop outlives renders, so it reads props through a ref.
    const latest = React.useRef({ duration, resetDelay, onComplete, onHoldStart, onHoldCancel });
    React.useEffect(() => {
      latest.current = { duration, resetDelay, onComplete, onHoldStart, onHoldCancel };
    });

    React.useEffect(() => {
      const e = engine.current;
      return () => {
        cancelAnimationFrame(e.frame);
        clearTimeout(e.timer);
      };
    }, []);

    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const enter = (next: Phase) => {
      engine.current.phase = next;
      setPhase(next);
    };

    const write = () => {
      rootRef.current?.style.setProperty("--nk-hold-button-progress", engine.current.progress.toFixed(4));
    };

    const stop = () => {
      engine.current.frame = 0;
      engine.current.last = 0;
    };

    const tick = (now: number) => {
      const e = engine.current;
      const dt = Math.min((now - (e.last || now)) / 1000, 0.05);
      e.last = now;
      const seconds = Math.max(latest.current.duration, 1) / 1000;

      if (e.phase === "holding") {
        e.progress = Math.min(1, e.progress + dt / seconds);
        if (e.progress >= 1) {
          write();
          stop();
          complete();
          return;
        }
      } else if (e.phase === "draining") {
        // Fast at first, then trailing off, like gas leaving a tube: about a third of `duration` from full.
        e.progress = Math.max(0, e.progress - (5.8 / seconds) * (e.progress + 0.15) * dt);
        if (e.progress <= 0) {
          write();
          stop();
          e.cooling = false;
          enter("idle");
          return;
        }
      } else {
        stop();
        return;
      }
      write();
      e.frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (!engine.current.frame) engine.current.frame = requestAnimationFrame(tick);
    };

    const scheduleReset = () => {
      const e = engine.current;
      clearTimeout(e.timer);
      if (!Number.isFinite(latest.current.resetDelay)) return;
      e.timer = setTimeout(() => {
        e.cooling = true;
        enter("draining");
        run();
      }, latest.current.resetDelay);
    };

    const complete = () => {
      enter("complete");
      setCompletions((count) => count + 1);
      if (typeof navigator !== "undefined") navigator.vibrate?.(12);
      latest.current.onComplete?.();
      if (!engine.current.held) scheduleReset();
    };

    const start = () => {
      const e = engine.current;
      if (disabled || e.held || e.cooling || e.phase === "complete") return;
      e.held = true;
      enter("holding");
      latest.current.onHoldStart?.();
      run();
    };

    const release = () => {
      const e = engine.current;
      if (!e.held) return;
      e.held = false;
      if (e.phase === "holding") {
        latest.current.onHoldCancel?.(e.progress);
        enter("draining");
        run();
      } else if (e.phase === "complete") {
        scheduleReset();
      }
    };

    const completed = phase === "complete";
    // Read at render, so a label that changes in onComplete is the one announced.
    const announcement = completed && typeof completeLabel === "string" ? completeLabel : "";

    return (
      <>
        <button
          ref={setRefs}
          type="button"
          disabled={disabled}
          data-state={phase}
          aria-describedby={[describedBy, hint ? hintId : undefined].filter(Boolean).join(" ") || undefined}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            if (event.defaultPrevented || event.button !== 0) return;
            event.currentTarget.setPointerCapture?.(event.pointerId);
            start();
          }}
          onPointerUp={(event) => {
            onPointerUp?.(event);
            release();
          }}
          onPointerCancel={(event) => {
            onPointerCancel?.(event);
            release();
          }}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            if (!engine.current.held || engine.current.phase !== "holding") return;
            // Sliding well off the button lets go, like a native press.
            const rect = event.currentTarget.getBoundingClientRect();
            const slack = 16;
            if (
              event.clientX < rect.left - slack ||
              event.clientX > rect.right + slack ||
              event.clientY < rect.top - slack ||
              event.clientY > rect.bottom + slack
            ) {
              release();
            }
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              if (!event.repeat) start();
            } else if (event.key === "Escape") {
              release();
            }
          }}
          onKeyUp={(event) => {
            onKeyUp?.(event);
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              release();
            }
          }}
          onBlur={(event) => {
            onBlur?.(event);
            release();
          }}
          onContextMenu={(event) => {
            onContextMenu?.(event);
            // Long-press on touch opens a menu; it would interrupt the hold.
            if (engine.current.held) event.preventDefault();
          }}
          style={neonVars(color, { "--nk-hold-button-reach": s.reach, ...style } as React.CSSProperties)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/hold relative isolate inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none touch-manipulation [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]",
            "border border-[rgb(var(--neon)/0.32)] [background:linear-gradient(180deg,rgb(var(--neon)/0.08),rgb(var(--neon)/0.02)),#07080d]",
            "[color:color-mix(in_srgb,rgb(var(--neon))_25%,white)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]",
            "transition-[border-color,transform,scale] duration-150 ease-out hover:border-[rgb(var(--neon)/0.55)]",
            "data-[state=holding]:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            "disabled:pointer-events-none disabled:opacity-50",
            s.root,
            className,
          )}
          {...props}
        >
          <style>{css}</style>

          {/* Halo: grows with the square of progress, so the last stretch feels loaded. */}
          <span
            aria-hidden
            style={{ opacity: `calc(${P} * ${P})` }}
            className="pointer-events-none absolute -inset-px rounded-[inherit] shadow-[0_0_14px_rgb(var(--neon)/0.55),0_0_36px_rgb(var(--neon)/0.3)]"
          />

          {/* The tube: lit gas pushes in from the left with a hot leading edge. */}
          <span aria-hidden className="pointer-events-none absolute -inset-px overflow-hidden rounded-[inherit]">
            <span
              style={{
                transform: `translateX(calc((${P} - 1) * 100%))`,
                opacity: `calc(0.6 + ${P} * 0.4)`,
              }}
              className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--neon)/0.08),rgb(var(--neon)/0.26)_65%,rgb(var(--neon)/0.5))]"
            >
              <span
                style={{ opacity: completed ? 0 : `clamp(0, ${P} * 24, 1)` }}
                className="absolute inset-y-0 right-0 w-[2px] bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_6px_1px_rgb(var(--neon)),0_0_18px_4px_rgb(var(--neon)/0.5)]"
              />
            </span>
          </span>

          {/* The glass edge lights as the tube fills. */}
          <span
            aria-hidden
            style={{ opacity: P }}
            className="pointer-events-none absolute -inset-px rounded-[inherit] border border-[rgb(var(--neon))]"
          />

          {/* Confirmed: the whole tube burns evenly. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-px rounded-[inherit] bg-[rgb(var(--neon)/0.2)] shadow-[inset_0_0_14px_rgb(var(--neon)/0.35)] transition-opacity duration-300 ease-out",
              completed ? "opacity-100" : "opacity-0",
            )}
          />

          {completions > 0 && (
            <React.Fragment key={completions}>
              <span
                aria-hidden
                className="nk-hold-button-flash pointer-events-none absolute -inset-px rounded-[inherit] bg-[color-mix(in_srgb,rgb(var(--neon))_55%,white)] shadow-[0_0_24px_rgb(var(--neon)),0_0_60px_rgb(var(--neon)/0.6)]"
              />
              <span
                aria-hidden
                className="nk-hold-button-burst pointer-events-none absolute -inset-px rounded-[inherit] [outline:1.5px_solid_rgb(var(--neon)/0.8)]"
              />
            </React.Fragment>
          )}

          <span className="relative grid place-items-center gap-[inherit] [&>*]:col-start-1 [&>*]:row-start-1">
            <span
              aria-hidden={completed && completeLabel !== undefined ? true : undefined}
              className={cn(
                "inline-flex items-center gap-[inherit] transition-[opacity,transform,translate] duration-150 ease-out [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                completed && completeLabel !== undefined && "-translate-y-1 opacity-0",
              )}
            >
              {children}
            </span>
            {completeLabel !== undefined && (
              <span
                aria-hidden={completed ? undefined : true}
                className={cn(
                  "inline-flex items-center gap-[inherit] [text-shadow:0_0_10px_rgb(var(--neon)/0.8)] transition-[opacity,transform,translate] duration-150 ease-out [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                  completed ? "opacity-100" : "translate-y-1 opacity-0",
                )}
              >
                {completeLabel}
              </span>
            )}
          </span>
        </button>
        {hint && (
          <span id={hintId} hidden>
            {hint}
          </span>
        )}
        <span role="status" className="sr-only">
          {announcement}
        </span>
      </>
    );
  },
);
HoldButton.displayName = "HoldButton";

export { HoldButton };
