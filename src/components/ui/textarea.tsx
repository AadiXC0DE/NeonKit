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
      onChange,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const invalid = Boolean(error);
    const message = invalid ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${invalid ? "error" : "description"}` : undefined;
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
      <div className={cn("grid w-full gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={id} className={cn("w-fit font-medium text-white/80", s.label)}>
            {label}
          </label>
        )}
        <div
          style={neonVars(invalid ? INVALID : color, style)}
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
            onChange={handleChange}
            aria-invalid={invalid || undefined}
            aria-describedby={
              [ariaDescribedBy, messageId, countId].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              "block w-full min-w-0 bg-transparent text-inherit outline-none placeholder:text-white/30",
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
                  tone === "idle" && "text-white/35",
                  tone === "near" && "text-[#fbbf24]",
                  tone === "limit" && "text-[#ff4d5e]",
                )}
              >
                {length}
                {maxLength !== undefined && (
                  <span className={tone === "limit" ? undefined : "text-white/25"}>
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
            className={cn("text-xs leading-5", invalid ? "text-[#ff4d5e]" : "text-white/55")}
          >
            {message}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
