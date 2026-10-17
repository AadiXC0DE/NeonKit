"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Controls and card indicators are offset so their center meets the
// center of the label's first line.
const sizes = {
  sm: {
    item: "gap-2.5",
    control: "mt-0.5 size-4",
    dot: "size-1.5",
    label: "text-[13px] leading-5",
    description: "text-xs leading-4",
    card: "p-3",
    cardLabel: "pr-6",
    cardIcon: "mb-2.5 h-5 [&_svg]:size-4",
    indicator: "right-3 top-[15px] size-3.5",
    indicatorDot: "size-1",
  },
  md: {
    item: "gap-3",
    control: "size-5",
    dot: "size-2",
    label: "text-sm leading-5",
    description: "mt-0.5 text-[13px] leading-[18px]",
    card: "p-4",
    cardLabel: "pr-7",
    cardIcon: "mb-3 h-5 [&_svg]:size-5",
    indicator: "right-4 top-[18px] size-4",
    indicatorDot: "size-1.5",
  },
  lg: {
    item: "gap-3",
    control: "size-6",
    dot: "size-2.5",
    label: "text-base leading-6",
    description: "mt-0.5 text-sm leading-5",
    card: "p-5",
    cardLabel: "pr-8",
    cardIcon: "mb-3.5 h-6 [&_svg]:size-6",
    indicator: "right-5 top-[23px] size-[18px]",
    indicatorDot: "size-2",
  },
} as const;

type RadioGroupSize = keyof typeof sizes;
type RadioGroupVariant = "default" | "card";

type RadioGroupContextValue = {
  name: string;
  value: string | undefined;
  select: (value: string) => void;
  variant: RadioGroupVariant;
  size: RadioGroupSize;
  disabled: boolean;
  required: boolean;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  const context = React.useContext(RadioGroupContext);
  if (!context) throw new Error("RadioGroupItem must be used inside a RadioGroup.");
  return context;
}

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shared by the native radios. Defaults to a generated id. */
  name?: string;
  orientation?: "vertical" | "horizontal";
  variant?: RadioGroupVariant;
  size?: RadioGroupSize;
  disabled?: boolean;
  required?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      style,
      color,
      value: valueProp,
      defaultValue,
      onValueChange,
      name,
      orientation = "vertical",
      variant = "default",
      size = "md",
      disabled = false,
      required = false,
      children,
      ...props
    },
    ref,
  ) => {
    const autoName = React.useId();
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : uncontrolled;

    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    // A form reset moves the native radios back without a change event. Follow it.
    const initialValue = React.useRef(value);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        const initial = initialValue.current;
        if (initial === value) return;
        if (!isControlled) setUncontrolled(initial);
        if (initial !== undefined) onValueChange?.(initial);
      };
    });
    React.useEffect(() => {
      const form = rootRef.current?.closest("form");
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    const context = React.useMemo<RadioGroupContextValue>(
      () => ({
        name: name ?? autoName,
        value,
        select: (next) => {
          if (!isControlled) setUncontrolled(next);
          onValueChange?.(next);
        },
        variant,
        size,
        disabled,
        required,
      }),
      [name, autoName, value, isControlled, onValueChange, variant, size, disabled, required],
    );

    const horizontal = orientation === "horizontal";

    return (
      <RadioGroupContext.Provider value={context}>
        <div
          ref={rootRef}
          role="radiogroup"
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          data-orientation={orientation}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            variant === "card"
              ? horizontal
                ? "grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))]"
                : "grid gap-2.5"
              : horizontal
                ? "flex flex-wrap gap-x-6 gap-y-3"
                : "flex flex-col gap-3",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "color" | "size" | "type" | "value" | "name" | "checked" | "defaultChecked"
  > {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Card variant only: shown above the label. */
  icon?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  (
    {
      className,
      style,
      value,
      label,
      description,
      icon,
      disabled: itemDisabled,
      children,
      id: idProp,
      onChange,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) => {
    const group = useRadioGroup();
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    const extraId = `${id}-extra`;

    const checked = group.value === value;
    const disabled = group.disabled || !!itemDisabled;
    const card = group.variant === "card";
    const s = sizes[group.size];

    const input = (
      <input
        ref={ref}
        type="radio"
        id={id}
        name={group.name}
        value={value}
        checked={checked}
        disabled={disabled}
        required={group.required}
        onChange={(event) => {
          onChange?.(event);
          if (event.target.checked) group.select(value);
        }}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={
          [describedBy, description && descriptionId, children && extraId]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn(
          "peer absolute inset-0 m-0 size-full cursor-[inherit] appearance-none opacity-0",
          card && "rounded-[inherit]",
        )}
        {...props}
      />
    );

    const labelEl = label && (
      <span
        id={labelId}
        className={cn(
          "block transition-colors duration-150",
          checked && card ? "text-white" : "text-white/90",
          (description || card) && "font-medium",
          s.label,
          card && s.cardLabel,
        )}
      >
        {label}
      </span>
    );

    const descriptionEl = description && (
      <span id={descriptionId} className={cn("block text-white/55", s.description)}>
        {description}
      </span>
    );

    const extraEl = children && (
      <span id={extraId} className={cn("block", card ? "mt-3" : "mt-2")}>
        {children}
      </span>
    );

    if (card) {
      return (
        <label
          data-state={checked ? "checked" : "unchecked"}
          data-disabled={disabled ? "" : undefined}
          style={style}
          className={cn(
            "group/radio relative flex cursor-pointer select-none flex-col rounded-xl border",
            "transition-[background-color,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
            checked
              ? "border-[rgb(var(--neon)/0.7)] bg-[rgb(var(--neon)/0.05)] shadow-[0_0_24px_-6px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),inset_0_0_16px_rgb(var(--neon)/CALC(0.06*var(--neon-glow,1)))]"
              : "border-white/10 bg-white/[0.03]",
            !checked && !disabled && "hover:border-white/20 hover:bg-white/[0.05]",
            disabled && "cursor-not-allowed opacity-50",
            s.card,
            className,
          )}
        >
          {input}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[inherit] peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--neon)/0.6)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#05060a]"
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute flex items-center justify-center rounded-full border",
              "transition-[border-color,box-shadow] duration-150 ease-out",
              checked
                ? "border-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]"
                : "border-white/20",
              s.indicator,
            )}
          >
            <Dot checked={checked} className={s.indicatorDot} />
          </span>
          {icon && (
            <span
              aria-hidden
              className={cn(
                "flex items-center transition-colors duration-150",
                checked ? "text-[rgb(var(--neon))]" : "text-white/55",
                s.cardIcon,
              )}
            >
              {icon}
            </span>
          )}
          {labelEl}
          {descriptionEl}
          {extraEl}
        </label>
      );
    }

    return (
      <label
        data-state={checked ? "checked" : "unchecked"}
        data-disabled={disabled ? "" : undefined}
        style={style}
        className={cn(
          "group/radio inline-flex cursor-pointer select-none items-start",
          disabled && "cursor-not-allowed opacity-50",
          s.item,
          className,
        )}
      >
        <span className={cn("relative inline-flex shrink-0", s.control)}>
          {input}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none flex size-full items-center justify-center rounded-full border",
              "transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out motion-reduce:transition-none",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--neon)/0.6)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#05060a]",
              checked
                ? "border-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.1)] shadow-[0_0_12px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]"
                : "border-white/20 bg-white/[0.03]",
              !disabled && "group-active/radio:scale-[0.92]",
              !checked && !disabled && "group-hover/radio:border-[rgb(var(--neon)/0.55)]",
            )}
          >
            <Dot checked={checked} className={s.dot} />
          </span>
        </span>

        {(label || description || children) && (
          <span className="grid min-w-0">
            {labelEl}
            {descriptionEl}
            {extraEl}
          </span>
        )}
      </label>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

function Dot({ checked, className }: { checked: boolean; className: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/var(--neon-glow,1)),0_0_12px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]",
        "transition-[transform,scale,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
        className,
      )}
    />
  );
}

export { RadioGroup, RadioGroupItem };
