"use client";

// --- Switch component start ---
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
    | "neon-pink";
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
        track: "bg-slate-700 border border-cyan-400/30",
        trackChecked:
          "bg-cyan-400/20 border-cyan-400 shadow-[0_0_10px_rgb(34,211,238,0.3)]",
        thumb: "bg-slate-400",
        thumbChecked: "bg-cyan-400 shadow-[0_0_8px_rgb(34,211,238,0.6)]",
      },
      "neon-purple": {
        track: "bg-slate-700 border border-purple-400/30",
        trackChecked:
          "bg-purple-400/20 border-purple-400 shadow-[0_0_10px_rgb(168,85,247,0.3)]",
        thumb: "bg-slate-400",
        thumbChecked: "bg-purple-400 shadow-[0_0_8px_rgb(168,85,247,0.6)]",
      },
      "neon-chartreuse": {
        track: "bg-slate-700 border border-lime-400/30",
        trackChecked:
          "bg-lime-400/20 border-lime-400 shadow-[0_0_10px_rgb(163,230,53,0.3)]",
        thumb: "bg-slate-400",
        thumbChecked: "bg-lime-400 shadow-[0_0_8px_rgb(163,230,53,0.6)]",
      },
      "neon-pink": {
        track: "bg-slate-700 border border-pink-400/30",
        trackChecked:
          "bg-pink-400/20 border-pink-400 shadow-[0_0_10px_rgb(244,114,182,0.3)]",
        thumb: "bg-slate-400",
        thumbChecked: "bg-pink-400 shadow-[0_0_8px_rgb(244,114,182,0.6)]",
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
          x: isChecked ? (size === "sm" ? 20 : size === "lg" ? 32 : 24) : 0,
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
          "inline-flex items-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
// --- Switch component end ---

export default function BasicSwitchesPreview() {
  return (
    <div className="space-y-8 w-full max-w-md">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Basic Switch Variants:
          </h4>

          <div className="flex flex-wrap gap-4">
            <Switch defaultChecked />
            <Switch defaultChecked />
            <Switch disabled defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
