"use client";

import * as React from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

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
const DANGER = toNeonRgb("red");

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

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  color?: NeonColor;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
  triggerRef: { current: HTMLElement | null };
  cancelRef: { current: HTMLButtonElement | null };
  actionRef: { current: HTMLButtonElement | null };
  confirmRef: { current: HTMLInputElement | null };
  confirmText?: string;
  typed: string;
  setTyped: (value: string) => void;
  /** True once nothing stands between the user and the action. */
  confirmable: boolean;
  /** The action's variant, so the confirmation letters light in the same color. */
  tone: "default" | "danger";
  setTone: (tone: "default" | "danger") => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialog(component: string) {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <AlertDialog>.`);
  return context;
}

/** Merges props onto its single child element, chaining the child's own onClick. */
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, onClick, ...props }, ref) => {
    const child = resolveElement<React.HTMLAttributes<HTMLElement>>(children);
    if (!child) return null;

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
Slot.displayName = "AlertDialogSlot";

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /**
   * The text someone has to type before the action unlocks, such as a project name.
   * Render an AlertDialogConfirmInput to collect it.
   */
  confirmText?: string;
  children?: React.ReactNode;
}

function AlertDialog({ open: openProp, defaultOpen = false, onOpenChange, color, confirmText, children }: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [hasDescription, setHasDescription] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [tone, setTone] = React.useState<"default" | "danger">("default");
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const actionRef = React.useRef<HTMLButtonElement | null>(null);
  const confirmRef = React.useRef<HTMLInputElement | null>(null);
  const id = React.useId();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  // Every opening starts from an empty confirmation, so the action is never pre-armed.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped("");
  }

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  const confirmable = !confirmText || typed === confirmText;

  const value = React.useMemo<AlertDialogContextValue>(
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
      cancelRef,
      actionRef,
      confirmRef,
      confirmText,
      typed,
      setTyped,
      confirmable,
      tone,
      setTone,
    }),
    [open, setOpen, color, id, hasDescription, confirmText, typed, confirmable, tone],
  );

  return <AlertDialogContext.Provider value={value}>{children}</AlertDialogContext.Provider>;
}
AlertDialog.displayName = "AlertDialog";

export interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge trigger behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>((raw, ref) => {
  const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
  const { open, setOpen, contentId, triggerRef } = useAlertDialog("AlertDialogTrigger");

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
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

const sizes = {
  sm: "max-w-[400px]",
  md: "max-w-[460px]",
} as const;

export interface AlertDialogContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> {
  size?: keyof typeof sizes;
  /** What takes focus on open. Cancel by default, so a stray Enter never confirms. */
  initialFocus?: "cancel" | "action" | "confirm";
}

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ size = "sm", initialFocus = "cancel", className, style, children, ...props }, ref) => {
    const {
      open,
      setOpen,
      color,
      contentId,
      titleId,
      descriptionId,
      hasDescription,
      triggerRef,
      cancelRef,
      actionRef,
      confirmRef,
      tone,
    } = useAlertDialog("AlertDialogContent");
    const reduceMotion = useReducedMotion();
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const saved = React.useRef<{ overflow: string; focus: HTMLElement | null } | null>(null);
    const [scope, animate] = useAnimate<HTMLDivElement>();

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

      const target =
        initialFocus === "confirm"
          ? confirmRef.current
          : initialFocus === "action" && !actionRef.current?.disabled
            ? actionRef.current
            : cancelRef.current;
      target?.focus({ preventScroll: true });
    }, [open, triggerRef, initialFocus, cancelRef, actionRef, confirmRef]);

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

    // An alert has to be answered, so a click outside only nudges the panel.
    const nudge = () => {
      if (!scope.current) return;
      if (reduceMotion) {
        animate(scope.current, { opacity: [1, 0.85, 1] }, { duration: 0.24 });
        return;
      }
      animate(scope.current, { scale: [1, 1.018, 0.996, 1] }, { duration: 0.32, ease: EASE });
    };

    const enter = { duration: reduceMotion ? 0.15 : 0.22, ease: EASE };
    const exit = { duration: reduceMotion ? 0.12 : 0.15, ease: EASE };
    const hiddenPanel = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 };

    return (
      <dialog
        ref={dialogRef}
        id={contentId}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        onCancel={(event) => {
          // React also hands a nested dialog's cancel to this handler; only answer our own.
          if (event.target !== event.currentTarget) return;
          // Escape cancels, after the exit animation instead of instantly.
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
          "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-clip border-0 bg-transparent p-0 text-white/90 outline-none backdrop:bg-transparent",
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
              onPointerDown={nudge}
              className="absolute inset-0 bg-black/65 backdrop-blur-[6px]"
            />
          )}
          {open && (
            <div key="viewport" className="pointer-events-none absolute inset-0 overflow-y-auto overscroll-contain">
              <div className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
                <div ref={scope} className={cn("w-full", sizes[size])}>
                  <motion.div
                    ref={ref}
                    initial={hiddenPanel}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ ...hiddenPanel, transition: exit }}
                    transition={enter}
                    style={tone === "danger" ? ({ "--nk-alert-tube": DANGER, ...style } as React.CSSProperties) : style}
                    className={cn(
                      "pointer-events-auto relative w-full rounded-2xl border border-white/10 bg-[#0a0b11] p-6 text-white/90",
                      "shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_32px_80px_-20px_rgb(0_0_0/0.95)]",
                      className,
                    )}
                    {...props}
                  >
                    {children}
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </dialog>
    );
  },
);
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />,
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end", className)}
      {...props}
    />
  ),
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId } = useAlertDialog("AlertDialogTitle");
    return (
      <h2
        ref={ref}
        className={cn("text-[17px] font-semibold leading-6 tracking-[-0.015em] text-white/95", className)}
        {...props}
        id={titleId}
      />
    );
  },
);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId, setHasDescription } = useAlertDialog("AlertDialogDescription");

    React.useLayoutEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);

    return (
      <p
        ref={ref}
        className={cn("text-sm leading-6 text-white/60 [&_strong]:font-medium [&_strong]:text-white/85", className)}
        {...props}
        id={descriptionId}
      />
    );
  },
);
AlertDialogDescription.displayName = "AlertDialogDescription";

export interface AlertDialogConfirmInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "color"> {
  /** Replaces the default "Type … to confirm" label. */
  label?: React.ReactNode;
}

/**
 * Collects the AlertDialog's `confirmText`. The label spells the text out, and each character
 * lights up as it's typed correctly, like a sign coming on letter by letter.
 */
const AlertDialogConfirmInput = React.forwardRef<HTMLInputElement, AlertDialogConfirmInputProps>(
  ({ className, label, id: idProp, onKeyDown, ...props }, forwardedRef) => {
    const { confirmText = "", typed, setTyped, confirmable, actionRef, confirmRef } =
      useAlertDialog("AlertDialogConfirmInput");
    const ref = useComposedRefs(forwardedRef, confirmRef);
    const autoId = React.useId();
    const id = idProp ?? autoId;

    // How much of the target has been typed correctly so far.
    let matched = 0;
    while (matched < typed.length && matched < confirmText.length && typed[matched] === confirmText[matched]) matched++;
    const wrong = typed.length > matched;

    return (
      <div className="mt-5 grid gap-2 [--tube:var(--nk-alert-tube,var(--neon))]">
        <label htmlFor={id} className="w-fit text-[13px] leading-5 text-white/60">
          {label ?? (
            <>
              Type{" "}
              <span className="font-mono text-white/50">
                <span aria-hidden>
                  {confirmText.split("").map((char, index) => (
                    <span
                      key={index}
                      className={cn(
                        "transition-[color,text-shadow] duration-150",
                        index < matched &&
                          "text-[rgb(var(--tube))] [text-shadow:0_0_8px_rgb(var(--tube)/0.7)]",
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="sr-only">{confirmText}</span>
              </span>{" "}
              to confirm
            </>
          )}
        </label>
        <input
          ref={ref}
          id={id}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.key !== "Enter") return;
            event.preventDefault();
            if (confirmable) actionRef.current?.click();
          }}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={wrong || undefined}
          className={cn(
            "[--tube:var(--nk-alert-tube,var(--neon))]",
            "h-10 w-full rounded-lg border bg-white/[0.03] px-3 font-mono text-sm text-white/90 outline-none",
            "transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-white/25",
            wrong
              ? "border-[#ff4d5e]/50 focus:border-[#ff4d5e]/80"
              : "border-white/10 hover:[&:not(:focus)]:border-white/20 focus:border-[rgb(var(--tube)/0.7)] focus:shadow-[0_0_0_1px_rgb(var(--tube)/0.15),0_0_18px_-6px_rgb(var(--tube)/0.6)]",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
AlertDialogConfirmInput.displayName = "AlertDialogConfirmInput";

const ignite = `@keyframes nk-alert-ignite{0%{opacity:0}10%{opacity:.8}16%{opacity:.15}30%{opacity:1}38%{opacity:.4}55%,100%{opacity:1}}`;

export interface AlertDialogActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** `danger` is a red tube; `default` follows the dialog's color. */
  variant?: "default" | "danger";
  /** Keeps the dialog open with a busy state, e.g. while a delete request runs. */
  loading?: boolean;
}

/**
 * The confirming button. It sits as a dim, unlit tube until the action is allowed, then
 * flickers on. Clicking it closes the dialog unless the handler calls preventDefault.
 */
const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ className, style, variant = "default", loading = false, disabled, onClick, children, ...props }, forwardedRef) => {
    const { setOpen, confirmable, actionRef, setTone } = useAlertDialog("AlertDialogAction");
    const ref = useComposedRefs(forwardedRef, actionRef);
    const lit = confirmable && !disabled;
    const tubeStyle =
      variant === "danger" ? ({ "--nk-alert-tube": DANGER, ...style } as React.CSSProperties) : style;

    React.useLayoutEffect(() => {
      setTone(variant);
      return () => setTone("default");
    }, [variant, setTone]);

    return (
      <button
        ref={ref}
        type="button"
        disabled={!lit}
        aria-busy={loading || undefined}
        data-state={lit ? "lit" : "unlit"}
        style={tubeStyle}
        onClick={(event) => {
          if (loading) return event.preventDefault();
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
        className={cn(
          "[--tube:var(--nk-alert-tube,var(--neon))]",
          "relative inline-flex h-10 shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-4 text-sm font-medium outline-none",
          "transition-[background-color,border-color,color,box-shadow,text-shadow,transform] duration-200 ease-out active:scale-[0.97]",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--tube)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          lit
            ? cn(
                "border-[rgb(var(--tube)/0.85)] bg-[rgb(var(--tube)/0.1)] text-[rgb(var(--tube))] [text-shadow:0_0_10px_rgb(var(--tube)/0.6)]",
                "hover:border-[rgb(var(--tube))] hover:bg-[rgb(var(--tube)/0.16)]",
              )
            : "cursor-not-allowed border-[rgb(var(--tube)/0.22)] bg-transparent text-[rgb(var(--tube)/0.42)]",
          loading && "cursor-default",
          className,
        )}
        {...props}
      >
        {lit && (
          <>
            <style>{ignite}</style>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -inset-px rounded-[inherit]",
                "shadow-[0_0_0_1px_rgb(var(--tube)/0.25),0_0_18px_rgb(var(--tube)/0.4),inset_0_0_12px_rgb(var(--tube)/0.18)]",
                "[animation:nk-alert-ignite_520ms_linear_both] motion-reduce:[animation:none]",
              )}
            />
          </>
        )}
        {loading && (
          <span
            aria-hidden
            className="size-3.5 animate-spin rounded-full border-[1.5px] border-[rgb(var(--tube)/0.25)] border-t-[rgb(var(--tube))]"
          />
        )}
        {children}
      </button>
    );
  },
);
AlertDialogAction.displayName = "AlertDialogAction";

export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge cancel behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>((raw, forwardedRef) => {
  const { asChild = false, onClick, className, children, ...props } = fromRenderProp(raw);
  const { setOpen, cancelRef } = useAlertDialog("AlertDialogCancel");
  const ref = useComposedRefs(forwardedRef, cancelRef);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    if (!event.defaultPrevented) setOpen(false);
  };

  if (asChild) {
    return (
      <Slot ref={ref as React.Ref<HTMLElement>} className={className} {...props} onClick={handleClick}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative inline-flex h-10 shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/80 outline-none",
        "transition-[background-color,border-color,color,transform] duration-150 ease-out hover:border-white/20 hover:bg-white/[0.06] hover:text-white active:scale-[0.97]",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]",
        className,
      )}
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogConfirmInput,
  AlertDialogAction,
  AlertDialogCancel,
};
