"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { GlowChart, Sparkline } from "@/components/ui/glow-chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { RANGES, metricSeries, summarize, type Metric, type Range } from "../data";
import { compact, signed, tick } from "../parts/format";

const METRICS: Record<
  Metric,
  {
    label: string;
    chartTitle: string;
    type: "area" | "bar";
    /** Whether a rise is good news. */
    upIsGood: boolean;
    format: (v: number) => string;
    axis: (v: number) => string;
    delta: (now: number, before: number) => { value: number; text: string };
    threshold?: { y: number; label: string };
  }
> = {
  requests: {
    label: "Requests",
    chartTitle: "Requests served",
    type: "area",
    upIsGood: true,
    format: compact,
    axis: tick,
    delta: (now, before) => {
      const value = ((now - before) / before) * 100;
      return { value, text: `${signed(value)}%` };
    },
  },
  latency: {
    label: "p95 latency",
    chartTitle: "p95 latency, all regions",
    type: "area",
    upIsGood: false,
    format: (v) => `${Math.round(v)} ms`,
    axis: (v) => `${Math.round(v)} ms`,
    delta: (now, before) => ({ value: now - before, text: `${signed(now - before, 0)} ms` }),
    threshold: { y: 60, label: "SLO 60 ms" },
  },
  errors: {
    label: "Error rate",
    chartTitle: "5xx error rate",
    type: "area",
    upIsGood: false,
    format: (v) => `${v.toFixed(3)}%`,
    axis: (v) => `${v.toFixed(2)}%`,
    delta: (now, before) => ({ value: now - before, text: `${signed(now - before, 3)} pt` }),
    threshold: { y: 0.1, label: "SLO 0.1%" },
  },
  deploys: {
    label: "Deploys",
    chartTitle: "Deploys shipped",
    type: "bar",
    upIsGood: true,
    format: (v) => Math.round(v).toLocaleString("en-US"),
    axis: (v) => `${Math.round(v)}`,
    delta: (now, before) => ({ value: now - before, text: `${signed(now - before, 0)}` }),
  },
};

const weekHour = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });
const weekLong = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });

const ORDER: Metric[] = ["requests", "latency", "errors", "deploys"];

export function Traffic({ className }: { className?: string }) {
  const [metric, setMetric] = React.useState<Metric>("requests");
  const [range, setRange] = React.useState<Range>("24h");
  const [active, setActive] = React.useState<number | null>(null);

  const all = React.useMemo(
    () =>
      Object.fromEntries(
        ORDER.map((m) => {
          const { current, previous } = metricSeries(m, range);
          const now = summarize(m, current.map((p) => p.y));
          const before = summarize(m, previous.map((p) => p.y));
          return [m, { current, previous, now, before }];
        }),
      ) as Record<Metric, { current: { x: Date; y: number }[]; previous: { x: Date; y: number }[]; now: number; before: number }>,
    [range],
  );

  const spec = METRICS[metric];
  const { current, previous, now } = all[metric];
  const point = active !== null ? current[active] : null;
  const data =
    spec.type === "bar"
      ? [{ name: spec.label, data: current }]
      : [
          { name: spec.label, data: current },
          { name: "Previous period", data: current.map((p, i) => ({ x: p.x, y: previous[i].y })), type: "line" as const, muted: true },
        ];

  return (
    <section aria-labelledby="traffic-title" className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]", className)}>
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {ORDER.map((m, i) => {
          const s = METRICS[m];
          const { now: value, before, current: points } = all[m];
          const delta = s.delta(value, before);
          const good = delta.value === 0 || delta.value > 0 === s.upIsGood;
          const selected = m === metric;
          const Arrow = delta.value >= 0 ? ArrowUpRight : ArrowDownRight;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={selected}
              aria-label={`${s.label}: ${s.format(value)}, ${delta.text} versus the previous ${RANGES[range].label}. Show on chart`}
              onClick={() => {
                setActive(null);
                setMetric(m);
              }}
              className={cn(
                "group relative min-w-0 cursor-pointer p-4 text-left outline-none transition-colors duration-200 sm:p-5",
                "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                i % 2 === 1 && "border-l border-white/[0.07]",
                i > 1 && "border-t border-white/[0.07] lg:border-t-0",
                i === 2 && "lg:border-l",
                selected ? "bg-[linear-gradient(180deg,rgb(var(--neon)/0.07),transparent_75%)]" : "hover:bg-white/[0.02]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 top-0 h-[2px] transition-opacity duration-300",
                  "bg-[linear-gradient(90deg,transparent,rgb(var(--neon))_20%,rgb(255_255_255/0.9)_50%,rgb(var(--neon))_80%,transparent)]",
                  "shadow-[0_0_12px_rgb(var(--neon)/0.9),0_0_28px_rgb(var(--neon)/0.45)]",
                  selected ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="flex items-center justify-between gap-3">
                <span className={cn("truncate text-[13px] transition-colors", selected ? "text-white/90" : "text-white/60 group-hover:text-white/80")}>{s.label}</span>
                <Sparkline
                  aria-hidden
                  data={points.map((p) => p.y)}
                  width={64}
                  height={20}
                  dot={false}
                  area={false}
                  color={selected ? undefined : "white"}
                  className={cn("hidden shrink-0 transition-opacity sm:block", selected ? "opacity-100" : "opacity-40")}
                />
              </span>
              <span className="mt-3 block text-[24px] font-semibold leading-none tracking-[-0.035em] text-white tabular-nums sm:text-[30px]">
                {s.format(value)}
              </span>
              <span className="mt-2.5 flex items-center gap-1.5 text-xs">
                <span className={cn("inline-flex items-center gap-0.5 font-medium tabular-nums", good ? "text-[rgb(52_211_153)]" : "text-[rgb(255_107_120)]")}>
                  <Arrow aria-hidden className="size-3.5" />
                  {delta.text}
                </span>
                <span className="hidden truncate text-white/55 sm:inline">vs prior {range}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative border-t border-white/[0.07] p-4 sm:p-6">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/4 h-48 w-1/2 rounded-full bg-[rgb(var(--neon)/0.08)] blur-[70px]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="traffic-title" className="text-sm text-white/60">
              {spec.chartTitle}
            </h2>
            <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">
              {point ? spec.format(point.y) : spec.format(now)}
            </p>
            <p className="mt-2 h-4 text-xs text-white/55">
              {point
                ? new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    ...(range === "30d" ? {} : { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
                    timeZone: "UTC",
                  }).format(point.x)
                : `${spec.type === "bar" || metric === "requests" ? "Total" : "Average"}, last ${RANGES[range].label}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {spec.type !== "bar" && (
              <div aria-hidden className="hidden items-center gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55 sm:flex">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" />
                  Now
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded-full bg-white/35" />
                  Prior
                </span>
              </div>
            )}
            <ToggleGroup
              size="sm"
              aria-label="Time range"
              value={range}
              onValueChange={(v) => {
                if (!v) return;
                setActive(null);
                setRange(v as Range);
              }}
            >
              <ToggleGroupItem value="24h">24h</ToggleGroupItem>
              <ToggleGroupItem value="7d">7d</ToggleGroupItem>
              <ToggleGroupItem value="30d">30d</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <GlowChart
          key={`${metric}-${range}`}
          className="relative mt-6"
          type={spec.type}
          data={data}
          legend={false}
          height={260}
          thresholds={spec.threshold ? [{ ...spec.threshold, color: "white" }] : undefined}
          label={`${spec.chartTitle}, last ${RANGES[range].label}`}
          yFormat={(v, ctx) => (ctx === "axis" ? spec.axis(v) : spec.format(v))}
          // Four-hour buckets would repeat the date on every tick, so the week reads as weekday and hour.
          xFormat={range === "7d" ? (x, ctx) => (ctx === "axis" ? weekHour.format(x as Date) : weekLong.format(x as Date)) : undefined}
          onActiveIndexChange={setActive}
        />
      </div>
    </section>
  );
}
