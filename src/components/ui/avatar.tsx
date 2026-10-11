"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const sizes = {
  sm: { root: "size-7 text-[11px]", square: "rounded-md", dot: "size-2 bottom-0 right-0", overlap: "[&>*+*]:-ml-1.5" },
  md: { root: "size-9 text-[13px]", square: "rounded-lg", dot: "size-2.5 bottom-0 right-0", overlap: "[&>*+*]:-ml-2" },
  lg: { root: "size-12 text-base", square: "rounded-xl", dot: "size-3 bottom-px right-px", overlap: "[&>*+*]:-ml-3" },
  xl: { root: "size-16 text-xl", square: "rounded-2xl", dot: "size-3.5 bottom-0.5 right-0.5", overlap: "[&>*+*]:-ml-4" },
} as const;

// The 2px #05060a ring cuts the light out of the avatar edge.
const statuses = {
  online: "bg-[rgb(52_211_153)] shadow-[0_0_0_2px_#05060a,0_0_8px_2px_rgb(52_211_153/0.45)]",
  away: "bg-[rgb(251_191_36)] shadow-[0_0_0_2px_#05060a,0_0_8px_2px_rgb(251_191_36/0.4)]",
  busy: "bg-[rgb(255_77_94)] shadow-[0_0_0_2px_#05060a,0_0_8px_2px_rgb(255_77_94/0.45)]",
  offline: "bg-[#05060a] shadow-[0_0_0_2px_#05060a,inset_0_0_0_2px_rgb(255_255_255/0.3)]",
} as const;

type AvatarSize = keyof typeof sizes;
type AvatarShape = "circle" | "square";
type AvatarStatus = keyof typeof statuses;

const AvatarGroupContext = React.createContext<{ size: AvatarSize; shape: AvatarShape } | null>(null);

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return (first + last).toUpperCase();
}

function useImageStatus(src?: string) {
  const [result, setResult] = React.useState<{ src: string; status: "loaded" | "error" } | null>(null);

  React.useEffect(() => {
    if (!src) return;
    let active = true;
    const image = new window.Image();
    image.onload = () => {
      if (active) setResult({ src, status: "loaded" });
    };
    image.onerror = () => {
      if (active) setResult({ src, status: "error" });
    };
    image.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  if (!src) return "error";
  return result?.src === src ? result.status : "loading";
}

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Palette name or any hex color. Tints the fallback and the ring. */
  color?: NeonColor;
  src?: string;
  /** The person's name. Read by screen readers and used for the initials. Pass "" when decorative. */
  alt: string;
  /** Shown instead of the initials while the image loads or when it fails. */
  fallback?: React.ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Neon ring with a glow, separated from the avatar by a thin gap. */
  ring?: boolean;
  status?: AvatarStatus;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    { className, style, color, src, alt, fallback, size: sizeProp, shape: shapeProp, ring = false, status, ...props },
    ref,
  ) => {
    const group = React.useContext(AvatarGroupContext);
    const size = sizeProp ?? group?.size ?? "md";
    const shape = shapeProp ?? group?.shape ?? "circle";
    const s = sizes[size];
    const radius = shape === "circle" ? "rounded-full" : s.square;
    const imageStatus = useImageStatus(src);
    const loaded = imageStatus === "loaded";

    return (
      <span
        ref={ref}
        role={alt ? "img" : undefined}
        aria-label={alt ? (status ? `${alt} (${status})` : alt) : undefined}
        aria-hidden={alt ? undefined : true}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-flex shrink-0 select-none align-middle font-medium leading-none",
          s.root,
          radius,
          ring
            ? "shadow-[0_0_0_2px_#05060a,0_0_0_3px_rgb(var(--neon)),0_0_14px_3px_rgb(var(--neon)/0.4)]"
            : group && "shadow-[0_0_0_2px_#05060a]",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 flex items-center justify-center overflow-hidden",
            "bg-[#0b0c12] bg-[linear-gradient(rgb(var(--neon)/0.12),rgb(var(--neon)/0.12))] text-[rgb(var(--neon))] [&_svg]:size-1/2",
            radius,
          )}
        >
          <span
            className={cn(
              "flex items-center justify-center transition-opacity duration-200 ease-out motion-reduce:transition-none",
              loaded && "opacity-0",
            )}
          >
            {fallback ?? getInitials(alt)}
          </span>
          {src && imageStatus !== "error" && (
            <span
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-opacity duration-300 ease-out motion-reduce:transition-none",
                loaded ? "opacity-100" : "opacity-0",
              )}
              style={{ backgroundImage: `url(${JSON.stringify(src)})` }}
            />
          )}
          <span
            className={cn(
              "pointer-events-none absolute inset-0 rounded-[inherit] transition-shadow duration-300",
              loaded
                ? "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
                : "shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.2)]",
            )}
          />
        </span>
        {status && (
          <span
            aria-hidden
            className={cn(
              "absolute rounded-full",
              s.dot,
              shape === "square" && "-bottom-0.5 -right-0.5",
              statuses[status],
            )}
          />
        )}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color, applied to every avatar in the group. */
  color?: NeonColor;
  /** Avatars past this count collapse into a "+N" chip. */
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, style, color, max, size = "md", shape = "circle", children, ...props }, ref) => {
    const items = React.Children.toArray(children).filter(React.isValidElement);
    const visible = max !== undefined && items.length > max ? items.slice(0, Math.max(max, 0)) : items;
    const hidden = items.length - visible.length;
    const context = React.useMemo(() => ({ size, shape }), [size, shape]);

    return (
      <AvatarGroupContext.Provider value={context}>
        <div
          ref={ref}
          style={neonVars(color, style)}
          className={cn("flex items-center", sizes[size].overlap, className)}
          {...props}
        >
          {visible}
          {hidden > 0 && (
            <span
              role="img"
              aria-label={`${hidden} more`}
              className={cn(
                "relative inline-flex shrink-0 select-none items-center justify-center bg-[#0f1118] font-medium leading-none text-white/60 tabular-nums",
                "shadow-[0_0_0_2px_#05060a,inset_0_0_0_1px_rgb(255_255_255/0.1)]",
                sizes[size].root,
                shape === "circle" ? "rounded-full" : sizes[size].square,
              )}
            >
              +{hidden}
            </span>
          )}
        </div>
      </AvatarGroupContext.Provider>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
