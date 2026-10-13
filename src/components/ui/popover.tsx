"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  arrow as arrowMiddleware,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type Middleware,
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

const EASE = [0.23, 1, 0.32, 1] as const;

const TABBABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "iframe",
  "[contenteditable='true']",
  "[tabindex]",
].join(",");

function getTabbables(root: ParentNode) {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (element) => element.tabIndex >= 0 && !element.closest("[hidden], [inert]"),
  );
}

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function useComposedRefs<T>(a: PossibleRef<T>, b: PossibleRef<T>, c?: PossibleRef<T>) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node);
      setRef(b, node);
      setRef(c, node);
    },
    [a, b, c],
  );
}

// React 19 reads `ref` from props; React 18 keeps it on the element.
function getElementRef(element: React.ReactElement) {
  if (Number.parseInt(React.version, 10) >= 19) {
    return (element.props as { ref?: React.Ref<HTMLElement> }).ref;
  }
  return (element as unknown as { ref?: React.Ref<HTMLElement> }).ref;
}

type AnyProps = Record<string, unknown>;

function mergeSlotProps(slotProps: AnyProps, childProps: AnyProps) {
  const merged: AnyProps = { ...slotProps };
  for (const key of Object.keys(childProps)) {
    const ours = slotProps[key];
    const theirs = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof ours === "function" && typeof theirs === "function") {
      merged[key] = (event: { defaultPrevented?: boolean }) => {
        (theirs as (event: unknown) => void)(event);
        if (!event?.defaultPrevented) (ours as (event: unknown) => void)(event);
      };
    } else if (key === "className") {
      merged.className = cn(theirs as string, ours as string);
    } else if (key === "style") {
      merged.style = { ...(theirs as object), ...(ours as object) };
    } else if (ours === undefined) {
      merged[key] = theirs;
    }
  }
  return merged;
}

/** Merges props and refs onto its single child element. The child's handlers run first. */
const Slot = React.forwardRef<HTMLElement, AnyProps & { children?: React.ReactNode }>(
  ({ children, ...props }, forwardedRef) => {
    const child = React.isValidElement<AnyProps>(children) ? children : null;
    const ref = useComposedRefs(forwardedRef, child ? getElementRef(child) : undefined);
    if (!child) return null;
    return React.cloneElement(child, { ...mergeSlotProps(props, child.props), ref } as AnyProps);
  },
);
Slot.displayName = "PopoverSlot";

const subscribe = () => () => {};
const useIsClient = () =>
  React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: HTMLElement | null;
  setTrigger: (node: HTMLElement | null) => void;
  anchor: HTMLElement | null;
  setAnchor: (node: HTMLElement | null) => void;
  triggerId: string;
  contentId: string;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopover(component: string) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Popover>.`);
  return context;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

function Popover({ open: openProp, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [trigger, setTrigger] = React.useState<HTMLElement | null>(null);
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const id = React.useId();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  // A close can be requested twice in one event (Tab moves focus, which also reads as focus-outside).
  const pending = React.useRef<boolean | null>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open || pending.current === next) return;
      pending.current = next;
      queueMicrotask(() => {
        pending.current = null;
      });
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  const value = React.useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      trigger,
      setTrigger,
      anchor,
      setAnchor,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
    }),
    [open, setOpen, trigger, anchor, id],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}
Popover.displayName = "Popover";

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge trigger behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  (raw, forwardedRef) => {
    const { asChild = false, id, onClick, onKeyDown, children, ...props } = fromRenderProp(raw);
    const { open, setOpen, setTrigger, triggerId, contentId } = usePopover("PopoverTrigger");
    const ref = useComposedRefs<HTMLElement>(forwardedRef as PossibleRef<HTMLElement>, setTrigger);
    const childId =
      asChild && React.isValidElement<{ id?: string }>(children) ? children.props.id : undefined;

    const triggerProps = {
      ...props,
      // The content is labelled by the trigger, so it always needs an id.
      id: id ?? childId ?? triggerId,
      "aria-haspopup": "dialog" as const,
      "aria-expanded": open,
      "aria-controls": open ? contentId : undefined,
      "data-state": open ? "open" : "closed",
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !open || event.key !== "Escape") return;
        event.preventDefault();
        setOpen(false);
      },
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...triggerProps}>
          {children}
        </Slot>
      );
    }

    return (
      <button ref={ref} type="button" {...triggerProps}>
        {children}
      </button>
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverAnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Merge anchor behaviour onto the single child element instead of rendering a div. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

/** Optional. Positions the content against this element instead of the trigger. */
const PopoverAnchor = React.forwardRef<HTMLDivElement, PopoverAnchorProps>(
  (raw, forwardedRef) => {
    const { asChild = false, children, ...props } = fromRenderProp(raw);
    const { setAnchor } = usePopover("PopoverAnchor");
    const ref = useComposedRefs<HTMLElement>(forwardedRef as PossibleRef<HTMLElement>, setAnchor);

    if (asChild) {
      return (
        <Slot ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);
PopoverAnchor.displayName = "PopoverAnchor";

// Where the trigger's centre falls on the panel, so motion and light come from that point.
const anchorPoint: Middleware = {
  name: "anchorPoint",
  fn({ x, y, rects }) {
    const clamp = (value: number, max: number) => Math.min(Math.max(value, 16), Math.max(max - 16, 16));
    return {
      data: {
        x: clamp(rects.reference.x + rects.reference.width / 2 - x, rects.floating.width),
        y: clamp(rects.reference.y + rects.reference.height / 2 - y, rects.floating.height),
      },
    };
  },
};

// The panel starts nudged toward the trigger and settles outward.
const nudges: Record<Side, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

// Light leaks in along the edge that faces the trigger, centred on it.
const leakLines: Record<Side, string> = {
  bottom:
    "left-[var(--popover-anchor-x,50%)] top-0 h-px w-40 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.7),transparent)]",
  top: "bottom-0 left-[var(--popover-anchor-x,50%)] h-px w-40 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.7),transparent)]",
  right:
    "left-0 top-[var(--popover-anchor-y,50%)] h-24 w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgb(var(--neon)/0.7),transparent)]",
  left: "right-0 top-[var(--popover-anchor-y,50%)] h-24 w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgb(var(--neon)/0.7),transparent)]",
};

const leakGlows: Record<Side, string> = {
  bottom: "left-[var(--popover-anchor-x,50%)] top-0 h-12 w-56 -translate-x-1/2 -translate-y-1/2",
  top: "bottom-0 left-[var(--popover-anchor-x,50%)] h-12 w-56 -translate-x-1/2 translate-y-1/2",
  right: "left-0 top-[var(--popover-anchor-y,50%)] h-32 w-12 -translate-x-1/2 -translate-y-1/2",
  left: "right-0 top-[var(--popover-anchor-y,50%)] h-32 w-12 -translate-y-1/2 translate-x-1/2",
};

const arrowBorders: Record<Side, string> = {
  top: "border-b border-r",
  bottom: "border-l border-t",
  left: "border-r border-t",
  right: "border-b border-l",
};

const staticSides: Record<Side, Side> = { top: "bottom", right: "left", bottom: "top", left: "right" };

function readNeon(element: HTMLElement | null) {
  if (!element) return undefined;
  const styles = window.getComputedStyle(element);
  const rgb =
    styles.getPropertyValue("--neon").trim() || styles.getPropertyValue("--neon-accent").trim();
  return rgb ? ({ "--neon": rgb, "--neon-accent": rgb } as React.CSSProperties) : undefined;
}

export interface PopoverContentProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "color" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  /** Preferred side. Flips to the opposite one when there isn't room. */
  side?: Side;
  align?: Align;
  /** Gap between the trigger and the panel, in pixels. */
  sideOffset?: number;
  /** Shows a small arrow pointing at the trigger. */
  arrow?: boolean;
  /** Palette name or hex. Inherits the trigger's color when omitted. */
  color?: NeonColor;
  /** What gets focus on open: the first focusable element inside, or the panel itself. */
  initialFocus?: "content" | "first";
}

const PopoverPanel = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      side = "bottom",
      align = "center",
      sideOffset = 8,
      arrow = false,
      color,
      initialFocus = "first",
      className,
      style,
      children,
      onKeyDown,
      onPointerDownCapture,
      onFocusCapture,
      ...props
    },
    forwardedRef,
  ) => {
    const { open, setOpen, trigger, anchor, contentId } = usePopover("PopoverContent");
    const reduceMotion = useReducedMotion();
    const [surface, setSurface] = React.useState<HTMLDivElement | null>(null);
    const [floating, setFloating] = React.useState<HTMLDivElement | null>(null);
    const [arrowElement, setArrowElement] = React.useState<HTMLSpanElement | null>(null);
    const ref = useComposedRefs(forwardedRef, setSurface);
    // A portal leaves the trigger's subtree, so carry its color across.
    const [inherited] = React.useState(() => readNeon(trigger));
    // Events from portaled children (a nested popover) bubble here through React, not the DOM.
    const insideTree = React.useRef({ pointer: false, focus: false });

    const { floatingStyles, placement, middlewareData, isPositioned } = useFloating({
      placement: align === "center" ? side : `${side}-${align}`,
      elements: { reference: anchor ?? trigger, floating },
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(sideOffset + (arrow ? 6 : 0)),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableWidth, availableHeight, rects, elements: { floating } }) {
            floating.style.setProperty("--popover-available-width", `${Math.floor(availableWidth)}px`);
            floating.style.setProperty("--popover-available-height", `${Math.floor(availableHeight)}px`);
            floating.style.setProperty("--popover-trigger-width", `${rects.reference.width}px`);
          },
        }),
        arrow && arrowMiddleware({ element: arrowElement, padding: 12 }),
        anchorPoint,
      ],
    });

    const placedSide = placement.split("-")[0] as Side;
    const point = middlewareData.anchorPoint as { x: number; y: number } | undefined;
    const pointX = point ? `${point.x}px` : "50%";
    const pointY = point ? `${point.y}px` : "50%";
    const transformOrigin = {
      top: `${pointX} 100%`,
      bottom: `${pointX} 0%`,
      left: `100% ${pointY}`,
      right: `0% ${pointY}`,
    }[placedSide];

    // Declared before the focus effect below, so these listeners see the initial focus land inside.
    React.useEffect(() => {
      if (!open || !floating) return;
      insideTree.current = { pointer: false, focus: false };
      const isInside = (target: EventTarget | null) =>
        target instanceof Node && (floating.contains(target) || Boolean(trigger?.contains(target)));

      const onPointerDown = (event: PointerEvent) => {
        const fromTree = insideTree.current.pointer;
        insideTree.current.pointer = false;
        if (fromTree || isInside(event.target)) return;
        setOpen(false);
        // If the press didn't land on something focusable, focus would drop to the page.
        window.setTimeout(() => {
          const active = document.activeElement;
          if (!active || (trigger && active.contains(trigger))) trigger?.focus({ preventScroll: true });
        });
      };

      const onFocusIn = (event: FocusEvent) => {
        const fromTree = insideTree.current.focus;
        insideTree.current.focus = false;
        if (fromTree || isInside(event.target)) return;
        setOpen(false);
      };

      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("focusin", onFocusIn);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("focusin", onFocusIn);
      };
    }, [open, floating, trigger, setOpen]);

    // Keyed on open too: reopening mid-exit reuses this instance.
    React.useEffect(() => {
      if (!open || !surface) return;
      const target =
        initialFocus === "first"
          ? (surface.querySelector<HTMLElement>("[autofocus], [data-autofocus]") ??
            getTabbables(surface)[0] ??
            surface)
          : surface;
      target.focus({ preventScroll: true });
    }, [open, surface, initialFocus]);

    // However it closed (Escape, a close button, a parent's state), focus inside goes back to the trigger.
    React.useEffect(() => {
      if (open || !floating) return;
      const active = document.activeElement;
      if (active && floating.contains(active)) trigger?.focus({ preventScroll: true });
    }, [open, floating, trigger]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Escape") {
        // Stop here so a dialog or parent popover behind this one stays open.
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const panel = event.currentTarget;
      const tabbables = getTabbables(panel);
      const active = document.activeElement;

      if (event.shiftKey) {
        if (!tabbables.length || active === panel || active === tabbables[0]) {
          event.preventDefault();
          setOpen(false);
          trigger?.focus({ preventScroll: true });
        }
        return;
      }

      if (tabbables.length && active !== tabbables[tabbables.length - 1]) return;
      // The panel lives in a portal, so continue the tab order from the trigger instead.
      event.preventDefault();
      const scope = trigger?.closest("dialog") ?? document.body;
      const next = trigger
        ? getTabbables(scope).find(
            (element) =>
              !floating?.contains(element) &&
              !trigger.contains(element) &&
              trigger.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
          )
        : undefined;
      (next ?? trigger)?.focus({ preventScroll: true });
      setOpen(false);
    }

    const hidden = reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.96, x: 0, y: 0, ...nudges[placedSide] };
    const arrowData = middlewareData.arrow;

    return (
      <div
        ref={setFloating}
        style={floatingStyles}
        className="z-50 w-max max-w-[var(--popover-available-width,calc(100vw-16px))]"
      >
        <motion.div
          {...props}
          ref={ref}
          id={contentId}
          role="dialog"
          tabIndex={-1}
          aria-labelledby={
            props["aria-labelledby"] ?? (props["aria-label"] ? undefined : trigger?.id || undefined)
          }
          data-state={open ? "open" : "closed"}
          data-side={placedSide}
          data-align={align}
          initial={hidden}
          // Hold still until floating-ui has placed it, so it never flashes at the corner.
          animate={isPositioned ? { opacity: 1, scale: 1, x: 0, y: 0 } : hidden}
          exit={{ ...hidden, transition: { duration: reduceMotion ? 0.1 : 0.12, ease: EASE } }}
          transition={{ duration: reduceMotion ? 0.12 : 0.16, ease: EASE }}
          onKeyDown={handleKeyDown}
          onPointerDownCapture={(event) => {
            onPointerDownCapture?.(event);
            insideTree.current.pointer = true;
          }}
          onFocusCapture={(event) => {
            onFocusCapture?.(event);
            insideTree.current.focus = true;
          }}
          style={
            {
              ...inherited,
              ...neonVars(color, style),
              transformOrigin,
              "--popover-anchor-x": pointX,
              "--popover-anchor-y": pointY,
            } as React.CSSProperties
          }
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "relative w-72 max-w-full rounded-xl border border-white/10 bg-[#0a0b11] p-4 text-sm text-white/90 outline-none",
            "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/0.45)]",
            !open && "pointer-events-none",
            className,
          )}
        >
          <span aria-hidden className="pointer-events-none absolute -inset-px overflow-hidden rounded-[inherit]">
            <motion.span
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPositioned ? 1 : 0 }}
              // The leak warms up a beat after the panel lands, like a tube striking.
              transition={reduceMotion ? { duration: 0 } : { duration: 0.36, delay: 0.06, ease: EASE }}
            >
              <span className={cn("absolute", leakLines[placedSide])} />
              <span
                className={cn(
                  "absolute bg-[radial-gradient(closest-side,rgb(var(--neon)/0.13),transparent)]",
                  leakGlows[placedSide],
                )}
              />
            </motion.span>
          </span>
          {children}
          {arrow && (
            <span
              ref={setArrowElement}
              aria-hidden
              style={{
                // Coordinates are for the border box; the arrow sits inside the 1px border.
                left: arrowData?.x != null ? arrowData.x - 1 : undefined,
                top: arrowData?.y != null ? arrowData.y - 1 : undefined,
                [staticSides[placedSide]]: -6,
              }}
              className={cn(
                "pointer-events-none absolute size-2.5 rotate-45 border-[rgb(var(--neon)/0.35)] bg-[#0a0b11]",
                arrowBorders[placedSide],
              )}
            />
          )}
        </motion.div>
      </div>
    );
  },
);
PopoverPanel.displayName = "PopoverPanel";

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>((props, ref) => {
  const { open, trigger } = usePopover("PopoverContent");
  const isClient = useIsClient();
  if (!isClient) return null;

  // A modal <dialog> makes everything outside it inert, so render inside it when the trigger is in one.
  const container = trigger?.closest("dialog") ?? document.body;

  return createPortal(
    <AnimatePresence>{open && <PopoverPanel key="popover" ref={ref} {...props} />}</AnimatePresence>,
    container,
  );
});
PopoverContent.displayName = "PopoverContent";

export interface PopoverCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge close behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(
  (raw, ref) => {
    const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
    const { setOpen } = usePopover("PopoverClose");

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) setOpen(false);
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...props} onClick={handleClick}>
          {children}
        </Slot>
      );
    }

    return (
      <button ref={ref} type="button" {...props} onClick={handleClick}>
        {children}
      </button>
    );
  },
);
PopoverClose.displayName = "PopoverClose";

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose };
