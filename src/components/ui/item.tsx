"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

/** The single element in `node`. Server Components can pass it as a lazy reference, which Children resolves. */
function resolveElement(node: React.ReactNode): React.ReactElement | null {
  const [child] = React.Children.toArray(node);
  return React.isValidElement(child) ? child : null;
}

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

const ItemGroupContext = React.createContext(false);

const variants = {
  default: "border-transparent",
  outline: "border-white/10",
  muted: "border-transparent bg-white/[0.03]",
} as const;

const sizes = {
  sm: "min-h-12 gap-3 rounded-lg px-3 py-2",
  md: "min-h-16 gap-3.5 rounded-xl px-4 py-3",
  lg: "min-h-20 gap-4 rounded-xl px-5 py-4",
} as const;

// Links, buttons and anything focusable get a hover wash and a focus ring; static rows stay still.
const interactive = cn(
  "[&:is(a,button,[tabindex]):hover]:bg-white/[0.035] [&:is(a,button,[tabindex])]:cursor-pointer",
  "[&:is(a,button,[tabindex])]:active:scale-[0.995]",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
);

export interface ItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Lights the row's edge, for the selected or current row in a list. */
  active?: boolean;
  /** Render the single child (e.g. a link) as the row. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>((raw, ref) => {
  const {
    className,
    style,
    color,
    variant = "default",
    size = "md",
    active = false,
    asChild = false,
    children,
    ...props
  } = fromRenderProp(raw);
  const inGroup = React.useContext(ItemGroupContext);
  const Comp = asChild ? Slot : "div";

  const row = (
    <Comp
      ref={ref}
      role={inGroup && !asChild ? "listitem" : undefined}
      data-variant={variant}
      data-size={size}
      data-active={active ? "" : undefined}
      style={neonVars(color, style)}
      className={cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        "group/item relative flex w-full min-w-0 items-center border text-left text-white/90 outline-none",
        "transition-[background-color,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        interactive,
        variants[variant],
        sizes[size],
        active &&
          (variant === "default"
            ? "bg-[rgb(var(--neon)/0.06)]"
            : "border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.05)] shadow-[inset_0_0_24px_-12px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))]"),
        className,
      )}
      {...props}
    >
      <Filament />
      {asChild ? <Slottable>{resolveElement(children) ?? children}</Slottable> : children}
    </Comp>
  );

  // A link can't also be a listitem, so in a group it gets a wrapper that is.
  if (inGroup && asChild) {
    return (
      <div role="listitem" className="contents">
        {row}
      </div>
    );
  }
  return row;
});
Item.displayName = "Item";

/** The thin tube on the leading edge: dim on hover, fully lit on the active row. */
function Filament() {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-3 left-0 top-3 w-0.5 rounded-full bg-[rgb(var(--neon))] opacity-0",
        "transition-[opacity,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "group-[:is(a,button,[tabindex]):hover]/item:opacity-40",
        "group-data-[active]/item:opacity-100 group-data-[active]/item:shadow-[0_0_6px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_16px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
      )}
    />
  );
}

const mediaVariants = {
  default: "",
  icon: cn(
    "size-10 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white/60 [&_svg]:size-[18px]",
    "transition-[color,border-color,box-shadow,background-color] duration-200",
    "group-[:is(a,button,[tabindex]):hover]/item:text-[rgb(var(--neon))] group-[:is(a,button,[tabindex]):hover]/item:[&_svg]:[filter:drop-shadow(0_0_5px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]",
    "group-data-[active]/item:border-[rgb(var(--neon)/0.35)] group-data-[active]/item:text-[rgb(var(--neon))] group-data-[active]/item:[&_svg]:[filter:drop-shadow(0_0_5px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]",
  ),
  image: "size-10 overflow-hidden rounded-full bg-white/[0.04] [&_img]:size-full [&_img]:object-cover",
} as const;

export interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `icon` boxes an icon that lights on hover; `image` crops a photo or avatar to a circle. */
  variant?: keyof typeof mediaVariants;
}

const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      data-variant={variant}
      className={cn(
        "relative flex shrink-0 items-center justify-center self-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        // Rows with two lines of description pin the media to the top instead.
        "group-has-[[data-item-description][data-lines='2']]/item:self-start group-has-[[data-item-description][data-lines='none']]/item:self-start",
        mediaVariants[variant],
        className,
      )}
      {...props}
    />
  ),
);
ItemMedia.displayName = "ItemMedia";

const ItemContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />
  ),
);
ItemContent.displayName = "ItemContent";

const ItemTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 items-center gap-2 text-sm font-medium leading-5 text-white/90 [&>span:first-child]:truncate",
        className,
      )}
      {...props}
    />
  ),
);
ItemTitle.displayName = "ItemTitle";

export interface ItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Clamp to this many lines, or `"none"` to let it wrap in full. */
  lines?: 1 | 2 | "none";
}

const ItemDescription = React.forwardRef<HTMLParagraphElement, ItemDescriptionProps>(
  ({ className, lines = 2, ...props }, ref) => (
    <p
      ref={ref}
      data-item-description=""
      data-lines={lines}
      className={cn(
        "text-[13px] leading-5 text-white/55 [&_a]:text-white/80 [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-2",
        lines === 1 ? "truncate" : lines === 2 ? "line-clamp-2" : "text-pretty",
        className,
      )}
      {...props}
    />
  ),
);
ItemDescription.displayName = "ItemDescription";

const ItemActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex shrink-0 items-center gap-2", className)} {...props} />
  ),
);
ItemActions.displayName = "ItemActions";

const ItemGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <ItemGroupContext.Provider value>
      <div ref={ref} role="list" className={cn("flex flex-col", className)} {...props} />
    </ItemGroupContext.Provider>
  ),
);
ItemGroup.displayName = "ItemGroup";

export interface ItemSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Start the rule after the media column instead of at the row's edge, in px. */
  inset?: number;
}

/** A hairline between rows. Decorative, so lists keep only listitems as children. */
const ItemSeparator = React.forwardRef<HTMLDivElement, ItemSeparatorProps>(
  ({ className, inset = 0, style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      style={{ marginLeft: inset || undefined, ...style }}
      className={cn("h-px shrink-0 bg-white/[0.06]", className)}
      {...props}
    />
  ),
);
ItemSeparator.displayName = "ItemSeparator";

export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup, ItemSeparator };
