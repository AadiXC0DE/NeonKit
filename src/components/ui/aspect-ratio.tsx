import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Corner = "top-left" | "top-right" | "bottom-right" | "bottom-left";

// The tick sits on the hairline itself (-1px), follows the corner's curve, and fades along both arms.
const ticks: Record<Corner, string> = {
  "top-left": "-left-px -top-px rounded-tl-[inherit] border-l-[1.5px] border-t-[1.5px] [mask-image:radial-gradient(circle_at_0_0,#000_45%,transparent_75%)]",
  "top-right": "-right-px -top-px rounded-tr-[inherit] border-r-[1.5px] border-t-[1.5px] [mask-image:radial-gradient(circle_at_100%_0,#000_45%,transparent_75%)]",
  "bottom-right": "-bottom-px -right-px rounded-br-[inherit] border-b-[1.5px] border-r-[1.5px] [mask-image:radial-gradient(circle_at_100%_100%,#000_45%,transparent_75%)]",
  "bottom-left": "-bottom-px -left-px rounded-bl-[inherit] border-b-[1.5px] border-l-[1.5px] [mask-image:radial-gradient(circle_at_0_100%,#000_45%,transparent_75%)]",
};

function toRatio(ratio: number | string) {
  if (typeof ratio === "number") return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  const [w, h] = ratio.split(/[/:]/).map((part) => Number.parseFloat(part));
  return w > 0 && h > 0 ? w / h : 1;
}

export interface AspectRatioProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Width over height: `16 / 9`, `1`, or a string like `"4:3"` or `"21/9"`. */
  ratio?: number | string;
  /** Draws a hairline around the box with a lit tick on one corner. `true` puts it top left. */
  frame?: boolean | Corner;
  /** Palette name or hex for the tick. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

/** Holds its children at a fixed shape. They fill it, so give media `h-full w-full object-cover`. */
const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, frame = false, color, className, style, children, ...props }, ref) => {
    const corner: Corner | null = frame === true ? "top-left" : frame || null;
    return (
      <div
        ref={ref}
        data-ratio={toRatio(ratio).toFixed(4)}
        style={neonVars(color, { aspectRatio: String(toRatio(ratio)), ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative w-full",
          corner && "rounded-xl border border-white/10",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">{children}</div>
        {corner && (
          <span
            aria-hidden
            data-corner={corner}
            className={cn(
              "pointer-events-none absolute size-10 border-[rgb(var(--neon))]",
              "[filter:drop-shadow(0_0_2px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))))_drop-shadow(0_0_8px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))))]",
              ticks[corner],
            )}
          />
        )}
      </div>
    );
  },
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
