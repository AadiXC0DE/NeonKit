"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Orientation = "horizontal" | "vertical";

type StepperContextValue = {
  value: number;
  count: number;
  orientation: Orientation;
  clickable: boolean;
  select: (index: number) => void;
};

const StepperContext = React.createContext<StepperContextValue | null>(null);
const StepIndexContext = React.createContext(-1);

function useStepper(component: string) {
  const context = React.useContext(StepperContext);
  if (!context) throw new Error(`<${component}> must be used inside <Stepper>.`);
  return context;
}

export interface StepperProps
  extends Omit<React.OlHTMLAttributes<HTMLOListElement>, "color" | "defaultValue" | "onChange"> {
  /** Index of the current step when controlled. Steps before it are complete; pass the step count to complete them all. */
  value?: number;
  /** Initial current step when uncontrolled. */
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  orientation?: Orientation;
  /** Render each step as a button that moves the stepper to it. */
  clickable?: boolean;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    {
      className,
      style,
      color,
      value: valueProp,
      defaultValue = 0,
      onValueChange,
      orientation = "horizontal",
      clickable = false,
      children,
      ...props
    },
    ref,
  ) => {
    const steps = React.Children.toArray(children).filter(React.isValidElement);
    const count = steps.length;
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const value = Math.min(count, Math.max(0, Math.floor(valueProp ?? uncontrolled) || 0));

    const select = React.useCallback(
      (index: number) => {
        if (index === value) return;
        if (valueProp === undefined) setUncontrolled(index);
        onValueChange?.(index);
      },
      [value, valueProp, onValueChange],
    );

    const context = { value, count, orientation, clickable, select };

    return (
      <StepperContext.Provider value={context}>
        <ol
          ref={ref}
          data-orientation={orientation}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            orientation === "horizontal" ? "flex w-full items-start" : "flex flex-col",
            className,
          )}
          {...props}
        >
          {steps.map((step, index) => (
            <StepIndexContext.Provider key={step.key ?? index} value={index}>
              {step}
            </StepIndexContext.Provider>
          ))}
        </ol>
      </StepperContext.Provider>
    );
  },
);
Stepper.displayName = "Stepper";

const markers = {
  upcoming:
    "border-white/10 bg-white/[0.03] text-white/40 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),inset_0_-1px_0_rgb(0_0_0/0.3)]",
  // The halo arrives a beat late, as the connector's light reaches it.
  current:
    "border-[rgb(var(--neon)/0.85)] bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.8)] shadow-[0_0_0_4px_rgb(var(--neon)/0.12),0_0_22px_rgb(var(--neon)/0.45),inset_0_0_8px_rgb(var(--neon)/0.25)] delay-[220ms]",
  complete:
    "border-[rgb(var(--neon)/0.55)] bg-[rgb(var(--neon)/0.14)] text-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.22)]",
  error:
    "border-[rgb(255_77_94/0.8)] bg-[rgb(255_77_94/0.12)] text-[#ff4d5e] shadow-[0_0_14px_rgb(255_77_94/0.35)]",
  errorCurrent:
    "border-[#ff4d5e] bg-[rgb(255_77_94/0.12)] text-[#ff4d5e] shadow-[0_0_0_4px_rgb(255_77_94/0.12),0_0_22px_rgb(255_77_94/0.45)]",
} as const;

const titles = {
  upcoming: "text-white/55",
  current: "text-white",
  complete: "text-white/80",
} as const;

export interface StepProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title" | "children"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Replaces the step number in the marker until the step is complete. */
  icon?: React.ReactNode;
  /** Marks the step as failed: a red marker with a cross. */
  status?: "error";
  /** Shows an "Optional" caption under the title. */
  optional?: boolean;
  /** With a clickable stepper, blocks jumping to this step. */
  disabled?: boolean;
}

const Step = React.forwardRef<HTMLLIElement, StepProps>(
  ({ className, title, description, icon, status, optional = false, disabled = false, ...props }, ref) => {
    const index = React.useContext(StepIndexContext);
    const { value, count, orientation, clickable, select } = useStepper("Step");

    const state = index < value ? "complete" : index === value ? "current" : "upcoming";
    const error = status === "error";
    const last = index === count - 1;
    const vertical = orientation === "vertical";
    const current = state === "current";
    const showCheck = state === "complete" && !error;

    const interactive = clickable && !disabled;

    const marker = (
      <span
        aria-hidden
        className={cn(
          "relative grid size-8 shrink-0 place-items-center rounded-full border text-[13px] font-medium leading-none tabular-nums",
          "transition-[border-color,background-color,color,box-shadow,text-shadow,transform,scale] duration-300 ease-out motion-reduce:transition-none",
          "[&_svg]:size-4",
          error ? (current ? markers.errorCurrent : markers.error) : markers[state],
          interactive && "group-active/step:scale-[0.94]",
          // Hovering an unlit step warms its glass a little.
          interactive && state === "upcoming" && !error && "group-hover/step:border-white/25 group-hover/step:text-white/70",
        )}
      >
        <span
          className={cn(
            "grid place-items-center transition-opacity duration-200 [grid-area:1/1]",
            showCheck || error ? "opacity-0" : "opacity-100",
          )}
        >
          {icon ?? index + 1}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[grid-area:1/1] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.7))]"
        >
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={showCheck ? 0 : 1}
            className={cn(
              "transition-[stroke-dashoffset] ease-out motion-reduce:transition-none",
              showCheck ? "duration-300 delay-100" : "duration-150",
            )}
          />
        </svg>
        {error && <X className="[grid-area:1/1]" strokeWidth={2.5} />}
      </span>
    );

    const text = (
      <span className={cn("grid min-w-0 gap-0.5", vertical ? "pt-1.5 text-left" : "mt-2.5 justify-items-center px-2 text-center")}>
        <span
          className={cn(
            "text-sm font-medium leading-5 transition-colors duration-300",
            error ? "text-[#ff4d5e]" : titles[state],
          )}
        >
          {title}
        </span>
        {optional && <span className="text-xs leading-4 text-white/40">Optional</span>}
        {description && (
          <span className={cn("text-xs leading-5 text-white/60", !vertical && "hidden sm:block")}>
            {description}
          </span>
        )}
        {(error || state === "complete") && (
          <span className="sr-only">{error ? ", failed" : ", completed"}</span>
        )}
      </span>
    );

    const layout = vertical ? "flex items-start gap-3" : "flex flex-col items-center";

    const body = clickable ? (
      <button
        type="button"
        disabled={disabled}
        aria-current={current ? "step" : undefined}
        onClick={() => select(index)}
        className={cn(
          layout,
          "group/step relative rounded-xl outline-none",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]",
          interactive ? "cursor-pointer" : "cursor-not-allowed",
        )}
      >
        {marker}
        {text}
      </button>
    ) : (
      <div className={layout}>
        {marker}
        {text}
      </div>
    );

    return (
      <li
        ref={ref}
        aria-current={!clickable && current ? "step" : undefined}
        data-state={state}
        data-status={status}
        className={cn(
          "relative",
          vertical ? cn("flex", !last && "pb-7") : "flex min-w-0 flex-1 basis-0 justify-center",
          className,
        )}
        {...props}
      >
        {body}
        {!last && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-full bg-white/[0.08]",
              vertical
                ? "bottom-1.5 left-[15px] top-[38px] w-0.5"
                : "left-[calc(50%_+_26px)] right-[calc(-50%_+_26px)] top-[15px] h-0.5",
            )}
          >
            <span
              style={{ transform: `${vertical ? "scaleY" : "scaleX"}(${state === "complete" ? 1 : 0})` }}
              className={cn(
                "absolute inset-0 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.75),0_0_2px_rgb(var(--neon))]",
                "transition-transform duration-[400ms] ease-in-out motion-reduce:transition-none",
                vertical ? "origin-top" : "origin-left",
              )}
            />
          </span>
        )}
      </li>
    );
  },
);
Step.displayName = "Step";

export { Stepper, Step };
