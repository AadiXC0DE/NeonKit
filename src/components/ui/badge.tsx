"use client";

import * as React from "react";
import { X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const variants = {
  soft: "border-[rgb(var(--neon)/0.18)] bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))]",
  outline:
    "border-[rgb(var(--neon)/0.55)] text-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.14*var(--neon-glow,1))),inset_0_0_8px_rgb(var(--neon)/CALC(0.08*var(--neon-glow,1)))] [text-shadow:0_0_8px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
  solid:
    "border-transparent bg-[rgb(var(--neon))] text-[#05060a] shadow-[0_0_14px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.4)]",
} as const;

// Padding next to the dot and the remove button is tuned so both sit
// concentric with the pill's rounded ends (the 1px border is included).
const sizes = {
  sm: {
    root: "h-5 gap-1.5 px-2 text-[11px]",
    dot: "pl-1.5",
    remove: "pr-0.5",
    button: "size-3.5",
    icon: "size-2.5",
  },
  md: {
    root: "h-6 gap-1.5 px-2.5 text-xs",
    dot: "pl-2",
    remove: "pr-[3px]",
    button: "size-4",
    icon: "size-3",
  },
} as const;

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Shows a small glowing status dot before the label. */
  dot?: boolean;
  /** Adds a ping ring to the dot. Implies `dot`. */
  pulse?: boolean;
  /** Renders a remove button after the label. */
  onRemove?: () => void;
  /** Accessible name for the remove button. */
  removeLabel?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      style,
      color,
      variant = "soft",
      size = "md",
      dot = false,
      pulse = false,
      onRemove,
      removeLabel = "Remove",
      children,
      ...props
    },
    ref,
  ) => {
    const s = sizes[size];
    const showDot = dot || pulse;

    return (
      <span
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-medium leading-none",
          "[&>svg]:size-3 [&>svg]:shrink-0",
          s.root,
          showDot && s.dot,
          onRemove && s.remove,
          variants[variant],
          className,
        )}
        {...props}
      >
        {showDot && (
          <span aria-hidden className="relative flex size-1.5 shrink-0">
            {pulse && (
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60 [animation-duration:1.6s] motion-reduce:animate-none" />
            )}
            <span
              className={cn(
                "relative size-1.5 rounded-full bg-current",
                variant !== "solid" && "shadow-[0_0_6px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1)))]",
              )}
            />
          </span>
        )}
        {children}
        {onRemove && (
          <button
            type="button"
            aria-label={removeLabel}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            className={cn(
              "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full opacity-60 outline-none",
              "transition-[opacity,background-color] duration-150 ease-out hover:opacity-100 focus-visible:opacity-100",
              "focus-visible:ring-1 focus-visible:ring-current",
              // Grows the hit area without growing the badge.
              "after:absolute after:-inset-1",
              variant === "solid" ? "hover:bg-black/15" : "hover:bg-[rgb(var(--neon)/0.2)]",
              s.button,
            )}
          >
            <X aria-hidden strokeWidth={2.5} className={s.icon} />
          </button>
        )}
      </span>
    );
  },
);
Badge.displayName = "Badge";

export { Badge };
