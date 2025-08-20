"use client";

// --- CircularProgress component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CircularProgressProps {
  variant?:
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
  pulseEffect?: boolean;
  className?: string;
}

const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(
  (
    {
      variant = "neon-cyan",
      value = 0,
      max = 100,
      size = "md",
      strokeWidth = 4,
      showLabel = false,
      label,
      animated = true,
      pulseEffect = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = React.useState(0);

    React.useEffect(() => {
      if (animated) {
        const interval = setInterval(() => {
          setCurrentValue((prev) => {
            if (prev >= value) return value;
            return prev + Math.max(1, (value - prev) * 0.1);
          });
        }, 50);
        return () => clearInterval(interval);
      } else {
        setCurrentValue(value);
      }
    }, [value, animated]);

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const percentage = Math.min(100, Math.max(0, (currentValue / max) * 100));
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

    const iconSizes = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
      xl: "w-6 h-6",
    };

    const strokeColors = {
      "neon-cyan": "stroke-[#22d3ee]",
      "neon-purple": "stroke-[#a855f7]",
      "neon-chartreuse": "stroke-[#a3e635]",
      "neon-pink": "stroke-[#f472b6]",
      "neon-destructive": "stroke-[#f87171]",
      "neon-success": "stroke-[#34d399]",
      "neon-warning": "stroke-[#fbbf24]",
    };

    const bgStrokeColors = {
      "neon-cyan": "stroke-[#22d3ee]/20",
      "neon-purple": "stroke-[#a855f7]/20",
      "neon-chartreuse": "stroke-[#a3e635]/20",
      "neon-pink": "stroke-[#f472b6]/20",
      "neon-destructive": "stroke-[#f87171]/20",
      "neon-success": "stroke-[#34d399]/20",
      "neon-warning": "stroke-[#fbbf24]/20",
    };

    const glowEffects = {
      "neon-cyan": "drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]",
      "neon-purple": "drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]",
      "neon-chartreuse": "drop-shadow-[0_0_12px_rgba(163,230,53,0.8)]",
      "neon-pink": "drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]",
      "neon-destructive": "drop-shadow-[0_0_12px_rgba(248,113,113,0.8)]",
      "neon-success": "drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]",
      "neon-warning": "drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]",
    };

    const getGlowColor = () => {
      const colorMap = {
        "neon-cyan": "rgba(34,211,238,0.6)",
        "neon-purple": "rgba(168,85,247,0.6)",
        "neon-chartreuse": "rgba(163,230,53,0.6)",
        "neon-pink": "rgba(244,114,182,0.6)",
        "neon-destructive": "rgba(248,113,113,0.6)",
        "neon-success": "rgba(52,211,153,0.6)",
        "neon-warning": "rgba(251,191,36,0.6)",
      };
      return colorMap[variant];
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          sizes[size],
          className,
        )}
        role="progressbar"
        aria-valuenow={currentValue}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        {/* Main circular progress */}
        <svg
          className={cn("transform -rotate-90", glowEffects[variant])}
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
            animate={{ strokeDashoffset }}
            transition={{
              duration: animated && !prefersReducedMotion ? 1.5 : 0,
              ease: "easeOut",
            }}
            style={{
              filter: `drop-shadow(0 0 8px ${getGlowColor()})`,
            }}
          />
        </svg>

        {/* Pulsing glow effect */}
        {pulseEffect && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showLabel ? (
            <div className="text-center">
              <div className={cn("font-bold text-foreground", textSizes[size])}>
                {Math.round(percentage)}%
              </div>
              {label && (
                <div
                  className={cn(
                    "text-xs text-muted-foreground mt-1",
                    size === "sm" && "text-[10px]",
                  )}
                >
                  {label}
                </div>
              )}
            </div>
          ) : label ? (
            <div
              className={cn(
                "font-medium text-foreground text-center",
                textSizes[size],
              )}
            >
              {label}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

CircularProgress.displayName = "CircularProgress";
// --- CircularProgress component end ---

import { useState, useEffect } from "react";

export default function NeonCircularProgress() {
  const [progress, setProgress] = useState(0);
  const [currentVariant, setCurrentVariant] = useState(0);

  const variants = [
    "neon-cyan",
    "neon-purple",
    "neon-chartreuse",
    "neon-pink",
    "neon-warning",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const variantInterval = setInterval(() => {
      setCurrentVariant((prev) => (prev + 1) % variants.length);
    }, 4000);
    return () => clearInterval(variantInterval);
  }, []);

  return (
    <div className="space-y-8 w-full max-w-4xl">
      {/* Dynamic Circular Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Dynamic Neon Circular Progress
        </h3>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center space-y-2">
            <CircularProgress
              variant={variants[currentVariant] as any}
              value={progress}
              size="lg"
              showLabel
              label={variants[currentVariant]
                .replace("neon-", "")
                .toUpperCase()}
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">
              Auto-cycling variants
            </p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-cyan"
              value={75}
              size="lg"
              showLabel
              label="Processing"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">With pulse effect</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-purple"
              value={60}
              size="lg"
              showLabel
              label="Loading"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Purple neon</p>
          </div>
        </div>
      </div>

      {/* Neon Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Neon Variants</h3>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-chartreuse"
              value={85}
              size="lg"
              showLabel
              label="Download"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Clean design</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-pink"
              value={40}
              size="lg"
              showLabel
              label="Upload"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Pink neon</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-warning"
              value={95}
              size="lg"
              showLabel
              label="Complete"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Warning neon</p>
          </div>
        </div>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Sizes</h3>

        <div className="flex flex-wrap justify-center gap-6">
          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-cyan"
              value={70}
              size="sm"
              showLabel
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Small</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-purple"
              value={65}
              size="md"
              showLabel
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Medium</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-chartreuse"
              value={80}
              size="lg"
              showLabel
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Large</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-pink"
              value={55}
              size="xl"
              showLabel
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Extra Large</p>
          </div>
        </div>
      </div>

      {/* Status Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status Variants</h3>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-success"
              value={100}
              size="lg"
              showLabel
              label="Success"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Success state</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-destructive"
              value={25}
              size="lg"
              showLabel
              label="Error"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Error state</p>
          </div>

          <div className="text-center space-y-2">
            <CircularProgress
              variant="neon-warning"
              value={50}
              size="lg"
              showLabel
              label="Warning"
              pulseEffect
            />
            <p className="text-sm text-muted-foreground">Warning state</p>
          </div>
        </div>
      </div>

      {/* Simple Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Simple Variants</h3>

        <div className="flex flex-wrap justify-center gap-4">
          <CircularProgress variant="neon-cyan" value={90} size="md" />
          <CircularProgress variant="neon-purple" value={75} size="md" />
          <CircularProgress variant="neon-chartreuse" value={60} size="md" />
          <CircularProgress variant="neon-pink" value={45} size="md" />
          <CircularProgress variant="neon-warning" value={30} size="md" />
          <CircularProgress variant="neon-destructive" value={15} size="md" />
        </div>
      </div>
    </div>
  );
}
