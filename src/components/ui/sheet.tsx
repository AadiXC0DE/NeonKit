"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

/** The single element in `node`. Server Components can pass it as a lazy reference, which Children resolves. */
function resolveElement<P = Record<string, unknown>>(node: React.ReactNode): React.ReactElement<P> | null {
  const [child] = React.Children.toArray(node);
  return React.isValidElement<P>(child) ? child : null;
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

const EASE = [0.23, 1, 0.32, 1] as const;

type Side = "top" | "right" | "bottom" | "left";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  color?: NeonColor;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
  triggerRef: { current: HTMLElement | null };
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet(component: string) {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Sheet>.`);
  return context;
}

// Lets SheetHeader start the drag of a bottom sheet, like the handle does.
const SheetDragContext = React.createContext<((event: React.PointerEvent) => void) | null>(null);

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

/** Merges props onto its single child element. The child's onClick runs first and can preventDefault. */
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>(
  ({ children, className, onClick, ...props }, forwardedRef) => {
    const child = resolveElement<React.HTMLAttributes<HTMLElement>>(children);
    const ref = useComposedRefs(forwardedRef, child ? getElementRef(child) : undefined);
    if (!child) return null;

    return React.cloneElement(child, {
      ...props,
      className: cn(child.props.className, className),
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) onClick?.(event);
      },
      ref,
    } as React.HTMLAttributes<HTMLElement>);
  },
);
Slot.displayName = "SheetSlot";

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  children?: React.ReactNode;
}

function Sheet({ open: openProp, defaultOpen = false, onOpenChange, color, children }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [hasDescription, setHasDescription] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const id = React.useId();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  const value = React.useMemo<SheetContextValue>(
    () => ({
      open,
      setOpen,
      color,
      contentId: `${id}-content`,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      hasDescription,
      setHasDescription,
      triggerRef,
    }),
    [open, setOpen, color, id, hasDescription],
  );

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}
Sheet.displayName = "Sheet";

export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge trigger behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  (raw, ref) => {
    const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
    const { open, setOpen, contentId, triggerRef } = useSheet("SheetTrigger");

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      triggerRef.current = event.currentTarget;
      setOpen(true);
    };

    const triggerProps = {
      ...props,
      "aria-haspopup": "dialog" as const,
      "aria-expanded": open,
      "aria-controls": open ? contentId : undefined,
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...triggerProps} onClick={handleClick}>
          {children}
        </Slot>
      );
    }

    return (
      <button ref={ref} type="button" {...triggerProps} onClick={handleClick}>
        {children}
      </button>
    );
  },
);
SheetTrigger.displayName = "SheetTrigger";

const sizes: Record<"x" | "y", Record<"sm" | "md" | "lg" | "full", string>> = {
  x: { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", full: "max-w-none" },
  y: { sm: "max-h-[40dvh]", md: "max-h-[65dvh]", lg: "max-h-[85dvh]", full: "h-dvh max-h-none" },
};

const positions: Record<Side, string> = {
  right: "inset-y-0 right-0 flex w-full justify-end",
  left: "inset-y-0 left-0 flex w-full justify-start",
  top: "inset-x-0 top-0 flex justify-center",
  bottom: "inset-x-0 bottom-0 flex justify-center",
};

const panels: Record<Side, string> = {
  right: "h-full w-full border-l",
  left: "h-full w-full border-r",
  top: "w-full rounded-b-2xl border-b",
  bottom: "w-full rounded-t-2xl border-t",
};

const offscreen: Record<Side, { x?: string; y?: string }> = {
  right: { x: "100%" },
  left: { x: "-100%" },
  top: { y: "-100%" },
  bottom: { y: "100%" },
};

// The edge that faces the page is a tube: a hot core with colored falloff on either side.
const tubes: Record<Side, string> = {
  right: "inset-y-0 -left-[1.5px] w-[3px] bg-[linear-gradient(90deg,rgb(var(--neon)/0.55),rgb(var(--neon))_35%,rgb(255_255_255/0.85)_50%,rgb(var(--neon))_65%,rgb(var(--neon)/0.55))]",
  left: "inset-y-0 -right-[1.5px] w-[3px] bg-[linear-gradient(90deg,rgb(var(--neon)/0.55),rgb(var(--neon))_35%,rgb(255_255_255/0.85)_50%,rgb(var(--neon))_65%,rgb(var(--neon)/0.55))]",
  top: "inset-x-8 -bottom-[1.5px] h-[3px] rounded-full bg-[linear-gradient(180deg,rgb(var(--neon)/0.55),rgb(var(--neon))_35%,rgb(255_255_255/0.85)_50%,rgb(var(--neon))_65%,rgb(var(--neon)/0.55))]",
  bottom: "inset-x-8 -top-[1.5px] h-[3px] rounded-full bg-[linear-gradient(180deg,rgb(var(--neon)/0.55),rgb(var(--neon))_35%,rgb(255_255_255/0.85)_50%,rgb(var(--neon))_65%,rgb(var(--neon)/0.55))]",
};

// The light the tube throws onto the panel's own surface.
const spills: Record<Side, string> = {
  right: "inset-y-0 left-0 w-20 bg-[linear-gradient(90deg,rgb(var(--neon)/0.09),transparent)]",
  left: "inset-y-0 right-0 w-20 bg-[linear-gradient(270deg,rgb(var(--neon)/0.09),transparent)]",
  top: "inset-x-0 bottom-0 h-16 bg-[linear-gradient(0deg,rgb(var(--neon)/0.09),transparent)]",
  bottom: "inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgb(var(--neon)/0.09),transparent)]",
};

const ignite = `@keyframes neonkit-sheet-ignite{0%{opacity:0}12%{opacity:.8}22%{opacity:.2}40%{opacity:1}52%{opacity:.5}68%,100%{opacity:1}}`;

export interface SheetContentProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "color" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  /** The edge the panel slides in from. */
  side?: Side;
  /** Width for left and right sheets, maximum height for top and bottom ones. */
  size?: "sm" | "md" | "lg" | "full";
  /** Renders the X button in the top-right corner. */
  showClose?: boolean;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", size = "md", showClose = true, className, style, children, ...props }, ref) => {
    const { open, setOpen, color, contentId, titleId, descriptionId, hasDescription, triggerRef } =
      useSheet("SheetContent");
    const reduceMotion = useReducedMotion();
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, panelRef);
    const saved = React.useRef<{ overflow: string; focus: HTMLElement | null } | null>(null);
    const dragControls = useDragControls();
    const dragY = useMotionValue(0);
    // The backdrop thins out as the sheet is pulled down.
    const backdropOpacity = useTransform(dragY, [0, 360], [1, 0.25]);
    const [dragging, setDragging] = React.useState(false);
    const draggable = side === "bottom";

    React.useLayoutEffect(() => {
      const dialog = dialogRef.current;
      if (!open || !dialog || dialog.open) return;

      // Safari doesn't focus buttons on click, so fall back to the trigger that was pressed.
      const active = document.activeElement;
      saved.current = {
        overflow: document.documentElement.style.overflow,
        focus: active instanceof HTMLElement && active !== document.body ? active : triggerRef.current,
      };
      triggerRef.current = null;
      dragY.set(0);
      document.documentElement.style.overflow = "hidden";
      dialog.showModal();
      // showModal focuses the first control while the panel is still offscreen, and the browser can
      // scroll the dialog to bring it into view. Undo that so the panel lands where it should.
      dialog.scrollTop = 0;
      dialog.scrollLeft = 0;
    }, [open, triggerRef, dragY]);

    React.useEffect(
      () => () => {
        if (saved.current) document.documentElement.style.overflow = saved.current.overflow;
      },
      [],
    );

    // The <dialog> stays open while the panel slides out, then closes for real here.
    const finish = () => {
      const dialog = dialogRef.current;
      // Only take focus back if it is still ours: inside the sheet or lost to the page.
      const active = document.activeElement;
      const ours = !active || active === document.body || (dialog?.contains(active) ?? false);
      if (dialog?.open) dialog.close();
      const restore = saved.current;
      saved.current = null;
      if (!restore) return;
      document.documentElement.style.overflow = restore.overflow;
      const target = restore.focus;
      // Skip a trigger that has since been removed or hidden, e.g. a menu button only shown on mobile.
      const visible = typeof target?.checkVisibility !== "function" || target.checkVisibility();
      if (ours && target?.isConnected && visible) target.focus({ preventScroll: true });
    };

    const startDrag = React.useCallback(
      (event: React.PointerEvent) => {
        const target = event.target as HTMLElement;
        if (event.button !== 0 || target.closest("button, a, input, textarea, select, [contenteditable]")) return;
        dragControls.start(event);
      },
      [dragControls],
    );

    const axis = side === "left" || side === "right" ? "x" : "y";
    const hidden = reduceMotion ? { opacity: 0 } : { opacity: 1, ...offscreen[side] };
    const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 };
    const enter = { duration: reduceMotion ? 0.15 : 0.28, ease: EASE };
    const exit = { duration: reduceMotion ? 0.12 : 0.2, ease: EASE };

    return (
      <dialog
        ref={dialogRef}
        id={contentId}
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        onCancel={(event) => {
          // React passes a nested dialog's cancel up to every ancestor's handler; only Escape on this one counts.
          if (event.target !== event.currentTarget) return;
          // Escape: let the exit animation run instead of closing instantly.
          event.preventDefault();
          setOpen(false);
        }}
        onClose={(event) => {
          if (event.target !== event.currentTarget) return;
          if (!dialogRef.current?.open) setOpen(false);
        }}
        style={neonVars(color)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white/90 outline-none backdrop:bg-transparent",
        )}
      >
        <AnimatePresence onExitComplete={finish}>
          {open && (
            <motion.div
              key="overlay"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: exit }}
              transition={enter}
              onClick={() => setOpen(false)}
              className="absolute inset-0"
            >
              <motion.div
                style={{ opacity: draggable ? backdropOpacity : 1 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
              />
            </motion.div>
          )}
          {open && (
            <motion.div
              key="panel"
              initial={hidden}
              animate={shown}
              exit={{ ...hidden, transition: exit }}
              transition={enter}
              className={cn("pointer-events-none absolute", positions[side])}
            >
              <motion.div
                ref={composedRef}
                drag={draggable && !reduceMotion ? "y" : false}
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.04, bottom: 1 }}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 45 }}
                onDragStart={() => setDragging(true)}
                onDragEnd={(_, info) => {
                  setDragging(false);
                  const height = panelRef.current?.offsetHeight ?? 0;
                  if (info.offset.y > Math.min(height * 0.3, 180) || info.velocity.y > 650) {
                    // Hold where the finger let go and let the exit slide carry it off, instead of snapping back first.
                    dragY.stop();
                    setOpen(false);
                  }
                }}
                style={{ ...style, y: draggable ? dragY : undefined }}
                className={cn(
                  "pointer-events-auto relative flex flex-col border-white/10 bg-[#0a0b11] text-white/90",
                  "shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_24px_80px_-12px_rgb(0_0_0/0.9)]",
                  panels[side],
                  sizes[axis][size],
                  className,
                )}
                {...props}
              >
                <span aria-hidden className={cn("pointer-events-none absolute", spills[side])} />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute z-10",
                    "shadow-[0_0_6px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_18px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),0_0_44px_rgb(var(--neon)/CALC(0.25*var(--neon-glow,1)))]",
                    "[animation:neonkit-sheet-ignite_380ms_linear_160ms_both] motion-reduce:[animation:none]",
                    tubes[side],
                  )}
                />
                <style>{ignite}</style>

                {draggable && (
                  <div
                    aria-hidden
                    onPointerDown={startDrag}
                    className="flex h-7 shrink-0 cursor-grab touch-none items-end justify-center active:cursor-grabbing"
                  >
                    <span
                      className={cn(
                        "h-1 w-10 rounded-full transition-[background-color,box-shadow] duration-150",
                        dragging
                          ? "bg-[rgb(var(--neon)/0.85)] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1)))]"
                          : "bg-white/20",
                      )}
                    />
                  </div>
                )}

                <SheetDragContext.Provider value={draggable && !reduceMotion ? startDrag : null}>
                  <div
                    className={cn(
                      "relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
                      "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
                      draggable ? "px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3" : "p-6",
                    )}
                  >
                    {children}
                  </div>
                </SheetDragContext.Provider>

                {showClose && (
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "absolute right-3.5 flex size-8 items-center justify-center rounded-lg text-white/50 outline-none",
                      "transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.97]",
                      "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]",
                      draggable ? "top-[30px]" : "top-3.5",
                    )}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    );
  },
);
SheetContent.displayName = "SheetContent";

const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onPointerDown, ...props }, ref) => {
    const startDrag = React.useContext(SheetDragContext);
    return (
      <div
        ref={ref}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (!event.defaultPrevented) startDrag?.(event);
        }}
        className={cn("flex flex-col gap-1.5 pr-8", startDrag && "touch-none", className)}
        {...props}
      />
    );
  },
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-auto flex flex-col-reverse gap-2 pt-6 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  ),
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId } = useSheet("SheetTitle");
    return (
      <h2
        ref={ref}
        className={cn("text-base font-semibold leading-6 tracking-[-0.01em] text-white/90", className)}
        {...props}
        id={titleId}
      />
    );
  },
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId, setHasDescription } = useSheet("SheetDescription");

    React.useLayoutEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);

    return (
      <p
        ref={ref}
        className={cn("text-sm leading-6 text-white/55", className)}
        {...props}
        id={descriptionId}
      />
    );
  },
);
SheetDescription.displayName = "SheetDescription";

export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge close behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  (raw, ref) => {
    const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
    const { setOpen } = useSheet("SheetClose");

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
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
SheetClose.displayName = "SheetClose";

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
};
