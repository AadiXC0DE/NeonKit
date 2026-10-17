"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// A chip strikes once when picked: the border flares and settles, like a tube catching.
const css = `
@keyframes nk-suggestion-fire{0%{border-color:rgb(var(--neon));box-shadow:0 0 0 1px rgb(var(--neon)/.5),0 0 18px rgb(var(--neon)/calc(.55*var(--neon-glow,1)))}12%{border-color:rgb(var(--neon)/.35);box-shadow:none}24%{border-color:rgb(var(--neon)/.9);box-shadow:0 0 14px rgb(var(--neon)/calc(.4*var(--neon-glow,1)))}100%{}}
.nk-suggestion[data-fired]{animation:nk-suggestion-fire 520ms ease-out}
.nk-suggestions{mask-image:linear-gradient(90deg,transparent,#000 var(--nk-fade-l,0px),#000 calc(100% - var(--nk-fade-r,0px)),transparent)}
@media (min-width:640px){.nk-suggestions[data-wrap]{mask-image:none}}
@media (prefers-reduced-motion:reduce){.nk-suggestion[data-fired]{animation:none}}
`;

const FADE = 28;
const ITEM = "[data-nk-suggestion]:not(:disabled)";

const sizes = {
  sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg]:size-3.5",
  md: "h-8 gap-2 rounded-lg px-3 text-[13px] [&_svg]:size-4",
} as const;

interface SuggestionsContextValue {
  onSelect?: (value: string) => void;
  disabled: boolean;
  size: keyof typeof sizes;
}

const SuggestionsContext = React.createContext<SuggestionsContextValue>({ disabled: false, size: "md" });

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

export interface SuggestionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onSelect"> {
  /** Called with the chip's `value` (or its text) when one is picked. Fill an input or send it. */
  onSelect?: (value: string) => void;
  /** Wraps onto more lines from the `sm` breakpoint up. Below it the row always scrolls. */
  wrap?: boolean;
  size?: keyof typeof sizes;
  disabled?: boolean;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

/**
 * A row of prompt chips. One tab stop: arrow keys move between chips, Home and End jump to the ends.
 * When the row overflows it scrolls sideways, and its edges fade where more chips are hidden.
 */
const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  (
    {
      onSelect,
      wrap = false,
      size = "md",
      disabled = false,
      color,
      className,
      style,
      children,
      onKeyDown,
      onFocus,
      "aria-label": ariaLabel,
      ...props
    },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);
    const active = React.useRef(0);

    const items = () => Array.from(ref.current?.querySelectorAll<HTMLButtonElement>(ITEM) ?? []);

    // Roving tabindex, written to the DOM so chips stay plain children with no registration step.
    const syncTabStops = React.useCallback(() => {
      const list = items();
      if (!list.length) return;
      const index = Math.min(active.current, list.length - 1);
      list.forEach((item, i) => (item.tabIndex = i === index ? 0 : -1));
    }, []);

    React.useEffect(() => {
      syncTabStops();
    });

    React.useEffect(() => {
      const node = ref.current;
      if (!node) return;
      let frame = 0;
      const measure = () => {
        frame = 0;
        const max = node.scrollWidth - node.clientWidth;
        // RTL scrolls negative; the fade follows whichever side has hidden chips.
        const left = Math.abs(node.scrollLeft);
        node.style.setProperty("--nk-fade-l", max > 1 && left > 1 ? `${FADE}px` : "0px");
        node.style.setProperty("--nk-fade-r", max > 1 && left < max - 1 ? `${FADE}px` : "0px");
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      measure();
      node.addEventListener("scroll", schedule, { passive: true });
      const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
      observer?.observe(node);
      return () => {
        cancelAnimationFrame(frame);
        node.removeEventListener("scroll", schedule);
        observer?.disconnect();
      };
    }, []);

    const context = React.useMemo(() => ({ onSelect, disabled, size }), [onSelect, disabled, size]);

    return (
      <SuggestionsContext.Provider value={context}>
        <div
          ref={ref}
          role="toolbar"
          aria-label={ariaLabel ?? "Suggestions"}
          aria-orientation="horizontal"
          aria-disabled={disabled || undefined}
          data-wrap={wrap ? "" : undefined}
          style={neonVars(color, style)}
          onFocus={(event) => {
            onFocus?.(event);
            const index = items().indexOf(event.target as Element as HTMLButtonElement);
            if (index >= 0 && index !== active.current) {
              active.current = index;
              syncTabStops();
            }
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const list = items();
            const current = list.indexOf(document.activeElement as HTMLButtonElement);
            if (current < 0) return;
            const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
            const forward = rtl ? "ArrowLeft" : "ArrowRight";
            const back = rtl ? "ArrowRight" : "ArrowLeft";
            let next = -1;
            if (event.key === forward || event.key === "ArrowDown") next = (current + 1) % list.length;
            else if (event.key === back || event.key === "ArrowUp") next = (current - 1 + list.length) % list.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = list.length - 1;
            if (next < 0) return;
            event.preventDefault();
            list[next].focus();
          }}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "nk-suggestions flex min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            // The scroller clips, so it reaches 4px past its box to leave room for focus rings.
            "-m-1 w-[calc(100%+8px)] p-1 scroll-px-8",
            wrap && "sm:flex-wrap sm:overflow-visible",
            className,
          )}
          {...props}
        >
          <style href="nk-suggestions" precedence="nk">{css}</style>
          {children}
        </div>
      </SuggestionsContext.Provider>
    );
  },
);
Suggestions.displayName = "Suggestions";

export interface SuggestionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** What `onSelect` receives. Defaults to the chip's text. */
  value?: string;
  /** Shown before the text. It lights when the chip is hovered or focused. */
  icon?: React.ReactNode;
}

const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(
  ({ value, icon, disabled, className, children, onClick, onAnimationEnd, ...props }, ref) => {
    const { onSelect, disabled: groupDisabled, size } = React.useContext(SuggestionsContext);
    const off = disabled || groupDisabled;

    return (
      <button
        ref={ref}
        type="button"
        data-nk-suggestion=""
        disabled={off}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const button = event.currentTarget;
          button.removeAttribute("data-fired");
          // Restart the strike on a second pick.
          void button.offsetWidth;
          button.setAttribute("data-fired", "");
          onSelect?.(value ?? textOf(children).trim());
        }}
        onAnimationEnd={(event) => {
          onAnimationEnd?.(event);
          event.currentTarget.removeAttribute("data-fired");
        }}
        className={cn(
          "nk-suggestion group/suggestion inline-flex shrink-0 cursor-pointer select-none items-center whitespace-nowrap border border-white/10 bg-white/[0.03] text-white/70 outline-none",
          "transition-[border-color,background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "hover:border-[rgb(var(--neon)/0.35)] hover:bg-[rgb(var(--neon)/0.05)] hover:text-white/95 active:scale-[0.97]",
          "focus-visible:border-[rgb(var(--neon)/0.5)] focus-visible:text-white/95 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-white/10 disabled:hover:bg-white/[0.03] disabled:hover:text-white/70",
          sizes[size],
          className,
        )}
        {...props}
      >
        {icon && (
          <span
            aria-hidden
            className={cn(
              "-ml-0.5 flex shrink-0 text-white/40 transition-[color,filter] duration-200",
              "group-hover/suggestion:text-[rgb(var(--neon))] group-hover/suggestion:[filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))))]",
              "group-focus-visible/suggestion:text-[rgb(var(--neon))] group-focus-visible/suggestion:[filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))))]",
              "group-disabled/suggestion:text-white/40 group-disabled/suggestion:[filter:none]",
            )}
          >
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  },
);
Suggestion.displayName = "Suggestion";

export { Suggestions, Suggestion };
