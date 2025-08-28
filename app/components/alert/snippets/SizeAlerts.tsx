"use client";

// --- Alert component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps {
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  size?: "sm" | "default" | "lg";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  className?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = "default",
      size = "default",
      title,
      description,
      icon,
      onClose,
      closable = false,
      className,
      children,
      animate = true,
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const baseClasses =
      "relative w-full rounded-lg border p-4 transition-all duration-300";

    const variants = {
      default: "bg-background border-border text-foreground",
      "neon-cyan":
        "bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-sm",
      "neon-purple":
        "bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium hover:border-purple-400/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-sm",
      "neon-chartreuse":
        "bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium hover:border-lime-400/80 hover:shadow-[0_0_15px_rgba(163,230,53,0.3)] backdrop-blur-sm",
      "neon-pink":
        "bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium hover:border-pink-400/80 hover:shadow-[0_0_15px_rgba(244,114,182,0.3)] backdrop-blur-sm",
      "neon-destructive":
        "bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium hover:border-red-400/80 hover:shadow-[0_0_15px_rgba(248,113,113,0.3)] backdrop-blur-sm",
      "neon-success":
        "bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium hover:border-emerald-400/80 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] backdrop-blur-sm",
      "neon-warning":
        "bg-slate-950/50 border-2 border-amber-400/60 text-amber-100 font-medium hover:border-amber-400/80 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] backdrop-blur-sm",
    };

    const sizes = {
      sm: "p-3 text-sm",
      default: "p-4 text-sm",
      lg: "p-5 text-base",
    };

    const isNeonVariant = variant?.startsWith("neon-");
    const neonColor = isNeonVariant ? variant.split("-")[1] : null;

    const getIconColor = () => {
      if (!isNeonVariant) return "text-muted-foreground";

      const colorMap = {
        cyan: "text-cyan-400",
        purple: "text-purple-400",
        chartreuse: "text-lime-400",
        pink: "text-pink-400",
        destructive: "text-red-400",
        success: "text-emerald-400",
        warning: "text-amber-400",
      };

      return colorMap[neonColor as keyof typeof colorMap] || "text-cyan-400";
    };

    const getDefaultIcon = () => {
      const iconMap = {
        default: <Info className="h-5 w-5" />,
        "neon-cyan": <Info className="h-5 w-5" />,
        "neon-purple": <Info className="h-5 w-5" />,
        "neon-chartreuse": <CheckCircle className="h-5 w-5" />,
        "neon-pink": <AlertTriangle className="h-5 w-5" />,
        "neon-destructive": <XCircle className="h-5 w-5" />,
        "neon-success": <CheckCircle className="h-5 w-5" />,
        "neon-warning": <AlertTriangle className="h-5 w-5" />,
      };

      return iconMap[variant] || <Info className="h-5 w-5" />;
    };

    const displayedIcon = icon || getDefaultIcon();

    const alertContent = (
      <div className="flex gap-3">
        <div className={cn("flex-shrink-0", getIconColor())}>
          {displayedIcon}
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="font-semibold leading-none tracking-tight mb-1">
              {title}
            </h5>
          )}
          {description && (
            <p className="text-sm opacity-90 leading-relaxed">{description}</p>
          )}
          {children && (
            <div className="mt-2 text-sm opacity-90">{children}</div>
          )}
        </div>

        {closable && onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex-shrink-0 p-1 rounded-md transition-colors hover:bg-accent/20",
              getIconColor(),
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );

    if (animate && !prefersReducedMotion) {
      return (
        <AnimatePresence>
          <motion.div
            ref={ref}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[size],
              isNeonVariant && "shadow-lg",
              className,
            )}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="assertive"
            {...props}
          >
            {alertContent}
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isNeonVariant && "shadow-lg",
          className,
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        {alertContent}
      </div>
    );
  },
);

Alert.displayName = "Alert";
// --- Alert component end ---

export default function SizeAlerts() {
  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">
          Small (sm)
        </h4>
        <Alert
          variant="neon-cyan"
          size="sm"
          title="Small Alert"
          description="This is a small alert with compact spacing."
          closable
        />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">
          Default
        </h4>
        <Alert
          variant="neon-purple"
          size="default"
          title="Default Alert"
          description="This is a default size alert with standard spacing."
          closable
        />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">
          Large (lg)
        </h4>
        <Alert
          variant="neon-chartreuse"
          size="lg"
          title="Large Alert"
          description="This is a large alert with generous spacing for better readability."
          closable
        />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">
          Long Content Example
        </h4>
        <Alert
          variant="neon-pink"
          size="lg"
          title="Important Security Notice"
          description="Your account security is our top priority. We've detected unusual login activity from a new device. For your protection, we've sent a verification code to your registered email address."
          closable
        >
          <div className="mt-3 p-3 bg-white/5 rounded text-xs">
            <p className="font-medium mb-1">Recommended Actions:</p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>
                Verify the login attempt using the code sent to your email
              </li>
              <li>Review your recent account activity</li>
              <li>Update your password if you suspect unauthorized access</li>
            </ul>
          </div>
        </Alert>
      </div>
    </div>
  );
}
