"use client";

// --- ProgressBar component start ---
import * as React from "react";
import { motion } from "framer-motion";
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
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      variant = "default",
      value = 0,
      max = 100,
      size = "default",
      label,
      showValue = false,
      animated = false,
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
      "relative w-full rounded-full overflow-hidden transition-all duration-300";
    const barClasses =
      "h-full rounded-full transition-all duration-500 ease-out";

    const variants = {
      default: "bg-muted",
      "neon-cyan":
        "bg-gradient-to-r from-cyan-400/20 to-cyan-300/20 border border-cyan-400/30",
      "neon-purple":
        "bg-gradient-to-r from-purple-400/20 to-purple-300/20 border border-purple-400/30",
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
        "bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
      "neon-purple":
        "bg-gradient-to-r from-purple-400 to-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
      "neon-chartreuse":
        "bg-gradient-to-r from-[#a3e635] to-[#a3e635]/80 shadow-[0_0_8px_rgba(163,230,53,0.6)]",
      "neon-pink":
        "bg-gradient-to-r from-[#f472b6] to-[#f472b6]/80 shadow-[0_0_8px_rgba(244,114,182,0.6)]",
      "neon-destructive":
        "bg-gradient-to-r from-[#f87171] to-[#f87171]/80 shadow-[0_0_8px_rgba(248,113,113,0.6)]",
      "neon-success":
        "bg-gradient-to-r from-[#34d399] to-[#34d399]/80 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
      "neon-warning":
        "bg-gradient-to-r from-[#fbbf24] to-[#fbbf24]/80 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    };

    const sizes = {
      sm: "h-2",
      default: "h-3",
      lg: "h-4",
    };

    const isNeonVariant = variant?.startsWith("neon-");

    return (
      <div className="space-y-2">
        {(label || showValue) && (
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
            {showValue && (
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
              className="absolute inset-0 rounded-full opacity-20 blur-sm"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${
                  variant === "neon-cyan"
                    ? "rgba(34,211,238,0.3)"
                    : variant === "neon-purple"
                    ? "rgba(168,85,247,0.3)"
                    : variant === "neon-chartreuse"
                    ? "rgba(163,230,53,0.3)"
                    : variant === "neon-pink"
                    ? "rgba(244,114,182,0.3)"
                    : variant === "neon-destructive"
                    ? "rgba(248,113,113,0.3)"
                    : variant === "neon-success"
                    ? "rgba(52,211,153,0.3)"
                    : variant === "neon-warning"
                    ? "rgba(251,191,36,0.3)"
                    : "rgba(34,211,238,0.3)"
                } ${percentage}%, transparent ${percentage}%)`,
              }}
            />
          )}
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
// --- ProgressBar component end ---

import { useState, useEffect } from "react";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Zap,
  Shield,
  Database,
} from "lucide-react";

export default function MultiProgressBars() {
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
    battery: 85,
    security: 94,
    database: 67,
  });

  const [projectProgress, setProjectProgress] = useState({
    design: 100,
    development: 85,
    testing: 60,
    deployment: 25,
    documentation: 40,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats((prev) => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 15)),
        memory: Math.max(
          20,
          Math.min(90, prev.memory + (Math.random() - 0.6) * 10),
        ),
        disk: Math.max(50, Math.min(95, prev.disk + (Math.random() - 0.7) * 5)),
        network: Math.max(
          0,
          Math.min(100, prev.network + (Math.random() - 0.4) * 8),
        ),
        battery: Math.max(15, Math.min(100, prev.battery - Math.random() * 2)),
        security: Math.max(
          80,
          Math.min(100, prev.security + (Math.random() - 0.8) * 3),
        ),
        database: Math.max(
          30,
          Math.min(95, prev.database + (Math.random() - 0.5) * 7),
        ),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProjectProgress((prev) => ({
        design: prev.design,
        development: Math.min(100, prev.development + Math.random() * 3),
        testing: Math.min(100, prev.testing + Math.random() * 2),
        deployment: Math.min(100, prev.deployment + Math.random() * 1.5),
        documentation: Math.min(100, prev.documentation + Math.random() * 2.5),
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 w-full max-w-4xl">
      {/* System Resources Dashboard */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">System Resources</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-950/50 to-slate-900/50 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h4 className="font-semibold text-foreground">Performance</h4>
            </div>

            <ProgressBar
              variant="neon-cyan"
              value={systemStats.cpu}
              label="CPU Usage"
              showValue
              animated
            />

            <ProgressBar
              variant="neon-purple"
              value={systemStats.memory}
              label="Memory"
              showValue
              animated
            />
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-950/50 to-slate-900/50 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-foreground">Storage</h4>
            </div>

            <ProgressBar
              variant="neon-purple"
              value={systemStats.disk}
              label="Disk Usage"
              showValue
              animated
            />

            <ProgressBar
              variant="neon-chartreuse"
              value={systemStats.database}
              label="Database"
              showValue
              animated
            />
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-950/50 to-slate-900/50 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-foreground">Network</h4>
            </div>

            <ProgressBar
              variant="neon-cyan"
              value={systemStats.network}
              label="Network Load"
              showValue
              animated
            />

            <ProgressBar
              variant="neon-pink"
              value={systemStats.battery}
              label="Battery"
              showValue
              animated
            />
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-950/50 to-slate-900/50 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h4 className="font-semibold text-foreground">Security</h4>
            </div>

            <ProgressBar
              variant="neon-chartreuse"
              value={systemStats.security}
              label="Threat Level"
              showValue
              animated
            />

            <ProgressBar
              variant="neon-warning"
              value={85}
              label="Updates"
              showValue
            />
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Progress</h3>

        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-slate-950/50 to-slate-900/50 border border-slate-800/50">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h4 className="font-semibold text-foreground">
              Development Pipeline
            </h4>
          </div>

          <ProgressBar
            variant="neon-success"
            value={projectProgress.design}
            label="Design Phase"
            showValue
          />

          <ProgressBar
            variant="neon-cyan"
            value={projectProgress.development}
            label="Development"
            showValue
            animated
          />

          <ProgressBar
            variant="neon-purple"
            value={projectProgress.testing}
            label="Testing"
            showValue
            animated
          />

          <ProgressBar
            variant="neon-pink"
            value={projectProgress.deployment}
            label="Deployment"
            showValue
            animated
          />

          <ProgressBar
            variant="neon-chartreuse"
            value={projectProgress.documentation}
            label="Documentation"
            showValue
            animated
          />
        </div>
      </div>

      {/* Skills Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skills Assessment</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <ProgressBar
              variant="neon-cyan"
              value={95}
              label="JavaScript"
              showValue
            />
            <ProgressBar
              variant="neon-purple"
              value={88}
              label="React"
              showValue
            />
            <ProgressBar
              variant="neon-chartreuse"
              value={82}
              label="TypeScript"
              showValue
            />
            <ProgressBar
              variant="neon-pink"
              value={75}
              label="Node.js"
              showValue
            />
          </div>

          <div className="space-y-3">
            <ProgressBar
              variant="neon-warning"
              value={70}
              label="Python"
              showValue
            />
            <ProgressBar
              variant="neon-destructive"
              value={65}
              label="Rust"
              showValue
            />
            <ProgressBar
              variant="neon-success"
              value={60}
              label="Go"
              showValue
            />
            <ProgressBar variant="neon-cyan" value={90} label="CSS" showValue />
          </div>
        </div>
      </div>
    </div>
  );
}
