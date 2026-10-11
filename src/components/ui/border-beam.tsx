"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// @property lets the browser interpolate the angle, so the conic gradient
// can rotate without rotating (and clipping) a real element.
const css = `
@property --nk-beam-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@keyframes nk-beam { to { --nk-beam-angle: 360deg; } }
.nk-beam {
  background: conic-gradient(from var(--nk-beam-angle), transparent 0deg, transparent calc(360deg - var(--nk-beam-size)), rgb(var(--nk-beam-to) / 0.9), rgb(var(--neon)) 360deg);
  animation: nk-beam var(--nk-beam-duration) linear infinite;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
@media (prefers-reduced-motion: reduce) { .nk-beam { animation: none; --nk-beam-angle: 135deg; } }
`;

export interface BorderBeamProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Head of the beam. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Tail of the beam. Defaults to the head color. */
  colorTo?: NeonColor;
  /** Seconds per lap. */
  duration?: number;
  /** Beam length, in degrees of the lap. */
  size?: number;
  /** Border thickness in pixels. */
  borderWidth?: number;
  /** Run counter-clockwise. */
  reverse?: boolean;
}

const BorderBeam = React.forwardRef<HTMLDivElement, BorderBeamProps>(
  (
    {
      className,
      style,
      color,
      colorTo,
      duration = 6,
      size = 90,
      borderWidth = 1,
      reverse = false,
      children,
      ...props
    },
    ref,
  ) => {
    const beamStyle = {
      "--nk-beam-to": colorTo ? toNeonRgb(colorTo) : "var(--neon)",
      "--nk-beam-size": `${size}deg`,
      "--nk-beam-duration": `${duration}s`,
      padding: borderWidth,
      animationDirection: reverse ? "reverse" : undefined,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative rounded-2xl",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {children}
        <span
          aria-hidden
          style={beamStyle}
          className="nk-beam pointer-events-none absolute inset-0 rounded-[inherit]"
        />
        <span
          aria-hidden
          style={{ ...beamStyle, padding: borderWidth + 2 }}
          className="nk-beam pointer-events-none absolute -inset-0.5 rounded-[inherit] opacity-60 blur-[6px]"
        />
      </div>
    );
  },
);
BorderBeam.displayName = "BorderBeam";

export { BorderBeam };
