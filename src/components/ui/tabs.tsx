"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const ease = [0.23, 1, 0.32, 1] as const;

const lists = {
  pill: "inline-flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1",
  underline: "flex items-center gap-6 border-b border-white/10",
} as const;

const triggers = {
  pill: "h-8 rounded-lg px-3",
  underline: "h-10 rounded-md",
} as const;

const activeTriggers = {
  pill: "text-white",
  underline: "text-[rgb(var(--neon))]",
} as const;

const indicators = {
  pill: "absolute inset-0 border border-[rgb(var(--neon)/0.45)] bg-[rgb(var(--neon)/0.1)] shadow-[0_0_16px_rgb(var(--neon)/0.25),inset_0_0_12px_rgb(var(--neon)/0.08)]",
  underline:
    "absolute inset-x-0 -bottom-px h-0.5 bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.6),0_0_2px_rgb(var(--neon)/0.9)]",
} as const;

type TabsVariant = keyof typeof lists;

type TabsContextValue = {
  baseId: string;
  value: string | undefined;
  select: (value: string) => void;
  variant: TabsVariant;
  activationMode: "automatic" | "manual";
  reduceMotion: boolean;
  /** False until the first change, so the initial panel doesn't fade in on load. */
  interacted: boolean;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs(component: string) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error(`<${component}> must be used inside <Tabs>.`);
  return context;
}

const makeId = (baseId: string, part: "trigger" | "content", value: string) =>
  `${baseId}-${part}-${value.replace(/\s+/g, "-")}`;

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "dir"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  /** "automatic" selects a tab as soon as it gets focus; "manual" waits for Enter or Space. */
  activationMode?: "automatic" | "manual";
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      style,
      color,
      value: valueProp,
      defaultValue,
      onValueChange,
      variant = "pill",
      activationMode = "automatic",
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    const reduceMotion = useReducedMotion() ?? false;
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const [interacted, setInteracted] = React.useState(false);
    const value = valueProp !== undefined ? valueProp : uncontrolled;

    const select = React.useCallback(
      (next: string) => {
        if (next === value) return;
        setInteracted(true);
        if (valueProp === undefined) setUncontrolled(next);
        onValueChange?.(next);
      },
      [value, valueProp, onValueChange],
    );

    const context = React.useMemo(
      () => ({ baseId, value, select, variant, activationMode, reduceMotion, interacted }),
      [baseId, value, select, variant, activationMode, reduceMotion, interacted],
    );

    return (
      <TabsContext.Provider value={context}>
        <div
          ref={ref}
          style={neonVars(color, style)}
          className={cn("[--neon:var(--neon-accent,34_211_238)]", "flex flex-col gap-4", className)}
          {...props}
        />
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, ...props }, ref) => {
    const { variant } = useTabs("TabsList");

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
      );
      const index = tabs.indexOf(event.target as HTMLButtonElement);
      if (index === -1) return;

      const last = tabs.length - 1;
      const next = (
        {
          ArrowRight: index === last ? 0 : index + 1,
          ArrowLeft: index === 0 ? last : index - 1,
          Home: 0,
          End: last,
        } as Record<string, number>
      )[event.key];
      if (next === undefined) return;

      event.preventDefault();
      tabs[next].focus();
    }

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={cn(lists[variant], className)}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, onClick, onFocus, children, ...props }, ref) => {
    const tabs = useTabs("TabsTrigger");
    const selected = tabs.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={makeId(tabs.baseId, "trigger", value)}
        aria-selected={selected}
        aria-controls={makeId(tabs.baseId, "content", value)}
        // Roving focus: only the selected tab is in the Tab order. With nothing selected, all are.
        tabIndex={selected || tabs.value === undefined ? 0 : -1}
        disabled={disabled}
        data-state={selected ? "active" : "inactive"}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) tabs.select(value);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (tabs.activationMode === "automatic" && !selected && !disabled) tabs.select(value);
        }}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap text-sm font-medium outline-none",
          "transition-colors duration-150 ease-out",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          "disabled:pointer-events-none disabled:opacity-40",
          triggers[tabs.variant],
          selected ? activeTriggers[tabs.variant] : "text-white/50 hover:text-white/80",
          className,
        )}
        {...props}
      >
        {selected && (
          <motion.span
            aria-hidden
            layoutId={tabs.reduceMotion ? undefined : `${tabs.baseId}-indicator`}
            initial={false}
            transition={{ duration: 0.3, ease }}
            // Set inline so motion can keep the corners round while the pill stretches.
            style={tabs.variant === "pill" ? { borderRadius: 8 } : undefined}
            className={indicators[tabs.variant]}
          />
        )}
        <span className="relative inline-flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
          {children}
        </span>
      </button>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
  > {
  value: string;
  /** Keep the panel in the DOM while inactive (hidden), e.g. to preserve form state. */
  forceMount?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount = false, ...props }, ref) => {
    const tabs = useTabs("TabsContent");
    const selected = tabs.value === value;

    if (!selected && !forceMount) return null;

    return (
      <motion.div
        ref={ref}
        role="tabpanel"
        id={makeId(tabs.baseId, "content", value)}
        aria-labelledby={makeId(tabs.baseId, "trigger", value)}
        tabIndex={0}
        hidden={!selected}
        data-state={selected ? "active" : "inactive"}
        initial={tabs.interacted && !tabs.reduceMotion ? { opacity: 0 } : false}
        animate={{ opacity: selected ? 1 : 0 }}
        transition={tabs.reduceMotion ? { duration: 0 } : { duration: 0.15, ease }}
        className={cn(
          "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          className,
          // Tailwind 3's preflight lets a display class like `grid` override the hidden attribute.
          !selected && "hidden",
        )}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
