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
        <div className="absolute inset-x-0 bottom-0 top-1/2 [perspective-origin:50%_0%] [perspective:220px] [mask-image:linear-gradient(to_bottom,transparent,#000_40%)]">
          <div
            className="absolute inset-x-[-50%] top-0 h-full origin-top overflow-hidden"
            style={{ transform: `rotateX(${angle}deg)` }}
          >
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-[calc(100%+var(--cell))] [background-size:var(--cell)_var(--cell)] [background-image:linear-gradient(to_right,rgb(var(--neon)/var(--line))_1px,transparent_0),linear-gradient(to_bottom,rgb(var(--neon)/var(--line))_1px,transparent_0)]",
                speed > 0 && "nk-retro-grid",
              )}
            />
          </div>
        </div>
        {horizon && (
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-[linear-gradient(to_right,transparent,rgb(var(--neon))_20%,rgb(var(--neon))_80%,transparent)] shadow-[0_0_14px_1px_rgb(var(--neon)/0.55),0_0_60px_6px_rgb(var(--neon)/0.3)]" />
        )}
      </div>
    );
  },
);
RetroGrid.displayName = "RetroGrid";

export { RetroGrid };
