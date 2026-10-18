"use client";

import * as React from "react";
import { ArrowRight, ChartColumn, Filter, LayoutGrid, Repeat, Rocket, Zap, type LucideIcon } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlowChart } from "@/components/ui/glow-chart";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const NAV: { label: string; icon: LucideIcon; count?: string }[] = [
  { label: "Overview", icon: LayoutGrid },
  { label: "Funnels", icon: Filter, count: "6" },
  { label: "Retention", icon: Repeat },
  { label: "Events", icon: Zap, count: "214" },
  { label: "Releases", icon: Rocket },
  { label: "Reports", icon: ChartColumn },
];

const METRICS = [
  { key: "visitors", label: "Visitors", value: "48,210", delta: "+12.4%", up: true, base: 1500, growth: 9, format: (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
  { key: "signups", label: "Sign-ups", value: "1,284", delta: "+18.0%", up: true, base: 34, growth: 0.5, format: (v: number) => String(v) },
  { key: "activation", label: "Activated", value: "41.2%", delta: "+3.1 pt", up: true, base: 37, growth: 0.15, format: (v: number) => `${v}%` },
  { key: "retention", label: "Week-4 retention", value: "27.0%", delta: "−0.8 pt", up: false, base: 28, growth: -0.03, format: (v: number) => `${v}%` },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

const EVENTS: { name: string; count: string; users: string; badge?: { text: string; color?: string } }[] = [
  { name: "report_exported", count: "8,412", users: "2,031", badge: { text: "Rising" } },
  { name: "seat_invited", count: "3,120", users: "1,206", badge: { text: "New in 4.2" } },
  { name: "dashboard_shared", count: "2,904", users: "988" },
  { name: "onboarding_skipped", count: "1,388", users: "1,388", badge: { text: "Watch", color: "red" } },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86_400_000;
const LAST_DAY = Date.UTC(2026, 9, 12);
// Quiet weekends, busy midweek. Indexed by getUTCDay().
const WEEKDAY = [0.72, 1.04, 1.1, 1.08, 1.02, 0.92, 0.66];

function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function series(index: number) {
  const metric = METRICS[index];
  const random = seeded(index * 97 + 13);
  const ratio = metric.key === "activation" || metric.key === "retention";
  return Array.from({ length: 30 }, (_, i) => {
    const time = LAST_DAY - (29 - i) * DAY;
    const weekday = ratio ? 1 : WEEKDAY[new Date(time).getUTCDay()];
    const raw = (metric.base + metric.growth * i) * weekday * (0.93 + random() * 0.14);
    return { x: new Date(time), y: ratio ? Math.round(raw * 10) / 10 : Math.round(raw) };
  });
}

function Dashboard() {
  const [metric, setMetric] = React.useState<MetricKey>("visitors");
  const index = METRICS.findIndex((m) => m.key === metric);
  const data = React.useMemo(() => series(index), [index]);
  const current = METRICS[index];

  return (
    <div className="grid overflow-hidden rounded-[18px] border border-white/10 bg-[#0a0b11] text-left md:grid-cols-[188px_1fr]">
      <aside className="hidden border-r border-white/[0.06] p-3 md:block">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="grid size-6 place-items-center rounded-md bg-[rgb(var(--neon)/0.16)] text-[11px] font-semibold text-[rgb(var(--neon))]">F</span>
          <span className="text-sm font-medium text-white/85">Fernway</span>
          <span className="ml-auto font-mono text-[10px] text-white/55">prod</span>
        </div>
        <ul className="mt-4 grid gap-0.5 text-[13px]">
          {NAV.map((item, i) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
                i === 0 ? "bg-white/[0.05] text-white/90" : "text-white/60",
              )}
            >
              <item.icon aria-hidden className={cn("size-3.5", i === 0 ? "text-[rgb(var(--neon))]" : "text-white/35")} />
              {item.label}
              {item.count && <span className="ml-auto font-mono text-[10px] text-white/55">{item.count}</span>}
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-center gap-2 px-2 text-[12px] text-white/55">
          <span className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" />
          <span className="font-mono tabular-nums text-white/80">312</span> online now
        </p>
      </aside>

      <div className="min-w-0 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/85">
            Overview <span className="text-white/55">· last 30 days</span>
          </p>
          <span className="hidden text-[12px] tabular-nums text-white/55 sm:block">Sep 13 – Oct 12</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {METRICS.map((m) => {
            const selected = m.key === metric;
            return (
              <button
                key={m.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setMetric(m.key)}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 text-left outline-none transition-[border-color,background-color,box-shadow] duration-200",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                  selected
                    ? "border-[rgb(var(--neon)/0.5)] bg-[rgb(var(--neon)/0.06)] shadow-[0_0_20px_-8px_rgb(var(--neon)/0.6)]"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/15",
                )}
              >
                <span className="block truncate text-[11px] text-white/60">{m.label}</span>
                <span className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-semibold tracking-[-0.02em] text-white/90 sm:text-xl">{m.value}</span>
                  <span className={cn("font-mono text-[10px]", m.up ? "text-[rgb(52_211_153)]" : "text-[rgb(255_77_94)]")}>{m.delta}</span>
                </span>
              </button>
            );
          })}
        </div>

        <GlowChart
          key={metric}
          className="mt-5"
          data={data}
          height={190}
          yTicks={3}
          label={`${current.label} per day, last 30 days`}
          xFormat={(x) => {
            const d = x as Date;
            return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
          }}
          yFormat={(v) => current.format(v)}
        />

        <table className="mt-4 w-full text-[13px]">
          <caption className="sr-only">Top events this month</caption>
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-[12px] text-white/55">
              <th scope="col" className="py-2 font-normal">Top events</th>
              <th scope="col" className="hidden py-2 text-right font-normal sm:table-cell">Users</th>
              <th scope="col" className="py-2 text-right font-normal">Count</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((event) => (
              <tr key={event.name} className="border-b border-white/[0.04] last:border-0">
                <td className="py-2.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-mono text-[12px] text-white/80">{event.name}</span>
                    {event.badge && (
                      <Badge size="sm" color={event.badge.color} className="hidden sm:inline-flex">
                        {event.badge.text}
                      </Badge>
                    )}
                  </span>
                </td>
                <td className="hidden py-2.5 text-right tabular-nums text-white/60 sm:table-cell">{event.users}</td>
                <td className="py-2.5 text-right tabular-nums text-white/75">{event.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HeroProduct() {
  return (
    <section
      aria-labelledby="tally-hero-title"
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 pt-16 text-white sm:px-8 sm:pt-24"
    >
      <div aria-hidden className="absolute -left-[10%] top-0 -z-10 h-[520px] w-[70%] bg-[radial-gradient(ellipse_60%_60%_at_30%_10%,rgb(var(--neon)/0.1),transparent_70%)]" />

      <div className="mx-auto max-w-6xl">
        <h1
          id="tally-hero-title"
          className="max-w-[15ch] text-[clamp(2.55rem,7.6vw,6.5rem)] [text-wrap:balance] font-[620] leading-[0.94] tracking-[-0.045em] text-white/95 [font-stretch:112%]"
        >
          Count what people actually do.
        </h1>

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:items-end">
          <p className="max-w-[46ch] text-[17px] leading-[1.6] text-white/60 lg:col-span-6">
            <span className="text-white/90">Tally turns the events you already log into funnels, retention curves and a straight answer to &ldquo;did that release help?&rdquo;</span>{" "}
            One script tag, no consent banner.
          </p>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
              <Button asChild variant="solid" size="lg">
                <a href="#start">
                  Start counting <ArrowRight />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="#demo">Live demo</a>
              </Button>
            </div>
            <p className="mt-4 text-[13px] text-white/55">
              Free to 100k events a month, then <span className="text-white/80">$0.09</span> per thousand.
            </p>
          </div>
        </div>

        {/* The real screen, flat and at size, running off the right edge; its light pools under it. */}
        <div className="relative mt-16 sm:mt-20">
          <div aria-hidden className="absolute inset-x-[10%] top-[10%] -z-10 h-[60%] rounded-[50%] bg-[rgb(var(--neon)/0.16)] blur-[100px]" />
          <div className="[mask-image:linear-gradient(to_bottom,#000_70%,transparent_99%)]">
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.02] p-1.5 shadow-[0_0_0_1px_rgb(0_0_0/0.6),0_40px_120px_-40px_rgb(var(--neon)/0.35)] sm:p-2">
              <Dashboard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
