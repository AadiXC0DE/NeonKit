"use client";

// --- ProgressBar component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

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
  animationType?: "pulse" | "shimmer" | "bounce" | "glow" | "wave";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      variant = "default",
      value = 0,
      max = 100,
      size = "default",
      animationType = "glow",
      showLabel = false,
      label,
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

    const baseClasses =
      "relative w-full rounded-full overflow-hidden transition-all duration-300 backdrop-blur-sm";
    const barClasses =
      "h-full rounded-full transition-all duration-700 ease-out relative";

    const variants = {
      default: "bg-slate-800/50 border border-slate-700/50",
      "neon-cyan":
        "bg-slate-950/90 border-2 border-[#22d3ee] shadow-[0_0_25px_rgb(34,211,238,0.6)] hover:shadow-[0_0_35px_rgb(34,211,238,0.8)] backdrop-blur-sm",
      "neon-purple":
        "bg-slate-950/90 border-2 border-[#a855f7] shadow-[0_0_25px_rgb(168,85,247,0.6)] hover:shadow-[0_0_35px_rgb(168,85,247,0.8)] backdrop-blur-sm",
      "neon-chartreuse":
        "bg-slate-950/90 border-2 border-[#a3e635] shadow-[0_0_25px_rgb(163,230,53,0.6)] hover:shadow-[0_0_35px_rgb(163,230,53,0.8)] backdrop-blur-sm",
      "neon-pink":
        "bg-slate-950/90 border-2 border-[#f472b6] shadow-[0_0_25px_rgb(244,114,182,0.6)] hover:shadow-[0_0_35px_rgb(244,114,182,0.8)] backdrop-blur-sm",
      "neon-destructive":
        "bg-slate-950/90 border-2 border-[#f87171] shadow-[0_0_25px_rgb(248,113,113,0.6)] hover:shadow-[0_0_35px_rgb(248,113,113,0.8)] backdrop-blur-sm",
      "neon-success":
        "bg-slate-950/90 border-2 border-[#34d399] shadow-[0_0_25px_rgb(52,211,153,0.6)] hover:shadow-[0_0_35px_rgb(52,211,153,0.8)] backdrop-blur-sm",
      "neon-warning":
        "bg-slate-950/90 border-2 border-[#fbbf24] shadow-[0_0_25px_rgb(251,191,36,0.6)] hover:shadow-[0_0_35px_rgb(251,191,36,0.8)] backdrop-blur-sm",
    };

    const fillVariants = {
      default: "bg-slate-600",
      "neon-cyan":
        "bg-gradient-to-r from-[#22d3ee]/80 via-[#22d3ee] to-[#22d3ee]/80 shadow-[0_0_25px_rgb(34,211,238,0.9),0_0_50px_rgb(34,211,238,0.7)]",
      "neon-purple":
        "bg-gradient-to-r from-[#a855f7]/80 via-[#a855f7] to-[#a855f7]/80 shadow-[0_0_25px_rgb(168,85,247,0.9),0_0_50px_rgb(168,85,247,0.7)]",
      "neon-chartreuse":
        "bg-gradient-to-r from-[#a3e635]/80 via-[#a3e635] to-[#a3e635]/80 shadow-[0_0_25px_rgb(163,230,53,0.9),0_0_50px_rgb(163,230,53,0.7)]",
      "neon-pink":
        "bg-gradient-to-r from-[#f472b6]/80 via-[#f472b6] to-[#f472b6]/80 shadow-[0_0_25px_rgb(244,114,182,0.9),0_0_50px_rgb(244,114,182,0.7)]",
      "neon-destructive":
        "bg-gradient-to-r from-[#f87171]/80 via-[#f87171] to-[#f87171]/80 shadow-[0_0_25px_rgb(248,113,113,0.9),0_0_50px_rgb(248,113,113,0.7)]",
      "neon-success":
        "bg-gradient-to-r from-[#34d399]/80 via-[#34d399] to-[#34d399]/80 shadow-[0_0_25px_rgb(52,211,153,0.9),0_0_50px_rgb(52,211,153,0.7)]",
      "neon-warning":
        "bg-gradient-to-r from-[#fbbf24]/80 via-[#fbbf24] to-[#fbbf24]/80 shadow-[0_0_25px_rgb(251,191,36,0.9),0_0_50px_rgb(251,191,36,0.7)]",
    };

    const sizes = {
      sm: "h-2",
      default: "h-3",
      lg: "h-4",
    };

    const getAnimationVariants = () => {
      if (prefersReducedMotion) return {};

      switch (animationType) {
        case "pulse":
          return {
            animate: { opacity: [0.7, 1, 0.7] },
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          };
        case "shimmer":
          return {
            animate: { backgroundPosition: ["0% 50%", "100% 50%"] },
            transition: { duration: 2, repeat: Infinity, ease: "linear" },
          };
        case "bounce":
          return {
            animate: { scale: [1, 1.02, 1] },
            transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
          };
        case "glow":
          return {
            animate: {
              boxShadow: [
                `0 0 15px ${getGlowColor()
                  .replace("rgba", "rgb")
                  .replace(",1", "")}, 0 0 30px ${getGlowColor()
                  .replace("rgba", "rgb")
                  .replace(",1", "")}`,
                `0 0 30px ${getGlowColor()
                  .replace("rgba", "rgb")
                  .replace(",1", "")}, 0 0 60px ${getGlowColor()
                  .replace("rgba", "rgb")
                  .replace(",1", "")}, 0 0 90px ${getGlowColor()
                  .replace("rgba", "rgb")
                  .replace(",1", "")}`,
                `0 0 15px ${getGlowColor()
                  .replace("rgba", "rgb")
                  .replace(",1", "")}, 0 0 30px ${getGlowColor()
                  .replace("rgba", "rgb")
                  .replace(",1", "")}`,
              ],
            },
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          };
        case "wave":
          return {
            animate: { borderRadius: ["9999px", "12px", "9999px"] },
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          };
        default:
          return {};
      }
    };

    const getGlowColor = () => {
      const colorMap = {
        "default": "#22d3ee",
        "neon-cyan": "#22d3ee",
        "neon-purple": "#a855f7",
        "neon-chartreuse": "#a3e635",
        "neon-pink": "#f472b6",
        "neon-destructive": "#f87171",
        "neon-success": "#34d399",
        "neon-warning": "#fbbf24",
      };
      return colorMap[variant] || "#22d3ee";
    };

    const progressBar = (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          "shadow-lg backdrop-blur-sm",
          className,
        )}
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
            animationType === "shimmer"
              ? "bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%]"
              : undefined,
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          {...getAnimationVariants()}
        />

        {/* Animated glow effect */}
        {!prefersReducedMotion && variant !== "default" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${getGlowColor()
                .replace("rgba", "rgb")
                .replace(
                  ",1",
                  "",
                )} ${percentage}%, transparent ${percentage}%)`,
              filter: "blur(1px)",
            }}
          />
        )}

        {/* Pulsing dots effect */}
        {!prefersReducedMotion &&
          animationType === "pulse" &&
          variant !== "default" && (
            <div className="absolute inset-0 flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.3,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${(index + 1) * 20}%`,
                    backgroundColor: getGlowColor()
                      .replace("rgba", "rgb")
                      .replace(",1", ""),
                    boxShadow: `0 0 20px ${getGlowColor()
                      .replace("rgba", "rgb")
                      .replace(",1", "")}`,
                  }}
                />
              ))}
            </div>
          )}
      </div>
    );

    if (showLabel || label) {
      return (
        <div className="space-y-2">
          {(label || showLabel) && (
            <div className="flex justify-between items-center">
              {label && (
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              )}
              {showLabel && (
                <span className="text-sm font-medium text-foreground">
                  {Math.round(percentage)}%
                </span>
              )}
            </div>
          )}
          {progressBar}
        </div>
      );
    }

    return progressBar;
  },
);

ProgressBar.displayName = "ProgressBar";
// --- ProgressBar component end ---

export default function AnimatedProgress() {
  const [progress, setProgress] = useState(0);
  const [currentVariant, setCurrentVariant] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState(0);

  const variants = [
    "neon-cyan",
    "neon-purple",
    "neon-chartreuse",
    "neon-pink",
    "neon-warning",
  ];
  const animations = ["glow", "pulse", "shimmer", "bounce", "wave"];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const variantInterval = setInterval(() => {
      setCurrentVariant((prev) => (prev + 1) % variants.length);
    }, 3000);
    return () => clearInterval(variantInterval);
  }, []);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCurrentAnimation((prev) => (prev + 1) % animations.length);
    }, 4000);
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="space-y-8 w-full max-w-lg">
      {/* Dynamic Animated Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dynamic Animation</h3>
        <div className="space-y-3">
          <div>
            <ProgressBar
              variant="default"
              value={progress}
              animationType={animations[currentAnimation] as any}
              showLabel
              label={`DEFAULT - ${animations[currentAnimation].toUpperCase()}`}
            />
          </div>
          <div>
            <ProgressBar
              variant={variants[currentVariant] as any}
              value={progress}
              animationType={animations[currentAnimation] as any}
              showLabel
              label={`${variants[currentVariant]
                .replace("neon-", "")
                .toUpperCase()} - ${animations[
                currentAnimation
              ].toUpperCase()}`}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Auto-cycling through variants and animations
          </p>
        </div>
      </div>

      {/* Individual Animation Types */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Animation Types</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Glow Effect</span>
              <span className="text-xs text-muted-foreground">85%</span>
            </div>
            <ProgressBar variant="neon-cyan" value={85} animationType="glow" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Pulse Effect</span>
              <span className="text-xs text-muted-foreground">70%</span>
            </div>
            <ProgressBar
              variant="neon-purple"
              value={70}
              animationType="pulse"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Shimmer Effect</span>
              <span className="text-xs text-muted-foreground">60%</span>
            </div>
            <ProgressBar
              variant="neon-chartreuse"
              value={60}
              animationType="shimmer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Bounce Effect</span>
              <span className="text-xs text-muted-foreground">75%</span>
            </div>
            <ProgressBar
              variant="neon-pink"
              value={75}
              animationType="bounce"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Wave Effect</span>
              <span className="text-xs text-muted-foreground">80%</span>
            </div>
            <ProgressBar
              variant="neon-warning"
              value={80}
              animationType="wave"
            />
          </div>
        </div>
      </div>

      {/* Progress States with Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Progress States</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Default - Glow</span>
              <span className="text-xs text-muted-foreground">80%</span>
            </div>
            <ProgressBar variant="default" value={80} animationType="glow" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-600">
                Success - Glow
              </span>
              <span className="text-xs text-muted-foreground">100%</span>
            </div>
            <ProgressBar
              variant="neon-success"
              value={100}
              animationType="glow"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-red-600">
                Error - Pulse
              </span>
              <span className="text-xs text-muted-foreground">25%</span>
            </div>
            <ProgressBar
              variant="neon-destructive"
              value={25}
              animationType="pulse"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-yellow-600">
                Warning - Shimmer
              </span>
              <span className="text-xs text-muted-foreground">50%</span>
            </div>
            <ProgressBar
              variant="neon-warning"
              value={50}
              animationType="shimmer"
            />
          </div>
        </div>
      </div>

      {/* Rapid Progress Simulation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Simulation</h3>

        <div className="space-y-3">
          <ProgressBar
            variant="neon-cyan"
            value={progress}
            animationType="glow"
            showLabel
            label="Loading..."
          />
          <ProgressBar
            variant="neon-purple"
            value={Math.max(0, progress - 20)}
            animationType="pulse"
            showLabel
            label="Processing..."
          />
          <ProgressBar
            variant="neon-chartreuse"
            value={Math.max(0, progress - 40)}
            animationType="shimmer"
            showLabel
            label="Almost done..."
          />
        </div>
      </div>
    </div>
  );
}
