"use client";

// --- CircularProgress component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CircularProgressProps {
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
  size?: "sm" | "md" | "lg" | "xl";
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(
  (
    {
      variant = "default",
      value = 0,
      max = 100,
      size = "md",
      strokeWidth = 4,
      showLabel = false,
      label,
      animated = true,
      className,
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const sizes = {
      sm: "w-16 h-16",
      md: "w-20 h-20",
      lg: "w-24 h-24",
      xl: "w-32 h-32",
    };

    const textSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
      xl: "text-lg",
    };

    const strokeColors = {
      default: "stroke-primary",
      "neon-cyan": "stroke-[#22d3ee]",
      "neon-purple": "stroke-[#a855f7]",
      "neon-chartreuse": "stroke-[#a3e635]",
      "neon-pink": "stroke-[#f472b6]",
      "neon-destructive": "stroke-[#f87171]",
      "neon-success": "stroke-[#34d399]",
      "neon-warning": "stroke-[#fbbf24]",
    };

    const bgStrokeColors = {
      default: "stroke-muted",
      "neon-cyan": "stroke-[#22d3ee]/20",
      "neon-purple": "stroke-[#a855f7]/20",
      "neon-chartreuse": "stroke-[#a3e635]/20",
      "neon-pink": "stroke-[#f472b6]/20",
      "neon-destructive": "stroke-[#f87171]/20",
      "neon-success": "stroke-[#34d399]/20",
      "neon-warning": "stroke-[#fbbf24]/20",
    };

    const glowEffects = {
      default: "",
      "neon-cyan": "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]",
      "neon-purple": "drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]",
      "neon-chartreuse": "drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]",
      "neon-pink": "drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]",
      "neon-destructive": "drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]",
      "neon-success": "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]",
      "neon-warning": "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    };

    const isNeonVariant = variant?.startsWith("neon-");

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          sizes[size],
          className,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <svg
          className={cn(
            "transform -rotate-90",
            isNeonVariant && glowEffects[variant],
          )}
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={bgStrokeColors[variant]}
          />

          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={strokeColors[variant]}
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: animated && !prefersReducedMotion ? 1.5 : 0,
              ease: "easeOut",
            }}
            style={{
              filter: isNeonVariant
                ? `drop-shadow(0 0 6px ${
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
                  })`
                : undefined,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {showLabel ? (
            <span
              className={cn(
                "font-bold",
                textSizes[size],
                isNeonVariant && "text-foreground",
              )}
            >
              {Math.round(percentage)}%
            </span>
          ) : label ? (
            <span
              className={cn(
                "font-medium",
                textSizes[size],
                isNeonVariant && "text-foreground",
              )}
            >
              {label}
            </span>
          ) : null}
        </div>

        {/* Pulsing glow effect for neon variants */}
        {isNeonVariant && animated && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: `radial-gradient(circle, ${
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
              } 0%, transparent 70%)`,
            }}
          />
        )}
      </div>
    );
  },
);

CircularProgress.displayName = "CircularProgress";
// --- CircularProgress component end ---

import { useState, useEffect } from "react";

export default function CircularProgressDemo() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-8 justify-center flex-wrap">
      <div className="text-center space-y-2">
        <CircularProgress value={75} size="md" showLabel />
        <p className="text-sm text-muted-foreground">Default</p>
      </div>

      <div className="text-center space-y-2">
        <CircularProgress variant="neon-cyan" value={60} size="md" showLabel />
        <p className="text-sm text-muted-foreground">Neon Cyan</p>
      </div>

      <div className="text-center space-y-2">
        <CircularProgress
          variant="neon-purple"
          value={90}
          size="md"
          showLabel
        />
        <p className="text-sm text-muted-foreground">Neon Purple</p>
      </div>

      <div className="text-center space-y-2">
        <CircularProgress
          variant="neon-chartreuse"
          value={45}
          size="md"
          showLabel
        />
        <p className="text-sm text-muted-foreground">Neon Chartreuse</p>
      </div>

      <div className="text-center space-y-2">
        <CircularProgress
          variant="neon-pink"
          value={progress}
          size="lg"
          showLabel
          animated
        />
        <p className="text-sm text-muted-foreground">Animated</p>
      </div>
    </div>
  );
}
