"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { LoaderCircle } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type RenderProp = { asChild?: boolean; render?: React.ReactElement; nativeButton?: boolean; children?: React.ReactNode };

/**
 * Base UI spells asChild as `render={<Link />}` plus `nativeButton`, and the shadcn CLI rewrites
 * asChild into that form in base-* projects. Folds it back into asChild and children.
 */
function fromRenderProp<P extends RenderProp>({ render, nativeButton, ...props }: P): Omit<P, "render" | "nativeButton"> {
  void nativeButton; // Only meaningful to Base UI.
  if (!render) return props;
  const children = props.children === undefined ? render : React.cloneElement(render, undefined, props.children);
  return { ...props, asChild: true, children };
}

const variants = {
  solid:
    "bg-[rgb(var(--neon))] text-[#05060a] shadow-[0_0_0_1px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)] hover:shadow-[0_0_0_1px_rgb(var(--neon)),0_0_32px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)] hover:brightness-110",
  // At rest the tube is drawn but barely lit; hover strikes it.
  outline:
    "border border-[rgb(var(--neon)/0.6)] bg-[rgb(var(--neon)/0.05)] text-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.14*var(--neon-glow,1))),inset_0_0_10px_rgb(var(--neon)/CALC(0.08*var(--neon-glow,1)))] hover:border-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.12)] hover:shadow-[0_0_24px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))),inset_0_0_16px_rgb(var(--neon)/CALC(0.2*var(--neon-glow,1)))] hover:[text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]",
  soft:
    "bg-[rgb(var(--neon)/0.12)] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.2)]",
  ghost:
    "text-white/70 hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))]",
  link: "h-auto px-0 text-[rgb(var(--neon))] underline-offset-4 hover:underline hover:[text-shadow:0_0_12px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1)))]",
} as const;

const spinnerColors = {
  solid: "text-[#05060a]",
  outline: "text-[rgb(var(--neon))]",
  soft: "text-[rgb(var(--neon))]",
  ghost: "text-white/70",
  link: "text-[rgb(var(--neon))]",
} as const;

const sizes = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-6 text-base",
  icon: "size-10 rounded-lg",
  "icon-sm": "size-8 rounded-md",
  "icon-lg": "size-12 rounded-xl [&_svg]:size-5",
} as const;

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Swaps the label for a spinner without changing the width, and ignores presses. The button stays focusable, so keyboard focus isn't dropped. */
  loading?: boolean;
  /** Render the child element (e.g. a link) with button styles. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (raw, ref) => {
    const {
      className,
      style,
      color,
      variant = "outline",
      size = "md",
      loading = false,
      asChild = false,
      disabled,
      children,
      onClick,
      ...props
    } = fromRenderProp(raw);
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        style={neonVars(color, style)}
        disabled={disabled}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        data-loading={loading ? "" : undefined}
        onClick={(event) => {
          // Also stops a loading submit button from sending its form again.
          if (loading) return event.preventDefault();
          onClick?.(event);
        }}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none",
          "transition-[background-color,border-color,color,box-shadow,filter,transform] duration-200 ease-out active:scale-[0.97]",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          "disabled:pointer-events-none disabled:opacity-50",
          // Loading keeps full color: it's working, not unavailable.
          loading ? "cursor-progress active:scale-100" : "aria-disabled:cursor-default aria-disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          sizes[size],
          variants[variant],
          className,
          // The label stays in place but unseen, so the width holds and the name is still read.
          loading &&
            "text-transparent hover:text-transparent [text-shadow:none] hover:[text-shadow:none] [&>:not([data-button-spinner])]:opacity-0",
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {children}
            {loading && (
              <span
                data-button-spinner=""
                aria-hidden
                className={cn("absolute inset-0 grid place-items-center", spinnerColors[variant])}
              >
                <LoaderCircle className="animate-spin" />
              </span>
            )}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button };
