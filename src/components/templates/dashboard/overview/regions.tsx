"use client";

import * as React from "react";
import { ArrowRightLeft, Undo2 } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heartbeat } from "@/components/ui/heartbeat";
import { Meter } from "@/components/ui/meter";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { REGIONS, type Region } from "../data";
import { display } from "../parts/page-header";

/** Where São Paulo's traffic is going: its own region, on its way out, or Ashburn. */
export type Drain = "none" | "draining" | "drained";

const SLO = 60;

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

export function Regions({
  drain,
  onDrainChange,
  className,
}: {
  drain: Drain;
  onDrainChange: (drain: Drain) => void;
  className?: string;
}) {
  const [tick, setTick] = React.useState(0);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2000);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const sick = REGIONS.find((r) => r.status === "degraded")!;
  const drained = drain === "drained";

  // Once São Paulo is drained, Ashburn carries its requests and a little of its latency.
  const regions = REGIONS.map((r) => wobble(r, tick)).map((r) => {
    if (!drained) return r;
    if (r.code === sick.code) return { ...r, rps: 0, load: 0.04 };
    if (r.code === "iad") return { ...r, rps: r.rps + sick.rps, p95: r.p95 + 3, load: Math.min(0.9, r.load + 0.12) };
    return r;
  });
  // The region that needs you sits at the top; the rest read busiest first.
  const ordered = [...regions].sort((a, b) => Number(b.status === "degraded") - Number(a.status === "degraded") || b.rps - a.rps);
  const total = regions.reduce((sum, r) => sum + r.rps, 0);

  function shift() {
    onDrainChange("draining");
    const done = new Promise<void>((resolve) => {
      timer.current = window.setTimeout(() => {
        onDrainChange("drained");
        resolve();
      }, 1600);
    });
    toast.promise(done, {
      loading: "Draining São Paulo to Ashburn…",
      success: `Drained. Ashburn is taking ${sick.rps} req/s from São Paulo.`,
      error: "The drain didn't finish",
    });
  }

  function restore() {
    onDrainChange("none");
    toast("São Paulo is back in rotation", { description: "Traffic returns over two minutes so the caches can warm." });
  }

  return (
    <section aria-labelledby="regions-title" className={className}>
      <div className="flex items-end justify-between gap-4 pb-5">
        <div>
          <h2 id="regions-title" className={cn(display, "text-[22px] text-white")}>
            Regions
          </h2>
          <p className="mt-2 text-[13px] text-white/60">
            {drained ? "5 serving, São Paulo drained" : "5 of 6 inside the SLO"}
            <span className="text-white/30"> · </span>
            <span className="inline-block min-w-[4.5ch] font-mono text-xs tabular-nums text-white/80">{total.toLocaleString("en-US")}</span> req/s
          </p>
        </div>
        <Badge variant="outline" size="sm" pulse>
          Live
        </Badge>
      </div>

      <table className="w-full border-separate border-spacing-0 text-left text-[13px] tabular-nums">
        <caption className="sr-only">Region health, refreshed every two seconds</caption>
        <thead>
          <tr className="text-xs text-white/55">
            <th scope="col" className="border-b border-white/[0.08] pb-2.5 font-normal">
              Region
            </th>
            <th scope="col" className="border-b border-white/[0.08] pb-2.5 text-right font-normal">
              p95
            </th>
            <th scope="col" className="hidden border-b border-white/[0.08] pb-2.5 text-right font-normal sm:table-cell">
              Req/s
            </th>
            <th scope="col" className="border-b border-white/[0.08] pb-2.5 pl-5 text-right font-normal sm:w-[7.5rem]">
              Load
            </th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((region) =>
            region.status === "degraded" ? (
              <SickRegion key={region.code} region={region} drain={drain} onShift={shift} onRestore={restore} />
            ) : (
              <Row key={region.code} region={region} />
            ),
          )}
        </tbody>
      </table>
    </section>
  );
}

function Place({ region, tone }: { region: Region; tone?: string }) {
  return (
    <span className="flex min-w-0 items-baseline gap-3">
      <span className={cn("w-8 shrink-0 font-mono text-xs", tone ?? "text-white/60")}>{region.code.toUpperCase()}</span>
      <span className="min-w-0">
        <span className="text-sm text-white/90">{region.city}</span>
        <span className="ml-2 hidden text-xs text-white/50 sm:inline">{region.zone}</span>
      </span>
    </span>
  );
}

function Load({ value, warn }: { value: number; warn?: boolean }) {
  return (
    <span className="inline-flex items-center justify-end gap-2.5">
      <span aria-hidden className="hidden h-[3px] w-12 overflow-hidden rounded-full bg-white/[0.07] sm:block">
        <span
          className={cn("block h-full rounded-full transition-[width] duration-700 ease-out", warn ? "bg-[rgb(251_191_36)]" : "bg-white/45")}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </span>
      <span className={cn("w-[3ch] text-right font-mono text-xs", warn ? "text-[rgb(251_191_36)]" : "text-white/80")}>
        {Math.round(value * 100)}
        <span className="text-white/50">%</span>
      </span>
    </span>
  );
}

function Row({ region }: { region: Region }) {
  const cell = "border-b border-white/[0.06] py-3";
  return (
    <tr>
      <th scope="row" className={cn(cell, "font-normal")}>
        <Place region={region} />
      </th>
      <td className={cn(cell, "text-right font-mono text-xs text-white/80")}>
        {region.p95}
        <span className="text-white/50"> ms</span>
      </td>
      <td className={cn(cell, "hidden text-right font-mono text-xs text-white/80 sm:table-cell")}>{region.rps.toLocaleString("en-US")}</td>
      <td className={cn(cell, "pl-5 text-right")}>
        <Load value={region.load} warn={region.load > 0.8} />
      </td>
    </tr>
  );
}

function SickRegion({
  region,
  drain,
  onShift,
  onRestore,
}: {
  region: Region;
  drain: Drain;
  onShift: () => void;
  onRestore: () => void;
}) {
  const drained = drain === "drained";
  const tone = drained ? "text-white/50" : "text-[rgb(251_191_36)]";

  return (
    <>
      <tr className="relative">
        <th scope="row" className="relative pb-1 pt-4 font-normal">
          {/* A lit edge marks the one row that needs a person. It goes dark once the region is drained. */}
          {!drained && (
            <span
              aria-hidden
              className="absolute -left-4 bottom-0 top-3 w-[2px] rounded-full bg-[rgb(251_191_36)] shadow-[0_0_10px_rgb(251_191_36/0.8)] sm:-left-5"
            />
          )}
          <Place region={region} tone={tone} />
        </th>
        <td className={cn("pb-1 pt-4 text-right font-mono text-xs", tone)}>
          {drained ? "—" : (
            <>
              {region.p95}
              <span className="opacity-60"> ms</span>
            </>
          )}
        </td>
        <td className="hidden pb-1 pt-4 text-right font-mono text-xs text-white/80 sm:table-cell">{region.rps.toLocaleString("en-US")}</td>
        <td className="pb-1 pl-5 pt-4 text-right">{drained ? <span className="text-xs text-white/55">Drained</span> : <Load value={region.load} warn />}</td>
      </tr>
      <tr>
        <td colSpan={4} className="border-b border-white/[0.06] pb-5 pt-1">
          {drained ? (
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pl-11">
              <p className="max-w-[46ch] text-[13px] leading-5 text-white/60">
                Ashburn is answering for São Paulo. Users there wait about 110 ms longer for a first byte, which beats 212.
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={onRestore} className="border border-white/10">
                <Undo2 aria-hidden />
                Bring it back
              </Button>
            </div>
          ) : (
            <div className="pl-11">
              <Heartbeat aria-hidden height={40} bpm={46} color="amber" className="-ml-1 opacity-90" />
              <p className="mt-2 max-w-[48ch] text-[13px] leading-5 text-white/65">
                Over the {SLO} ms SLO for 26 minutes, at {Math.round(region.load * 100)}% of capacity. Nothing is failing yet; the queue is just long.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Button type="button" variant="solid" size="sm" loading={drain === "draining"} onClick={onShift}>
                  <ArrowRightLeft aria-hidden />
                  Shift traffic to Ashburn
                </Button>
                <Meter
                  value={region.load}
                  peak={false}
                  segments={20}
                  size="sm"
                  color="amber"
                  zones={[{ from: 0 }, { from: 0.9, color: "red" }]}
                  aria-label={`${region.city} capacity in use`}
                  className="w-28"
                />
              </div>
            </div>
          )}
        </td>
      </tr>
    </>
  );
}
