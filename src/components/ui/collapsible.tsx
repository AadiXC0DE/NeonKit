"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";

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

const EASE = [0.23, 1, 0.32, 1] as const;

// Overflow is clipped only while the height moves, so focus rings inside aren't cut off at rest.
const variants: Variants = {
  open: { height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } },
  closed: { height: 0, opacity: 0, overflow: "hidden" },
};

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function useComposedRefs<T>(a: PossibleRef<T>, b: PossibleRef<T>) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node);
      setRef(b, node);
    },
    [a, b],
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

/** Merges props and refs onto its single child element. The child's handlers run first. */
const Slot = React.forwardRef<HTMLElement, AnyProps & { children?: React.ReactNode }>(
  ({ children, ...props }, forwardedRef) => {
    const child = React.isValidElement<AnyProps>(children) ? children : null;
    const ref = useComposedRefs(forwardedRef, child ? getElementRef(child) : undefined);
    if (!child) return null;

    const merged: AnyProps = { ...props };
    for (const key of Object.keys(child.props)) {
      const ours = props[key];
      const theirs = child.props[key];
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
    return React.cloneElement(child, { ...merged, ref } as AnyProps);
  },
);
Slot.displayName = "CollapsibleSlot";

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
  contentId: string;
  reduceMotion: boolean;
  /** Counts closed-to-open changes so the edge light replays, but not for content that starts open. */
  openings: number;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible(component: string) {
  const context = React.useContext(CollapsibleContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Collapsible>.`);
  return context;
}

export interface CollapsibleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Blocks toggling from the trigger. */
  disabled?: boolean;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  (
    { open: openProp, defaultOpen = false, onOpenChange, disabled = false, color, className, style, ...props },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : uncontrolledOpen;
    const id = React.useId();
    const reduceMotion = useReducedMotion() ?? false;

    const [openings, setOpenings] = React.useState(0);
    const [previous, setPrevious] = React.useState(open);
    if (previous !== open) {
      setPrevious(open);
      if (open) setOpenings((count) => count + 1);
    }

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (next === open) return;
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [open, isControlled, onOpenChange],
    );

    const value = React.useMemo<CollapsibleContextValue>(
      () => ({ open, setOpen, disabled, contentId: `${id}-content`, reduceMotion, openings }),
      [open, setOpen, disabled, id, reduceMotion, openings],
    );

    return (
      <CollapsibleContext.Provider value={value}>
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          data-disabled={disabled ? "" : undefined}
          style={neonVars(color, style)}
          className={cn("[--neon:var(--neon-accent,34_211_238)]", className)}
          {...props}
        />
      </CollapsibleContext.Provider>
    );
  },
);
Collapsible.displayName = "Collapsible";

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge trigger behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  (raw, ref) => {
    const { asChild = false, className, onClick, children, ...props } = fromRenderProp(raw);
    const { open, setOpen, disabled, contentId } = useCollapsible("CollapsibleTrigger");

    const triggerProps = {
      ...props,
      "aria-expanded": open,
      "aria-controls": open ? contentId : undefined,
      "aria-disabled": disabled || undefined,
      "data-state": open ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) setOpen(!open);
      },
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...triggerProps} className={className}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "inline-flex cursor-pointer select-none items-center gap-2 rounded-md text-sm font-medium text-white/80 outline-none",
          "transition-colors duration-150 ease-out hover:text-white",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...triggerProps}
      >
        {children}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "size-4 shrink-0 transition-[transform,color,filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            open
              ? "rotate-180 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.7))]"
              : "text-white/40",
          )}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Keep the content in the DOM while closed (hidden), e.g. to preserve form state. */
  forceMount?: boolean;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ forceMount = false, className, children, ...props }, ref) => {
    const { open, contentId, reduceMotion, openings } = useCollapsible("CollapsibleContent");
    const transition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: EASE };

    // With forceMount, `hidden` lands only after the collapse finishes so it stays visible.
    const [settledClosed, setSettledClosed] = React.useState(!open);
    if (open && settledClosed) setSettledClosed(false);

    const content = (
      <div ref={ref} id={contentId} data-state={open ? "open" : "closed"} className={className} {...props}>
        {children}
      </div>
    );

    // A line of light draws down the revealed edge as it opens, then cools off.
    const edge = open && openings > 0 && !reduceMotion && (
      <motion.span
        key={openings}
        aria-hidden
        data-collapsible-edge=""
        initial={{ scaleY: 0, opacity: 1 }}
        animate={{ scaleY: 1, opacity: 0 }}
        transition={{
          scaleY: { duration: 0.26, ease: EASE },
          opacity: { duration: 0.7, delay: 0.3, ease: "easeOut" },
        }}
        className="pointer-events-none absolute inset-y-0 left-0 w-px origin-top bg-[linear-gradient(180deg,rgb(var(--neon)/0.15),rgb(var(--neon)))] shadow-[0_0_8px_rgb(var(--neon)/0.8)]"
      />
    );

    if (forceMount) {
      return (
        <motion.div
          initial={false}
          animate={open ? "open" : "closed"}
          variants={variants}
          transition={transition}
          onAnimationComplete={() => {
            if (!open) setSettledClosed(true);
          }}
          hidden={!open && settledClosed}
          className="relative"
        >
          {content}
          {edge}
        </motion.div>
      );
    }

    return (
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={transition}
            className="relative"
          >
            {content}
            {edge}
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
