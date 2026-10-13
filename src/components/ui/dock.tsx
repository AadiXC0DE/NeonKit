"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

type RenderProp = { asChild?: boolean; render?: React.ReactElement; nativeButton?: boolean; children?: React.ReactNode };

/**
 * Base UI spells asChild as `render={<Link />}` plus `nativeButton`, and the shadcn CLI rewrites
 * asChild into that form in base-* projects. Folds it back into asChild and children.
 */
function fromRenderProp<P extends RenderProp>({ render, nativeButton, ...props }: P): Omit<P, "render" | "nativeButton"> {
  void nativeButton; // Only meaningful to Base UI.
  if (!render) return props;
  const children = props.children === undefined ? render : React.cloneElement(render, undefined, props.children);
  return { ...props, asChild: true, children };
}

/** The single element in `node`. Server Components can pass it as a lazy reference, which Children resolves. */
function resolveElement(node: React.ReactNode): React.ReactElement | null {
  const [child] = React.Children.toArray(node);
  return React.isValidElement(child) ? child : null;
}

// Icon size at rest, in pixels. Everything else in the dock is a share of it.
const sizes = { sm: 36, md: 44, lg: 54 } as const;

// Close to critically damped, with just enough give that a fast sweep overshoots a hair.
const SPRING = { mass: 0.3, stiffness: 300, damping: 22 };

// Hover and keyboard focus strike the icon's tube. A class in a style tag, because a
// stacked hover-plus-descendant variant compiles differently on Tailwind 3 and 4.
const css = `
.nk-dock-tile svg { transition: filter 200ms cubic-bezier(0.23, 1, 0.32, 1), color 200ms; }
.nk-dock-tile:hover:not([data-disabled]), .nk-dock-tile:focus-visible { color: color-mix(in srgb, rgb(var(--neon)) 40%, white); border-color: rgb(var(--neon) / 0.32); }
.nk-dock-tile:hover:not([data-disabled]) svg, .nk-dock-tile:focus-visible svg {
  filter: drop-shadow(0 0 1.5px rgb(var(--neon))) drop-shadow(0 0 7px rgb(var(--neon) / 0.7));
}
@media (prefers-reduced-motion: reduce) { .nk-dock-tile, .nk-dock-tile svg { transition: none; } }
`;

type DockContextValue = {
  pointer: MotionValue<number>;
  vertical: boolean;
  base: number;
  peak: number;
  distance: number;
  magnify: boolean;
  tabStop: string | null;
  setTabStop: (id: string) => void;
};

const DockContext = React.createContext<DockContextValue | null>(null);

function useDock() {
  const context = React.useContext(DockContext);
  if (!context) throw new Error("<DockItem> and <DockSeparator> must be used inside <Dock>.");
  return context;
}

const itemSelector = "[data-dock-item]:not([data-disabled])";

export interface DockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Horizontal docks grow upward from the bottom edge; vertical ones grow right from the left edge. */
  orientation?: "horizontal" | "vertical";
  /** Icon size at rest: 36, 44 or 54px. */
  size?: keyof typeof sizes;
  /** How big the icon under the pointer gets, as a multiple of its resting size. 1 turns it off. */
  magnification?: number;
  /** Pixels from the pointer within which icons grow. */
  distance?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      style,
      orientation = "horizontal",
      size = "md",
      magnification = 1.6,
      distance = 140,
      color,
      children,
      onPointerMove,
      onPointerLeave,
      onPointerDown,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const pointer = useMotionValue(Infinity);
    const reduce = useReducedMotion();
    const vertical = orientation === "vertical";
    const base = sizes[size];
    const magnify = !reduce && magnification > 1;
    const [tabStop, setTabStop] = React.useState<string | null>(null);

    // One item is in the Tab order. Until the dock mounts every item is, so it works before hydration.
    React.useEffect(() => {
      const items = rootRef.current?.querySelectorAll<HTMLElement>(itemSelector);
      if (!items?.length) return;
      const ids = Array.from(items, (item) => item.dataset.dockId);
      if (tabStop === null || !ids.includes(tabStop)) setTabStop(ids[0] ?? null);
    }, [tabStop, children]);

    const context = React.useMemo<DockContextValue>(
      () => ({
        pointer,
        vertical,
        base,
        peak: base * Math.max(1, magnification),
        distance,
        magnify,
        tabStop,
        setTabStop,
      }),
      [pointer, vertical, base, magnification, distance, magnify, tabStop],
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const forward = vertical ? "ArrowDown" : "ArrowRight";
      const back = vertical ? "ArrowUp" : "ArrowLeft";
      if (![forward, back, "Home", "End"].includes(event.key)) return;
      const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(itemSelector) ?? []);
      if (!items.length) return;
      const index = items.findIndex((item) => item === document.activeElement || item.contains(document.activeElement));
      let next = index;
      if (event.key === forward) next = index < 0 ? 0 : (index + 1) % items.length;
      if (event.key === back) next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = items.length - 1;
      event.preventDefault();
      const target = items[next];
      // Moving by keyboard never magnifies: the pointer's influence is dropped.
      pointer.set(Infinity);
      target.focus();
      if (target.dataset.dockId) setTabStop(target.dataset.dockId);
    };

    const pad = Math.round(base * 0.2);

    return (
      <DockContext.Provider value={context}>
        <div
          ref={rootRef}
          role="toolbar"
          aria-orientation={orientation}
          data-orientation={orientation}
          style={neonVars(color, {
            [vertical ? "width" : "height"]: base + pad * 2,
            padding: pad,
            gap: Math.round(base * 0.2),
            borderRadius: Math.round(base * 0.42),
            ...style,
          } as React.CSSProperties)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "relative inline-flex select-none border border-white/[0.09] bg-[#0b0d12]/80 backdrop-blur-xl",
            "shadow-[inset_0_1px_0_rgb(255_255_255/0.07),inset_0_-1px_0_rgb(0_0_0/0.4),0_18px_40px_-16px_rgb(0_0_0/0.9),0_0_0_1px_rgb(0_0_0/0.4)]",
            vertical ? "flex-col items-start" : "items-end",
            className,
          )}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            // Touch has no hover, so there's nothing to magnify toward.
            if (!magnify || event.pointerType === "touch") return;
            pointer.set(vertical ? event.clientY : event.clientX);
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            pointer.set(Infinity);
          }}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            if (event.pointerType === "touch") pointer.set(Infinity);
          }}
          onKeyDown={handleKeyDown}
          {...props}
        >
          <style>{css}</style>
          {children}
        </div>
      </DockContext.Provider>
    );
  },
);
Dock.displayName = "Dock";

export interface DockItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The item's name: its accessible name and the tooltip. */
  label: string;
  /** Light the small tube under the icon, like an app that's open. */
  running?: boolean;
  /** What screen readers hear for `running`. */
  runningLabel?: string;
  /** A count or short word in a lit pill on the corner. */
  badge?: React.ReactNode;
  /** Palette name or hex for the badge. Red by default. */
  badgeColor?: NeonColor;
  /** Render the child element (e.g. a link) as the item. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const DockItem = React.forwardRef<HTMLButtonElement, DockItemProps>((raw, ref) => {
  const {
    className,
    label,
    running = false,
    runningLabel = "open",
    badge,
    badgeColor,
    asChild = false,
    disabled = false,
    children,
    onFocus,
    ...props
  } = fromRenderProp(raw);
  const dock = useDock();
  const id = React.useId();
  const slotRef = React.useRef<HTMLDivElement>(null);
  const { pointer, vertical, base, peak, distance, magnify } = dock;

  // Distance from the pointer to this icon's centre, measured live so the
  // neighbours make room as it grows.
  const offset = useTransform(pointer, (at) => {
    const node = slotRef.current;
    if (!node || !Number.isFinite(at)) return Infinity;
    const box = node.getBoundingClientRect();
    return at - (vertical ? box.top + box.height / 2 : box.left + box.width / 2);
  });
  const target = useTransform(offset, [-distance, 0, distance], [base, peak, base], { clamp: true });
  const extent = useSpring(target, SPRING);

  const Comp = asChild ? Slot : "button";
  const child = asChild ? (resolveElement(children) ?? children) : children;
  const describedBy = [badge != null && `${id}-badge`, running && `${id}-running`].filter(Boolean).join(" ") || undefined;

  return (
    <motion.div
      ref={slotRef}
      className="group/dock-item relative shrink-0"
      style={magnify ? { width: extent, height: extent } : { width: base, height: base }}
    >
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-dock-item=""
        data-dock-id={id}
        data-disabled={disabled ? "" : undefined}
        disabled={asChild ? undefined : disabled}
        aria-disabled={asChild && disabled ? true : undefined}
        aria-label={label}
        aria-describedby={describedBy}
        tabIndex={disabled ? -1 : dock.tabStop === null || dock.tabStop === id ? 0 : -1}
        onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
          onFocus?.(event);
          dock.setTabStop(id);
        }}
        className={cn(
          "nk-dock-tile relative grid size-full cursor-pointer place-items-center rounded-[27%] border border-white/[0.09] text-white/75 outline-none",
          "bg-[linear-gradient(180deg,#1c1f28,#0e1015)] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.5),0_4px_10px_-4px_rgb(0_0_0/0.85)]",
          "transition-[transform,border-color,color] duration-150 ease-out active:scale-[0.92]",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d12]",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:size-[46%] [&_svg]:shrink-0",
          className,
        )}
        {...props}
      >
        {child}
      </Comp>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0b11]/95 px-2 py-1 text-[12px] font-medium leading-4 text-white/90 opacity-0 shadow-[0_8px_20px_-8px_rgb(0_0_0/0.9)]",
          "transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          "group-hover/dock-item:opacity-100 group-has-[:focus-visible]/dock-item:opacity-100",
          vertical
            ? "left-[calc(100%+12px)] top-1/2 -translate-y-1/2 translate-x-[-4px] group-hover/dock-item:translate-x-0 group-has-[:focus-visible]/dock-item:translate-x-0"
            : "bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 translate-y-1 group-hover/dock-item:translate-y-0 group-has-[:focus-visible]/dock-item:translate-y-0",
        )}
      >
        {label}
      </span>

      {badge != null && (
        <span
          id={`${id}-badge`}
          style={badgeColor ? ({ "--nk-badge": toNeonRgb(badgeColor) } as React.CSSProperties) : undefined}
          className={cn(
            "pointer-events-none absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-[11px] font-semibold tabular-nums leading-none text-[#14040a]",
            "bg-[color-mix(in_srgb,rgb(var(--nk-badge,255_77_94))_88%,white)] shadow-[0_0_0_1.5px_#0b0d12,0_0_8px_rgb(var(--nk-badge,255_77_94)/0.7)]",
          )}
        >
          {badge}
        </span>
      )}

      {running && (
        <>
          <span id={`${id}-running`} className="sr-only">
            {runningLabel}
          </span>
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-full [background:color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_2px_rgb(var(--neon)),0_0_7px_rgb(var(--neon)/0.8)]",
              vertical ? "top-1/2 h-[24%] w-[3px] -translate-y-1/2" : "left-1/2 h-[3px] w-[24%] -translate-x-1/2",
            )}
            style={vertical ? { left: -Math.round(base * 0.15) } : { bottom: -Math.round(base * 0.15) }}
          />
        </>
      )}
    </motion.div>
  );
});
DockItem.displayName = "DockItem";

/** A hairline between groups of items, like the one before the Trash. */
const DockSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => {
    const { vertical, base } = useDock();
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={vertical ? "horizontal" : "vertical"}
        className={cn("shrink-0 self-center bg-white/[0.12]", className)}
        style={{
          ...(vertical ? { height: 1, width: Math.round(base * 0.62) } : { width: 1, height: Math.round(base * 0.62) }),
          ...style,
        }}
        {...props}
      />
    );
  },
);
DockSeparator.displayName = "DockSeparator";

export { Dock, DockItem, DockSeparator };
