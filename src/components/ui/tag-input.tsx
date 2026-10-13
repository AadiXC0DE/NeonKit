"use client";

import * as React from "react";
import { X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID_RGB = "255 77 94";
const DEFAULT_SEPARATORS = [",", "Enter"];

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// A struck tube: two quick drops in brightness, then it holds.
const keyframes =
  "@keyframes neonkit-tag-ignite{0%{opacity:0}12%{opacity:.85}22%{opacity:.15}40%{opacity:1}52%{opacity:.4}68%,100%{opacity:1}}";
const IGNITE = "[animation:neonkit-tag-ignite_350ms_linear_both] motion-reduce:[animation:none]";

const sizes = {
  sm: {
    field: "min-h-8 gap-1 rounded-md p-[5px] text-xs",
    input: "h-5 px-[5px]",
    chip: "h-5 gap-0.5 rounded-[5px] pl-1.5 text-[11px]",
    chipRemove: "size-4 rounded-[4px] [&_svg]:size-3",
    list: "rounded-lg",
    option: "rounded-md px-2 py-1.5 text-xs",
    label: "text-xs",
  },
  md: {
    field: "min-h-10 gap-1 rounded-lg p-[7px] text-sm",
    input: "h-6 px-[5px]",
    chip: "h-6 gap-1 rounded-md pl-2 text-xs",
    chipRemove: "size-5 rounded-[5px] [&_svg]:size-3",
    list: "rounded-xl",
    option: "rounded-lg px-2.5 py-2 text-sm",
    label: "text-sm",
  },
  lg: {
    field: "min-h-12 gap-1 rounded-xl p-[9px] text-base",
    input: "h-7 px-[7px]",
    chip: "h-7 gap-1 rounded-lg pl-2.5 text-sm",
    chipRemove: "size-6 rounded-md [&_svg]:size-3.5",
    list: "rounded-xl",
    option: "rounded-lg px-3 py-2.5 text-base",
    label: "text-sm",
  },
} as const;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Stable keys for chips: the tag plus which occurrence it is, so duplicates stay distinct. */
function tagKeys(tags: string[]) {
  const seen = new Map<string, number>();
  return tags.map((tag) => {
    const count = seen.get(tag) ?? 0;
    seen.set(tag, count + 1);
    return `${tag}\u0000${count}`;
  });
}

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

export interface TagInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "color" | "size" | "value" | "defaultValue" | "onChange" | "type" | "max" | "children"
  > {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Shown while there are no tags. */
  placeholder?: string;
  /** Most tags allowed. */
  max?: number;
  /** Keys that commit the typed text: "Enter", "Tab", or single characters like "," or " ". */
  separators?: string[];
  /** Return true to accept a tag, or a message explaining why not. */
  validate?: (tag: string) => true | string;
  /** Accept the same tag twice. Duplicates are compared case-insensitively. */
  allowDuplicates?: boolean;
  /** Offered in a list that filters as you type. */
  suggestions?: string[];
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Submits each tag under this name with a surrounding form. */
  name?: string;
  label?: React.ReactNode;
  /** Helper text under the field. Hidden while an error shows. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Classes for the field box: the bordered wrapper around the chips and input. */
  className?: string;
  /** Classes for the outer block holding the label, field and message. */
  containerClassName?: string;
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder,
      max,
      separators = DEFAULT_SEPARATORS,
      validate,
      allowDuplicates = false,
      suggestions,
      color,
      size = "md",
      name,
      label,
      description,
      error,
      disabled,
      readOnly,
      required,
      id: idProp,
      className,
      containerClassName,
      style,
      onKeyDown,
      onBlur,
      onPaste,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const fieldRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const autoId = React.useId();
    const id = idProp ?? autoId;
    const listboxId = `${id}-suggestions`;
    const hintId = `${id}-chip-hint`;
    const s = sizes[size];
    const locked = Boolean(disabled || readOnly);

    const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? []);
    const tags = valueProp ?? uncontrolled;
    const keys = tagKeys(tags);
    const [text, setText] = React.useState("");
    // A rejection message from the last commit. Shown in place of the description.
    const [problem, setProblem] = React.useState<string | null>(null);
    // The first Backspace on an empty input arms the last chip; the second removes it.
    const [armed, setArmed] = React.useState(false);
    // Keys of chips the user just committed: these power on, chips present at mount don't.
    const [fresh, setFresh] = React.useState<string[]>([]);
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [announcement, setAnnouncement] = React.useState("");
    const focusRequest = React.useRef<number | "input" | null>(null);

    const errored = Boolean(problem) || Boolean(error);
    const rejected = useRejected(inputRef, tags.join("\n"));
    const invalid = errored || rejected;
    const message = problem ?? (error ? (error === true ? null : error) : description);
    const messageId = message ? `${id}-${errored ? "error" : "description"}` : undefined;
    const atMax = max !== undefined && tags.length >= max;

    const query = text.trim().toLowerCase();
    const available = React.useMemo(() => {
      if (!suggestions) return [];
      const taken = new Set(tags.map((tag) => tag.toLowerCase()));
      const pool = allowDuplicates ? suggestions : suggestions.filter((item) => !taken.has(item.toLowerCase()));
      if (!query) return pool;
      const starts: string[] = [];
      const contains: string[] = [];
      for (const item of pool) {
        const at = item.toLowerCase().indexOf(query);
        if (at === 0) starts.push(item);
        else if (at > 0) contains.push(item);
      }
      return [...starts, ...contains];
    }, [suggestions, tags, allowDuplicates, query]);
    const listOpen = open && available.length > 0 && !locked && !atMax;
    const active = listOpen && activeIndex < available.length ? activeIndex : -1;

    // A form reset clears the typed text natively; put the starting tags back with it.
    const initialTags = React.useRef(tags);
    const resetRef = React.useRef<() => void>(() => {});
    React.useEffect(() => {
      resetRef.current = () => {
        const initial = initialTags.current;
        setText("");
        setProblem(null);
        setArmed(false);
        setOpen(false);
        if (initial.length === tags.length && initial.every((tag, i) => tag === tags[i])) return;
        if (valueProp === undefined) setUncontrolled(initial);
        onValueChange?.(initial);
      };
    });
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form) return;
      const onReset = () => resetRef.current();
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, []);

    function chipAt(index: number) {
      return fieldRef.current?.querySelector<HTMLElement>(`[data-tag-index="${index}"]`) ?? null;
    }

    // Moves focus once the chips have re-rendered after a removal.
    useIsomorphicLayoutEffect(() => {
      const request = focusRequest.current;
      if (request === null) return;
      focusRequest.current = null;
      const chip = request === "input" ? null : chipAt(request);
      (chip ?? inputRef.current)?.focus();
    });

    function setTags(next: string[]) {
      if (valueProp === undefined) setUncontrolled(next);
      onValueChange?.(next);
    }

    function split(raw: string) {
      const marks = [",", "\n", "\r", ...separators.filter((key) => key.length === 1)];
      let parts = [raw];
      for (const mark of marks) parts = parts.flatMap((part) => part.split(mark));
      return parts.map((part) => part.trim()).filter(Boolean);
    }

    function add(pieces: string[]) {
      const next = [...tags];
      // Tags the validator turned down stay in the input to be fixed. Duplicates and overflow are dropped.
      const keep: string[] = [];
      let reason: string | null = null;
      let duplicateOf = -1;

      for (const tag of pieces) {
        if (max !== undefined && next.length >= max) {
          reason ??= `You can add up to ${max} ${max === 1 ? "tag" : "tags"}.`;
          continue;
        }
        if (!allowDuplicates) {
          const existing = next.findIndex((item) => item.toLowerCase() === tag.toLowerCase());
          if (existing !== -1) {
            reason ??= `“${tag}” is already added.`;
            if (duplicateOf === -1 && existing < tags.length) duplicateOf = existing;
            continue;
          }
        }
        const verdict = validate ? validate(tag) : true;
        if (verdict !== true) {
          keep.push(tag);
          reason ??= typeof verdict === "string" && verdict ? verdict : `“${tag}” isn’t valid.`;
          continue;
        }
        next.push(tag);
      }

      const added = next.slice(tags.length);
      if (added.length) {
        setTags(next);
        setFresh(tagKeys(next).slice(tags.length));
        setAnnouncement(added.length === 1 ? `Added ${added[0]}` : `Added ${added.length} tags`);
      }
      return { keep, reason, duplicateOf };
    }

    function reject(reason: string, duplicateOf: number, quiet = false) {
      setProblem(reason);
      setAnnouncement(reason);
      if (quiet || prefersReducedMotion()) return;
      const field = fieldRef.current;
      if (field && typeof field.animate === "function") {
        field.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(4px)" },
            { transform: "translateX(-3px)" },
            { transform: "translateX(2px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 320, easing: "ease-out" },
        );
      }
      // Point at the chip that's already there.
      const chip = duplicateOf >= 0 ? chipAt(duplicateOf) : null;
      if (chip && typeof chip.animate === "function") {
        chip.animate([{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }, { opacity: 0.45 }, { opacity: 1 }], {
          duration: 420,
          easing: "linear",
        });
      }
    }

    function commit(raw: string, quiet = false) {
      setOpen(false);
      setActiveIndex(-1);
      const pieces = split(raw);
      if (!pieces.length) {
        setText("");
        return;
      }
      const { keep, reason, duplicateOf } = add(pieces);
      setText(keep.join(", "));
      if (reason) reject(reason, duplicateOf, quiet);
    }

    function removeAt(index: number, then?: "previous" | "next" | "input") {
      const removed = tags[index];
      const next = tags.filter((_, i) => i !== index);
      setTags(next);
      setArmed(false);
      setProblem(null);
      setAnnouncement(`Removed ${removed}`);
      if (!then) return;
      if (then === "previous") focusRequest.current = index > 0 ? index - 1 : next.length ? 0 : "input";
      else if (then === "next") focusRequest.current = index < next.length ? index : "input";
      else focusRequest.current = "input";
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented || locked || event.nativeEvent.isComposing) return;
      const { key } = event;
      if (key !== "Backspace") setArmed(false);

      if (suggestions) {
        if (key === "ArrowDown" || key === "ArrowUp") {
          event.preventDefault();
          if (!listOpen) {
            setOpen(true);
            setActiveIndex(key === "ArrowDown" ? 0 : available.length - 1);
          } else {
            const last = available.length - 1;
            setActiveIndex(
              key === "ArrowDown" ? (active >= last ? 0 : active + 1) : active <= 0 ? last : active - 1,
            );
          }
          return;
        }
        if (listOpen && key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          return;
        }
        if (listOpen && key === "Enter" && active >= 0) {
          event.preventDefault();
          commit(available[active]);
          return;
        }
      }

      if (separators.includes(key)) {
        if (text.trim()) {
          event.preventDefault();
          commit(text);
        } else if (key.length === 1) {
          // A lone separator on an empty input would only become an empty tag.
          event.preventDefault();
        }
        return;
      }

      const input = event.currentTarget;
      if (key === "Backspace" && text === "" && tags.length) {
        event.preventDefault();
        if (armed) removeAt(tags.length - 1);
        else setArmed(true);
        return;
      }
      if (key === "ArrowLeft" && text === "" && input.selectionStart === 0 && tags.length) {
        event.preventDefault();
        chipAt(tags.length - 1)?.focus();
      }
    }

    function handleChipKeyDown(event: React.KeyboardEvent<HTMLElement>, index: number) {
      if (locked || event.target !== event.currentTarget) return;
      const last = tags.length - 1;
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          chipAt(Math.max(0, index - 1))?.focus();
          break;
        case "ArrowRight":
          event.preventDefault();
          (index === last ? inputRef.current : chipAt(index + 1))?.focus();
          break;
        case "Home":
          event.preventDefault();
          chipAt(0)?.focus();
          break;
        case "End":
        case "Escape":
          event.preventDefault();
          inputRef.current?.focus();
          break;
        case "Backspace":
          event.preventDefault();
          removeAt(index, "previous");
          break;
        case "Delete":
          event.preventDefault();
          removeAt(index, "next");
          break;
        default:
          // Typing on a chip goes back to the input, keeping the character.
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            setText((current) => current + event.key);
            setProblem(null);
            if (suggestions) setOpen(true);
            inputRef.current?.focus();
          }
      }
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const next = event.target.value;
      setProblem(null);
      setArmed(false);
      // Mobile keyboards often report separators only through the value, not the key.
      const lastChar = next.slice(-1);
      const marks = separators.filter((key) => key.length === 1);
      if (marks.includes(lastChar) && next.length > text.length && next.slice(0, -1).trim()) {
        commit(next.slice(0, -1));
        return;
      }
      setText(next);
      if (suggestions) {
        setOpen(next.trim() !== "");
        setActiveIndex(next.trim() ? 0 : -1);
      }
    }

    function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
      onPaste?.(event);
      if (event.defaultPrevented || locked) return;
      const pasted = event.clipboardData.getData("text");
      const marks = [",", "\n", "\r", ...separators.filter((key) => key.length === 1)];
      if (!marks.some((mark) => pasted.includes(mark))) return;
      event.preventDefault();
      const input = event.currentTarget;
      const start = input.selectionStart ?? text.length;
      const end = input.selectionEnd ?? text.length;
      setProblem(null);
      commit(text.slice(0, start) + pasted + text.slice(end));
    }

    function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
      onBlur?.(event);
      setArmed(false);
      setOpen(false);
      // Leaving the field commits what's typed, quietly. Moving onto a chip doesn't.
      if (fieldRef.current?.contains(event.relatedTarget as Node | null)) return;
      if (text.trim() && !locked) commit(text, true);
    }

    function handleFieldMouseDown(event: React.MouseEvent<HTMLDivElement>) {
      const target = event.target as HTMLElement;
      if (target === inputRef.current || target.closest("button, [data-tag-index]")) return;
      event.preventDefault();
      inputRef.current?.focus();
    }

    function highlightMatch(item: string) {
      const at = query ? item.toLowerCase().indexOf(query) : -1;
      if (at < 0) return item;
      return (
        <>
          {item.slice(0, at)}
          <mark className="bg-transparent text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.55)]">
            {item.slice(at, at + query.length)}
          </mark>
          {item.slice(at + query.length)}
        </>
      );
    }

    return (
      <div
        style={neonVars(color)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-full gap-1.5", containerClassName)}
      >
        {label && (
          <label htmlFor={id} className={cn("w-fit font-medium text-white/80", s.label)}>
            {label}
            {required && (
              <span
                aria-hidden
                title="Required"
                className="relative -top-px ml-1.5 inline-block size-[5px] rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_4px_rgb(var(--neon)/0.9),0_0_10px_rgb(var(--neon)/0.5)]"
              />
            )}
          </label>
        )}
        <div className="relative">
          <div
            ref={fieldRef}
            onMouseDown={handleFieldMouseDown}
            style={invalid ? ({ "--neon-field": INVALID_RGB, ...style } as React.CSSProperties) : style}
            className={cn(
              // The field's own light. Kept apart from --neon so the chips stay in color when it turns red.
              "[--neon-field:var(--neon)]",
              "relative flex w-full cursor-text flex-wrap items-center border border-white/10 bg-white/[0.03] text-white/90",
              "transition-[border-color,background-color,box-shadow] ease-[cubic-bezier(0.23,1,0.32,1)] duration-[150ms,150ms,320ms]",
              "focus-within:border-[rgb(var(--neon-field)/0.8)] focus-within:bg-[rgb(var(--neon-field)/0.04)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon-field)/0.2),0_0_20px_-4px_rgb(var(--neon-field)/0.5),inset_0_0_12px_-2px_rgb(var(--neon-field)/0.14)]",
              !disabled && "hover:[&:not(:focus-within)]:border-white/20",
              invalid &&
                "border-[rgb(var(--neon-field)/0.55)] hover:[&:not(:focus-within)]:border-[rgb(var(--neon-field)/0.75)]",
              readOnly && "border-white/[0.08] bg-transparent",
              disabled && "cursor-not-allowed opacity-50",
              s.field,
              className,
            )}
          >
            {tags.length > 0 && (
              <ul className="contents">
                {tags.map((tag, index) => {
                  const isArmed = armed && index === tags.length - 1;
                  return (
                    <li
                      key={keys[index]}
                      data-tag-index={index}
                      tabIndex={locked ? undefined : -1}
                      aria-describedby={locked ? undefined : hintId}
                      onKeyDown={(event) => handleChipKeyDown(event, index)}
                      className={cn(
                        "inline-flex min-w-0 max-w-full items-center border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.08)] text-white/90 outline-none",
                        "transition-[border-color,background-color,box-shadow,color] duration-150 ease-out",
                        "focus-visible:border-[rgb(var(--neon)/0.8)] focus-visible:shadow-[0_0_14px_-2px_rgb(var(--neon)/0.6)]",
                        isArmed &&
                          "border-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.18)] text-white shadow-[0_0_16px_-2px_rgb(var(--neon)/0.7)]",
                        fresh.includes(keys[index]) && IGNITE,
                        s.chip,
                        locked && "pr-2",
                      )}
                    >
                      <span className="truncate">{tag}</span>
                      {!locked && (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label={`Remove ${tag}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => removeAt(index, "input")}
                          className={cn(
                            "grid shrink-0 cursor-pointer place-items-center outline-none transition-colors duration-150",
                            "hover:bg-[rgb(var(--neon)/0.16)] hover:text-white",
                            isArmed ? "text-white" : "text-white/50",
                            s.chipRemove,
                          )}
                        >
                          <X aria-hidden />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <input
              {...props}
              ref={inputRef}
              id={id}
              type="text"
              autoComplete="off"
              disabled={disabled}
              readOnly={readOnly}
              // Satisfied by the tags, not the text box, which is empty once a tag is committed.
              required={required && tags.length === 0}
              aria-required={required || undefined}
              role={suggestions ? "combobox" : undefined}
              aria-autocomplete={suggestions ? "list" : undefined}
              aria-expanded={suggestions ? listOpen : undefined}
              aria-controls={listOpen ? listboxId : undefined}
              aria-activedescendant={active >= 0 ? `${listboxId}-${active}` : undefined}
              aria-invalid={invalid || undefined}
              aria-describedby={[ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined}
              placeholder={tags.length ? undefined : placeholder}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={handleBlur}
              className={cn(
                "min-w-0 flex-1 basis-20 bg-transparent text-inherit outline-none placeholder:text-white/50 disabled:cursor-not-allowed",
                s.input,
              )}
            />
          </div>

          {listOpen && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Suggestions"
              onMouseDown={(event) => event.preventDefault()}
              className={cn(
                "absolute left-0 top-full z-50 mt-1.5 max-h-56 w-full overflow-y-auto overscroll-contain border border-white/10 bg-[#0a0b11] p-1",
                "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/0.45)]",
                "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
                s.list,
              )}
            >
              {available.map((item, index) => (
                <li
                  key={item}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onPointerMove={() => {
                    if (index !== active) setActiveIndex(index);
                  }}
                  onClick={() => {
                    commit(item);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "flex cursor-pointer select-none items-center truncate text-white/75 transition-colors duration-100",
                    index === active && "bg-[rgb(var(--neon)/0.1)] text-white",
                    s.option,
                  )}
                >
                  {highlightMatch(item)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {name &&
          tags.map((tag, index) => (
            <input key={keys[index]} type="hidden" name={name} value={tag} disabled={disabled} />
          ))}
        {message && (
          <p id={messageId} className={cn("text-xs leading-5", errored ? "text-[#ff4d5e]" : "text-white/55")}>
            {message}
          </p>
        )}
        <span id={hintId} className="sr-only">
          Backspace or Delete removes it. Arrow keys move between tags.
        </span>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
        {fresh.length > 0 && <style>{keyframes}</style>}
      </div>
    );
  },
);
TagInput.displayName = "TagInput";

export { TagInput };
