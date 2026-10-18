import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const variants = {
  default: "border-white/10 bg-white/[0.03]",
  glow: "border-[rgb(var(--neon)/0.4)] bg-[rgb(var(--neon)/0.035)] shadow-[0_0_32px_-8px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1))),inset_0_0_24px_rgb(var(--neon)/CALC(0.05*var(--neon-glow,1)))]",
  outline: "border-white/[0.12] bg-transparent",
} as const;

const interactiveVariants = {
  default:
    "hover:border-white/[0.16] hover:bg-white/[0.045] hover:shadow-[0_16px_40px_-20px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
  glow: "hover:border-[rgb(var(--neon)/0.6)] hover:shadow-[0_0_48px_-6px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),inset_0_0_28px_rgb(var(--neon)/CALC(0.08*var(--neon-glow,1)))]",
  outline: "hover:border-[rgb(var(--neon)/0.35)]",
} as const;

// The lit edge: a 1px line on the top border that fades out toward the corners.
const edges = {
  default: "bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.5)_50%,transparent)] opacity-70",
  glow: "bg-[linear-gradient(90deg,transparent,rgb(var(--neon))_50%,transparent)] opacity-80",
  outline: null,
} as const;

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  /** Lifts the card and brightens its light on hover. Pair with a link or button inside. */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, style, color, variant = "default", interactive = false, children, ...props }, ref) => {
    const edge = edges[variant];

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "group/card relative flex flex-col rounded-xl border text-white/90",
          variants[variant],
          interactive && [
            "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[rgb(var(--neon)/0.6)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#05060a]",
            interactiveVariants[variant],
          ],
          className,
        )}
        {...props}
      >
        {edge && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -top-px h-px",
              edge,
              interactive && "transition-opacity duration-300 group-hover/card:opacity-100",
            )}
          />
        )}
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-tight tracking-[-0.01em] text-white/90", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm leading-relaxed text-white/55", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-auto flex items-center gap-2 p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
