"use client";

import * as React from "react";
import { ChevronDown } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import { CodeBlock } from "@/components/ui/code-block";

// Running blinks like a drive-activity LED: hard on, quick off, never on a regular beat.
// Waiting for approval breathes slowly in amber, like a lamp asking for a hand on a switch.
const css = `
@keyframes nk-tool-activity{0%{opacity:1}6%{opacity:.25}9%{opacity:1}31%{opacity:1}33%{opacity:.35}35%{opacity:1}38%{opacity:.3}41%{opacity:1}67%{opacity:1}70%{opacity:.2}74%{opacity:1}}
@keyframes nk-tool-breathe{0%,100%{opacity:1}50%{opacity:.35}}
.nk-tool-activity{animation:nk-tool-activity 1.9s steps(1,end) infinite}
.nk-tool-breathe{animation:nk-tool-breathe 2.4s cubic-bezier(0.45,0,0.55,1) infinite}
@media (prefers-reduced-motion:reduce){.nk-tool-activity,.nk-tool-breathe{animation:none}}
`;

export type ToolCallStatus = "pending" | "approval" | "running" | "success" | "error" | "denied";

const AMBER = "251 191 36";
const RED = "255 77 94";

const statusWords: Record<ToolCallStatus, string> = {
  pending: "Queued",
  approval: "Needs approval",
  running: "Running",
  success: "Done",
  error: "Failed",
  denied: "Denied",
};

/* ------------------------------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------------------------- */

function useElapsed(running: boolean) {
  const [elapsed, setElapsed] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const tick = () => setElapsed((performance.now() - start) / 1000);
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [running]);
  return elapsed;
}

/** 0.4s, 1.4s, 14s, 1m 04s. */
function formatDuration(seconds: number) {
  if (seconds < 10) return `${Math.max(0.1, seconds).toFixed(1)}s`;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  return `${m}m ${String(Math.round(seconds % 60)).padStart(2, "0")}s`;
}

function formatValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  return JSON.stringify(value);
}

/** One string argument reads as itself; several read as key: value pairs. */
function summarizeArgs(args: ToolCallProps["args"]) {
  if (args === undefined || args === null) return "";
  if (typeof args === "string") return args.split("\n")[0];
  const entries = Object.entries(args);
  if (entries.length === 1 && typeof entries[0][1] === "string") return (entries[0][1] as string).split("\n")[0];
  return entries.map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("  ");
}

/* ------------------------------------------------------------------------------------------------
 * Lamp
 * ---------------------------------------------------------------------------------------------- */

function Lamp({ status }: { status: ToolCallStatus }) {
  const lit = status !== "pending" && status !== "denied";
  const tint = status === "approval" ? AMBER : status === "error" ? RED : undefined;
  return (
    <span
      aria-hidden
      data-slot="lamp"
      style={tint ? ({ "--neon": tint } as React.CSSProperties) : undefined}
      className="relative grid size-4 shrink-0 place-items-center"
    >
      {/* The unlit lens is always there, so a lamp turning on reads as light, not as a new dot. */}
      <span className="absolute size-2 rounded-full bg-[rgb(var(--neon)/0.14)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.16),inset_0_1px_1px_rgb(0_0_0/0.6)]" />
      {status === "denied" && <span className="absolute h-px w-2 rotate-[-40deg] rounded-full bg-white/40" />}
      {lit && (
        <span
          className={cn(
            "absolute size-2 rounded-full transition-[opacity,box-shadow] duration-300",
            "[background:radial-gradient(circle_at_42%_38%,#fff_0_12%,color-mix(in_srgb,rgb(var(--neon))_45%,white)_34%,rgb(var(--neon))_74%)]",
            status === "success"
              ? "opacity-75 shadow-[0_0_3px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]"
              : "shadow-[0_0_3px_rgb(var(--neon)/var(--neon-glow,1)),0_0_9px_rgb(var(--neon)/CALC(0.65*var(--neon-glow,1))),0_0_18px_rgb(var(--neon)/CALC(0.3*var(--neon-glow,1)))]",
            status === "running" && "nk-tool-activity",
            status === "approval" && "nk-tool-breathe",
          )}
        />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Group: rows share one panel, like lines in a log
 * ---------------------------------------------------------------------------------------------- */

const GroupContext = React.createContext(false);

export interface ToolCallGroupProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "color"> {
  /** Accessible name for the list. */
  label?: string;
  color?: NeonColor;
}

const ToolCallGroup = React.forwardRef<HTMLOListElement, ToolCallGroupProps>(
  ({ label = "Tool calls", className, style, color, children, ...props }, ref) => (
    <GroupContext.Provider value>
      <ol
        ref={ref}
        aria-label={label}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "min-w-0 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]",
          className,
        )}
        {...props}
      >
        {React.Children.toArray(children).map((child, index) => (
          <li key={React.isValidElement(child) && child.key != null ? child.key : index} className="min-w-0">
            {child}
          </li>
        ))}
      </ol>
    </GroupContext.Provider>
  ),
);
ToolCallGroup.displayName = "ToolCallGroup";

/* ------------------------------------------------------------------------------------------------
 * Tool call
 * ---------------------------------------------------------------------------------------------- */

export interface ToolCallProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onToggle" | "title"> {
  /** The tool's name, shown in mono. */
  name: string;
  /** Arguments: an object (a key/value list when open) or a preformatted string. */
  args?: Record<string, unknown> | string;
  /** Replaces the one-line argument summary, e.g. the command itself. */
  summary?: React.ReactNode;
  /** `"done"` is accepted as `"success"`. */
  status?: ToolCallStatus | "done";
  /** Shown when open. Strings render as code. */
  result?: React.ReactNode;
  /** Language for a string result. */
  resultLanguage?: string;
  /** Shown under the row on failure. */
  error?: React.ReactNode;
  /** Seconds it took. While running, a live timer counts up when this is omitted. */
  duration?: number;
  /** Replaces the duration on the right, e.g. "14 passed" or "exit 1". */
  meta?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Shown with status "approval": what running it will do. */
  approvalNote?: React.ReactNode;
  onApprove?: () => void;
  onDeny?: () => void;
  approveLabel?: string;
  denyLabel?: string;
  /** Extra detail inside the panel, before the result: a diff preview, a table. */
  children?: React.ReactNode;
  color?: NeonColor;
}

const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(
  (
    {
      name,
      args,
      summary,
      status: statusProp = "success",
      result,
      resultLanguage,
      error,
      duration,
      meta,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      approvalNote,
      onApprove,
      onDeny,
      approveLabel = "Approve",
      denyLabel = "Deny",
      className,
      style,
      color,
      children,
      ...props
    },
    ref,
  ) => {
    const grouped = React.useContext(GroupContext);
    const id = React.useId();
    const status: ToolCallStatus = statusProp === "done" ? "success" : statusProp;
    const asking = status === "approval";
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = asking || (openProp ?? innerOpen);
    const elapsed = useElapsed(status === "running" && duration === undefined);
    const [announcement, setAnnouncement] = React.useState("");
    const [prevStatus, setPrevStatus] = React.useState(status);

    // Announce transitions only, never the ticking timer.
    if (prevStatus !== status) {
      setPrevStatus(status);
      setAnnouncement(`${name}: ${statusWords[status]}`);
    }

    const hasArgs = args !== undefined && (typeof args === "string" ? args.length > 0 : Object.keys(args).length > 0);
    const expandable = hasArgs || result !== undefined || children != null;
    const line = summary ?? summarizeArgs(args);

    const toggle = () => {
      if (openProp === undefined) setInnerOpen(!open);
      onOpenChange?.(!open);
    };

    // Values (a time, a count, an exit code) read in mono; status words stay in the UI face.
    const value =
      meta !== undefined
        ? meta
        : status === "running"
          ? duration !== undefined
            ? formatDuration(duration)
            : elapsed !== null
              ? `${elapsed.toFixed(1)}s`
              : null
          : (status === "success" || status === "error") && duration !== undefined
            ? formatDuration(duration)
            : null;
    const readout = value ?? statusWords[status];

    const header = (
      <>
        <span className="flex h-5 shrink-0 items-center">
          <Lamp status={status} />
        </span>
        {/*
          w-0: a long summary never widens the row's min-content, it truncates. When fewer than
          about fourteen characters of it would fit beside the name, it wraps to its own line instead.
        */}
        <span className="flex w-0 min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 font-mono text-[12.5px] leading-5">
          <span
            className={cn(
              "shrink-0 transition-colors duration-300",
              status === "pending" || status === "denied" ? "text-white/55" : "text-white/90",
            )}
          >
            {name}
          </span>
          {line && <span className="min-w-[14ch] flex-1 basis-0 truncate text-white/45">{line}</span>}
        </span>
        <span
          className={cn(
            "shrink-0 text-xs leading-5 tabular-nums transition-colors duration-300",
            value !== null && "font-mono",
            status === "running"
              ? "text-[color-mix(in_srgb,rgb(var(--neon))_50%,white)] [text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]"
              : status === "error"
                ? "text-[rgb(255_120_134)]"
                : status === "approval"
                  ? "text-[rgb(251_191_36)]"
                  : status === "success"
                    ? "text-white/50"
                    : "text-white/45",
          )}
        >
          {readout}
        </span>
        {/* The slot stays when there's no chevron, so readouts line up down a log. */}
        <span aria-hidden className="-mr-0.5 flex h-5 w-3.5 shrink-0 items-center">
          {expandable && !asking && (
            <ChevronDown
              className={cn(
                "size-3.5 text-white/40 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          )}
        </span>
        {/* The readout already says the state when it isn't showing a value. */}
        {value !== null && <span className="sr-only">, {statusWords[status]}</span>}
      </>
    );

    const rowClass = "flex min-h-10 w-full min-w-0 items-start gap-2.5 py-2.5 pl-2.5 pr-3 text-left";

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        data-status={status}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative min-w-0 transition-[border-color,box-shadow,background-color] duration-300",
          !grouped && "overflow-hidden rounded-xl border bg-white/[0.02]",
          !grouped &&
            (status === "running"
              ? "border-[rgb(var(--neon)/0.28)] shadow-[0_0_24px_-12px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]"
              : asking
                ? "border-[rgb(251_191_36/0.3)]"
                : status === "error"
                  ? "border-[rgb(255_77_94/0.28)]"
                  : "border-white/[0.08]"),
          grouped && status === "running" && "bg-[rgb(var(--neon)/0.025)]",
          grouped && asking && "bg-[rgb(251_191_36/0.025)]",
          className,
        )}
        {...props}
      >
        <style href="nk-tool-call" precedence="nk">
          {css}
        </style>
        {expandable && !asking ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-detail`}
            onClick={toggle}
            className={cn(
              rowClass,
              "cursor-pointer outline-none transition-colors duration-150 hover:bg-white/[0.025]",
              "focus-visible:bg-white/[0.03] focus-visible:shadow-[inset_0_0_0_1.5px_rgb(var(--neon)/0.6)]",
            )}
          >
            {header}
          </button>
        ) : (
          <div className={rowClass}>{header}</div>
        )}

        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>

        {error && status === "error" && (
          <p className="border-t border-[rgb(255_77_94/0.14)] py-2 pl-3 pr-3 text-[13px] leading-5 text-[rgb(255_150_160)] sm:pl-9">
            {error}
          </p>
        )}

        {expandable && (
          <div
            id={`${id}-detail`}
            className={cn(
              "grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 border-t border-white/[0.06] py-3 pl-3 pr-3 sm:pl-9">
                {hasArgs && (
                  <Detail label="Arguments">
                    {typeof args === "string" ? <Code code={args} /> : <ArgList args={args as Record<string, unknown>} />}
                  </Detail>
                )}
                {children}
                {result !== undefined && !asking && (
                  <Detail label="Result">
                    {typeof result === "string" ? <Code code={result} language={resultLanguage} /> : result}
                  </Detail>
                )}
              </div>
            </div>
          </div>
        )}

        {asking && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t border-[rgb(251_191_36/0.14)] py-2.5 pl-3 pr-2.5 sm:pl-9">
            <p className="min-w-0 flex-1 basis-48 text-pretty text-[13px] leading-5 text-white/65">
              {approvalNote ?? "This tool needs your approval to run."}
            </p>
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onDeny}
                className={cn(
                  "h-8 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white/70 outline-none",
                  "transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.97]",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                )}
              >
                {denyLabel}
              </button>
              <button
                type="button"
                onClick={onApprove}
                className={cn(
                  "h-8 cursor-pointer rounded-lg bg-[rgb(var(--neon))] px-3.5 text-[13px] font-semibold text-[#05060a] outline-none",
                  "shadow-[0_0_0_1px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)]",
                  "transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[0_0_0_1px_rgb(var(--neon)),0_0_24px_rgb(var(--neon)/CALC(0.65*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)] active:scale-[0.97]",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
                )}
              >
                {approveLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);
ToolCall.displayName = "ToolCall";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <span className="text-xs text-white/45">{label}</span>
      {children}
    </div>
  );
}

const LANGUAGE_BY_KEY: Record<string, string> = {
  sql: "sql",
  query: "sql",
  statement: "sql",
  command: "bash",
  cmd: "bash",
  script: "bash",
};

function Code({ code, language }: { code: string; language?: string }) {
  return (
    <CodeBlock
      code={code}
      language={language}
      header={false}
      lineNumbers={false}
      maxHeight={240}
      className="rounded-lg border-white/[0.06] bg-black/25 [&_.nk-code-line]:pl-3 [&_.nk-code-scroll>div]:py-2 [&_.nk-code-scroll]:text-[12px]"
    />
  );
}

function ArgList({ args }: { args: Record<string, unknown> }) {
  return (
    <dl className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 font-mono text-[12px] leading-5">
      {Object.entries(args).map(([key, value]) => {
        const text = formatValue(value);
        const block = text.includes("\n");
        return (
          <React.Fragment key={key}>
            <dt className="text-white/45">{key}</dt>
            <dd className="min-w-0 text-white/85 [overflow-wrap:anywhere]">
              {block ? <Code code={text} language={LANGUAGE_BY_KEY[key.toLowerCase()]} /> : text}
            </dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
}

export { ToolCall, ToolCallGroup };
