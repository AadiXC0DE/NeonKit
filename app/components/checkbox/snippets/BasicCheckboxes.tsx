"use client";

// --- Checkbox component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "neon-cyan"
    | "neon-purple"
    | "neon-chartreuse"
    | "neon-pink";
  animate?: boolean;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled = false,
      size = "default",
      variant = "default",
      animate = true,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked || false,
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const sizes = {
      sm: "w-4 h-4",
      default: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const iconSizes = {
      sm: "w-3 h-3",
      default: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const variants = {
      default: {
        box: "border-slate-400 bg-transparent hover:border-slate-300",
        boxChecked: "border-slate-300 bg-slate-300",
        check: "text-white",
      },
      "neon-cyan": {
        box: "border-2 border-cyan-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(34,211,238,0.4)] hover:shadow-[0_0_20px_rgb(34,211,238,0.6)] hover:border-cyan-400",
        boxChecked:
          "border-2 border-cyan-400 bg-cyan-400 shadow-[0_0_20px_rgb(34,211,238,0.8)]",
        check: "text-white",
      },
      "neon-purple": {
        box: "border-2 border-purple-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(168,85,247,0.4)] hover:shadow-[0_0_20px_rgb(168,85,247,0.6)] hover:border-purple-400",
        boxChecked:
          "border-2 border-purple-400 bg-purple-400 shadow-[0_0_20px_rgb(168,85,247,0.8)]",
        check: "text-white",
      },
      "neon-chartreuse": {
        box: "border-2 border-lime-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(163,230,53,0.4)] hover:shadow-[0_0_20px_rgb(163,230,53,0.6)] hover:border-lime-400",
        boxChecked:
          "border-2 border-lime-400 bg-lime-400 shadow-[0_0_20px_rgb(163,230,53,0.8)]",
        check: "text-white",
      },
      "neon-pink": {
        box: "border-2 border-pink-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(244,114,182,0.4)] hover:shadow-[0_0_20px_rgb(244,114,182,0.6)] hover:border-pink-400",
        boxChecked:
          "border-2 border-pink-400 bg-pink-400 shadow-[0_0_20px_rgb(244,114,182,0.8)]",
        check: "text-white",
      },
    };

    const handleClick = () => {
      if (disabled) return;

      const newChecked = isChecked === true ? false : true;

      if (isControlled) {
        onCheckedChange?.(newChecked);
      } else {
        setInternalChecked(newChecked);
        onCheckedChange?.(newChecked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    const checkContent = (
      <motion.div
        initial={false}
        animate={{
          scale: isChecked ? 1 : 0,
          opacity: isChecked ? 1 : 0,
        }}
        transition={{ duration: animate && !prefersReducedMotion ? 0.15 : 0 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Check className={cn(iconSizes[size], variants[variant].check)} />
      </motion.div>
    );

    const indeterminateContent = (
      <motion.div
        initial={false}
        animate={{
          scale: isChecked === "indeterminate" ? 1 : 0,
          opacity: isChecked === "indeterminate" ? 1 : 0,
        }}
        transition={{ duration: animate && !prefersReducedMotion ? 0.15 : 0 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className={cn(
            "w-2/3 h-0.5 rounded-full",
            variant === "default" ? "bg-white" : "bg-white",
          )}
        />
      </motion.div>
    );

    const boxContent = (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded border-2 transition-all duration-200 ease-in-out cursor-pointer",
          sizes[size],
          isChecked === true
            ? variants[variant].boxChecked
            : variants[variant].box,
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {checkContent}
        {indeterminateContent}
      </div>
    );

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={isChecked === "indeterminate" ? "mixed" : isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center focus:outline-none",
          disabled && "cursor-not-allowed",
        )}
        {...props}
      >
        {boxContent}
      </button>
    );
  },
);

Checkbox.displayName = "Checkbox";
// --- Checkbox component end ---

export default function BasicCheckboxesPreview() {
  const [preferences, setPreferences] = React.useState({
    email: true,
    sms: false,
    push: true,
  });

  const updatePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={preferences.email}
            onCheckedChange={() => updatePreference("email")}
          />
          <label className="text-sm font-medium">Email notifications</label>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            checked={preferences.sms}
            onCheckedChange={() => updatePreference("sms")}
          />
          <label className="text-sm font-medium">SMS notifications</label>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            checked={preferences.push}
            onCheckedChange={() => updatePreference("push")}
          />
          <label className="text-sm font-medium">Push notifications</label>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox disabled />
          <label className="text-sm font-medium text-muted-foreground">
            Disabled option
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Selected: {Object.values(preferences).filter(Boolean).length} options
        </h4>
      </div>
    </div>
  );
}
