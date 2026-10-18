"use client";

import * as React from "react";
import { ChevronDown } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// A hot filament wavers a little in brightness; only its halo moves, so the coil itself stays crisp.
const css = `
@keyframes nk-reason-waver{0%,100%{opacity:1}11%{opacity:.78}13%{opacity:1}46%{opacity:.9}48%{opacity:1}71%{opacity:.72}74%{opacity:.96}}
.nk-reason-waver{animation:nk-reason-waver 3.1s linear infinite}
@media (prefers-reduced-motion:reduce){.nk-reason-waver{animation:none}}
`;

/* ------------------------------------------------------------------------------------------------
 * The filament: a coil of wire on two support leads, drawn as a looped trochoid. Computed once at
 * module load, so it is the same on the server and the client.
 * ---------------------------------------------------------------------------------------------- */

function coilPath() {
  const loops = 5;
  const x0 = 5.4;
  const width = 17.2;
  const y0 = 7.2;
  const rx = 1.7;
  const ry = 3.1;
  const a = width / (loops * 2 * Math.PI);
  const points: string[] = [];
  const steps = loops * 24;
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI / 2 + (i / steps) * loops * 2 * Math.PI;
    const x = x0 + a * (t - Math.PI / 2) + rx - rx * Math.sin(t);
    const y = y0 - ry * Math.cos(t);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${points.join("L")}`;
}

const COIL = coilPath();

function Filament({ hot }: { hot: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 28 16" fill="none" className="h-4 w-7 shrink-0 overflow-visible" data-slot="filament">
      {/* Support leads: plain wire, they never glow. */}
      <path d="M5.4 7.2 L3.4 15 M22.6 7.2 L24.6 15" stroke="rgb(255 255 255 / 0.22)" strokeWidth="1.1" strokeLinecap="round" />
      {/* Halo: fades out slower than the core, so the coil cools through an ember stage. */}
      <path
        d={COIL}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "stroke-[rgb(var(--neon))] [filter:blur(2.2px)_opacity(var(--neon-glow,1))] motion-reduce:transition-none",
          hot
            ? "nk-reason-waver opacity-80 transition-opacity duration-300"
            : "opacity-0 transition-opacity duration-[1800ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        )}
      />
      <path
        d={COIL}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "motion-reduce:transition-none",
          hot
            ? "stroke-[color-mix(in_srgb,rgb(var(--neon))_38%,white)] transition-[stroke] duration-300"
            : "stroke-[color-mix(in_srgb,rgb(var(--neon))_16%,#565c69)] transition-[stroke] duration-[1100ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        )}
      />
    </svg>
  );
}

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

function formatSeconds(seconds: number) {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s ? `${m}m ${s}s` : `${m}m`;
}

function spokenSeconds(seconds: number) {
  const whole = Math.max(1, Math.round(seconds));
  if (whole < 60) return `${whole} second${whole === 1 ? "" : "s"}`;
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m} minute${m === 1 ? "" : "s"}${s ? ` ${s} second${s === 1 ? "" : "s"}` : ""}`;
}

/** The sentence being written right now: the tail of the trace, after the last full stop. */
function currentLine(text: string) {
  const paragraphs = text.split(/\n+/).filter((line) => line.trim());
  const last = paragraphs[paragraphs.length - 1] ?? "";
  const sentences = last.split(/(?<=[.!?…])\s+/).filter((part) => part.trim());
  const tail = sentences[sentences.length - 1] ?? "";
  return tail.replace(/[*_`]/g, "").trim();
}

function renderInline(text: string) {
  // `code` and **bold** are the only marks reasoning traces use often enough to matter.
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={index} className="rounded-[4px] bg-white/[0.06] px-[0.32em] py-[0.08em] font-mono text-[0.88em] text-white/75">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-medium text-white/80">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function Trace({ text, streaming }: { text: string; streaming: boolean }) {
  const paragraphs = text.split(/\n{2,}/).filter((part) => part.trim());
  return (
    <div className="grid gap-2.5">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className={cn(
            "whitespace-pre-line transition-colors duration-700",
            // The paragraph still being written reads a step brighter than the ones behind it.
            streaming && index === paragraphs.length - 1 && "text-white/75",
          )}
        >
          {renderInline(paragraph)}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Reasoning
 * ---------------------------------------------------------------------------------------------- */

export interface ReasoningProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Still thinking: the filament is hot, the timer runs and the header shows the current line. */
  streaming?: boolean;
  /** Seconds spent. Measured while streaming when omitted. */
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Open when thinking starts and fold away when it ends, unless the reader toggled it by hand.
   * Off by default: the trace stays folded to its one live line.
   */
  followStreaming?: boolean;
  /** The live one-line state. Defaults to the sentence being written when the trace is a string. */
  status?: React.ReactNode;
  /** Header while streaming. */
  label?: React.ReactNode;
  /** Header when done. Defaults to "Thought for 12s". */
  doneLabel?: React.ReactNode;
  /** The trace. A string is split into paragraphs, with `code` and **bold** marks. */
  children?: React.ReactNode;
  color?: NeonColor;
}

const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  (
    {
      streaming = false,
      duration,
      open: openProp,
      defaultOpen,
      onOpenChange,
      followStreaming = false,
      status,
      label = "Thinking",
      doneLabel,
      className,
      style,
      color,
      children,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? (followStreaming && streaming));
    const open = openProp ?? innerOpen;
    const [touched, setTouched] = React.useState(false);
    const elapsed = useElapsed(streaming);
    const [measured, setMeasured] = React.useState<number | undefined>(undefined);
    const [wasStreaming, setWasStreaming] = React.useState(streaming);
    // Only state changes are announced, and only ones that happened while mounted.
    const [announcement, setAnnouncement] = React.useState(streaming ? "Thinking" : "");

    const onOpenChangeRef = React.useRef(onOpenChange);
    React.useEffect(() => {
      onOpenChangeRef.current = onOpenChange;
    });

    // Adjusted during render, so there is no closed-then-open flash when thinking starts.
    if (wasStreaming !== streaming) {
      setWasStreaming(streaming);
      const spent = !streaming ? (duration ?? elapsed ?? undefined) : undefined;
      if (!streaming && elapsed !== null) setMeasured(elapsed);
      setAnnouncement(streaming ? "Thinking" : spent !== undefined ? `Thought for ${spokenSeconds(spent)}` : "Done thinking");
      if (followStreaming && !touched && openProp === undefined) setInnerOpen(streaming);
    }

    const firstRun = React.useRef(true);
    React.useEffect(() => {
      if (firstRun.current) {
        firstRun.current = false;
        return;
      }
      if (followStreaming && !touched) onOpenChangeRef.current?.(streaming);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [streaming]);

    const toggle = () => {
      setTouched(true);
      if (openProp === undefined) setInnerOpen(!open);
      onOpenChange?.(!open);
    };

    const spent = duration ?? measured;
    const line = status ?? (typeof children === "string" ? currentLine(children) : null);
    const content =
      typeof children === "string" ? <Trace text={children} streaming={streaming} /> : children;
    const hasContent = typeof children === "string" ? children.trim().length > 0 : children != null;

    const header = streaming
      ? label
      : (doneLabel ?? (spent !== undefined ? `Thought for ${formatSeconds(spent)}` : "Reasoning"));

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        data-state={streaming ? "streaming" : "done"}
        data-open={open || undefined}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "relative min-w-0", className)}
        {...props}
      >
        <style href="nk-reasoning" precedence="nk">
          {css}
        </style>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-trace`}
          onClick={toggle}
          className={cn(
            "group/reason -mx-2 flex h-8 min-w-0 max-w-[calc(100%+1rem)] cursor-pointer items-center gap-2.5 rounded-lg px-2 text-left text-sm outline-none",
            // While it thinks, the row spans the width so the timer sits at the right like a readout.
            streaming ? "w-[calc(100%+1rem)]" : "w-fit",
            "transition-colors duration-150 hover:bg-white/[0.035]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
          )}
        >
          <Filament hot={streaming} />
          <span
            className={cn(
              "shrink-0 font-medium transition-colors duration-300",
              streaming ? "text-white/90" : "text-white/60 group-hover/reason:text-white/85",
            )}
          >
            {header}
          </span>
          {streaming && (
            <span aria-hidden className="w-0 min-w-0 flex-1 truncate text-white/45">
              {!open && line}
            </span>
          )}
          {streaming && elapsed !== null && (
            <span
              aria-hidden
              className="shrink-0 font-mono text-xs tabular-nums text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)]"
            >
              {elapsed.toFixed(1)}s
            </span>
          )}
          {hasContent && (
            <ChevronDown
              aria-hidden
              className={cn(
                "size-3.5 shrink-0 text-white/40 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          )}
        </button>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
        <div
          id={`${id}-trace`}
          role="region"
          aria-label="Reasoning"
          className={cn(
            "grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            {/* The trace hangs off the filament's left lead, on a plain wire. */}
            <div className="ml-[3px] mt-1 border-l border-white/[0.09] pb-1 pl-[34px] text-sm leading-[1.65] text-[#8a93a6]">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
Reasoning.displayName = "Reasoning";

export { Reasoning };
