"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heartbeat } from "@/components/ui/heartbeat";
import { Meter } from "@/components/ui/meter";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const AMBER = "251 191 36";
const RED = "255 77 94";

const SERVICES = [
  { id: "ingest", name: "Telemetry ingest", where: "SVB-1 Svalbard", latency: 41, load: 0.52, seed: 11 },
  { id: "uplink", name: "Command uplink", where: "PAR-2 Punta Arenas", latency: 63, load: 0.38, seed: 23 },
  { id: "orbit", name: "Orbit determination", where: "eu-central", latency: 61, load: 0.88, seed: 37 },
  { id: "passes", name: "Pass scheduler", where: "global", latency: 18, load: 0.24, seed: 41 },
  { id: "archive", name: "Archive API", where: "us-west", latency: 88, load: 0.46, seed: 53 },
];

const INCIDENT = {
  service: "orbit",
  title: "Slow orbit solutions for LEO passes",
  updates: [
    { title: "Investigating", time: "01:42 UTC", body: "Solution latency above 400 ms. Pass predictions still within tolerance." },
    { title: "Identified", time: "01:58 UTC", body: "A stale space-weather feed is forcing full recomputes on every request." },
    { title: "Fix deployed", time: "02:11 UTC", body: "Feed cache restored on all four solver nodes." },
  ],
};

const PAST = [
  { date: "Oct 2", title: "Uplink handshake failures at PAR-2", length: "38 min" },
  { date: "Sep 19", title: "Archive API returning 503 for bulk exports", length: "1 h 12 min" },
  { date: "Aug 30", title: "Telemetry backlog after Svalbard fibre cut", length: "2 h 05 min" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = Date.UTC(2026, 9, 13);
const dayLabel = (daysAgo: number) => {
  const d = new Date(TODAY - daysAgo * 86_400_000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

// Seeded so the server and the browser draw the same 90 days.
function history(seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 90 }, () => {
    const r = rand();
    return r > 0.992 ? 97.1 + rand() * 1.5 : r > 0.962 ? 99.2 + rand() * 0.6 : 100;
  });
}

const HISTORY = Object.fromEntries(SERVICES.map((s) => [s.id, history(s.seed)]));
const FLEET_UPTIME = Object.values(HISTORY).flat().reduce((a, b) => a + b, 0) / (SERVICES.length * 90);

function UptimeBars({ days, data, degradedToday }: { days: number; data: number[]; degradedToday: boolean }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const slice = data.slice(90 - days).map((v, i, all) => (i === all.length - 1 && degradedToday ? 98.4 : v));
  const average = slice.reduce((a, b) => a + b, 0) / slice.length;
  const shown = hover ?? slice.length - 1;
  const ago = slice.length - 1 - shown;

  return (
    <div>
      <div
        className="flex h-6 gap-px sm:gap-[2px]"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`${average.toFixed(2)}% uptime over ${days} days`}
      >
        {slice.map((v, i) => {
          const rgb = v === 100 ? "var(--neon)" : v > 99 ? AMBER : RED;
          return (
            <span
              key={i}
              onMouseEnter={() => setHover(i)}
              className="flex-1 rounded-[1.5px] transition-[background-color,box-shadow] duration-150"
              style={{
                background: `rgb(${rgb} / ${i === hover ? 1 : v === 100 ? 0.3 : 0.75})`,
                boxShadow: i === hover ? `0 0 8px rgb(${rgb} / 0.8)` : undefined,
              }}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between gap-3 font-mono text-[11px] text-white/55">
        <span className={cn(hover !== null && "text-white/85")}>
          {ago === 0 ? "Today" : dayLabel(ago)} · {slice[shown].toFixed(2)}%
        </span>
        <span>{average.toFixed(2)}% · {days}d</span>
      </div>
    </div>
  );
}

export default function AppServerStatus() {
  const [days, setDays] = React.useState("90");
  const [resolved, setResolved] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1200);
    return () => window.clearInterval(id);
  }, []);

  const degraded = resolved ? 0 : 1;

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      aria-labelledby="gc-status-title"
      className="relative isolate overflow-hidden bg-[#05060a] px-4 py-8 text-white/90 sm:px-8 sm:py-10"
    >
      <div className="mx-auto max-w-[1240px]">
        <header className="grid gap-8 border-b border-white/[0.06] pb-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Groundcontrol · Status board</p>
            <h1 id="gc-status-title" className="mt-3 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              {degraded ? (
                <>
                  1 system degraded.
                  <span className="block text-white/40">The rest are flying.</span>
                </>
              ) : (
                <>
                  All systems nominal.
                  <span className="block text-white/40">Five of five reporting.</span>
                </>
              )}
            </h1>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div aria-hidden className="absolute inset-x-10 bottom-0 h-16 rounded-full bg-[rgb(var(--neon)/0.14)] blur-[40px]" />
            <div className="relative flex items-center justify-between px-4 pt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
              <span>Fleet pulse</span>
              <span className="text-white/70">1,440 checks / min</span>
            </div>
            <Heartbeat bpm={degraded ? 84 : 66} height={92} aria-label="Fleet heartbeat, all checks reporting" className="relative" />
            <dl className="relative grid grid-cols-3 border-t border-white/[0.06] text-center">
              {[
                ["Uptime 90d", `${FLEET_UPTIME.toFixed(2)}%`],
                ["p95", degraded ? "212 ms" : "64 ms"],
                ["Open", String(degraded)],
              ].map(([k, v]) => (
                <div key={k} className="border-r border-white/[0.06] px-2 py-2.5 last:border-r-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">{k}</dt>
                  <dd className="mt-0.5 text-sm tabular-nums text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          <section aria-labelledby="gc-services">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="gc-services" className="text-lg font-semibold tracking-[-0.02em]">Services</h2>
              <ToggleGroup size="sm" aria-label="Uptime range" value={days} onValueChange={(v) => v && setDays(v)}>
                <ToggleGroupItem value="30" className="max-sm:h-8">30 days</ToggleGroupItem>
                <ToggleGroupItem value="90" className="max-sm:h-8">90 days</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <ul className="mt-4 divide-y divide-white/[0.06] rounded-2xl border border-white/10 bg-white/[0.02]">
              {SERVICES.map((s, i) => {
                const down = s.id === INCIDENT.service && !resolved;
                const wobble = Math.sin(tick * (0.9 + i * 0.6) + i * 2) * 0.12;
                const load = Math.min(1, Math.max(0, (down ? s.load : s.load * 0.7) + wobble));
                return (
                  <li key={s.id} className="grid gap-4 p-4 sm:p-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2.5 text-[15px] font-medium">
                          <span
                            aria-hidden
                            className="size-1.5 shrink-0 rounded-full"
                            style={{ background: `rgb(${down ? AMBER : "var(--neon)"})`, boxShadow: `0 0 8px rgb(${down ? AMBER : "var(--neon)"} / 0.8)` }}
                          />
                          <span className="truncate">{s.name}</span>
                        </p>
                        <p className="mt-1 pl-4 font-mono text-[11px] text-white/55 sm:truncate">
                          {s.where} <span className="whitespace-nowrap">· <span className={down ? "text-[rgb(251_191_36)]" : undefined}>{down ? 412 : s.latency} ms</span></span>
                        </p>
                      </div>
                      {/* Only a service in trouble gets a live trace; healthy rows stay quiet. */}
                      {down ? (
                        <Heartbeat bpm={118} height={36} color="amber" aria-label={`${s.name} degraded`} className="hidden sm:block" />
                      ) : (
                        <span aria-hidden className="hidden sm:block" />
                      )}
                      <div className="flex items-center gap-2.5">
                        <Meter aria-label={`${s.name} load`} size="sm" segments={14} value={load} peakHold={2400} className="w-[84px] sm:w-[112px]" />
                        <span className="w-9 text-right font-mono text-[11px] tabular-nums text-white/60">{Math.round(load * 100)}%</span>
                      </div>
                    </div>
                    <UptimeBars days={Number(days)} data={HISTORY[s.id]} degradedToday={s.id === INCIDENT.service} />
                  </li>
                );
              })}
            </ul>
          </section>

          <aside aria-labelledby="gc-incidents" className="grid content-start gap-6">
            <div className="flex items-center justify-between">
              <h2 id="gc-incidents" className="text-lg font-semibold tracking-[-0.02em]">Incidents</h2>
              <span className="font-mono text-[11px] text-white/55">Updated 02:14 UTC</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">GC-418 · Orbit determination</p>
                  <h3 className="mt-1.5 text-base font-semibold leading-snug text-white/90">{INCIDENT.title}</h3>
                </div>
                {resolved ? <Badge size="sm" dot>Resolved</Badge> : <Badge size="sm" color="amber" pulse>Monitoring</Badge>}
              </div>
              <Timeline className="mt-5">
                {INCIDENT.updates.map((u) => (
                  <TimelineItem key={u.title} title={u.title} time={u.time}>{u.body}</TimelineItem>
                ))}
                <TimelineItem status={resolved ? "done" : "current"} title="Monitoring" time="02:14 UTC">
                  Latency back to 190 ms and falling. Watching the next three passes.
                </TimelineItem>
                <TimelineItem status={resolved ? "current" : "upcoming"} title="Resolved" time={resolved ? "02:31 UTC" : undefined}>
                  {resolved ? "Solutions at 61 ms across the fleet. Closing this out." : undefined}
                </TimelineItem>
              </Timeline>
              <div className="mt-5 flex items-center gap-3">
                <Button size="sm" variant={resolved ? "ghost" : "outline"} onClick={() => setResolved((r) => !r)}>
                  {resolved ? "Reopen incident" : "Mark resolved"}
                </Button>
                <span className="font-mono text-[11px] text-white/55">{resolved ? "Post-mortem due Fri" : "On call: R. Okonkwo"}</span>
              </div>
            </div>

            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Past 90 days</h3>
              <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {PAST.map((p) => (
                  <li key={p.title} className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 py-3 text-sm">
                    <span className="font-mono text-[11px] leading-5 text-white/55">{p.date}</span>
                    <span>
                      <span className="block leading-5 text-white/75">{p.title}</span>
                      <span className="font-mono text-[11px] text-white/55">Resolved · {p.length}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
