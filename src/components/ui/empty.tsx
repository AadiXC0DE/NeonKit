import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

/*
 * The tube media is an unlit glass outline until the empty state holds something to press.
 * `:has()` watches EmptyContent, so an action that shows up later (after a permission check,
 * say) still flickers the tube on, and hovering or focusing it turns the tube up a notch.
 */
const styles = `
@keyframes nk-empty-ignite{0%{opacity:0}8%{opacity:.75}12%{opacity:.08}22%{opacity:.9}27%{opacity:.3}40%,100%{opacity:1}}
[data-nk-empty]:has([data-nk-empty-content] :is(a[href],button:not(:disabled),[role=button])) [data-nk-tube=auto] [data-nk-tube-lit]{animation:nk-empty-ignite .9s linear .3s both}
[data-nk-tube=on] [data-nk-tube-lit]{animation:nk-empty-ignite .9s linear .15s both}
[data-nk-empty]:has([data-nk-empty-content] :is(a[href],button,[role=button]):is(:hover,:focus-visible)) [data-nk-tube=auto] [data-nk-tube-halo]{opacity:1}
@media (prefers-reduced-motion:reduce){[data-nk-tube-lit]{animation-duration:1ms!important;animation-delay:0s!important}[data-nk-tube-halo]{transition:none}}
`;

export interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Center everything, or set it flush left for panels and side columns. */
  align?: "center" | "start";
  size?: "sm" | "md";
}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, style, color, align = "center", size = "md", children, ...props }, ref) => (
    <div
      ref={ref}
      data-nk-empty=""
      data-align={align}
      style={neonVars(color, style)}
      className={cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        "group/empty flex w-full min-w-0 flex-col text-balance text-white/90",
        align === "center" ? "items-center text-center" : "items-start text-left",
        size === "md" ? "px-6 py-14" : "px-4 py-8",
        className,
      )}
      {...props}
    >
      <style>{styles}</style>
      {children}
    </div>
  ),
);
Empty.displayName = "Empty";

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `icon` sets the icon on a quiet tile. `tube` draws it as an unlit neon tube that flickers on
   * once EmptyContent holds an enabled button or link.
   */
  variant?: "default" | "icon" | "tube";
  /** Tube only: force it on or keep it dark, instead of following the actions. */
  lit?: boolean;
}

const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ className, variant = "default", lit, children, ...props }, ref) => {
    if (variant === "tube") {
      return (
        <div
          ref={ref}
          aria-hidden
          data-nk-tube={lit === undefined ? "auto" : lit ? "on" : "off"}
          className={cn(
            "relative mb-6 grid size-16 shrink-0 place-items-center [&>*]:col-start-1 [&>*]:row-start-1",
            "[&_svg]:size-14 [&_svg]:overflow-visible [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]",
            className,
          )}
          {...props}
        >
          {/* Unlit glass: a wide faint body with a thin filament line inside it. */}
          <span className="text-white/[0.06] [&_svg]:[stroke-width:3.5]">{children}</span>
          <span className="text-white/[0.22] [&_svg]:[stroke-width:1]">{children}</span>
          {/* Lit: colored gas around a white-hot core, with a halo that grows when the action is hovered. */}
          <span data-nk-tube-lit="" className="grid opacity-0 [&>*]:col-start-1 [&>*]:row-start-1">
            <span
              data-nk-tube-halo=""
              className="text-[rgb(var(--neon))] opacity-0 blur-[10px] transition-opacity duration-300 [&_svg]:[stroke-width:4]"
            >
              {children}
            </span>
            <span className="text-[rgb(var(--neon))] [filter:drop-shadow(0_0_2px_rgb(var(--neon)))_drop-shadow(0_0_10px_rgb(var(--neon)/0.6))] [&_svg]:[stroke-width:2]">
              {children}
            </span>
            <span className="text-white/80 [&_svg]:[stroke-width:0.6]">{children}</span>
          </span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        aria-hidden
        data-variant={variant}
        className={cn(
          "relative mb-5 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
          variant === "icon" &&
            "size-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/55 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] [&_svg]:size-5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
EmptyMedia.displayName = "EmptyMedia";

const EmptyTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-6 tracking-[-0.01em] text-white/90", className)}
      {...props}
    />
  ),
);
EmptyTitle.displayName = "EmptyTitle";

const EmptyDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "mt-1.5 max-w-[42ch] text-sm leading-6 text-white/55",
        "[&_a]:text-white/80 [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-4 hover:[&_a]:decoration-[rgb(var(--neon)/0.8)]",
        className,
      )}
      {...props}
    />
  ),
);
EmptyDescription.displayName = "EmptyDescription";

const EmptyContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-nk-empty-content=""
      className={cn(
        "mt-6 flex w-full max-w-sm flex-wrap items-center gap-2 text-sm text-white/55",
        "group-data-[align=center]/empty:justify-center",
        className,
      )}
      {...props}
    />
  ),
);
EmptyContent.displayName = "EmptyContent";

export { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent };
