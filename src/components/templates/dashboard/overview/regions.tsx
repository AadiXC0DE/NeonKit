"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Heartbeat } from "@/components/ui/heartbeat";
import { Meter } from "@/components/ui/meter";
import { cn } from "@/lib/utils";
import { REGIONS, type Region } from "../data";

// Small deterministic wobble so the board breathes without random numbers in render.
function wobble(region: Region, tick: number): Region {
  const seed = region.code.charCodeAt(0) + region.code.charCodeAt(2) * 3;
  const wave = (k: number) => Math.sin(tick * 0.9 + seed * k);
  return {
    ...region,
    rps: Math.round(region.rps * (1 + 0.06 * wave(1))),
    p95: Math.round(region.p95 * (1 + 0.05 * wave(2))),
    load: Math.min(0.98, Math.max(0.05, region.load + 0.04 * wave(3))),
  };
}

export function Regions({ className }: { className?: string }) {
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2000);
    return () => window.clearInterval(id);
  }, []);

  const regions = REGIONS.map((r) => wobble(r, tick));
  const total = regions.reduce((sum, r) => sum + r.rps, 0);
  const degraded = regions.filter((r) => r.status === "degraded").length;

  return (
    <section aria-labelledby="regions-title" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-1 pb-4">
        <div>
          <h2 id="regions-title" className="text-lg font-semibold tracking-[-0.02em] text-white">
            Regions
          </h2>
          <p className="mt-1 text-[13px] text-white/60">
            {regions.length - degraded} of {regions.length} healthy ·{" "}
            <span className="inline-block min-w-[4.5ch] font-mono tabular-nums text-white/80">{total.toLocaleString("en-US")}</span> req/s across the edge
          </p>
        </div>
        <Badge variant="outline" size="sm" pulse>
          Live
        </Badge>
      </div>
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] sm:grid-cols-2 xl:grid-cols-3">
        {regions.map((region, i) => (
          // The pulse follows the region's usual traffic, not the wobble, so the trace never jumps.
          <RegionTile key={region.code} region={region} bpm={region.status === "degraded" ? 46 : 58 + Math.round(REGIONS[i].rps / 24)} />
        ))}
      </ul>
    </section>
  );
}

function RegionTile({ region, bpm }: { region: Region; bpm: number }) {
  const degraded = region.status === "degraded";

  return (
    <li className="relative bg-[#07080d] p-4 sm:p-5">
      {degraded && (
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(251_191_36/0.09),transparent)]" />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-2">
            <span className="font-mono text-[15px] font-medium uppercase tracking-[0.06em] text-white">{region.code}</span>
            <span className="truncate text-[13px] text-white/60">{region.city}</span>
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-white/55">{region.zone}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs",
            degraded ? "text-[rgb(251_191_36)]" : "text-white/70",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              degraded ? "bg-[rgb(251_191_36)] shadow-[0_0_8px_rgb(251_191_36/0.9)]" : "bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.9)]",
            )}
          />
          {degraded ? "Degraded" : "Serving"}
        </span>
      </div>

      <Heartbeat
        aria-hidden
        height={44}
        bpm={bpm}
        color={degraded ? "amber" : undefined}
        className="relative mt-3 opacity-90"
      />

      <dl className="relative mt-3 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-3">
        <div>
          <dt className="text-[11px] text-white/55">p95</dt>
          <dd className={cn("mt-0.5 font-mono text-sm tabular-nums", degraded ? "text-[rgb(251_191_36)]" : "text-white/90")}>{region.p95} ms</dd>
        </div>
        <div>
          <dt className="text-[11px] text-white/55">Requests</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-white/90">{region.rps.toLocaleString("en-US")}/s</dd>
        </div>
        <div className="text-right">
          <dt className="text-[11px] text-white/55">Load</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-white/90">{Math.round(region.load * 100)}%</dd>
        </div>
      </dl>
      <Meter
        value={region.load}
        peak={false}
        segments={32}
        size="sm"
        aria-label={`${region.city} capacity in use`}
        className="relative mt-3 w-full"
      />
    </li>
  );
}
