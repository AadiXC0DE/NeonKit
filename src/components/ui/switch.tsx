"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Thumb travel = track width - thumb - 2px border - 2px padding.
const sizes = {
  sm: { track: "h-4 w-7", thumb: "size-3", on: "translate-x-3", root: "gap-2.5", label: "text-[13px] leading-5" },
  md: { track: "h-5 w-9", thumb: "size-4", on: "translate-x-4", root: "gap-3", label: "text-sm leading-5" },
  lg: { track: "h-6 w-11", thumb: "size-5", on: "translate-x-5", root: "gap-3", label: "text-base leading-6" },
} as const;

// A struck tube: two quick drops in brightness, then it holds.
const keyframes = `@keyframes neonkit-switch-ignite{0%{opacity:0}12%{opacity:.85}22%{opacity:.15}40%{opacity:1}52%{opacity:.4}68%,100%{opacity:1}}`;

export interface SwitchProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "color" | "onChange" | "value" | "defaultChecked"
  > {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Submits `value` under this name when on, like a native checkbox. */
  name?: string;
  value?: string;
  /** Clickable label rendered after the switch. */
  label?: React.ReactNode;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      style,
      color,
      size = "md",
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      onClick,
      disabled,
      name,
      value = "on",
      label,
      id: idProp,
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

    // Count off-to-on changes. Each one remounts the glow layer so the flicker
    // replays; a switch that is already on at mount stays steady.
    const [ignitions, setIgnitions] = React.useState(0);
    const [previous, setPrevious] = React.useState(checked);
    if (previous !== checked) {
      setPrevious(checked);
      if (checked) setIgnitions((count) => count + 1);
    }

    const s = sizes[size];

    const buttonRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

    // A form reset puts the switch back where it started, like a native checkbox.
    const initialChecked = React.useRef(checked);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        const initial = initialChecked.current;
        if (initial === checked) return;
        if (!isControlled) setUncontrolled(initial);
        onCheckedChange?.(initial);
      };
    });
    React.useEffect(() => {
      const form = buttonRef.current?.form;
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    const control = (
      <button
        ref={buttonRef}
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (!isControlled) setUncontrolled(!checked);
          onCheckedChange?.(!checked);
        }}
        style={label ? undefined : neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.06] p-px outline-none",
          // An invisible 44px target around the track, so even the small switch is easy to hit.
          "before:absolute before:left-1/2 before:top-1/2 before:h-[max(100%,2.75rem)] before:w-[max(calc(100%+1rem),2.75rem)] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:content-['']",
          "transition-[background-color,border-color,transform,scale] duration-150 ease-out active:scale-[0.97]",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          "disabled:cursor-not-allowed",
          !disabled && "hover:border-white/20 hover:bg-white/[0.09]",
          !label && "disabled:opacity-50",
          s.track,
          !label && className,
        )}
        {...props}
      >
        <span
          key={ignitions}
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-px rounded-full border border-[rgb(var(--neon)/0.75)] bg-[rgb(var(--neon)/0.2)]",
            "shadow-[0_0_14px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_0_8px_rgb(var(--neon)/CALC(0.3*var(--neon-glow,1)))] transition-shadow duration-200 ease-out",
            !disabled &&
              "group-hover/switch:shadow-[0_0_20px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))),inset_0_0_8px_rgb(var(--neon)/CALC(0.3*var(--neon-glow,1)))]",
            checked ? "opacity-100" : "opacity-0",
            checked &&
              ignitions > 0 &&
              "[animation:neonkit-switch-ignite_350ms_linear_both] motion-reduce:[animation:none]",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none relative block rounded-full",
            "transition-[transform,translate,background-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            checked
              ? cn(s.on, "bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.5)]")
              : "translate-x-0 bg-white/60 shadow-[0_1px_2px_rgb(0_0_0/0.4)]",
            s.thumb,
          )}
        />
      </button>
    );

    const extras = (
      <>
        {ignitions > 0 && <style>{keyframes}</style>}
        {name && (
          <input
            type="checkbox"
            hidden
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            readOnly
          />
        )}
      </>
    );

    if (!label) {
      return (
        <>
          {control}
          {extras}
        </>
      );
    }

    return (
      <span
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex items-center",
          disabled && "opacity-50",
          s.root,
          className,
        )}
      >
        {control}
        <label
          id={labelId}
          htmlFor={id}
          className={cn(
            "cursor-pointer select-none text-white/90",
            disabled && "cursor-not-allowed",
            s.label,
          )}
        >
          {label}
        </label>
        {extras}
      </span>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
