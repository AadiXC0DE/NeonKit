"use client";

import * as React from "react";
import { Check, X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const css = `
@keyframes nk-plan-breathe{0%,100%{opacity:1}50%{opacity:.45}}
.nk-plan-breathe{animation:nk-plan-breathe 2.6s cubic-bezier(0.45,0,0.55,1) infinite}
@media (prefers-reduced-motion:reduce){.nk-plan-breathe{animation:none}}
`;

export type PlanStepStatus = "pending" | "active" | "done" | "failed" | "skipped";

export interface PlanSubstep {
  title: React.ReactNode;
  status?: PlanStepStatus;
  /** Right-aligned value, e.g. "3 files". */
  meta?: React.ReactNode;
}

export interface PlanStep {
  /** Stable key. Falls back to the index. */
  id?: string;
  title: React.ReactNode;
  /** Plain text for announcements when `title` isn't a string. */
  label?: string;
  /** A line under the title: what was found, why it failed. */
  description?: React.ReactNode;
  status?: PlanStepStatus;
  /** Right-aligned value, e.g. "0.8s" or "14 passed". The active step shows a live timer when omitted. */
  meta?: React.ReactNode;
  substeps?: PlanSubstep[];
  /** Anything else under the step: a tool call, a diff. */
  content?: React.ReactNode;
}

const statusWords: Record<PlanStepStatus, string> = {
  pending: "Not started",
  active: "In progress",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

const RED = "255 77 94";

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

function formatElapsed(seconds: number) {
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${String(Math.floor(seconds % 60)).padStart(2, "0")}s`;
}

function textOf(step: PlanStep) {
  return step.label ?? (typeof step.title === "string" ? step.title : "");
}

/* ------------------------------------------------------------------------------------------------
 * Nodes
 * ---------------------------------------------------------------------------------------------- */

function Node({ status }: { status: PlanStepStatus }) {
  return (
    <span
      aria-hidden
      data-slot="node"
      style={status === "failed" ? ({ "--neon": RED } as React.CSSProperties) : undefined}
      className={cn(
        "relative grid size-4 place-items-center rounded-full border transition-[border-color,background-color] duration-300",
        status === "pending" && "border-white/[0.16]",
        status === "skipped" && "border-white/[0.12]",
        (status === "done" || status === "failed") && "border-[rgb(var(--neon)/0.5)] bg-[rgb(var(--neon)/0.12)]",
        status === "active" && "border-[rgb(var(--neon)/0.85)] [transition-delay:420ms]",
      )}
    >
      {status === "done" && (
        <Check className="size-2.5 text-[color-mix(in_srgb,rgb(var(--neon))_70%,white)]" strokeWidth={3} />
      )}
      {status === "failed" && <X className="size-2.5 text-[rgb(255_120_134)]" strokeWidth={3} />}
      {status === "skipped" && <span className="h-[1.5px] w-1.5 rounded-full bg-white/35" />}
      {/* The lit core arrives a beat after the tube reaches it. */}
      <span
        className={cn(
          "absolute inset-0 grid place-items-center rounded-full transition-opacity",
          status === "active" ? "opacity-100 duration-300 [transition-delay:420ms]" : "opacity-0 duration-150",
        )}
      >
        <span className="nk-plan-breathe absolute inset-[-1px] rounded-full shadow-[0_0_10px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))),0_0_22px_rgb(var(--neon)/CALC(0.25*var(--neon-glow,1))),inset_0_0_6px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]" />
        <span className="size-1.5 rounded-full [background:color-mix(in_srgb,rgb(var(--neon))_50%,white)] shadow-[0_0_3px_rgb(var(--neon)/var(--neon-glow,1)),0_0_8px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]" />
      </span>
    </span>
  );
}

function SubNode({ status }: { status: PlanStepStatus }) {
  return (
    <span aria-hidden className="grid h-5 w-2.5 shrink-0 place-items-center">
      <span
        className={cn(
          "size-1.5 rounded-full transition-[background-color,box-shadow] duration-300",
          status === "pending" && "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22)]",
          status === "skipped" && "h-px w-1.5 bg-white/30",
          status === "done" && "bg-[rgb(var(--neon)/0.55)]",
          status === "failed" && "bg-[rgb(255_77_94)]",
          status === "active" &&
            "[background:color-mix(in_srgb,rgb(var(--neon))_50%,white)] shadow-[0_0_3px_rgb(var(--neon)/var(--neon-glow,1)),0_0_8px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1)))]",
        )}
      />
    </span>
  );
}

function LiveMeta() {
  const elapsed = useElapsed(true);
  return (
    <span
      aria-hidden
      className="font-mono text-xs tabular-nums text-[color-mix(in_srgb,rgb(var(--neon))_50%,white)] [text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1)))]"
    >
      {elapsed === null ? "" : formatElapsed(elapsed)}
    </span>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Plan
 * ---------------------------------------------------------------------------------------------- */

export interface AgentPlanProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "title"> {
  steps: PlanStep[];
  /** Heading above the steps. Also names the list. */
  title?: React.ReactNode;
  /** Replaces the "2 of 4" count next to the title. Pass null to hide it. */
  readout?: React.ReactNode;
  /** Live timer on the active step when it has no meta. */
  timer?: boolean;
  color?: NeonColor;
}

const AgentPlan = React.forwardRef<HTMLDivElement, AgentPlanProps>(
  ({ steps, title, readout, timer = true, className, style, color, ...props }, ref) => {
    const titleId = React.useId();
    const statuses = steps.map((step) => step.status ?? "pending");
    const done = statuses.filter((status) => status === "done").length;
    const activeIndex = statuses.indexOf("active");
    const failedIndex = statuses.indexOf("failed");
    // Where the light has reached: the furthest step that started.
    const reached = statuses.reduce((last, status, index) => (status === "active" || status === "done" || status === "failed" ? index : last), -1);

    const summary =
      failedIndex >= 0 && activeIndex < 0
        ? `Stopped at step ${failedIndex + 1}: ${textOf(steps[failedIndex])}`
        : activeIndex >= 0
          ? `Step ${activeIndex + 1} of ${steps.length}: ${textOf(steps[activeIndex])}`
          : steps.length > 0 && done === steps.length
            ? "Plan complete"
            : "";
    const [announcement, setAnnouncement] = React.useState("");
    const [lastSummary, setLastSummary] = React.useState(summary);
    if (lastSummary !== summary) {
      setLastSummary(summary);
      setAnnouncement(summary);
    }

    const idle = activeIndex < 0;
    const count = readout === undefined ? `${done} of ${steps.length}` : readout;

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "min-w-0", className)}
        {...props}
      >
        <style href="nk-agent-plan" precedence="nk">
          {css}
        </style>
        {(title || count !== null) && (
          <div className="mb-3 flex min-w-0 items-baseline justify-between gap-4">
            {title && (
              <span id={titleId} className="min-w-0 truncate text-sm font-medium text-white/90">
                {title}
              </span>
            )}
            {count !== null && (
              <span className="ml-auto shrink-0 text-[13px] tabular-nums text-white/50">{count}</span>
            )}
          </div>
        )}
        <ol aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : "Plan"} className="grid min-w-0">
          {steps.map((step, index) => {
            const status = statuses[index];
            const last = index === steps.length - 1;
            const lit = index < reached;
            const meta = step.meta ?? (status === "active" && timer ? <LiveMeta key={step.id ?? index} /> : null);
            return (
              <li
                key={step.id ?? index}
                aria-current={status === "active" ? "step" : undefined}
                data-status={status}
                className={cn("relative grid min-w-0 grid-cols-[16px_minmax(0,1fr)] gap-x-3", !last && "pb-4")}
              >
                {!last && (
                  // A glass tube between this node and the next, with a blackout gap at both ends.
                  <span
                    aria-hidden
                    data-slot="tube"
                    className="absolute bottom-[-1px] left-[6.5px] top-[23px] w-[3px] rounded-full bg-white/[0.06]"
                  >
                    <span
                      data-lit={lit || undefined}
                      className={cn(
                        "absolute inset-0 origin-top rounded-full",
                        "transition-[transform,opacity,box-shadow] motion-reduce:transition-none",
                        "[background:color-mix(in_srgb,rgb(var(--neon))_80%,white)]",
                        // With nothing running the tube powers down to a steady, unhaloed line.
                        idle
                          ? "opacity-45 shadow-[0_0_0_rgb(var(--neon)/0)]"
                          : "shadow-[0_0_4px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))),0_0_12px_rgb(var(--neon)/CALC(0.3*var(--neon-glow,1)))]",
                        lit ? "scale-y-100 ease-[cubic-bezier(0.65,0,0.35,1)]" : "scale-y-0 ease-out",
                        idle ? "duration-[1200ms]" : lit ? "duration-[420ms]" : "duration-200",
                      )}
                    />
                  </span>
                )}
                <span className="flex h-6 items-center">
                  <Node status={status} />
                </span>
                <div className="min-w-0">
                  <div className="flex min-h-6 min-w-0 items-baseline justify-between gap-3">
                    <span
                      className={cn(
                        "min-w-0 text-[14.5px] leading-6 transition-colors duration-300",
                        status === "active" && "font-medium text-white",
                        status === "done" && "text-white/65",
                        status === "pending" && "text-white/70",
                        status === "failed" && "font-medium text-white/90",
                        status === "skipped" && "text-white/40",
                      )}
                    >
                      <span className="sr-only">{statusWords[status]}: </span>
                      {step.title}
                    </span>
                    {(meta || status === "skipped") && (
                      <span
                        className={cn(
                          "shrink-0 text-xs tabular-nums",
                          status === "failed" ? "text-[rgb(255_120_134)]" : "text-white/45",
                        )}
                      >
                        {meta ?? "Skipped"}
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <div
                      className={cn(
                        "mt-0.5 text-[13px] leading-5",
                        status === "failed" ? "text-[rgb(255_150_160)]" : "text-white/50",
                      )}
                    >
                      {step.description}
                    </div>
                  )}
                  {step.substeps && step.substeps.length > 0 && (
                    <ul className="mt-1.5 grid gap-0.5">
                      {step.substeps.map((sub, k) => {
                        const subStatus = sub.status ?? "pending";
                        return (
                          <li key={k} className="flex min-w-0 items-start gap-2.5 text-[13px] leading-5">
                            <SubNode status={subStatus} />
                            <span
                              className={cn(
                                "min-w-0 flex-1",
                                subStatus === "active"
                                  ? "text-white/90"
                                  : subStatus === "pending"
                                    ? "text-white/55"
                                    : subStatus === "skipped"
                                      ? "text-white/40"
                                      : subStatus === "failed"
                                        ? "text-[rgb(255_150_160)]"
                                        : "text-white/50",
                              )}
                            >
                              <span className="sr-only">{statusWords[subStatus]}: </span>
                              {sub.title}
                            </span>
                            {sub.meta && <span className="shrink-0 text-xs leading-5 tabular-nums text-white/45">{sub.meta}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {step.content && <div className="mt-2.5 min-w-0">{step.content}</div>}
                </div>
              </li>
            );
          })}
        </ol>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      </div>
    );
  },
);
AgentPlan.displayName = "AgentPlan";

export { AgentPlan };
