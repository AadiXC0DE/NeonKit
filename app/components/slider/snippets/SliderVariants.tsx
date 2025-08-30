"use client";

// --- Slider component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number[];
  defaultValue?: number | readonly number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  orientation?: "horizontal" | "vertical";
  showValue?: boolean;
  animate?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue = [50],
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      size = "default",
      variant = "default",
      orientation = "horizontal",
      showValue = false,
      animate = true,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(
      value || (Array.isArray(defaultValue) ? defaultValue : [defaultValue || 0]),
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const sizes = {
      sm: orientation === "horizontal" ? "h-1" : "w-1",
      default: orientation === "horizontal" ? "h-2" : "w-2",
      lg: orientation === "horizontal" ? "h-3" : "w-3",
    };

    const thumbSizes = {
      sm: "w-3 h-3",
      default: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const trackSizes = {
      sm: orientation === "horizontal" ? "h-1" : "w-1",
      default: orientation === "horizontal" ? "h-2" : "w-2",
      lg: orientation === "horizontal" ? "h-3" : "w-3",
    };

    const variants = {
      default: {
        track: "bg-slate-800/60 border border-slate-700/80 shadow-inner",
        trackFilled: "bg-gradient-to-r from-slate-600 to-slate-500 shadow-sm",
        thumb: "bg-white border-2 border-slate-400 shadow-lg hover:shadow-xl",
        thumbHover: "bg-slate-50 border-2 border-slate-300 shadow-xl",
        thumbActive:
          "bg-slate-100 border-2 border-slate-200 shadow-2xl scale-110",
      },
      "neon-cyan": {
        track:
          "bg-slate-950/95 border border-cyan-400/40 shadow-[inset_0_1px_0_rgb(34,211,238,0.1)] backdrop-blur-sm",
        trackFilled:
          "bg-gradient-to-r from-cyan-400/30 via-cyan-400/50 to-cyan-400/30 border border-cyan-400/60 shadow-[0_0_20px_rgb(34,211,238,0.4),inset_0_1px_0_rgb(34,211,238,0.2)]",
        thumb:
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-400 shadow-[0_0_15px_rgb(34,211,238,0.6)] hover:shadow-[0_0_20px_rgb(34,211,238,0.8)]",
        thumbHover:
          "bg-gradient-to-br from-cyan-300 to-cyan-400 border-2 border-cyan-300 shadow-[0_0_25px_rgb(34,211,238,0.9),0_0_40px_rgb(34,211,238,0.4)]",
        thumbActive:
          "bg-gradient-to-br from-cyan-200 to-cyan-300 border-2 border-cyan-200 shadow-[0_0_30px_rgb(34,211,238,1),0_0_50px_rgb(34,211,238,0.5)] scale-110",
      },
      "neon-purple": {
        track:
          "bg-slate-950/95 border border-purple-400/40 shadow-[inset_0_1px_0_rgb(168,85,247,0.1)] backdrop-blur-sm",
        trackFilled:
          "bg-gradient-to-r from-purple-400/30 via-purple-400/50 to-purple-400/30 border border-purple-400/60 shadow-[0_0_20px_rgb(168,85,247,0.4),inset_0_1px_0_rgb(168,85,247,0.2)]",
        thumb:
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-400 shadow-[0_0_15px_rgb(168,85,247,0.6)] hover:shadow-[0_0_20px_rgb(168,85,247,0.8)]",
        thumbHover:
          "bg-gradient-to-br from-purple-300 to-purple-400 border-2 border-purple-300 shadow-[0_0_25px_rgb(168,85,247,0.9),0_0_40px_rgb(168,85,247,0.4)]",
        thumbActive:
          "bg-gradient-to-br from-purple-200 to-purple-300 border-2 border-purple-200 shadow-[0_0_30px_rgb(168,85,247,1),0_0_50px_rgb(168,85,247,0.5)] scale-110",
      },
      "neon-chartreuse": {
        track:
          "bg-slate-950/95 border border-lime-400/40 shadow-[inset_0_1px_0_rgb(163,230,53,0.1)] backdrop-blur-sm",
        trackFilled:
          "bg-gradient-to-r from-lime-400/30 via-lime-400/50 to-lime-400/30 border border-lime-400/60 shadow-[0_0_20px_rgb(163,230,53,0.4),inset_0_1px_0_rgb(163,230,53,0.2)]",
        thumb:
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-lime-400 shadow-[0_0_15px_rgb(163,230,53,0.6)] hover:shadow-[0_0_20px_rgb(163,230,53,0.8)]",
        thumbHover:
          "bg-gradient-to-br from-lime-300 to-lime-400 border-2 border-lime-300 shadow-[0_0_25px_rgb(163,230,53,0.9),0_0_40px_rgb(163,230,53,0.4)]",
        thumbActive:
          "bg-gradient-to-br from-lime-200 to-lime-300 border-2 border-lime-200 shadow-[0_0_30px_rgb(163,230,53,1),0_0_50px_rgb(163,230,53,0.5)] scale-110",
      },
      "neon-pink": {
        track:
          "bg-slate-950/95 border border-pink-400/40 shadow-[inset_0_1px_0_rgb(244,114,182,0.1)] backdrop-blur-sm",
        trackFilled:
          "bg-gradient-to-r from-pink-400/30 via-pink-400/50 to-pink-400/30 border border-pink-400/60 shadow-[0_0_20px_rgb(244,114,182,0.4),inset_0_1px_0_rgb(244,114,182,0.2)]",
        thumb:
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-pink-400 shadow-[0_0_15px_rgb(244,114,182,0.6)] hover:shadow-[0_0_20px_rgb(244,114,182,0.8)]",
        thumbHover:
          "bg-gradient-to-br from-pink-300 to-pink-400 border-2 border-pink-300 shadow-[0_0_25px_rgb(244,114,182,0.9),0_0_40px_rgb(244,114,182,0.4)]",
        thumbActive:
          "bg-gradient-to-br from-pink-200 to-pink-300 border-2 border-pink-200 shadow-[0_0_30px_rgb(244,114,182,1),0_0_50px_rgb(244,114,182,0.5)] scale-110",
      },
      "neon-destructive": {
        track:
          "bg-slate-950/95 border border-red-400/40 shadow-[inset_0_1px_0_rgb(248,113,113,0.1)] backdrop-blur-sm",
        trackFilled:
          "bg-gradient-to-r from-red-400/30 via-red-400/50 to-red-400/30 border border-red-400/60 shadow-[0_0_20px_rgb(248,113,113,0.4),inset_0_1px_0_rgb(248,113,113,0.2)]",
        thumb:
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-red-400 shadow-[0_0_15px_rgb(248,113,113,0.6)] hover:shadow-[0_0_20px_rgb(248,113,113,0.8)]",
        thumbHover:
          "bg-gradient-to-br from-red-300 to-red-400 border-2 border-red-300 shadow-[0_0_25px_rgb(248,113,113,0.9),0_0_40px_rgb(248,113,113,0.4)]",
        thumbActive:
          "bg-gradient-to-br from-red-200 to-red-300 border-2 border-red-200 shadow-[0_0_30px_rgb(248,113,113,1),0_0_50px_rgb(248,113,113,0.5)] scale-110",
      },
      "neon-success": {
        track:
          "bg-slate-950/95 border border-emerald-400/40 shadow-[inset_0_1px_0_rgb(52,211,153,0.1)] backdrop-blur-sm",
        trackFilled:
          "bg-gradient-to-r from-emerald-400/30 via-emerald-400/50 to-emerald-400/30 border border-emerald-400/60 shadow-[0_0_20px_rgb(52,211,153,0.4),inset_0_1px_0_rgb(52,211,153,0.2)]",
        thumb:
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-emerald-400 shadow-[0_0_15px_rgb(52,211,153,0.6)] hover:shadow-[0_0_20px_rgb(52,211,153,0.8)]",
        thumbHover:
          "bg-gradient-to-br from-emerald-300 to-emerald-400 border-2 border-emerald-300 shadow-[0_0_25px_rgb(52,211,153,0.9),0_0_40px_rgb(52,211,153,0.4)]",
        thumbActive:
          "bg-gradient-to-br from-emerald-200 to-emerald-300 border-2 border-emerald-200 shadow-[0_0_30px_rgb(52,211,153,1),0_0_50px_rgb(52,211,153,0.5)] scale-110",
      },
      "neon-warning": {
        track:
          "bg-slate-950/95 border border-amber-400/40 shadow-[inset_0_1px_0_rgb(251,191,36,0.1)] backdrop-blur-sm",
        trackFilled:
          "bg-gradient-to-r from-amber-400/30 via-amber-400/50 to-amber-400/30 border border-amber-400/60 shadow-[0_0_20px_rgb(251,191,36,0.4),inset_0_1px_0_rgb(251,191,36,0.2)]",
        thumb:
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-400 shadow-[0_0_15px_rgb(251,191,36,0.6)] hover:shadow-[0_0_20px_rgb(251,191,36,0.8)]",
        thumbHover:
          "bg-gradient-to-br from-amber-300 to-amber-400 border-2 border-amber-300 shadow-[0_0_25px_rgb(251,191,36,0.9),0_0_40px_rgb(251,191,36,0.4)]",
        thumbActive:
          "bg-gradient-to-br from-amber-200 to-amber-300 border-2 border-amber-200 shadow-[0_0_30px_rgb(251,191,36,1),0_0_50px_rgb(251,191,36,0.5)] scale-110",
      },
    };

    const [isDragging, setIsDragging] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);
    const trackRef = React.useRef<HTMLDivElement>(null);
    const thumbRef = React.useRef<HTMLDivElement>(null);

    const percentage = ((currentValue[0] - min) / (max - min)) * 100;

    const updateValue = React.useCallback(
      (clientX: number, clientY: number) => {
        if (!trackRef.current || disabled) return;

        const rect = trackRef.current.getBoundingClientRect();
        let newPercentage: number;

        if (orientation === "horizontal") {
          newPercentage = ((clientX - rect.left) / rect.width) * 100;
        } else {
          newPercentage = ((rect.bottom - clientY) / rect.height) * 100;
        }

        newPercentage = Math.max(0, Math.min(100, newPercentage));

        const rawValue = (newPercentage / 100) * (max - min) + min;
        const steppedValue = Math.round(rawValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));

        const newValue = [clampedValue];

        if (isControlled) {
          onValueChange?.(newValue);
        } else {
          setInternalValue(newValue);
          onValueChange?.(newValue);
        }
      },
      [min, max, step, disabled, orientation, isControlled, onValueChange],
    );

    const handleMouseDown = (event: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      updateValue(event.clientX, event.clientY);
      event.preventDefault();
    };

    const handleTouchStart = (event: React.TouchEvent) => {
      if (disabled) return;
      setIsDragging(true);
      const touch = event.touches[0];
      updateValue(touch.clientX, touch.clientY);
    };

    React.useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (event: MouseEvent) => {
        updateValue(event.clientX, event.clientY);
      };

      const handleTouchMove = (event: TouchEvent) => {
        const touch = event.touches[0];
        updateValue(touch.clientX, touch.clientY);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }, [isDragging, updateValue]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      let newValue = currentValue[0];

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowDown":
          event.preventDefault();
          newValue = Math.max(min, currentValue[0] - step);
          break;
        case "ArrowRight":
        case "ArrowUp":
          event.preventDefault();
          newValue = Math.min(max, currentValue[0] + step);
          break;
        case "Home":
          event.preventDefault();
          newValue = min;
          break;
        case "End":
          event.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }

      const newValueArray = [newValue];
      if (isControlled) {
        onValueChange?.(newValueArray);
      } else {
        setInternalValue(newValueArray);
        onValueChange?.(newValueArray);
      }
    };

    const trackStyle =
      orientation === "horizontal" ? { width: "100%" } : { height: "100%" };

    const filledTrackStyle =
      orientation === "horizontal"
        ? { width: `${percentage}%` }
        : { height: `${percentage}%` };

    const thumbPosition =
      orientation === "horizontal"
        ? {
            left: `${percentage}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
          }
        : {
            top: `${100 - percentage}%`,
            left: "50%",
            transform: "translate(-50%, -50%)",
          };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center",
          orientation === "horizontal" ? "w-full" : "h-full flex-col",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <div
          ref={trackRef}
          className={cn(
            "relative rounded-full cursor-pointer select-none",
            trackSizes[size],
            variants[variant].track,
            orientation === "horizontal" ? "w-full" : "h-full",
            disabled && "cursor-not-allowed",
          )}
          style={trackStyle}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Filled track */}
          <motion.div
            className={cn(
              "absolute rounded-full",
              trackSizes[size],
              variants[variant].trackFilled,
            )}
            style={filledTrackStyle}
            animate={animate && !prefersReducedMotion ? { scale: 1 } : {}}
            transition={{ duration: 0.2 }}
          />

          {/* Thumb */}
          <motion.div
            ref={thumbRef}
            className={cn(
              "absolute rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 ease-out",
              thumbSizes[size],
              hovered || isDragging
                ? variants[variant].thumbHover
                : variants[variant].thumb,
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              variant.startsWith("neon-")
                ? "focus-visible:ring-cyan-400/50"
                : "focus-visible:ring-slate-400",
            )}
            style={thumbPosition}
            animate={animate && !prefersReducedMotion ? thumbPosition : {}}
            whileHover={{ scale: 1.1 }}
            whileFocus={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue[0]}
            aria-orientation={orientation}
            aria-disabled={disabled}
            onKeyDown={handleKeyDown}
          />
        </div>

        {showValue && (
          <div className="ml-3 text-sm font-medium text-slate-300 min-w-[3rem] text-center">
            {currentValue[0]}
          </div>
        )}
      </div>
    );
  },
);

Slider.displayName = "Slider";
// --- Slider component end ---

export default function SliderVariantsPreview() {
  const [tempValue, setTempValue] = React.useState([25]);
  const [opacityValue, setOpacityValue] = React.useState([75]);
  const [zoomValue, setZoomValue] = React.useState([100]);

  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-6">
        {/* Temperature Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgb(59,130,246,0.8)]"></div>
              Temperature (°C)
            </label>
            <span className="text-sm text-blue-300">{tempValue[0]}°C</span>
          </div>
          <Slider
            value={tempValue}
            onValueChange={setTempValue}
            min={-10}
            max={40}
            step={1}
            variant="neon-cyan"
            showValue
            className="w-full"
          />
        </div>

        {/* Opacity Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgb(168,85,247,0.8)]"></div>
              Opacity
            </label>
            <span className="text-sm text-purple-300">{opacityValue[0]}%</span>
          </div>
          <Slider
            value={opacityValue}
            onValueChange={setOpacityValue}
            max={100}
            step={5}
            variant="neon-purple"
            showValue
            className="w-full"
          />
        </div>

        {/* Zoom Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgb(163,230,53,0.8)]"></div>
              Zoom Level
            </label>
            <span className="text-sm text-lime-300">{zoomValue[0]}%</span>
          </div>
          <Slider
            value={zoomValue}
            onValueChange={setZoomValue}
            min={50}
            max={200}
            step={10}
            variant="neon-chartreuse"
            showValue
            className="w-full"
          />
        </div>

        {/* Different Step Sizes */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">
            Step Size Variations
          </label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-16">Step: 1</span>
              <Slider
                defaultValue={[33]}
                max={100}
                step={1}
                variant="neon-pink"
                size="sm"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-16">Step: 5</span>
              <Slider
                defaultValue={[35]}
                max={100}
                step={5}
                variant="neon-destructive"
                size="sm"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-16">Step: 10</span>
              <Slider
                defaultValue={[40]}
                max={100}
                step={10}
                variant="neon-success"
                size="sm"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
