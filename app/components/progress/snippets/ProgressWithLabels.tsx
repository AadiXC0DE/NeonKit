"use client";

// --- ProgressBar component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

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
  showPercentage?: boolean;
  showStatus?: boolean;
  label?: string;
  status?: "loading" | "success" | "error" | "warning" | "info";
  customText?: string;
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
      showLabel = true,
      showPercentage = true,
      showStatus = false,
      label,
      status = "loading",
      customText,
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

    const getStatusIcon = () => {
      const iconClass = "w-4 h-4";

      switch (status) {
        case "success":
          return <CheckCircle className={cn(iconClass, "text-emerald-500")} />;
        case "error":
          return <XCircle className={cn(iconClass, "text-red-500")} />;
        case "warning":
          return <AlertTriangle className={cn(iconClass, "text-amber-500")} />;
        case "info":
          return <Info className={cn(iconClass, "text-blue-500")} />;
        default:
          return null;
      }
    };

    const getStatusText = () => {
      if (customText) return customText;

      switch (status) {
        case "success":
          return "Complete";
        case "error":
          return "Failed";
        case "warning":
          return "Warning";
        case "info":
          return "Processing";
        default:
          return percentage < 100 ? "Loading..." : "Complete";
      }
    };

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
    );

    const labelContent = (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showStatus && getStatusIcon()}
          <span
            className={cn(
              "font-medium",
              size === "sm"
                ? "text-sm"
                : size === "lg"
                ? "text-base"
                : "text-sm",
              isNeonVariant && "text-foreground",
            )}
          >
            {label || getStatusText()}
          </span>
        </div>

        {showPercentage && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-bold",
                size === "sm"
                  ? "text-sm"
                  : size === "lg"
                  ? "text-base"
                  : "text-sm",
                isNeonVariant && "text-foreground",
              )}
            >
              {Math.round(percentage)}%
            </span>

            {percentage === 100 && showStatus && status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </motion.div>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div className="space-y-2">
        {showLabel && labelContent}
        {progressBar}
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
// --- ProgressBar component end ---

import { useState, useEffect } from "react";

export default function ProgressWithLabels() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [installProgress, setInstallProgress] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    const intervals = [
      setInterval(
        () => setUploadProgress((prev) => (prev >= 100 ? 100 : prev + 2)),
        100,
      ),
      setInterval(
        () => setDownloadProgress((prev) => (prev >= 100 ? 100 : prev + 1.5)),
        120,
      ),
      setInterval(
        () => setInstallProgress((prev) => (prev >= 100 ? 100 : prev + 1)),
        150,
      ),
      setInterval(
        () => setSyncProgress((prev) => (prev >= 100 ? 100 : prev + 0.8)),
        200,
      ),
    ];

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="space-y-8 w-full max-w-2xl">
      {/* File Operations with Labels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">File Operations</h3>

        <div className="space-y-4">
          <ProgressBar
            variant="neon-cyan"
            value={uploadProgress}
            showLabel
            showStatus
            label="Uploading large_file.zip"
            status={uploadProgress < 100 ? "loading" : "success"}
            customText={
              uploadProgress < 100 ? "Uploading..." : "Upload complete!"
            }
            animated
          />

          <ProgressBar
            variant="neon-purple"
            value={downloadProgress}
            showLabel
            showStatus
            label="Downloading updates"
            status={downloadProgress < 100 ? "info" : "success"}
            customText={
              downloadProgress < 100 ? "Downloading..." : "Download finished!"
            }
            animated
          />

          <ProgressBar
            variant="neon-chartreuse"
            value={installProgress}
            showLabel
            showStatus
            label="Installing software"
            status={installProgress < 100 ? "loading" : "success"}
            customText={
              installProgress < 100 ? "Installing..." : "Installation complete!"
            }
            animated
          />

          <ProgressBar
            variant="neon-pink"
            value={syncProgress}
            showLabel
            showStatus
            label="Syncing data"
            status={syncProgress < 100 ? "info" : "success"}
            customText={syncProgress < 100 ? "Syncing..." : "Sync completed!"}
            animated
          />
        </div>
      </div>

      {/* System Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">System Tasks</h3>

        <div className="space-y-4">
          <ProgressBar
            variant="neon-success"
            value={100}
            showLabel
            showStatus
            label="System scan"
            status="success"
            customText="Scan completed - No threats found"
          />

          <ProgressBar
            variant="neon-warning"
            value={75}
            showLabel
            showStatus
            label="Disk cleanup"
            status="warning"
            customText="Cleaning temporary files..."
          />

          <ProgressBar
            variant="neon-destructive"
            value={25}
            showLabel
            showStatus
            label="Error recovery"
            status="error"
            customText="Attempting to recover corrupted files..."
          />
        </div>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Sizes</h3>

        <div className="space-y-4">
          <ProgressBar
            variant="neon-cyan"
            size="sm"
            value={80}
            showLabel
            label="Small progress bar"
          />

          <ProgressBar
            variant="neon-purple"
            size="default"
            value={65}
            showLabel
            label="Default progress bar"
          />

          <ProgressBar
            variant="neon-chartreuse"
            size="lg"
            value={90}
            showLabel
            label="Large progress bar"
          />
        </div>
      </div>

      {/* Simple Labels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Simple Labels</h3>

        <div className="space-y-4">
          <ProgressBar
            variant="neon-cyan"
            value={85}
            showLabel
            label="Progress"
          />

          <ProgressBar
            variant="neon-purple"
            value={60}
            showLabel
            label="Loading"
          />

          <ProgressBar
            variant="neon-chartreuse"
            value={95}
            showLabel
            label="Complete"
          />
        </div>
      </div>
    </div>
  );
}
