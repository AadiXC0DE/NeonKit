"use client";

import * as React from "react";
import { Check, Eye, EyeOff } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";
import { Input, type InputProps } from "@/components/ui/input";

// The halo is one drop-shadow over the whole row of segments, in the current score's color.
const css = `
.nk-pw-row { filter: drop-shadow(0 0 4px rgb(var(--nk-pw) / calc(0.55 * var(--neon-glow, 1)))); }
.nk-pw-seg { background-color: rgb(255 255 255 / 0.07); transition: background-color 180ms ease-out; }
.nk-pw-seg[data-lit] { background-color: color-mix(in srgb, rgb(var(--nk-pw)) 85%, white); }
@media (prefers-reduced-motion: reduce) { .nk-pw-seg { transition: none; } }
`;

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  /** 0 for empty, then 1 (weak) to 4 (strong): how many segments light. */
  score: PasswordScore;
  /** Shown next to the meter and announced when it changes. */
  label: string;
}

export interface PasswordRule {
  id: string;
  label: React.ReactNode;
  test: (value: string) => boolean;
}

const COMMON = [
  "password", "qwerty", "letmein", "welcome", "admin", "iloveyou", "monkey", "dragon", "sunshine",
  "football", "baseball", "master", "login", "secret", "trustno", "princess", "starwars", "shadow",
  "superman", "asdfgh", "zxcvbn", "123456", "111111", "abc123", "changeme",
];
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s", "!": "i" };
const LABELS = ["", "Weak", "Fair", "Good", "Strong"] as const;

/**
 * A small entropy estimate: length times the size of the character pool, minus what repeats,
 * runs (abc, 321) and common passwords give away. Not zxcvbn, but it ranks the usual suspects right.
 */
function evaluatePassword(value: string, minLength = 12): PasswordStrength {
  if (!value) return { score: 0, label: "" };
  let pool = 0;
  if (/[a-z]/.test(value)) pool += 26;
  if (/[A-Z]/.test(value)) pool += 26;
  if (/\d/.test(value)) pool += 10;
  if (/[^A-Za-z0-9\s]/.test(value)) pool += 33;
  if (/\s/.test(value)) pool += 1;
  if (/[^\x00-\x7f]/.test(value)) pool += 60;
  const perChar = Math.log2(Math.max(pool, 2));
  let bits = value.length * perChar;

  // Repeats and runs: each character after the first two in a run adds almost nothing.
  let run = 1;
  for (let i = 1; i < value.length; i++) {
    const step = value.charCodeAt(i) - value.charCodeAt(i - 1);
    const prev = i > 1 ? value.charCodeAt(i - 1) - value.charCodeAt(i - 2) : NaN;
    run = Math.abs(step) <= 1 && (run === 1 || step === prev) ? run + 1 : 1;
    if (run >= 3) bits -= perChar * 0.8;
  }

  const plain = value.toLowerCase().replace(/[0-9@$!]/g, (c) => LEET[c] ?? c);
  for (const word of COMMON) {
    if (plain.includes(word) || value.toLowerCase().includes(word)) bits -= word.length * perChar - 4;
  }

  let score: PasswordScore = bits < 28 ? 1 : bits < 45 ? 2 : bits < 75 ? 3 : 4;
  if (value.length < 8) score = 1;
  else if (value.length < minLength && score > 2) score = 2;
  return { score, label: LABELS[score] };
}

function defaultRules(minLength: number): PasswordRule[] {
  return [
    { id: "length", label: `${minLength} or more characters`, test: (v) => v.length >= minLength },
    { id: "number", label: "A number", test: (v) => /\d/.test(v) },
    { id: "case", label: "Upper and lower case", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
    { id: "symbol", label: "A symbol", test: (v) => /[^A-Za-z0-9\s]/.test(v) },
  ];
}

const tones: Record<PasswordScore, { rgb: string; text: string }> = {
  0: { rgb: "var(--neon)", text: "text-white/45" },
  1: { rgb: "255 77 94", text: "text-[#ff4d5e]" },
  2: { rgb: "251 191 36", text: "text-[#fbbf24]" },
  3: { rgb: "var(--neon)", text: "text-[rgb(var(--neon))]" },
  4: { rgb: "var(--neon)", text: "text-[rgb(var(--neon))]" },
};

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const toggleSizes = { sm: "size-6 [&_svg]:size-3.5", md: "size-7 [&_svg]:size-4", lg: "size-8 [&_svg]:size-[18px]" } as const;

export interface PasswordInputProps
  extends Omit<InputProps, "type" | "trailing" | "value" | "defaultValue" | "error"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shows the password as text. */
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** Shows the four-segment strength meter under the field. */
  strength?: boolean;
  /** Shows a checklist under the field. `true` uses length, number, mixed case and symbol. */
  rules?: boolean | PasswordRule[];
  /** Length the default rule and the estimate ask for (12 when omitted). Set on the input only when passed. */
  minLength?: number;
  /** Replaces the built-in estimate. Receives the value and which rules pass. */
  evaluate?: (value: string, passed: Record<string, boolean>) => PasswordStrength;
  /** Warns while Caps Lock is on and the field has focus. */
  capsLockWarning?: boolean;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      visible: visibleProp,
      defaultVisible = false,
      onVisibleChange,
      strength = false,
      rules = false,
      minLength: minLengthProp,
      evaluate,
      capsLockWarning = true,
      error,
      description,
      size = "md",
      color,
      id: idProp,
      className,
      containerClassName,
      autoComplete,
      disabled,
      onChange,
      onKeyDown,
      onKeyUp,
      onBlur,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const minLength = minLengthProp ?? 12;
    const autoId = React.useId();
    const id = idProp ?? autoId;

    const [innerValue, setInnerValue] = React.useState(defaultValue);
    const value = valueProp ?? innerValue;
    const [innerVisible, setInnerVisible] = React.useState(defaultVisible);
    const visible = visibleProp ?? innerVisible;
    const [capsLock, setCapsLock] = React.useState(false);
    const selection = React.useRef<[number | null, number | null] | null>(null);

    // The value is held here so the meter can read it; a form reset still empties the field.
    const defaultRef = React.useRef(defaultValue);
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form || valueProp !== undefined) return;
      const reset = () => setInnerValue(defaultRef.current);
      form.addEventListener("reset", reset);
      return () => form.removeEventListener("reset", reset);
    }, [valueProp]);

    const ruleList = rules === true ? defaultRules(minLength) : rules || [];
    const passed: Record<string, boolean> = {};
    for (const rule of ruleList) passed[rule.id] = rule.test(value);
    const result = strength ? (evaluate ? evaluate(value, passed) : evaluatePassword(value, minLength)) : null;
    const score = result ? (Math.max(0, Math.min(4, Math.round(result.score))) as PasswordScore) : 0;

    const errored = Boolean(error);
    const message = errored ? (error === true ? null : error) : description;
    const ids = {
      caps: `${id}-caps`,
      strength: `${id}-strength`,
      rules: `${id}-rules`,
      message: `${id}-${errored ? "error" : "description"}`,
    };
    const capsShown = capsLockWarning && capsLock;
    const describedBy =
      [
        ariaDescribedBy,
        capsShown && ids.caps,
        result && ids.strength,
        ruleList.length > 0 && ids.rules,
        message && ids.message,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const setVisible = (next: boolean) => {
      const input = inputRef.current;
      if (input && document.activeElement === input) selection.current = [input.selectionStart, input.selectionEnd];
      if (visibleProp === undefined) setInnerVisible(next);
      onVisibleChange?.(next);
    };

    // Switching type drops the caret in some browsers; put it back where it was.
    useIsomorphicLayoutEffect(() => {
      const saved = selection.current;
      const input = inputRef.current;
      selection.current = null;
      if (!saved || !input) return;
      try {
        input.setSelectionRange(saved[0], saved[1]);
      } catch {
        // Some input types refuse selection ranges.
      }
    }, [visible]);

    const readCaps = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (typeof event.getModifierState === "function") setCapsLock(event.getModifierState("CapsLock"));
    };

    const tone = tones[score];

    return (
      <div style={neonVars(color)} className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-2", containerClassName)}>
        {result && <style href="nk-password-input" precedence="nk">{css}</style>}
        <Input
          ref={inputRef}
          id={id}
          size={size}
          type={visible ? "text" : "password"}
          value={value}
          disabled={disabled}
          minLength={minLengthProp}
          autoComplete={autoComplete ?? (strength || rules ? "new-password" : "current-password")}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          // Field marks its control with aria-invalid; draw that red too, not just an own error.
          error={errored || ariaInvalid === true || ariaInvalid === "true" || undefined}
          aria-describedby={describedBy}
          data-visible={visible ? "" : undefined}
          // Shown as text, it's set in mono so l, 1, I, O and 0 can be told apart.
          className={cn(visible && "[&_input]:font-mono [&_input]:text-[0.95em]", className)}
          onChange={(event) => {
            onChange?.(event);
            if (valueProp === undefined) setInnerValue(event.target.value);
            onValueChange?.(event.target.value);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            readCaps(event);
          }}
          onKeyUp={(event) => {
            onKeyUp?.(event);
            readCaps(event);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            setCapsLock(false);
          }}
          trailing={
            <span className="-mr-1.5 flex items-center gap-1.5">
              {capsShown && (
                <span
                  aria-hidden
                  className="rounded-[5px] border border-[#fbbf24]/35 bg-[#fbbf24]/[0.08] px-1.5 py-px text-[11px] font-medium leading-4 text-[#fbbf24]"
                >
                  Caps Lock
                </span>
              )}
              <button
                type="button"
                aria-label="Show password"
                aria-pressed={visible}
                aria-controls={id}
                disabled={disabled}
                // Keep focus (and the caret) in the field when clicked.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setVisible(!visible)}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-white/50 outline-none",
                  "transition-[color,background-color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.94]",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                  "aria-pressed:text-[rgb(var(--neon))] disabled:pointer-events-none",
                  toggleSizes[size],
                )}
              >
                {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </button>
            </span>
          }
          {...props}
        />
        <span id={ids.caps} role="status" className="sr-only">
          {capsShown ? "Caps Lock is on" : ""}
        </span>

        {result && (
          <div className="flex items-center gap-3" style={{ "--nk-pw": tone.rgb } as React.CSSProperties}>
            <span aria-hidden className="flex h-[9px] flex-1 rounded-[4px] border border-white/[0.08] bg-[#07080c] p-[2px]">
              <span className="nk-pw-row flex flex-1 gap-[3px]">
                {[1, 2, 3, 4].map((segment) => (
                  <span
                    key={segment}
                    data-lit={segment <= score ? "" : undefined}
                    className="nk-pw-seg flex-1 rounded-[1.5px]"
                  />
                ))}
              </span>
            </span>
            <span
              id={ids.strength}
              aria-live="polite"
              className={cn("min-w-[3.5rem] shrink-0 whitespace-nowrap text-right text-xs font-medium leading-5 transition-colors duration-150", tone.text)}
            >
              {result.label ? (
                <>
                  <span className="sr-only">Strength: </span>
                  {result.label}
                </>
              ) : (
                <span className="font-normal">Strength</span>
              )}
            </span>
          </div>
        )}

        {ruleList.length > 0 && (
          <ul id={ids.rules} className="grid gap-x-4 gap-y-1 text-[12.5px] leading-5 sm:grid-cols-2">
            {ruleList.map((rule) => {
              const met = passed[rule.id];
              return (
                <li key={rule.id} data-met={met ? "" : undefined} className="flex items-center gap-2">
                  <span aria-hidden className="grid size-3.5 shrink-0 place-items-center">
                    {met ? (
                      <Check
                        strokeWidth={2.5}
                        className="size-3.5 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_3px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))))]"
                      />
                    ) : (
                      <span className="size-1 rounded-full bg-white/30" />
                    )}
                  </span>
                  <span className={cn("transition-colors duration-150", met ? "text-white/80" : "text-white/50")}>
                    {rule.label}
                    <span className="sr-only">{met ? ", done" : ", not yet"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {message && (
          <p id={ids.message} className={cn("text-xs leading-5", errored ? "text-[#ff4d5e]" : "text-white/55")}>
            {message}
          </p>
        )}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput, evaluatePassword };
