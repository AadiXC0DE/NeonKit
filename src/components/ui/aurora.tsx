"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// Three curtains: where each sits, how its arc bends, and how fast it moves.
// Durations are deliberately unrelated so the layers never line up again.
const bands = [
  { top: "-12%", height: "96%", rotate: -9, arc: "ellipse 78% 96% at 36% 112%", drift: 29, rays: 21, delay: -7, alpha: 0.95 },
  { top: "-22%", height: "92%", rotate: 8, arc: "ellipse 58% 100% at 66% 118%", drift: 37, rays: 26, delay: -19, alpha: 0.75 },
  { top: "-2%", height: "74%", rotate: -3, arc: "ellipse 96% 86% at 52% 128%", drift: 43, rays: 33, delay: -31, alpha: 0.6 },
];

// Every layer moves by transform or opacity only, with literal keyframe values,
// so the compositor runs it all and nothing repaints. The rays slide inside a
// fixed arc mask: that sliding is what reads as curtains rippling.
const css = `
${bands
  .map(
    (band, i) => `@keyframes nk-aurora-drift-${i} {
  0% { transform: translate3d(-4%, 0, 0) rotate(${band.rotate}deg) scale(1, 1); }
  50% { transform: translate3d(2%, -3%, 0) rotate(${band.rotate + 2}deg) scale(1.05, 1.14); }
  100% { transform: translate3d(5%, 1%, 0) rotate(${band.rotate - 1.5}deg) scale(0.97, 0.92); }
}
.nk-aurora-band-${i} { animation: nk-aurora-drift-${i} var(--nk-d) ease-in-out var(--nk-delay) infinite alternate; }`,
  )
  .join("\n")}
@keyframes nk-aurora-rays {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-30%, 0, 0); }
}
@keyframes nk-aurora-breathe {
  from { opacity: 0.55; }
  to { opacity: 1; }
}
.nk-aurora-rays { animation: nk-aurora-rays var(--nk-rd) ease-in-out var(--nk-delay) infinite alternate; }
.nk-aurora-glow { animation: nk-aurora-breathe var(--nk-d) ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) {
  .nk-aurora-band-0, .nk-aurora-band-1, .nk-aurora-band-2, .nk-aurora-rays, .nk-aurora-glow { animation: none; }
}
`;

// Default tints, all derived from --neon so one variable drives the sky:
// the color itself, a cooler violet fringe, and a pale core.
const defaultTints = [
  "rgb(var(--neon))",
  "color-mix(in oklab, rgb(var(--neon)) 50%, rgb(124 92 255))",
  "color-mix(in oklab, rgb(var(--neon)) 78%, white)",
];

// The upper edge of real curtains shifts toward red and violet.
const fringe = "color-mix(in oklab, rgb(var(--neon)) 35%, rgb(190 70 255))";

const mask = (arc: string) =>
  [
    `radial-gradient(${arc}, transparent 55%, #000 58.5%, rgb(0 0 0 / 0.5) 70%, transparent 92%)`,
    "linear-gradient(90deg, transparent 2%, #000 20%, rgb(0 0 0 / 0.45) 44%, #000 66%, transparent 96%)",
    "linear-gradient(to top, transparent, #000 14%, #000 72%, transparent)",
  ].join(", ");

const rayImage = [
  "repeating-linear-gradient(90deg, transparent 0px, var(--nk-c) 14px, transparent 31px, transparent 50px, color-mix(in srgb, var(--nk-c) 55%, transparent) 61px, transparent 77px, transparent 97px)",
  "repeating-linear-gradient(90deg, transparent 0px, color-mix(in srgb, var(--nk-c) 45%, transparent) 8px, transparent 18px, transparent 41px)",
  "linear-gradient(90deg, color-mix(in srgb, var(--nk-c) 22%, transparent), color-mix(in srgb, var(--nk-c) 30%, transparent))",
].join(", ");

export interface AuroraProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Main curtain color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Up to three curtain colors, front to back. Overrides the tints derived from `color`. */
  colors?: NeonColor[];
  /** Speed multiplier. 1 is a slow drift, 0 holds still. */
  speed?: number;
  /** Overall strength of the light, 0 to 1. */
  opacity?: number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Aurora = React.forwardRef<HTMLDivElement, AuroraProps>(
  ({ className, style, color, colors, speed = 1, opacity = 0.85, ...props }, ref) => {
    const still = speed <= 0;
    const tints = bands.map((_, i) =>
      colors?.[i] ? `rgb(${toNeonRgb(colors[i])})` : defaultTints[i],
    );

    return (
      <div
        ref={ref}
        aria-hidden
        style={neonVars(color, { opacity, ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "pointer-events-none absolute inset-0 isolate overflow-hidden",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {/* Light the curtains throw back onto the lower sky. */}
        <div
          className={cn("absolute inset-x-0 bottom-0 h-3/4", !still && "nk-aurora-glow")}
          style={{
            "--nk-d": `${12 / Math.max(speed, 0.01)}s`,
            background: `radial-gradient(ellipse 70% 60% at 50% 100%, color-mix(in srgb, ${tints[0]} 16%, transparent), transparent 70%)`,
          } as React.CSSProperties}
        />
        {bands.map((band, i) => (
          <div
            key={i}
            className={cn("absolute -left-1/4 w-[150%] [mix-blend-mode:screen]", !still && `nk-aurora-band-${i}`)}
            style={{
              "--nk-c": tints[i],
              "--nk-d": `${band.drift / Math.max(speed, 0.01)}s`,
              "--nk-rd": `${band.rays / Math.max(speed, 0.01)}s`,
              "--nk-delay": `${band.delay}s`,
              top: band.top,
              height: band.height,
              opacity: band.alpha,
              transform: `rotate(${band.rotate}deg)`,
              backgroundImage: [
                // A brighter seam along the lower edge, where real curtains glow hardest.
                `radial-gradient(${band.arc}, transparent 55.5%, color-mix(in srgb, color-mix(in srgb, ${tints[i]} 55%, white) 40%, transparent) 58.5%, transparent 64%)`,
                `linear-gradient(to top, transparent 35%, color-mix(in srgb, ${colors?.[i] ? tints[i] : fringe} 30%, transparent))`,
              ].join(", "),
              maskImage: mask(band.arc),
              WebkitMaskImage: mask(band.arc),
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            } as React.CSSProperties}
          >
            <div
              className={cn("absolute inset-y-0 left-0 w-[145%]", !still && "nk-aurora-rays")}
              style={{ backgroundImage: rayImage }}
            />
          </div>
        ))}
      </div>
    );
  },
);
Aurora.displayName = "Aurora";

export { Aurora };
