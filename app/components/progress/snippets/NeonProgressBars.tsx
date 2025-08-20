"use client";

// --- ProgressBar component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  value?: number;
  max?: number;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      variant = "default",
      value = 0,
      max = 100,
      size = "default",
      showLabel = false,
      label,
      animated = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const baseClasses =
      "relative w-full rounded-full overflow-hidden transition-all duration-300";
    const barClasses =
      "h-full rounded-full transition-all duration-500 ease-out";

    const variants = {
      default: "bg-muted",
      "neon-cyan":
        "bg-gradient-to-r from-[#22d3ee]/20 to-[#22d3ee]/30 border border-[#22d3ee]/40",
      "neon-purple":
        "bg-gradient-to-r from-[#a855f7]/20 to-[#a855f7]/30 border border-[#a855f7]/40",
      "neon-chartreuse":
        "bg-gradient-to-r from-[#a3e635]/20 to-[#a3e635]/30 border border-[#a3e635]/40",
      "neon-pink":
        "bg-gradient-to-r from-[#f472b6]/20 to-[#f472b6]/30 border border-[#f472b6]/40",
      "neon-destructive":
        "bg-gradient-to-r from-[#f87171]/20 to-[#f87171]/30 border border-[#f87171]/40",
      "neon-success":
        "bg-gradient-to-r from-[#34d399]/20 to-[#34d399]/30 border border-[#34d399]/40",
      "neon-warning":
        "bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/30 border border-[#fbbf24]/40",
    };

    const fillVariants = {
      default: "bg-primary",
      "neon-cyan":
        "bg-gradient-to-r from-[#22d3ee] to-[#22d3ee]/80 shadow-[0_0_10px_rgba(34,211,238,0.6)]",
      "neon-purple":
        "bg-gradient-to-r from-[#a855f7] to-[#a855f7]/80 shadow-[0_0_10px_rgba(168,85,247,0.6)]",
      "neon-chartreuse":
        "bg-gradient-to-r from-[#a3e635] to-[#a3e635]/80 shadow-[0_0_10px_rgba(163,230,53,0.6)]",
      "neon-pink":
        "bg-gradient-to-r from-[#f472b6] to-[#f472b6]/80 shadow-[0_0_10px_rgba(244,114,182,0.6)]",
      "neon-destructive":
        "bg-gradient-to-r from-[#f87171] to-[#f87171]/80 shadow-[0_0_10px_rgba(248,113,113,0.6)]",
      "neon-success":
        "bg-gradient-to-r from-[#34d399] to-[#34d399]/80 shadow-[0_0_10px_rgba(52,211,153,0.6)]",
      "neon-warning":
        "bg-gradient-to-r from-[#fbbf24] to-[#fbbf24]/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]",
    };

    const sizes = {
      sm: "h-2",
      default: "h-3",
      lg: "h-4",
    };

    const isNeonVariant = variant?.startsWith("neon-");

    const progressBar = (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isNeonVariant && "shadow-lg backdrop-blur-sm",
          className,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <motion.div
          className={cn(barClasses, fillVariants[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated && !prefersReducedMotion ? 1 : 0.3,
            ease: "easeOut",
          }}
        />

        {isNeonVariant && (
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-sm"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${
                variant === "neon-cyan"
                  ? "#22d3ee"
                  : variant === "neon-purple"
                  ? "#a855f7"
                  : variant === "neon-chartreuse"
                  ? "#a3e635"
                  : variant === "neon-pink"
                  ? "#f472b6"
                  : variant === "neon-destructive"
                  ? "#f87171"
                  : variant === "neon-success"
                  ? "#34d399"
                  : variant === "neon-warning"
                  ? "#fbbf24"
                  : "#22d3ee"
              } ${percentage}%, transparent ${percentage}%)`,
            }}
          />
        )}
      </div>
    );

    if (showLabel || label) {
      return (
        <div className="space-y-2">
          {(label || showLabel) && (
            <div className="flex justify-between items-center">
              {label && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    isNeonVariant && "text-foreground",
                  )}
                >
                  {label}
                </span>
              )}
              {showLabel && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    isNeonVariant && "text-foreground",
                  )}
                >
                  {Math.round(percentage)}%
                </span>
              )}
            </div>
          )}
          {progressBar}
          {children}
        </div>
      );
    }

    return progressBar;
  },
);

ProgressBar.displayName = "ProgressBar";
// --- ProgressBar component end ---

import { useState, useEffect } from "react";

export default function NeonProgressBars() {
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 w-full max-w-md">
      <ProgressBar variant="neon-cyan" value={75} showLabel />
      <ProgressBar variant="neon-purple" value={60} showLabel />
      <ProgressBar variant="neon-chartreuse" value={90} showLabel />
      <ProgressBar variant="neon-pink" value={45} showLabel />
      <ProgressBar variant="neon-destructive" value={25} showLabel />
      <div className="pt-4">
        <ProgressBar
          variant="neon-warning"
          value={progress}
          showLabel
          animated
        />
      </div>
    </div>
  );
}
