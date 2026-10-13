"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { autoUpdate, flip, offset, shift, size as fitToViewport, useFloating } from "@floating-ui/react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const subscribeNoop = () => () => {};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const sizes = {
  sm: {
    trigger: "h-8 gap-2 rounded-md px-2.5 text-xs [&_svg]:size-3.5",
    list: "rounded-lg",
    option: "gap-2 rounded-md px-2 py-1.5 text-xs [&_svg]:size-3.5",
    hint: "text-[11px]",
    label: "text-xs",
  },
  md: {
    trigger: "h-10 gap-2 rounded-lg px-3 text-sm [&_svg]:size-4",
    list: "rounded-xl",
    option: "gap-2.5 rounded-lg px-2.5 py-2 text-sm [&_svg]:size-4",
    hint: "text-xs",
    label: "text-sm",
  },
  lg: {
    trigger: "h-12 gap-2.5 rounded-xl px-4 text-base [&_svg]:size-[18px]",
    list: "rounded-xl",
    option: "gap-3 rounded-lg px-3 py-2.5 text-base [&_svg]:size-[18px]",
    hint: "text-sm",
    label: "text-sm",
  },
} as const;

export interface SelectOption {
  value: string;
  label: string;
  /** Second line under the label, inside the list only. */
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "color" | "value" | "defaultValue" | "onChange" | "children" | "type"
  > {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: React.ReactNode;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Submits the value under this name with a surrounding form. */
  name?: string;
  label?: React.ReactNode;
  /** Helper text under the trigger. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the select invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Classes for the trigger button. */
  className?: string;
  /** Classes for the outer block holding the label, trigger, list and message. */
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = "Select…",
      color,
      size = "md",
      name,
      label,
      description,
      error,
      disabled,
      id: idProp,
      className,
      containerClassName,
      style,
      onClick,
      onKeyDown,
      onKeyUp,
      onMouseDown,
      onBlur,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const labelId = `${id}-label`;
    const listboxId = `${id}-listbox`;
    const optionId = (index: number) => `${id}-option-${index}`;

    const invalid = Boolean(error);
    const message = invalid ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${invalid ? "error" : "description"}` : undefined;
    const s = sizes[size];
    const reduceMotion = useReducedMotion();

    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const selectedValue = value !== undefined ? value : uncontrolledValue;
    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    const [open, setOpen] = React.useState(false);
    // The list is portaled out of this subtree, so it gets the resolved color copied over.
    const [carriedNeon, setCarriedNeon] = React.useState<string>();
    const isClient = React.useSyncExternalStore(subscribeNoop, () => true, () => false);

    const { refs, floatingStyles, placement } = useFloating({
      placement: "bottom-start",
      strategy: "fixed",
      // Position with top/left; motion owns `transform` for the enter animation.
      transform: false,
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(6),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        fitToViewport({
          padding: 8,
          apply({ rects, availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
              maxHeight: `${Math.max(120, Math.min(256, availableHeight))}px`,
            });
          },
        }),
      ],
    });
    const above = placement.startsWith("top");
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const isOpen = open && !disabled;

    const typeahead = React.useRef({ query: "", timer: 0 });
    // Only keyboard moves scroll the list; hover never yanks it under the cursor.
    const scrollToActive = React.useRef(false);

    React.useEffect(() => {
      const state = typeahead.current;
      return () => window.clearTimeout(state.timer);
    }, []);

    useIsomorphicLayoutEffect(() => {
      const list = listRef.current;
      if (!isOpen || !list || activeIndex < 0 || !scrollToActive.current) return;
      scrollToActive.current = false;
      const option = document.getElementById(`${id}-option-${activeIndex}`);
      if (!option) return;
      const top = option.offsetTop - 4;
      const bottom = option.offsetTop + option.offsetHeight + 4;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) {
        list.scrollTop = bottom - list.clientHeight;
      }
    }, [isOpen, activeIndex, id]);

    function step(from: number, direction: 1 | -1) {
      for (let i = from; i >= 0 && i < options.length; i += direction) {
        if (!options[i].disabled) return i;
      }
      return -1;
    }

    function highlight(index: number) {
      if (index < 0) return;
      scrollToActive.current = true;
      setActiveIndex(index);
    }

    function openList(fallback: "first" | "last" = "first") {
      if (disabled) return;
      const index =
        selected && !selected.disabled
          ? selectedIndex
          : fallback === "first"
            ? step(0, 1)
            : step(options.length - 1, -1);
      scrollToActive.current = true;
      setActiveIndex(index);
      if (triggerRef.current) {
        setCarriedNeon(getComputedStyle(triggerRef.current).getPropertyValue("--neon").trim() || undefined);
      }
      setOpen(true);
    }

    function close() {
      setOpen(false);
      typeahead.current.query = "";
    }

    function commit(index: number) {
      const option = options[index];
      if (option && !option.disabled && option.value !== selectedValue) {
        if (value === undefined) setUncontrolledValue(option.value);
        onValueChange?.(option.value);
      }
      close();
      triggerRef.current?.focus();
    }

    function matchTypeahead(char: string) {
      const state = typeahead.current;
      window.clearTimeout(state.timer);
      state.timer = window.setTimeout(() => {
        state.query = "";
      }, 500);
      state.query += char.toLowerCase();

      // Pressing the same letter repeatedly cycles through options that start with it.
      const repeated = state.query.split("").every((c) => c === state.query[0]);
      const query = repeated ? state.query[0] : state.query;
      const from = isOpen ? activeIndex : selectedIndex;
      const offset = repeated ? 1 : 0;
      for (let n = 0; n < options.length; n++) {
        const index = (((from + offset + n) % options.length) + options.length) % options.length;
        const option = options[index];
        if (!option.disabled && option.label.toLowerCase().startsWith(query)) return index;
      }
      return -1;
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      const { key } = event;
      const printable = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

      if (!isOpen) {
        if (key === "Enter" || key === " " || key === "ArrowDown") {
          event.preventDefault();
          openList("first");
        } else if (key === "ArrowUp") {
          event.preventDefault();
          openList("last");
        } else if (key === "Home" || key === "End") {
          event.preventDefault();
          highlight(key === "Home" ? step(0, 1) : step(options.length - 1, -1));
          setOpen(true);
        } else if (printable) {
          const index = matchTypeahead(key);
          if (index >= 0) {
            highlight(index);
            setOpen(true);
          }
        }
        return;
      }

      switch (key) {
        case "ArrowDown":
          event.preventDefault();
          highlight(step(activeIndex + 1, 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          if (event.altKey) commit(activeIndex);
          else highlight(step(activeIndex - 1, -1));
          break;
        case "Home":
          event.preventDefault();
          highlight(step(0, 1));
          break;
        case "End":
          event.preventDefault();
          highlight(step(options.length - 1, -1));
          break;
        case "Enter":
          event.preventDefault();
          commit(activeIndex);
          break;
        case "Escape":
          event.preventDefault();
          event.stopPropagation();
          close();
          triggerRef.current?.focus();
          break;
        case "Tab":
          close();
          break;
        default:
          if (key === " " && !typeahead.current.query) {
            event.preventDefault();
            commit(activeIndex);
          } else if (printable) {
            event.preventDefault();
            highlight(matchTypeahead(key));
          }
      }
    }

    return (
      <div
        style={neonVars(color)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-1.5", containerClassName)}
      >
        {label && (
          <label
            id={labelId}
            htmlFor={id}
            onClick={(event) => {
              // Focus the trigger like a native select label, without opening the list.
              event.preventDefault();
              triggerRef.current?.focus();
            }}
            className={cn("w-fit font-medium text-white/80", s.label)}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <button
            ref={(node) => {
              triggerRef.current = node;
              refs.setReference(node);
            }}
            id={id}
            type="button"
            role="combobox"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-label={ariaLabel}
            aria-labelledby={label ? labelId : ariaLabelledBy}
            aria-describedby={[ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined}
            aria-invalid={invalid || undefined}
            data-state={isOpen ? "open" : "closed"}
            data-placeholder={selected ? undefined : ""}
            style={invalid ? neonVars(INVALID, style) : style}
            className={cn(
              "flex w-full cursor-pointer select-none items-center border border-white/10 bg-white/[0.03] text-left text-white/90 outline-none",
              "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
              "focus-visible:border-[rgb(var(--neon)/0.8)] focus-visible:bg-[rgb(var(--neon)/0.04)] focus-visible:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0",
              !isOpen && "hover:border-white/20",
              invalid && "border-[rgb(var(--neon)/0.55)]",
              invalid && !isOpen && "hover:border-[rgb(var(--neon)/0.75)]",
              isOpen &&
                "border-[rgb(var(--neon)/0.8)] bg-[rgb(var(--neon)/0.04)] shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5),inset_0_0_12px_-2px_rgb(var(--neon)/0.14)]",
              s.trigger,
              className,
            )}
            {...props}
            onMouseDown={(event) => {
              onMouseDown?.(event);
              // Focus is set on click instead, so Safari (which never focuses buttons) behaves.
              if (event.button === 0) event.preventDefault();
            }}
            onClick={(event) => {
              onClick?.(event);
              if (event.defaultPrevented) return;
              triggerRef.current?.focus();
              if (isOpen) close();
              else openList("first");
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={(event) => {
              onKeyUp?.(event);
              // Space is handled on keydown; cancel the native click it would fire on keyup.
              if (event.key === " ") event.preventDefault();
            }}
            onBlur={(event) => {
              onBlur?.(event);
              close();
            }}
          >
            {selected?.icon && (
              <span className="flex shrink-0 items-center text-white/50">{selected.icon}</span>
            )}
            <span className={cn("min-w-0 flex-1 truncate", !selected && "text-white/55")}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "text-white/40 transition-[transform,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                isOpen && "rotate-180 text-[rgb(var(--neon))]",
              )}
            />
          </button>

          {isClient &&
            createPortal(
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    ref={(node) => {
                      listRef.current = node;
                      refs.setFloating(node);
                    }}
                    id={listboxId}
                    role="listbox"
                    aria-labelledby={label ? labelId : ariaLabelledBy}
                    aria-label={label ? undefined : ariaLabel}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: above ? 4 : -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: above ? 4 : -4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: EASE_OUT }}
                    // Keep focus on the trigger so aria-activedescendant stays in charge.
                    onMouseDown={(event) => event.preventDefault()}
                    style={
                      {
                        ...floatingStyles,
                        ...(carriedNeon ? { "--neon": carriedNeon, "--neon-accent": carriedNeon } : null),
                      } as React.CSSProperties
                    }
                    className={cn(
                      "[--neon:var(--neon-accent,34_211_238)] z-50 overflow-y-auto overscroll-contain border border-white/10 bg-[#0a0b11] p-1",
                      "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/0.45)]",
                      "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
                      above ? "origin-bottom" : "origin-top",
                      s.list,
                    )}
                  >
                    {options.map((option, index) => {
                      const active = index === activeIndex;
                      const isSelected = index === selectedIndex;
                      return (
                        <div
                          key={option.value}
                          id={optionId(index)}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={option.disabled || undefined}
                          data-active={active || undefined}
                          onPointerMove={() => {
                            if (!option.disabled && !active) setActiveIndex(index);
                          }}
                          onClick={() => {
                            if (!option.disabled) commit(index);
                          }}
                          className={cn(
                            "flex cursor-pointer select-none items-center text-white/75 transition-colors duration-100",
                            s.option,
                            active && "bg-[rgb(var(--neon)/0.1)] text-white",
                            isSelected && "text-[rgb(var(--neon))]",
                            option.disabled && "cursor-not-allowed opacity-40",
                          )}
                        >
                          {option.icon && (
                            <span
                              className={cn(
                                "flex shrink-0 items-center",
                                isSelected ? "text-[rgb(var(--neon))]" : "text-white/45",
                              )}
                            >
                              {option.icon}
                            </span>
                          )}
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate">{option.label}</span>
                            {option.description && (
                              <span
                                className={cn(
                                  "truncate",
                                  s.hint,
                                  active ? "text-white/55" : "text-white/40",
                                )}
                              >
                                {option.description}
                              </span>
                            )}
                          </span>
                          <Check
                            aria-hidden
                            className={cn(
                              "shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.7))]",
                              !isSelected && "invisible",
                            )}
                          />
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body,
            )}
        </div>
        {name && <input type="hidden" name={name} value={selectedValue ?? ""} disabled={disabled} />}
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
Select.displayName = "Select";

export { Select };
