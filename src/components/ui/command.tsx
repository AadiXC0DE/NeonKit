"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LoaderCircle, Search } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const EASE = [0.23, 1, 0.32, 1] as const;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const subscribeNothing = () => () => {};
const useIsClient = () =>
  React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

/* -------------------------------------------------------------------------------------------------
 * Matching: prefix > word start > acronym > substring > subsequence. Scores are 0..1, 0 hides.
 * -----------------------------------------------------------------------------------------------*/

interface Match {
  score: number;
  indices: number[];
}

// One folded character per UTF-16 unit, so indices map straight back onto the original text.
function fold(text: string) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    out += (char.normalize("NFD")[0] ?? char).toLowerCase()[0] ?? char;
  }
  return out;
}

function isWordStart(text: string, index: number) {
  if (index === 0) return true;
  const previous = text[index - 1];
  const current = text[index];
  if (/[\s\-_/.:,()[\]#@]/.test(previous)) return true;
  // camelCase and PascalCase humps
  return current !== current.toLowerCase() && previous === previous.toLowerCase() && /\w/.test(previous);
}

const range = (start: number, length: number) => Array.from({ length }, (_, i) => start + i);

function matchTerm(text: string, folded: string, term: string): Match | null {
  if (!term) return { score: 1, indices: [] };
  if (term.length > folded.length) return null;
  const ratio = term.length / folded.length;

  if (folded === term) return { score: 1, indices: range(0, term.length) };
  if (folded.startsWith(term)) return { score: 0.9 + 0.08 * ratio, indices: range(0, term.length) };

  const firstSubstring = folded.indexOf(term);
  for (let at = firstSubstring; at !== -1; at = folded.indexOf(term, at + 1)) {
    if (isWordStart(text, at)) return { score: 0.75 + 0.08 * ratio, indices: range(at, term.length) };
  }

  if (term.length > 1) {
    const indices: number[] = [];
    for (let i = 0; i < folded.length && indices.length < term.length; i++) {
      if (isWordStart(text, i) && folded[i] === term[indices.length]) indices.push(i);
    }
    if (indices.length === term.length) return { score: 0.7 + 0.04 * ratio, indices };
  }

  if (firstSubstring !== -1) {
    return {
      score: 0.5 + 0.1 * (1 - firstSubstring / folded.length),
      indices: range(firstSubstring, term.length),
    };
  }

  // Subsequence: try each start of the first character and keep the tightest run.
  let best: Match | null = null;
  for (let start = folded.indexOf(term[0]), tries = 0; start !== -1 && tries < 24; tries++) {
    const indices = [start];
    let cursor = start + 1;
    for (let j = 1; j < term.length; j++) {
      const found = folded.indexOf(term[j], cursor);
      if (found === -1) break;
      indices.push(found);
      cursor = found + 1;
    }
    if (indices.length < term.length) break;
    const span = indices[indices.length - 1] - start + 1;
    const starts = indices.filter((index) => isWordStart(text, index)).length;
    const score = 0.1 + 0.25 * (term.length / span) + Math.min(0.08, 0.02 * starts);
    if (!best || score > best.score) best = { score, indices };
    start = folded.indexOf(term[0], start + 1);
  }
  return best;
}

function matchText(text: string, search: string): Match | null {
  const query = fold(search.trim());
  if (!query) return { score: 1, indices: [] };
  const folded = fold(text);
  const whole = matchTerm(text, folded, query);

  const terms = query.split(/\s+/);
  if (terms.length < 2) return whole;

  // Every word has to match somewhere, in any order.
  const matches = terms.map((term) => matchTerm(text, folded, term));
  if (matches.some((match) => !match)) return whole;
  const split: Match = {
    score: 0.6 * Math.min(...matches.map((match) => match!.score)),
    indices: [...new Set(matches.flatMap((match) => match!.indices))].sort((a, b) => a - b),
  };
  return whole && whole.score >= split.score ? whole : split;
}

function defaultFilter(value: string, search: string, keywords: string[] = []) {
  let score = matchText(value, search)?.score ?? 0;
  for (const keyword of keywords) {
    score = Math.max(score, (matchText(keyword, search)?.score ?? 0) * 0.9);
  }
  return score;
}

function Highlight({ text, search }: { text: string; search: string }) {
  const indices = search.trim() ? (matchText(text, search)?.indices ?? []) : [];
  if (!indices.length) return <>{text}</>;

  // Consecutive matched characters become one lit run.
  const runs: [number, number][] = [];
  for (const index of indices) {
    const last = runs[runs.length - 1];
    if (last && index === last[1]) last[1] = index + 1;
    else runs.push([index, index + 1]);
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const [from, to] of runs) {
    if (from > cursor) parts.push(text.slice(cursor, from));
    parts.push(
      <span key={from} className="text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1)))]">
        {text.slice(from, to)}
      </span>,
    );
    cursor = to;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

/* -------------------------------------------------------------------------------------------------
 * Store: items register here so the root can rank, count and navigate them.
 * -----------------------------------------------------------------------------------------------*/

interface ItemRecord {
  id: string;
  value: string;
  keywords: string[];
  disabled: boolean;
  groupId: string | null;
  element: HTMLElement;
  select: () => void;
}

interface CommandState {
  items: ItemRecord[];
  search: string;
  loading: number;
  /** The item the user moved to, and the search it was chosen under. A new search resets it. */
  active: { id: string | null; search: string };
}

function createStore() {
  let state: CommandState = { items: [], search: "", loading: 0, active: { id: null, search: "" } };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update(recipe: (state: CommandState) => Partial<CommandState>) {
      state = { ...state, ...recipe(state) };
      listeners.forEach((listener) => listener());
    },
  };
}

type CommandStore = ReturnType<typeof createStore>;

// Kept in document order, which is the order people see when nothing is typed.
function insertInDomOrder(items: ItemRecord[], record: ItemRecord) {
  const rest = items.filter((item) => item.id !== record.id);
  const index = rest.findIndex(
    (item) => record.element.compareDocumentPosition(item.element) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  if (index === -1) return [...rest, record];
  return [...rest.slice(0, index), record, ...rest.slice(index)];
}

type Filter = (value: string, search: string, keywords?: string[]) => number;

interface Results {
  navigable: ItemRecord[];
  scores: Map<string, number> | null;
  order: Map<string, number>;
  groupOrder: Map<string, number>;
  count: number;
}

function rank(items: ItemRecord[], search: string, filtering: boolean, filter: Filter): Results {
  if (!filtering) {
    return {
      navigable: items.filter((item) => !item.disabled),
      scores: null,
      order: new Map(),
      groupOrder: new Map(),
      count: items.length,
    };
  }

  const scores = new Map<string, number>();
  // A unit is a group, or an item that sits outside any group. Units sort by their best match.
  const units = new Map<string, { groupId: string | null; best: number; members: ItemRecord[] }>();
  items.forEach((item) => {
    const score = filter(item.value, search, item.keywords);
    if (score <= 0) return;
    scores.set(item.id, score);
    const key = item.groupId ?? `item:${item.id}`;
    const unit = units.get(key) ?? { groupId: item.groupId, best: 0, members: [] };
    unit.best = Math.max(unit.best, score);
    unit.members.push(item);
    units.set(key, unit);
  });

  const order = new Map<string, number>();
  const groupOrder = new Map<string, number>();
  const navigable: ItemRecord[] = [];
  // Array.prototype.sort is stable, so ties keep document order.
  [...units.values()]
    .sort((a, b) => b.best - a.best)
    .forEach((unit, unitIndex) => {
      if (unit.groupId) groupOrder.set(unit.groupId, unitIndex);
      unit.members
        .sort((a, b) => scores.get(b.id)! - scores.get(a.id)!)
        .forEach((item, itemIndex) => {
          order.set(item.id, unit.groupId ? itemIndex : unitIndex);
          if (!item.disabled) navigable.push(item);
        });
    });

  return { navigable, scores, order, groupOrder, count: scores.size };
}

/* -------------------------------------------------------------------------------------------------
 * Shared helpers
 * -----------------------------------------------------------------------------------------------*/

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function useComposedRefs<T>(a: PossibleRef<T>, b: PossibleRef<T>) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node);
      setRef(b, node);
    },
    [a, b],
  );
}

const MODIFIERS = "⌘⇧⌥⌃";
const ARIA_KEYS: Record<string, string> = {
  "⌘": "Meta",
  "⇧": "Shift",
  "⌥": "Alt",
  "⌃": "Control",
  "↵": "Enter",
  "⌫": "Backspace",
  Ctrl: "Control",
  Cmd: "Meta",
  Esc: "Escape",
};

// "⌘⇧P" → ["⌘", "⇧", "P"], "Ctrl+K" → ["Ctrl", "K"], "G D" → ["G", "D"].
function parseShortcut(shortcut: string | string[]) {
  if (Array.isArray(shortcut)) return shortcut;
  return shortcut
    .split(/[\s+]+/)
    .filter(Boolean)
    .flatMap((token) => {
      const keys: string[] = [];
      let rest = token;
      while (rest.length > 1 && MODIFIERS.includes(rest[0])) {
        keys.push(rest[0]);
        rest = rest.slice(1);
      }
      return [...keys, rest];
    });
}

// Only chords map onto aria-keyshortcuts; a sequence like "G D" would read as two alternatives.
function ariaShortcut(shortcut: string | string[], keys: string[]) {
  const chord = typeof shortcut === "string" && (shortcut.includes("+") || [...MODIFIERS].some((m) => shortcut.includes(m)));
  return chord ? keys.map((key) => ARIA_KEYS[key] ?? key).join("+") : undefined;
}

/* -------------------------------------------------------------------------------------------------
 * Contexts
 * -----------------------------------------------------------------------------------------------*/

interface CommandContextValue {
  store: CommandStore;
  register: (record: ItemRecord) => () => void;
  label?: string;
  inputId: string;
  listId: string;
  highlightId: string;
  itemDomId: (id: string) => string;
  search: string;
  filtering: boolean;
  loading: boolean;
  results: Results;
  activeId: string | null;
  setActive: (id: string, scroll?: boolean) => void;
  reduceMotion: boolean;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);
const GroupContext = React.createContext<string | null>(null);
const CommandDialogContext = React.createContext<{ close: () => void } | null>(null);

function useCommand(component: string) {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Command>.`);
  return context;
}

/* -------------------------------------------------------------------------------------------------
 * Command
 * -----------------------------------------------------------------------------------------------*/

export interface CommandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** Accessible name for the input and list. */
  label?: string;
  /** The highlighted item's value, when controlled. */
  value?: string;
  /** Called when the highlight moves, by keyboard, pointer or a new search. */
  onValueChange?: (value: string) => void;
  /** Custom ranking. Return 0 to hide an item, higher numbers rank first. */
  filter?: Filter;
  /** Set false when results come pre-filtered, e.g. from a server. */
  shouldFilter?: boolean;
  /** Arrow keys wrap from the last item to the first. */
  loop?: boolean;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  (
    {
      label,
      value,
      onValueChange,
      filter = defaultFilter,
      shouldFilter = true,
      loop = true,
      color,
      className,
      style,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    const reduceMotion = useReducedMotion() ?? false;
    const [store] = React.useState(createStore);
    const state = React.useSyncExternalStore(store.subscribe, store.get, store.get);
    const { search } = state;
    const filtering = shouldFilter && search.trim() !== "";
    const results = React.useMemo(
      () => rank(state.items, search, filtering, filter),
      [state.items, search, filtering, filter],
    );

    const explicit = state.active.search === search;
    const chosen = explicit
      ? results.navigable.find((item) =>
          value !== undefined ? item.value === value : item.id === state.active.id,
        )
      : undefined;
    const active = chosen ?? results.navigable[0];
    const activeValue = active?.value;

    const reported = React.useRef<string | undefined>(undefined);
    React.useEffect(() => {
      if (activeValue === undefined || activeValue === reported.current) return;
      reported.current = activeValue;
      onValueChange?.(activeValue);
    }, [activeValue, onValueChange]);

    const register = React.useCallback(
      (record: ItemRecord) => {
        store.update((current) => ({ items: insertInDomOrder(current.items, record) }));
        return () => {
          store.update((current) => ({ items: current.items.filter((item) => item.id !== record.id) }));
        };
      },
      [store],
    );

    function setActive(id: string, scroll = false) {
      const item = results.navigable.find((candidate) => candidate.id === id);
      if (!item) return;
      store.update((current) => ({ active: { id, search: current.search } }));
      if (value !== undefined && item.value !== value) {
        reported.current = item.value;
        onValueChange?.(item.value);
      }
      if (!scroll) return;
      const list = item.element.closest<HTMLElement>('[role="listbox"]');
      if (item === results.navigable[0] && list) {
        list.scrollTop = 0;
        return;
      }
      // The first item of a group brings its heading along.
      if (results.navigable.find((candidate) => candidate.groupId === item.groupId) === item) {
        item.element
          .closest("[data-command-group]")
          ?.querySelector("[data-command-group-heading]")
          ?.scrollIntoView({ block: "nearest" });
      }
      item.element.scrollIntoView({ block: "nearest" });
    }

    function step(direction: 1 | -1, byGroup: boolean) {
      const items = results.navigable;
      if (!items.length) return undefined;
      const index = active ? items.indexOf(active) : -1;
      if (index === -1) return direction === 1 ? items[0] : items[items.length - 1];

      if (byGroup) {
        const group = active!.groupId;
        if (direction === 1) {
          return items.slice(index + 1).find((item) => item.groupId !== group) ?? (loop ? items[0] : undefined);
        }
        const previous = items
          .slice(0, items.findIndex((item) => item.groupId === group))
          .pop();
        const target = previous ?? (loop ? items[items.length - 1] : undefined);
        return target && items.find((item) => item.groupId === target.groupId);
      }

      const next = index + direction;
      if (next < 0 || next >= items.length) return loop ? items[(next + items.length) % items.length] : undefined;
      return items[next];
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
      // Leave keys alone on other controls, like the dialog's esc button or a footer action.
      const target = event.target as HTMLElement;
      if (target.getAttribute("role") !== "combobox" && target.closest("button, a, input, textarea, select, [contenteditable]")) {
        return;
      }
      const ctrl = event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
      let next: ItemRecord | undefined;

      if (event.key === "ArrowDown" || (ctrl && event.key === "n")) next = step(1, event.altKey);
      else if (event.key === "ArrowUp" || (ctrl && event.key === "p")) next = step(-1, event.altKey);
      else if (event.key === "Home") next = results.navigable[0];
      else if (event.key === "End") next = results.navigable[results.navigable.length - 1];
      else if (event.key === "Enter") {
        if (!active) return;
        event.preventDefault();
        active.select();
        return;
      } else return;

      event.preventDefault();
      if (next) setActive(next.id, true);
    }

    const context: CommandContextValue = {
      store,
      register,
      label,
      inputId: `${baseId}-input`,
      listId: `${baseId}-list`,
      // Keyed by the search so the highlight glides between items but jumps while typing.
      highlightId: `${baseId}-highlight-${search}`,
      itemDomId: (id) => `${baseId}-item-${id}`,
      search,
      filtering,
      loading: state.loading > 0,
      results,
      activeId: active?.id ?? null,
      setActive,
      reduceMotion,
    };

    const announcement =
      state.loading > 0
        ? "Loading results"
        : filtering
          ? results.count === 0
            ? "No results"
            : `${results.count} result${results.count === 1 ? "" : "s"}`
          : "";

    return (
      <CommandContext.Provider value={context}>
        <div
          ref={ref}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0b11] text-white/90",
            "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06)]",
            className,
          )}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
          <span role="status" aria-live="polite" aria-atomic className="sr-only">
            {announcement}
          </span>
        </div>
      </CommandContext.Provider>
    );
  },
);
Command.displayName = "Command";

/* -------------------------------------------------------------------------------------------------
 * CommandInput
 * -----------------------------------------------------------------------------------------------*/

const scanKeyframes =
  "@keyframes neonkit-command-scan{from{transform:translateX(-100%)}to{transform:translateX(300%)}}";

export interface CommandInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "size"> {
  /** The search, when controlled. */
  value?: string;
  onValueChange?: (search: string) => void;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  (
    {
      value,
      onValueChange,
      placeholder = "Type a command or search…",
      className,
      onSelect,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef,
  ) => {
    const ctx = useCommand("CommandInput");
    const dialog = React.useContext(CommandDialogContext);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mirrorRef = React.useRef<HTMLSpanElement>(null);
    const hotspotRef = React.useRef<HTMLSpanElement>(null);
    const ref = useComposedRefs(forwardedRef, inputRef);
    const [typing, setTyping] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const typingTimer = React.useRef<number | undefined>(undefined);
    const search = value ?? ctx.search;
    const { store } = ctx;

    useIsomorphicLayoutEffect(() => {
      if (value !== undefined && value !== store.get().search) store.update(() => ({ search: value }));
    }, [value, store]);

    React.useEffect(() => () => window.clearTimeout(typingTimer.current), []);

    // The light sits under the text caret, measured with an invisible copy of the text before it.
    const trackCaret = React.useCallback(() => {
      const input = inputRef.current;
      const mirror = mirrorRef.current;
      const hotspot = hotspotRef.current;
      if (!input || !mirror || !hotspot) return;
      mirror.textContent = input.value.slice(0, input.selectionEnd ?? input.value.length);
      const x = input.offsetLeft + mirror.offsetWidth - input.scrollLeft;
      const clamped = Math.min(Math.max(x, input.offsetLeft), input.offsetLeft + input.offsetWidth);
      hotspot.style.transform = `translateX(${clamped}px)`;
    }, []);

    useIsomorphicLayoutEffect(trackCaret, [search, trackCaret]);

    return (
      <div
        className={cn(
          "relative flex shrink-0 items-center gap-3 border-b border-white/[0.08]",
          dialog ? "h-14 px-4 text-[15px]" : "h-12 px-3.5 text-sm",
        )}
      >
        <Search
          aria-hidden
          className={cn(
            "size-4 shrink-0 transition-colors duration-200",
            search ? "text-[rgb(var(--neon))]" : "text-white/40",
          )}
        />
        <input
          ref={ref}
          id={ctx.inputId}
          type="text"
          role="combobox"
          aria-expanded
          aria-controls={ctx.listId}
          aria-activedescendant={ctx.activeId ? ctx.itemDomId(ctx.activeId) : undefined}
          aria-autocomplete="list"
          aria-label={ctx.label ?? (typeof placeholder === "string" ? placeholder : "Search")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={placeholder}
          value={search}
          onChange={(event) => {
            const next = event.target.value;
            if (value === undefined) store.update(() => ({ search: next }));
            onValueChange?.(next);
            // The best match moves to the top, so bring the top into view.
            const list = document.getElementById(ctx.listId);
            if (list) list.scrollTop = 0;
            setTyping(true);
            window.clearTimeout(typingTimer.current);
            typingTimer.current = window.setTimeout(() => setTyping(false), 140);
          }}
          onSelect={(event) => {
            onSelect?.(event);
            trackCaret();
          }}
          onFocus={(event) => {
            onFocus?.(event);
            setFocused(true);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            setFocused(false);
          }}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-white/90 outline-none placeholder:text-white/40",
            "[&::-webkit-search-cancel-button]:appearance-none",
            className,
          )}
          {...props}
        />
        <span ref={mirrorRef} aria-hidden className="invisible pointer-events-none absolute left-0 top-0 whitespace-pre" />
        {dialog && (
          <button
            type="button"
            aria-label="Close"
            onClick={dialog.close}
            className={cn(
              "flex h-6 shrink-0 cursor-pointer items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 font-mono text-[11px] text-white/60 outline-none",
              "transition-[color,border-color,transform] duration-150 ease-out hover:border-white/20 hover:text-white/80 active:scale-[0.97]",
              "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]",
            )}
          >
            esc
          </button>
        )}

        {/* The caret line: a tube along the bottom edge, lit where you're typing. */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px [overflow-x:clip]">
          <span
            className={cn(
              "absolute inset-0 transition-opacity ease-out motion-reduce:transition-none",
              typing ? "opacity-100 duration-75" : focused ? "opacity-50 duration-700" : "opacity-15 duration-300",
            )}
          >
            <span
              ref={hotspotRef}
              className="absolute left-0 top-0 transition-transform duration-150 ease-out motion-reduce:transition-none"
            >
              <span className="absolute -left-28 top-0 h-px w-56 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)),transparent)]" />
              <span className="absolute -left-32 -top-3 h-6 w-64 bg-[radial-gradient(closest-side,rgb(var(--neon)/CALC(0.22*var(--neon-glow,1))),transparent)]" />
            </span>
          </span>
          {ctx.loading && (
            <>
              <style>{scanKeyframes}</style>
              <span className="absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.8),transparent)] [animation:neonkit-command-scan_1.2s_cubic-bezier(0.45,0,0.55,1)_infinite] motion-reduce:[animation:none]" />
            </>
          )}
        </span>
      </div>
    );
  },
);
CommandInput.displayName = "CommandInput";

/* -------------------------------------------------------------------------------------------------
 * CommandList, CommandEmpty, CommandLoading
 * -----------------------------------------------------------------------------------------------*/

export type CommandListProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
>;

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, onMouseDown, ...props }, ref) => {
    const ctx = useCommand("CommandList");
    const dialog = React.useContext(CommandDialogContext);

    return (
      <motion.div
        ref={ref}
        // Lets the gliding highlight measure correctly while the list is scrolled.
        layoutScroll
        id={ctx.listId}
        role="listbox"
        aria-label={ctx.label ? `${ctx.label} results` : "Results"}
        aria-busy={ctx.loading || undefined}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          // A press on a heading or the padding would otherwise pull focus out of the input.
          const target = event.target as HTMLElement;
          if (!target.closest("input, textarea, select, button, a, [contenteditable]")) event.preventDefault();
        }}
        className={cn(
          // Inline, the list passes the wheel to the page at its ends; inside a dialog it keeps it.
          "flex flex-col overflow-y-auto p-1.5 scroll-py-1.5",
          dialog && "overscroll-contain",
          "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
          dialog ? "max-h-[min(400px,calc(85dvh-140px))]" : "max-h-80",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, children, ...props }, ref) => {
    const ctx = useCommand("CommandEmpty");
    // Items register on the client, so the server would always think the list is empty.
    const isClient = useIsClient();
    if (!isClient || ctx.results.count > 0 || ctx.loading) return null;

    return (
      <div
        ref={ref}
        role="presentation"
        style={{ order: -1, ...style }}
        className={cn("flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-white/60", className)}
        {...props}
      >
        {/* An unlit tube. */}
        <span aria-hidden className="h-[3px] w-10 rounded-full bg-white/[0.07] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]" />
        {children ?? "Nothing lit up."}
      </div>
    );
  },
);
CommandEmpty.displayName = "CommandEmpty";

const CommandLoading = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, children, ...props }, ref) => {
    const { store } = useCommand("CommandLoading");

    useIsomorphicLayoutEffect(() => {
      store.update((current) => ({ loading: current.loading + 1 }));
      return () => store.update((current) => ({ loading: current.loading - 1 }));
    }, [store]);

    return (
      <div
        ref={ref}
        role="presentation"
        style={{ order: -1, ...style }}
        className={cn("flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/55", className)}
        {...props}
      >
        <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-[rgb(var(--neon)/0.8)]" />
        {children ?? "Loading…"}
      </div>
    );
  },
);
CommandLoading.displayName = "CommandLoading";

/* -------------------------------------------------------------------------------------------------
 * CommandGroup, CommandSeparator
 * -----------------------------------------------------------------------------------------------*/

export interface CommandGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "heading"> {
  heading?: React.ReactNode;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, className, style, children, ...props }, ref) => {
    const ctx = useCommand("CommandGroup");
    const id = React.useId();
    const visible = !ctx.filtering || ctx.results.groupOrder.has(id);

    return (
      <GroupContext.Provider value={id}>
        <div
          ref={ref}
          role="presentation"
          data-command-group=""
          hidden={!visible}
          style={{ order: ctx.filtering ? ctx.results.groupOrder.get(id) : undefined, ...style }}
          // A class, not the hidden attribute: Tailwind 3 lets display utilities override [hidden].
          className={cn(visible ? "flex" : "hidden", "flex-col", className)}
          {...props}
        >
          {heading && (
            <div
              id={`${id}-heading`}
              aria-hidden
              data-command-group-heading=""
              className="select-none px-3 pb-1 pt-3 text-xs font-medium leading-4 text-white/55"
            >
              {heading}
            </div>
          )}
          <div role="group" aria-labelledby={heading ? `${id}-heading` : undefined} className="flex flex-col">
            {children}
          </div>
        </div>
      </GroupContext.Provider>
    );
  },
);
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { filtering } = useCommand("CommandSeparator");
    // Results are re-ordered while searching, so dividers would land in the wrong places.
    if (filtering) return null;
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn("-mx-1.5 my-1.5 h-px shrink-0 bg-white/[0.07]", className)}
        {...props}
      />
    );
  },
);
CommandSeparator.displayName = "CommandSeparator";

/* -------------------------------------------------------------------------------------------------
 * CommandItem
 * -----------------------------------------------------------------------------------------------*/

export interface CommandItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  /** What the search matches and onSelect receives. Defaults to the text when children is a string. */
  value?: string;
  /** Extra words that should find this item, e.g. ["settings", "preferences"]. */
  keywords?: string[];
  /** Called on click or Enter. */
  onSelect?: (value: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  /** Keys to show on the right, e.g. "⌘K", "Ctrl+K", "G D" or ["⌘", "⇧", "P"]. */
  shortcut?: string | string[];
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  (
    {
      value: valueProp,
      keywords,
      onSelect,
      disabled = false,
      icon,
      shortcut,
      className,
      style,
      children,
      onClick,
      onPointerMove,
      onMouseDown,
      ...props
    },
    forwardedRef,
  ) => {
    const ctx = useCommand("CommandItem");
    const groupId = React.useContext(GroupContext);
    const id = React.useId();
    const elementRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, elementRef);
    const text = typeof children === "string" ? children : undefined;
    const value = valueProp ?? text ?? id;
    // The visible text stays searchable when value is an id like "theme-cyan".
    const keywordsKey = [...(keywords ?? []), ...(text && text !== value ? [text] : [])].join("\n");
    const { register } = ctx;

    const onSelectRef = React.useRef(onSelect);
    useIsomorphicLayoutEffect(() => {
      onSelectRef.current = onSelect;
    });

    useIsomorphicLayoutEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      return register({
        id,
        value,
        keywords: keywordsKey ? keywordsKey.split("\n") : [],
        disabled,
        groupId,
        element,
        select: () => onSelectRef.current?.(value),
      });
    }, [register, id, value, keywordsKey, disabled, groupId]);

    const visible = !ctx.filtering || Boolean(ctx.results.scores?.has(id));
    const active = ctx.activeId === id;
    const keys = shortcut ? parseShortcut(shortcut) : [];

    return (
      <div
        ref={ref}
        id={ctx.itemDomId(id)}
        role="option"
        aria-selected={active}
        aria-disabled={disabled || undefined}
        aria-keyshortcuts={shortcut ? ariaShortcut(shortcut, keys) : undefined}
        data-active={active || undefined}
        data-disabled={disabled || undefined}
        data-value={value}
        hidden={!visible}
        style={{ order: ctx.filtering ? ctx.results.order.get(id) : undefined, ...style }}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          // Keep focus in the input, where aria-activedescendant does the work.
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (!active && !disabled && !event.defaultPrevented) ctx.setActive(id);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (!disabled && !event.defaultPrevented) onSelectRef.current?.(value);
        }}
        className={cn(
          "relative min-h-10 cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 outline-none",
          "transition-colors duration-100",
          visible ? "flex" : "hidden",
          active ? "text-white" : "text-white/70",
          disabled && "cursor-not-allowed opacity-40",
          className,
        )}
        {...props}
      >
        {active && (
          <motion.span
            aria-hidden
            layoutId={ctx.reduceMotion ? undefined : ctx.highlightId}
            initial={false}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ borderRadius: 8 }}
            className="absolute inset-0 border border-[rgb(var(--neon)/0.22)] bg-[rgb(var(--neon)/0.09)] shadow-[0_0_18px_-6px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_0_14px_-6px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]"
          />
        )}
        {icon && (
          <span
            aria-hidden
            className={cn(
              "relative flex size-4 shrink-0 items-center justify-center transition-[color,filter] duration-150 [&_svg]:size-4",
              active ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]" : "text-white/40",
            )}
          >
            {icon}
          </span>
        )}
        <span className="relative min-w-0 flex-1 truncate">
          {typeof children === "string" ? <Highlight text={children} search={ctx.search} /> : children}
        </span>
        {keys.length > 0 && (
          <span aria-hidden className="relative ml-auto flex shrink-0 items-center gap-1">
            {keys.map((key, index) => (
              <kbd
                key={`${key}-${index}`}
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border px-1 font-sans text-[11px] leading-none transition-colors duration-150",
                  active ? "border-white/15 bg-white/[0.07] text-white/70" : "border-white/[0.08] bg-white/[0.03] text-white/55",
                )}
              >
                {key}
              </kbd>
            ))}
          </span>
        )}
      </div>
    );
  },
);
CommandItem.displayName = "CommandItem";

/* -------------------------------------------------------------------------------------------------
 * CommandDialog
 * -----------------------------------------------------------------------------------------------*/

export interface CommandDialogProps extends CommandProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CommandDialog = React.forwardRef<HTMLDivElement, CommandDialogProps>(
  ({ open: openProp, defaultOpen = false, onOpenChange, label, color, className, children, ...props }, ref) => {
    const reduceMotion = useReducedMotion();
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : uncontrolledOpen;
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const saved = React.useRef<{ overflow: string; focus: HTMLElement | null } | null>(null);

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (next === open) return;
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [open, isControlled, onOpenChange],
    );

    useIsomorphicLayoutEffect(() => {
      const dialog = dialogRef.current;
      if (!open || !dialog || dialog.open) return;
      const active = document.activeElement;
      saved.current = {
        overflow: document.documentElement.style.overflow,
        focus: active instanceof HTMLElement && active !== document.body ? active : null,
      };
      document.documentElement.style.overflow = "hidden";
      dialog.showModal();
      // showModal focuses the first control while the panel is still offscreen, and the browser can
      // scroll the dialog to bring it into view. Undo that so the panel lands where it should.
      dialog.scrollTop = 0;
      dialog.scrollLeft = 0;
      dialog.querySelector<HTMLInputElement>('[role="combobox"]')?.focus();
    }, [open]);

    React.useEffect(
      () => () => {
        if (saved.current) document.documentElement.style.overflow = saved.current.overflow;
      },
      [],
    );

    // The <dialog> stays open while the panel animates out, then closes for real here.
    const finish = () => {
      const dialog = dialogRef.current;
      if (dialog?.open) dialog.close();
      const restore = saved.current;
      saved.current = null;
      if (!restore) return;
      document.documentElement.style.overflow = restore.overflow;
      if (restore.focus?.isConnected) restore.focus.focus({ preventScroll: true });
    };

    const dialogContext = React.useMemo(() => ({ close: () => setOpen(false) }), [setOpen]);
    const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 };
    const exit = { duration: reduceMotion ? 0.1 : 0.12, ease: EASE };

    return (
      <dialog
        ref={dialogRef}
        aria-label={label ?? "Command menu"}
        onCancel={(event) => {
          // React passes a nested dialog's cancel up to every ancestor's handler; only Escape on this one counts.
          if (event.target !== event.currentTarget) return;
          // Escape: let the exit animation run instead of closing instantly.
          event.preventDefault();
          setOpen(false);
        }}
        onClose={(event) => {
          if (event.target !== event.currentTarget) return;
          if (!dialogRef.current?.open) setOpen(false);
        }}
        style={neonVars(color)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white/90 outline-none backdrop:bg-transparent",
        )}
      >
        <CommandDialogContext.Provider value={dialogContext}>
          <AnimatePresence onExitComplete={finish}>
            {open && (
              <motion.div
                key="overlay"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: exit }}
                transition={{ duration: 0.16, ease: EASE }}
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              />
            )}
            {open && (
              <div key="viewport" className="pointer-events-none absolute inset-x-0 top-[15vh] flex justify-center">
                <motion.div
                  initial={hidden}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ ...hidden, transition: exit }}
                  transition={{ duration: 0.16, ease: EASE }}
                  className="pointer-events-auto w-[min(640px,calc(100vw-32px))] origin-top"
                >
                  <Command
                    ref={ref}
                    label={label}
                    className={cn(
                      "rounded-2xl border-[rgb(var(--neon)/0.16)]",
                      "shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_24px_64px_-16px_rgb(0_0_0/0.9),0_0_80px_-24px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]",
                      className,
                    )}
                    {...props}
                  >
                    {children}
                  </Command>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </CommandDialogContext.Provider>
      </dialog>
    );
  },
);
CommandDialog.displayName = "CommandDialog";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};
