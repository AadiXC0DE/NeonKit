"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "@/components/ui/icons";
import { GlowChart, Sparkline } from "@/components/ui/glow-chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DAY = 86_400_000;
const LAST_DAY = Date.UTC(2026, 9, 10);
const LAUNCH = Date.UTC(2026, 8, 22);

// A developer docs site: busy midweek, quiet at weekends. Indexed by getUTCDay().
const WEEKDAY = [0.7, 1.02, 1.1, 1.08, 1.03, 0.94, 0.66];

function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Daily unique visitors for the `days` ending `daysAgo` days before Oct 10.
function visitors(days: number, daysAgo: number) {
  const random = seeded(days * 31 + daysAgo);
  return Array.from({ length: days }, (_, i) => {
    const age = days - 1 - i + daysAgo;
    const time = LAST_DAY - age * DAY;
    const growth = 1720 - age * 3.4;
    const launch = time === LAUNCH ? 2.05 : time === LAUNCH + DAY ? 1.42 : time === LAUNCH + 2 * DAY ? 1.16 : 1;
    const weekday = WEEKDAY[new Date(time).getUTCDay()];
    return Math.round(growth * weekday * launch * (0.9 + random() * 0.2));
  });
}

const ranges = {
  "7d": { days: 7, label: "7 days" },
  "30d": { days: 30, label: "30 days" },
  "90d": { days: 90, label: "90 days" },
} as const;

type Range = keyof typeof ranges;

const tiles = [
  { label: "Avg. session", value: "3m 42s", delta: 6.1, good: true, trend: [198, 204, 201, 209, 214, 206, 211, 218, 215, 222] },
  { label: "Bounce rate", value: "38.2%", delta: -2.4, good: true, trend: [41.8, 41.2, 40.9, 41.1, 40.2, 39.6, 39.9, 39.1, 38.6, 38.2] },
  { label: "Sign-ups", value: "1,284", delta: 18, good: true, trend: [96, 104, 98, 121, 117, 132, 128, 141, 162, 155] },
];

const number = new Intl.NumberFormat("en-US");

function Delta({ value, good }: { value: number; good: boolean }) {
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={
        good
          ? "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums text-[rgb(52_211_153)]"
          : "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums text-[rgb(255_77_94)]"
      }
    >
      <Icon className="size-3.5" aria-hidden />
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function GlowChartDemo() {
  const [range, setRange] = React.useState<Range>("30d");
  const [active, setActive] = React.useState<number | null>(null);
  const { days, label } = ranges[range];

  const { series, total, change } = React.useMemo(() => {
    const current = visitors(days, 0);
    const previous = visitors(days, days);
    const dates = current.map((_, i) => new Date(LAST_DAY - (days - 1 - i) * DAY));
    const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);
    return {
      series: [
        { name: "This period", data: dates.map((x, i) => ({ x, y: current[i] })) },
        { name: `Previous ${label}`, data: dates.map((x, i) => ({ x, y: previous[i] })), type: "line" as const, muted: true },
      ],
      total: sum(current),
      change: ((sum(current) - sum(previous)) / sum(previous)) * 100,
    };
  }, [days, label]);

  const point = active !== null ? series[0].data[active] : null;
  const day = point
    ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }).format(point.x)
    : null;

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0b11] p-5 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.9)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-white/55">Unique visitors</p>
          <div className="mt-1.5 flex items-baseline gap-3">
            <p className="text-4xl font-semibold tracking-[-0.02em] text-white">
              {number.format(point ? point.y : total)}
            </p>
            {!point && <Delta value={change} good={change >= 0} />}
          </div>
          <p className="mt-1.5 text-xs text-white/50">
            {day ?? `docs.halcyon.dev · last ${label} vs the ${label} before`}
          </p>
        </div>
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
          <ToggleGroupItem value="7d">7D</ToggleGroupItem>
          <ToggleGroupItem value="30d">30D</ToggleGroupItem>
          <ToggleGroupItem value="90d">90D</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <GlowChart
        className="mt-6"
        data={series}
        label={`Unique visitors per day, last ${label}`}
        height={232}
        onActiveIndexChange={setActive}
      />

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/[0.06]">
        {tiles.map((tile) => (
          <div key={tile.label} className="grid gap-1.5 sm:px-4 sm:first:pl-0 sm:last:pr-0">
            <dt className="flex items-center justify-between gap-2 text-xs text-white/50">
              {tile.label}
              <Delta value={tile.delta} good={tile.good} />
            </dt>
            <dd className="flex items-end justify-between gap-3">
              <span className="whitespace-nowrap text-lg font-semibold leading-7 text-white/90">{tile.value}</span>
              <Sparkline data={tile.trend} width={76} height={26} label={`${tile.label}, last 10 weeks`} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
