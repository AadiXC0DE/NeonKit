"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import { Marquee } from "@/components/ui/marquee";

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

// The tube along the bottom edge strikes like a real one: a couple of failed
// catches, then it holds. The wash it throws up the bar follows it.
const css = `
@keyframes nk-banner-strike {
  0% { opacity: 0; } 6% { opacity: 0.9; } 10% { opacity: 0.1; } 22% { opacity: 0.05; } 25% { opacity: 1; }
  29% { opacity: 0.3; } 34% { opacity: 0.85; } 38% { opacity: 0.55; } 52%, 100% { opacity: 1; }
}
.nk-banner-light { animation: nk-banner-strike 1.1s linear 0.15s both; }
@media (prefers-reduced-motion: reduce) { .nk-banner-light { animation: none; } }
`;

const variantColors: Partial<Record<BannerVariant, NeonColor>> = { warning: "amber", maintenance: "orange" };

type BannerVariant = "info" | "launch" | "warning" | "maintenance";

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** `info` and `launch` use the neon color; `warning` is amber and `maintenance` orange with hazard stripes. */
  variant?: BannerVariant;
  /** A short pill before the message, like "New" or "v2.4". */
  tag?: React.ReactNode;
  /** A link or button after the message. BannerAction styles one. */
  action?: React.ReactNode;
  /** Show a close button. */
  dismissible?: boolean;
  /** Remember the dismissal in localStorage under this key. The banner opens once it has checked. */
  storageKey?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Scroll the message sideways in a Marquee instead of wrapping it. */
  marquee?: boolean;
  /** Label for the close button. */
  dismissLabel?: string;
  /** Palette name or hex. Overrides the variant's color. */
  color?: NeonColor;
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      style,
      variant = "info",
      tag,
      action,
      dismissible = false,
      storageKey,
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      marquee = false,
      dismissLabel = "Dismiss",
      color,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
    const open = openProp ?? uncontrolled;
    // With a storage key the banner stays shut until storage has been read, so a
    // returning visitor never sees it flash open and closed.
    const [checked, setChecked] = React.useState(!storageKey);
    const [remembered, setRemembered] = React.useState(false);
    const shellRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => shellRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!storageKey) {
        setChecked(true);
        setRemembered(false);
        return;
      }
      let stored = false;
      try {
        stored = window.localStorage.getItem(storageKey) === "dismissed";
      } catch {
        stored = false;
      }
      setRemembered(stored);
      setChecked(true);
    }, [storageKey]);

    const visible = open && checked && !remembered;

    React.useEffect(() => {
      // A collapsed banner keeps its height animation but leaves the tab order.
      if (shellRef.current) shellRef.current.inert = !visible;
    }, [visible]);

    const dismiss = () => {
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, "dismissed");
        } catch {
          // Private mode or blocked storage: it just won't be remembered.
        }
        setRemembered(true);
      }
      if (openProp === undefined) setUncontrolled(false);
      onOpenChange?.(false);
    };

    const tint = color ?? variantColors[variant];
    const launch = variant === "launch";

    const tagNode = tag != null && (
      <span
        className={cn(
          "inline-flex h-[22px] shrink-0 items-center rounded-full border px-2 align-[1px] text-[12px] font-medium leading-none",
          "border-[rgb(var(--neon)/0.45)] bg-[rgb(var(--neon)/0.1)] [color:color-mix(in_srgb,rgb(var(--neon))_70%,white)]",
          launch && "shadow-[0_0_10px_rgb(var(--neon)/0.35),inset_0_0_6px_rgb(var(--neon)/0.15)]",
          !marquee && "mr-2.5",
        )}
      >
        {tag}
      </span>
    );

    return (
      <div
        ref={shellRef}
        role="region"
        aria-label={ariaLabel ?? "Announcement"}
        aria-hidden={visible ? undefined : true}
        data-state={visible ? "open" : "closed"}
        data-variant={variant}
        style={neonVars(tint, { gridTemplateRows: visible ? "1fr" : "0fr", ...style } as React.CSSProperties)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "grid w-full transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <div className="min-h-0 overflow-hidden">
          <div className="relative isolate flex min-h-11 items-center bg-[#07080c] text-[14px] leading-6 text-white/80">
            {variant === "maintenance" && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(-45deg,rgb(var(--neon)/0.075)_0_9px,transparent_9px_18px)] [mask-image:linear-gradient(90deg,#000,transparent_22%,transparent_78%,#000)]"
              />
            )}
            {visible && (
              <span aria-hidden className="nk-banner-light pointer-events-none absolute inset-0 -z-10">
                {/* Light from the tube washing up the bar */}
                <span
                  className={cn(
                    "absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--neon)/0.13),rgb(var(--neon)/0.03)_55%,transparent)]",
                    launch && "bg-[linear-gradient(to_top,rgb(var(--neon)/0.2),rgb(var(--neon)/0.05)_60%,transparent)]",
                  )}
                />
                <span className="absolute inset-x-2 bottom-px h-[1.5px] rounded-full [background:color-mix(in_srgb,rgb(var(--neon))_45%,white)] shadow-[0_0_2px_rgb(var(--neon)),0_0_8px_rgb(var(--neon)/0.8),0_-2px_18px_rgb(var(--neon)/0.45)]" />
              </span>
            )}
            {/* Unlit, the tube is still there as tinted glass */}
            <span aria-hidden className="pointer-events-none absolute inset-x-2 bottom-px -z-20 h-[1.5px] rounded-full bg-[rgb(var(--neon)/0.18)]" />

            {marquee ? (
              <div className={cn("flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-4", !dismissible && "pr-4")}>
                {/* On a phone the ticker needs the room more than the tag does */}
                {tagNode && <span className="hidden sm:contents">{tagNode}</span>}
                <Marquee speed={36} gap={56} fade={32} className="min-w-0 flex-1 whitespace-nowrap">
                  {children}
                </Marquee>
                {action != null && <span className="shrink-0">{action}</span>}
              </div>
            ) : (
              <p className={cn("min-w-0 flex-1 py-2.5 text-center text-pretty", dismissible ? "px-11" : "px-4")}>
                {tagNode}
                {children}
                {action != null && <span className="ml-2.5 inline-block">{action}</span>}
              </p>
            )}

            {dismissible && (
              <button
                type="button"
                aria-label={dismissLabel}
                onClick={dismiss}
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md text-white/50 outline-none transition-colors duration-150",
                  "hover:bg-white/[0.06] hover:text-white/90",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                  marquee ? "mx-2" : "absolute right-2 top-1/2 -translate-y-1/2",
                )}
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
Banner.displayName = "Banner";

export interface BannerActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the child element (e.g. a link) with the action's styles. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

/** The banner's link or button: lit text with an arrow that leans forward on hover. */
const BannerAction = React.forwardRef<HTMLButtonElement, BannerActionProps>((raw, ref) => {
  const { asChild = false, className, children, ...props } = fromRenderProp(raw);
  const Comp = asChild ? Slot : "button";
  const child = asChild ? (resolveElement(children) ?? children) : children;
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      className={cn(
        "group/banner-action inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] font-medium outline-none",
        "[color:color-mix(in_srgb,rgb(var(--neon))_72%,white)] underline-offset-4 [text-decoration-color:rgb(var(--neon)/0.5)]",
        "transition-[text-shadow] duration-200 hover:underline hover:[text-shadow:0_0_10px_rgb(var(--neon)/0.6)]",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c]",
        className,
      )}
      {...props}
    >
      <Slottable>{child}</Slottable>
      <span
        aria-hidden
        className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/banner-action:translate-x-0.5"
      >
        →
      </span>
    </Comp>
  );
});
BannerAction.displayName = "BannerAction";

export { Banner, BannerAction };
