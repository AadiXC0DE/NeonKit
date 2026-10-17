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
    const tilt = Math.min(88, Math.max(20, angle));
    const tan = Math.tan((tilt * Math.PI) / 180).toFixed(4);
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
          <div className="absolute inset-x-0 bottom-1/2 h-1/2 bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgb(var(--neon)/CALC(0.16*var(--neon-glow,1))),rgb(var(--neon)/CALC(0.05*var(--neon-glow,1)))_45%,transparent_75%)]" />
        )}
        {/* The floor is a long plane tipped away from the viewer, so its rows really recede. A plane's vanishing
            line sits perspective × cot(angle) above the perspective origin, so with the origin on the floor's
            bottom edge and perspective = floor height × tan(angle), the horizon lands on the glowing line at
            any size. Container units carry the floor height into CSS. */}
        <div className="absolute inset-x-0 bottom-0 top-1/2 [container-type:size] [mask-image:linear-gradient(to_bottom,transparent_6%,rgb(0_0_0/0.4)_30%,#000_66%)]">
          <div
            className="absolute inset-0 [perspective-origin:50%_100%]"
            style={{ perspective: `calc(100cqh * ${tan})` }}
          >
            <div
              className="absolute inset-x-[-250%] bottom-0 h-[3000cqh] origin-bottom overflow-hidden"
              // Pulled toward the viewer by half the perspective, so the nearest squares draw at twice cellSize.
              // The bottom edge sits on the perspective origin, so it stays on the floor's bottom edge.
              style={{ transform: `translateZ(calc(50cqh * ${tan})) rotateX(${tilt}deg)` }}
            >
            {/* Each line is a hot core with a soft falloff either side, painted into the tile */}
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-[calc(100%+var(--cell))] [background-position:50%_0] [background-size:var(--cell)_var(--cell)]",
                "[background-image:linear-gradient(to_right,color-mix(in_srgb,rgb(var(--neon)/var(--line))_70%,rgb(255_255_255/var(--line)))_1px,transparent_0),linear-gradient(to_bottom,color-mix(in_srgb,rgb(var(--neon)/var(--line))_70%,rgb(255_255_255/var(--line)))_1px,transparent_0),linear-gradient(to_right,rgb(var(--neon)/calc(var(--line)*0.35)),transparent_4px,transparent_calc(100%_-_4px),rgb(var(--neon)/calc(var(--line)*0.35))),linear-gradient(to_bottom,rgb(var(--neon)/calc(var(--line)*0.35)),transparent_4px,transparent_calc(100%_-_4px),rgb(var(--neon)/calc(var(--line)*0.35)))]",
                speed > 0 && "nk-retro-grid",
              )}
            />
            </div>
          </div>
          {/* Haze on the floor where it meets the horizon */}
          <div className="absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(to_bottom,rgb(var(--neon)/0.1),transparent)]" />
        </div>
        {horizon && (
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,rgb(var(--neon))_60%,white)_20%,color-mix(in_srgb,rgb(var(--neon))_60%,white)_80%,transparent)] shadow-[0_0_4px_rgb(var(--neon)/var(--neon-glow,1)),0_0_14px_1px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),0_0_60px_6px_rgb(var(--neon)/CALC(0.3*var(--neon-glow,1)))]" />
        )}
      </div>
    );
  },
);
RetroGrid.displayName = "RetroGrid";

export { RetroGrid };
