"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Badge } from "@/components/badge";
import { Switch } from "@/components/switch";
import { Alert } from "@/components/alert";
import { Dropdown } from "@/components/dropdown";
import { Checkbox } from "@/components/checkbox";

import { Textarea } from "@/components/textarea";
import { Slider } from "@/components/slider";
import { Radio } from "@/components/radio";
import { Avatar } from "@/components/avatar";
import { StatsCard } from "@/components/feature-card";
import { BackgroundGradient } from "@/components/background-gradient";

// ProgressBar component definition
interface ProgressBarProps {
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
            duration: animated ? 1 : 0.3,
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
import {
  ArrowRight,
  Github,
  Zap,
  Palette,
  Code2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Check,
  Download,
  Settings,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Star,
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  X,
  ChevronDown,
  Loader2,
  Search,
  Upload,
  Volume2,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
// Import Modal from the same source as the examples
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  size?: "sm" | "default" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      variant = "default",
      size = "default",
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      className,
      overlayClassName,
      contentClassName,
      icon,
      actions,
      footer,
      ...props
    },
    ref,
  ) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    // Handle escape key
    React.useEffect(() => {
      if (!closeOnEscape || !isOpen) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (!closeOnOverlayClick) return;
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    const isNeonVariant = variant?.startsWith("neon-");
    const neonColor = isNeonVariant ? variant.split("-")[1] : null;

    const getModalStyles = () => {
      if (!isNeonVariant) return "bg-background border border-border";

      const colorMap = {
        cyan: "bg-slate-950/95 border-2 border-cyan-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.3)]",
        purple:
          "bg-slate-950/95 border-2 border-purple-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.3)]",
        chartreuse:
          "bg-slate-950/95 border-2 border-lime-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(163,230,53,0.3)]",
        pink: "bg-slate-950/95 border-2 border-pink-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(244,114,182,0.3)]",
        destructive:
          "bg-slate-950/95 border-2 border-red-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(248,113,113,0.3)]",
        success:
          "bg-slate-950/95 border-2 border-emerald-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(52,211,153,0.3)]",
        warning:
          "bg-slate-950/95 border-2 border-amber-400/50 backdrop-blur-xl shadow-[0_0_50px_rgba(251,191,36,0.3)]",
      };

      return (
        colorMap[neonColor as keyof typeof colorMap] ||
        "bg-background border border-border"
      );
    };

    const getTextColor = () => {
      if (!isNeonVariant) return "text-foreground";
      return "text-white";
    };

    const getTitleColor = () => {
      if (!isNeonVariant) return "text-foreground";
      return "text-white font-semibold";
    };

    const getDescriptionColor = () => {
      if (!isNeonVariant) return "text-muted-foreground";
      return "text-white/80";
    };

    const getCloseButtonColor = () => {
      if (!isNeonVariant) return "text-muted-foreground hover:text-foreground";
      return "text-white/60 hover:text-white";
    };

    const getOverlayStyles = () => {
      if (!isNeonVariant) return "bg-black/50 backdrop-blur-sm";
      return "bg-black/60 backdrop-blur-md";
    };

    const sizes = {
      sm: "max-w-md",
      default: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-[95vw] max-h-[95vh]",
    };

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
      if (!isNeonVariant) return null;

      const iconMap = {
        destructive: <AlertCircle className="h-6 w-6" />,
        success: <CheckCircle className="h-6 w-6" />,
        warning: <AlertTriangle className="h-6 w-6" />,
        cyan: <Info className="h-6 w-6" />,
        purple: <Info className="h-6 w-6" />,
        chartreuse: <Info className="h-6 w-6" />,
        pink: <Info className="h-6 w-6" />,
      };

      return iconMap[neonColor as keyof typeof iconMap] || null;
    };

    const displayIcon = icon || getDefaultIcon();

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4",
                getOverlayStyles(),
                overlayClassName,
              )}
              onClick={handleOverlayClick}
            >
              {/* Modal */}
              <motion.div
                ref={modalRef}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: 20 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: 20 }
                }
                transition={{
                  duration: 0.2,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className={cn(
                  "relative w-full rounded-lg shadow-lg",
                  getModalStyles(),
                  sizes[size],
                  className,
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-center gap-3">
                      {displayIcon && (
                        <div className={cn("flex-shrink-0", getIconColor())}>
                          {displayIcon}
                        </div>
                      )}
                      <div className="text-left">
                        {title && (
                          <h2
                            className={cn(
                              "text-lg font-semibold leading-none tracking-tight",
                              getTitleColor(),
                            )}
                          >
                            {title}
                          </h2>
                        )}
                        {description && (
                          <p
                            className={cn(
                              "text-sm mt-1",
                              getDescriptionColor(),
                            )}
                          >
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className={cn(
                          "rounded-md p-1 transition-colors hover:bg-accent/50",
                          getCloseButtonColor(),
                        )}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                {children && (
                  <div
                    className={cn(
                      "px-6 pb-6 text-left",
                      title || showCloseButton ? "pt-0" : "pt-6",
                      getTextColor(),
                      contentClassName,
                    )}
                  >
                    {children}
                  </div>
                )}

                {/* Actions */}
                {actions && (
                  <div className="flex items-center justify-end gap-3 px-6 pb-6">
                    {actions}
                  </div>
                )}

                {/* Footer */}
                {footer && (
                  <div
                    className={cn(
                      "px-6 py-4 border-t",
                      isNeonVariant ? "border-white/10" : "border-border",
                      footer,
                    )}
                  >
                    {footer}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  },
);

Modal.displayName = "Modal";

// CircularProgress component definition
interface CircularProgressProps {
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

export default function HomePage() {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(75);
  const [dropdownValue, setDropdownValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    | "success"
    | "info"
    | "chartreuse"
    | "pink"
    | "success-neon"
    | "warning"
    | null
  >(null);

  const dropdownOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <BackgroundGradient />
      {/* Navigation */}
      <nav className="border-b backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">NeonKit</span>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/setup"
                className="text-sm font-medium hover:text-neon-cyan transition-colors"
              >
                Installation
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium hover:text-neon-blue transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/components"
                className="text-sm font-medium hover:text-neon-purple transition-colors"
              >
                Components
              </Link>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/neonkit/neonkit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build with{" "}
              <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-chartreuse bg-clip-text text-transparent animate-glow">
                NeonKit
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Copy and paste 20+ beautiful JSX components with electric neon
              accents. Dark mode optimized, Tailwind-powered, ready to use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="xl" variant="neon-cyan" asChild>
                <Link
                  href="/setup"
                  className="inline-flex items-center whitespace-nowrap"
                >
                  Copy Components{" "}
                  <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
                </Link>
              </Button>

              <Button size="xl" variant="neon-purple" asChild>
                <Link href="/components" className="inline-flex items-center">
                  Browse Library
                </Link>
              </Button>
            </div>

            {/* Bento Grid Component Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {/* Bento Grid - Comprehensive Component Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 auto-rows-[180px]">
                {/* Buttons - Large Feature Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-card/50 border border-neon-cyan/20 rounded-xl p-6 backdrop-blur-sm hover:border-neon-cyan/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-neon-cyan">
                      Neon Buttons
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="neon-cyan" size="sm">
                      Cyan
                    </Button>
                    <Button variant="neon-purple" size="sm">
                      Purple
                    </Button>
                    <Button variant="neon-chartreuse" size="sm">
                      Chartreuse
                    </Button>
                    <Button variant="neon-pink" size="sm">
                      Pink
                    </Button>
                    <Button variant="neon-success" size="sm">
                      Success
                    </Button>
                    <Button variant="neon-warning" size="sm">
                      Warning
                    </Button>
                    <Button variant="neon-destructive" size="sm">
                      Destructive
                    </Button>
                    <Button variant="neon-cyan" size="sm">
                      Cyan Glow
                    </Button>
                  </div>
                </motion.div>

                {/* Progress Bars - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-chartreuse/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-chartreuse/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-chartreuse rounded-full shadow-[0_0_10px_rgb(163,230,53,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-chartreuse">
                      Progress
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <ProgressBar
                      variant="neon-cyan"
                      value={75}
                      showLabel
                      size="sm"
                    />
                    <ProgressBar
                      variant="neon-purple"
                      value={60}
                      showLabel
                      size="sm"
                    />
                  </div>
                </motion.div>

                {/* Input - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-pink/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-pink/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-pink rounded-full shadow-[0_0_10px_rgb(244,114,182,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-pink">
                      Input
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <Input
                      variant="neon-cyan"
                      placeholder="Email..."
                      size="sm"
                    />
                    <Input
                      variant="neon-purple"
                      placeholder="Username..."
                      size="sm"
                      startIcon={<Mail className="h-4 w-4" />}
                    />
                  </div>
                </motion.div>

                {/* Badges - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-purple/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-purple/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-purple rounded-full shadow-[0_0_10px_rgb(168,85,247,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-purple">
                      Badges
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neon-cyan">New</Badge>
                    <Badge variant="neon-purple">Hot</Badge>
                    <Badge variant="neon-chartreuse">Pro</Badge>
                    <Badge variant="neon-pink">Beta</Badge>
                    <Badge variant="neon-warning">Sale</Badge>
                  </div>
                </motion.div>

                {/* Switches - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-warning/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-warning/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-warning rounded-full shadow-[0_0_10px_rgb(251,191,36,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-warning">
                      Switches
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cyan-400">Cyan</span>
                      <Switch
                        variant="neon-cyan"
                        checked={switchChecked}
                        onCheckedChange={setSwitchChecked}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">Purple</span>
                      <Switch
                        variant="neon-purple"
                        checked={!switchChecked}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-lime-400">Chartreuse</span>
                      <Switch
                        variant="neon-chartreuse"
                        defaultChecked
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-pink-400">Pink</span>
                      <Switch variant="neon-pink" size="sm" />
                    </div>
                  </div>
                </motion.div>

                {/* Alert - Large Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-card/50 border border-emerald-400/20 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-400/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgb(52,211,153,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-emerald-400">
                      Alert Component
                    </h4>
                  </div>
                  <div className="space-y-3 text-left">
                    <Alert
                      variant="neon-success"
                      title="Success!"
                      description="Your action was completed successfully with beautiful neon styling that shines in dark mode."
                      closable
                    />
                    <Alert
                      variant="neon-warning"
                      title="Warning"
                      description="Please proceed with caution. This action may have consequences."
                      closable
                    />
                  </div>
                </motion.div>

                {/* Dropdown - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-destructive/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-destructive/40 transition-all duration-300 relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-destructive rounded-full shadow-[0_0_10px_rgb(248,113,113,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-destructive">
                      Dropdown
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <Dropdown
                      options={dropdownOptions}
                      placeholder="Select..."
                      value={dropdownValue}
                      onChange={setDropdownValue}
                      variant="neon-cyan"
                      size="sm"
                    />
                    <Dropdown
                      options={dropdownOptions}
                      placeholder="Choose..."
                      variant="neon-purple"
                      size="sm"
                    />
                  </div>
                </motion.div>

                {/* Checkboxes - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-success/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-success/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-success rounded-full shadow-[0_0_10px_rgb(52,211,153,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-success">
                      Checkboxes
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        variant="neon-cyan"
                        checked={checkboxChecked}
                        onCheckedChange={setCheckboxChecked}
                        size="sm"
                      />
                      <span className="text-xs">Agree</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        variant="neon-purple"
                        checked={!checkboxChecked}
                        size="sm"
                      />
                      <span className="text-xs">Terms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        variant="neon-chartreuse"
                        defaultChecked
                        size="sm"
                      />
                      <span className="text-xs">Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox variant="neon-pink" size="sm" />
                      <span className="text-xs">Subscribe</span>
                    </div>
                  </div>
                </motion.div>

                {/* Radio Buttons - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-pink/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-pink/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-pink rounded-full shadow-[0_0_10px_rgb(244,114,182,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-pink">
                      Radio
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Radio
                        variant="neon-cyan"
                        value="option1"
                        checked={radioValue === "option1"}
                        onCheckedChange={(checked) =>
                          checked && setRadioValue("option1")
                        }
                        size="sm"
                      />
                      <span className="text-xs">Option 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio
                        variant="neon-purple"
                        value="option2"
                        checked={radioValue === "option2"}
                        onCheckedChange={(checked) =>
                          checked && setRadioValue("option2")
                        }
                        size="sm"
                      />
                      <span className="text-xs">Option 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio
                        variant="neon-chartreuse"
                        value="option3"
                        checked={radioValue === "option3"}
                        onCheckedChange={(checked) =>
                          checked && setRadioValue("option3")
                        }
                        size="sm"
                      />
                      <span className="text-xs">Option 3</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio
                        variant="neon-pink"
                        value="option4"
                        checked={radioValue === "option4"}
                        onCheckedChange={(checked) =>
                          checked && setRadioValue("option4")
                        }
                        size="sm"
                      />
                      <span className="text-xs">Option 4</span>
                    </div>
                  </div>
                </motion.div>

                {/* Slider - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-purple/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-purple/40 transition-all duration-300 relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-purple rounded-full shadow-[0_0_10px_rgb(168,85,247,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-purple">
                      Neon Sliders
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-cyan-400">Cyan</span>
                        <span className="text-xs text-cyan-300">
                          {sliderValue[0]}%
                        </span>
                      </div>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        variant="neon-cyan"
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-400">Purple</span>
                        <span className="text-xs text-purple-300">
                          {sliderValue[0]}%
                        </span>
                      </div>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        variant="neon-purple"
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Circular Progress - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-warning/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-warning/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-warning rounded-full shadow-[0_0_10px_rgb(251,191,36,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-warning">
                      Progress
                    </h4>
                  </div>
                  <div className="flex justify-center items-center space-x-4">
                    <CircularProgress
                      variant="neon-cyan"
                      value={75}
                      size="md"
                      showLabel
                      pulseEffect
                    />
                    <CircularProgress
                      variant="neon-purple"
                      value={60}
                      size="md"
                      showLabel
                      pulseEffect
                    />
                  </div>
                </motion.div>

                {/* Textarea - Large Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-card/50 border border-neon-chartreuse/20 rounded-xl p-6 backdrop-blur-sm hover:border-neon-chartreuse/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-neon-chartreuse rounded-full shadow-[0_0_10px_rgb(163,230,53,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-neon-chartreuse">
                      Textarea
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      variant="neon-cyan"
                      placeholder="Type your message here..."
                      size="sm"
                    />
                    <Textarea
                      variant="neon-purple"
                      label="Message"
                      placeholder="Write something..."
                      size="sm"
                    />
                    <Textarea
                      variant="neon-warning"
                      placeholder="Feedback (max 120 chars)"
                      helperText="We value your feedback"
                      showCount
                      maxLength={120}
                      size="sm"
                    />
                  </div>
                </motion.div>

                {/* Modal Trigger - Large Box (now same height as textarea) */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-2 bg-card/50 border border-neon-cyan/20 rounded-xl p-6 backdrop-blur-sm hover:border-neon-cyan/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.55 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-neon-cyan">
                      Modals
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="neon-cyan"
                      size="sm"
                      onClick={() => {
                        setModalType("success");
                        setIsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Success Modal
                    </Button>
                    <Button
                      variant="neon-purple"
                      size="sm"
                      onClick={() => {
                        setModalType("info");
                        setIsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Info Modal
                    </Button>
                    <Button
                      variant="neon-chartreuse"
                      size="sm"
                      onClick={() => {
                        setModalType("chartreuse");
                        setIsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Chartreuse Modal
                    </Button>
                    <Button
                      variant="neon-pink"
                      size="sm"
                      onClick={() => {
                        setModalType("pink");
                        setIsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Pink Modal
                    </Button>
                    <Button
                      variant="neon-success"
                      size="sm"
                      onClick={() => {
                        setModalType("success-neon");
                        setIsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Success Neon
                    </Button>
                    <Button
                      variant="neon-warning"
                      size="sm"
                      onClick={() => {
                        setModalType("warning");
                        setIsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Warning Modal
                    </Button>
                  </div>
                </motion.div>

                {/* Card Example - Large Box */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 border border-slate-700 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-cyan-400/5 before:via-purple-400/5 before:to-lime-400/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 transition-all duration-300 hover:translate-y-[-2px] relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-lg font-semibold text-neon-cyan">
                      Card Component
                    </h4>
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col space-y-1.5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-400/20 rounded-lg">
                          <Star className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold leading-none tracking-tight text-white">
                            Premium Features
                          </h3>
                          <p className="text-sm text-cyan-100">
                            Unlock advanced tools
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pb-4">
                      <p className="text-gray-300 text-sm mb-4">
                        Access exclusive features and priority support with our
                        premium plan.
                      </p>
                      <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-400 to-purple-400 text-black rounded-lg font-medium hover:scale-105 transition-transform">
                        ✨ Upgrade Now
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Avatars - Medium Box (below Modals) */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-cyan/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-cyan/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-cyan">
                      Avatars
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar
                      variant="neon-cyan"
                      fallback="A"
                      size="default"
                      status="online"
                    />
                    <Avatar
                      variant="neon-purple"
                      fallback="B"
                      size="default"
                      status="offline"
                    />
                    <Avatar
                      variant="neon-chartreuse"
                      fallback="C"
                      size="default"
                    />
                  </div>
                </motion.div>

                {/* Stats Box - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-card/50 border border-neon-pink/20 rounded-xl p-4 backdrop-blur-sm hover:border-neon-pink/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.7 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-pink rounded-full shadow-[0_0_10px_rgb(244,114,182,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-pink">
                      Stats
                    </h4>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-pink mb-1">
                      20+
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Components
                    </div>
                    <div className="text-xs text-neon-pink">Ready to Use</div>
                  </div>
                </motion.div>

                {/* CTA Box - Medium Box */}
                <motion.div
                  className="md:col-span-1 lg:col-span-1 row-span-1 bg-gradient-to-br from-neon-cyan/10 via-neon-purple/10 to-neon-chartreuse/10 border border-neon-cyan/30 rounded-xl p-4 backdrop-blur-sm hover:border-neon-cyan/50 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_10px_rgb(34,211,238,0.5)]"></div>
                    <h4 className="text-sm font-semibold text-neon-cyan">
                      CTA
                    </h4>
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Ready to Build?
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Start with copy-paste components
                    </p>
                    <Button
                      variant="neon-cyan"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href="/setup">Get Started</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Modal Component - Using actual Modal component */}
              <Modal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setModalType(null);
                }}
                title={
                  modalType === "info"
                    ? "Information"
                    : modalType === "chartreuse"
                    ? "Success!"
                    : modalType === "pink"
                    ? "Special Notice"
                    : modalType === "success-neon"
                    ? "Operation Successful"
                    : modalType === "warning"
                    ? "Warning"
                    : "Success!"
                }
                description={
                  modalType === "info"
                    ? "Here is some helpful information."
                    : modalType === "chartreuse"
                    ? "Operation completed successfully"
                    : modalType === "pink"
                    ? "Special information with pink neon styling"
                    : modalType === "success-neon"
                    ? "Your action has been completed successfully"
                    : modalType === "warning"
                    ? "Please proceed with caution"
                    : "Modal opened successfully"
                }
                variant={
                  modalType === "info"
                    ? "neon-purple"
                    : modalType === "chartreuse"
                    ? "neon-chartreuse"
                    : modalType === "pink"
                    ? "neon-pink"
                    : modalType === "success-neon"
                    ? "neon-success"
                    : modalType === "warning"
                    ? "neon-warning"
                    : "neon-cyan"
                }
                actions={
                  <Button
                    variant={
                      modalType === "info"
                        ? "neon-purple"
                        : modalType === "chartreuse"
                        ? "neon-chartreuse"
                        : modalType === "pink"
                        ? "neon-pink"
                        : modalType === "success-neon"
                        ? "neon-success"
                        : modalType === "warning"
                        ? "neon-warning"
                        : "neon-cyan"
                    }
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalType(null);
                    }}
                  >
                    Got it
                  </Button>
                }
              >
                <p className="text-sm">
                  {modalType === "info"
                    ? "This neon modal is perfect for showing additional context without leaving the page."
                    : modalType === "chartreuse"
                    ? "This modal uses the neon-chartreuse variant with bright lime green accents and glowing effects. Perfect for success confirmations and achievements."
                    : modalType === "pink"
                    ? "This modal uses the neon-pink variant with vibrant pink accents and glowing effects. Great for special announcements and highlights."
                    : modalType === "success-neon"
                    ? "This modal uses the neon-success variant with emerald green accents and glowing effects. Perfect for success messages and confirmations."
                    : modalType === "warning"
                    ? "This modal uses the neon-warning variant with amber accents and glowing effects. Ideal for warning messages and important notices."
                    : "This is a beautiful neon modal for success messages and confirmations."}
                </p>
              </Modal>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose NeonKit?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed for developers who want clean, accessible, and
              beautifully animated components.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Palette className="h-8 w-8 text-neon-blue" />,
                title: "Copy & Paste Ready",
                description:
                  "Complete JSX with Tailwind classes. No setup, no installation, just copy and use.",
              },
              {
                icon: <Code2 className="h-8 w-8 text-neon-purple" />,
                title: "Dark Mode Optimized",
                description:
                  "8 neon variants designed exclusively for dark themes where electric effects shine.",
              },
              {
                icon: <Sparkles className="h-8 w-8 text-neon-chartreuse" />,
                title: "Smooth Animations",
                description:
                  "Framer Motion powered with accessibility-first design and reduced motion support.",
              },
              {
                icon: <Zap className="h-8 w-8 text-neon-pink" />,
                title: "20+ Components",
                description:
                  "From buttons to modals, inputs to progress bars - comprehensive component library for modern apps.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="font-semibold">NeonKit</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Built with ❤️ by Aadi
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
