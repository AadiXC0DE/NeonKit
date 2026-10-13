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
    label: "Time to first byte, p50",
    value: 11.4,
    decimals: 1,
    unit: "ms",
    context: "Median time to first byte, from 2,600 probes on real ISPs.",
  },
  {
    label: "Availability, 90 days",
    value: 99.997,
    decimals: 3,
    unit: "%",
    context: "1 min 18 s of partial degradation, all of it in Jakarta.",
  },
  {
    label: "Global purge, p95",
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
  const ref = React.useRef<HTMLDivElement>(null);
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
    <div
      ref={ref}
      className="relative grid gap-8 overflow-hidden rounded-[14px] border border-[rgb(var(--neon)/0.22)] bg-white/[0.02] p-5 shadow-[0_0_0_1px_rgb(var(--neon)/0.04),0_40px_90px_-50px_rgb(var(--neon)/0.5)] sm:p-8 lg:grid-cols-12 lg:items-end lg:gap-10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-2/3 rounded-[50%] bg-[rgb(var(--neon)/0.12)] blur-[70px]"
      />
      <div className="relative lg:col-span-8">
        <div className="mb-4 flex items-center justify-between gap-4 text-[13px]">
          <p className="flex items-center gap-2.5 text-white/70">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon))] opacity-60 [animation-duration:1.8s] motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
            </span>
            Live, since you opened this page
          </p>
          <p className="hidden font-mono text-[12px] tabular-nums text-white/55 sm:block">{(rate / 1e6).toFixed(2)}M req/s</p>
        </div>
        <Display className="py-6 sm:px-6 sm:py-8">
          <SevenSegment
            value={millions}
            digits={6}
            aria-label={`${millions} million requests`}
            className="relative [--segment-h:44px] sm:[--segment-h:64px] lg:[--segment-h:88px]"
          />
          <span className="relative pb-1 text-[13px] text-white/60 sm:text-[15px]">million requests</span>
        </Display>
      </div>
      <p className="relative max-w-[40ch] text-[15px] leading-[1.6] text-white/60 lg:col-span-4 lg:pb-2">
        <span className="text-white/90">Every request that hit a Tachyon edge while you read this,</span> at our trailing
        seven-day average. Capacity is 84 Tbps, with 3.1× headroom over peak.
      </p>
    </div>
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
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id={titleId}
            className="max-w-[14ch] text-[clamp(2.4rem,5.6vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%] lg:col-span-7"
          >
            Fast is a number. Here are ours.
          </h2>
          <p className="max-w-[40ch] text-pretty text-[16px] leading-[1.6] text-white/60 lg:col-span-4 lg:col-start-9 lg:pb-2">
            The Tachyon network over the last 30 days, read from the telemetry behind our status page. Nothing rounded
            up, nothing measured from inside our own racks.
          </p>
        </div>

        <div className="mt-14 sm:mt-20">
          <LiveCounter />
        </div>

        {/* The other four are reference readings: calm white digits, so only the live one burns. */}
        <ul ref={gridRef} className="mt-14 grid gap-x-10 gap-y-12 sm:mt-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {stats.map((stat, i) => {
            const final = stat.value.toFixed(stat.decimals);
            const t = reduce ? 1 : Math.min(1, Math.max(0, (elapsed - i * STAGGER_MS) / COUNT_MS));
            const eased = 1 - Math.pow(1 - t, 4);
            const shown = t >= 1 ? final : (stat.value * eased).toFixed(stat.decimals);
            return (
              <li key={stat.label} className="flex flex-col border-t border-white/[0.08] pt-5">
                <p className="text-[14px] text-white/60">{stat.label}</p>
                <div className="mt-5 flex items-end gap-2.5">
                  <SevenSegment
                    value={shown}
                    color="white"
                    digits={digitCount(final)}
                    aria-label={`${final} ${stat.unit}`}
                    className="[--segment-h:40px] sm:[--segment-h:46px]"
                  />
                  <span className="pb-0.5 text-[14px] text-white/55">{stat.unit}</span>
                </div>
                <p className="mt-5 text-[14px] leading-[1.55] text-white/55">{stat.context}</p>
                {"regions" in stat && stat.regions && (
                  <dl className="mt-5 grid grid-cols-5 gap-1">
                    {stat.regions.map(([region, count]) => (
                      <div key={region} className="flex flex-col-reverse gap-0.5">
                        <dt className="text-[12px] text-white/50">{region}</dt>
                        <dd className="font-mono text-[13px] tabular-nums text-white/80">{count}</dd>
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
