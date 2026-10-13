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
          // Clean days stay quiet; only the bad ones carry colour.
          const rgb = v === 100 ? "var(--neon)" : v > 99 ? AMBER : RED;
          return (
            <span
              key={i}
              onMouseEnter={() => setHover(i)}
              className="flex-1 rounded-[1.5px] transition-[background-color,box-shadow] duration-150"
              style={{
                background: `rgb(${rgb} / ${i === hover ? 1 : v === 100 ? 0.16 : 0.8})`,
                boxShadow: i === hover ? `0 0 8px rgb(${rgb} / 0.8)` : undefined,
              }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-3 text-[12px] text-white/50">
        <span className={cn("transition-colors", hover !== null && "text-white/85")}>
          {ago === 0 ? "Today" : dayLabel(ago)} <span className="tabular-nums text-white/70">{slice[shown].toFixed(2)}%</span>
        </span>
        <span>
          <span className="tabular-nums text-white/70">{average.toFixed(2)}%</span> over {days} days
        </span>
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
        <div className="flex items-center justify-between gap-4 text-[13px] text-white/55">
          <span className="flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.01em] text-white/90">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8" className="text-white/50" stroke="currentColor" />
            </svg>
            Groundcontrol
          </span>
          <span>
            Updated <span className="font-mono tabular-nums text-white/75">02:14 UTC</span>
          </span>
        </div>

        <header className="mt-14 grid gap-10 sm:mt-16 lg:grid-cols-12 lg:items-end">
          <h1
            id="gc-status-title"
            className="text-[clamp(2.6rem,6.2vw,5rem)] font-[620] leading-[0.96] tracking-[-0.04em] [font-stretch:112%] lg:col-span-8"
          >
            {degraded ? (
              <>
                <span className="text-[rgb(251_191_36)] [text-shadow:0_0_24px_rgb(251_191_36/0.35)]">1 system</span> degraded.
                <span className="block text-white/40">The rest are flying.</span>
              </>
            ) : (
              <>
                All systems nominal.
                <span className="block text-white/40">Five of five reporting.</span>
              </>
            )}
          </h1>
          <dl className="grid grid-cols-3 gap-6 lg:col-span-4 lg:pb-2">
            {[
              ["Uptime, 90 days", `${FLEET_UPTIME.toFixed(2)}%`],
              ["p95 latency", degraded ? "212 ms" : "64 ms"],
              ["Open incidents", String(degraded)],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col-reverse">
                <dt className="mt-1 text-[13px] leading-snug text-white/55">{k}</dt>
                <dd className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-[560] tabular-nums tracking-[-0.02em] text-white/90">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* The fleet pulse runs the full width: one trace for 1,440 checks a minute. */}
        <div className="relative mt-10 border-y border-white/[0.06]">
          <div aria-hidden className="absolute inset-x-[20%] bottom-0 h-14 rounded-full bg-[rgb(var(--neon)/0.1)] blur-[40px]" />
          <Heartbeat
            bpm={degraded ? 84 : 66}
            height={84}
            aria-label={degraded ? "Fleet heartbeat, one service degraded" : "Fleet heartbeat, all checks reporting"}
            className="relative"
          />
          <p className="absolute bottom-2 right-0 text-[12px] text-white/50">
            <span className="font-mono tabular-nums text-white/70">1,440</span> checks a minute
          </p>
        </div>

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <section aria-labelledby="gc-services">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="gc-services" className="text-xl font-[620] tracking-[-0.03em] [font-stretch:112%]">Services</h2>
              <ToggleGroup size="sm" aria-label="Uptime range" value={days} onValueChange={(v) => v && setDays(v)}>
                <ToggleGroupItem value="30" className="max-sm:h-8">30 days</ToggleGroupItem>
                <ToggleGroupItem value="90" className="max-sm:h-8">90 days</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <ul className="mt-4 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {SERVICES.map((s, i) => {
                const down = s.id === INCIDENT.service && !resolved;
                const wobble = Math.sin(tick * (0.9 + i * 0.6) + i * 2) * 0.12;
                const load = Math.min(1, Math.max(0, (down ? s.load : s.load * 0.7) + wobble));
                return (
                  <li key={s.id} className="grid gap-4 py-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2.5 text-[15px] font-medium">
                          <span
                            aria-hidden
                            className="size-1.5 shrink-0 rounded-full"
                            style={{
                              background: down ? `rgb(${AMBER})` : "rgb(var(--neon) / 0.7)",
                              boxShadow: down ? `0 0 8px rgb(${AMBER} / 0.8)` : undefined,
                            }}
                          />
                          <span className="truncate">{s.name}</span>
                        </p>
                        <p className="mt-1 pl-4 text-[13px] text-white/55 sm:truncate">
                          {s.where} ·{" "}
                          <span className={cn("whitespace-nowrap tabular-nums", down ? "text-[rgb(251_191_36)]" : "text-white/70")}>
                            {down ? 412 : s.latency} ms
                          </span>
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
                        <span className="w-9 text-right font-mono text-[12px] tabular-nums text-white/60">{Math.round(load * 100)}%</span>
                      </div>
                    </div>
                    <UptimeBars days={Number(days)} data={HISTORY[s.id]} degradedToday={s.id === INCIDENT.service} />
                  </li>
                );
              })}
            </ul>
          </section>

          <aside aria-labelledby="gc-incidents" className="grid content-start gap-10">
            <div>
              <h2 id="gc-incidents" className="text-xl font-[620] tracking-[-0.03em] [font-stretch:112%]">Incidents</h2>

              <div
                className={cn(
                  "mt-4 rounded-xl border bg-white/[0.02] p-5 transition-[border-color,box-shadow] duration-300",
                  resolved ? "border-white/10" : "border-[rgb(251_191_36/0.3)] shadow-[0_0_40px_-12px_rgb(251_191_36/0.25)]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-white/55">
                      <span className="font-mono text-white/70">GC-418</span> in Orbit determination
                    </p>
                    <h3 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-white/90">{INCIDENT.title}</h3>
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
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4">
                  <Button size="sm" variant={resolved ? "ghost" : "outline"} onClick={() => setResolved((r) => !r)}>
                    {resolved ? "Reopen incident" : "Mark resolved"}
                  </Button>
                  <span className="text-[13px] text-white/55">{resolved ? "Post-mortem due Friday" : "On call: Ruth Okonkwo"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[15px] font-medium tracking-[-0.01em] text-white/85">Earlier this quarter</h3>
              <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {PAST.map((p) => (
                  <li key={p.title} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 py-3.5 text-sm">
                    <span className="text-[13px] leading-5 tabular-nums text-white/55">{p.date}</span>
                    <span>
                      <span className="block leading-5 text-white/80">{p.title}</span>
                      <span className="mt-0.5 block text-[13px] text-white/50">
                        Resolved in <span className="tabular-nums text-white/70">{p.length}</span>
                      </span>
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
