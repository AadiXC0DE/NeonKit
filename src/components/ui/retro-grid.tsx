"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const css = `
@keyframes nk-retro-grid { from { transform: translateY(calc(var(--cell) * -1)); } to { transform: translateY(0); } }
.nk-retro-grid { animation: nk-retro-grid var(--speed) linear infinite; }
@media (prefers-reduced-motion: reduce) { .nk-retro-grid { animation: none; } }
`;

export interface RetroGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Line color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Tilt of the floor in degrees. */
  angle?: number;
  /** Size of one grid square in pixels. */
  cellSize?: number;
  /** Seconds for the floor to travel one cell. 0 stops it. */
  speed?: number;
  /** Line opacity, 0 to 1. */
  opacity?: number;
  /** Glowing line where the floor meets the sky. */
  horizon?: boolean;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const RetroGrid = React.forwardRef<HTMLDivElement, RetroGridProps>(
  (
    {
      className,
      style,
      color,
      angle = 70,
      cellSize = 56,
      speed = 1.2,
      opacity = 0.55,
      horizon = true,
      ...props
    },
    ref,
  ) => {
    const vars = {
      "--cell": `${cellSize}px`,
      "--speed": `${speed}s`,
      "--line": `${opacity}`,
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        aria-hidden
        style={neonVars(color, vars)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {/* Sky glow: the horizon's light falling off upward */}
        {horizon && (
          <div className="absolute inset-x-0 bottom-1/2 h-1/2 bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgb(var(--neon)/0.16),rgb(var(--neon)/0.05)_45%,transparent_75%)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 top-1/2 [perspective-origin:50%_0%] [perspective:220px] [mask-image:linear-gradient(to_bottom,transparent,#000_40%)]">
          <div
            className="absolute inset-x-[-50%] top-0 h-full origin-top overflow-hidden"
            style={{ transform: `rotateX(${angle}deg)` }}
          >
            {/* Each line is a hot core with a soft falloff either side, painted into the tile */}
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-[calc(100%+var(--cell))] [background-size:var(--cell)_var(--cell)]",
                "[background-image:linear-gradient(to_right,color-mix(in_srgb,rgb(var(--neon)/var(--line))_70%,rgb(255_255_255/var(--line)))_1px,transparent_0),linear-gradient(to_bottom,color-mix(in_srgb,rgb(var(--neon)/var(--line))_70%,rgb(255_255_255/var(--line)))_1px,transparent_0),linear-gradient(to_right,rgb(var(--neon)/calc(var(--line)*0.35)),transparent_4px,transparent_calc(100%_-_4px),rgb(var(--neon)/calc(var(--line)*0.35))),linear-gradient(to_bottom,rgb(var(--neon)/calc(var(--line)*0.35)),transparent_4px,transparent_calc(100%_-_4px),rgb(var(--neon)/calc(var(--line)*0.35)))]",
                speed > 0 && "nk-retro-grid",
              )}
            />
          </div>
          {/* Haze on the floor where it meets the horizon */}
          <div className="absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(to_bottom,rgb(var(--neon)/0.1),transparent)]" />
        </div>
        {horizon && (
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,rgb(var(--neon))_60%,white)_20%,color-mix(in_srgb,rgb(var(--neon))_60%,white)_80%,transparent)] shadow-[0_0_4px_rgb(var(--neon)),0_0_14px_1px_rgb(var(--neon)/0.55),0_0_60px_6px_rgb(var(--neon)/0.3)]" />
        )}
      </div>
    );
  },
);
RetroGrid.displayName = "RetroGrid";

export { RetroGrid };
