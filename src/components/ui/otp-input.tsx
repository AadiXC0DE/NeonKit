"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const sizes = {
  sm: { root: "gap-1.5", slot: "h-9 w-8 rounded-md text-sm", caret: "h-3.5", dot: "size-1.5", dash: "w-2" },
  md: { root: "gap-2", slot: "h-12 w-10 rounded-lg text-lg", caret: "h-5", dot: "size-2", dash: "w-2.5" },
  lg: { root: "gap-2.5", slot: "h-14 w-12 rounded-xl text-2xl", caret: "h-6", dot: "size-2.5", dash: "w-3" },
} as const;

const SHAKE: Keyframe[] = [0, -7, 6, -4, 3, -1, 0].map((x) => ({
  transform: `translateX(${x}px)`,
}));

function sanitize(text: string, mode: "numeric" | "alphanumeric") {
  return (text.match(mode === "numeric" ? /\d/g : /[a-z0-9]/gi) ?? []).join("");
}

/**
 * True once the browser rejects the field on submit (required, type, pattern), until it's
 * edited, its value changes or the form resets. The browser still shows its own message;
 * this keeps the field red after that bubble fades.
 */
function useRejected(ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, value?: string) {
  const [rejected, setRejected] = React.useState<{ value?: string } | null>(null);
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  });
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const form = element.form;
    const flag = () => setRejected({ value: valueRef.current });
    const clear = () => setRejected(null);
    element.addEventListener("invalid", flag);
    element.addEventListener("input", clear);
    form?.addEventListener("reset", clear);
    return () => {
      element.removeEventListener("invalid", flag);
      element.removeEventListener("input", clear);
      form?.removeEventListener("reset", clear);
    };
  }, [ref]);
  return rejected !== null && rejected.value === value;
}

export interface OTPInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** Number of slots. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (code: string) => void;
  /** Called once every slot is filled. */
  onComplete?: (code: string) => void;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Which characters are accepted. Also picks the mobile keyboard. */
  mode?: "numeric" | "alphanumeric";
  /** Split the slots into groups of this size with a dash between them. */
  groupSize?: number;
  /** Show dots instead of the characters. */
  mask?: boolean;
  disabled?: boolean;
  /** Red state. The row shakes each time this turns on. */
  invalid?: boolean;
  /** Focus the first empty slot on mount. */
  autoFocus?: boolean;
  /** Submits the code under this name with a surrounding form. */
  name?: string;
  /** Blocks form submission until every slot is filled. */
  required?: boolean;
}

const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 6,
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      color,
      size = "md",
      mode = "numeric",
      groupSize,
      mask = false,
      disabled = false,
      invalid = false,
      autoFocus = false,
      name,
      required = false,
      className,
      style,
      "aria-label": ariaLabel = "One-time code",
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const inputs = React.useRef<(HTMLInputElement | null)[]>([]);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    const [uncontrolled, setUncontrolled] = React.useState(() =>
      sanitize(defaultValue, mode).slice(0, length),
    );
    const code = sanitize(value ?? uncontrolled, mode).slice(0, length);
    const cursor = Math.min(code.length, length - 1);
    const s = sizes[size];
    const unit = mode === "numeric" ? "Digit" : "Character";

    // Handlers read the latest code from here, since focus moves before React re-renders.
    const codeRef = React.useRef(code);
    useIsomorphicLayoutEffect(() => {
      codeRef.current = code;
    });

    // Keep the focused slot's character selected so the next keystroke replaces it.
    useIsomorphicLayoutEffect(() => {
      const active = document.activeElement;
      if (active instanceof HTMLInputElement && inputs.current.includes(active)) active.select();
    }, [code]);

    const wasInvalid = React.useRef(invalid);
    React.useEffect(() => {
      if (invalid && !wasInvalid.current) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduce) {
          rootRef.current?.animate?.(SHAKE, {
            duration: 420,
            easing: "cubic-bezier(0.36, 0.07, 0.19, 0.97)",
          });
        }
      }
      wasInvalid.current = invalid;
    }, [invalid]);

    // A form reset empties the native slots; empty the code with them.
    const proxyRef = React.useRef<HTMLInputElement>(null);
    const rejected = useRejected(proxyRef, code);
    const red = invalid || rejected;
    const initialCode = React.useRef(code);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        const initial = initialCode.current;
        if (initial === codeRef.current) return;
        codeRef.current = initial;
        if (value === undefined) setUncontrolled(initial);
        onValueChange?.(initial);
      };
    });
    React.useEffect(() => {
      const form = proxyRef.current?.form;
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    // The browser's own "fill this in" bubble, worded for a code.
    React.useEffect(() => {
      const unitName = mode === "numeric" ? "digits" : "characters";
      proxyRef.current?.setCustomValidity(
        required && code.length < length ? `Enter all ${length} ${unitName}.` : "",
      );
    }, [required, code, length, mode]);

    function focusSlot(index: number) {
      const target = Math.max(0, Math.min(index, codeRef.current.length, length - 1));
      const input = inputs.current[target];
      input?.focus();
      input?.select();
    }

    function update(next: string, focusIndex: number) {
      const previous = codeRef.current;
      codeRef.current = next;
      if (next !== previous) {
        if (value === undefined) setUncontrolled(next);
        onValueChange?.(next);
        if (next.length === length) onComplete?.(next);
      }
      focusSlot(focusIndex);
    }

    function fill(index: number, chars: string) {
      // A full code replaces everything, wherever it was pasted.
      const start = chars.length >= length ? 0 : index;
      const current = codeRef.current;
      const next = (current.slice(0, start) + chars + current.slice(start + chars.length)).slice(
        0,
        length,
      );
      update(next, start + chars.length);
    }

    function handleChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
      const current = codeRef.current;
      const raw = event.target.value;
      const previous = current[index] ?? "";
      if (!raw) {
        if (previous) update(current.slice(0, index) + current.slice(index + 1), index);
        return;
      }
      // Typing into a filled slot without a selection gives "old + new". Keep the new one.
      const typed = previous && raw.length === 2 && raw.includes(previous) ? raw.replace(previous, "") : raw;
      const chars = sanitize(typed, mode);
      if (chars) fill(index, chars);
    }

    function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
      const current = codeRef.current;
      switch (event.key) {
        case "Backspace":
          event.preventDefault();
          if (current[index]) update(current.slice(0, index) + current.slice(index + 1), index);
          else if (index > 0) update(current.slice(0, index - 1) + current.slice(index), index - 1);
          break;
        case "Delete":
          event.preventDefault();
          if (current[index]) update(current.slice(0, index) + current.slice(index + 1), index);
          break;
        case "ArrowLeft":
          event.preventDefault();
          focusSlot(index - 1);
          break;
        case "ArrowRight":
          event.preventDefault();
          focusSlot(index + 1);
          break;
        case "Home":
          event.preventDefault();
          focusSlot(0);
          break;
        case "End":
          event.preventDefault();
          focusSlot(length - 1);
          break;
      }
    }

    return (
      <div
        ref={rootRef}
        role="group"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        data-invalid={red || undefined}
        style={neonVars(red ? INVALID : color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-flex max-w-full items-center",
          s.root,
          className,
        )}
        {...props}
      >
        {Array.from({ length }, (_, index) => {
          const char = code[index] ?? "";
          return (
            <React.Fragment key={index}>
              {groupSize && index > 0 && index % groupSize === 0 ? (
                <span
                  aria-hidden
                  className={cn("h-0.5 shrink-0 rounded-full bg-[rgb(var(--neon)/0.45)]", s.dash)}
                />
              ) : null}
              {/* Slots keep their size until the row runs out of room, then narrow together. */}
              <div className="relative min-w-0 shrink">
                <input
                  ref={(node) => {
                    inputs.current[index] = node;
                  }}
                  type={mask ? "password" : "text"}
                  inputMode={mode === "numeric" ? "numeric" : "text"}
                  pattern={mode === "numeric" ? "[0-9]*" : undefined}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  // The first slot takes a whole code so SMS autofill can land in one go.
                  maxLength={index === 0 ? length : 1}
                  value={char}
                  disabled={disabled}
                  autoFocus={autoFocus && index === cursor}
                  tabIndex={index === cursor ? 0 : -1}
                  aria-label={`${unit} ${index + 1} of ${length}`}
                  aria-invalid={red || undefined}
                  onChange={(event) => handleChange(index, event)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={(event) => {
                    event.preventDefault();
                    const chars = sanitize(event.clipboardData.getData("text"), mode);
                    if (chars) fill(index, chars);
                  }}
                  onMouseDown={(event) => {
                    // Slots fill left to right, so a click past the cursor lands on the cursor.
                    if (index > Math.min(codeRef.current.length, length - 1)) {
                      event.preventDefault();
                      focusSlot(index);
                    }
                  }}
                  onFocus={(event) => {
                    if (index > Math.min(codeRef.current.length, length - 1)) focusSlot(index);
                    else event.target.select();
                  }}
                  onClick={(event) => {
                    if (document.activeElement === event.currentTarget) event.currentTarget.select();
                  }}
                  className={cn(
                    "peer block max-w-full border border-white/10 bg-white/[0.03] p-0 text-center font-medium tabular-nums text-white caret-transparent outline-none selection:bg-transparent",
                    "transition-[border-color,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    char
                      ? "border-[rgb(var(--neon)/0.45)] bg-[rgb(var(--neon)/0.05)] shadow-[0_0_12px_-3px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]"
                      : "hover:border-white/20",
                    "focus:border-[rgb(var(--neon))] focus:bg-[rgb(var(--neon)/0.08)] focus:shadow-[0_0_0_1px_rgb(var(--neon)/0.3),0_0_22px_-2px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))),inset_0_0_10px_rgb(var(--neon)/CALC(0.15*var(--neon-glow,1)))]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    mask && "text-transparent",
                    s.slot,
                  )}
                />
                {!char && (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-1/2 top-1/2 hidden w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/var(--neon-glow,1))]",
                      "animate-pulse [animation-duration:1.1s] peer-focus:block motion-reduce:animate-none",
                      s.caret,
                    )}
                  />
                )}
                {mask && char && (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90",
                      s.dot,
                    )}
                  />
                )}
              </div>
            </React.Fragment>
          );
        })}
        {/* Carries the code into forms, under the slots so a validation bubble points at them. */}
        <input
          ref={proxyRef}
          aria-hidden
          tabIndex={-1}
          autoComplete="off"
          name={name}
          value={code}
          required={required}
          disabled={disabled}
          onChange={() => {}}
          onFocus={() => focusSlot(codeRef.current.length)}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        />
      </div>
    );
  },
);
OTPInput.displayName = "OTPInput";

export { OTPInput };
