"use client";

// --- Badge component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  size?: "sm" | "default" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  animate?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      removable = false,
      onRemove,
      animate = true,
      children,
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const baseClasses =
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
      default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline:
        "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
      "neon-cyan":
        "border-2 border-cyan-400/60 text-cyan-400 bg-slate-950/50 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgb(34,211,238,0.4)] backdrop-blur-sm",
      "neon-purple":
        "border-2 border-purple-400/60 text-purple-400 bg-slate-950/50 hover:bg-purple-400/10 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_15px_rgb(168,85,247,0.4)] backdrop-blur-sm",
      "neon-chartreuse":
        "border-2 border-lime-400/60 text-lime-400 bg-slate-950/50 hover:bg-lime-400/10 hover:border-lime-400 hover:text-lime-300 hover:shadow-[0_0_15px_rgb(163,230,53,0.4)] backdrop-blur-sm",
      "neon-pink":
        "border-2 border-pink-400/60 text-pink-400 bg-slate-950/50 hover:bg-pink-400/10 hover:border-pink-400 hover:text-pink-300 hover:shadow-[0_0_15px_rgb(244,114,182,0.4)] backdrop-blur-sm",
      "neon-destructive":
        "border-2 border-red-400/60 text-red-400 bg-slate-950/50 hover:bg-red-400/10 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_15px_rgb(248,113,113,0.4)] backdrop-blur-sm",
      "neon-success":
        "border-2 border-emerald-400/60 text-emerald-400 bg-slate-950/50 hover:bg-emerald-400/10 hover:border-emerald-400 hover:text-emerald-300 hover:shadow-[0_0_15px_rgb(52,211,153,0.4)] backdrop-blur-sm",
      "neon-warning":
        "border-2 border-amber-400/60 text-amber-400 bg-slate-950/50 hover:bg-amber-400/10 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_15px_rgb(251,191,36,0.4)] backdrop-blur-sm",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      default: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRemove?.();
    };

    const content = (
      <>
        {children}
        {removable && (
          <button
            type="button"
            className="ml-1 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-white/20"
            onClick={handleRemove}
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </>
    );

    if (!animate || prefersReducedMotion) {
      return (
        <div
          ref={ref}
          className={cn(baseClasses, variants[variant], sizes[size], className)}
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {content}
      </motion.div>
    );
  },
);

Badge.displayName = "Badge";
// --- Badge component end ---

export default function BadgeSizesPreview() {
  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Small Size (sm):
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neon-cyan" size="sm">
              Small
            </Badge>
            <Badge variant="neon-purple" size="sm">
              Compact
            </Badge>
            <Badge variant="neon-chartreuse" size="sm">
              Tiny
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Default Size:
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neon-cyan">Default</Badge>
            <Badge variant="neon-purple">Standard</Badge>
            <Badge variant="neon-chartreuse">Regular</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Large Size (lg):
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neon-cyan" size="lg">
              Large
            </Badge>
            <Badge variant="neon-purple" size="lg">
              Big
            </Badge>
            <Badge variant="neon-chartreuse" size="lg">
              Huge
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          Size Comparison:
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Badge variant="neon-pink" size="sm">
              Small
            </Badge>
            <span className="text-xs text-muted-foreground">
              Perfect for inline labels
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="neon-pink">Default</Badge>
            <span className="text-xs text-muted-foreground">
              Standard badge size
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="neon-pink" size="lg">
              Large
            </Badge>
            <span className="text-xs text-muted-foreground">
              For prominent displays
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
