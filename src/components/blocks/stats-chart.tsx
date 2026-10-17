"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "@/components/ui/icons";
import { GlowChart } from "@/components/ui/glow-chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;
const TODAY = Date.UTC(2026, 9, 12);
// 48,000 endpoints today, once a minute each; the fleet grows by ~26 a day.
const endpointsOn = (daysAgo: number) => 48_000 - daysAgo * 26;
const SLO_MS = 400;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Outages over the last 180 days: days ago, minutes of downtime, p95 that day.
const incidents = [
  { daysAgo: 4, minutes: 7, peak: 640, cause: "eu-west resolver timeouts" },
  { daysAgo: 19, minutes: 3, peak: 470, cause: "Probe fleet redeploy, us-east" },
  { daysAgo: 37, minutes: 12, peak: 820, cause: "Upstream transit loss, Frankfurt" },
  { daysAgo: 61, minutes: 5, peak: 560, cause: "TLS handshake regression" },
  { daysAgo: 83, minutes: 21, peak: 1040, cause: "Queue backlog after a schema migration" },
  { daysAgo: 104, minutes: 9, peak: 610, cause: "Certificate rotation, ap-south" },
  { daysAgo: 121, minutes: 14, peak: 730, cause: "Storage failover, us-west" },
  { daysAgo: 140, minutes: 4, peak: 450, cause: "DNS provider incident" },
  { daysAgo: 166, minutes: 26, peak: 1180, cause: "Region-wide power event, Singapore" },
];

const ranges = { "7d": 7, "30d": 30, "90d": 90 } as const;
type Range = keyof typeof ranges;

function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// p95 response time per day for the last 180 days, oldest first. Busier
// weekdays run a little slower; outage days spike.
const history = (() => {
  const random = seeded(4817);
  return Array.from({ length: 180 }, (_, i) => {
    const daysAgo = 179 - i;
    const time = TODAY - daysAgo * DAY;
    const weekday = new Date(time).getUTCDay();
    const load = weekday === 0 || weekday === 6 ? 0.9 : 1.04;
    const incident = incidents.find((item) => item.daysAgo === daysAgo);
    const p95 = incident ? incident.peak : Math.round((172 + daysAgo * 0.12) * load * (0.92 + random() * 0.16));
    return { x: new Date(time), y: p95, daysAgo };
  });
})();

function summarize(days: number, offset: number) {
  const inRange = (daysAgo: number) => daysAgo >= offset && daysAgo < offset + days;
  const points = history.filter((point) => inRange(point.daysAgo));
  const down = incidents.filter((item) => inRange(item.daysAgo));
  const minutes = down.reduce((sum, item) => sum + item.minutes, 0);
  return {
    points,
    incidents: down,
    uptime: 100 - (minutes / (days * 1440)) * 100,
    checks: points.reduce((sum, point) => sum + endpointsOn(point.daysAgo) * 1440, 0),
    mttr: down.length ? minutes / down.length : 0,
    p95: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  };
}

function formatDate(date: Date) {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function formatChecks(value: number) {
  return value >= 1e9 ? `${(value / 1e9).toFixed(2)}B` : `${Math.round(value / 1e6)}M`;
}

function formatMinutes(value: number) {
  const whole = Math.floor(value);
  return `${whole}m ${String(Math.round((value - whole) * 60)).padStart(2, "0")}s`;
}

function Delta({ text, good, up }: { text: string; good: boolean; up: boolean }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[12px] tabular-nums",
        good
          ? "bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))]"
          : "bg-[rgb(255_77_94/0.1)] text-[rgb(255_77_94)]",
      )}
    >
      <Icon aria-hidden className="size-3" />
      {text}
    </span>
  );
}

export default function StatsChart() {
  const titleId = React.useId();
  const [range, setRange] = React.useState<Range>("30d");
  const [active, setActive] = React.useState<number | null>(null);
  const days = ranges[range];

  const { now, before } = React.useMemo(() => ({ now: summarize(days, 0), before: summarize(days, days) }), [days]);

  const kpis = [
    {
      label: "Uptime",
      value: `${now.uptime.toFixed(3)}%`,
      delta: `${Math.abs(now.uptime - before.uptime).toFixed(3)} pts`,
      up: now.uptime >= before.uptime,
      good: now.uptime >= before.uptime,
    },
    {
      label: "Checks run",
      value: formatChecks(now.checks),
      delta: `${(((now.checks - before.checks) / before.checks) * 100).toFixed(1)}%`,
      up: true,
      good: true,
    },
    {
      label: "Incidents",
      value: String(now.incidents.length),
      delta: `${Math.abs(now.incidents.length - before.incidents.length)}`,
      up: now.incidents.length > before.incidents.length,
      good: now.incidents.length <= before.incidents.length,
    },
    {
      label: "Time to recover",
      value: now.incidents.length ? formatMinutes(now.mttr) : "—",
      delta: formatMinutes(Math.abs(now.mttr - before.mttr)),
      up: now.mttr > before.mttr,
      good: now.mttr <= before.mttr,
    },
  ];

  const point = active !== null ? now.points[active] : null;
  const peak = Math.max(...now.points.map((p) => p.y));
  const [uptime, ...rest] = kpis;

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("green")}
      className="relative overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div>
          <h2
            id={titleId}
            className="max-w-[24ch] text-[clamp(2.2rem,4.4vw,3.6rem)] font-[620] leading-[0.98] tracking-[-0.04em] text-white [font-stretch:112%]"
          >
            48,000 endpoints, checked every minute from 14 regions.
          </h2>
          <p className="mt-6 max-w-[52ch] text-pretty text-[17px] leading-[1.6] text-white/60">
            <span className="text-white/90">Groundwork&apos;s own monitoring, monitored by us.</span> Every outage below
            has a public write-up.
          </p>
        </div>

        {/* The headline figure, then the three that explain it. */}
        <div className="mt-16 grid gap-10 border-t border-white/[0.08] pt-8 sm:mt-20 lg:grid-cols-12 lg:gap-8">
          <dl className="lg:col-span-5">
            <dt className="text-[14px] text-white/60">{uptime.label}, last {days} days</dt>
            <dd className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[clamp(3.5rem,8vw,6.25rem)] font-[620] leading-[0.9] tracking-[-0.045em] text-white [font-stretch:112%]">
                {uptime.value}
              </span>
              <Delta text={uptime.delta} good={uptime.good} up={uptime.up} />
            </dd>
          </dl>
          <div className="flex flex-col gap-8 lg:col-span-7 lg:items-end">
            <ToggleGroup
              size="sm"
              aria-label="Date range"
              value={range}
              onValueChange={(value) => {
                if (!value) return;
                setActive(null);
                setRange(value as Range);
              }}
            >
              <ToggleGroupItem value="7d" className="h-8 sm:h-7">7 days</ToggleGroupItem>
              <ToggleGroupItem value="30d" className="h-8 sm:h-7">30 days</ToggleGroupItem>
              <ToggleGroupItem value="90d" className="h-8 sm:h-7">90 days</ToggleGroupItem>
            </ToggleGroup>
            <dl className="grid w-full grid-cols-3 gap-4 sm:gap-6 lg:max-w-[620px]">
              {rest.map((kpi) => (
                <div key={kpi.label} className="flex flex-col gap-2 border-l border-white/[0.08] pl-3 first:border-l-0 first:pl-0 sm:pl-5 sm:first:border-l sm:first:pl-5">
                  <dt className="text-[13px] text-white/60 sm:text-[14px]">{kpi.label}</dt>
                  <dd className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="text-[clamp(1.35rem,2.6vw,2.1rem)] font-[620] leading-none tracking-[-0.03em] text-white [font-stretch:112%]">
                      {kpi.value}
                    </span>
                    <Delta text={kpi.delta} good={kpi.good} up={kpi.up} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="text-[15px] font-medium text-white/90">p95 response time, all regions</p>
            <p aria-live="polite" className="text-[13px] text-white/60">
              {point ? (
                <>
                  {formatDate(point.x)} <span className="ml-1.5 font-mono tabular-nums text-white/90">{point.y} ms</span>
                </>
              ) : (
                <>
                  {days}-day average <span className="ml-1.5 font-mono tabular-nums text-white/90">{Math.round(now.p95)} ms</span>
                </>
              )}
            </p>
          </div>
          <GlowChart
            key={range}
            data={now.points.map(({ x, y }) => ({ x, y }))}
            label={`p95 response time per day, last ${days} days`}
            height={300}
            yDomain={[0, Math.max(800, Math.ceil((peak * 1.15) / 200) * 200)]}
            thresholds={[{ y: SLO_MS, label: `SLO ${SLO_MS} ms`, color: "#e6edf7" }]}
            yFormat={(value) => `${Math.round(value)} ms`}
            xFormat={(x) => formatDate(x as Date)}
            curve="linear"
            onActiveIndexChange={setActive}
          />
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:gap-8">
          <h3 className="text-[15px] font-medium text-white/90 lg:col-span-4">
            {now.incidents.length} {now.incidents.length === 1 ? "incident" : "incidents"} in this range
          </h3>
          <ul className="border-b border-white/[0.07] lg:col-span-8">
            {now.incidents.map((incident) => (
              <li
                key={incident.daysAgo}
                className="grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-x-3 border-t border-white/[0.07] py-3 text-[14px] sm:grid-cols-[4.5rem_1fr_auto] sm:gap-x-4"
              >
                <span className="font-mono text-[12.5px] tabular-nums text-white/60">
                  {formatDate(new Date(TODAY - incident.daysAgo * DAY))}
                </span>
                <span className="min-w-0 text-white/80">
                  {incident.cause}
                  <span className="ml-2.5 whitespace-nowrap font-mono text-[12.5px] tabular-nums text-white/55">
                    {incident.minutes} min
                  </span>
                </span>
                <a
                  href="#"
                  className="-my-2 rounded-md py-2 text-[13px] text-white/60 underline decoration-white/20 underline-offset-4 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                >
                  Write-up
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
