"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const EASE = [0.23, 1, 0.32, 1] as const;

// A struck tube: two quick drops in brightness, then it holds. The label dips with it.
const keyframes =
  "@keyframes neonkit-toggle-ignite{0%{opacity:0}12%{opacity:.85}22%{opacity:.15}40%{opacity:1}52%{opacity:.4}68%,100%{opacity:1}}" +
  "@keyframes neonkit-toggle-ignite-label{0%{opacity:.5}12%{opacity:1}22%{opacity:.55}40%{opacity:1}52%{opacity:.7}68%,100%{opacity:1}}";
const IGNITE = "[animation:neonkit-toggle-ignite_350ms_linear_both] motion-reduce:[animation:none]";
const IGNITE_LABEL =
  "[animation:neonkit-toggle-ignite-label_350ms_linear_both] motion-reduce:[animation:none]";

const FOCUS_RING =
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";

const LIT_LABEL =
  "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.55)] [&_svg]:[filter:drop-shadow(0_0_5px_rgb(var(--neon)/0.7))]";

type Size = "sm" | "md" | "lg";
type Orientation = "horizontal" | "vertical";
type ToggleGroupVariant = "segmented" | "outline" | "ghost";

/** Counts off-to-on changes, so the flicker plays when switched on but not when mounted on. */
function useIgnitions(on: boolean) {
  const [ignitions, setIgnitions] = React.useState(0);
  const [previous, setPrevious] = React.useState(on);
  if (previous !== on) {
    setPrevious(on);
    if (on) setIgnitions((count) => count + 1);
  }
  return ignitions;
}

/* -------------------------------------------------------------------------------------------------
 * Toggle
 * -----------------------------------------------------------------------------------------------*/

const toggleSizes = {
  sm: { root: "h-8 min-w-8 rounded-md px-2 text-xs", label: "gap-1.5 [&_svg]:size-3.5" },
  md: { root: "h-10 min-w-10 rounded-lg px-2.5 text-sm", label: "gap-2 [&_svg]:size-4" },
  lg: { root: "h-12 min-w-12 rounded-xl px-3 text-base", label: "gap-2.5 [&_svg]:size-[18px]" },
} as const;

const toggleVariants = {
  default: { root: "text-white/60 hover:bg-white/[0.05] hover:text-white/90", glow: "inset-0" },
  outline: {
    root: "border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white/90",
    // Sits over the border so the lit edge replaces it.
    glow: "-inset-px",
  },
} as const;

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "value" | "onChange"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof toggleVariants;
  size?: Size;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      style,
      color,
      variant = "default",
      size = "md",
      pressed: pressedProp,
      defaultPressed = false,
      onPressedChange,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultPressed);
    const isControlled = pressedProp !== undefined;
    const pressed = isControlled ? pressedProp : uncontrolled;
    const ignitions = useIgnitions(pressed);
    const s = toggleSizes[size];
    const v = toggleVariants[variant];

    return (
      <>
        <button
          ref={ref}
          type="button"
          aria-pressed={pressed}
          data-state={pressed ? "on" : "off"}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (!isControlled) setUncontrolled(!pressed);
            onPressedChange?.(!pressed);
          }}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none",
            "transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97]",
            FOCUS_RING,
            "disabled:pointer-events-none disabled:opacity-50",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0",
            s.root,
            v.root,
            pressed && "hover:bg-transparent",
            className,
          )}
          {...props}
        >
          {pressed && (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute rounded-[inherit] bg-[rgb(var(--neon)/0.12)]",
                "shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.5),inset_0_0_12px_rgb(var(--neon)/0.14),0_0_16px_-4px_rgb(var(--neon)/0.55)]",
                v.glow,
                ignitions > 0 && IGNITE,
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex items-center justify-center",
              s.label,
              pressed && LIT_LABEL,
              pressed && ignitions > 0 && IGNITE_LABEL,
            )}
          >
            {children}
          </span>
        </button>
        {ignitions > 0 && <style>{keyframes}</style>}
      </>
    );
  },
);
Toggle.displayName = "Toggle";

/* -------------------------------------------------------------------------------------------------
 * ToggleGroup
 * -----------------------------------------------------------------------------------------------*/

const groupVariants = {
  segmented: {
    root: "gap-0.5 border border-white/10 bg-white/[0.03] p-[3px]",
    rootSize: { sm: "rounded-lg", md: "rounded-[10px]", lg: "rounded-xl" },
    item: {
      sm: "h-6 px-2.5 text-xs",
      md: "h-8 px-3 text-sm",
      lg: "h-10 px-4 text-sm",
    },
    // Root radius minus its 3px padding, set inline so the pill keeps its corners while it slides.
    radius: { sm: 5, md: 7, lg: 9 },
    idle: "text-white/55 hover:text-white/85",
    on: "text-white [text-shadow:0_0_12px_rgb(var(--neon)/0.35)] [&_svg]:text-[rgb(var(--neon))] [&_svg]:[filter:drop-shadow(0_0_5px_rgb(var(--neon)/0.6))]",
    focus: FOCUS_RING,
    indicator:
      "absolute inset-0 bg-[rgb(var(--neon)/0.12)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.5),inset_0_0_12px_rgb(var(--neon)/0.1),0_0_18px_-4px_rgb(var(--neon)/0.55)]",
  },
  outline: {
    root: "overflow-hidden border border-white/10 bg-white/[0.02]",
    rootSize: { sm: "rounded-md", md: "rounded-lg", lg: "rounded-xl" },
    item: {
      sm: "h-[30px] min-w-[30px] px-2.5 text-xs",
      md: "h-[38px] min-w-[38px] px-3 text-sm",
      lg: "h-[46px] min-w-[46px] px-4 text-base",
    },
    radius: { sm: 0, md: 0, lg: 0 },
    idle: "text-white/60 hover:bg-white/[0.04] hover:text-white/90",
    on: LIT_LABEL,
    // Attached cells clip their ring, so it's drawn inside.
    focus: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
    indicator: "absolute inset-0 bg-[rgb(var(--neon)/0.1)]",
  },
  ghost: {
    root: "gap-1",
    rootSize: { sm: "", md: "", lg: "" },
    item: {
      sm: "h-8 min-w-8 rounded-md px-2 text-xs",
      md: "h-10 min-w-10 rounded-lg px-2.5 text-sm",
      lg: "h-12 min-w-12 rounded-xl px-3 text-base",
    },
    radius: { sm: 6, md: 8, lg: 12 },
    idle: "text-white/60 hover:bg-white/[0.05] hover:text-white/90",
    on: LIT_LABEL,
    focus: FOCUS_RING,
    indicator:
      "absolute inset-0 bg-[rgb(var(--neon)/0.12)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.35),0_0_14px_-4px_rgb(var(--neon)/0.5)]",
  },
} as const;

const labelSizes = {
  sm: "gap-1.5 [&_svg]:size-3.5",
  md: "gap-2 [&_svg]:size-4",
  lg: "gap-2 [&_svg]:size-[18px]",
} as const;

type ToggleGroupContextValue = {
  baseId: string;
  type: "single" | "multiple";
  values: string[];
  toggle: (value: string) => void;
  variant: ToggleGroupVariant;
  size: Size;
  orientation: Orientation;
  disabled: boolean;
  reduceMotion: boolean;
  /** The one item in the Tab order, or null when the group itself takes the stop. */
  tabStop: string | null;
  setFocused: (value: string) => void;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

function useToggleGroup() {
  const context = React.useContext(ToggleGroupContext);
  if (!context) throw new Error("<ToggleGroupItem> must be used inside <ToggleGroup>.");
  return context;
}

interface ToggleGroupBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "dir" | "onChange"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: ToggleGroupVariant;
  size?: Size;
  orientation?: Orientation;
  /** Disables every item. */
  disabled?: boolean;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /** One value at a time, with radio semantics. */
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  /** Any number of values, as a toolbar of pressed buttons. */
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

const toList = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : [];

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>((props, ref) => {
  const {
    type = "single",
    value: valueProp,
    defaultValue,
    onValueChange,
    variant = "segmented",
    size = "md",
    orientation = "horizontal",
    disabled = false,
    color,
    style,
    className,
    onKeyDown,
    onFocus,
    onBlur,
    children,
    ...rest
  } = props;

  const baseId = React.useId();
  const reduceMotion = useReducedMotion() ?? false;
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => toList(defaultValue) ?? []);
  const values = toList(valueProp) ?? uncontrolled;
  const [focused, setFocused] = React.useState<string | null>(null);
  const single = type === "single";

  const tabStop = focused ?? (single ? (values[0] ?? null) : null);

  const toggle = React.useCallback(
    (item: string) => {
      let next: string[];
      if (single) {
        if (values[0] === item) return;
        next = [item];
      } else {
        next = values.includes(item) ? values.filter((v) => v !== item) : [...values, item];
      }
      if (valueProp === undefined) setUncontrolled(next);
      (onValueChange as ((value: string | string[]) => void) | undefined)?.(single ? next[0] : next);
    },
    [single, values, valueProp, onValueChange],
  );

  const context = React.useMemo<ToggleGroupContextValue>(
    () => ({
      baseId,
      type,
      values,
      toggle,
      variant,
      size,
      orientation,
      disabled,
      reduceMotion,
      tabStop,
      setFocused,
    }),
    [baseId, type, values, toggle, variant, size, orientation, disabled, reduceMotion, tabStop],
  );

  function items(root: HTMLElement) {
    return Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-toggle-group-item]:not(:disabled)"),
    ).filter((item) => item.closest("[data-toggle-group]") === root);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const list = items(event.currentTarget);
    const index = list.indexOf(event.target as HTMLButtonElement);
    if (index === -1) return;

    const horizontal = orientation === "horizontal";
    // Radio groups answer both arrow pairs; a toolbar only the pair along its axis.
    const forward = single ? ["ArrowRight", "ArrowDown"] : [horizontal ? "ArrowRight" : "ArrowDown"];
    const backward = single ? ["ArrowLeft", "ArrowUp"] : [horizontal ? "ArrowLeft" : "ArrowUp"];
    const last = list.length - 1;

    let next: number;
    if (forward.includes(event.key)) next = index === last ? 0 : index + 1;
    else if (backward.includes(event.key)) next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;

    event.preventDefault();
    const target = list[next];
    target.focus();
    // Radio semantics: moving the focus moves the selection.
    if (single && target.dataset.value) toggle(target.dataset.value);
  }

  const v = groupVariants[variant];

  return (
    <ToggleGroupContext.Provider value={context}>
      <div
        ref={ref}
        role={single ? "radiogroup" : "toolbar"}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        data-toggle-group=""
        data-orientation={orientation}
        // With nothing selected or focused yet, the group holds the Tab stop and hands it to the first item.
        tabIndex={tabStop === null && !disabled ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          onFocus?.(event);
          if (event.target === event.currentTarget) items(event.currentTarget)[0]?.focus();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null);
        }}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-flex w-fit outline-none",
          orientation === "vertical" ? "flex-col items-stretch" : "items-center",
          disabled && "opacity-50",
          v.root,
          v.rootSize[size],
          className,
        )}
        {...rest}
      >
        {children}
        {!single && <style>{keyframes}</style>}
      </div>
    </ToggleGroupContext.Provider>
  );
});
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, disabled: disabledProp, className, onClick, onFocus, children, ...props }, ref) => {
    const group = useToggleGroup();
    const pressed = group.values.includes(value);
    const disabled = group.disabled || Boolean(disabledProp);
    const single = group.type === "single";
    const ignitions = useIgnitions(pressed);
    const v = groupVariants[group.variant];
    const vertical = group.orientation === "vertical";
    const radius = v.radius[group.size];

    const indicatorDetail =
      group.variant === "segmented" ? (
        // A short filament along the pill's lower edge: the part that reads as lit glass.
        <span className="absolute inset-x-[22%] bottom-0 h-px rounded-full bg-[rgb(var(--neon)/0.9)] shadow-[0_0_6px_rgb(var(--neon)/0.9)]" />
      ) : group.variant === "outline" ? (
        <span
          className={cn(
            "absolute bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.7),0_0_2px_rgb(var(--neon))]",
            vertical ? "inset-y-0 left-0 w-0.5" : "inset-x-0 bottom-0 h-0.5",
          )}
        />
      ) : null;

    return (
      <button
        ref={ref}
        type="button"
        role={single ? "radio" : undefined}
        aria-checked={single ? pressed : undefined}
        aria-pressed={single ? undefined : pressed}
        data-toggle-group-item=""
        data-value={value}
        data-state={pressed ? "on" : "off"}
        tabIndex={group.tabStop === value ? 0 : -1}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) group.toggle(value);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          group.setFocused(value);
        }}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer select-none items-center whitespace-nowrap font-medium outline-none",
          "transition-[background-color,color] duration-150 ease-out",
          "disabled:pointer-events-none disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          vertical ? "justify-start" : "justify-center",
          group.variant === "outline" &&
            cn("border-white/10", vertical ? "[&:not(:first-child)]:border-t" : "[&:not(:first-child)]:border-l"),
          v.item[group.size],
          v.focus,
          pressed ? v.on : v.idle,
          className,
        )}
        {...props}
      >
        {pressed &&
          (single ? (
            <motion.span
              aria-hidden
              layoutId={group.reduceMotion ? undefined : `${group.baseId}-indicator`}
              initial={false}
              transition={{ duration: 0.3, ease: EASE }}
              style={{ borderRadius: radius }}
              className={cn("pointer-events-none", v.indicator)}
            >
              {indicatorDetail}
            </motion.span>
          ) : (
            <span
              aria-hidden
              style={{ borderRadius: radius }}
              className={cn("pointer-events-none", v.indicator, ignitions > 0 && IGNITE)}
            >
              {indicatorDetail}
            </span>
          ))}
        <span
          className={cn(
            "relative inline-flex items-center",
            labelSizes[group.size],
            !single && pressed && ignitions > 0 && IGNITE_LABEL,
          )}
        >
          {children}
        </span>
      </button>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { Toggle, ToggleGroup, ToggleGroupItem };
