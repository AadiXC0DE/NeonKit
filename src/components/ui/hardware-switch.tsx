"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The hardware is drawn in em, so the font size on the button scales all of it.
const sizes = {
  sm: { device: "text-[12px]", label: "text-[12px]" },
  md: { device: "text-[16px]", label: "text-[12.5px]" },
  lg: { device: "text-[20px]", label: "text-[13px]" },
} as const;

// A struck lamp: two quick drops in brightness, then it holds.
const keyframes = `@keyframes nk-hardware-switch-ignite{0%{opacity:0}12%{opacity:.85}22%{opacity:.15}40%{opacity:1}52%{opacity:.4}68%,100%{opacity:1}}`;
const ignite = "[animation:nk-hardware-switch-ignite_360ms_linear_both] motion-reduce:[animation:none]";

const CORE = "color-mix(in srgb, rgb(var(--neon)) 30%, white)";
const glow = "shadow-[0_0_0.2em_rgb(var(--neon)/var(--neon-glow,1)),0_0_0.6em_rgb(var(--neon)/CALC(0.75*var(--neon-glow,1))),0_0_1.3em_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]";
const glass = "bg-[rgb(var(--neon)/0.15)] shadow-[inset_0_1px_1px_rgb(0_0_0/0.6),0_1px_0_rgb(255_255_255/0.06)]";

type VariantProps = { checked: boolean; lit: boolean; ignitions: number };

/** A lamp: dark glass that lights with a white-hot core and a colored halo. */
function Lamp({ on, ignitions, delay = 0, className }: { on: boolean; ignitions: number; delay?: number; className?: string }) {
  return (
    <span aria-hidden className={cn("absolute", glass, className)}>
      <span
        key={ignitions}
        className={cn(
          "absolute inset-0 rounded-[inherit] transition-opacity duration-150",
          glow,
          on ? "opacity-100" : "opacity-0",
          on && ignitions > 0 && ignite,
        )}
        style={{ backgroundColor: CORE, animationDelay: on && delay ? `${delay}ms` : undefined }}
      />
    </span>
  );
}

function Rocker({ checked, lit, ignitions }: VariantProps) {
  return (
    <span
      aria-hidden
      className="relative block h-[4.6em] w-[2.9em] rounded-[0.45em] border border-black/80 bg-[linear-gradient(180deg,#252830,#0d0e12)] shadow-[0_0.4em_0.7em_-0.2em_rgb(0_0_0/0.85),inset_0_1px_0_rgb(255_255_255/0.1),inset_0_-1px_0_rgb(0_0_0/0.6)]"
    >
      {/* The well the paddle sits in, and the light the lamp throws into it */}
      <span className="absolute inset-[0.22em] rounded-[0.3em] bg-[#030405] shadow-[inset_0_0.1em_0.25em_rgb(0_0_0/0.95)]" />
      <span
        className={cn(
          "absolute inset-[0.1em] rounded-[0.4em] bg-[radial-gradient(ellipse_at_50%_30%,rgb(var(--neon)/CALC(0.35*var(--neon-glow,1))),transparent_65%)] transition-opacity duration-200",
          checked && lit ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="absolute inset-[0.3em] [perspective:12em]">
        <span
          className={cn(
            "absolute inset-0 rounded-[0.25em] bg-[#1c1f26] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
            "transition-transform duration-150 ease-[cubic-bezier(0.3,1.5,0.6,1)] motion-reduce:transition-none",
            checked ? "[transform:rotateX(16deg)]" : "[transform:rotateX(-16deg)]",
          )}
        >
          {/* Shading for each position: the pressed half falls into shadow */}
          <span
            className={cn(
              "absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgb(0_0_0/0.7),rgb(0_0_0/0.38)_46%,rgb(255_255_255/0.2)_50%,rgb(255_255_255/0.09)_68%,rgb(0_0_0/0.1))] transition-opacity duration-150",
              checked ? "opacity-100" : "opacity-0",
            )}
          />
          <span
            className={cn(
              "absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgb(0_0_0/0.1),rgb(255_255_255/0.09)_32%,rgb(255_255_255/0.2)_50%,rgb(0_0_0/0.38)_54%,rgb(0_0_0/0.7))] transition-opacity duration-150",
              checked ? "opacity-0" : "opacity-100",
            )}
          />
          <span className="absolute inset-x-[0.2em] top-1/2 h-px bg-black/50" />
          {/* "I" is a light pipe, "O" is printed */}
          <Lamp on={checked && lit} ignitions={ignitions} className="left-1/2 top-[0.55em] h-[0.95em] w-[0.16em] -translate-x-1/2 rounded-full" />
          <span className="absolute bottom-[0.6em] left-1/2 size-[0.72em] -translate-x-1/2 rounded-full border-[0.11em] border-white/40" />
        </span>
      </span>
    </span>
  );
}

function Flip({ checked, lit, ignitions }: VariantProps) {
  return (
    <span
      aria-hidden
      className="relative block h-[5em] w-[3em] rounded-[0.45em] border border-black/80 bg-[linear-gradient(180deg,#2a2d35,#121318)] shadow-[0_0.4em_0.7em_-0.2em_rgb(0_0_0/0.85),inset_0_1px_0_rgb(255_255_255/0.1),inset_0_-1px_0_rgb(0_0_0/0.6)]"
    >
      {/* Bushing and nut */}
      <span className="absolute left-1/2 top-[2.55em] size-[1.3em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_30deg,#7c828e,#2a2d35_17%,#9399a5_33%,#30333b_50%,#878d99_67%,#272a31_83%,#7c828e)] shadow-[0_0.1em_0.2em_rgb(0_0_0/0.8)]" />
      <span className="absolute left-1/2 top-[2.55em] size-[0.72em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_35%,#3d414b,#0b0c0f)] shadow-[inset_0_0.05em_0.1em_rgb(0_0_0/0.9)]" />

      {/* The bat-handle lever swings through the panel's normal, toward you */}
      <span className="absolute left-1/2 top-[2.55em] size-0 [perspective:9em]">
        <span
          className={cn(
            "absolute bottom-0 left-[-0.19em] h-[1.75em] w-[0.38em] origin-bottom rounded-full [transform-style:preserve-3d]",
            "bg-[linear-gradient(90deg,#30343d,#dfe3ea_38%,#8d939f_58%,#262930)]",
            "transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
            checked ? "delay-[170ms] [transform:rotateX(-52deg)]" : "delay-[0ms] [transform:rotateX(-128deg)]",
          )}
        >
          <span
            className={cn(
              "absolute -top-[0.2em] left-[-0.12em] size-[0.62em] rounded-full bg-[radial-gradient(circle_at_38%_30%,#ffffff,#c9ced8_22%,#5d6371_62%,#1d2026)]",
              "transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
              checked ? "delay-[170ms] [transform:rotateX(52deg)]" : "delay-[0ms] [transform:rotateX(128deg)]",
            )}
          />
        </span>
      </span>

      <Lamp
        on={checked && lit}
        ignitions={ignitions}
        delay={300}
        className="bottom-[0.4em] left-1/2 size-[0.4em] -translate-x-1/2 rounded-full"
      />

      {/* Hinge barrel */}
      <span className="absolute inset-x-[0.3em] top-[0.32em] h-[0.42em] rounded-full bg-[linear-gradient(180deg,#6b717d,#2a2d35_55%,#15171b)] shadow-[0_0.08em_0.12em_rgb(0_0_0/0.7)]" />

      {/* The guard: tinted glass, hinged on the barrel. It lifts first, then the lever flips. */}
      <span
        className={cn(
          "absolute inset-x-[0.18em] top-[0.53em] h-[4.25em] origin-top [transform-style:preserve-3d] [transform:perspective(18em)_rotateX(var(--nk-cover))]",
          "transition-transform motion-reduce:transition-none",
          checked
            ? "duration-[260ms] ease-[cubic-bezier(0.3,1.25,0.6,1)] [--nk-cover:106deg]"
            : "delay-[120ms] duration-[220ms] ease-[cubic-bezier(0.5,0,0.3,1)] [--nk-cover:0deg] group-hover/hw:[--nk-cover:12deg] group-active/hw:[--nk-cover:24deg]",
        )}
      >
        <span className="absolute inset-0 rounded-b-[0.4em] rounded-t-[0.2em] border border-[rgb(var(--neon)/0.35)] bg-[linear-gradient(180deg,rgb(var(--neon)/0.2),rgb(var(--neon)/0.09)_60%,rgb(var(--neon)/0.16))] shadow-[inset_0_0_0.6em_rgb(var(--neon)/CALC(0.1*var(--neon-glow,1))),inset_0.12em_0_0_rgb(255_255_255/0.1),0_0.3em_0.5em_-0.1em_rgb(0_0_0/0.6)] [backface-visibility:hidden]">
          <span className="absolute inset-y-[0.3em] left-[0.25em] w-[0.12em] rounded-full bg-white/20" />
          <span className="absolute inset-x-[0.2em] bottom-[0.18em] h-[0.4em] rounded-[0.2em] bg-[rgb(var(--neon)/0.16)] shadow-[inset_0_1px_0_rgb(255_255_255/0.16)]" />
        </span>
        <span className="absolute inset-0 rounded-b-[0.4em] rounded-t-[0.2em] border border-[rgb(var(--neon)/0.3)] bg-[linear-gradient(180deg,rgb(var(--neon)/0.1),rgb(var(--neon)/0.22))] [backface-visibility:hidden] [transform:rotateX(180deg)]" />
      </span>
    </span>
  );
}

function Key({ checked, lit, ignitions }: VariantProps) {
  return (
    <span aria-hidden className="relative block size-[4.8em]">
      {/* Position marks: 0 at twelve o'clock, I at three */}
      <span className="absolute left-1/2 top-[0.05em] size-[0.5em] -translate-x-1/2 rounded-full border-[0.09em] border-white/40" />
      <Lamp on={checked && lit} ignitions={ignitions} delay={180} className="right-[0.12em] top-1/2 h-[0.14em] w-[0.55em] -translate-y-1/2 rounded-full" />

      {/* Lit ring around the lock */}
      <Lamp on={checked && lit} ignitions={ignitions} delay={180} className="inset-[0.72em] rounded-full" />
      <span className="absolute inset-[0.84em] rounded-full bg-[conic-gradient(from_20deg,#8d939f,#2a2d35_22%,#a9afba_48%,#2b2e36_72%,#8d939f)] shadow-[0_0.15em_0.3em_rgb(0_0_0/0.85)]" />
      <span className="absolute inset-[1.08em] rounded-full bg-[radial-gradient(circle_at_42%_36%,#3a3e48,#101216_75%)] shadow-[inset_0_0.08em_0.15em_rgb(0_0_0/0.9),0_0_0_1px_rgb(0_0_0/0.5)]" />

      {/* The key, turning 90° into a detent */}
      <span className="absolute inset-0 [filter:drop-shadow(0_0.18em_0.2em_rgb(0_0_0/0.75))]">
        <span
          className={cn(
            "absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.3,1.45,0.5,1)] motion-reduce:transition-none",
            checked ? "rotate-90 group-hover/hw:rotate-[84deg]" : "rotate-0 group-hover/hw:rotate-[6deg]",
          )}
        >
          <span className="absolute left-1/2 top-1/2 h-[2.6em] w-[0.86em] -translate-x-1/2 -translate-y-1/2 rounded-[0.32em] border border-black/70 bg-[linear-gradient(90deg,#15171c,#41464f_38%,#2a2d34_62%,#0f1114)] shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]">
            <span className="absolute inset-x-[0.2em] top-[0.22em] h-[0.5em] rounded-[0.18em] bg-[linear-gradient(90deg,rgb(255_255_255/0.08),rgb(255_255_255/0.22),rgb(255_255_255/0.05))]" />
            <span className="absolute bottom-[0.3em] left-1/2 size-[0.28em] -translate-x-1/2 rounded-full bg-black/80 shadow-[0_1px_0_rgb(255_255_255/0.1)]" />
          </span>
        </span>
      </span>
    </span>
  );
}

const variants = { rocker: Rocker, flip: Flip, key: Key } as const;

export interface HardwareSwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "onChange" | "value" | "defaultChecked"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** A lit rocker, a toggle under a safety cover, or a key switch. */
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Engraved legend under the switch. Clicking it flips the switch. */
  label?: React.ReactNode;
  /** Submits `value` under this name when on, like a native checkbox. */
  name?: string;
  value?: string;
}

const HardwareSwitch = React.forwardRef<HTMLButtonElement, HardwareSwitchProps>(
  (
    {
      className,
      style,
      color,
      variant = "rocker",
      size = "md",
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      onClick,
      disabled,
      label,
      name,
      value = "on",
      id: idProp,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;

    const [uncontrolled, setUncontrolled] = React.useState(defaultChecked);
    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : uncontrolled;

    // Each off-to-on change remounts the lamps so the strike replays;
    // a switch that is already on at mount stays steady.
    const [ignitions, setIgnitions] = React.useState(0);
    const [previous, setPrevious] = React.useState(checked);
    if (previous !== checked) {
      setPrevious(checked);
      if (checked) setIgnitions((count) => count + 1);
    }

    const Device = variants[variant];
    const s = sizes[size];

    return (
      <span
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex w-fit select-none flex-col items-center gap-2.5",
          disabled && "opacity-50",
          className,
        )}
      >
        {ignitions > 0 && <style>{keyframes}</style>}
        <button
          ref={ref}
          type="button"
          role="switch"
          id={id}
          aria-checked={checked}
          aria-labelledby={ariaLabelledBy ?? (label ? labelId : undefined)}
          data-state={checked ? "checked" : "unchecked"}
          data-variant={variant}
          disabled={disabled}
          {...props}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (!isControlled) setUncontrolled(!checked);
            onCheckedChange?.(!checked);
          }}
          className={cn(
            "group/hw relative block shrink-0 cursor-pointer outline-none",
            // The open guard swings up above the base, so leave it room.
            variant === "flip" && "mt-[1.6em]",
            variant === "key" ? "rounded-full" : "rounded-[0.5em]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            "disabled:cursor-not-allowed",
            s.device,
          )}
        >
          <Device checked={checked} lit={!disabled} ignitions={ignitions} />
        </button>
        {label && (
          <label
            id={labelId}
            htmlFor={id}
            className={cn(
              "cursor-pointer font-medium leading-none tracking-[0.01em] text-white/60",
              disabled && "cursor-not-allowed",
              s.label,
            )}
          >
            {label}
          </label>
        )}
        {name && (
          <input type="checkbox" hidden name={name} value={value} checked={checked} disabled={disabled} readOnly />
        )}
      </span>
    );
  },
);
HardwareSwitch.displayName = "HardwareSwitch";

export { HardwareSwitch };
