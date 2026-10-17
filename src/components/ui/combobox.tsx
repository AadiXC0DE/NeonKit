"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as fitToViewport,
  useFloating,
} from "@floating-ui/react-dom";
import { Check, ChevronDown, LoaderCircle, Plus, X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID_RGB = "255 77 94";
const EASE = [0.23, 1, 0.32, 1] as const;
const CREATE = "\u0000create";

const subscribeNoop = () => () => {};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// A short bright segment sweeps the field's lower edge while results load.
const scanKeyframes =
  "@keyframes neonkit-combobox-scan{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}" +
  "@keyframes neonkit-combobox-breathe{0%,100%{opacity:.25}50%{opacity:.9}}";

const sizes = {
  sm: {
    field: "rounded-md text-xs",
    single: "h-8",
    multiple: "min-h-8 py-[5px] pl-[5px]",
    input: "px-2.5",
    afterIcon: "pl-2",
    multiInput: "h-5 px-[5px]",
    icon: "pl-2.5",
    chip: "h-5 gap-0.5 rounded-[5px] pl-1.5 text-[11px]",
    chipRemove: "size-4 rounded-[4px] [&_svg]:size-3",
    trailing: "gap-0.5 pr-[7px]",
    trailingRow: "h-5",
    button: "size-5 rounded-[5px] [&_svg]:size-3.5",
    panel: "rounded-lg",
    option: "gap-2 rounded-md px-2 py-1.5 text-xs [&_svg]:size-3.5",
    heading: "px-2 pb-1 pt-2 text-[11px]",
    hint: "text-[11px]",
    empty: "px-2 py-4 text-xs [&_svg]:size-3.5",
    label: "text-xs",
  },
  md: {
    field: "rounded-lg text-sm",
    single: "h-10",
    multiple: "min-h-10 py-[7px] pl-[7px]",
    input: "px-3",
    afterIcon: "pl-2",
    multiInput: "h-6 px-[5px]",
    icon: "pl-3",
    chip: "h-6 gap-1 rounded-md pl-2 text-xs",
    chipRemove: "size-5 rounded-[5px] [&_svg]:size-3",
    trailing: "gap-0.5 pr-2",
    trailingRow: "h-6",
    button: "size-6 rounded-md [&_svg]:size-4",
    panel: "rounded-xl",
    option: "gap-2.5 rounded-lg px-2.5 py-2 text-sm [&_svg]:size-4",
    heading: "px-2.5 pb-1 pt-2.5 text-xs",
    hint: "text-xs",
    empty: "px-3 py-5 text-sm [&_svg]:size-4",
    label: "text-sm",
  },
  lg: {
    field: "rounded-xl text-base",
    single: "h-12",
    multiple: "min-h-12 py-[9px] pl-[9px]",
    input: "px-4",
    afterIcon: "pl-2.5",
    multiInput: "h-7 px-[7px]",
    icon: "pl-4",
    chip: "h-7 gap-1 rounded-lg pl-2.5 text-sm",
    chipRemove: "size-6 rounded-md [&_svg]:size-3.5",
    trailing: "gap-1 pr-[11px]",
    trailingRow: "h-7",
    button: "size-7 rounded-lg [&_svg]:size-[18px]",
    panel: "rounded-xl",
    option: "gap-3 rounded-lg px-3 py-2.5 text-base [&_svg]:size-[18px]",
    heading: "px-3 pb-1 pt-3 text-[13px]",
    hint: "text-sm",
    empty: "px-3 py-6 text-sm [&_svg]:size-4",
    label: "text-sm",
  },
} as const;

export interface ComboboxOption {
  value: string;
  label: string;
  /** Second line under the label, inside the list only. Also searched. */
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Options with the same group are listed together under this heading. */
  group?: string;
}

interface ComboboxBaseProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "color" | "size" | "value" | "defaultValue" | "onChange" | "type" | "multiple" | "children"
  > {
  options: ComboboxOption[];
  /** Shown in the list when nothing matches. */
  emptyText?: React.ReactNode;
  /** Scans the field and shows a loading row while there are no options yet. */
  loading?: boolean;
  /** Called with the typed text. Providing it turns off local filtering, for results filtered on a server. */
  onSearchChange?: (query: string) => void;
  /** Filter and rank options locally. Defaults to true, or false when `onSearchChange` is set. */
  shouldFilter?: boolean;
  /** Offers a "Create" option for text that matches no option. */
  creatable?: boolean;
  /** Called with the typed text. Add the option yourself; return its value to select it (defaults to the text). */
  onCreate?: (query: string) => string | void;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Submits the value under this name with a surrounding form (one entry per value when multiple). */
  name?: string;
  label?: React.ReactNode;
  /** Helper text under the field. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Classes for the field box: the bordered wrapper around the input and chips. */
  className?: string;
  /** Classes for the outer block holding the label, field and message. */
  containerClassName?: string;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  /** Called with the new value, or "" when cleared. */
  onValueChange?: (value: string) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  /** Select several values, shown as chips inside the field. */
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

type Range = [start: number, end: number];

type ViewItem = {
  option: ComboboxOption;
  /** Position in `options`, which keeps option ids stable while the list filters. */
  index: number;
  rank: number;
  labelMatch?: Range;
  descriptionMatch?: Range;
};

type ViewGroup = { label?: string; items: ViewItem[] };

/** Lowercases and strips accents, keeping a map back to the original characters for highlighting. */
function fold(text: string) {
  let folded = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const part = text[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    folded += part;
    for (let k = 0; k < part.length; k++) map.push(i);
  }
  return { folded, map };
}

/** Best occurrence of `query` in `text`: 0 at the start, 1 at a word start, 2 anywhere else. */
function findMatch(text: string, query: string): { rank: number; range: Range } | null {
  const { folded, map } = fold(text);
  let best: { rank: number; at: number } | null = null;
  for (let at = folded.indexOf(query); at !== -1; at = folded.indexOf(query, at + 1)) {
    const rank = at === 0 ? 0 : /[a-z0-9]/.test(folded[at - 1]) ? 2 : 1;
    if (!best || rank < best.rank) best = { rank, at };
    if (rank < 2) break;
  }
  if (!best) return null;
  return { rank: best.rank, range: [map[best.at], map[best.at + query.length - 1] + 1] };
}

function buildView(options: ComboboxOption[], query: string, filter: boolean) {
  const q = fold(query).folded;
  const groups: ViewGroup[] = [];
  const byName = new Map<string, ViewGroup>();

  options.forEach((option, index) => {
    const item: ViewItem = { option, index, rank: 0 };
    if (q) {
      const label = findMatch(option.label, q);
      const description = option.description ? findMatch(option.description, q) : null;
      if (filter && !label && !description) return;
      item.labelMatch = label?.range;
      item.descriptionMatch = description?.range;
      item.rank = label ? label.rank : description ? 3 : 4;
    }
    const key = option.group ?? "";
    let group = byName.get(key);
    if (!group) {
      group = { label: option.group, items: [] };
      byName.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  });

  // Server results arrive ranked; local ones are ranked here, within their group.
  if (q && filter) {
    for (const group of groups) group.items.sort((a, b) => a.rank - b.rank || a.index - b.index);
  }

  return { groups, flat: groups.flatMap((group) => group.items) };
}

function Highlight({ text, range }: { text: string; range?: Range }) {
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range[0])}
      <mark className="bg-transparent text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1)))]">
        {text.slice(range[0], range[1])}
      </mark>
      {text.slice(range[1])}
    </>
  );
}

const toList = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : [];

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

const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => {
  const {
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    multiple = false,
    placeholder,
    emptyText = "No matches",
    loading = false,
    onSearchChange,
    shouldFilter: shouldFilterProp,
    creatable = false,
    onCreate,
    color,
    size = "md",
    name,
    label,
    description,
    error,
    disabled,
    required,
    id: idProp,
    className,
    containerClassName,
    style,
    onKeyDown,
    onBlur,
    onClick,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...rest
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const fieldRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const autoId = React.useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;
  const createId = `${id}-create`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const errored = Boolean(error);
  const message = errored ? (error === true ? null : error) : description;
  const messageId = message ? `${id}-${errored ? "error" : "description"}` : undefined;
  const s = sizes[size];
  const reduceMotion = useReducedMotion() ?? false;
  const isClient = React.useSyncExternalStore(subscribeNoop, () => true, () => false);

  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => toList(defaultValue) ?? []);
  const selected = toList(valueProp) ?? uncontrolled;
  const rejected = useRejected(inputRef, selected.join("\n"));
  const invalid = errored || rejected;
  // Remembers picked options, so a value keeps its label after async results move on.
  const [known, setKnown] = React.useState<Record<string, ComboboxOption>>({});
  const findOption = (value: string) => options.find((option) => option.value === value) ?? known[value];

  const [open, setOpen] = React.useState(false);
  const isOpen = open && !disabled;
  // null while not typing: single mode then shows the selected label and lists everything.
  const [search, setSearch] = React.useState<string | null>(null);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  // A fresh highlight per opening, so it never glides in from where the last one closed.
  const [session, setSession] = React.useState(0);
  const [carriedNeon, setCarriedNeon] = React.useState<string>();
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const scrollToActive = React.useRef(false);

  const query = (search ?? "").trim();
  const filter = shouldFilterProp ?? !onSearchChange;
  const view = React.useMemo(() => buildView(options, query, filter), [options, query, filter]);
  const foldedQuery = fold(query).folded;
  const showCreate =
    creatable && query !== "" && !options.some((option) => fold(option.label).folded === foldedQuery);
  const keys = view.flat.map((item) => item.option.value);
  if (showCreate) keys.push(CREATE);

  const enabled = (index: number) => keys[index] === CREATE || !view.flat[index]?.option.disabled;
  const firstEnabled = () => keys.findIndex((_, index) => enabled(index));

  let activeIndex = activeKey === null ? -1 : keys.indexOf(activeKey);
  if (isOpen && activeIndex === -1) activeIndex = firstEnabled();
  const activeId =
    activeIndex < 0
      ? undefined
      : keys[activeIndex] === CREATE
        ? createId
        : optionId(view.flat[activeIndex].index);

  const {
    refs,
    floatingStyles,
    placement,
    elements: { floating },
  } = useFloating<HTMLDivElement>({
    open: isOpen,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      fitToViewport({
        padding: 8,
        apply({ rects, availableHeight, elements }) {
          elements.floating.style.width = `${rects.reference.width}px`;
          elements.floating.style.setProperty("--combobox-available-height", `${Math.max(120, availableHeight)}px`);
        },
      }),
    ],
  });
  const above = placement.startsWith("top");

  const setFieldRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      fieldRef.current = node;
      refs.setReference(node);
    },
    [refs],
  );
  const setPanelRef = React.useCallback((node: HTMLDivElement | null) => refs.setFloating(node), [refs]);

  React.useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (fieldRef.current?.contains(target) || floating?.contains(target)) return;
      setOpen(false);
      setActiveKey(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, floating]);

  // Keyboard moves keep the active option in view; hover never scrolls the list under the cursor.
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!isOpen || !list || !activeId || !scrollToActive.current) return;
    scrollToActive.current = false;
    const option = document.getElementById(activeId);
    if (!option) return;
    // The first option of a group brings its heading along.
    const target =
      option.previousElementSibling?.getAttribute("role") === "presentation" && option.parentElement
        ? option.parentElement
        : option;
    const top = target.offsetTop - 4;
    const bottom = option.offsetTop + option.offsetHeight + 4;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [isOpen, activeId]);

  // A form reset clears the text box natively; put the starting selection back with it.
  const initialSelected = React.useRef(selected);
  const resetRef = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    resetRef.current = () => {
      const initial = initialSelected.current;
      setOpen(false);
      setActiveKey(null);
      updateSearch(null);
      if (initial.length === selected.length && initial.every((value, i) => value === selected[i])) return;
      commitValues(initial);
    };
  });
  React.useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => resetRef.current();
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  // Typed text that was never picked shouldn't pass for a value.
  const unpicked = Boolean(required) && selected.length === 0 && (search ?? "").trim() !== "";
  React.useEffect(() => {
    inputRef.current?.setCustomValidity(unpicked ? "Pick one of the options." : "");
  }, [unpicked]);

  function commitValues(next: string[]) {
    if (valueProp === undefined) setUncontrolled(next);
    if (multiple) (onValueChange as ((value: string[]) => void) | undefined)?.(next);
    else (onValueChange as ((value: string) => void) | undefined)?.(next[0] ?? "");
  }

  function updateSearch(next: string | null) {
    if ((next ?? "") !== (search ?? "")) onSearchChange?.(next ?? "");
    setSearch(next);
  }

  function remember(option: ComboboxOption) {
    setKnown((current) => (current[option.value] === option ? current : { ...current, [option.value]: option }));
  }

  function openList(edge: "first" | "last" = "first") {
    if (disabled || isOpen) return;
    const container = containerRef.current;
    if (container) {
      setCarriedNeon(getComputedStyle(container).getPropertyValue("--neon").trim() || undefined);
    }
    // Inside a modal <dialog> the list has to live in the dialog's top layer, not under it.
    setPortalRoot(fieldRef.current?.closest("dialog") ?? document.body);
    setSession((count) => count + 1);
    const current = multiple ? undefined : selected[0];
    if (current && keys.includes(current)) setActiveKey(current);
    else if (edge === "last") {
      let last = keys.length - 1;
      while (last >= 0 && !enabled(last)) last--;
      setActiveKey(last >= 0 ? keys[last] : null);
    } else setActiveKey(null);
    scrollToActive.current = true;
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setActiveKey(null);
  }

  function highlight(index: number) {
    if (index < 0) return;
    scrollToActive.current = true;
    setActiveKey(keys[index]);
  }

  function move(direction: 1 | -1) {
    const count = keys.length;
    if (!count) return;
    let index = activeIndex < 0 ? (direction === 1 ? -1 : count) : activeIndex;
    for (let step = 0; step < count; step++) {
      index = (index + direction + count) % count;
      if (enabled(index)) return highlight(index);
    }
  }

  function pick(key: string) {
    let option: ComboboxOption | undefined;
    if (key === CREATE) {
      const created = onCreate?.(query);
      option = { value: typeof created === "string" ? created : query, label: query };
    } else {
      option = options.find((candidate) => candidate.value === key);
    }
    if (!option || option.disabled) return;
    remember(findOption(option.value) ?? option);

    if (multiple) {
      const has = selected.includes(option.value);
      commitValues(has ? selected.filter((value) => value !== option.value) : [...selected, option.value]);
      setAnnouncement(`${has ? "Removed" : "Added"} ${option.label}`);
      updateSearch(null);
      setActiveKey(option.value);
    } else {
      if (selected[0] !== option.value) commitValues([option.value]);
      updateSearch(null);
      close();
    }
  }

  function removeValue(value: string) {
    commitValues(selected.filter((item) => item !== value));
    setAnnouncement(`Removed ${findOption(value)?.label ?? value}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || event.nativeEvent.isComposing) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) openList("first");
        else if (!event.altKey) move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) openList("last");
        else if (event.altKey) close();
        else move(-1);
        break;
      case "Home":
      case "End":
        if (!isOpen || !keys.length) break;
        event.preventDefault();
        if (event.key === "Home") highlight(firstEnabled());
        else {
          let last = keys.length - 1;
          while (last >= 0 && !enabled(last)) last--;
          highlight(last);
        }
        break;
      case "Enter":
        if (!isOpen) break;
        event.preventDefault();
        if (activeIndex >= 0) pick(keys[activeIndex]);
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          event.stopPropagation();
          close();
          if (!multiple) updateSearch(null);
        } else if (search) {
          event.preventDefault();
          updateSearch(null);
        }
        break;
      case "Tab":
        if (isOpen) close();
        break;
      case "Backspace":
        if (multiple && !search && selected.length) {
          event.preventDefault();
          removeValue(selected[selected.length - 1]);
        }
        break;
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    updateSearch(event.target.value);
    setAnnouncement("");
    if (!isOpen) openList();
    // Typing highlights the best match, so Enter picks it.
    setActiveKey(null);
    scrollToActive.current = true;
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    onBlur?.(event);
    if (isOpen) close();
    if (search === null) return;
    if (!multiple) {
      const typed = fold(search.trim()).folded;
      if (!typed) {
        // Clearing the text and leaving clears the value.
        if (selected.length) commitValues([]);
      } else {
        const exact = options.find((option) => !option.disabled && fold(option.label).folded === typed);
        if (exact && exact.value !== selected[0]) {
          remember(exact);
          commitValues([exact.value]);
        }
      }
    }
    updateSearch(null);
  }

  function handleFieldMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    const target = event.target as HTMLElement;
    if (target === inputRef.current || target.closest("button")) return;
    // Clicks on the padding or chips land in the input, like a native field.
    event.preventDefault();
    inputRef.current?.focus();
    if (!isOpen) openList();
  }

  const selectedOption = !multiple && selected[0] ? findOption(selected[0]) : undefined;
  const inputValue = multiple ? (search ?? "") : (search ?? selectedOption?.label ?? selected[0] ?? "");
  const leadingIcon = !multiple && search === null ? selectedOption?.icon : undefined;
  const count = view.flat.length;

  let status = announcement;
  if (!status && isOpen && query) {
    if (loading && !count) status = "Loading";
    else if (count) status = `${count} ${count === 1 ? "result" : "results"}`;
    else if (showCreate) status = `No matches. Press Enter to create ${query}.`;
    else status = typeof emptyText === "string" ? emptyText : "No matches";
  }

  const hiddenPanel = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: above ? 4 : -4 };

  const renderOption = (item: ViewItem) => {
    const { option, index } = item;
    const flatIndex = keys.indexOf(option.value);
    const active = flatIndex === activeIndex;
    const isSelected = selected.includes(option.value);
    return (
      <div
        key={option.value}
        id={optionId(index)}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled || undefined}
        data-active={active || undefined}
        onPointerMove={() => {
          if (!option.disabled && !active) setActiveKey(option.value);
        }}
        onClick={() => {
          if (!option.disabled) pick(option.value);
        }}
        className={cn(
          "relative flex cursor-pointer select-none items-center text-white/75 transition-colors duration-100",
          s.option,
          (active || isSelected) && "text-white",
          option.disabled && "cursor-not-allowed opacity-40",
        )}
      >
        {active && <ActiveGlow id={`${id}-glow-${session}`} reduceMotion={reduceMotion} />}
        {option.icon && (
          <span
            className={cn(
              "relative flex shrink-0 items-center transition-colors duration-100",
              isSelected || active ? "text-[rgb(var(--neon))]" : "text-white/50",
            )}
          >
            {option.icon}
          </span>
        )}
        <span className="relative flex min-w-0 flex-1 flex-col">
          <span className="truncate">
            <Highlight text={option.label} range={item.labelMatch} />
          </span>
          {option.description && (
            <span className={cn("truncate", s.hint, active ? "text-white/60" : "text-white/50")}>
              <Highlight text={option.description} range={item.descriptionMatch} />
            </span>
          )}
        </span>
        <Check
          aria-hidden
          className={cn(
            "relative shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))))]",
            !isSelected && "invisible",
          )}
        />
      </div>
    );
  };

  const createActive = keys[activeIndex] === CREATE;

  const inputElement = (
    <input
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      {...rest}
      ref={inputRef}
      id={id}
      type="text"
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={isOpen ? listboxId : undefined}
      aria-activedescendant={isOpen ? activeId : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={[ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      // The picked value satisfies it, not the text: chips leave the box empty, and typed text isn't a pick.
      required={required && selected.length === 0}
      disabled={disabled}
      placeholder={multiple && selected.length ? undefined : placeholder}
      value={inputValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || isOpen) return;
        openList();
        // Picking a different option is usually a retype, so the shown label starts selected.
        if (!multiple && search === null) event.currentTarget.select();
      }}
      className={cn(
        "min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-white/50 disabled:cursor-not-allowed",
        multiple ? cn("basis-16", s.multiInput) : cn("h-full", s.input, leadingIcon && s.afterIcon),
      )}
    />
  );

  return (
    <div
      ref={containerRef}
      style={neonVars(color)}
      className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-1.5", containerClassName)}
    >
      {label && (
        <label id={labelId} htmlFor={id} className={cn("w-fit font-medium text-white/80", s.label)}>
          {label}
          {required && (
            <span
              aria-hidden
              title="Required"
              className="relative -top-px ml-1.5 inline-block size-[5px] rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_4px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_10px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))]"
            />
          )}
        </label>
      )}
      <div
        ref={setFieldRef}
        data-state={isOpen ? "open" : "closed"}
        onMouseDown={handleFieldMouseDown}
        style={invalid ? ({ "--neon-field": INVALID_RGB, ...style } as React.CSSProperties) : style}
        className={cn(
          // The field's own light. Kept apart from --neon so chips and the list stay in color when it turns red.
          "[--neon-field:var(--neon)]",
          "group/field relative flex w-full cursor-text border border-white/10 bg-white/[0.03] text-white/90",
          "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
          "focus-within:border-[rgb(var(--neon-field)/0.8)] focus-within:bg-[rgb(var(--neon-field)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon-field)/0.2),0_0_20px_-4px_rgb(var(--neon-field)/CALC(0.5*var(--neon-glow,1))),inset_0_0_12px_-2px_rgb(var(--neon-field)/CALC(0.14*var(--neon-glow,1)))]",
          !disabled && "hover:[&:not(:focus-within)]:border-white/20",
          invalid &&
            "border-[rgb(var(--neon-field)/0.55)] hover:[&:not(:focus-within)]:border-[rgb(var(--neon-field)/0.75)]",
          disabled && "cursor-not-allowed opacity-50",
          s.field,
          multiple ? cn("items-start", s.multiple) : cn("items-center", s.single),
          className,
        )}
      >
        {multiple ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            <AnimatePresence initial={false}>
              {selected.map((value) => {
                const text = findOption(value)?.label ?? value;
                return (
                  <motion.span
                    key={value}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.16, ease: EASE }}
                    className={cn(
                      "inline-flex min-w-0 max-w-full items-center border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.08)] text-white/90",
                      "shadow-[0_0_12px_-6px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]",
                      s.chip,
                      disabled && "pr-2",
                    )}
                  >
                    <span className="truncate">{text}</span>
                    {!disabled && (
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={`Remove ${text}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          removeValue(value);
                          inputRef.current?.focus();
                        }}
                        className={cn(
                          "grid shrink-0 cursor-pointer place-items-center text-white/50 outline-none transition-colors duration-150",
                          "hover:bg-[rgb(var(--neon)/0.16)] hover:text-white",
                          s.chipRemove,
                        )}
                      >
                        <X aria-hidden />
                      </button>
                    )}
                  </motion.span>
                );
              })}
            </AnimatePresence>
            {inputElement}
          </div>
        ) : (
          <>
            {leadingIcon && (
              <span
                className={cn(
                  "flex shrink-0 items-center text-white/50 transition-colors duration-200 group-focus-within/field:text-[rgb(var(--neon))]",
                  s.icon,
                )}
              >
                {leadingIcon}
              </span>
            )}
            {inputElement}
          </>
        )}

        <span className={cn("flex shrink-0 items-center", s.trailing, multiple && cn("self-start", s.trailingRow))}>
          {selected.length > 0 && !disabled && (multiple || search === null) && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={multiple ? "Clear all" : "Clear"}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                commitValues([]);
                updateSearch(null);
                setAnnouncement("Cleared");
                inputRef.current?.focus();
              }}
              className={cn(
                "grid cursor-pointer place-items-center text-white/35 outline-none transition-colors duration-150 hover:bg-white/[0.06] hover:text-white/80",
                s.button,
              )}
            >
              <X aria-hidden />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={isOpen ? "Hide options" : "Show options"}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              inputRef.current?.focus();
              if (isOpen) {
                close();
                if (!multiple) updateSearch(null);
              } else openList();
            }}
            className={cn(
              "grid cursor-pointer place-items-center text-white/40 outline-none transition-colors duration-150 hover:text-white/80 disabled:cursor-not-allowed",
              s.button,
            )}
          >
            <ChevronDown
              aria-hidden
              className={cn(
                "transition-[transform,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                isOpen && "rotate-180 text-[rgb(var(--neon))]",
              )}
            />
          </button>
        </span>

        {loading && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-3 -bottom-[3px] h-[5px] overflow-hidden"
          >
            <span
              className={cn(
                "absolute left-0 top-[2px] h-px w-1/4 rounded-full bg-[linear-gradient(90deg,transparent,rgb(var(--neon)),transparent)] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1)))]",
                "[animation:neonkit-combobox-scan_1.1s_cubic-bezier(0.45,0,0.55,1)_infinite]",
                "motion-reduce:w-full motion-reduce:[animation:neonkit-combobox-breathe_1.8s_ease-in-out_infinite]",
              )}
            />
            <style>{scanKeyframes}</style>
          </span>
        )}
      </div>

      {name &&
        (multiple ? (
          selected.map((value) => (
            <input key={value} type="hidden" name={name} value={value} disabled={disabled} />
          ))
        ) : (
          <input type="hidden" name={name} value={selected[0] ?? ""} disabled={disabled} />
        ))}
      {message && (
        <p id={messageId} className={cn("text-xs leading-5", errored ? "text-[#ff4d5e]" : "text-white/55")}>
          {message}
        </p>
      )}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </span>

      {isClient &&
        portalRoot &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                key="panel"
                ref={setPanelRef}
                style={
                  {
                    ...floatingStyles,
                    zIndex: 50,
                    ...(carriedNeon ? { "--neon": carriedNeon, "--neon-accent": carriedNeon } : null),
                  } as React.CSSProperties
                }
                className="[--neon:var(--neon-accent,34_211_238)]"
                // Keep focus in the input so aria-activedescendant stays in charge.
                onMouseDown={(event) => event.preventDefault()}
              >
                <motion.div
                  initial={hiddenPanel}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ ...hiddenPanel, transition: { duration: 0.12, ease: EASE } }}
                  transition={{ duration: 0.16, ease: EASE }}
                  style={{ transformOrigin: above ? "50% 100%" : "50% 0%" }}
                  className={cn(
                    "overflow-hidden border border-white/10 bg-[#0a0b11] text-white/90",
                    "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
                    s.panel,
                  )}
                >
                  <motion.div
                    ref={listRef}
                    layoutScroll
                    id={listboxId}
                    role="listbox"
                    aria-labelledby={label ? labelId : ariaLabelledBy}
                    aria-label={label || ariaLabelledBy ? undefined : ariaLabel}
                    aria-multiselectable={multiple || undefined}
                    aria-busy={loading || undefined}
                    className={cn(
                      "relative max-h-[min(18rem,var(--combobox-available-height,18rem))] overflow-y-auto overscroll-contain p-1",
                      "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
                    )}
                  >
                    {view.groups.map((group, groupIndex) =>
                      group.label ? (
                        <div
                          key={group.label}
                          role="group"
                          aria-labelledby={`${id}-group-${groupIndex}`}
                          className={cn(groupIndex > 0 && "mt-1 border-t border-white/[0.06] pt-1")}
                        >
                          <div
                            id={`${id}-group-${groupIndex}`}
                            role="presentation"
                            className={cn("select-none font-medium text-white/50", s.heading)}
                          >
                            {group.label}
                          </div>
                          {group.items.map(renderOption)}
                        </div>
                      ) : (
                        <React.Fragment key="">{group.items.map(renderOption)}</React.Fragment>
                      ),
                    )}

                    {showCreate && (
                      <div
                        id={createId}
                        role="option"
                        aria-selected={false}
                        data-active={createActive || undefined}
                        onPointerMove={() => {
                          if (!createActive) setActiveKey(CREATE);
                        }}
                        onClick={() => pick(CREATE)}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center text-white/75 transition-colors duration-100",
                          s.option,
                          createActive && "text-white",
                          count > 0 && "mt-1",
                        )}
                      >
                        {createActive && <ActiveGlow id={`${id}-glow-${session}`} reduceMotion={reduceMotion} />}
                        <Plus aria-hidden className="relative shrink-0 text-[rgb(var(--neon))]" />
                        <span className="relative min-w-0 flex-1 truncate">
                          Create <span className="text-[rgb(var(--neon))]">“{query}”</span>
                        </span>
                      </div>
                    )}

                    {!keys.length && (
                      <div
                        role="presentation"
                        className={cn("flex select-none items-center justify-center gap-2 text-white/50", s.empty)}
                      >
                        {loading ? (
                          <>
                            <LoaderCircle aria-hidden className="animate-spin text-[rgb(var(--neon))]" />
                            {query ? "Searching…" : "Loading…"}
                          </>
                        ) : (
                          emptyText
                        )}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </div>
  );
});
Combobox.displayName = "Combobox";

/** The gliding highlight: one element per opening that moves to whichever option is active. */
function ActiveGlow({ id, reduceMotion }: { id: string; reduceMotion: boolean }) {
  return (
    <motion.span
      aria-hidden
      layoutId={reduceMotion ? undefined : id}
      transition={{ duration: 0.18, ease: EASE }}
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[rgb(var(--neon)/0.1)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.14)]"
    />
  );
}

export { Combobox };
