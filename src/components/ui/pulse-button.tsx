"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Rings travel with outline-offset, so they grow by the same distance on every
// side and keep the button's corner radius (a scale would stretch a wide pill).
const css = `
@keyframes nk-pulse-button-ring{0%{outline-offset:0;opacity:.9}100%{outline-offset:var(--nk-pulse-button-reach);opacity:0}}
@keyframes nk-pulse-button-halo{0%,100%{opacity:.35}18%{opacity:1}}
.nk-pulse-button-ring{animation:nk-pulse-button-ring var(--nk-pulse-button-period) cubic-bezier(0.23,1,0.32,1) infinite both}
.nk-pulse-button-halo{animation:nk-pulse-button-halo var(--nk-pulse-button-period) ease-out infinite}
@media (prefers-reduced-motion:reduce){.nk-pulse-button-ring{animation:none;opacity:.45;outline-offset:3px}.nk-pulse-button-ring~.nk-pulse-button-ring{display:none}.nk-pulse-button-halo{animation:none;opacity:.6}}
`;

const variants = {
  solid:
    "bg-[rgb(var(--neon))] text-[#05060a] shadow-[0_0_0_1px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.45),inset_0_1px_0_rgb(255_255_255/0.45)] hover:shadow-[0_0_0_1px_rgb(var(--neon)),0_0_32px_rgb(var(--neon)/0.7),inset_0_1px_0_rgb(255_255_255/0.45)] hover:brightness-110",
  outline:
    "border border-[rgb(var(--neon)/0.7)] bg-[rgb(var(--neon)/0.06)] text-[rgb(var(--neon))] shadow-[0_0_12px_rgb(var(--neon)/0.25),inset_0_0_12px_rgb(var(--neon)/0.12)] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)] hover:border-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.12)] hover:shadow-[0_0_24px_rgb(var(--neon)/0.5),inset_0_0_16px_rgb(var(--neon)/0.2)]",
  soft: "bg-[rgb(var(--neon)/0.12)] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.2)]",
} as const;

const sizes = {
  sm: { root: "h-8 gap-1.5 rounded-md px-3 text-xs", reach: 10 },
  md: { root: "h-10 gap-2 rounded-lg px-4 text-sm", reach: 13 },
  lg: { root: "h-12 gap-2.5 rounded-xl px-6 text-base", reach: 16 },
  icon: { root: "size-10 rounded-full", reach: 13 },
} as const;

type AnyProps = Record<string, unknown>;
type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

// React 19 reads `ref` from props; React 18 keeps it on the element.
function getElementRef(element: React.ReactElement) {
  if (Number.parseInt(React.version, 10) >= 19) {
    return (element.props as { ref?: React.Ref<HTMLElement> }).ref;
  }
  return (element as unknown as { ref?: React.Ref<HTMLElement> }).ref;
}

/** Our props under the child's: handlers both run (child first), classes and styles merge. */
function mergeProps(ours: AnyProps, theirs: AnyProps): AnyProps {
  const merged: AnyProps = { ...ours, ...theirs };
  for (const key of Object.keys(ours)) {
    const a = ours[key];
    const b = theirs[key];
    if (/^on[A-Z]/.test(key) && typeof a === "function" && typeof b === "function") {
      merged[key] = (...args: unknown[]) => {
        (b as (...args: unknown[]) => void)(...args);
        (a as (...args: unknown[]) => void)(...args);
      };
    } else if (key === "className") {
      merged[key] = cn(a as string, b as string);
    } else if (key === "style") {
      merged[key] = { ...(a as object), ...(b as object) };
    }
  }
  return merged;
}

export interface PulseButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  /** `icon` is a round 40px button for a single glyph. */
  size?: keyof typeof sizes;
  /** Rings keep pulsing while true. Turn it off once the user has seen the thing. */
  pulse?: boolean;
  /** Seconds per pulse. */
  period?: number;
  /** Rings in flight at once, staggered across the period. */
  rings?: 1 | 2 | 3;
  /** Render the child element (e.g. a link) with the pulse. */
  asChild?: boolean;
}

const PulseButton = React.forwardRef<HTMLButtonElement, PulseButtonProps>(
  (
    {
      className,
      style,
      color,
      variant = "solid",
      size = "md",
      pulse = true,
      period = 2.2,
      rings = 2,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const s = sizes[size];
    const child = asChild && React.isValidElement<AnyProps>(children) ? children : null;
    const childRef = child ? getElementRef(child) : undefined;
    const composedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        setRef(ref, node);
        setRef(childRef as PossibleRef<HTMLButtonElement>, node);
      },
      [ref, childRef],
    );
    const active = pulse && !disabled;

    // Rings stay mounted: switching pulse off freezes them where they are and fades them out.
    const decorate = (label: React.ReactNode) => (
      <>
        <style>{css}</style>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 ease-out",
            active ? "opacity-100" : "opacity-0",
            !active && "[&>span]:[animation-play-state:paused]",
          )}
        >
          <span className="nk-pulse-button-halo absolute inset-0 rounded-[inherit] shadow-[0_0_22px_1px_rgb(var(--neon)/0.45)]" />
          {Array.from({ length: rings }, (_, i) => (
            <span
              key={i}
              style={{ animationDelay: `${(-period * i) / rings}s` }}
              className="nk-pulse-button-ring absolute inset-0 rounded-[inherit] [outline:1.5px_solid_rgb(var(--neon)/0.75)]"
            />
          ))}
        </span>
        {label}
      </>
    );

    const rootProps: AnyProps = {
      style: neonVars(color, {
        "--nk-pulse-button-period": `${period}s`,
        "--nk-pulse-button-reach": `${s.reach}px`,
        ...style,
      } as React.CSSProperties),
      "data-pulse": active ? "" : undefined,
      className: cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        "relative isolate inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none",
        "transition-[background-color,border-color,color,box-shadow,filter,transform,scale] duration-200 ease-out active:scale-[0.97]",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        s.root,
        variants[variant],
        className,
      ),
      ...props,
    };

    if (child) {
      return React.cloneElement(
        child,
        {
          ...mergeProps(rootProps, child.props),
          ...(disabled && { "aria-disabled": true, tabIndex: -1 }),
          ref: composedRef,
        } as AnyProps,
        decorate(child.props.children as React.ReactNode),
      );
    }

    return (
      <button ref={ref} disabled={disabled} {...(rootProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {decorate(children)}
      </button>
    );
  },
);
PulseButton.displayName = "PulseButton";

export { PulseButton };
