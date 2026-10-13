"use client";

import * as React from "react";
import { SevenSegment } from "@/components/ui/seven-segment";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Points of presence",
    value: 312,
    decimals: 0,
    unit: "PoPs",
    context: "In 94 countries. 41 of them were switched on this year.",
    regions: [
      ["NA", 96],
      ["EU", 104],
      ["APAC", 81],
      ["LATAM", 19],
      ["MEA", 12],
    ],
  },
  {
    label: "TTFB · global p50",
    value: 11.4,
    decimals: 1,
    unit: "ms",
    context: "Median time to first byte, from 2,600 probes on real ISPs.",
  },
  {
    label: "Availability · 90 days",
    value: 99.997,
    decimals: 3,
    unit: "%",
    context: "1 min 18 s of partial degradation, all of it in Jakarta.",
  },
  {
    label: "Global purge · p95",
    value: 148,
    decimals: 0,
    unit: "ms",
    context: "From the API call to every PoP serving the new object.",
  },
];

// Peak edge throughput, used by the live counter.
const REQUESTS_PER_SECOND = 4_120_000;
const COUNT_MS = 1600;
const STAGGER_MS = 140;

function useReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduce;
}

function useInView<T extends Element>(ref: React.RefObject<T | null>, once: boolean) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, once]);
  return inView;
}

// Real counters update at a fixed refresh, not every frame: ~25 Hz here.
function useElapsed(running: boolean, until: number) {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const next = Math.min(until, performance.now() - start);
      setElapsed(next);
      if (next >= until) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [running, until]);
  return elapsed;
}

function digitCount(text: string) {
  return text.replace(/\D/g, "").length;
}

function Display({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-end justify-between gap-3 overflow-hidden rounded-xl bg-[#030407] px-4 py-5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05),inset_0_10px_24px_-12px_rgb(0_0_0/0.9)]",
        className,
      )}
    >
      {/* The lit digits wash the inside of the bezel */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_35%_60%,rgb(var(--neon)/0.07),transparent_70%)]"
      />
      {children}
    </div>
  );
}

function LiveCounter() {
  const ref = React.useRef<HTMLLIElement>(null);
  const visible = useInView(ref, false);
  const [seconds, setSeconds] = React.useState(0);
  const counted = React.useRef(0);

  // Ticks only while on screen, and resumes where it stopped.
  React.useEffect(() => {
    if (!visible) return;
    const resumed = performance.now() - counted.current * 1000;
    const id = window.setInterval(() => {
      counted.current = (performance.now() - resumed) / 1000;
      setSeconds(counted.current);
    }, 100);
    return () => window.clearInterval(id);
  }, [visible]);

  // Traffic breathes a little around the average rather than climbing in a straight line.
  const served = REQUESTS_PER_SECOND * (seconds + 0.18 * (1 - Math.cos(seconds / 3)));
  const rate = REQUESTS_PER_SECOND * (1 + 0.06 * Math.sin(seconds / 3));
  const millions = (served / 1e6).toFixed(1);

  return (
    <li
      ref={ref}
      className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[20px] border border-[rgb(var(--neon)/0.22)] bg-white/[0.025] p-5 shadow-[0_0_0_1px_rgb(var(--neon)/0.04),0_30px_80px_-40px_rgb(var(--neon)/0.45)] sm:p-7 md:col-span-2"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-2/3 rounded-[50%] bg-[rgb(var(--neon)/0.12)] blur-[70px]"
      />
      <div className="relative flex items-center justify-between gap-4">
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon))] opacity-60 [animation-duration:1.8s] motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
          </span>
          Live · since you opened this page
        </p>
        <p className="hidden font-mono text-[11px] tabular-nums tracking-[0.06em] text-white/40 sm:block">
          {(rate / 1e6).toFixed(2)}M req/s
        </p>
      </div>
      <Display className="py-6 sm:px-6 sm:py-8">
        <SevenSegment
          value={millions}
          digits={6}
          aria-label={`${millions} million requests`}
          className="relative [--segment-h:44px] sm:[--segment-h:64px] lg:[--segment-h:96px]"
        />
        <span className="relative pb-1 font-mono text-xs uppercase tracking-[0.14em] text-white/50 sm:text-sm">
          M req
        </span>
      </Display>
      <p className="relative max-w-md text-sm leading-relaxed text-white/55">
        Every request that hit a Tachyon edge while you read this, at our trailing seven-day average. Capacity: 84
        Tbps, with 3.1× headroom over peak.
      </p>
    </li>
  );
}

export default function StatsCounters() {
  const titleId = React.useId();
  const gridRef = React.useRef<HTMLUListElement>(null);
  const inView = useInView(gridRef, true);
  const reduce = useReducedMotion();
  const total = COUNT_MS + STAGGER_MS * (stats.length - 1);
  const elapsed = useElapsed(inView && !reduce, total);

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("red")}
      className="relative overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
              Tachyon network · trailing 30 days
            </p>
            <h2
              id={titleId}
              className="mt-5 max-w-[14ch] text-balance text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
            >
              Fast is a number. Here are ours.
            </h2>
          </div>
          <p className="max-w-md text-pretty text-[15px] leading-relaxed text-white/55 lg:justify-self-end">
            Read from the same telemetry that feeds our status page, refreshed every 60 seconds. Nothing rounded up,
            nothing measured from inside our own racks.
          </p>
        </div>

        <ul ref={gridRef} className="mt-14 grid gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          <LiveCounter />
          {stats.map((stat, i) => {
            const final = stat.value.toFixed(stat.decimals);
            const t = reduce ? 1 : Math.min(1, Math.max(0, (elapsed - i * STAGGER_MS) / COUNT_MS));
            const eased = 1 - Math.pow(1 - t, 4);
            const shown = t >= 1 ? final : (stat.value * eased).toFixed(stat.decimals);
            return (
              <li
                key={stat.label}
                className="flex flex-col gap-5 rounded-[20px] border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6"
              >
                <p className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
                  {stat.label}
                  <span aria-hidden className="tabular-nums text-white/25">
                    0{i + 2}
                  </span>
                </p>
                <Display>
                  <SevenSegment
                    value={shown}
                    digits={digitCount(final)}
                    aria-label={`${final} ${stat.unit}`}
                    className="relative [--segment-h:40px] sm:[--segment-h:48px]"
                  />
                  <span className="relative pb-0.5 font-mono text-xs uppercase tracking-[0.14em] text-white/50">
                    {stat.unit}
                  </span>
                </Display>
                <p className="text-sm leading-relaxed text-white/55">{stat.context}</p>
                {"regions" in stat && stat.regions && (
                  <dl className="mt-auto hidden grid-cols-5 border-t border-white/[0.06] pt-4 lg:grid">
                    {stat.regions.map(([region, count]) => (
                      <div key={region} className="grid gap-1">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">{region}</dt>
                        <dd className="font-mono text-sm tabular-nums text-white/75">{count}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
