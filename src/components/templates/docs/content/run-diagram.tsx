"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { focusRing } from "../styles";

type Start = "cold" | "warm";

type Stage = {
  name: string;
  /** Milliseconds for each kind of start. `null` means the stage was skipped. */
  ms: Record<Start, number | null>;
  detail: Record<Start, string>;
  /** Tone of the stage's stretch of bar while it isn't lit. */
  tone: string;
};

// The same run as the terminal above: 0.21 s + 1.84 s + 41 ms + 38 ms = 2.13 s.
const stages: Stage[] = [
  {
    name: "Resolve",
    ms: { cold: 210, warm: 3 },
    detail: {
      cold: "Reads pnpm-lock.yaml and gantry.toml and works out the layers each service needs.",
      warm: "Hashes the lockfile, finds it unchanged and stops there.",
    },
    tone: "bg-white/[0.28]",
  },
  {
    name: "Layer",
    ms: { cold: 1840, warm: null },
    detail: {
      cold: "Rebuilds the one layer whose inputs changed (src). The other nine come from the local cache.",
      warm: "Skipped. No input changed, so every layer is already built.",
    },
    tone: "bg-white/[0.5]",
  },
  {
    name: "Start",
    ms: { cold: 79, warm: 79 },
    detail: {
      cold: "Starts db, waits for its health check, then web. Each in its own namespaces.",
      warm: "The same two processes in the same order. This is most of a warm start.",
    },
    tone: "bg-white/[0.72]",
  },
];

const SCALE = stages.reduce((sum, stage) => sum + (stage.ms.cold ?? 0), 0);

function formatTotal(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`;
}

function formatStage(ms: number | null) {
  if (ms === null) return "skipped";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`;
}

/**
 * One `gantry up`, drawn to scale. Switching to a warm start shows where the time goes:
 * the layer stage disappears and the whole bar collapses to a sliver.
 */
export function RunDiagram() {
  const [start, setStart] = React.useState<Start>("cold");
  const [lit, setLit] = React.useState<number | null>(null);
  const total = stages.reduce((sum, stage) => sum + (stage.ms[start] ?? 0), 0);

  return (
    <figure aria-label="The stages of one gantry up, to scale" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div role="group" aria-label="Kind of start" className="flex rounded-full border border-white/10 p-0.5">
          {(["cold", "warm"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={start === kind}
              onClick={() => setStart(kind)}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3.5 text-[13px] transition-[background-color,color] duration-200",
                start === kind ? "bg-white/[0.09] text-white" : "text-white/60 hover:text-white",
                focusRing,
              )}
            >
              {kind === "cold" ? "First run" : "Warm start"}
            </button>
          ))}
        </div>
        <p className="flex items-baseline gap-3" aria-live="polite">
          <span className="text-[13px] text-white/55">Ready in</span>
          <span className="font-[620] tabular-nums tracking-[-0.03em] text-white [font-stretch:108%] text-[2rem] leading-none">
            {formatTotal(total)}
          </span>
        </p>
      </div>

      {/* The bar, to scale against the first run. Watch keeps going after it, so it trails off live. */}
      <div aria-hidden className="mt-7 flex items-center gap-3">
        <div className="relative flex h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
          {stages.map((stage, index) => {
            const ms = stage.ms[start];
            const on = lit === index;
            return (
              <span
                key={stage.name}
                className={cn(
                  "h-full shrink-0 border-r border-[#05060a] transition-[width,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] last:border-r-0 motion-reduce:transition-none",
                  on ? "bg-[rgb(var(--neon))] shadow-[0_0_12px_rgb(var(--neon)/0.8)]" : stage.tone,
                )}
                style={{ width: ms === null ? 0 : `max(3px, ${(ms / SCALE) * 100}%)` }}
              />
            );
          })}
        </div>
        <span className="flex shrink-0 items-center gap-2 text-[13px] text-white/60">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon))] opacity-60 [animation-duration:2s] motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.9)]" />
          </span>
          Watch
        </span>
      </div>

      <ol className="mt-6 list-none border-t border-white/[0.07] p-0">
        {stages.map((stage, index) => {
          const ms = stage.ms[start];
          return (
            <li
              key={stage.name}
              onPointerEnter={() => setLit(index)}
              onPointerLeave={() => setLit(null)}
              className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-b border-white/[0.07] py-4 sm:grid-cols-[7.5rem_1fr_5.5rem]"
            >
              <span className={cn("text-[15px] font-medium", ms === null ? "text-white/50" : "text-white")}>
                {stage.name}
              </span>
              <span
                className={cn(
                  "text-right sm:order-last",
                  ms === null ? "text-[13px] text-white/50" : "font-mono text-[13px] tabular-nums text-white/85",
                )}
              >
                {formatStage(ms)}
              </span>
              <span className="col-span-2 text-[14px] leading-6 text-white/60 sm:col-span-1">{stage.detail[start]}</span>
            </li>
          );
        })}
        <li className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-4 sm:grid-cols-[7.5rem_1fr_5.5rem]">
          <span className="text-[15px] font-medium text-white">Watch</span>
          <span className="text-right text-[13px] text-[rgb(var(--neon))] sm:order-last">Running</span>
          <span className="col-span-2 text-[14px] leading-6 text-white/60 sm:col-span-1">
            Rebuilds the source layer on save and restarts only the services that use it.
          </span>
        </li>
      </ol>
    </figure>
  );
}
