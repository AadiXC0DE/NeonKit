"use client";

// --- Radio component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RadioProps
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
  value?: string;
  name?: string;
}

const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
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
      value,
      name,
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
      sm: "w-4 h-4",
      default: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const innerSizes = {
      sm: "w-1.5 h-1.5",
      default: "w-2 h-2",
      lg: "w-2.5 h-2.5",
    };

    const variants = {
      default: {
        outer: "border-slate-400",
        outerChecked: "border-slate-300 bg-slate-300",
        inner: "bg-white",
      },
      "neon-cyan": {
        outer:
          "border-2 border-cyan-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(34,211,238,0.4)] hover:shadow-[0_0_20px_rgb(34,211,238,0.6)] hover:border-cyan-400",
        outerChecked:
          "border-2 border-cyan-400 bg-cyan-400 shadow-[0_0_20px_rgb(34,211,238,0.8)]",
        inner: "bg-cyan-400",
      },
      "neon-purple": {
        outer:
          "border-2 border-purple-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(168,85,247,0.4)] hover:shadow-[0_0_20px_rgb(168,85,247,0.6)] hover:border-purple-400",
        outerChecked:
          "border-2 border-purple-400 bg-purple-400 shadow-[0_0_20px_rgb(168,85,247,0.8)]",
        inner: "bg-purple-400",
      },
      "neon-chartreuse": {
        outer:
          "border-2 border-lime-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(163,230,53,0.4)] hover:shadow-[0_0_20px_rgb(163,230,53,0.6)] hover:border-lime-400",
        outerChecked:
          "border-2 border-lime-400 bg-lime-400 shadow-[0_0_20px_rgb(163,230,53,0.8)]",
        inner: "bg-lime-400",
      },
      "neon-pink": {
        outer:
          "border-2 border-pink-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(244,114,182,0.4)] hover:shadow-[0_0_20px_rgb(244,114,182,0.6)] hover:border-pink-400",
        outerChecked:
          "border-2 border-pink-400 bg-pink-400 shadow-[0_0_20px_rgb(244,114,182,0.8)]",
        inner: "bg-pink-400",
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

    const innerContent = (
      <motion.div
        className={cn(
          "rounded-full transition-all duration-200 ease-in-out",
          innerSizes[size],
          isChecked ? variants[variant].inner : "bg-transparent",
        )}
        initial={false}
        animate={{
          scale: isChecked ? 1 : 0,
          opacity: isChecked ? 1 : 0,
        }}
        transition={{
          duration: animate && !prefersReducedMotion ? 0.15 : 0,
        }}
      />
    );

    const outerContent = (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 ease-in-out cursor-pointer",
          sizes[size],
          isChecked ? variants[variant].outerChecked : variants[variant].outer,
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {innerContent}
      </div>
    );

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center focus:outline-none",
          disabled && "cursor-not-allowed",
        )}
        value={value}
        name={name}
        {...props}
      >
        {outerContent}
      </button>
    );
  },
);

Radio.displayName = "Radio";
// --- Radio component end ---

export default function RadioSizesPreview() {
  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Small Size (sm):
            </h4>
            <div className="flex items-center gap-3">
              <Radio size="sm" variant="neon-cyan" />
              <Radio size="sm" variant="neon-purple" defaultChecked />
              <Radio size="sm" variant="neon-chartreuse" />
              <span className="text-xs text-muted-foreground">
                Perfect for compact forms
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Default Size:
            </h4>
            <div className="flex items-center gap-3">
              <Radio variant="neon-cyan" />
              <Radio variant="neon-purple" defaultChecked />
              <Radio variant="neon-chartreuse" />
              <span className="text-xs text-muted-foreground">
                Standard radio size
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Large Size (lg):
            </h4>
            <div className="flex items-center gap-3">
              <Radio size="lg" variant="neon-cyan" />
              <Radio size="lg" variant="neon-purple" defaultChecked />
              <Radio size="lg" variant="neon-chartreuse" />
              <span className="text-xs text-muted-foreground">
                For prominent selections
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
