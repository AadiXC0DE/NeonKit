"use client";

import * as React from "react";
import { ArrowUp, Paperclip, X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const css = `
@keyframes nk-prompt-ignite{0%{filter:brightness(.35) saturate(.6)}9%{filter:brightness(1.35)}15%{filter:brightness(.55)}26%{filter:brightness(1.2)}38%{filter:brightness(.85)}100%{filter:none}}
.nk-prompt-ignite{animation:nk-prompt-ignite 460ms linear both}
@media (prefers-reduced-motion:reduce){.nk-prompt-ignite{animation:none}}
`;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface PromptAttachment {
  id: string;
  name: string;
  /** Bytes. */
  size?: number;
  /** MIME type. */
  type?: string;
  /** Preview URL. Set automatically for images added from a file. */
  url?: string;
  file?: File;
}

export interface PromptMessage {
  text: string;
  attachments: PromptAttachment[];
}

export type PromptRejection = "type" | "size" | "count";

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

function formatBytes(bytes?: number) {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(name: string) {
  const ext = name.includes(".") ? name.split(".").pop() : "";
  return (ext ?? "").slice(0, 4).toLowerCase() || "file";
}

/** About four characters per token for English prose and code. Pass your own counter for exact numbers. */
function estimateTokens(text: string) {
  return text.trim() ? Math.ceil(text.length / 4) : 0;
}

const numberFormat = new Intl.NumberFormat("en-US");

const iconButton = cn(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/55 outline-none",
  "transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.94]",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0c12]",
  "disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
);

export interface PromptInputProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "color" | "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the text and attachments. Uncontrolled state clears afterwards. */
  onSubmit?: (message: PromptMessage) => void;
  placeholder?: string;
  /** Accessible name of the textarea. */
  label?: string;
  minRows?: number;
  maxRows?: number;
  /** Which key sends. The other combination (or Shift+Enter) adds a newline. */
  submitOn?: "enter" | "mod-enter";
  /** A reply is arriving: the send button becomes Stop, and Escape stops too. */
  streaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  attachments?: PromptAttachment[];
  defaultAttachments?: PromptAttachment[];
  onAttachmentsChange?: (attachments: PromptAttachment[]) => void;
  /** Turns off the attach button, paste and drop. */
  allowAttachments?: boolean;
  /** File types, as in `<input accept>`. */
  accept?: string;
  maxFiles?: number;
  /** Bytes per file. */
  maxFileSize?: number;
  onRejectFiles?: (files: File[], reason: PromptRejection) => void;
  /** Controls after the attach button: a model picker, tool toggles. */
  toolbar?: React.ReactNode;
  /** Show a running count. */
  counter?: "characters" | "tokens";
  /** Upper bound for the counter. Going over disables send. */
  limit?: number;
  /** Replaces the four-characters-per-token estimate. */
  countTokens?: (text: string) => number;
  autoFocus?: boolean;
  /** Form field name for the textarea. */
  name?: string;
  color?: NeonColor;
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      placeholder = "Write a message",
      label = "Message",
      minRows = 1,
      maxRows = 8,
      submitOn = "enter",
      streaming = false,
      onStop,
      disabled = false,
      attachments: attachmentsProp,
      defaultAttachments = [],
      onAttachmentsChange,
      allowAttachments = true,
      accept,
      maxFiles,
      maxFileSize,
      onRejectFiles,
      toolbar,
      counter,
      limit,
      countTokens = estimateTokens,
      autoFocus,
      name,
      className,
      style,
      color,
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);
    const id = React.useId();

    const [innerValue, setInnerValue] = React.useState(defaultValue);
    const value = valueProp ?? innerValue;
    const [innerAttachments, setInnerAttachments] = React.useState(defaultAttachments);
    const attachments = attachmentsProp ?? innerAttachments;
    const attachmentsRef = React.useRef(attachments);
    React.useEffect(() => {
      attachmentsRef.current = attachments;
    });

    const [typing, setTyping] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const typingTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const dragDepth = React.useRef(0);
    const nextId = React.useRef(0);
    // Preview URLs this component created, revoked when their chip is removed or on unmount.
    const ownedUrls = React.useRef(new Set<string>());

    React.useEffect(() => {
      const urls = ownedUrls.current;
      return () => {
        clearTimeout(typingTimer.current);
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, []);

    const count = counter === "tokens" ? countTokens(value) : value.length;
    const over = limit !== undefined && count > limit;
    const near = limit !== undefined && !over && count >= limit * 0.9;
    const hasContent = value.trim().length > 0 || attachments.length > 0;
    const ready = hasContent && !over && !disabled && !streaming;

    const setValue = (next: string) => {
      if (valueProp === undefined) setInnerValue(next);
      onValueChange?.(next);
    };

    const setAttachments = (next: PromptAttachment[]) => {
      attachmentsRef.current = next;
      if (attachmentsProp === undefined) setInnerAttachments(next);
      onAttachmentsChange?.(next);
    };

    const resize = React.useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      const styles = window.getComputedStyle(el);
      const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.5;
      const chrome = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const min = lineHeight * minRows + chrome;
      const max = lineHeight * Math.max(maxRows, minRows) + chrome;
      el.style.height = `${min}px`;
      const next = Math.min(Math.max(el.scrollHeight, min), max);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    }, [minRows, maxRows]);

    useIsomorphicLayoutEffect(() => {
      resize();
    }, [resize, value]);

    React.useEffect(() => {
      const el = textareaRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      let width = el.offsetWidth;
      const observer = new ResizeObserver(() => {
        if (el.offsetWidth === width) return;
        width = el.offsetWidth;
        resize();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [resize]);

    const addFiles = (files: File[]) => {
      if (!allowAttachments || disabled || files.length === 0) return;
      const wrongType = files.filter((file) => !matchesAccept(file, accept));
      const tooBig = files.filter((file) => matchesAccept(file, accept) && maxFileSize !== undefined && file.size > maxFileSize);
      let accepted = files.filter((file) => !wrongType.includes(file) && !tooBig.includes(file));
      if (wrongType.length) onRejectFiles?.(wrongType, "type");
      if (tooBig.length) onRejectFiles?.(tooBig, "size");
      const current = attachmentsRef.current;
      if (maxFiles !== undefined && current.length + accepted.length > maxFiles) {
        const room = Math.max(0, maxFiles - current.length);
        onRejectFiles?.(accepted.slice(room), "count");
        accepted = accepted.slice(0, room);
      }
      if (!accepted.length) return;
      const added = accepted.map<PromptAttachment>((file) => {
        let url: string | undefined;
        if (file.type.startsWith("image/") && typeof URL.createObjectURL === "function") {
          url = URL.createObjectURL(file);
          ownedUrls.current.add(url);
        }
        nextId.current += 1;
        return { id: `${id}-file-${nextId.current}`, name: file.name, size: file.size, type: file.type, url, file };
      });
      setAttachments([...current, ...added]);
    };

    const removeAttachment = (attachment: PromptAttachment) => {
      if (attachment.url && ownedUrls.current.has(attachment.url)) {
        URL.revokeObjectURL(attachment.url);
        ownedUrls.current.delete(attachment.url);
      }
      setAttachments(attachmentsRef.current.filter((item) => item.id !== attachment.id));
      textareaRef.current?.focus();
    };

    const submit = () => {
      if (!ready) return;
      const message = { text: value.trim(), attachments };
      // The previews now belong to whoever shows the sent message.
      attachments.forEach((item) => item.url && ownedUrls.current.delete(item.url));
      onSubmit?.(message);
      if (valueProp === undefined) setInnerValue("");
      if (attachmentsProp === undefined) setInnerAttachments([]);
      attachmentsRef.current = attachmentsProp ?? [];
      setTyping(false);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter also confirms an IME composition (Japanese, Chinese, Korean); that must not send.
      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
      if (event.key === "Escape" && streaming) {
        event.preventDefault();
        onStop?.();
        return;
      }
      if (event.key !== "Enter") return;
      const mod = event.metaKey || event.ctrlKey;
      const sends = submitOn === "enter" ? !event.shiftKey && !mod && !event.altKey : mod;
      if (!sends) return;
      event.preventDefault();
      submit();
    };

    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 420);
    };

    const onPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (!files.length || !allowAttachments) return;
      event.preventDefault();
      addFiles(files);
    };

    const hasFiles = (event: React.DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files");

    const dropHandlers = allowAttachments
      ? {
          onDragEnter: (event: React.DragEvent<HTMLFormElement>) => {
            if (!hasFiles(event) || disabled) return;
            event.preventDefault();
            dragDepth.current += 1;
            setDragging(true);
          },
          onDragOver: (event: React.DragEvent<HTMLFormElement>) => {
            if (!hasFiles(event) || disabled) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          },
          onDragLeave: () => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragging(false);
          },
          onDrop: (event: React.DragEvent<HTMLFormElement>) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            addFiles(Array.from(event.dataTransfer.files));
            textareaRef.current?.focus();
          },
        }
      : {};

    const countId = counter ? `${id}-count` : undefined;

    return (
      <form
        style={neonVars(color, style)}
        data-typing={typing || undefined}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        onMouseDown={(event) => {
          // Clicking the padding focuses the textarea, like one big field.
          const target = event.target as HTMLElement;
          if (target === event.currentTarget || target.dataset.slot === "body") {
            event.preventDefault();
            textareaRef.current?.focus();
          }
        }}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative flex w-full cursor-text flex-col rounded-[14px] border border-white/10 bg-[#0a0c12] text-white/90",
          "shadow-[0_16px_40px_-24px_rgb(0_0_0/0.9)]",
          "transition-[border-color,box-shadow,background-color] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "hover:border-white/[0.16]",
          "focus-within:border-[rgb(var(--neon)/0.4)] focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.06),0_0_18px_-8px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1))),0_16px_40px_-24px_rgb(0_0_0/0.9)]",
          "data-[typing]:duration-100 data-[typing]:focus-within:border-[rgb(var(--neon)/0.85)]",
          "data-[typing]:focus-within:shadow-[0_0_0_1px_rgb(var(--neon)/0.28),0_0_30px_-4px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),inset_0_0_18px_-8px_rgb(var(--neon)/CALC(0.3*var(--neon-glow,1))),0_16px_40px_-24px_rgb(0_0_0/0.9)]",
          disabled && "cursor-not-allowed opacity-55 hover:border-white/10",
          className,
        )}
        {...dropHandlers}
        {...props}
      >
        <style href="nk-prompt-input" precedence="nk">{css}</style>

        {attachments.length > 0 && (
          <ul aria-label="Attachments" className="flex gap-2 overflow-x-auto px-3 pt-3 [scrollbar-width:none]">
            {attachments.map((attachment) => (
              <AttachmentChip
                key={attachment.id}
                attachment={attachment}
                disabled={disabled}
                onRemove={() => removeAttachment(attachment)}
              />
            ))}
          </ul>
        )}

        <div data-slot="body" className="flex min-w-0 px-4 pt-3">
          <textarea
            ref={textareaRef}
            name={name}
            value={value}
            rows={minRows}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={label}
            aria-describedby={countId}
            aria-invalid={over || undefined}
            autoFocus={autoFocus}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            enterKeyHint={submitOn === "enter" ? "send" : undefined}
            className={cn(
              "block w-full min-w-0 resize-none overflow-hidden bg-transparent text-[15px] leading-6 text-white/90 outline-none placeholder:text-white/50",
              "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin] disabled:cursor-not-allowed",
            )}
          />
        </div>

        <div data-slot="body" className="flex min-w-0 items-center gap-1 px-2 pb-2 pt-1.5">
          {allowAttachments && (
            <>
              <button
                type="button"
                aria-label="Attach files"
                disabled={disabled}
                onClick={() => fileRef.current?.click()}
                className={iconButton}
              >
                <Paperclip aria-hidden />
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple={maxFiles !== 1}
                accept={accept}
                tabIndex={-1}
                aria-hidden
                className="hidden"
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                  textareaRef.current?.focus();
                }}
              />
            </>
          )}
          {toolbar && <div className="flex min-w-0 items-center gap-1">{toolbar}</div>}

          <div className="ml-auto flex shrink-0 items-center gap-2.5 pl-2">
            {counter && (
              <span
                id={countId}
                className={cn(
                  "font-mono text-[11.5px] tabular-nums transition-colors duration-200",
                  over ? "text-[#ff4d5e]" : near ? "text-[#fbbf24]" : "text-white/50",
                  count === 0 && limit === undefined && "invisible",
                )}
              >
                <span aria-hidden>
                  {counter === "tokens" && limit === undefined && "≈ "}
                  {numberFormat.format(count)}
                  {limit !== undefined && <span className={over ? undefined : "text-white/35"}> / {numberFormat.format(limit)}</span>}
                  {counter === "tokens" && <span className="text-white/35"> tokens</span>}
                </span>
                <span className="sr-only">
                  {`${counter === "tokens" && limit === undefined ? "About " : ""}${numberFormat.format(count)}${limit !== undefined ? ` of ${numberFormat.format(limit)}` : ""} ${counter === "tokens" ? "tokens" : "characters"}`}
                </span>
              </span>
            )}
            {streaming ? (
              <button
                type="button"
                aria-label="Stop"
                onClick={onStop}
                disabled={disabled}
                className={cn(
                  "group/stop inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg outline-none",
                  "border border-[rgb(var(--neon)/0.55)] bg-[rgb(var(--neon)/0.08)] shadow-[0_0_16px_-4px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))),inset_0_0_10px_rgb(var(--neon)/CALC(0.12*var(--neon-glow,1)))]",
                  "transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-[rgb(var(--neon)/0.14)] active:scale-[0.94]",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c12]",
                )}
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-[2px] [background:color-mix(in_srgb,rgb(var(--neon))_60%,white)] shadow-[0_0_6px_rgb(var(--neon)/var(--neon-glow,1))]"
                />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!ready}
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg outline-none [&_svg]:size-4",
                  "transition-[background-color,color,box-shadow,transform] duration-200 ease-out",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c12]",
                  ready
                    ? cn(
                        "nk-prompt-ignite cursor-pointer bg-[rgb(var(--neon))] text-[#05060a] active:scale-[0.94]",
                        "shadow-[0_0_0_1px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)]",
                        "hover:shadow-[0_0_0_1px_rgb(var(--neon)),0_0_26px_rgb(var(--neon)/CALC(0.75*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)]",
                      )
                    : "cursor-default bg-white/[0.06] text-white/30",
                )}
              >
                <ArrowUp aria-hidden strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>

        {dragging && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center rounded-[inherit] border border-dashed border-[rgb(var(--neon)/0.7)] bg-[#0a0c12]/90 text-sm text-white/85 shadow-[inset_0_0_30px_-8px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]"
          >
            Drop to attach
          </div>
        )}
      </form>
    );
  },
);
PromptInput.displayName = "PromptInput";

function AttachmentChip({
  attachment,
  disabled,
  onRemove,
}: {
  attachment: PromptAttachment;
  disabled: boolean;
  onRemove: () => void;
}) {
  const image = !!attachment.url && !!attachment.type?.startsWith("image/");
  const remove = (
    <button
      type="button"
      aria-label={`Remove ${attachment.name}`}
      disabled={disabled}
      onClick={onRemove}
      className={cn(
        "grid size-5 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 bg-[#161a23] text-white/70 outline-none",
        "transition-[color,background-color,opacity] duration-150 hover:bg-[#1f2430] hover:text-white",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.7)]",
      )}
    >
      <X aria-hidden className="size-3" strokeWidth={2.25} />
    </button>
  );

  if (image) {
    return (
      <li className="group/chip relative shrink-0">
        <span
          role="img"
          aria-label={attachment.name}
          title={attachment.name}
          style={{ backgroundImage: `url(${JSON.stringify(attachment.url)})` }}
          className="block size-12 rounded-[10px] border border-white/10 bg-[#0d1017] bg-cover bg-center"
        />
        <span className="absolute -right-1.5 -top-1.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover/chip:opacity-100 [@media(hover:none)]:opacity-100">
          {remove}
        </span>
      </li>
    );
  }

  return (
    <li className="flex h-12 max-w-[15rem] shrink-0 items-center gap-2.5 rounded-[10px] border border-white/[0.08] bg-white/[0.03] pl-2 pr-2">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-md bg-white/[0.05] font-mono text-[10px] text-white/60"
      >
        {extension(attachment.name)}
      </span>
      <span className="grid min-w-0 leading-tight">
        <span className="truncate text-[13px] text-white/85">{attachment.name}</span>
        {attachment.size !== undefined && (
          <span className="text-[11.5px] tabular-nums text-white/50">{formatBytes(attachment.size)}</span>
        )}
      </span>
      {remove}
    </li>
  );
}

export { PromptInput };
