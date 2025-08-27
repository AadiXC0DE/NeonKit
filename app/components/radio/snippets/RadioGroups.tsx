"use client";

// --- Radio component start ---
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
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
  value?: string;
  name?: string;
}

const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
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
      value,
      name,
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

    const innerSizes = {
      sm: "w-1.5 h-1.5",
      default: "w-2 h-2",
      lg: "w-2.5 h-2.5",
    };

    const variants = {
      default: {
        outer: "border-slate-400",
        outerChecked: "border-slate-300 bg-slate-300",
        inner: "bg-white",
      },
      "neon-cyan": {
        outer:
          "border-2 border-cyan-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(34,211,238,0.4)] hover:shadow-[0_0_20px_rgb(34,211,238,0.6)] hover:border-cyan-400",
        outerChecked:
          "border-2 border-cyan-400 bg-cyan-400 shadow-[0_0_20px_rgb(34,211,238,0.8)]",
        inner: "bg-cyan-400",
      },
      "neon-purple": {
        outer:
          "border-2 border-purple-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(168,85,247,0.4)] hover:shadow-[0_0_20px_rgb(168,85,247,0.6)] hover:border-purple-400",
        outerChecked:
          "border-2 border-purple-400 bg-purple-400 shadow-[0_0_20px_rgb(168,85,247,0.8)]",
        inner: "bg-purple-400",
      },
      "neon-chartreuse": {
        outer:
          "border-2 border-lime-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(163,230,53,0.4)] hover:shadow-[0_0_20px_rgb(163,230,53,0.6)] hover:border-lime-400",
        outerChecked:
          "border-2 border-lime-400 bg-lime-400 shadow-[0_0_20px_rgb(163,230,53,0.8)]",
        inner: "bg-lime-400",
      },
      "neon-pink": {
        outer:
          "border-2 border-pink-400/60 bg-slate-950/90 shadow-[0_0_15px_rgb(244,114,182,0.4)] hover:shadow-[0_0_20px_rgb(244,114,182,0.6)] hover:border-pink-400",
        outerChecked:
          "border-2 border-pink-400 bg-pink-400 shadow-[0_0_20px_rgb(244,114,182,0.8)]",
        inner: "bg-pink-400",
      },
    };

    const handleClick = () => {
      if (disabled) return;

      if (isControlled) {
        onCheckedChange?.(!isChecked);
      } else {
        setInternalChecked(!internalChecked);
        onCheckedChange?.(!internalChecked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    const innerContent = (
      <motion.div
        className={cn(
          "rounded-full transition-all duration-200 ease-in-out",
          innerSizes[size],
          isChecked ? variants[variant].inner : "bg-transparent",
        )}
        initial={false}
        animate={{
          scale: isChecked ? 1 : 0,
          opacity: isChecked ? 1 : 0,
        }}
        transition={{
          duration: animate && !prefersReducedMotion ? 0.15 : 0,
        }}
      />
    );

    const outerContent = (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 ease-in-out cursor-pointer",
          sizes[size],
          isChecked ? variants[variant].outerChecked : variants[variant].outer,
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {innerContent}
      </div>
    );

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center focus:outline-none",
          disabled && "cursor-not-allowed",
        )}
        value={value}
        name={name}
        {...props}
      >
        {outerContent}
      </button>
    );
  },
);

Radio.displayName = "Radio";
// --- Radio component end ---

export default function RadioGroupsPreview() {
  const [paymentMethod, setPaymentMethod] = React.useState("credit-card");
  const [shippingSpeed, setShippingSpeed] = React.useState("standard");

  return (
    <div className="space-y-8 w-full max-w-lg">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Payment Method:
          </h4>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Radio
                checked={paymentMethod === "credit-card"}
                onCheckedChange={() => setPaymentMethod("credit-card")}
                variant="neon-cyan"
              />
              <label className="text-sm font-medium">Credit Card</label>
              <span className="text-xs text-muted-foreground">(+2% fee)</span>
            </div>

            <div className="flex items-center space-x-3">
              <Radio
                checked={paymentMethod === "paypal"}
                onCheckedChange={() => setPaymentMethod("paypal")}
                variant="neon-purple"
              />
              <label className="text-sm font-medium">PayPal</label>
              <span className="text-xs text-muted-foreground">(Free)</span>
            </div>

            <div className="flex items-center space-x-3">
              <Radio
                checked={paymentMethod === "crypto"}
                onCheckedChange={() => setPaymentMethod("crypto")}
                variant="neon-chartreuse"
              />
              <label className="text-sm font-medium">Cryptocurrency</label>
              <span className="text-xs text-muted-foreground">(Fastest)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Shipping Speed:
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Radio
                  checked={shippingSpeed === "express"}
                  onCheckedChange={() => setShippingSpeed("express")}
                  variant="neon-pink"
                />
                <div>
                  <label className="text-sm font-medium">
                    Express (1-2 days)
                  </label>
                  <p className="text-xs text-muted-foreground">+$15.99</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-medium">
                Fastest
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Radio
                  checked={shippingSpeed === "standard"}
                  onCheckedChange={() => setShippingSpeed("standard")}
                  variant="neon-cyan"
                />
                <div>
                  <label className="text-sm font-medium">
                    Standard (3-5 days)
                  </label>
                  <p className="text-xs text-muted-foreground">Free</p>
                </div>
              </div>
              <span className="text-xs text-blue-400 font-medium">Popular</span>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Radio
                  checked={shippingSpeed === "economy"}
                  onCheckedChange={() => setShippingSpeed("economy")}
                  variant="neon-chartreuse"
                />
                <div>
                  <label className="text-sm font-medium">
                    Economy (5-7 days)
                  </label>
                  <p className="text-xs text-muted-foreground">Save $5.99</p>
                </div>
              </div>
              <span className="text-xs text-orange-400 font-medium">
                Cheapest
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Order Summary:
        </h4>
        <div className="p-3 border border-border rounded-lg space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Payment:</span>
            <span className="font-medium capitalize">
              {paymentMethod.replace("-", " ")}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Shipping:</span>
            <span className="font-medium capitalize">{shippingSpeed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
