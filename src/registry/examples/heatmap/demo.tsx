"use client";

import * as React from "react";
import { Heatmap, type HeatmapCell, type HeatmapDatum } from "@/components/ui/heatmap";

const END = "2026-10-16";

// A seeded year so the server and the browser draw the same grid.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEPLOYS: HeatmapDatum[] = (() => {
  const random = seeded(4127);
  const end = Date.UTC(2026, 9, 16);
  const out: HeatmapDatum[] = [];
  for (let i = 364; i >= 0; i--) {
    const time = end - i * 86_400_000;
    const date = new Date(time);
    const dow = date.getUTCDay();
    const iso = date.toISOString().slice(0, 10);
    const weekend = dow === 0 || dow === 6;
    // Code freeze over the holidays, a launch push in March, Fridays a little lighter.
    const freeze = iso >= "2025-12-22" && iso <= "2026-01-04";
    const launch = iso >= "2026-03-02" && iso <= "2026-03-20";
    let value = weekend ? (random() < 0.22 ? Math.ceil(random() * 2) : 0) : Math.round(2 + random() * 7 + (dow === 5 ? -2 : 0));
    if (launch && !weekend) value += Math.round(4 + random() * 8);
    if (freeze) value = random() < 0.12 ? 1 : 0;
    if (!weekend && random() < 0.06) value = 0;
    out.push({ date: iso, value: Math.max(0, value) });
  }
  return out;
})();

const TOTAL = DEPLOYS.reduce((sum, d) => sum + d.value, 0);
const BUSIEST = DEPLOYS.reduce((a, b) => (b.value > a.value ? b : a));

function detail(cell: HeatmapCell) {
  const v = cell.value ?? 0;
  if (v === 0) return "Nothing shipped.";
  const rolledBack = v > 9 ? 1 : 0;
  const build = 140 + ((v * 37) % 90);
  return `${v} to production${rolledBack ? `, ${rolledBack} rolled back` : ""}. Median build ${Math.floor(build / 60)}m ${String(build % 60).padStart(2, "0")}s.`;
}

const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });

export default function HeatmapDemo() {
  const [cell, setCell] = React.useState<HeatmapCell | null>(null);

  return (
    <div className="grid w-full max-w-[920px] gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-[15px] font-medium text-white/90">
          <span className="tabular-nums">{TOTAL.toLocaleString("en-US")}</span> deploys to production in the last year
        </p>
        <p className="text-[13px] text-white/50">
          Busiest: <span className="tabular-nums text-white/70">{BUSIEST.value}</span> on {LONG.format(new Date(`${BUSIEST.date}T00:00:00Z`))}
        </p>
      </div>
      <Heatmap
        aria-label="Deploys per day"
        data={DEPLOYS}
        end={END}
        unit={["deploy", "deploys"]}
        onValueChange={(_, next) => setCell(next)}
        footer={
          <span aria-live="polite">
            {cell?.date ? (
              <>
                <span className="text-white/80">{LONG.format(new Date(`${cell.date}T00:00:00Z`))}</span>
                <span className="ml-2">{detail(cell)}</span>
              </>
            ) : (
              "Pick a day for its deploys."
            )}
          </span>
        }
      />
    </div>
  );
}
