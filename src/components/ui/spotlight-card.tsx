"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export interface SpotlightCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Diameter of the light in pixels. */
  radius?: number;
}

const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    { className, style, color, radius = 360, children, onPointerMove, ...props },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

    // Write the pointer position straight to CSS variables: no re-renders.
    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--x", `${event.clientX - rect.left}px`);
      node.style.setProperty("--y", `${event.clientY - rect.top}px`);
    };

    return (
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        style={neonVars(color, { "--r": `${radius / 2}px`, ...style } as React.CSSProperties)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)] [--x:50%] [--y:50%]",
          "group/spotlight relative isolate overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]",
          className,
        )}
        {...props}
      >
        {/* Light on the surface */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100 group-focus-within/spotlight:opacity-100 [background:radial-gradient(var(--r)_circle_at_var(--x)_var(--y),rgb(var(--neon)/CALC(0.12*var(--neon-glow,1))),transparent_70%)]"
        />
        {/* Light caught by the border */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100 group-focus-within/spotlight:opacity-100 [background:radial-gradient(calc(var(--r)*0.75)_circle_at_var(--x)_var(--y),rgb(var(--neon)/var(--neon-glow,1)),transparent_70%)] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
        />
        {children}
      </div>
    );
  },
);
SpotlightCard.displayName = "SpotlightCard";

export { SpotlightCard };
