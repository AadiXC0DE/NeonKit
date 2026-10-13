"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Middleware,
  type Placement,
} from "@floating-ui/react-dom";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

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

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
type AnyProps = Record<string, unknown>;

const EASE = [0.23, 1, 0.32, 1] as const;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const subscribeNothing = () => () => {};

/** False on the server and during hydration, so the portal only renders in the browser. */
function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

function getElementRef(element: React.ReactElement): React.Ref<HTMLElement> | undefined {
  // React 19 moved `ref` into props and warns on `element.ref`; React 18 is the other way round.
  const props = element.props as { ref?: React.Ref<HTMLElement> };
  const legacy = element as unknown as { ref?: React.Ref<HTMLElement> };
  const propGetter = Object.getOwnPropertyDescriptor(props, "ref")?.get as { isReactWarning?: boolean } | undefined;
  if (propGetter?.isReactWarning) return legacy.ref;
  const elementGetter = Object.getOwnPropertyDescriptor(element, "ref")?.get as { isReactWarning?: boolean } | undefined;
  if (elementGetter?.isReactWarning) return props.ref;
  return props.ref ?? legacy.ref;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

function useComposedRefs<T>(a: React.Ref<T> | undefined, b: React.Ref<T> | undefined) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node);
      setRef(b, node);
    },
    [a, b],
  );
}

/** Our props first, the child's on top. Handlers run child first, then ours. */
function mergeProps(ours: AnyProps, theirs: AnyProps): AnyProps {
  const merged: AnyProps = { ...ours, ...theirs };
  for (const key of Object.keys(ours)) {
    const a = ours[key];
    const b = theirs[key];
    if (/^on[A-Z]/.test(key) && typeof a === "function" && typeof b === "function") {
      merged[key] = (...args: unknown[]) => {
        (b as (...args: unknown[]) => void)(...args);
        (a as (...args: unknown[]) => void)(...args);
      };
    } else if (key === "className") {
      merged[key] = cn(a as string, b as string);
    } else if (key === "style") {
      merged[key] = { ...(a as object), ...(b as object) };
    } else if (key === "aria-describedby" && a && b) {
      merged[key] = `${b} ${a}`;
    }
  }
  return merged;
}

const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, forwardedRef) => {
    const child = React.isValidElement<AnyProps>(children) ? children : null;
    const ref = useComposedRefs(forwardedRef, child ? getElementRef(child) : undefined);
    if (!child) return null;
    return React.cloneElement(child, { ...mergeProps(props, child.props), ref } as AnyProps);
  },
);
Slot.displayName = "HoverCardSlot";

function isFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

function readNeon(element: Element | null) {
  if (!element || typeof window === "undefined") return undefined;
  const styles = window.getComputedStyle(element);
  return styles.getPropertyValue("--neon").trim() || styles.getPropertyValue("--neon-accent").trim() || undefined;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

// The point on the card's edge nearest the trigger: the light source for the border, and where it grows from.
const lightSource: Middleware = {
  name: "lightSource",
  fn({ x, y, rects, placement }) {
    const side = placement.split("-")[0] as Side;
    const { width, height } = rects.floating;
    const alongX = clamp(rects.reference.x + rects.reference.width / 2 - x, 16, width - 16);
    const alongY = clamp(rects.reference.y + rects.reference.height / 2 - y, 16, height - 16);
    const [lx, ly] = {
      top: [alongX, height],
      bottom: [alongX, 0],
      left: [width, alongY],
      right: [0, alongY],
    }[side];
    return { data: { x: lx, y: ly } };
  },
};

const nudges: Record<Side, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

interface HoverCardContextValue {
  id: string;
  contentId: string;
  open: boolean;
  triggerEl: HTMLElement | null;
  setTriggerEl: (element: HTMLElement | null) => void;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
  onTriggerFocus: () => void;
  onTriggerBlur: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function useHoverCard(component: string) {
  const context = React.useContext(HoverCardContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <HoverCard>.`);
  return context;
}

export interface HoverCardProps {
  /** Milliseconds the pointer rests on the trigger before the card opens. */
  openDelay?: number;
  /** Milliseconds after the pointer leaves before the card closes; time to cross the gap onto it. */
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

function HoverCard({
  openDelay = 500,
  closeDelay = 200,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: HoverCardProps) {
  const id = React.useId();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [triggerEl, setTriggerEl] = React.useState<HTMLElement | null>(null);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const openRef = React.useRef(open);
  const timer = React.useRef(0);
  // Where the card's attention is: a hovered trigger or card, or a keyboard-focused trigger.
  const hovering = React.useRef(false);
  const focused = React.useRef(false);

  useIsomorphicLayoutEffect(() => {
    openRef.current = open;
  });

  const setOpen = React.useCallback(
    (next: boolean) => {
      window.clearTimeout(timer.current);
      if (next === openRef.current) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const scheduleOpen = React.useCallback(() => {
    window.clearTimeout(timer.current);
    if (openRef.current) return;
    timer.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, setOpen]);

  const scheduleClose = React.useCallback(() => {
    window.clearTimeout(timer.current);
    if (hovering.current || focused.current) return;
    timer.current = window.setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay, setOpen]);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Close the card first, not the dialog or menu it sits in.
      event.preventDefault();
      setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.(`[data-neonkit-hover-card="${id}"]`) || (target && triggerEl?.contains(target))) return;
      hovering.current = false;
      focused.current = false;
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, id, triggerEl, setOpen]);

  const value = React.useMemo<HoverCardContextValue>(
    () => ({
      id,
      contentId: `${id}-content`,
      open,
      triggerEl,
      setTriggerEl,
      onTriggerEnter: () => {
        hovering.current = true;
        scheduleOpen();
      },
      onTriggerLeave: () => {
        hovering.current = false;
        scheduleClose();
      },
      onTriggerFocus: () => {
        focused.current = true;
        scheduleOpen();
      },
      onTriggerBlur: () => {
        focused.current = false;
        scheduleClose();
      },
      onContentEnter: () => {
        hovering.current = true;
        window.clearTimeout(timer.current);
      },
      onContentLeave: () => {
        hovering.current = false;
        scheduleClose();
      },
    }),
    [id, open, triggerEl, scheduleOpen, scheduleClose],
  );

  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>;
}
HoverCard.displayName = "HoverCard";

export interface HoverCardTriggerProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Merge hover behaviour onto the single child element instead of rendering a link. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const HoverCardTrigger = React.forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(
  (raw, forwardedRef) => {
    const {
      asChild = false,
      className,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      "aria-describedby": ariaDescribedBy,
      ...props
    } = fromRenderProp(raw);
    const card = useHoverCard("HoverCardTrigger");
    const ref = useComposedRefs<HTMLAnchorElement>(forwardedRef, card.setTriggerEl);
    const describedBy = [ariaDescribedBy, card.open ? card.contentId : undefined].filter(Boolean).join(" ") || undefined;

    const triggerProps = {
      ...props,
      "data-state": card.open ? "open" : "closed",
      onPointerEnter: (event: React.PointerEvent<HTMLAnchorElement>) => {
        onPointerEnter?.(event);
        // Touch has no hover; a tap should just follow the link.
        if (!event.defaultPrevented && event.pointerType === "mouse") card.onTriggerEnter();
      },
      onPointerLeave: (event: React.PointerEvent<HTMLAnchorElement>) => {
        onPointerLeave?.(event);
        if (event.pointerType === "mouse") card.onTriggerLeave();
      },
      onFocus: (event: React.FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event);
        if (!event.defaultPrevented && isFocusVisible(event.currentTarget)) card.onTriggerFocus();
      },
      onBlur: (event: React.FocusEvent<HTMLAnchorElement>) => {
        onBlur?.(event);
        card.onTriggerBlur();
      },
    };

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={className}
          aria-describedby={describedBy}
          {...(triggerProps as React.HTMLAttributes<HTMLElement>)}
        />
      );
    }

    return (
      <a
        ref={ref}
        aria-describedby={describedBy}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "cursor-pointer rounded-md font-medium text-white/90 underline decoration-white/25 underline-offset-4 outline-none",
          "transition-[color,text-decoration-color] duration-150 ease-out hover:decoration-[rgb(var(--neon)/0.8)] data-[state=open]:decoration-[rgb(var(--neon)/0.8)]",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          className,
        )}
        {...triggerProps}
      />
    );
  },
);
HoverCardTrigger.displayName = "HoverCardTrigger";

export interface HoverCardContentProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "color" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  side?: Side;
  align?: Align;
  /** Gap between the trigger and the card, in px. */
  sideOffset?: number;
  /** Palette name or hex. When omitted the card takes the trigger's color, then `--neon-accent`. */
  color?: NeonColor;
}

const HoverCardSurface = React.forwardRef<HTMLDivElement, HoverCardContentProps & { side: Side; align: Align }>(
  (
    { side, align, sideOffset = 8, color, className, style, children, onPointerEnter, onPointerLeave, ...props },
    ref,
  ) => {
    const card = useHoverCard("HoverCardContent");
    const reduceMotion = useReducedMotion() ?? false;
    const [floatingEl, setFloatingEl] = React.useState<HTMLElement | null>(null);
    const placement = (align === "center" ? side : `${side}-${align}`) as Placement;
    const { floatingStyles, middlewareData, placement: finalPlacement } = useFloating({
      placement,
      strategy: "fixed",
      open: true,
      elements: { reference: card.triggerEl, floating: floatingEl },
      whileElementsMounted: autoUpdate,
      middleware: [offset(sideOffset), flip({ padding: 8 }), shift({ padding: 8 }), lightSource],
    });
    const finalSide = finalPlacement.split("-")[0] as Side;
    const light = middlewareData.lightSource as { x: number; y: number } | undefined;
    const at = light ? `${light.x}px ${light.y}px` : "50% 0%";

    // A portal leaves the trigger's subtree, so carry its color over.
    const inherited = React.useMemo(() => (color ? undefined : readNeon(card.triggerEl)), [color, card.triggerEl]);
    const colorStyle = color
      ? neonVars(color)
      : inherited
        ? ({ "--neon": inherited, "--neon-accent": inherited } as React.CSSProperties)
        : undefined;

    // Only the 1px border ring shows the light: the padding box is masked out.
    const ring = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

    return (
      <div
        ref={setFloatingEl}
        data-neonkit-hover-card={card.id}
        style={{ ...floatingStyles, ...colorStyle }}
        className="z-50 [--neon:var(--neon-accent,34_211_238)]"
      >
        <motion.div
          ref={ref}
          id={card.contentId}
          data-side={finalSide}
          data-state="open"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, ...nudges[side] }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0.1 } }
              : { opacity: 0, scale: 0.97, transition: { duration: 0.12, ease: EASE } }
          }
          transition={{ duration: 0.16, ease: EASE }}
          style={{ transformOrigin: at, ...style }}
          className={cn(
            "relative w-72 rounded-xl border border-white/10 bg-[#0a0b11] p-4 text-sm text-white/90",
            "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/0.45)]",
            className,
          )}
          onPointerEnter={(event) => {
            onPointerEnter?.(event);
            if (event.pointerType === "mouse") card.onContentEnter();
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            if (event.pointerType === "mouse") card.onContentLeave();
          }}
          {...props}
        >
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.45, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
            className="pointer-events-none absolute -inset-px rounded-[inherit] border border-transparent"
            style={{
              background: `radial-gradient(150px circle at ${at}, rgb(var(--neon) / 0.95), rgb(var(--neon) / 0.3) 45%, transparent 80%) border-box`,
              WebkitMask: ring,
              WebkitMaskComposite: "xor",
              mask: ring,
              maskComposite: "exclude",
            }}
          />
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.5, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: `radial-gradient(180px circle at ${at}, rgb(var(--neon) / 0.07), transparent 70%)` }}
          />
          <div className="relative">{children}</div>
        </motion.div>
      </div>
    );
  },
);
HoverCardSurface.displayName = "HoverCardSurface";

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ side = "bottom", align = "center", ...props }, ref) => {
    const card = useHoverCard("HoverCardContent");
    const isClient = useIsClient();
    if (!isClient) return null;
    // A modal <dialog> makes everything outside it inert, so render inside it when the trigger is.
    const container = (card.triggerEl?.closest("dialog") as HTMLElement | null) ?? document.body;

    return createPortal(
      <AnimatePresence>
        {card.open && <HoverCardSurface key="card" ref={ref} side={side} align={align} {...props} />}
      </AnimatePresence>,
      container,
    );
  },
);
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
