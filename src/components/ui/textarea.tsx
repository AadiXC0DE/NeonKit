"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const sizes = {
  sm: {
    field: "rounded-md text-xs",
    textarea: "px-2.5 py-1.5 leading-5",
    count: "px-2.5 pb-1.5 text-[10px]",
    label: "text-xs",
  },
  md: {
    field: "rounded-lg text-sm",
    textarea: "px-3 py-2 leading-6",
    count: "px-3 pb-2 text-[11px]",
    label: "text-sm",
  },
  lg: {
    field: "rounded-xl text-base",
    textarea: "px-4 py-3 leading-7",
    count: "px-4 pb-3 text-xs",
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

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  label?: React.ReactNode;
  /** Helper text under the field. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Grow with the content between `minRows` and `maxRows`. */
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Show a character count, or `count / maxLength` when `maxLength` is set. */
  showCount?: boolean;
  /** Classes for the field box: the bordered wrapper around the textarea. */
  className?: string;
  /** Classes for the outer block holding the label, field and message. */
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      style,
      color,
      size = "md",
      label,
      description,
      error,
      autoResize = true,
      minRows = 3,
      maxRows = 10,
      showCount = false,
      id: idProp,
      value,
      defaultValue,
      maxLength,
      rows,
      disabled,
      readOnly,
      required,
      onChange,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);
    const rejected = useRejected(textareaRef);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const errored = Boolean(error);
    const message = errored ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${errored ? "error" : "description"}` : undefined;
    const invalid = errored || rejected;
    const countId = showCount ? `${id}-count` : undefined;
    const s = sizes[size];

    const [uncontrolledLength, setUncontrolledLength] = React.useState(
      () => String(defaultValue ?? "").length,
    );
    const length = value !== undefined ? String(value).length : uncontrolledLength;
    const tone =
      maxLength === undefined
        ? "idle"
        : length >= maxLength
          ? "limit"
          : length >= maxLength * 0.9
            ? "near"
            : "idle";

    const resize = React.useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      if (!autoResize) {
        el.style.height = "";
        el.style.overflowY = "";
        return;
      }
      const styles = window.getComputedStyle(el);
      const lineHeight =
        parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.5;
      const chrome = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const min = lineHeight * minRows + chrome;
      const max = lineHeight * Math.max(maxRows, minRows) + chrome;

      // Collapse to the minimum first so scrollHeight reports the content, not the old box.
      el.style.height = `${min}px`;
      const next = Math.min(Math.max(el.scrollHeight, min), max);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    }, [autoResize, minRows, maxRows]);

    useIsomorphicLayoutEffect(() => {
      resize();
    }, [resize, value]);

    // Re-measure when the width changes, since line wrapping changes with it.
    React.useEffect(() => {
      const el = textareaRef.current;
      if (!el || !autoResize || typeof ResizeObserver === "undefined") return;
      let width = el.offsetWidth;
      const observer = new ResizeObserver(() => {
        if (el.offsetWidth === width) return;
        width = el.offsetWidth;
        resize();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [autoResize, resize]);

    // A form reset puts the text back without a change event, so re-read the count and height.
    React.useEffect(() => {
      const form = textareaRef.current?.form;
      if (!form) return;
      let frame = 0;
      const onReset = () => {
        frame = window.requestAnimationFrame(() => {
          const el = textareaRef.current;
          if (!el) return;
          if (value === undefined) setUncontrolledLength(el.value.length);
          resize();
        });
      };
      form.addEventListener("reset", onReset);
      return () => {
        form.removeEventListener("reset", onReset);
        window.cancelAnimationFrame(frame);
      };
    }, [value, resize]);

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
      onChange?.(event);
      if (value === undefined) setUncontrolledLength(event.target.value.length);
      resize();
    }

    function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
      if (event.target === textareaRef.current) return;
      event.preventDefault();
      textareaRef.current?.focus();
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
            "group/field relative flex w-full cursor-text flex-col border border-white/10 bg-white/[0.03] text-white/90",
            "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
            "focus-within:border-[rgb(var(--neon)/0.8)] focus-within:bg-[rgb(var(--neon)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
            !disabled && "hover:[&:not(:focus-within)]:border-white/20",
            invalid && "border-[rgb(var(--neon)/0.55)] hover:[&:not(:focus-within)]:border-[rgb(var(--neon)/0.75)]",
            readOnly &&
              "border-white/[0.08] bg-transparent text-white/70 focus-within:border-[rgb(var(--neon)/0.45)] focus-within:bg-transparent focus-within:shadow-none",
            disabled && "cursor-not-allowed opacity-50",
            s.field,
            className,
          )}
        >
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            rows={autoResize ? minRows : (rows ?? minRows)}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            onChange={handleChange}
            aria-invalid={invalid || undefined}
            aria-describedby={
              [ariaDescribedBy, messageId, countId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              "block w-full min-w-0 bg-transparent text-inherit outline-none placeholder:text-white/50",
              "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin] disabled:cursor-not-allowed",
              autoResize ? "resize-none overflow-hidden" : "resize-y",
              s.textarea,
            )}
            {...props}
          />
          {showCount && (
            <div
              id={countId}
              className={cn(
                "pointer-events-none flex select-none justify-end font-medium tabular-nums",
                s.count,
              )}
            >
              <span
                className={cn(
                  "transition-colors duration-200",
                  tone === "idle" && "text-white/50",
                  tone === "near" && "text-[#fbbf24]",
                  tone === "limit" && "text-[#ff4d5e]",
                )}
              >
                {length}
                {maxLength !== undefined && (
                  <span className={tone === "limit" ? undefined : "text-white/50"}>
                    {" / "}
                    {maxLength}
                  </span>
                )}
                <span className="sr-only"> characters</span>
              </span>
            </div>
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
Textarea.displayName = "Textarea";

/** The neon dot Field's Label uses, so required fields read the same everywhere. */
function RequiredDot() {
  return (
    <span
      aria-hidden
      title="Required"
      className="relative -top-px ml-1.5 inline-block size-[5px] rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_4px_rgb(var(--neon)/0.9),0_0_10px_rgb(var(--neon)/0.5)]"
    />
  );
}

export { Textarea };
