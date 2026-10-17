"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// One 800ms timeline: the ring strikes and stutters, the glyph catches once the
// ring holds, and the light reaches the surface around the key last.
const css = `
@keyframes nk-power-button-ring{0%{opacity:0}5%{opacity:.8}9%{opacity:.08}16%{opacity:.55}20%{opacity:.12}31%{opacity:1}38%{opacity:.4}44%{opacity:.9}49%{opacity:.6}60%,100%{opacity:1}}
@keyframes nk-power-button-glyph{0%,40%{opacity:0}45%{opacity:.9}50%{opacity:.25}62%,100%{opacity:1}}
@keyframes nk-power-button-spill{0%,30%{opacity:0}100%{opacity:1}}
.nk-power-button-ring{animation:nk-power-button-ring 800ms linear both}
.nk-power-button-glyph{animation:nk-power-button-glyph 800ms linear both}
.nk-power-button-spill{animation:nk-power-button-spill 1100ms cubic-bezier(0.23,1,0.32,1) both}
@media (prefers-reduced-motion:reduce){.nk-power-button-ring,.nk-power-button-glyph,.nk-power-button-spill{animation:none}}
`;

// sm/md/lg match Button's heights so the key sits in a toolbar; xl is a feature key.
const sizes = {
  sm: {
    root: "size-8",
    groove: "inset-[2px]",
    ring: "inset-[3px] border-[1.5px]",
    cap: "inset-[7px]",
    glyph: "size-3",
    icon: "size-3.5",
    spill: "shadow-[0_0_16px_4px_rgb(var(--neon)/CALC(0.16*var(--neon-glow,1))),0_0_44px_14px_rgb(var(--neon)/CALC(0.07*var(--neon-glow,1)))]",
  },
  md: {
    root: "size-10",
    groove: "inset-[3px]",
    ring: "inset-[4px] border-2",
    cap: "inset-[9px]",
    glyph: "size-3.5",
    icon: "size-4",
    spill: "shadow-[0_0_20px_5px_rgb(var(--neon)/CALC(0.16*var(--neon-glow,1))),0_0_54px_18px_rgb(var(--neon)/CALC(0.07*var(--neon-glow,1)))]",
  },
  lg: {
    root: "size-12",
    groove: "inset-[3px]",
    ring: "inset-[4px] border-2",
    cap: "inset-[10px]",
    glyph: "size-4",
    icon: "size-[18px]",
    spill: "shadow-[0_0_24px_6px_rgb(var(--neon)/CALC(0.16*var(--neon-glow,1))),0_0_64px_22px_rgb(var(--neon)/CALC(0.07*var(--neon-glow,1)))]",
  },
  xl: {
    root: "size-[72px]",
    groove: "inset-[5px]",
    ring: "inset-[7px] border-[3px]",
    cap: "inset-[15px]",
    glyph: "size-6",
    icon: "size-6",
    spill: "shadow-[0_0_36px_10px_rgb(var(--neon)/CALC(0.16*var(--neon-glow,1))),0_0_96px_34px_rgb(var(--neon)/CALC(0.07*var(--neon-glow,1)))]",
  },
} as const;

function PowerGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      className={className}
    >
      <path d="M12 3.25v8" />
      <path d="M7.1 6.4a7.6 7.6 0 1 0 9.8 0" />
    </svg>
  );
}

export interface PowerButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "color" | "value" | "defaultValue" | "children"
  > {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** sm/md/lg match Button's heights (32/40/48px); xl is a 72px feature key. */
  size?: keyof typeof sizes;
  /** On or off (controlled). */
  pressed?: boolean;
  /** Initial state when uncontrolled. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Replaces the power glyph. It lights with the ring and inherits the tube color. */
  icon?: React.ReactNode;
  /** Submits `value` under this name while on, like a native checkbox. */
  name?: string;
  value?: string;
}

const PowerButton = React.forwardRef<HTMLButtonElement, PowerButtonProps>(
  (
    {
      className,
      style,
      color,
      size = "md",
      pressed: pressedProp,
      defaultPressed = false,
      onPressedChange,
      icon,
      name,
      value = "on",
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultPressed);
    const isControlled = pressedProp !== undefined;
    const pressed = isControlled ? pressedProp : uncontrolled;

    // Count off-to-on changes. Each one remounts the lit layers so the ignition
    // replays; a key that is already on at mount stays steady.
    const [ignitions, setIgnitions] = React.useState(0);
    const [previous, setPrevious] = React.useState(pressed);
    if (previous !== pressed) {
      setPrevious(pressed);
      if (pressed) setIgnitions((count) => count + 1);
    }
    const igniting = pressed && ignitions > 0;

    const s = sizes[size];
    const hasName = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
    const glyph = icon ?? <PowerGlyph className="size-full" />;

    return (
      <>
        <button
          ref={ref}
          type="button"
          aria-pressed={pressed}
          aria-label={hasName ? undefined : "Power"}
          data-state={pressed ? "on" : "off"}
          disabled={disabled}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (!isControlled) setUncontrolled(!pressed);
            onPressedChange?.(!pressed);
          }}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/power relative inline-grid shrink-0 cursor-pointer select-none place-items-center rounded-full outline-none [-webkit-tap-highlight-color:transparent]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            s.root,
            className,
          )}
          {...props}
        >
          <style>{css}</style>

          {/* Light thrown onto the surface around the key. A shadow, so it never adds scroll overflow. */}
          <span
            key={`spill-${ignitions}`}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500 ease-out",
              pressed ? "opacity-100" : "opacity-0",
              igniting && "nk-power-button-spill",
              s.spill,
            )}
          />

          {/* Bezel: dark anodised metal with a turned-edge highlight */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              "bg-[conic-gradient(from_210deg,#191c24,#2f333d_60deg,#171a21_150deg,#262a33_230deg,#15171e_300deg,#191c24)]",
              "shadow-[0_0_0_1px_rgb(0_0_0/0.65),inset_0_1px_0_rgb(255_255_255/0.1),inset_0_-1px_0_rgb(0_0_0/0.5),0_8px_18px_-6px_rgb(0_0_0/0.9)]",
            )}
          />

          {/* The channel the light ring sits in */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-full bg-[#040508] shadow-[inset_0_1px_2px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.06)]",
              s.groove,
            )}
          />

          {/* Light ring: dark glass at rest */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-full border-[rgb(var(--neon)/0.16)] transition-[border-color] duration-200",
              !disabled && "group-hover/power:border-[rgb(var(--neon)/0.28)]",
              s.ring,
            )}
          />
          <span
            key={`ring-${ignitions}`}
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-full [border-color:color-mix(in_srgb,rgb(var(--neon))_45%,white)]",
              "shadow-[0_0_2px_rgb(var(--neon)/var(--neon-glow,1)),0_0_8px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_20px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))),inset_0_0_3px_rgb(var(--neon)/var(--neon-glow,1)),inset_0_0_8px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]",
              "transition-opacity duration-200 ease-out",
              pressed ? "opacity-100" : "opacity-0",
              igniting && "nk-power-button-ring",
              s.ring,
            )}
          />

          {/* Cap: concave, travels on press and sits a touch lower while latched on */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute grid place-items-center rounded-full",
              "bg-[radial-gradient(circle_at_50%_30%,#22252e,#12141a_55%,#0b0c11)]",
              "transition-[transform,scale,box-shadow] duration-150 ease-out group-active/power:scale-[0.94] group-active/power:duration-75",
              pressed
                ? "scale-[0.975] shadow-[0_0_0_1px_rgb(var(--neon)/0.3),0_0_10px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-2px_4px_rgb(0_0_0/0.5)]"
                : "shadow-[0_0_0_1px_rgb(0_0_0/0.6),0_2px_3px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.09),inset_0_-2px_4px_rgb(0_0_0/0.5)]",
              s.cap,
            )}
          >
            <span
              className={cn(
                "relative grid place-items-center [&_svg]:size-full",
                // A custom icon is drawn for 24px; it gets a little more room and a heavier tube to read inside the cap.
                icon ? cn(s.icon, "[&_svg]:[stroke-width:2.25]") : s.glyph,
              )}
            >
              <span
                className={cn(
                  "absolute inset-0 grid place-items-center text-[rgb(var(--neon)/0.2)] [filter:drop-shadow(0_1px_0_rgb(255_255_255/0.06))] transition-colors duration-200",
                  !disabled && "group-hover/power:text-[rgb(var(--neon)/0.34)]",
                )}
              >
                {glyph}
              </span>
              <span
                key={`glyph-${ignitions}`}
                className={cn(
                  "absolute inset-0 grid place-items-center [color:color-mix(in_srgb,rgb(var(--neon))_35%,white)]",
                  "[filter:drop-shadow(0_0_1.5px_rgb(var(--neon)/var(--neon-glow,1)))_drop-shadow(0_0_5px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))))]",
                  "transition-opacity duration-150 ease-out",
                  pressed ? "opacity-100" : "opacity-0",
                  igniting && "nk-power-button-glyph",
                )}
              >
                {glyph}
              </span>
            </span>
          </span>
        </button>
        {name && (
          <input
            type="checkbox"
            hidden
            name={name}
            value={value}
            checked={pressed}
            disabled={disabled}
            readOnly
          />
        )}
      </>
    );
  },
);
PowerButton.displayName = "PowerButton";

export { PowerButton };
