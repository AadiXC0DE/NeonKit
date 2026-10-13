import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Orientation = "horizontal" | "vertical";
type Variant = "hairline" | "tube" | "dashed";

const lines = {
  hairline: {
    horizontal: "h-px bg-white/10",
    vertical: "w-px bg-white/10",
  },
  // A gradient instead of border-dashed, so the dashes are the same 4px on/off in every browser.
  dashed: {
    horizontal: "h-px bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.18)_0_4px,transparent_4px_8px)]",
    vertical: "w-px bg-[repeating-linear-gradient(180deg,rgb(255_255_255/0.18)_0_4px,transparent_4px_8px)]",
  },
} as const;

// The electrode housings at each end of a mounted tube. A little of the tube's
// light spills onto the face of each cap that points at the glass.
const caps = {
  horizontal: {
    base: "h-1.5 w-[5px] rounded-[1.5px] bg-[linear-gradient(180deg,#4a4e5a,#1d1f26)]",
    start: "shadow-[inset_0_1px_0_rgb(255_255_255/0.18),3px_0_6px_-2px_rgb(var(--neon)/0.7)]",
    end: "shadow-[inset_0_1px_0_rgb(255_255_255/0.18),-3px_0_6px_-2px_rgb(var(--neon)/0.7)]",
  },
  vertical: {
    base: "h-[5px] w-1.5 rounded-[1.5px] bg-[linear-gradient(90deg,#4a4e5a,#1d1f26)]",
    start: "shadow-[inset_1px_0_0_rgb(255_255_255/0.18),0_3px_6px_-2px_rgb(var(--neon)/0.7)]",
    end: "shadow-[inset_1px_0_0_rgb(255_255_255/0.18),0_-3px_6px_-2px_rgb(var(--neon)/0.7)]",
  },
} as const;

const glass = {
  horizontal: "h-0.5 min-w-2",
  vertical: "w-0.5 min-h-2",
} as const;

export interface SeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color for the tube. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  orientation?: Orientation;
  variant?: Variant;
  /** Text centered in the line. The line breaks around it. */
  label?: React.ReactNode;
  /**
   * Purely visual (the default): hidden from assistive tech, though a label is still read as text.
   * Set false when it separates real sections, to expose `role="separator"`.
   */
  decorative?: boolean;
}

function Tube({ orientation }: { orientation: Orientation }) {
  const c = caps[orientation];
  return (
    <span
      aria-hidden
      className={cn(
        "flex min-h-0 min-w-0 flex-1 items-center",
        orientation === "vertical" && "flex-col",
      )}
    >
      <span className={cn("shrink-0", c.base, c.start)} />
      <span
        className={cn(
          "flex-1 rounded-full bg-[rgb(var(--neon))]",
          "shadow-[0_0_2px_rgb(var(--neon)),0_0_8px_rgb(var(--neon)/0.55),0_0_18px_rgb(var(--neon)/0.22)]",
          glass[orientation],
        )}
      />
      <span className={cn("shrink-0", c.base, c.end)} />
    </span>
  );
}

function Line({ orientation, variant }: { orientation: Orientation; variant: Variant }) {
  if (variant === "tube") return <Tube orientation={orientation} />;
  return (
    <span
      aria-hidden
      className={cn("min-h-0 min-w-0 flex-1", lines[variant][orientation])}
    />
  );
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      style,
      color,
      orientation = "horizontal",
      variant = "hairline",
      label,
      decorative = true,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    const vertical = orientation === "vertical";
    const hasLabel = label != null && label !== false;

    const semantics = decorative
      ? { role: "none" as const }
      : {
          role: "separator" as const,
          "aria-orientation": orientation,
          "aria-labelledby": hasLabel ? labelId : undefined,
        };

    const base = cn(
      "[--neon:var(--neon-accent,34_211_238)]",
      "shrink-0",
      // In a flex row a vertical separator stretches to the row's height.
      vertical ? "self-stretch" : "w-full",
    );

    // A plain line is a single element, so className can restyle it directly.
    if (!hasLabel && variant !== "tube") {
      return (
        <div
          ref={ref}
          data-orientation={orientation}
          data-variant={variant}
          style={neonVars(color, style)}
          className={cn(base, lines[variant][orientation], className)}
          {...semantics}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        data-orientation={orientation}
        data-variant={variant}
        style={neonVars(color, style)}
        className={cn(
          base,
          "flex items-center",
          vertical && "flex-col",
          hasLabel && (variant === "tube" ? "gap-2.5" : "gap-3"),
          className,
        )}
        {...semantics}
        {...props}
      >
        <Line orientation={orientation} variant={variant} />
        {hasLabel && (
          <>
            <span
              id={labelId}
              className={cn(
                "shrink-0 text-xs leading-4",
                variant === "tube"
                  ? "font-medium text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.55)]"
                  : "text-white/50",
              )}
            >
              {label}
            </span>
            <Line orientation={orientation} variant={variant} />
          </>
        )}
      </div>
    );
  },
);
Separator.displayName = "Separator";

export { Separator };
