"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?:
    | "default"
    | "ghost"
    | "filled"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  size?: "sm" | "default" | "lg" | "xl";
  error?: boolean;
  success?: boolean;
  helperText?: string;
  label?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      error = false,
      success = false,
      helperText,
      label,
      maxLength,
      showCount = false,
      value,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const baseClasses =
      "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300";

    const variants = {
      default: "border-input bg-background hover:border-accent-foreground/20",
      ghost: "border-transparent bg-accent/5 hover:bg-accent/10",
      filled: "bg-secondary border-transparent hover:bg-secondary/80",
      "neon-cyan":
        "bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm",
      "neon-purple":
        "bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm",
      "neon-chartreuse":
        "bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm",
      "neon-pink":
        "bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm",
      "neon-destructive":
        "bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium placeholder:text-red-200/70 focus-visible:border-red-400 focus-visible:shadow-[0_0_15px_rgb(248,113,113,0.3)] hover:border-red-400/80 hover:shadow-[0_0_10px_rgb(248,113,113,0.2)] backdrop-blur-sm",
      "neon-success":
        "bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium placeholder:text-emerald-200/70 focus-visible:border-emerald-400 focus-visible:shadow-[0_0_15px_rgb(52,211,153,0.3)] hover:border-emerald-400/80 hover:shadow-[0_0_10px_rgb(52,211,153,0.2)] backdrop-blur-sm",
      "neon-warning":
        "bg-slate-950/50 border-2 border-amber-400/60 text-amber-100 font-medium placeholder:text-amber-200/70 focus-visible:border-amber-400 focus-visible:shadow-[0_0_15px_rgb(251,191,36,0.3)] hover:border-amber-400/80 hover:shadow-[0_0_10px_rgb(251,191,36,0.2)] backdrop-blur-sm",
    };

    const sizes = {
      sm: "min-h-[60px] px-2 py-1 text-xs",
      default: "min-h-[80px] px-3 py-2",
      lg: "min-h-[120px] px-4 py-3 text-base",
      xl: "min-h-[160px] px-5 py-4 text-lg",
    };

    const isNeonVariant = variant?.startsWith("neon-");
    const neonColor = isNeonVariant ? variant.split("-")[1] : null;

    const getLabelColor = () => {
      if (!isNeonVariant) return "";

      const colorMap = {
        cyan: "text-cyan-100",
        purple: "text-purple-100",
        chartreuse: "text-lime-100",
        pink: "text-pink-100",
        destructive: "text-red-100",
        success: "text-emerald-100",
        warning: "text-amber-100",
      };

      return colorMap[neonColor as keyof typeof colorMap] || "text-cyan-100";
    };

    const getCountColor = () => {
      if (!isNeonVariant) return "";

      const colorMap = {
        cyan: "text-cyan-200",
        purple: "text-purple-200",
        chartreuse: "text-lime-200",
        pink: "text-pink-200",
        destructive: "text-red-200",
        success: "text-emerald-200",
        warning: "text-amber-200",
      };

      return colorMap[neonColor as keyof typeof colorMap] || "text-cyan-200";
    };

    const statusClass = error
      ? "border-destructive focus-visible:ring-destructive/50"
      : success
      ? "border-green-500 focus-visible:ring-green-500/50"
      : "";

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const currentValue = value !== undefined ? value : internalValue;
    const currentLength = String(currentValue).length;

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                isNeonVariant && getLabelColor(),
              )}
            >
              {label}
            </label>
            {showCount && maxLength && (
              <span
                className={cn(
                  "text-xs",
                  currentLength > maxLength
                    ? "text-destructive"
                    : "text-muted-foreground",
                  isNeonVariant &&
                    currentLength <= maxLength &&
                    getCountColor(),
                )}
              >
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        <motion.textarea
          ref={ref}
          className={cn(
            baseClasses,
            variants[variant],
            sizes[size],
            statusClass,
            className,
          )}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          initial={prefersReducedMotion ? undefined : { scale: 1 }}
          whileFocus={
            prefersReducedMotion
              ? undefined
              : {
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }
          }
          // Spread HTML textarea props separately
          placeholder={props.placeholder}
          name={props.name}
          id={props.id}
          autoComplete={props.autoComplete}
          autoFocus={props.autoFocus}
          readOnly={props.readOnly}
          required={props.required}
          rows={props.rows}
          cols={props.cols}
          onBlur={props.onBlur}
          onFocus={props.onFocus}
          onKeyDown={props.onKeyDown}
          onKeyUp={props.onKeyUp}
          tabIndex={props.tabIndex}
          role={props.role}
          aria-label={props["aria-label"]}
          aria-describedby={props["aria-describedby"]}
        />

        {/* Helper text */}
        {helperText && (
          <motion.p
            className={cn(
              "text-xs",
              error
                ? "text-destructive"
                : success
                ? "text-green-500"
                : "text-muted-foreground",
              isNeonVariant && !error && !success && getCountColor(),
            )}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.2 }}
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
