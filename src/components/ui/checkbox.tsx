"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Each box is as tall as its label's line-height (or offset to its center),
// so box and first line of text share a center.
const sizes = {
  sm: {
    root: "gap-2.5",
    control: "mt-0.5 size-4",
    box: "rounded-[5px]",
    stroke: 2,
    label: "text-[13px] leading-5",
    description: "text-xs leading-4",
  },
  md: {
    root: "gap-3",
    control: "size-5",
    box: "rounded-md",
    stroke: 1.75,
    label: "text-sm leading-5",
    description: "mt-0.5 text-[13px] leading-[18px]",
  },
  lg: {
    root: "gap-3",
    control: "size-6",
    box: "rounded-[7px]",
    stroke: 1.6,
    label: "text-base leading-6",
    description: "mt-0.5 text-sm leading-5",
  },
} as const;

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color" | "size" | "type"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  onCheckedChange?: (checked: boolean) => void;
  /** Shows a dash and reports "mixed" to assistive tech. */
  indeterminate?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      style,
      color,
      size = "md",
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      onChange,
      indeterminate = false,
      label,
      description,
      disabled,
      id: idProp,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;

    const [uncontrolled, setUncontrolled] = React.useState(defaultChecked);
    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : uncontrolled;

    // A click clears the native flag, so re-apply it after every render.
    React.useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    });

    // A form reset unticks the native box without a change event. Follow it, and tell a
    // controlled parent, so the drawn box never disagrees with what the form submits.
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
      const form = inputRef.current?.form;
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    const state = indeterminate ? "indeterminate" : checked ? "checked" : "unchecked";
    const on = state !== "unchecked";
    const s = sizes[size];

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      onChange?.(event);
      if (!isControlled) setUncontrolled(event.target.checked);
      onCheckedChange?.(event.target.checked);
    }

    return (
      <label
        data-state={state}
        data-disabled={disabled ? "" : undefined}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          // align-middle: as an inline box its baseline is the square's bottom edge, which sits it 2px low beside text.
          "group/checkbox inline-flex cursor-pointer select-none items-start align-middle",
          disabled && "cursor-not-allowed opacity-50",
          s.root,
          className,
        )}
      >
        <span className={cn("relative inline-flex shrink-0", s.control)}>
          <input
            ref={inputRef}
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={
              [describedBy, description && descriptionId].filter(Boolean).join(" ") ||
              undefined
            }
            // Reaches a few pixels past the box, so a bare checkbox in a table row is easy to hit.
            className="peer absolute -inset-1.5 m-0 cursor-[inherit] appearance-none opacity-0"
            {...props}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none flex size-full items-center justify-center border text-[#05060a]",
              "transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out motion-reduce:transition-none",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--neon)/0.6)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#05060a]",
              !disabled && "group-active/checkbox:scale-[0.92]",
              s.box,
              on
                ? "border-[rgb(var(--neon))] bg-[rgb(var(--neon))] shadow-[0_0_14px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.35)]"
                : "border-white/20 bg-white/[0.03]",
              !disabled &&
                (on
                  ? "group-hover/checkbox:shadow-[0_0_20px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.35)]"
                  : "group-hover/checkbox:border-[rgb(var(--neon)/0.55)]"),
            )}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-full"
            >
              <Stroke d="M3.75 8.25 6.5 11l5.75-6" visible={state === "checked"} />
              <Stroke d="M4.5 8h7" visible={state === "indeterminate"} />
            </svg>
          </span>
        </span>

        {(label || description) && (
          <span className="grid min-w-0">
            {label && (
              <span
                id={labelId}
                className={cn("text-white/90", description && "font-medium", s.label)}
              >
                {label}
              </span>
            )}
            {description && (
              <span id={descriptionId} className={cn("text-white/55", s.description)}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

/** A path that draws itself on. Hidden instantly so no round cap lingers. */
function Stroke({ d, visible }: { d: string; visible: boolean }) {
  return (
    <path
      d={d}
      pathLength={1}
      strokeDasharray={1}
      className={cn(
        "transition-[stroke-dashoffset] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        visible
          ? "opacity-100 delay-[40ms] duration-200 [stroke-dashoffset:0]"
          : "opacity-0 duration-0 [stroke-dashoffset:1]",
      )}
    />
  );
}

export { Checkbox };
