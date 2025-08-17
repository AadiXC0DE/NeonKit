"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?:
    | "default"
    | "ghost"
    | "filled"
    | "search"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink"
    | "neon-destructive"
    | "neon-success"
    | "neon-warning";
  size?: "sm" | "default" | "lg" | "xl";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  clearable?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  helperText?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "text",
      startIcon,
      endIcon,
      clearable = false,
      loading = false,
      error = false,
      success = false,
      helperText,
      label,
      value,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");

    const isPasswordType = type === "password";
    const isSearchType = variant === "search";
    const inputType = isPasswordType && showPassword ? "text" : type;

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const baseClasses =
      "flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300";

    const variants = {
      default: "border-input bg-background hover:border-accent-foreground/20",
      ghost: "border-transparent bg-accent/5 hover:bg-accent/10",
      filled: "bg-secondary border-transparent hover:bg-secondary/80",
      search:
        "pl-10 border-input bg-background hover:border-accent-foreground/20",
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
      sm: "h-8 px-2 text-xs",
      default: "h-10 px-3 py-2",
      lg: "h-11 px-4 py-3 text-base",
      xl: "h-12 px-5 py-4 text-lg",
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

    const statusClass = error
      ? "border-destructive focus-visible:ring-destructive/50"
      : success
      ? "border-green-500 focus-visible:ring-green-500/50"
      : "";

    const handleClear = () => {
      setInternalValue("");
      if (onChange) {
        const event = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const shouldShowClear = clearable && internalValue && !disabled;
    const shouldShowPasswordToggle = isPasswordType && !disabled;

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              isNeonVariant &&
                getIconColor()
                  .replace("text-", "text-")
                  .replace("-400", "-100"),
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Start icon */}
          {(startIcon || isSearchType) && (
            <div
              className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2",
                getIconColor(),
              )}
            >
              {isSearchType ? <Search className="h-4 w-4" /> : startIcon}
            </div>
          )}

          {/* Loading icon */}
          {loading && (
            <div
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2",
                getIconColor(),
              )}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          <motion.input
            ref={ref}
            type={inputType}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[size],
              statusClass,
              (startIcon || isSearchType) && "pl-10",
              (endIcon ||
                shouldShowClear ||
                shouldShowPasswordToggle ||
                loading) &&
                "pr-10",
              className,
            )}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            disabled={disabled || loading}
            initial={prefersReducedMotion ? undefined : { scale: 1 }}
            whileFocus={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }
            }
            // Spread HTML input props separately
            placeholder={props.placeholder}
            name={props.name}
            id={props.id}
            autoComplete={props.autoComplete}
            autoFocus={props.autoFocus}
            readOnly={props.readOnly}
            required={props.required}
            maxLength={props.maxLength}
            minLength={props.minLength}
            pattern={props.pattern}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            onKeyDown={props.onKeyDown}
            onKeyUp={props.onKeyUp}
            tabIndex={props.tabIndex}
            role={props.role}
            aria-label={props["aria-label"]}
            aria-describedby={props["aria-describedby"]}
          />

          {/* End icons */}
          {!loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {shouldShowClear && (
                <motion.button
                  type="button"
                  onClick={handleClear}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    getIconColor(),
                    isNeonVariant && "hover:text-" + neonColor + "-300",
                  )}
                  initial={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: 0, scale: 0.8 }
                  }
                  animate={
                    prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
                  }
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}

              {shouldShowPasswordToggle && (
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    getIconColor(),
                    isNeonVariant && "hover:text-" + neonColor + "-300",
                  )}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </motion.button>
              )}

              {endIcon && <div className={getIconColor()}>{endIcon}</div>}
            </div>
          )}
        </div>

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
              isNeonVariant &&
                !error &&
                !success &&
                getIconColor()
                  .replace("text-", "text-")
                  .replace("-400", "-200"),
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
Input.displayName = "Input";

export { Input };
