"use client";

import * as React from "react";
import { Cable, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heartbeat } from "@/components/ui/heartbeat";
import { Knob } from "@/components/ui/knob";
import { Meter } from "@/components/ui/meter";
import { SevenSegment } from "@/components/ui/seven-segment";
import { Terminal } from "@/components/ui/terminal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

// Meters span -48 to 0 dBFS. `base` is each stream's average level on that scale, `swing` how much it moves.
const STREAMS = [
  { id: "kxlr-fm/main", base: 0.8, swing: 0.13, pulse: 2.1 },
  { id: "studio-b/mic-2", base: 0.6, swing: 0.2, pulse: 4.6 },
  { id: "pod-212/mix", base: 0.7, swing: 0.12, pulse: 1.4 },
  { id: "lobby/bgm", base: 0.45, swing: 0.05, pulse: 0.6 },
  { id: "ch-04/backup", base: 0.1, swing: 0.02, pulse: 0.3 },
];

const LATENCY = {
  srt: { label: "SRT", seconds: "0.38", note: "p95 over 24h · 41 edges" },
  rtmp: { label: "RTMP", seconds: "1.92", note: "p95 over 24h · 41 edges" },
  hls: { label: "LL-HLS", seconds: "2.84", note: "p95 over 24h · 3 CDNs" },
} as const;

const SESSION = [
  { kind: "comment", text: "# tap a stream; meters and alerts come with it" },
  { kind: "input", text: "patchbay tap srt://encoder-04.lan:9000 --name lobby/bgm" },
  { kind: "output", text: "connected  48 kHz  stereo  opus 128k" },
  { kind: "output", text: "loudness   -18.4 LUFS   true peak -3.1 dBTP" },
  { kind: "success", text: "watching lobby/bgm, alerts to #broadcast-ops" },
] as const;

const SUMMARY = [
  { label: "Integrated", value: "\u221216.2", unit: "LUFS" },
  { label: "True peak", value: "\u22121.0", unit: "dBTP" },
  { label: "Dropouts", value: "2", unit: "in 24h" },
];

const SCALE = [-48, -36, -24, -12, -6, 0];
const toLevel = (db: number) => (db + 48) / 48;
const toDb = (level: number) => level * 48 - 48;
const formatDb = (db: number) => (db === 0 ? "0" : `−${Math.abs(db).toFixed(1)}`);

type Reading = { level: number; peak: number; peakAt: number };

// A stand-in signal for the five streams. Levels jump up on a transient and ease back down, like real ballistics.
function useStreamLevels() {
  const [readings, setReadings] = React.useState<Reading[]>(() =>
    STREAMS.map((s) => ({ level: s.base, peak: s.base, peakAt: 0 })),
  );

  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const state = STREAMS.map((s) => ({ level: s.base, peak: s.base, peakAt: 0 }));
    const start = performance.now();
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 45) return;
      last = now;
      const t = (now - start) / 1000;
      STREAMS.forEach((s, i) => {
        const r = state[i];
        const hit = (t * s.pulse + i * 0.37) % 1;
        const target = s.base + Math.exp(-hit * 6) * s.swing + Math.sin(t * 0.7 + i) * 0.03 + (Math.random() - 0.5) * 0.05;
        r.level = Math.min(1, target > r.level ? target : r.level + (target - r.level) * 0.3);
        if (r.level >= r.peak || now - r.peakAt > 1600) {
          r.peak = r.level;
          r.peakAt = now;
        }
      });
      setReadings(state.map((r) => ({ ...r })));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return readings;
}

function Cell({ title, copy, className, children }: { title: string; copy: string; className?: string; children: React.ReactNode }) {
  return (
    <article className={cn("relative flex flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.025]", className)}>
      <div className="relative flex flex-1 flex-col p-5 sm:p-6">{children}</div>
      <p className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/60 sm:px-6">
        <span className="font-medium text-white/90">{title}</span> {copy}
      </p>
    </article>
  );
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[11px] uppercase tracking-[0.16em] text-white/55", className)}>{children}</span>;
}

function useElapsed(running: boolean) {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250);
    return () => {
      clearInterval(id);
      setSeconds(0);
    };
  }, [running]);
  return seconds;
}

export default function FeaturesBento() {
  const readings = useStreamLevels();
  const [threshold, setThreshold] = React.useState(-6);
  const [protocol, setProtocol] = React.useState<keyof typeof LATENCY>("srt");
  const [unplugged, setUnplugged] = React.useState(false);
  const down = useElapsed(unplugged);

  const line = toLevel(threshold);
  const over = readings.filter((r) => r.peak > line).length;
  const latency = LATENCY[protocol];

  return (
    <section
      aria-labelledby="features-bento-title"
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Patchbay · Stream observability</Eyebrow>
            <h2
              id="features-bento-title"
              className="mt-4 text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
            >
              Hear the outage before your listeners do.
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-white/55 lg:col-span-4 lg:col-start-9 lg:pb-1.5">
            Loudness, latency and encoder health for every live stream you run, on one panel. Built for radio groups,
            podcast networks and anyone with a rack of encoders.
          </p>
        </header>

        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          <Cell
            className="md:col-span-2 lg:col-span-4 lg:row-span-2"
            title="Loudness on every stream."
            copy="Per-channel meters with peak hold, read at the edge every 45 ms. Segments past the over line turn red."
          >
            <div className="flex items-center justify-between gap-4">
              <Eyebrow>Ingest · {STREAMS.length} streams</Eyebrow>
              <span
                aria-live="polite"
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                  over ? "text-[#ff4d5e] [text-shadow:0_0_10px_rgb(255_77_94/0.6)]" : "text-white/55",
                )}
              >
                {over} over line
              </span>
            </div>

            <div className="mt-8 flex flex-1 flex-col justify-center gap-5 lg:gap-8">
              {STREAMS.map((stream, i) => {
                const r = readings[i];
                const hot = r.peak > line;
                const silent = stream.base < 0.2;
                return (
                  <div key={stream.id} className="grid grid-cols-[1fr_3.25rem] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[8.5rem_1fr_3.5rem] sm:gap-x-4">
                    <span className="col-span-2 flex items-center gap-2 truncate font-mono text-xs text-white/70 sm:col-span-1">
                      {stream.id}
                      {silent && <span className="text-[10px] uppercase tracking-[0.14em] text-white/55">silent</span>}
                    </span>
                    <div className="relative min-w-0">
                      <Meter
                        aria-label={stream.id}
                        value={r.level}
                        segments={36}
                        size="md"
                        className="w-full"
                        zones={[{ from: 0 }, { from: line, color: "red" }]}
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-y-1.5 w-px bg-[#ff4d5e]/70 shadow-[0_0_6px_rgb(255_77_94/0.8)] transition-[left] duration-150"
                        style={{ left: `calc(4px + ${line} * (100% - 8px))` }}
                      />
                    </div>
                    <span className={cn("text-right font-mono text-xs tabular-nums", hot ? "text-[#ff4d5e]" : "text-white/55")}>
                      {formatDb(toDb(r.peak))}
                    </span>
                  </div>
                );
              })}
              <div aria-hidden className="grid grid-cols-[1fr_3.25rem] gap-x-3 sm:grid-cols-[8.5rem_1fr_3.5rem] sm:gap-x-4">
                <span className="hidden sm:block" />
                <div className="relative h-4">
                  {SCALE.map((db) => (
                    <span
                      key={db}
                      className={cn(
                        "absolute -translate-x-1/2 font-mono text-[10px] tabular-nums text-white/50 first:translate-x-0 last:-translate-x-full",
                        db === -6 && "hidden sm:block",
                      )}
                      style={{ left: `calc(4px + ${toLevel(db)} * (100% - 8px))` }}
                    >
                      {db}
                    </span>
                  ))}
                </div>
                <span className="text-right font-mono text-[10px] text-white/50">dBFS</span>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06]">
              {SUMMARY.map((item) => (
                <div key={item.label} className="bg-[#08090d] px-3 py-3 sm:px-4">
                  <dt className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">{item.label}</dt>
                  <dd className="mt-1.5 font-mono text-sm tabular-nums text-white/85 sm:text-base">
                    {item.value} <span className="text-[11px] text-white/55">{item.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Cell>

          <Cell
            className="lg:col-span-2"
            title="Set the over line."
            copy="Alerts fire on sustained peaks, not a single clip. Turn it and watch the meters re-zone."
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[44%] size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.14),transparent)]"
            />
            <Eyebrow>Threshold</Eyebrow>
            <div className="relative flex flex-1 items-center justify-center py-4 lg:py-6">
              <Knob
                size="lg"
                label="Over line"
                showValue
                min={-24}
                max={0}
                step={1}
                value={threshold}
                defaultValue={-6}
                onValueChange={setThreshold}
                formatValue={(v) => `${v === 0 ? "0" : `−${Math.abs(v)}`} dBFS`}
              />
            </div>
          </Cell>

          <Cell
            className="lg:col-span-2"
            title="Latency you can quote."
            copy="Timecode stamped at the encoder, read back at the edge."
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Eyebrow>Glass to glass</Eyebrow>
              <ToggleGroup
                size="sm"
                aria-label="Protocol"
                value={protocol}
                onValueChange={(v) => v && setProtocol(v as keyof typeof LATENCY)}
              >
                {Object.entries(LATENCY).map(([key, p]) => (
                  <ToggleGroupItem key={key} value={key} className="h-8 sm:h-6">
                    {p.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="relative mt-5 flex flex-1 flex-col justify-center overflow-hidden rounded-xl border border-black/60 bg-[#040406] px-5 py-5 shadow-[inset_0_2px_12px_rgb(0_0_0/0.9)]">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_35%_55%,rgb(var(--neon)/0.1),transparent_70%)]" />
              <div className="relative flex items-end gap-2.5">
                <SevenSegment value={latency.seconds} digits={3} className="[--segment-h:52px]" aria-label={`${latency.seconds} seconds`} />
                <span className="pb-1 font-mono text-sm text-white/55">s</span>
              </div>
              <span className="relative mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">{latency.note}</span>
            </div>
          </Cell>

          <Cell
            className="md:col-span-2 lg:col-span-3"
            title="Encoders that page you when they go quiet."
            copy="A 1 Hz keepalive on every box. Three missed beats opens an incident."
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Eyebrow className="truncate">encoder-04<span className="hidden sm:inline"> · lobby</span></Eyebrow>
                {unplugged ? (
                  <Badge size="sm" color="red" dot>
                    No signal {`0:${String(down).padStart(2, "0")}`}
                  </Badge>
                ) : (
                  <Badge size="sm" color="green" dot pulse>
                    Live
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setUnplugged((u) => !u)} className="-mr-2 shrink-0">
                {unplugged ? <Plug aria-hidden /> : <Cable aria-hidden />}
                <span className="sm:hidden">{unplugged ? "Plug in" : "Unplug"}</span>
                <span className="hidden sm:inline">{unplugged ? "Plug back in" : "Pull the cable"}</span>
              </Button>
            </div>
            <div className="relative mt-5 flex-1 rounded-xl border border-white/[0.06] bg-[#06070b] px-3 py-4 [background-image:linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] [background-size:18px_18px]">
              <Heartbeat bpm={unplugged ? 0 : 60} height={92} color={unplugged ? "red" : undefined} aria-label="encoder-04 keepalive trace" />
            </div>
            <p aria-live="polite" className="mt-3 h-4 font-mono text-[11px] text-white/55">
              {unplugged
                ? down >= 3
                  ? "Incident #4127 opened · paged Dana Okafor"
                  : `Waiting on keepalive · ${3 - down} missed beat${3 - down === 1 ? "" : "s"} to go`
                : "Last beat 0.4 s ago · 7 days without a gap"}
            </p>
          </Cell>

          <Cell
            className="md:col-span-2 lg:col-span-3"
            title="Tap any stream from the CLI."
            copy="SRT, RTMP, Icecast or plain HLS. Nothing to install on the encoder."
          >
            <Terminal
              title="patchbay · zsh"
              lines={SESSION.map((l) => ({ ...l }))}
              typingSpeed={28}
              className="flex-1 rounded-xl text-[12px] leading-[1.7] shadow-none"
            />
          </Cell>
        </div>
      </div>
    </section>
  );
}
