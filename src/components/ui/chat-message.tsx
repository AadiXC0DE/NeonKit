"use client";

import * as React from "react";
import { Pencil, RotateCcw, ThumbsDown, ThumbsUp } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { Reasoning, type ReasoningProps } from "@/components/ui/reasoning";
import { ToolCall, type ToolCallProps, type ToolCallStatus } from "@/components/ui/tool-call";

const css = `
@keyframes nk-chat-in{from{opacity:0;color:color-mix(in srgb,rgb(var(--neon)) 75%,white);text-shadow:0 0 10px rgb(var(--neon) / calc(0.7 * var(--neon-glow, 1)))}}
@keyframes nk-chat-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes nk-chat-breathe{0%,100%{opacity:.6}50%{opacity:.2}}
.nk-chat-word{animation:nk-chat-in 700ms cubic-bezier(0.23,1,0.32,1) both}
.nk-chat-pulse{animation:nk-chat-pulse 1.15s ease-in-out infinite}
.nk-chat-breathe{animation:nk-chat-breathe 2.4s cubic-bezier(0.45,0,0.55,1) infinite}
@media (prefers-reduced-motion:reduce){.nk-chat-word,.nk-chat-pulse,.nk-chat-breathe{animation:none}}
`;

function Styles() {
  return <style href="nk-chat-message" precedence="nk">{css}</style>;
}

/* ------------------------------------------------------------------------------------------------
 * Markdown-ish
 *
 * Covers what chat replies actually use: paragraphs, headings, lists (one level of nesting),
 * quotes, rules, fenced code, `code`, **bold**, *italic*, ~~strike~~ and links. Unclosed code
 * fences, backticks and bold render as formatted while a reply is still arriving.
 * ---------------------------------------------------------------------------------------------- */

type Inline =
  | { t: "text"; v: string; o: number }
  | { t: "code"; v: string; o: number }
  | { t: "strong" | "em" | "del"; c: Inline[]; o: number }
  | { t: "link"; href: string; c: Inline[]; o: number };

type ListItem = { text: string; o: number; children: { text: string; o: number }[] };

type Block =
  | { t: "p"; text: string; o: number }
  | { t: "h"; level: number; text: string; o: number }
  | { t: "quote"; text: string; o: number }
  | { t: "hr"; o: number }
  | { t: "list"; ordered: boolean; start: number; items: ListItem[]; o: number }
  | {
      t: "code";
      code: string;
      lang?: string;
      filename?: string;
      highlight?: number[];
      diff: boolean;
      o: number;
    };

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)\s*(.*)$/;
const LIST_ITEM = /^( *)([-*+]|\d{1,9}[.)])\s+(.*)$/;

function parseFenceInfo(lang: string, rest: string) {
  let filename: string | undefined;
  let highlight: number[] | undefined;
  let diff = lang === "diff";
  for (const word of rest.split(/\s+/).filter(Boolean)) {
    const lines = /^\{([\d,\s-]+)\}$/.exec(word);
    if (lines) {
      highlight = lines[1].split(",").flatMap((part) => {
        const [from, to] = part.split("-").map((n) => Number.parseInt(n, 10));
        if (Number.isNaN(from)) return [];
        if (!to || to < from) return [from];
        return Array.from({ length: to - from + 1 }, (_, k) => from + k);
      });
    } else if (word === "diff") diff = true;
    else filename = word.replace(/^(?:title|filename)=["']?|["']$/g, "");
  }
  return { lang: lang === "diff" ? undefined : lang || undefined, filename, highlight, diff };
}

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split("\n");
  let offset = 0;
  let i = 0;
  let paragraph: { text: string[]; o: number } | null = null;
  let list: Extract<Block, { t: "list" }> | null = null;

  const closeParagraph = () => {
    if (paragraph) blocks.push({ t: "p", text: paragraph.text.join("\n"), o: paragraph.o });
    paragraph = null;
  };
  const closeList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  while (i < lines.length) {
    const line = lines[i];
    const lineOffset = offset;
    offset += line.length + 1;
    i++;

    const fence = FENCE.exec(line);
    if (fence) {
      closeParagraph();
      closeList();
      const marker = fence[1];
      const body: string[] = [];
      while (i < lines.length && !lines[i].trimStart().startsWith(marker)) {
        body.push(lines[i]);
        offset += lines[i].length + 1;
        i++;
      }
      if (i < lines.length) {
        offset += lines[i].length + 1;
        i++;
      }
      blocks.push({ t: "code", code: body.join("\n"), ...parseFenceInfo(fence[2], fence[3]), o: lineOffset });
      continue;
    }

    if (!line.trim()) {
      closeParagraph();
      // A blank line inside a list keeps it open unless the next line isn't an item.
      if (list && !(i < lines.length && LIST_ITEM.test(lines[i]))) closeList();
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      closeParagraph();
      const ordered = /\d/.test(item[2]);
      const nested = item[1].length >= 2;
      const current = list as Extract<Block, { t: "list" }> | null;
      if (nested && current && current.items.length) {
        current.items[current.items.length - 1].children.push({ text: item[3], o: lineOffset + line.indexOf(item[3]) });
        continue;
      }
      if (!current || current.ordered !== ordered) {
        closeList();
        list = { t: "list", ordered, start: ordered ? Number.parseInt(item[2], 10) : 1, items: [], o: lineOffset };
      }
      (list as unknown as Extract<Block, { t: "list" }>).items.push({
        text: item[3],
        o: lineOffset + line.indexOf(item[3]),
        children: [],
      });
      continue;
    }

    const currentList = list as Extract<Block, { t: "list" }> | null;
    if (currentList && /^\s{2,}\S/.test(line)) {
      const last = currentList.items[currentList.items.length - 1];
      const target = last.children.length ? last.children[last.children.length - 1] : last;
      target.text += " " + line.trim();
      continue;
    }
    closeList();

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      closeParagraph();
      blocks.push({ t: "h", level: heading[1].length, text: heading[2], o: lineOffset + heading[1].length + 1 });
      continue;
    }
    if (/^ {0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
      closeParagraph();
      blocks.push({ t: "hr", o: lineOffset });
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      closeParagraph();
      const last = blocks[blocks.length - 1];
      if (last?.t === "quote") last.text += "\n" + quote[1];
      else blocks.push({ t: "quote", text: quote[1], o: lineOffset + line.indexOf(quote[1]) });
      continue;
    }

    if (paragraph) (paragraph as { text: string[] }).text.push(line);
    else paragraph = { text: [line], o: lineOffset };
  }
  closeParagraph();
  closeList();
  return blocks;
}

const SAFE_HREF = /^(?:https?:|mailto:|\/|#|\.)/i;

function parseInline(src: string, base: number): Inline[] {
  const out: Inline[] = [];
  const n = src.length;
  let i = 0;
  let textStart = 0;
  const flush = (end: number) => {
    if (end > textStart) out.push({ t: "text", v: src.slice(textStart, end), o: base + textStart });
  };

  while (i < n) {
    const ch = src[i];

    if (ch === "\\" && /[\\`*_~[\]()#+\-.!>]/.test(src[i + 1] ?? "")) {
      flush(i);
      out.push({ t: "text", v: src[i + 1], o: base + i + 1 });
      i += 2;
      textStart = i;
      continue;
    }

    if (ch === "`") {
      let ticks = 1;
      while (src[i + ticks] === "`") ticks++;
      const marker = "`".repeat(ticks);
      const close = src.indexOf(marker, i + ticks);
      flush(i);
      const end = close < 0 ? n : close;
      out.push({ t: "code", v: src.slice(i + ticks, end).replace(/^ (.+) $/, "$1"), o: base + i });
      i = close < 0 ? n : close + ticks;
      textStart = i;
      continue;
    }

    if ((ch === "*" || ch === "_" || ch === "~") && src[i + 1] === ch && src[i + 2] && src[i + 2] !== " ") {
      const marker = ch + ch;
      const close = src.indexOf(marker, i + 2);
      if (close > i + 2 || (close < 0 && ch !== "_")) {
        flush(i);
        const end = close < 0 ? n : close;
        out.push({ t: ch === "~" ? "del" : "strong", c: parseInline(src.slice(i + 2, end), base + i + 2), o: base + i });
        i = close < 0 ? n : close + 2;
        textStart = i;
        continue;
      }
    }

    if ((ch === "*" || ch === "_") && src[i + 1] && src[i + 1] !== " " && src[i + 1] !== ch && !/\w/.test(src[i - 1] ?? "")) {
      let close = i + 1;
      while (close < n) {
        close = src.indexOf(ch, close);
        if (close < 0) break;
        if (src[close - 1] !== " " && src[close + 1] !== ch && !/\w/.test(src[close + 1] ?? "")) break;
        close++;
      }
      if (close > i + 1) {
        flush(i);
        out.push({ t: "em", c: parseInline(src.slice(i + 1, close), base + i + 1), o: base + i });
        i = close + 1;
        textStart = i;
        continue;
      }
    }

    if (ch === "[") {
      const link = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(src.slice(i));
      if (link && SAFE_HREF.test(link[2])) {
        flush(i);
        out.push({ t: "link", href: link[2], c: parseInline(link[1], base + i + 1), o: base + i });
        i += link[0].length;
        textStart = i;
        continue;
      }
    }

    if (ch === "h" && (i === 0 || /\s|\(/.test(src[i - 1]))) {
      const url = /^https?:\/\/[^\s<>()]+[^\s<>().,:;!?"']/.exec(src.slice(i));
      if (url) {
        flush(i);
        out.push({ t: "link", href: url[0], c: [{ t: "text", v: url[0], o: base + i }], o: base + i });
        i += url[0].length;
        textStart = i;
        continue;
      }
    }

    i++;
  }
  flush(n);
  return out;
}

function Caret() {
  return (
    <span
      aria-hidden
      data-slot="caret"
      className={cn(
        "nk-chat-pulse ml-[3px] inline-block h-[3px] w-[0.75em] rounded-full align-baseline",
        "[background:color-mix(in_srgb,rgb(var(--neon))_55%,white)]",
        "shadow-[0_0_3px_rgb(var(--neon)/var(--neon-glow,1)),0_0_10px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))),0_0_22px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1)))]",
      )}
    />
  );
}

function Words({ text, offset, animate }: { text: string; offset: number; animate: boolean }) {
  if (!animate) return <>{text}</>;
  // Each word keeps its key (its offset in the reply), so words already on screen don't replay.
  const parts = text.split(/(?<=\s)(?=\S)/);
  const starts = parts.reduce<number[]>((list, part, index) => {
    list.push(index === 0 ? offset : list[index - 1] + parts[index - 1].length);
    return list;
  }, []);
  return (
    <>
      {parts.map((part, index) => (
        <span key={starts[index]} className="nk-chat-word">
          {part}
        </span>
      ))}
    </>
  );
}

function renderInline(nodes: Inline[], animate: boolean): React.ReactNode {
  return nodes.map((node) => {
    switch (node.t) {
      case "text":
        return <Words key={node.o} text={node.v} offset={node.o} animate={animate} />;
      case "code":
        return (
          <code
            key={node.o}
            className="rounded-[5px] bg-white/[0.07] px-[0.38em] py-[0.12em] font-mono text-[0.86em] text-white/90 [overflow-wrap:anywhere] [box-decoration-break:clone]"
          >
            {node.v}
          </code>
        );
      case "strong":
        return (
          <strong key={node.o} className="font-semibold text-white">
            {renderInline(node.c, animate)}
          </strong>
        );
      case "em":
        return (
          <em key={node.o} className="italic">
            {renderInline(node.c, animate)}
          </em>
        );
      case "del":
        return (
          <del key={node.o} className="text-white/55">
            {renderInline(node.c, animate)}
          </del>
        );
      case "link": {
        const external = /^https?:/i.test(node.href);
        return (
          <a
            key={node.o}
            href={node.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer noopener" : undefined}
            className={cn(
              "rounded-[3px] text-[rgb(var(--neon))] underline decoration-[rgb(var(--neon)/0.4)] underline-offset-[3px] outline-none",
              "transition-[text-decoration-color,text-shadow] duration-150 hover:decoration-[rgb(var(--neon))] hover:[text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]",
              "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
            )}
          >
            {renderInline(node.c, animate)}
          </a>
        );
      }
    }
  });
}

function InlineText({ text, offset, animate, caret }: { text: string; offset: number; animate: boolean; caret: boolean }) {
  const nodes = React.useMemo(() => parseInline(text, offset), [text, offset]);
  return (
    <>
      {renderInline(nodes, animate)}
      {caret && <Caret />}
    </>
  );
}

const SHELL = new Set(["sh", "bash", "zsh", "shell", "console", "terminal"]);

export interface ChatMarkdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "color"> {
  /** The reply text, as it has arrived so far. */
  children: string;
  /** Shows the caret at the end and fades new words in. */
  streaming?: boolean;
  /** Code blocks taller than this scroll. */
  codeMaxHeight?: number;
  color?: NeonColor;
}

const ChatMarkdown = React.forwardRef<HTMLDivElement, ChatMarkdownProps>(
  ({ children, streaming = false, codeMaxHeight = 420, className, style, color, ...props }, ref) => {
    const blocks = React.useMemo(() => parseBlocks(children ?? ""), [children]);
    const lastIndex = blocks.length - 1;
    const endsInCode = blocks[lastIndex]?.t === "code" || blocks[lastIndex]?.t === "hr";

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "min-w-0 text-[15px] leading-[1.65] text-white/[0.86] [overflow-wrap:break-word]",
          "[&>*+*]:mt-3.5",
          className,
        )}
        {...props}
      >
        <Styles />
        {blocks.map((block, index) => {
          const caret = streaming && index === lastIndex;
          switch (block.t) {
            case "p":
              return (
                <p key={index} className="whitespace-pre-line">
                  <InlineText text={block.text} offset={block.o} animate={streaming} caret={caret} />
                </p>
              );
            case "h": {
              const Tag = block.level <= 2 ? "h3" : "h4";
              return (
                <Tag
                  key={index}
                  className={cn(
                    "font-semibold tracking-[-0.01em] text-white [&+*]:!mt-2",
                    block.level <= 2 ? "pt-1 text-[17px]" : "pt-0.5 text-[15px]",
                  )}
                >
                  <InlineText text={block.text} offset={block.o} animate={streaming} caret={caret} />
                </Tag>
              );
            }
            case "quote":
              return (
                <blockquote key={index} className="whitespace-pre-line border-l-2 border-white/15 pl-4 text-white/65">
                  <InlineText text={block.text} offset={block.o} animate={streaming} caret={caret} />
                </blockquote>
              );
            case "hr":
              return <hr key={index} className="border-0 border-t border-white/10" />;
            case "list": {
              const Tag = block.ordered ? "ol" : "ul";
              return (
                <Tag key={index} start={block.ordered && block.start !== 1 ? block.start : undefined} className="grid gap-1.5">
                  {block.items.map((item, k) => {
                    const lastItem = caret && k === block.items.length - 1;
                    return (
                      <li key={k} className="relative pl-6">
                        <ListMarker ordered={block.ordered} index={block.start + k} />
                        <InlineText
                          text={item.text}
                          offset={item.o}
                          animate={streaming}
                          caret={lastItem && item.children.length === 0}
                        />
                        {item.children.length > 0 && (
                          <ul className="mt-1.5 grid gap-1.5">
                            {item.children.map((child, c) => (
                              <li key={c} className="relative pl-5 text-white/75">
                                <span aria-hidden className="absolute left-0.5 top-[11px] h-[2px] w-1.5 rounded-full bg-white/20" />
                                <InlineText
                                  text={child.text}
                                  offset={child.o}
                                  animate={streaming}
                                  caret={lastItem && c === item.children.length - 1}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </Tag>
              );
            }
            case "code": {
              const lines = block.code.split("\n").length;
              return (
                <CodeBlock
                  key={index}
                  code={block.code}
                  language={block.lang}
                  filename={block.filename}
                  highlight={block.highlight}
                  diff={block.diff}
                  lineNumbers={lines > 1 && !SHELL.has(block.lang ?? "")}
                  maxHeight={codeMaxHeight}
                  className="!mt-4 [&+*]:!mt-4"
                />
              );
            }
          }
        })}
        {streaming && (endsInCode || blocks.length === 0) && (
          <p className={blocks.length === 0 ? undefined : "!mt-2"}>
            <Caret />
          </p>
        )}
      </div>
    );
  },
);
ChatMarkdown.displayName = "ChatMarkdown";

function ListMarker({ ordered, index }: { ordered: boolean; index: number }) {
  if (ordered) {
    return (
      <span aria-hidden className="absolute left-0 top-0 w-5 text-right text-[13px] tabular-nums text-white/50">
        {index}.
      </span>
    );
  }
  // Snapped to whole pixels: a hairline at a fractional offset renders at a different weight per row.
  return <span aria-hidden className="absolute left-1.5 top-[11px] h-[2px] w-2 rounded-full bg-white/30" />;
}

/* ------------------------------------------------------------------------------------------------
 * Reasoning and tool calls: the standalone components, with the defaults a chat reply wants.
 * ---------------------------------------------------------------------------------------------- */

export interface ChatReasoningProps extends Omit<ReasoningProps, "followStreaming"> {
  /** Open while thinking and fold away after, unless toggled by hand. On by default here. */
  followStreaming?: boolean;
}

/** Reasoning that opens while it thinks and folds itself away when done. */
const ChatReasoning = React.forwardRef<HTMLDivElement, ChatReasoningProps>(({ followStreaming = true, ...props }, ref) => (
  <Reasoning ref={ref} followStreaming={followStreaming} {...props} />
));
ChatReasoning.displayName = "ChatReasoning";

export type ChatToolStatus = "pending" | "running" | "done" | "error" | ToolCallStatus;

export interface ChatToolCallProps extends Omit<ToolCallProps, "status"> {
  status?: ChatToolStatus;
}

function summarizeArgs(args: ToolCallProps["args"]) {
  if (args === undefined || args === null) return undefined;
  if (typeof args === "string") return args;
  return Object.entries(args)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(", ");
}

/** A ToolCall whose one-line summary always spells out key: value pairs. */
const ChatToolCall = React.forwardRef<HTMLDivElement, ChatToolCallProps>(({ args, summary, ...props }, ref) => (
  <ToolCall ref={ref} args={args} summary={summary ?? summarizeArgs(args)} {...props} />
));
ChatToolCall.displayName = "ChatToolCall";

/* ------------------------------------------------------------------------------------------------
 * Attachments
 * ---------------------------------------------------------------------------------------------- */

export interface ChatAttachmentItem {
  name: string;
  /** Bytes. */
  size?: number;
  /** MIME type. `image/*` with a `url` shows a thumbnail. */
  type?: string;
  url?: string;
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

export interface ChatAttachmentsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: ChatAttachmentItem[];
}

const ChatAttachments = React.forwardRef<HTMLUListElement, ChatAttachmentsProps>(({ items, className, ...props }, ref) => {
  if (!items.length) return null;
  return (
    <ul ref={ref} aria-label="Attachments" className={cn("flex flex-wrap gap-2", className)} {...props}>
      {items.map((item, index) => {
        const image = item.url && item.type?.startsWith("image/");
        const meta = [extension(item.name).toUpperCase(), formatBytes(item.size)].filter(Boolean).join(" · ");
        if (image) {
          return (
            <li key={index} className="min-w-0">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group/img block overflow-hidden rounded-[10px] border border-white/10 outline-none transition-[border-color] duration-150 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                <span
                  role="img"
                  aria-label={item.name}
                  style={{ backgroundImage: `url(${JSON.stringify(item.url)})` }}
                  className="block h-28 w-40 bg-[#0d1017] bg-cover bg-center"
                />
              </a>
            </li>
          );
        }
        return (
          <li
            key={index}
            className="flex h-11 min-w-0 max-w-[16rem] items-center gap-2.5 rounded-[10px] border border-white/[0.08] bg-white/[0.03] pl-1.5 pr-3"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/[0.05] font-mono text-[10px] text-white/60"
            >
              {extension(item.name)}
            </span>
            <span className="grid min-w-0 leading-tight">
              <span className="truncate text-[13px] text-white/85">{item.name}</span>
              {meta && <span className="truncate text-[11.5px] tabular-nums text-white/50">{meta}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
});
ChatAttachments.displayName = "ChatAttachments";

/* ------------------------------------------------------------------------------------------------
 * Message
 * ---------------------------------------------------------------------------------------------- */

export type ChatFeedback = "up" | "down" | null;

function initials(name: React.ReactNode) {
  if (typeof name !== "string") return "";
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();
}

/**
 * The default mark for replies: a small ring of tube with a blackout gap where its electrodes
 * would leave it. Dim at rest; while the reply is live it is lit and its halo breathes. It never
 * spins: a spinning ring is a loader, and this is a lamp.
 */
function ReplyMark({ live }: { live: boolean }) {
  return (
    <span aria-hidden className="grid size-7 place-items-center">
      <svg viewBox="0 0 20 20" fill="none" className="size-5 overflow-visible">
        <circle
          cx="10"
          cy="10"
          r="7"
          strokeWidth="4.5"
          strokeLinecap="round"
          transform="rotate(-62 10 10)"
          strokeDasharray="38 6"
          className={cn(
            "stroke-[rgb(var(--neon))] [filter:blur(2.5px)_opacity(var(--neon-glow,1))] transition-opacity duration-500",
            live ? "nk-chat-breathe opacity-60" : "opacity-0",
          )}
        />
        <circle
          cx="10"
          cy="10"
          r="7"
          strokeWidth="2.25"
          strokeLinecap="round"
          transform="rotate(-62 10 10)"
          strokeDasharray="38 6"
          className={cn(
            "transition-[stroke] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            live
              ? "stroke-[color-mix(in_srgb,rgb(var(--neon))_55%,white)]"
              : "stroke-[color-mix(in_srgb,rgb(var(--neon))_30%,#4a5163)]",
          )}
        />
      </svg>
    </span>
  );
}

function UserMark({ name }: { name: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="grid size-7 place-items-center rounded-full bg-white/[0.07] text-[11px] font-medium text-white/75 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
    >
      {initials(name) || "Y"}
    </span>
  );
}

const actionButton = cn(
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/50 outline-none",
  "transition-[background-color,color,filter,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.94]",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
  "[&_svg]:size-3.5",
);

const pressedAction =
  "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))))] hover:text-[rgb(var(--neon))]";

export interface ChatMessageProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Who sent it. System messages render as a centered note. */
  from: "user" | "assistant" | "system";
  /** Shown above flat messages and used as the accessible name. */
  name?: React.ReactNode;
  /** Replaces the default mark. Pass `null` for none. */
  avatar?: React.ReactNode;
  /** Shown next to the name, e.g. "14:02". */
  time?: React.ReactNode;
  /** Machine-readable time for the `<time>` element. */
  dateTime?: string;
  /** Flat rows with marks and names, or user bubbles on the right. */
  layout?: "flat" | "bubble";
  /** Markdown-ish text, rendered after any children (reasoning, tool calls). */
  content?: string;
  /** The reply is still arriving: caret, fresh-word fade, lit mark, hidden actions. */
  streaming?: boolean;
  attachments?: ChatAttachmentItem[];
  /** Shown under the content in red, with Try again if `onRetry` is set. */
  error?: React.ReactNode;
  /** When the action row shows. */
  actions?: "hover" | "always" | "none";
  /** Text for the copy action. Defaults to `content`. */
  copyText?: string;
  onRetry?: () => void;
  /** Adds Edit to your own messages. It opens an inline editor and calls this with the saved text. */
  onEdit?: (text: string) => void;
  /** Controlled thumbs. Shown on replies when either feedback prop is set. */
  feedback?: ChatFeedback;
  defaultFeedback?: ChatFeedback;
  onFeedbackChange?: (feedback: ChatFeedback) => void;
  /** More buttons for the action row. */
  extraActions?: React.ReactNode;
  color?: NeonColor;
}

function MessageEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = React.useState(initial);
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [draft]);

  React.useEffect(() => {
    const el = ref.current;
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const save = () => {
    const text = draft.trim();
    if (text) onSave(text);
  };

  return (
    <div className="grid w-full gap-2">
      <textarea
        ref={ref}
        value={draft}
        aria-label="Edit message"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            save();
          }
        }}
        className={cn(
          "block w-full resize-none rounded-[12px] border border-[rgb(var(--neon)/0.5)] bg-[#0a0c12] px-3.5 py-2.5 text-[15px] leading-[1.6] text-white/90 outline-none",
          "shadow-[0_0_0_1px_rgb(var(--neon)/0.12),0_0_22px_-8px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))] [scrollbar-width:thin]",
        )}
      />
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white/70 outline-none transition-colors hover:bg-white/[0.06] hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!draft.trim()}
          className={cn(
            "h-8 cursor-pointer rounded-lg bg-[rgb(var(--neon))] px-3 text-[13px] font-semibold text-[#05060a] outline-none transition-[box-shadow,opacity,transform] active:scale-[0.97]",
            "shadow-[0_0_0_1px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            "disabled:cursor-default disabled:opacity-40",
          )}
        >
          Save
        </button>
      </div>
    </div>
  );
}

const ChatMessage = React.forwardRef<HTMLElement, ChatMessageProps>(
  (
    {
      from,
      name,
      avatar,
      time,
      dateTime,
      layout = "flat",
      content,
      streaming = false,
      attachments,
      error,
      actions = "hover",
      copyText,
      onRetry,
      onEdit,
      feedback: feedbackProp,
      defaultFeedback,
      onFeedbackChange,
      extraActions,
      className,
      style,
      color,
      children,
      ...props
    },
    ref,
  ) => {
    const nameId = React.useId();
    const editButton = React.useRef<HTMLButtonElement>(null);
    const [editing, setEditing] = React.useState(false);
    const [innerFeedback, setInnerFeedback] = React.useState<ChatFeedback>(defaultFeedback ?? null);
    const feedback = feedbackProp !== undefined ? feedbackProp : innerFeedback;
    const showFeedback =
      from === "assistant" && (feedbackProp !== undefined || defaultFeedback !== undefined || !!onFeedbackChange);

    const setFeedback = (next: ChatFeedback) => {
      const value = feedback === next ? null : next;
      if (feedbackProp === undefined) setInnerFeedback(value);
      onFeedbackChange?.(value);
    };

    const closeEditor = () => {
      setEditing(false);
      requestAnimationFrame(() => editButton.current?.focus());
    };

    const isUser = from === "user";
    const bubble = layout === "bubble" && isUser;
    const displayName = name ?? (isUser ? "You" : from === "assistant" ? undefined : "System");
    const text = copyText ?? content;
    const canEdit = isUser && !!onEdit && typeof content === "string";

    if (from === "system") {
      return (
        <article
          ref={ref}
          style={neonVars(color, style)}
          data-from="system"
          aria-label={typeof displayName === "string" ? displayName : "System"}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "flex justify-center py-1 text-center text-[13px] leading-5 text-white/55",
            className,
          )}
          {...props}
        >
          <p className="max-w-[min(32rem,90%)] text-balance">
            {content ?? children}
            {time && (
              <>
                <span aria-hidden className="text-white/30"> · </span>
                <time dateTime={dateTime} className="tabular-nums text-white/50">
                  {time}
                </time>
              </>
            )}
          </p>
        </article>
      );
    }

    const hasActions =
      actions !== "none" && !streaming && !editing && (!!text || (!!onRetry && !error) || canEdit || showFeedback || !!extraActions);
    // Your own flat messages keep their actions in the name row, so hidden actions don't leave a gap.
    const inMeta = isUser && !bubble;

    const actionRow = hasActions && (
      <div
        role="toolbar"
        aria-label="Message actions"
        className={cn(
          "flex items-center gap-0.5 transition-opacity duration-150",
          !bubble && !inMeta && "-ml-1.5",
          actions === "hover" &&
            "opacity-0 group-hover/message:opacity-100 group-focus-within/message:opacity-100 [@media(hover:none)]:opacity-100",
        )}
      >
        {text && (
          <CopyButton
            value={text}
            size="sm"
            bubble={false}
            aria-label="Copy message"
            className="size-7 text-white/50 [&>span]:size-3.5"
          />
        )}
        {canEdit && (
          <button ref={editButton} type="button" aria-label="Edit message" onClick={() => setEditing(true)} className={actionButton}>
            <Pencil aria-hidden />
          </button>
        )}
        {!isUser && onRetry && !error && (
          <button type="button" aria-label="Retry" onClick={onRetry} className={actionButton}>
            <RotateCcw aria-hidden />
          </button>
        )}
        {showFeedback && (
          <>
            <button
              type="button"
              aria-label="Good response"
              aria-pressed={feedback === "up"}
              onClick={() => setFeedback("up")}
              className={cn(actionButton, feedback === "up" && pressedAction)}
            >
              <ThumbsUp aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Bad response"
              aria-pressed={feedback === "down"}
              onClick={() => setFeedback("down")}
              className={cn(actionButton, feedback === "down" && pressedAction)}
            >
              <ThumbsDown aria-hidden />
            </button>
          </>
        )}
        {extraActions}
      </div>
    );

    const errorRow = error && (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] border border-[rgb(255_77_94/0.25)] bg-[rgb(255_77_94/0.06)] py-1.5 pl-3 pr-1.5 text-[13px] leading-5 text-[rgb(255_150_160)]"
      >
        <span className="min-w-0 flex-1 py-0.5">{error}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 font-medium text-white/85 outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[rgb(255_77_94/0.6)]"
          >
            <RotateCcw aria-hidden className="size-3.5" />
            Try again
          </button>
        )}
      </div>
    );

    const attachmentRow = attachments && attachments.length > 0 && (
      <ChatAttachments items={attachments} className={bubble ? "justify-end" : undefined} />
    );

    const editor = editing && canEdit && (
      <MessageEditor
        initial={content ?? ""}
        onCancel={closeEditor}
        onSave={(next) => {
          onEdit?.(next);
          closeEditor();
        }}
      />
    );

    const body = (
      <>
        {children}
        {content !== undefined && (content || streaming) && <ChatMarkdown streaming={streaming}>{content}</ChatMarkdown>}
        {!content && streaming && !children && <ChatMarkdown streaming>{""}</ChatMarkdown>}
      </>
    );

    if (bubble) {
      return (
        <article
          ref={ref}
          style={neonVars(color, style)}
          data-from={from}
          aria-labelledby={nameId}
          aria-busy={streaming || undefined}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/message ml-auto flex min-w-0 flex-col items-end gap-1.5",
            editing ? "w-full max-w-[38rem]" : "w-fit max-w-[min(85%,38rem)]",
            className,
          )}
          {...props}
        >
          <Styles />
          <span id={nameId} className="sr-only">
            {displayName}
          </span>
          {attachmentRow}
          {editor || (
            <div className="min-w-0 max-w-full rounded-[18px] rounded-br-md border border-white/[0.07] bg-[#12151d] px-4 py-2.5 [&_.nk-code]:my-1">
              {body}
            </div>
          )}
          {errorRow}
          {(time || hasActions) && !editing && (
            <div className="-mt-0.5 flex items-center gap-1.5">
              {actionRow}
              {time && (
                <time dateTime={dateTime} className="px-1 text-xs tabular-nums text-[#8a93a6]">
                  {time}
                </time>
              )}
            </div>
          )}
        </article>
      );
    }

    const mark =
      avatar !== undefined ? avatar : isUser ? <UserMark name={displayName} /> : <ReplyMark live={streaming} />;

    return (
      <article
        ref={ref}
        style={neonVars(color, style)}
        data-from={from}
        aria-labelledby={displayName ? nameId : undefined}
        aria-label={displayName ? undefined : "Reply"}
        aria-busy={streaming || undefined}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "group/message grid min-w-0 gap-x-3.5",
          mark ? "grid-cols-[28px_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)]",
          className,
        )}
        {...props}
      >
        <Styles />
        {mark && <div className="row-span-2">{mark}</div>}
        <div className="flex min-h-7 min-w-0 items-center gap-2">
          {displayName && (
            <span id={nameId} className="truncate text-sm font-medium text-white/90">
              {displayName}
            </span>
          )}
          {time && (
            <time dateTime={dateTime} className="shrink-0 text-xs tabular-nums text-[#8a93a6]">
              {time}
            </time>
          )}
          {inMeta && actionRow && <div className="-my-1 ml-auto">{actionRow}</div>}
        </div>
        <div className="flex min-w-0 flex-col gap-3 pt-1">
          {isUser && attachmentRow}
          {editor || body}
          {!isUser && attachmentRow}
          {errorRow}
          {!inMeta && actionRow && <div className="-mt-1">{actionRow}</div>}
        </div>
      </article>
    );
  },
);
ChatMessage.displayName = "ChatMessage";

export { ChatMessage, ChatMarkdown, ChatReasoning, ChatToolCall, ChatAttachments };
