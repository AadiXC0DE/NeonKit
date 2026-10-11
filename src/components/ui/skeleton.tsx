import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The band is a fixed 96px wide, so a 40px avatar gets a soft wash and a
// 400px row a narrow sweep. Its layer overhangs 48px on each side, so a
// ±50% translate carries the band fully in and out without clipping it.
const keyframes = `
@keyframes nk-skeleton-shimmer { 0% { transform: translateX(-50%); } 70%, 100% { transform: translateX(50%); } }
`;

const band = [
  "linear-gradient(100deg, transparent calc(50% - 28px), rgb(var(--neon) / 0.08) 50%, transparent calc(50% + 28px))",
  "linear-gradient(100deg, transparent calc(50% - 48px), rgb(255 255 255 / 0.05) 50%, transparent calc(50% + 48px))",
].join(", ");

const variants = {
  rect: "rounded-md",
  circle: "aspect-square rounded-full",
  text: "h-3 rounded-full",
} as const;

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Tints the shimmer. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** `text` is a 12px pill, `circle` keeps a square aspect ratio. */
  variant?: keyof typeof variants;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, style, color, variant = "rect", children, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      style={neonVars(color, style)}
      className={cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        "relative isolate overflow-hidden bg-white/[0.06]",
        variants[variant],
        className,
      )}
      {...props}
    >
      <style>{keyframes}</style>
      <span
        style={{ backgroundImage: band }}
        className="pointer-events-none absolute inset-y-0 -inset-x-12 -z-10 [animation:nk-skeleton-shimmer_2.4s_ease-in-out_infinite] motion-reduce:hidden"
      />
      {children}
    </div>
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
