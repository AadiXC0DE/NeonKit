"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type AccordionContextValue = {
  open: string[];
  toggle: (value: string) => void;
  /** True for the open item of a single, non-collapsible accordion. */
  isLocked: (value: string) => boolean;
  reduceMotion: boolean;
};

type AccordionItemContextValue = {
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordion(component: string) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error(`<${component}> must be used inside <Accordion>.`);
  return context;
}

function useAccordionItem(component: string) {
  const context = React.useContext(AccordionItemContext);
  if (!context) throw new Error(`<${component}> must be used inside <AccordionItem>.`);
  return context;
}

type AccordionBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "dir"> & {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
};

export type AccordionSingleProps = AccordionBaseProps & {
  /** One item open at a time. */
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Lets the open item close again. */
  collapsible?: boolean;
};

export type AccordionMultipleProps = AccordionBaseProps & {
  /** Any number of items open at once. */
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
};

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

type AccordionImplProps = AccordionBaseProps & {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: never) => void;
  collapsible?: boolean;
};

const toArray = (value: string | string[]) => (Array.isArray(value) ? value : value ? [value] : []);

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>((props, ref) => {
  const {
    className,
    style,
    color,
    type = "single",
    value: valueProp,
    defaultValue,
    onValueChange,
    collapsible = true,
    onKeyDown,
    ...rest
  }: AccordionImplProps = props;

  const reduceMotion = useReducedMotion() ?? false;
  const [uncontrolled, setUncontrolled] = React.useState(() => toArray(defaultValue ?? []));
  const open = valueProp !== undefined ? toArray(valueProp) : uncontrolled;

  function toggle(item: string) {
    const isOpen = open.includes(item);
    let next: string[];
    if (type === "multiple") {
      next = isOpen ? open.filter((value) => value !== item) : [...open, item];
    } else {
      if (isOpen && !collapsible) return;
      next = isOpen ? [] : [item];
    }
    if (valueProp === undefined) setUncontrolled(next);
    (onValueChange as ((value: string | string[]) => void) | undefined)?.(
      type === "multiple" ? next : (next[0] ?? ""),
    );
  }

  const context: AccordionContextValue = {
    open,
    toggle,
    isLocked: (item) => type === "single" && !collapsible && open.includes(item),
    reduceMotion,
  };

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const root = event.currentTarget;
    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]:not(:disabled)"),
    ).filter((trigger) => trigger.closest("[data-accordion]") === root);
    const index = triggers.indexOf(event.target as HTMLButtonElement);
    if (index === -1) return;

    const last = triggers.length - 1;
    const next = (
      {
        ArrowDown: index === last ? 0 : index + 1,
        ArrowUp: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
      } as Record<string, number>
    )[event.key];
    if (next === undefined) return;

    event.preventDefault();
    triggers[next].focus();
  }

  return (
    <AccordionContext.Provider value={context}>
      <div
        ref={ref}
        data-accordion=""
        onKeyDown={handleKeyDown}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "w-full", className)}
        {...rest}
      />
    </AccordionContext.Provider>
  );
});
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, disabled = false, children, ...props }, ref) => {
    const accordion = useAccordion("AccordionItem");
    const id = React.useId();
    const open = accordion.open.includes(value);
    const item = React.useMemo(
      () => ({ value, open, disabled, triggerId: `${id}-trigger`, contentId: `${id}-content` }),
      [value, open, disabled, id],
    );

    return (
      <AccordionItemContext.Provider value={item}>
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          data-disabled={disabled ? "" : undefined}
          className={cn("relative border-b border-white/10 last:border-b-0", className)}
          {...props}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-4 left-0 top-4 w-px rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.8)]",
              "transition-opacity duration-200 ease-out motion-reduce:transition-none",
              open ? "opacity-100" : "opacity-0",
            )}
          />
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, children, ...props }, ref) => {
    const accordion = useAccordion("AccordionTrigger");
    const item = useAccordionItem("AccordionTrigger");
    const locked = accordion.isLocked(item.value);

    return (
      <h3 className="flex">
        <button
          ref={ref}
          type="button"
          id={item.triggerId}
          aria-expanded={item.open}
          // The panel unmounts while closed, so only point at it when it exists.
          aria-controls={item.open ? item.contentId : undefined}
          aria-disabled={locked || undefined}
          disabled={item.disabled}
          data-accordion-trigger=""
          data-state={item.open ? "open" : "closed"}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) accordion.toggle(item.value);
          }}
          className={cn(
            "group/trigger flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 pl-4 text-left text-sm font-medium text-white/90 outline-none",
            "transition-colors duration-150 ease-out hover:text-white",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            locked && "cursor-default",
            className,
          )}
          {...props}
        >
          {children}
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 transition-[transform,color] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              item.open ? "rotate-180 text-white/70" : "text-white/40 group-hover/trigger:text-white/70",
            )}
          />
        </button>
      </h3>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { reduceMotion } = useAccordion("AccordionContent");
    const item = useAccordionItem("AccordionContent");

    return (
      <AnimatePresence initial={false}>
        {item.open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div
              ref={ref}
              role="region"
              id={item.contentId}
              aria-labelledby={item.triggerId}
              className={cn("pb-4 pl-4 pr-8 text-sm leading-relaxed text-white/55", className)}
              {...props}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
