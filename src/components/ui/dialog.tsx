"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

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

interface DialogContextValue {
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

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog(component: string) {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Dialog>.`);
  return context;
}

/** Merges props onto its single child element, chaining the child's own onClick. */
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, onClick, ...props }, ref) => {
    if (!React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)) return null;
    const child = children;

    return React.cloneElement(child, {
      ...props,
      className: cn(child.props.className, className),
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) onClick?.(event);
      },
      ...(ref ? { ref } : null),
    } as React.HTMLAttributes<HTMLElement>);
  },
);
Slot.displayName = "DialogSlot";

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  children?: React.ReactNode;
}

function Dialog({ open: openProp, defaultOpen = false, onOpenChange, color, children }: DialogProps) {
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

  const value = React.useMemo<DialogContextValue>(
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

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}
Dialog.displayName = "Dialog";

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge trigger behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  (raw, ref) => {
    const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
    const { open, setOpen, contentId, triggerRef } = useDialog("DialogTrigger");

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
DialogTrigger.displayName = "DialogTrigger";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export interface DialogContentProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "color" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  size?: keyof typeof sizes;
  /** Renders the X button in the top-right corner. */
  showClose?: boolean;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ size = "md", showClose = true, className, children, ...props }, ref) => {
    const { open, setOpen, color, contentId, titleId, descriptionId, hasDescription, triggerRef } =
      useDialog("DialogContent");
    const reduceMotion = useReducedMotion();
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const saved = React.useRef<{ overflow: string; focus: HTMLElement | null } | null>(null);

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
      document.documentElement.style.overflow = "hidden";
      dialog.showModal();
    }, [open, triggerRef]);

    React.useEffect(
      () => () => {
        if (saved.current) document.documentElement.style.overflow = saved.current.overflow;
      },
      [],
    );

    // The <dialog> stays open while the panel animates out, then closes for real here.
    const finish = () => {
      const dialog = dialogRef.current;
      if (dialog?.open) dialog.close();
      const restore = saved.current;
      saved.current = null;
      if (!restore) return;
      document.documentElement.style.overflow = restore.overflow;
      if (restore.focus?.isConnected) restore.focus.focus({ preventScroll: true });
    };

    const enter = { duration: reduceMotion ? 0.15 : 0.22, ease: EASE };
    const exit = { duration: reduceMotion ? 0.12 : 0.16, ease: EASE };
    const hiddenPanel = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 };

    return (
      <dialog
        ref={dialogRef}
        id={contentId}
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        onCancel={(event) => {
          // Escape: let the exit animation run instead of closing instantly.
          event.preventDefault();
          setOpen(false);
        }}
        onClose={() => {
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
          )}
          {open && (
            <div
              key="viewport"
              className="pointer-events-none absolute inset-0 overflow-y-auto overscroll-contain"
            >
              <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <motion.div
                  ref={ref}
                  initial={hiddenPanel}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ ...hiddenPanel, transition: exit }}
                  transition={enter}
                  className={cn(
                    "pointer-events-auto relative w-full rounded-2xl border border-[rgb(var(--neon)/0.18)] bg-[#0a0b11] p-6 text-white/90",
                    "shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_24px_64px_-16px_rgb(0_0_0/0.9),0_0_80px_-24px_rgb(var(--neon)/0.35)]",
                    sizes[size],
                    className,
                  )}
                  {...props}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-10 -top-px h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.8),transparent)]"
                  />
                  {children}
                  {showClose && (
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "absolute right-3.5 top-3.5 flex size-8 items-center justify-center rounded-lg text-white/45 outline-none",
                        "transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.97]",
                        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]",
                      )}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  )}
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </dialog>
    );
  },
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
  ),
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  ),
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId } = useDialog("DialogTitle");
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
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { descriptionId, setHasDescription } = useDialog("DialogDescription");

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
});
DialogDescription.displayName = "DialogDescription";

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge close behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  (raw, ref) => {
    const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
    const { setOpen } = useDialog("DialogClose");

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
DialogClose.displayName = "DialogClose";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
