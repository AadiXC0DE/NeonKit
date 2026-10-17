"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const sizes = {
  sm: { key: "h-5 min-w-5 rounded-[5px] px-1 text-[11px]", combo: "gap-1 text-[11px]" },
  md: { key: "h-6 min-w-6 rounded-md px-1.5 text-xs", combo: "gap-1 text-xs" },
  lg: { key: "h-8 min-w-8 rounded-lg px-2 text-sm", combo: "gap-1.5 text-sm" },
} as const;

// Pressing lights up fast; releasing fades slowly, like a tube cooling down.
const states = {
  rest: "border-white/10 bg-white/[0.04] text-white/70 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),inset_0_-2px_0_rgb(0_0_0/0.45)] duration-300",
  lit: "translate-y-px border-[rgb(var(--neon)/0.7)] bg-[rgb(var(--neon)/0.12)] text-[rgb(var(--neon))] shadow-[inset_0_1px_0_rgb(var(--neon)/0.2),inset_0_-1px_0_rgb(0_0_0/0.35),0_0_14px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))] [text-shadow:0_0_8px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))] duration-75",
} as const;

function matchesKey(event: KeyboardEvent, key: string) {
  const target = key.toLowerCase();
  if (event.key.toLowerCase() === target) return true;
  // Option on macOS rewrites event.key (⌥K is "˚"), so fall back to the physical key.
  if (/^[a-z]$/.test(target)) return event.code === `Key${target.toUpperCase()}`;
  if (/^[0-9]$/.test(target)) return event.code === `Digit${target}`;
  return false;
}

function useKeyHeld(key?: string) {
  const [held, setHeld] = React.useState(false);

  React.useEffect(() => {
    if (!key) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (matchesKey(event, key)) setHeld(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      // macOS drops keyup for other keys while ⌘ is down, so releasing ⌘ clears them too.
      if (matchesKey(event, key) || event.key === "Meta") setHeld(false);
    };
    const release = () => setHeld(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
    };
  }, [key]);

  return Boolean(key) && held;
}

export interface KbdProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Forces the lit, pushed-down state. */
  pressed?: boolean;
  /** A KeyboardEvent.key value ("k", "Shift", "Meta"). The key lights up while it is held. */
  listen?: string;
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, style, color, size = "md", pressed = false, listen, ...props }, ref) => {
    const held = useKeyHeld(listen);
    const lit = pressed || held;

    return (
      <kbd
        ref={ref}
        data-state={lit ? "pressed" : "idle"}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex shrink-0 items-center justify-center whitespace-nowrap border pb-0.5 font-sans font-medium leading-none",
          "transition-[color,background-color,border-color,box-shadow,text-shadow,transform] ease-out motion-reduce:transition-none",
          "[&>svg]:size-[1.1em] [&>svg]:shrink-0",
          sizes[size].key,
          lit ? states.lit : states.rest,
          className,
        )}
        {...props}
      />
    );
  },
);
Kbd.displayName = "Kbd";

const keyNames: Record<string, string> = {
  "⌘": "Meta",
  Cmd: "Meta",
  "⌥": "Alt",
  Option: "Alt",
  "⇧": "Shift",
  "⌃": "Control",
  Ctrl: "Control",
  "↵": "Enter",
  "⏎": "Enter",
  Esc: "Escape",
  "⌫": "Backspace",
  "⇥": "Tab",
  "↑": "ArrowUp",
  "↓": "ArrowDown",
  "←": "ArrowLeft",
  "→": "ArrowRight",
  Space: " ",
};

const keyLabels: Record<string, string> = {
  "⌘": "Command",
  "⌥": "Option",
  "⇧": "Shift",
  "⌃": "Control",
  "↵": "Enter",
  "⏎": "Enter",
  "⌫": "Backspace",
  "⇥": "Tab",
  "↑": "Up arrow",
  "↓": "Down arrow",
  "←": "Left arrow",
  "→": "Right arrow",
};

export interface KbdComboProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Key labels in order, e.g. ["⌘", "K"]. Symbols get a spoken name for screen readers. */
  keys: string[];
  /** Lights each key while its real key is held. */
  listen?: boolean;
  size?: keyof typeof sizes;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Rendered between keys. Pass null for none. */
  separator?: React.ReactNode;
}

const KbdCombo = React.forwardRef<HTMLElement, KbdComboProps>(
  ({ className, style, keys, listen = false, size = "md", color, separator = "+", ...props }, ref) => (
    <kbd
      ref={ref}
      style={neonVars(color, style)}
      className={cn("inline-flex items-center font-sans", sizes[size].combo, className)}
      {...props}
    >
      {keys.map((key, index) => (
        <React.Fragment key={`${key}-${index}`}>
          {index > 0 && separator != null && separator !== false && (
            <span className="text-white/30">{separator}</span>
          )}
          <Kbd size={size} listen={listen ? (keyNames[key] ?? key) : undefined}>
            {keyLabels[key] ? (
              <>
                <span aria-hidden>{key}</span>
                <span className="sr-only">{keyLabels[key]}</span>
              </>
            ) : (
              key
            )}
          </Kbd>
        </React.Fragment>
      ))}
    </kbd>
  ),
);
KbdCombo.displayName = "KbdCombo";

export { Kbd, KbdCombo };
