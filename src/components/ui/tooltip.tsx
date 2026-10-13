"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { autoUpdate, flip, shift, useFloating, type Placement } from "@floating-ui/react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

/** The single element in `node`. Server Components can pass it as a lazy reference, which Children resolves. */
function resolveElement<P = Record<string, unknown>>(node: React.ReactNode): React.ReactElement<P> | null {
  const [child] = React.Children.toArray(node);
  return React.isValidElement<P>(child) ? child : null;
}

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const EASE = [0.23, 1, 0.32, 1] as const;
const SKIP_DELAY_WINDOW = 300;

const subscribeNever = () => () => {};
const useIsClient = () =>
  React.useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

// Shared by every tooltip: once one has been open, the next opens without a delay.
let lastClosedAt = 0;

function markClosed() {
  lastClosedAt = Date.now();
}

function closedRecently() {
  return Date.now() - lastClosedAt < SKIP_DELAY_WINDOW;
}

function isFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

// The gap is padding on the positioned box, so moving the pointer from the
// trigger onto the bubble never leaves the wrapper.
const gaps: Record<Side, string> = {
  top: "pb-2",
  bottom: "pt-2",
  left: "pr-2",
  right: "pl-2",
};

const arrowSides: Record<Side, string> = {
  top: "-bottom-1 border-b border-r",
  bottom: "-top-1 border-l border-t",
  left: "-right-1 border-r border-t",
  right: "-left-1 border-b border-l",
};

const arrowAligns: Record<"x" | "y", Record<Align, string>> = {
  x: { start: "left-2.5", center: "left-1/2 -ml-1", end: "right-2.5" },
  y: { start: "top-2.5", center: "top-1/2 -mt-1", end: "bottom-2.5" },
};

// Where the arrow sits, so the bubble grows out of it.
const origins: Record<Align, string> = {
  start: "14px",
  center: "50%",
  end: "calc(100% - 14px)",
};

// The bubble starts nudged toward the trigger and settles outward.
const nudges: Record<Side, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

export interface TooltipProps
  extends Omit<
    React.HTMLAttributes<HTMLSpanElement>,
    "content" | "color" | "children" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  content: React.ReactNode;
  /** The trigger. A single element that accepts focus and ARIA props. */
  children: React.ReactElement;
  side?: Side;
  align?: Align;
  /** Milliseconds before opening on hover. Closing is immediate. */
  delay?: number;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      content,
      children,
      side = "top",
      align = "center",
      delay = 300,
      color,
      disabled = false,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const reduceMotion = useReducedMotion();
    const isClient = useIsClient();
    const [anchor, setAnchor] = React.useState<HTMLSpanElement | null>(null);
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const [instant, setInstant] = React.useState(false);
    const timer = React.useRef<number | undefined>(undefined);
    const isControlled = openProp !== undefined;
    const open = !disabled && (isControlled ? openProp : uncontrolledOpen);

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (next === open) return;
        if (!next) markClosed();
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [open, isControlled, onOpenChange],
    );

    React.useEffect(() => () => window.clearTimeout(timer.current), []);

    React.useEffect(() => {
      if (!open) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        // Close the tooltip first, not the dialog or menu it sits in.
        event.preventDefault();
        setOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, setOpen]);

    const show = (immediate: boolean) => {
      if (disabled) return;
      window.clearTimeout(timer.current);
      const sequential = closedRecently();
      if (immediate || sequential || delay <= 0) {
        setInstant(sequential);
        setOpen(true);
        return;
      }
      timer.current = window.setTimeout(() => {
        setInstant(false);
        setOpen(true);
      }, delay);
    };

    const hide = () => {
      window.clearTimeout(timer.current);
      setOpen(false);
    };

    // Server Components can pass the trigger as a lazy reference; resolve it before reading props.
    const child = resolveElement<React.HTMLAttributes<HTMLElement>>(children) ?? <span>{children}</span>;
    const describedBy =
      [child.props["aria-describedby"], open ? id : undefined].filter(Boolean).join(" ") ||
      undefined;

    const trigger = React.cloneElement(child, {
      "aria-describedby": describedBy,
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        child.props.onFocus?.(event);
        if (!event.defaultPrevented && isFocusVisible(event.currentTarget)) show(true);
      },
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        child.props.onBlur?.(event);
        hide();
      },
    });

    // Flips to the opposite side and shifts along the edge to stay on screen.
    const { refs, floatingStyles, placement } = useFloating({
      placement: (align === "center" ? side : `${side}-${align}`) as Placement,
      strategy: "fixed",
      whileElementsMounted: autoUpdate,
      middleware: [flip({ padding: 8 }), shift({ padding: 8 })],
    });
    const [placedSide, placedAlign = "center"] = placement.split("-") as [Side, Align | undefined];

    const { setReference, setFloating } = refs;
    const anchorRef = React.useCallback(
      (node: HTMLSpanElement | null) => {
        setReference(node);
        setAnchor(node);
      },
      [setReference],
    );

    // The bubble is portaled so an overflow:hidden, masked or transformed ancestor can't clip it.
    // A modal <dialog> makes the page outside it inert, so inside one it renders into the dialog.
    // Leaving the subtree also leaves the trigger's color behind, so carry it across.
    const container = isClient && anchor ? ((anchor.closest("dialog") as HTMLElement | null) ?? document.body) : null;
    const inherited = React.useMemo(() => {
      if (!open || !anchor) return undefined;
      const rgb = getComputedStyle(anchor).getPropertyValue("--neon").trim();
      return rgb ? ({ "--neon": rgb, "--neon-accent": rgb } as React.CSSProperties) : undefined;
    }, [open, anchor]);

    const axis = placedSide === "top" || placedSide === "bottom" ? "x" : "y";
    const along = origins[placedAlign];
    const transformOrigin = {
      top: `${along} 100%`,
      bottom: `${along} 0%`,
      left: `100% ${along}`,
      right: `0% ${along}`,
    }[placedSide];

    return (
      <span
        ref={anchorRef}
        className="relative inline-flex"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") show(false);
        }}
        onPointerLeave={hide}
        onPointerDown={hide}
      >
        {trigger}
        {container &&
          createPortal(
            <AnimatePresence>
              {open && (
                <span key="tooltip" ref={setFloating} style={floatingStyles} className={cn("z-50", gaps[placedSide])}>
                  <motion.span
                    ref={ref}
                    id={id}
                    role="tooltip"
                    initial={
                      instant
                        ? false
                        : reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.96, ...nudges[placedSide] }
                    }
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0, transition: { duration: 0.1 } }
                        : { opacity: 0, scale: 0.96, transition: { duration: 0.1, ease: EASE } }
                    }
                    transition={{ duration: 0.15, ease: EASE }}
                    style={{ ...inherited, ...neonVars(color, style), transformOrigin }}
                    className={cn(
                      "[--neon:var(--neon-accent,34_211_238)]",
                      "relative block w-max whitespace-nowrap rounded-lg border border-[rgb(var(--neon)/0.4)] bg-[#0a0b11] px-2.5 py-1.5 text-xs leading-4 text-white/90",
                      "shadow-[0_0_14px_-2px_rgb(var(--neon)/0.35),0_8px_20px_-8px_rgb(0_0_0/0.8)]",
                      className,
                    )}
                    {...props}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute size-2 rotate-45 border-[rgb(var(--neon)/0.4)] bg-[#0a0b11]",
                        arrowSides[placedSide],
                        arrowAligns[axis][placedAlign],
                      )}
                    />
                    {content}
                  </motion.span>
                </span>
              )}
            </AnimatePresence>,
            container,
          )}
      </span>
    );
  },
);
Tooltip.displayName = "Tooltip";

export { Tooltip };
