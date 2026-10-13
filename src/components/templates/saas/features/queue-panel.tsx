"use client";

import * as React from "react";
import { Check, Play, RotateCcw } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queue, type QueuedDeploy } from "../data";
import { formatClock, type NightRun, type Phase } from "./night-run";

const RED = "rgb(255 77 94)";
const GREEN = "rgb(52 211 153)";

// How far the tube under a row is filled in each phase, and how long it takes to get there.
// Rolling back drains it again.
const tube: Record<Phase, { fill: number; ms: number }> = {
  queued: { fill: 0, ms: 0 },
  deploying: { fill: 0.55, ms: 1200 },
  checking: { fill: 1, ms: 1200 },
  landed: { fill: 1, ms: 200 },
  rollingback: { fill: 0, ms: 1000 },
  rolledback: { fill: 0, ms: 0 },
  held: { fill: 0.1, ms: 300 },
};

function failing(deploy: QueuedDeploy, phase: Phase) {
  return deploy.outcome === "regress" && (phase === "checking" || phase === "rollingback" || phase === "held");
}

function Lamp({ deploy, phase }: { deploy: QueuedDeploy; phase: Phase }) {
  const bad = failing(deploy, phase);
  const live = phase === "deploying" || phase === "checking";
  return (
    <span
      aria-hidden
      className={cn(
        "mt-[5px] size-2 shrink-0 rounded-full transition-[background-color,box-shadow] duration-300",
        bad
          ? "bg-[rgb(255_77_94)] shadow-[0_0_8px_rgb(255_77_94/0.9)]"
          : live
            ? "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.6)]"
            : phase === "landed"
              ? "bg-[rgb(52_211_153)] shadow-[0_0_6px_rgb(52_211_153/0.6)]"
              : phase === "rolledback"
                ? "bg-white/40"
                : "bg-white/[0.12] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]",
      )}
    />
  );
}

function Status({ deploy, phase }: { deploy: QueuedDeploy; phase: Phase }) {
  const lit = "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]";
  const red = "text-[rgb(255_77_94)]";
  switch (phase) {
    case "deploying":
      return <span className={lit}>Deploying</span>;
    case "checking":
      return failing(deploy, phase) ? (
        <span className={red}>p95 {deploy.p95.toLocaleString("en-US")} ms</span>
      ) : (
        <span className={lit}>Canary 10%</span>
      );
    case "landed":
      return (
        <span className="inline-flex items-center gap-1.5 text-white/75">
          <Check aria-hidden className="size-3.5" style={{ color: GREEN }} strokeWidth={2.5} />
          {deploy.took}
        </span>
      );
    case "rollingback":
      return <span className={red}>Rolling back</span>;
    case "rolledback":
      return (
        <span className="inline-flex items-center gap-1.5 text-white/75">
          <RotateCcw aria-hidden className="size-3.5" style={{ color: RED }} strokeWidth={2.25} />
          Rolled back
        </span>
      );
    case "held":
      return <span className={red}>Held · paged</span>;
    default:
      return <span className="text-white/60">Queued</span>;
  }
}

// The run fits in a quarter hour, so the timeline shows 02:00 to 02:15 rather than the whole window.
const SPAN = 15 * 60;
const TICKS = ["02:00", "02:05", "02:10", "02:15"];

function Timeline({ night }: { night: NightRun }) {
  const progress = Math.min(1, night.clock / SPAN);
  return (
    <div aria-hidden className="mt-6">
      <div className="relative h-2 rounded-full bg-white/[0.05] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
        <span
          className="absolute inset-0 origin-left rounded-full bg-[linear-gradient(90deg,rgb(var(--neon)/0.35),color-mix(in_srgb,rgb(var(--neon))_55%,white))] shadow-[0_0_10px_rgb(var(--neon)/0.6)] transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${progress})` }}
        />
        {night.marks.map((mark) => (
          <span
            key={mark.at}
            className="absolute -top-1 h-4 w-[2px] -translate-x-1/2 rounded-full"
            style={{
              left: `${(Math.min(SPAN, mark.at) / SPAN) * 100}%`,
              background: mark.phase === "landed" ? GREEN : RED,
              boxShadow: `0 0 6px ${mark.phase === "landed" ? GREEN : RED}`,
            }}
          />
        ))}
      </div>
      <div className="mt-2.5 flex justify-between font-mono text-[11px] tabular-nums text-white/50">
        {TICKS.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

export function QueuePanel({ night }: { night: NightRun }) {
  const { phases, status, clock, run } = night;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-baseline justify-between gap-3 text-[13px] text-white/55">
        <span>Tonight on production</span>
        <span className="tabular-nums">
          {status === "idle" ? (
            <>
              {queue.length} queued for <span className="font-mono text-white/85">02:00</span>
            </>
          ) : (
            <span className={cn("font-mono", status === "running" ? "text-white" : "text-white/85")}>
              {formatClock(clock)}
            </span>
          )}
        </span>
      </div>

      <ol className="-mx-5 mt-3 flex flex-1 flex-col border-y border-white/[0.07] sm:-mx-7">
        {queue.map((deploy, i) => {
          const phase = phases[i];
          const bad = failing(deploy, phase);
          const live = phase === "deploying" || phase === "checking";
          const t = tube[phase];
          return (
            <li
              key={deploy.sha}
              className={cn(
                "relative flex flex-1 flex-col justify-center border-b border-white/[0.06] px-5 py-3.5 transition-colors duration-300 last:border-b-0 sm:px-7 sm:py-4",
                bad ? "bg-[rgb(255_77_94/0.06)]" : live && "bg-[rgb(var(--neon)/0.05)]",
              )}
            >
              <div className="flex items-start gap-3">
                <Lamp deploy={deploy} phase={phase} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[13px] leading-5">
                    <span className="whitespace-nowrap text-white/90">{deploy.service}</span>
                    <span className="text-white/60">{deploy.sha}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[13px] leading-5 text-white/55">
                    {deploy.message}
                    <span className="hidden sm:inline">
                      <span className="text-white/30"> · </span>
                      {deploy.author}
                    </span>
                  </p>
                </div>
                <span className="w-[6.5rem] shrink-0 text-right text-[12px] leading-5 sm:w-[7.5rem] sm:text-[13px]">
                  <Status deploy={deploy} phase={phase} />
                </span>
              </div>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
                <span
                  className="block h-full origin-left ease-linear motion-reduce:transition-none"
                  style={{
                    transform: `scaleX(${t.fill})`,
                    transitionProperty: "transform, opacity",
                    transitionDuration: `${t.ms}ms`,
                    opacity: phase === "landed" ? 0 : 1,
                    background: bad || phase === "held" ? RED : "color-mix(in srgb, rgb(var(--neon)) 55%, white)",
                    boxShadow: bad ? `0 0 8px ${RED}` : "0 0 8px rgb(var(--neon))",
                  }}
                />
              </span>
            </li>
          );
        })}
      </ol>

      <Timeline night={night} />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5">
        <p aria-live="polite" className="min-h-5 min-w-0 flex-1 basis-56 text-[13px] leading-5 text-white/55">
          {night.event || "Simulated. Nothing leaves this page."}
        </p>
        <Button variant={status === "idle" ? "solid" : "outline"} size="sm" onClick={run} disabled={status === "running"} className="shrink-0">
          {status === "done" ? <RotateCcw aria-hidden /> : <Play aria-hidden />}
          {status === "running" ? "Window open" : status === "done" ? "Run it again" : "Run tonight's window"}
        </Button>
      </div>
    </div>
  );
}
