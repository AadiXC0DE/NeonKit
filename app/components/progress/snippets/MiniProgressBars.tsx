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
  size?: "xs" | "sm";
  showValue?: boolean;
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      variant = "default",
      value = 0,
      max = 100,
      size = "sm",
      showValue = false,
      compact = false,
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
      "h-full rounded-full transition-all duration-300 ease-out";

    const variants = {
      default: "bg-muted",
      "neon-cyan": "bg-slate-950/50 border border-[#22d3ee]/30",
      "neon-purple": "bg-slate-950/50 border border-[#a855f7]/30",
      "neon-chartreuse": "bg-slate-950/50 border border-[#a3e635]/30",
      "neon-pink": "bg-slate-950/50 border border-[#f472b6]/30",
      "neon-destructive": "bg-slate-950/50 border border-[#f87171]/30",
      "neon-success": "bg-slate-950/50 border border-[#34d399]/30",
      "neon-warning": "bg-slate-950/50 border border-[#fbbf24]/30",
    };

    const fillVariants = {
      default: "bg-primary",
      "neon-cyan":
        "bg-gradient-to-r from-[#22d3ee] to-[#22d3ee]/80 shadow-[0_0_4px_rgba(34,211,238,0.4)]",
      "neon-purple":
        "bg-gradient-to-r from-[#a855f7] to-[#a855f7]/80 shadow-[0_0_4px_rgba(168,85,247,0.4)]",
      "neon-chartreuse":
        "bg-gradient-to-r from-[#a3e635] to-[#a3e635]/80 shadow-[0_0_4px_rgba(163,230,53,0.4)]",
      "neon-pink":
        "bg-gradient-to-r from-[#f472b6] to-[#f472b6]/80 shadow-[0_0_4px_rgba(244,114,182,0.4)]",
      "neon-destructive":
        "bg-gradient-to-r from-[#f87171] to-[#f87171]/80 shadow-[0_0_4px_rgba(248,113,113,0.4)]",
      "neon-success":
        "bg-gradient-to-r from-[#34d399] to-[#34d399]/80 shadow-[0_0_4px_rgba(52,211,153,0.4)]",
      "neon-warning":
        "bg-gradient-to-r from-[#fbbf24] to-[#fbbf24]/80 shadow-[0_0_4px_rgba(251,191,36,0.4)]",
    };

    const sizes = {
      xs: "h-1",
      sm: "h-1.5",
    };

    const isNeonVariant = variant?.startsWith("neon-");

    const progressBar = (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isNeonVariant && "shadow-sm",
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
            duration: animated && !prefersReducedMotion ? 0.6 : 0.2,
            ease: "easeOut",
          }}
        />
      </div>
    );

    if (showValue && !compact) {
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium min-w-8 text-right",
              isNeonVariant && "text-foreground",
            )}
          >
            {Math.round(percentage)}%
          </span>
          <div className="flex-1">{progressBar}</div>
        </div>
      );
    }

    return progressBar;
  },
);

ProgressBar.displayName = "ProgressBar";
// --- ProgressBar component end ---

import { useState, useEffect } from "react";
import { Upload, Download, Cpu, HardDrive, Wifi } from "lucide-react";

export default function MiniProgressBars() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [diskUsage, setDiskUsage] = useState(78);
  const [signalStrength, setSignalStrength] = useState(85);

  useEffect(() => {
    const intervals = [
      setInterval(
        () => setUploadProgress((prev) => (prev >= 100 ? 0 : prev + 2)),
        200,
      ),
      setInterval(
        () => setDownloadProgress((prev) => (prev >= 100 ? 0 : prev + 1.5)),
        250,
      ),
      setInterval(
        () =>
          setCpuUsage((prev) =>
            Math.max(10, Math.min(95, prev + (Math.random() - 0.5) * 10)),
          ),
        1000,
      ),
      setInterval(
        () =>
          setDiskUsage((prev) =>
            Math.max(50, Math.min(95, prev + (Math.random() - 0.6) * 5)),
          ),
        2000,
      ),
      setInterval(
        () =>
          setSignalStrength((prev) =>
            Math.max(20, Math.min(100, prev + (Math.random() - 0.5) * 5)),
          ),
        1500,
      ),
    ];

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="space-y-6 w-full max-w-lg">
      {/* File Operations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">File Operations</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Upload className="w-4 h-4 text-green-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Uploading file...</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <ProgressBar
                variant="neon-chartreuse"
                value={uploadProgress}
                size="sm"
                animated
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-blue-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Downloading...</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(downloadProgress)}%
                </span>
              </div>
              <ProgressBar
                variant="neon-cyan"
                value={downloadProgress}
                size="sm"
                animated
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Resources */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">System Resources</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-purple-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">CPU Usage</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(cpuUsage)}%
                </span>
              </div>
              <ProgressBar
                variant={
                  cpuUsage > 80
                    ? "neon-destructive"
                    : cpuUsage > 60
                    ? "neon-warning"
                    : "neon-purple"
                }
                value={cpuUsage}
                size="sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HardDrive className="w-4 h-4 text-cyan-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Disk Usage</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(diskUsage)}%
                </span>
              </div>
              <ProgressBar
                variant={diskUsage > 90 ? "neon-destructive" : "neon-cyan"}
                value={diskUsage}
                size="sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wifi className="w-4 h-4 text-green-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Signal Strength</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(signalStrength)}%
                </span>
              </div>
              <ProgressBar
                variant={
                  signalStrength > 70
                    ? "neon-chartreuse"
                    : signalStrength > 40
                    ? "neon-warning"
                    : "neon-destructive"
                }
                value={signalStrength}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Progress Bars */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Compact Display</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm min-w-16">Quality:</span>
            <div className="flex-1">
              <ProgressBar variant="neon-chartreuse" value={95} size="xs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm min-w-16">Speed:</span>
            <div className="flex-1">
              <ProgressBar variant="neon-cyan" value={78} size="xs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm min-w-16">Accuracy:</span>
            <div className="flex-1">
              <ProgressBar variant="neon-purple" value={87} size="xs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm min-w-16">Performance:</span>
            <div className="flex-1">
              <ProgressBar variant="neon-pink" value={92} size="xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Inline Progress with Values */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">With Values</h3>

        <div className="space-y-2">
          <ProgressBar variant="neon-cyan" value={75} size="sm" showValue />
          <ProgressBar variant="neon-purple" value={60} size="sm" showValue />
          <ProgressBar
            variant="neon-chartreuse"
            value={90}
            size="sm"
            showValue
          />
          <ProgressBar variant="neon-pink" value={45} size="sm" showValue />
        </div>
      </div>
    </div>
  );
}
