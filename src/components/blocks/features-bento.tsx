"use client";

import * as React from "react";
import { Cable, Plug } from "@/components/ui/icons";
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
  { kind: "comment", text: "# meters and alerts come with it" },
  { kind: "input", text: "patchbay tap srt://enc-04:9000" },
  { kind: "output", text: "connected  48 kHz  opus 128k" },
  { kind: "output", text: "-18.4 LUFS  peak -3.1 dBTP" },
  { kind: "success", text: "watching, alerts to #broadcast-ops" },
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

function Caption({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("max-w-[46ch] text-[15px] leading-[1.55] text-white/55", className)}>
      <span className="font-medium text-white/90">{title}</span> {children}
    </p>
  );
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
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id="features-bento-title"
            className="max-w-[16ch] text-[clamp(2.4rem,5.6vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%] lg:col-span-8"
          >
            Hear the outage before your listeners do.
          </h2>
          <p className="max-w-[40ch] text-[17px] leading-[1.6] text-white/90 lg:col-span-4 lg:pb-2">
            Patchbay watches loudness, latency and encoder health on every live stream you run.{" "}
            <span className="text-white/50">Built for radio groups and anyone with a rack of encoders.</span>
          </p>
        </header>

        {/* The one big surface: the meter bridge and the knob that sets its over line. */}
        <div className="relative mt-14 overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#08090e] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_50px_100px_-50px_rgb(0_0_0/0.9)] sm:mt-20">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3.5 text-[13px] sm:px-7">
            <span className="text-white/60">
              Ingest <span className="text-white/50">· {STREAMS.length} streams</span>
            </span>
            <span
              aria-live="polite"
              className={cn(
                "tabular-nums transition-colors",
                over ? "text-[#ff4d5e] [text-shadow:0_0_10px_rgb(255_77_94/0.6)]" : "text-white/55",
              )}
            >
              {over === 0 ? "All under the line" : `${over} over the line`}
            </span>
          </div>

          <div className="grid lg:grid-cols-12">
            <div className="px-5 py-8 sm:px-7 lg:col-span-9 lg:py-10">
              <div className="flex flex-col gap-5 lg:gap-7">
                {STREAMS.map((stream, i) => {
                  const r = readings[i];
                  const hot = r.peak > line;
                  const silent = stream.base < 0.2;
                  return (
                    <div key={stream.id} className="grid grid-cols-[1fr_3.25rem] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[9rem_1fr_3.5rem] sm:gap-x-5">
                      <span className="col-span-2 flex items-baseline gap-2 truncate font-mono text-[12.5px] text-white/75 sm:col-span-1">
                        {stream.id}
                        {silent && <span className="font-sans text-[12px] text-white/50">quiet</span>}
                      </span>
                      <div className="relative min-w-0">
                        <Meter
                          aria-label={stream.id}
                          value={r.level}
                          segments={40}
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
                      <span className={cn("text-right font-mono text-[12.5px] tabular-nums", hot ? "text-[#ff4d5e]" : "text-white/55")}>
                        {formatDb(toDb(r.peak))}
                      </span>
                    </div>
                  );
                })}
                <div aria-hidden className="grid grid-cols-[1fr_3.25rem] gap-x-3 sm:grid-cols-[9rem_1fr_3.5rem] sm:gap-x-5">
                  <span className="hidden sm:block" />
                  <div className="relative h-4">
                    {SCALE.map((db) => (
                      <span
                        key={db}
                        className={cn(
                          "absolute -translate-x-1/2 font-mono text-[11px] tabular-nums text-white/50 first:translate-x-0 last:-translate-x-full",
                          db === -6 && "hidden sm:block",
                        )}
                        style={{ left: `calc(4px + ${toLevel(db)} * (100% - 8px))` }}
                      >
                        {db}
                      </span>
                    ))}
                  </div>
                  <span className="text-right font-mono text-[11px] text-white/50">dBFS</span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center gap-6 border-t border-white/[0.06] px-5 py-7 sm:px-7 lg:col-span-3 lg:flex-col lg:justify-center lg:gap-5 lg:border-l lg:border-t-0 lg:py-10">
              <div
                aria-hidden
                className="pointer-events-none absolute left-[84px] top-1/2 size-60 sm:left-[92px] lg:left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.12),transparent)]"
              />
              <Knob
                size="lg"
                aria-label="Over line"
                min={-24}
                max={0}
                step={1}
                value={threshold}
                defaultValue={-6}
                onValueChange={setThreshold}
                formatValue={(v) => `${v === 0 ? "0" : `−${Math.abs(v)}`} dBFS`}
              />
              <div className="relative lg:text-center">
                <p className="text-[13px] text-white/60">Over line</p>
                <p className="mt-1 font-mono text-[15px] tabular-nums text-white/90">
                  {threshold === 0 ? "0" : `−${Math.abs(threshold)}`} dBFS
                </p>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06]">
            {SUMMARY.map((item) => (
              <div key={item.label} className="flex flex-col-reverse px-4 py-4 sm:px-7">
                <dt className="mt-1 truncate text-[12.5px] text-white/50">{item.label}</dt>
                <dd className="whitespace-nowrap font-mono text-[14px] tabular-nums text-white/90 sm:text-[17px]">
                  {item.value} <span className="text-[11px] text-white/50 sm:text-[12px]">{item.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Caption title="Loudness on every stream." className="mt-5 max-w-[62ch]">
          Per-channel meters with peak hold, read at the edge every 45 ms. Turn the knob and the meters re-zone.
        </Caption>

        {/* Three smaller instruments, off a shared rule instead of three boxes. */}
        <div className="mt-16 grid gap-y-16 border-t border-white/[0.08] pt-10 sm:mt-20 md:grid-cols-2 md:gap-x-10 lg:grid-cols-12 lg:gap-x-12">
          <div className="flex flex-col lg:col-span-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[15px] font-medium text-white/90">Latency you can quote.</h3>
              <ToggleGroup
                size="sm"
                aria-label="Protocol"
                value={protocol}
                onValueChange={(v) => v && setProtocol(v as keyof typeof LATENCY)}
              >
                {Object.entries(LATENCY).map(([key, p]) => (
                  <ToggleGroupItem key={key} value={key} className="h-8 sm:h-7">
                    {p.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="mt-8 flex items-end gap-3">
              <SevenSegment value={latency.seconds} digits={3} className="[--segment-h:64px]" aria-label={`${latency.seconds} seconds`} />
              <span className="pb-1 font-mono text-sm text-white/55">s</span>
            </div>
            <p className="mt-6 text-[14px] leading-[1.55] text-white/55">
              Glass to glass, timecode stamped at the encoder and read back at the edge.{" "}
              <span className="font-mono text-[12.5px] text-white/50">{latency.note}</span>
            </p>
          </div>

          <div className="flex flex-col lg:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex min-w-0 items-center gap-2.5 text-[15px] font-medium text-white/90">
                <span className="truncate font-mono text-[13px] font-normal text-white/75">encoder-04</span>
                {unplugged ? (
                  <Badge size="sm" color="red" dot>
                    No signal {`0:${String(down).padStart(2, "0")}`}
                  </Badge>
                ) : (
                  <Badge size="sm" color="green" dot pulse>
                    Live
                  </Badge>
                )}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setUnplugged((u) => !u)} className="-mr-2 shrink-0">
                {unplugged ? <Plug aria-hidden /> : <Cable aria-hidden />}
                {unplugged ? "Plug back in" : "Pull the cable"}
              </Button>
            </div>
            <div className="relative mt-6 border-y border-white/[0.06] py-3 [background-image:linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] [background-size:18px_18px]">
              <Heartbeat bpm={unplugged ? 0 : 60} height={92} color={unplugged ? "red" : undefined} aria-label="encoder-04 keepalive trace" />
            </div>
            <p aria-live="polite" className="mt-3 min-h-5 font-mono text-[12px] text-white/55">
              {unplugged
                ? down >= 3
                  ? "Incident #4127 opened, paged Dana Okafor"
                  : `Waiting on keepalive, ${3 - down} missed beat${3 - down === 1 ? "" : "s"} to go`
                : "Last beat 0.4 s ago, 7 days without a gap"}
            </p>
            <Caption title="Encoders that page you when they go quiet." className="mt-4 text-[14px]">
              A 1 Hz keepalive on every box. Three missed beats opens an incident.
            </Caption>
          </div>

          <div className="flex flex-col md:col-span-2 lg:col-span-4">
            <Terminal
              title="patchbay · zsh"
              lines={SESSION.map((l) => ({ ...l }))}
              typingSpeed={28}
              className="min-h-[220px] flex-1 rounded-xl text-[12px] leading-[1.7] shadow-none"
            />
            <Caption title="Tap any stream from the CLI." className="mt-5 text-[14px]">
              SRT, RTMP, Icecast or plain HLS. Nothing to install on the encoder.
            </Caption>
          </div>
        </div>
      </div>
    </section>
  );
}
