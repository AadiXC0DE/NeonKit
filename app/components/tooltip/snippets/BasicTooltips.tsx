"use client";

// --- Tooltip component start ---
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
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
        {...Object.fromEntries(
          Object.entries(props).filter(
            ([key]) =>
              !key.startsWith("onAnimation") && !key.startsWith("onTransition"),
          ),
        )}
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

export default function BasicTooltipsPreview() {
  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Basic Tooltip Examples:
          </h4>

          <div className="flex flex-wrap gap-4">
            <Tooltip
              content="This is a basic tooltip with simple styling"
              variant="default"
            >
              <button className="px-4 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded hover:bg-slate-700 transition-all duration-300">
                Default
              </button>
            </Tooltip>

            <Tooltip
              content="Click to save your current settings"
              variant="default"
            >
              <button className="px-4 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded hover:bg-slate-700 transition-all duration-300">
                Save
              </button>
            </Tooltip>

            <Tooltip content="Delete this item permanently" variant="default">
              <button className="px-4 py-2 bg-red-800 border border-red-600 text-red-100 rounded hover:bg-red-700 transition-all duration-300">
                Delete
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Interactive Elements:
          </h4>

          <div className="flex flex-wrap gap-4">
            <Tooltip content="Go back to previous page" variant="default">
              <button className="p-3 bg-slate-800 border border-slate-600 text-slate-100 rounded hover:bg-slate-700 transition-all duration-300">
                ←
              </button>
            </Tooltip>

            <Tooltip
              content="View notifications and messages"
              variant="default"
            >
              <button className="p-3 bg-slate-800 border border-slate-600 text-slate-100 rounded hover:bg-slate-700 transition-all duration-300">
                🔔
              </button>
            </Tooltip>

            <Tooltip
              content="Access user settings and preferences"
              variant="default"
            >
              <button className="p-3 bg-slate-800 border border-slate-600 text-slate-100 rounded hover:bg-slate-700 transition-all duration-300">
                ⚙️
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
