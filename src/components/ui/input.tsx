"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";

const sizes = {
  sm: {
    field: "h-8 rounded-md text-xs",
    input: "px-2.5",
    leading: "pl-2.5 [&_svg]:size-3.5",
    trailing: "pr-2.5 [&_svg]:size-3.5",
    afterLeading: "pl-1.5",
    beforeTrailing: "pr-1.5",
    label: "text-xs",
  },
  md: {
    field: "h-10 rounded-lg text-sm",
    input: "px-3",
    leading: "pl-3 [&_svg]:size-4",
    trailing: "pr-3 [&_svg]:size-4",
    afterLeading: "pl-2",
    beforeTrailing: "pr-2",
    label: "text-sm",
  },
  lg: {
    field: "h-12 rounded-xl text-base",
    input: "px-4",
    leading: "pl-4 [&_svg]:size-[18px]",
    trailing: "pr-4 [&_svg]:size-[18px]",
    afterLeading: "pl-2.5",
    beforeTrailing: "pr-2.5",
    label: "text-sm",
  },
} as const;

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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color" | "size"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Icon or text addon inside the field, before the value. */
  leading?: React.ReactNode;
  /** Icon, hint or small button inside the field, after the value. */
  trailing?: React.ReactNode;
  label?: React.ReactNode;
  /** Helper text under the field. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Classes for the field box: the bordered wrapper around the input. */
  className?: string;
  /** Classes for the outer block holding the label, field and message. */
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      style,
      color,
      size = "md",
      leading,
      trailing,
      label,
      description,
      error,
      id: idProp,
      disabled,
      readOnly,
      required,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const rejected = useRejected(inputRef);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const errored = Boolean(error);
    const message = errored ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${errored ? "error" : "description"}` : undefined;
    // A wrapping Field marks its control with aria-invalid; it lights the same red as `error`.
    const ariaInvalid = props["aria-invalid"];
    const invalid = errored || rejected || ariaInvalid === true || ariaInvalid === "true";
    const s = sizes[size];

    // Clicks on the padding or icons land in the input, like a native field.
    function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
      const target = event.target as HTMLElement;
      if (target === inputRef.current) return;
      if (target.closest("button, a, input, select, textarea, [tabindex]")) return;
      event.preventDefault();
      inputRef.current?.focus();
    }

    return (
      <div
        style={neonVars(color)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-1.5", containerClassName)}
      >
        {label && (
          <label htmlFor={id} className={cn("w-fit font-medium text-white/80", s.label)}>
            {label}
            {required && <RequiredDot />}
          </label>
        )}
        <div
          style={invalid ? neonVars(INVALID, style) : style}
          onMouseDown={handleMouseDown}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/field relative flex w-full cursor-text items-center border border-white/10 bg-white/[0.03] text-white/90",
            "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
            "focus-within:border-[rgb(var(--neon)/0.8)] focus-within:bg-[rgb(var(--neon)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))),inset_0_0_12px_-2px_rgb(var(--neon)/CALC(0.14*var(--neon-glow,1)))]",
            !disabled && "hover:[&:not(:focus-within)]:border-white/20",
            invalid && "border-[rgb(var(--neon)/0.55)] hover:[&:not(:focus-within)]:border-[rgb(var(--neon)/0.75)]",
            readOnly &&
              "border-white/[0.08] bg-transparent text-white/70 focus-within:border-[rgb(var(--neon)/0.45)] focus-within:bg-transparent focus-within:shadow-none",
            disabled && "cursor-not-allowed opacity-50",
            s.field,
            className,
          )}
        >
          {leading && (
            <span
              className={cn(
                "flex shrink-0 items-center text-white/50 [&_svg]:transition-colors [&_svg]:duration-200 group-focus-within/field:[&_svg]:text-[rgb(var(--neon)/0.9)]",
                s.leading,
              )}
            >
              {leading}
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={[ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined}
            className={cn(
              "h-full w-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-white/50 [color-scheme:dark]",
              "disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255_255_255/0.9)] [&:-webkit-autofill]:[transition:background-color_9999s_ease-out]",
              s.input,
              leading && s.afterLeading,
              trailing && s.beforeTrailing,
            )}
            {...props}
          />
          {trailing && (
            <span className={cn("flex shrink-0 items-center text-white/50", s.trailing)}>
              {trailing}
            </span>
          )}
        </div>
        {message && (
          <p
            id={messageId}
            className={cn("text-xs leading-5", errored ? "text-[#ff4d5e]" : "text-white/55")}
          >
            {message}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

/** The neon dot Field's Label uses, so required fields read the same everywhere. */
function RequiredDot() {
  return (
    <span
      aria-hidden
      title="Required"
      className="relative -top-px ml-1.5 inline-block size-[5px] rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_4px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_10px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))]"
    />
  );
}

export { Input };
