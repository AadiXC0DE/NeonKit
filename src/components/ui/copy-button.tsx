"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const css = `
@keyframes nk-copy-button-draw{from{stroke-dashoffset:1.01}to{stroke-dashoffset:0}}
@keyframes nk-copy-button-shake{0%,100%{transform:none}20%{transform:translateX(-2px)}40%{transform:translateX(2px)}60%{transform:translateX(-1.5px)}80%{transform:translateX(1px)}}
.nk-copy-button-draw{stroke-dasharray:1 2;stroke-dashoffset:1.01;animation:nk-copy-button-draw 340ms cubic-bezier(0.65,0,0.35,1) 70ms both}
.nk-copy-button-shake{animation:nk-copy-button-shake 320ms ease-out}
@media (prefers-reduced-motion:reduce){.nk-copy-button-draw{animation:none;stroke-dashoffset:0}.nk-copy-button-shake{animation:none}}
`;

const variants = {
  ghost: "text-white/55 hover:bg-white/[0.06] hover:text-white/90 data-[state=copied]:text-white/90",
  outline:
    "border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.05)] text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))] hover:border-[rgb(var(--neon)/0.6)] hover:bg-[rgb(var(--neon)/0.1)] hover:shadow-[0_0_18px_-2px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
} as const;

const sizes = {
  sm: { icon: "size-8 rounded-md", text: "h-8 gap-1.5 rounded-md px-3 text-xs", glyph: "size-4" },
  md: { icon: "size-10 rounded-lg", text: "h-10 gap-2 rounded-lg px-4 text-sm", glyph: "size-4" },
  lg: { icon: "size-12 rounded-xl", text: "h-12 gap-2.5 rounded-xl px-6 text-base", glyph: "size-[18px]" },
} as const;

const sides = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2 origin-bottom",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2 origin-top",
  left: "right-full top-1/2 mr-2 -translate-y-1/2 origin-right",
  right: "left-full top-1/2 ml-2 -translate-y-1/2 origin-left",
} as const;

// Hidden bubbles sit 4px toward the button and settle outward as they appear.
const nudges = {
  top: "translate-y-1",
  bottom: "-translate-y-1",
  left: "translate-x-1",
  right: "-translate-x-1",
} as const;

type State = "idle" | "copied" | "error";

async function writeClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Older browsers and plain-http pages: copy through a throwaway textarea.
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  active?.focus({ preventScroll: true });
  if (!ok) throw new Error("Copy command was rejected");
}

export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "value" | "onCopy"> {
  /** Text to copy, or a function that returns it (may be async) for values built on demand. */
  value: string | (() => string | Promise<string>);
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  /** Square icon button by default; with children, a text button of the same height. */
  size?: keyof typeof sizes;
  /** Milliseconds the confirmation stays up. */
  timeout?: number;
  /** Shown in the bubble and announced after a successful copy. */
  copiedLabel?: string;
  /** Shown in the bubble and announced when the clipboard refuses. */
  errorLabel?: string;
  /** Where the bubble appears. */
  side?: keyof typeof sides;
  /** Show the "Copied" bubble. The check and the announcement happen either way. */
  bubble?: boolean;
  onCopy?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      className,
      style,
      color,
      value,
      variant = "ghost",
      size = "md",
      timeout = 1600,
      copiedLabel = "Copied",
      errorLabel = "Couldn't copy",
      side = "top",
      bubble = true,
      onCopy,
      onCopyError,
      onClick,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const [result, setResult] = React.useState<Exclude<State, "idle">>("copied");
    const [visible, setVisible] = React.useState(false);
    const [copies, setCopies] = React.useState(0);
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const s = sizes[size];
    const hasLabel = children !== undefined && children !== null && children !== false;
    const hasName = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;

    React.useEffect(() => () => clearTimeout(timer.current), []);

    const settle = (next: Exclude<State, "idle">) => {
      setResult(next);
      setVisible(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), timeout);
    };

    const copy = async () => {
      try {
        const text = typeof value === "function" ? await value() : value;
        await writeClipboard(text);
        setCopies((count) => count + 1);
        settle("copied");
        onCopy?.(text);
      } catch (error) {
        settle("error");
        onCopyError?.(error);
      }
    };

    const state: State = visible ? result : "idle";
    const message = result === "copied" ? copiedLabel : errorLabel;

    return (
      <>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          aria-label={hasName || hasLabel ? undefined : "Copy"}
          data-state={state}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) void copy();
          }}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none",
            "transition-[background-color,border-color,color,box-shadow,transform,scale] duration-200 ease-out active:scale-[0.97]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            "disabled:pointer-events-none disabled:opacity-50",
            hasLabel ? s.text : s.icon,
            variants[variant],
            className,
          )}
          {...props}
        >
          <style>{css}</style>
          <span
            key={state === "error" ? `error-${copies}` : "glyph"}
            aria-hidden
            className={cn("relative grid shrink-0 place-items-center", s.glyph, state === "error" && "nk-copy-button-shake")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "absolute inset-0 size-full transition-[opacity,transform,scale] duration-150 ease-out",
                state === "copied" && "scale-75 opacity-0",
              )}
            >
              <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
              <path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
            </svg>
            {copies > 0 && (
              <svg
                key={copies}
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "absolute inset-0 size-full overflow-visible transition-opacity duration-200 ease-out",
                  "[filter:drop-shadow(0_0_2px_rgb(var(--neon)/var(--neon-glow,1)))_drop-shadow(0_0_6px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]",
                  state === "copied" ? "opacity-100" : "opacity-0",
                )}
              >
                <path
                  d="M4.75 12.75l4.5 4.5L19.25 7"
                  pathLength={1}
                  strokeWidth={3.25}
                  className="nk-copy-button-draw stroke-[rgb(var(--neon))]"
                />
                <path
                  d="M4.75 12.75l4.5 4.5L19.25 7"
                  pathLength={1}
                  strokeWidth={1.5}
                  className="nk-copy-button-draw stroke-[color-mix(in_srgb,rgb(var(--neon))_30%,white)]"
                />
              </svg>
            )}
          </span>
          {hasLabel && <span className="min-w-0">{children}</span>}

          {bubble && (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0b11] px-2 py-1 text-[11px] font-medium leading-4 [text-shadow:none]",
                "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
                "transition-[opacity,transform,translate,scale] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                sides[side],
                state === "idle"
                  ? cn("scale-[0.96] opacity-0 duration-100", nudges[side])
                  : "scale-100 opacity-100 duration-[160ms]",
                result === "error" ? "text-[#ff4d5e]" : "[color:color-mix(in_srgb,rgb(var(--neon))_35%,white)]",
              )}
            >
              {message}
            </span>
          )}
        </button>
        <span role="status" className="sr-only">
          {visible ? message : ""}
        </span>
      </>
    );
  },
);
CopyButton.displayName = "CopyButton";

export { CopyButton };
