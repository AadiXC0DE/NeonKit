"use client";

import * as React from "react";
import { Bell, CircleCheck, Info, OctagonAlert, TriangleAlert, X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const statuses = {
  info: { color: "cyan", icon: Info },
  success: { color: "green", icon: CircleCheck },
  warning: { color: "amber", icon: TriangleAlert },
  error: { color: "red", icon: OctagonAlert },
  neutral: { color: "white", icon: Bell },
} as const;

const glowIcon =
  "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]";
const quietDismiss =
  "text-white/40 hover:bg-white/[0.06] hover:text-white/80 focus-visible:ring-[rgb(var(--neon)/0.6)]";

const variants = {
  soft: {
    root: "border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--neon)/0.06)] text-white/90",
    icon: glowIcon,
    title: "text-white/90",
    description: "text-white/60",
    dismiss: quietDismiss,
  },
  outline: {
    root: "border-[rgb(var(--neon)/0.6)] bg-transparent text-white/90 shadow-[0_0_16px_rgb(var(--neon)/CALC(0.16*var(--neon-glow,1))),inset_0_0_16px_rgb(var(--neon)/CALC(0.06*var(--neon-glow,1)))]",
    icon: glowIcon,
    title: "text-white/90",
    description: "text-white/60",
    dismiss: quietDismiss,
  },
  solid: {
    root: "border-[rgb(var(--neon))] bg-[rgb(var(--neon))] text-[#05060a] shadow-[0_0_24px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.35)]",
    icon: "text-[#05060a]",
    title: "text-[#05060a]",
    description: "text-[#05060a]/70",
    dismiss: "text-[#05060a]/55 hover:bg-black/10 hover:text-[#05060a] focus-visible:ring-[#05060a]/40",
  },
} as const;

type AlertVariant = keyof typeof variants;
type AlertLive = "assertive" | "polite" | "off";

const subscribeNever = () => () => {};

/**
 * True when the alert was part of the server-rendered page rather than added later. React reads
 * the server snapshot while hydrating, so the first render tells the two apart; useState keeps it.
 */
function usePresentAtLoad() {
  const hydrating = React.useSyncExternalStore(subscribeNever, () => false, () => true);
  const [presentAtLoad] = React.useState(hydrating);
  return presentAtLoad;
}

const AlertContext = React.createContext<AlertVariant>("soft");

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Sets the default color, icon and how urgently a live alert is announced. */
  status?: keyof typeof statuses;
  /**
   * How screen readers announce the alert. "assertive" renders role="alert", "polite" role="status",
   * "off" no live region at all. By default an alert that was already on the page when it loaded
   * stays quiet, and one added later is assertive for warning and error, polite otherwise.
   */
  live?: AlertLive;
  /** Palette name or any hex color. Overrides the status color. */
  color?: NeonColor;
  variant?: AlertVariant;
  /** Replaces the status icon. Pass `false` to hide it. */
  icon?: React.ReactNode | false;
  /** Shows a dismiss button that calls this. */
  onDismiss?: () => void;
  /** Right-aligned slot, usually a small Button. */
  action?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      style,
      status = "info",
      live,
      color,
      variant = "soft",
      icon,
      onDismiss,
      action,
      children,
      ...props
    },
    ref,
  ) => {
    const StatusIcon = statuses[status].icon;
    const iconNode = icon === undefined ? <StatusIcon /> : icon;
    const v = variants[variant];
    const presentAtLoad = usePresentAtLoad();
    const urgent = status === "warning" || status === "error";
    const politeness: AlertLive = live ?? (presentAtLoad ? "off" : urgent ? "assertive" : "polite");
    const role = politeness === "assertive" ? "alert" : politeness === "polite" ? "status" : undefined;
    const hasAction = action != null && action !== false;

    return (
      <AlertContext.Provider value={variant}>
        <div
          ref={ref}
          role={role}
          data-status={status}
          style={neonVars(color ?? statuses[status].color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "relative flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-sm",
            v.root,
            className,
          )}
          {...props}
        >
          {variant === "soft" && (
            <span
              aria-hidden
              className="absolute top-3.5 bottom-3.5 -left-px w-0.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]"
            />
          )}
          {iconNode !== false && iconNode != null && (
            <span aria-hidden className={cn("flex h-5 shrink-0 items-center [&_svg]:size-[18px]", v.icon)}>
              {iconNode}
            </span>
          )}
          {/* On narrow alerts the action wraps under the text instead of squeezing it. */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-3">
            <div className="grid min-w-0 flex-1 basis-[15rem] gap-1">{children}</div>
            {/* Negative margin from sm up keeps a 32px button from pushing a one-line alert taller than its text. */}
            {hasAction && <div className="flex shrink-0 items-center gap-2 sm:-my-1.5">{action}</div>}
          </div>
          {onDismiss && (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={onDismiss}
              className={cn(
                "-my-0.5 -mr-1.5 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none",
                "transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.94] focus-visible:ring-2",
                "[&_svg]:size-4",
                v.dismiss,
              )}
            >
              <X aria-hidden />
            </button>
          )}
        </div>
      </AlertContext.Provider>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const variant = React.useContext(AlertContext);
    return (
      <div
        ref={ref}
        className={cn("font-medium leading-5", variants[variant].title, className)}
        {...props}
      />
    );
  },
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(AlertContext);
  return (
    <div
      ref={ref}
      className={cn("leading-5", variants[variant].description, className)}
      {...props}
    />
  );
});
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
