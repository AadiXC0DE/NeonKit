"use client";

// --- Tooltip component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink";
  size?: "sm" | "default" | "lg";
  animate?: boolean;
  triggerClassName?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      children,
      content,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      delayDuration = 300,
      side = "top",
      align = "center",
      variant = "default",
      size = "default",
      animate = true,
      className,
      triggerClassName,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const [isOpen, setIsOpen] = React.useState(false);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
      null,
    );
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const variants = {
      default: "bg-slate-800 border border-slate-600 text-slate-100",
      "neon-cyan":
        "bg-slate-950/95 border-2 border-cyan-400/60 text-cyan-100 shadow-[0_0_25px_rgb(34,211,238,0.5)] backdrop-blur-sm",
      "neon-purple":
        "bg-slate-950/95 border-2 border-purple-400/60 text-purple-100 shadow-[0_0_25px_rgb(168,85,247,0.5)] backdrop-blur-sm",
      "neon-chartreuse":
        "bg-slate-950/95 border-2 border-lime-400/60 text-lime-100 shadow-[0_0_25px_rgb(163,230,53,0.5)] backdrop-blur-sm",
      "neon-pink":
        "bg-slate-950/95 border-2 border-pink-400/60 text-pink-100 shadow-[0_0_25px_rgb(244,114,182,0.5)] backdrop-blur-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs max-w-xs",
      default: "px-4 py-2 text-sm max-w-sm",
      lg: "px-5 py-3 text-base max-w-md",
    };

    const getTooltipPosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return { x: 0, y: 0 };

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spacing = 8;

      let x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      let y = triggerRect.top;

      switch (side) {
        case "top":
          y = triggerRect.top - tooltipRect.height - spacing;
          break;
        case "bottom":
          y = triggerRect.bottom + spacing;
          break;
        case "left":
          x = triggerRect.left - tooltipRect.width - spacing;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
        case "right":
          x = triggerRect.right + spacing;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
      y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

      return { x, y };
    };

    const showTooltip = () => {
      if (timeoutId) clearTimeout(timeoutId);

      const id = setTimeout(() => {
        setIsOpen(true);
        setPosition(getTooltipPosition());
        if (onOpenChange) onOpenChange(true);
        if (!isControlled) setInternalOpen(true);
      }, delayDuration);

      setTimeoutId(id);
    };

    const hideTooltip = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setIsOpen(false);
      if (onOpenChange) onOpenChange(false);
      if (!isControlled) setInternalOpen(false);
    };

    const handleMouseEnter = () => {
      showTooltip();
    };

    const handleMouseLeave = () => {
      hideTooltip();
    };

    const handleFocus = () => {
      showTooltip();
    };

    const handleBlur = () => {
      hideTooltip();
    };

    React.useEffect(() => {
      if (isOpen && tooltipRef.current) {
        setPosition(getTooltipPosition());
      }
    }, [isOpen, side]);

    React.useEffect(() => {
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [timeoutId]);

    const tooltipContent = (
      <motion.div
        ref={tooltipRef}
        initial={
          animate && !prefersReducedMotion ? { opacity: 0, scale: 0.95 } : {}
        }
        animate={
          animate && !prefersReducedMotion ? { opacity: 1, scale: 1 } : {}
        }
        exit={
          animate && !prefersReducedMotion ? { opacity: 0, scale: 0.95 } : {}
        }
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "fixed z-50 overflow-hidden rounded-lg border font-medium",
          variants[variant],
          sizes[size],
          className,
        )}
        style={{
          left: position.x,
          top: position.y,
        }}
        {...props}
      >
        {content}
      </motion.div>
    );

    return (
      <div ref={ref}>
        <button
          ref={triggerRef}
          type="button"
          className={cn("inline-flex items-center", triggerClassName)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {children}
        </button>

        <AnimatePresence>{isOpen && tooltipContent}</AnimatePresence>
      </div>
    );
  },
);

Tooltip.displayName = "Tooltip";
// --- Tooltip component end ---

export default function TooltipSizesPreview() {
  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Tooltip Sizes:
          </h4>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Small Size</span>
              <Tooltip
                content="This is a small tooltip with compact text"
                size="sm"
                variant="neon-cyan"
              >
                <button className="px-3 py-1 bg-slate-800 border border-cyan-400/60 text-cyan-400 rounded text-sm hover:bg-cyan-400/10 transition-all duration-300">
                  Small
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Default Size</span>
              <Tooltip
                content="This is a default tooltip with standard text size and spacing"
                size="default"
                variant="neon-purple"
              >
                <button className="px-4 py-2 bg-slate-800 border border-purple-400/60 text-purple-400 rounded hover:bg-purple-400/10 transition-all duration-300">
                  Default
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Large Size</span>
              <Tooltip
                content="This is a large tooltip with bigger text and more generous spacing for better readability"
                size="lg"
                variant="neon-chartreuse"
              >
                <button className="px-5 py-3 bg-slate-800 border border-lime-400/60 text-lime-400 rounded hover:bg-lime-400/10 transition-all duration-300 font-medium">
                  Large
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Size Comparison:
          </h4>

          <div className="space-y-3 p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Compact UI</span>
              <Tooltip
                content="Small tooltips for mobile and compact interfaces"
                size="sm"
                variant="neon-pink"
              >
                <button className="text-xs px-2 py-1 bg-slate-800 border border-pink-400/60 text-pink-400 rounded hover:bg-pink-400/10 transition-all duration-300">
                  SM
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Standard UI</span>
              <Tooltip
                content="Default tooltips for most desktop and web applications"
                size="default"
                variant="neon-cyan"
              >
                <button className="px-3 py-2 bg-slate-800 border border-cyan-400/60 text-cyan-400 rounded hover:bg-cyan-400/10 transition-all duration-300">
                  MD
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">
                Spacious UI
              </span>
              <Tooltip
                content="Large tooltips for accessibility and spacious designs"
                size="lg"
                variant="neon-purple"
              >
                <button className="px-4 py-3 bg-slate-800 border border-purple-400/60 text-purple-400 rounded hover:bg-purple-400/10 transition-all duration-300 font-medium">
                  LG
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Contextual Examples:
          </h4>

          <div className="flex flex-wrap gap-3">
            <Tooltip
              content="Small icon tooltip"
              size="sm"
              variant="neon-chartreuse"
            >
              <button className="p-2 bg-slate-800 border border-lime-400/60 text-lime-400 rounded hover:bg-lime-400/10 transition-all duration-300">
                ⭐
              </button>
            </Tooltip>

            <Tooltip
              content="Help text for this feature"
              size="default"
              variant="neon-pink"
            >
              <button className="p-2 bg-slate-800 border border-pink-400/60 text-pink-400 rounded hover:bg-pink-400/10 transition-all duration-300">
                ❓
              </button>
            </Tooltip>

            <Tooltip
              content="Detailed information about this important action button"
              size="lg"
              variant="neon-cyan"
            >
              <button className="px-4 py-2 bg-slate-800 border border-cyan-400/60 text-cyan-400 rounded hover:bg-cyan-400/10 transition-all duration-300">
                Action
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
