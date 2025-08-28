"use client";

// --- ProgressBar component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  variant?: "default" | "secondary" | "outline" | "ghost";
  value?: number;
  max?: number;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
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
      striped = false,
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
      secondary: "bg-muted-foreground/10",
      outline: "bg-background border-2 border-border",
      ghost: "bg-transparent border-2 border-dashed border-border",
    };

    const fillVariants = {
      default: "bg-primary",
      secondary: "bg-muted-foreground",
      outline: "bg-primary",
      ghost: "bg-primary/50",
    };

    const sizes = {
      sm: "h-2",
      default: "h-3",
      lg: "h-4",
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <motion.div
          className={cn(
            barClasses,
            fillVariants[variant],
            striped &&
              "bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-pulse",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated && !prefersReducedMotion ? 1.2 : 0.3,
            ease: "easeOut",
          }}
        />

        {animated && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["0%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
// --- ProgressBar component end ---

import { useState, useEffect } from "react";

export default function BasicProgressBars() {
  const [progress, setProgress] = useState(0);
  const [stripedProgress, setStripedProgress] = useState(25);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 3));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStripedProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 w-full max-w-md">
      {/* Default variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Default Variants</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Default</span>
              <span className="text-sm text-muted-foreground">80%</span>
            </div>
            <ProgressBar value={80} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Secondary</span>
              <span className="text-sm text-muted-foreground">60%</span>
            </div>
            <ProgressBar variant="secondary" value={60} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Outline</span>
              <span className="text-sm text-muted-foreground">45%</span>
            </div>
            <ProgressBar variant="outline" value={45} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Ghost</span>
              <span className="text-sm text-muted-foreground">30%</span>
            </div>
            <ProgressBar variant="ghost" value={30} />
          </div>
        </div>
      </div>

      {/* Different sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Sizes</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Small</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <ProgressBar size="sm" value={75} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Default</span>
              <span className="text-sm text-muted-foreground">85%</span>
            </div>
            <ProgressBar size="default" value={85} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Large</span>
              <span className="text-sm text-muted-foreground">90%</span>
            </div>
            <ProgressBar size="lg" value={90} />
          </div>
        </div>
      </div>

      {/* Animated and Striped */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Animated & Striped</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Animated</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <ProgressBar value={progress} animated />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Striped</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(stripedProgress)}%
              </span>
            </div>
            <ProgressBar value={stripedProgress} striped animated />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Striped (Secondary)</span>
              <span className="text-sm text-muted-foreground">55%</span>
            </div>
            <ProgressBar variant="secondary" value={55} striped />
          </div>
        </div>
      </div>

      {/* Progress states */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Progress States</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-green-600">
                Success
              </span>
              <span className="text-sm text-muted-foreground">100%</span>
            </div>
            <ProgressBar value={100} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-red-600">Error</span>
              <span className="text-sm text-muted-foreground">25%</span>
            </div>
            <ProgressBar value={25} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-yellow-600">
                Warning
              </span>
              <span className="text-sm text-muted-foreground">50%</span>
            </div>
            <ProgressBar value={50} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-blue-600">Info</span>
              <span className="text-sm text-muted-foreground">0%</span>
            </div>
            <ProgressBar value={0} />
          </div>
        </div>
      </div>
    </div>
  );
}
