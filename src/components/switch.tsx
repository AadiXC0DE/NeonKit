"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-red"
    | "neon-emerald"
    | "neon-amber";
  animate?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled = false,
      size = "default",
      variant = "default",
      animate = true,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked || false,
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const sizes = {
      sm: "w-8 h-4",
      default: "w-11 h-6",
      lg: "w-14 h-7",
    };

    const thumbSizes = {
      sm: "w-3 h-3",
      default: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const variants = {
      default: {
        track: "bg-slate-600",
        trackChecked: "bg-slate-400",
        thumb: "bg-white",
        thumbChecked: "bg-white",
      },
      "neon-cyan": {
        track:
          "bg-slate-950/90 border-2 border-cyan-400/60 shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:shadow-[0_0_20px_rgb(34,211,238,0.5)]",
        trackChecked:
          "bg-cyan-400/20 border-2 border-cyan-400 shadow-[0_0_20px_rgb(34,211,238,0.6)] hover:shadow-[0_0_25px_rgb(34,211,238,0.8)]",
        thumb: "bg-slate-400 border border-cyan-400/30",
        thumbChecked:
          "bg-cyan-400 shadow-[0_0_10px_rgb(34,211,238,0.8)] border border-cyan-400",
      },
      "neon-purple": {
        track:
          "bg-slate-950/90 border-2 border-purple-400/60 shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:shadow-[0_0_20px_rgb(168,85,247,0.5)]",
        trackChecked:
          "bg-purple-400/20 border-2 border-purple-400 shadow-[0_0_20px_rgb(168,85,247,0.6)] hover:shadow-[0_0_25px_rgb(168,85,247,0.8)]",
        thumb: "bg-slate-400 border border-purple-400/30",
        thumbChecked:
          "bg-purple-400 shadow-[0_0_10px_rgb(168,85,247,0.8)] border border-purple-400",
      },
      "neon-chartreuse": {
        track:
          "bg-slate-950/90 border-2 border-lime-400/60 shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:shadow-[0_0_20px_rgb(163,230,53,0.5)]",
        trackChecked:
          "bg-lime-400/20 border-2 border-lime-400 shadow-[0_0_20px_rgb(163,230,53,0.6)] hover:shadow-[0_0_25px_rgb(163,230,53,0.8)]",
        thumb: "bg-slate-400 border border-lime-400/30",
        thumbChecked:
          "bg-lime-400 shadow-[0_0_10px_rgb(163,230,53,0.8)] border border-lime-400",
      },
      "neon-pink": {
        track:
          "bg-slate-950/90 border-2 border-pink-400/60 shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:shadow-[0_0_20px_rgb(244,114,182,0.5)]",
        trackChecked:
          "bg-pink-400/20 border-2 border-pink-400 shadow-[0_0_20px_rgb(244,114,182,0.6)] hover:shadow-[0_0_25px_rgb(244,114,182,0.8)]",
        thumb: "bg-slate-400 border border-pink-400/30",
        thumbChecked:
          "bg-pink-400 shadow-[0_0_10px_rgb(244,114,182,0.8)] border border-pink-400",
      },
      "neon-red": {
        track:
          "bg-slate-950/90 border-2 border-red-400/60 shadow-[0_0_15px_rgb(248,113,113,0.3)] hover:shadow-[0_0_20px_rgb(248,113,113,0.5)]",
        trackChecked:
          "bg-red-400/20 border-2 border-red-400 shadow-[0_0_20px_rgb(248,113,113,0.6)] hover:shadow-[0_0_25px_rgb(248,113,113,0.8)]",
        thumb: "bg-slate-400 border border-red-400/30",
        thumbChecked:
          "bg-red-400 shadow-[0_0_10px_rgb(248,113,113,0.8)] border border-red-400",
      },
      "neon-emerald": {
        track:
          "bg-slate-950/90 border-2 border-emerald-400/60 shadow-[0_0_15px_rgb(52,211,153,0.3)] hover:shadow-[0_0_20px_rgb(52,211,153,0.5)]",
        trackChecked:
          "bg-emerald-400/20 border-2 border-emerald-400 shadow-[0_0_20px_rgb(52,211,153,0.6)] hover:shadow-[0_0_25px_rgb(52,211,153,0.8)]",
        thumb: "bg-slate-400 border border-emerald-400/30",
        thumbChecked:
          "bg-emerald-400 shadow-[0_0_10px_rgb(52,211,153,0.8)] border border-emerald-400",
      },
      "neon-amber": {
        track:
          "bg-slate-950/90 border-2 border-amber-400/60 shadow-[0_0_15px_rgb(251,191,36,0.3)] hover:shadow-[0_0_20px_rgb(251,191,36,0.5)]",
        trackChecked:
          "bg-amber-400/20 border-2 border-amber-400 shadow-[0_0_20px_rgb(251,191,36,0.6)] hover:shadow-[0_0_25px_rgb(251,191,36,0.8)]",
        thumb: "bg-slate-400 border border-amber-400/30",
        thumbChecked:
          "bg-amber-400 shadow-[0_0_10px_rgb(251,191,36,0.8)] border border-amber-400",
      },
    };

    const handleClick = () => {
      if (disabled) return;

      if (isControlled) {
        onCheckedChange?.(!isChecked);
      } else {
        setInternalChecked(!internalChecked);
        onCheckedChange?.(!internalChecked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    const thumbContent = (
      <motion.div
        className={cn(
          "relative rounded-full transition-all duration-200 ease-in-out",
          thumbSizes[size],
          isChecked ? variants[variant].thumbChecked : variants[variant].thumb,
        )}
        animate={{
          x: isChecked ? (size === "sm" ? 16 : size === "lg" ? 28 : 22) : 2,
        }}
        transition={{ duration: animate && !prefersReducedMotion ? 0.2 : 0 }}
      />
    );

    const trackContent = (
      <div
        className={cn(
          "relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out cursor-pointer",
          sizes[size],
          isChecked ? variants[variant].trackChecked : variants[variant].track,
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {thumbContent}
      </div>
    );

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0",
          disabled && "cursor-not-allowed",
        )}
        {...props}
      >
        {trackContent}
      </button>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
