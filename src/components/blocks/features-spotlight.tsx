"use client";

import * as React from "react";
import { ArrowUpRight, Database, Globe, Layers, Receipt, ShieldCheck, Timer } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

// Query latency histogram, in 1.6 ms buckets. A fixed shape, so server and browser render the same bars.
const LATENCY = Array.from({ length: 36 }, (_, i) => {
  const x = (i + 0.5) * 1.6;
  return Math.round(100 * Math.exp(-((Math.log(x) - 2.6) ** 2) / 0.55) + 2);
});
const P50 = 11;
const P95 = 25;

// 90 days of uptime. Day 61 had a four-minute partial outage in one region.
const UPTIME = Array.from({ length: 90 }, (_, i) => (i === 61 ? "partial" : "up"));

const REGIONS = ["iad", "sfo", "yyz", "gru", "fra", "ams", "lhr", "jnb", "bom", "sin", "nrt", "syd"];

const DOCS_START = 3_412_880_114;
const DOCS_PER_SECOND = 1180;
const count = new Intl.NumberFormat("en-US");

// The number is the hero: plain white at rest, a lit tube when its card is lit or hovered.
const NUMBER =
  "font-semibold leading-[0.9] tracking-[-0.045em] tabular-nums text-white transition-[color,text-shadow] duration-300";
const LIT =
  "[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_2px_rgb(255_255_255/0.6),0_0_14px_rgb(var(--neon)/0.9),0_0_42px_rgb(var(--neon)/0.55)]";
const HOVER_LIT =
  "group-hover/spotlight:[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] group-hover/spotlight:[text-shadow:0_0_2px_rgb(255_255_255/0.6),0_0_14px_rgb(var(--neon)/0.9),0_0_42px_rgb(var(--neon)/0.55)]";

function Label({ icon: Icon, children }: { icon: typeof Timer; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
      <Icon aria-hidden className="size-3.5 text-white/55" strokeWidth={1.75} />
      {children}
    </p>
  );
}

function Stat({ value, unit, lit, className }: { value: React.ReactNode; unit?: string; lit?: boolean; className?: string }) {
  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className={cn(NUMBER, lit ? LIT : HOVER_LIT)}>{value}</span>
      {unit && <span className="text-lg font-medium tracking-[-0.01em] text-white/55">{unit}</span>}
    </p>
  );
}

function LiveDocs() {
  const [docs, setDocs] = React.useState(DOCS_START);
  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const started = performance.now();
    const id = setInterval(() => {
      setDocs(DOCS_START + Math.floor(((performance.now() - started) / 1000) * DOCS_PER_SECOND));
    }, 120);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs tabular-nums text-white/55">{count.format(docs)}</span>;
}

export default function FeaturesSpotlight() {
  const tallest = Math.max(...LATENCY);

  return (
    <section
      aria-labelledby="features-spotlight-title"
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Quarry · Search API</p>
            <h2
              id="features-spotlight-title"
              className="mt-4 text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
            >
              The numbers we put in the contract.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pb-1.5">
            <p className="text-[15px] leading-relaxed text-white/55">
              Measured over the last 30 days across every paying account, not on a benchmark rig. If we miss them, the
              month is on us.
            </p>
            <a
              href="#sla"
              className="mt-2 inline-flex items-center gap-1 rounded-md py-2 text-sm text-white/80 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              Read the SLA <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </header>

        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          <SpotlightCard tabIndex={0} className="flex flex-col p-6 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] sm:p-8 md:col-span-2 lg:col-span-7 lg:row-span-2">
            {/* The resting light: this card is the one already lit */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 -top-32 -z-10 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.16),transparent)]"
            />
            <Label icon={Timer}>Query latency</Label>
            <Stat lit value="41" unit="ms p95" className="mt-8 text-[clamp(4.5rem,11vw,8.5rem)]" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
              Full-text, filters and typo tolerance in one round trip. Median is 18 ms. Your users never see a spinner.
            </p>
            <div className="mt-auto pt-10">
              <div aria-hidden className="relative flex h-36 items-end gap-[3px]">
                {LATENCY.map((v, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex-1 rounded-t-[2px]",
                      i <= P95 ? "bg-[rgb(var(--neon)/0.38)]" : "bg-white/[0.08]",
                      i === P50 && "bg-[rgb(var(--neon)/0.6)]",
                    )}
                    style={{ height: `${(v / tallest) * 100}%` }}
                  />
                ))}
                <span
                  className="absolute -top-3 bottom-0 w-px bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_8px_rgb(var(--neon)),0_0_2px_rgb(var(--neon))]"
                  style={{ left: `calc(${(P95 + 1) / LATENCY.length} * 100%)` }}
                />
              </div>
              <div aria-hidden className="relative mt-2 h-4 font-mono text-[10px] text-white/50">
                <span className="absolute left-0">0</span>
                <span className="absolute -translate-x-1/2 text-white/75" style={{ left: `calc(${(P50 + 0.5) / LATENCY.length} * 100%)` }}>
                  p50 18
                </span>
                <span className="absolute -translate-x-1/2 text-[rgb(var(--neon))]" style={{ left: `calc(${(P95 + 1) / LATENCY.length} * 100%)` }}>
                  p95 41
                </span>
                <span className="absolute right-0">58 ms</span>
              </div>
              <p className="sr-only">Latency distribution: median 18 ms, 95th percentile 41 ms.</p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="flex flex-col p-6 sm:p-7 lg:col-span-5">
            <Label icon={ShieldCheck}>Uptime, 90 days</Label>
            <Stat value="99.99" unit="%" className="mt-6 text-[clamp(3rem,6vw,4.5rem)]" />
            <div aria-hidden className="mt-6 flex h-7 gap-[2px]">
              {UPTIME.map((day, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 rounded-[1px]",
                    day === "up" ? "bg-[rgb(var(--neon)/0.45)]" : "bg-[#fbbf24] shadow-[0_0_8px_rgb(251_191_36/0.7)]",
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-white/60">One incident: 4 minutes of partial writes in fra, Aug 12.</p>
          </SpotlightCard>

          <SpotlightCard className="flex flex-col p-6 sm:p-7 lg:col-span-5">
            <Label icon={Globe}>Regions</Label>
            <Stat value="12" unit="regions" className="mt-6 text-[clamp(3rem,6vw,4.5rem)]" />
            <ul className="mt-6 grid grid-cols-6 gap-x-2 gap-y-2 font-mono text-[11px] uppercase text-white/55">
              {REGIONS.map((r) => (
                <li key={r} className="flex items-center gap-1.5">
                  <span aria-hidden className="size-1 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_4px_rgb(var(--neon))]" />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/60">Reads from the nearest one. Writes replicate in under a second.</p>
          </SpotlightCard>

          <SpotlightCard className="flex flex-col p-6 sm:p-7 lg:col-span-4">
            <Label icon={Database}>Indexed</Label>
            <Stat value="3.4B" unit="docs" className="mt-6 text-[clamp(3rem,6vw,4.5rem)]" />
            <p className="mt-auto flex items-center gap-2 pt-6">
              <span aria-hidden className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon)/0.7)] motion-reduce:hidden" />
                <span className="relative size-1.5 rounded-full bg-[rgb(var(--neon))]" />
              </span>
              <LiveDocs />
            </p>
            <p className="mt-1 text-sm text-white/60">Product catalogs, docs and logs. About 1,180 new ones a second.</p>
          </SpotlightCard>

          <SpotlightCard className="flex flex-col p-6 sm:p-7 lg:col-span-4">
            <Label icon={Receipt}>Price</Label>
            <Stat value="$0.40" unit="/ 1k queries" className="mt-6 text-[clamp(3rem,6vw,4.5rem)]" />
            <p className="mt-auto pt-6 text-sm text-white/60">First 100,000 queries every month are free. No seats, no minimums.</p>
          </SpotlightCard>

          <SpotlightCard className="flex flex-col p-6 sm:p-7 md:col-span-2 lg:col-span-4">
            <Label icon={Layers}>Shards to manage</Label>
            <Stat value="0" className="mt-6 text-[clamp(3rem,6vw,4.5rem)]" />
            <p className="mt-auto pt-6 text-sm text-white/60">Indexes split and rebalance themselves as they grow. You never pick a shard count.</p>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
