"use client";

import * as React from "react";
import { ArrowUpRight } from "@/components/ui/icons";
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

const ROW_LIT =
  "group-hover/row:[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] group-hover/row:[text-shadow:0_0_2px_rgb(255_255_255/0.6),0_0_14px_rgb(var(--neon)/0.9),0_0_42px_rgb(var(--neon)/0.55)] group-focus-within/row:[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)]";

function Stat({ value, unit, lit, className }: { value: React.ReactNode; unit?: string; lit?: boolean; className?: string }) {
  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className={cn(NUMBER, lit ? LIT : HOVER_LIT)}>{value}</span>
      {unit && <span className="text-lg font-medium tracking-[-0.01em] text-white/55">{unit}</span>}
    </p>
  );
}

// One line of the ledger: the figure lights as the pointer passes over its row.
function Figure({ value, unit, label, children }: { value: string; unit?: string; label: string; children: React.ReactNode }) {
  return (
    <div className="group/row grid items-baseline gap-x-6 gap-y-2 border-t border-white/[0.07] px-6 py-5 first:border-t-0 sm:grid-cols-[10.5rem_1fr] sm:px-7">
      <p className="flex items-baseline gap-1.5">
        <span className={cn(NUMBER, ROW_LIT, "text-[clamp(2.25rem,3.6vw,2.75rem)] font-[620] [font-variant-numeric:normal] [font-stretch:112%]")}>{value}</span>
        {unit && <span className="text-[14px] text-white/55">{unit}</span>}
      </p>
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-white/90">{label}</p>
        <div className="mt-1 text-[13.5px] leading-[1.5] text-white/55">{children}</div>
      </div>
    </div>
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
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id="features-spotlight-title"
            className="max-w-[14ch] text-[clamp(2.4rem,5.6vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%] lg:col-span-7"
          >
            The numbers we put in the contract.
          </h2>
          <div className="lg:col-span-4 lg:col-start-9 lg:pb-2">
            <p className="text-[17px] leading-[1.6] text-white/90 [text-wrap:pretty]">
              Quarry is a search API.{" "}
              <span className="text-white/50">
                Its last 30 days on every paying account, not a benchmark rig. Miss one and that month is free.
              </span>
            </p>
            <a
              href="#sla"
              className="mt-3 inline-flex items-center gap-1 rounded-md py-2 text-[15px] text-white/85 underline decoration-white/25 underline-offset-[5px] outline-none transition-colors hover:text-[rgb(var(--neon))] hover:decoration-[rgb(var(--neon)/0.6)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              Read the SLA <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </header>

        <div className="mt-14 grid gap-4 sm:mt-20 lg:grid-cols-12 lg:gap-5">
          <SpotlightCard
            tabIndex={0}
            radius={520}
            className="flex flex-col rounded-[14px] border-white/[0.08] bg-white/[0.02] p-6 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] sm:p-9 lg:col-span-7"
          >
            {/* The resting light: this card is the one already lit */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 -top-32 -z-10 size-[460px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.16),transparent)]"
            />
            <p className="text-[14px] text-white/60">Query latency, p95</p>
            <Stat lit value="41" unit="ms" className="mt-6 text-[clamp(5.5rem,14vw,11rem)] [&>span:first-child]:font-[620] [&>span:first-child]:[font-stretch:112%]" />
            <p className="mt-6 max-w-[40ch] text-[16px] leading-[1.6] text-white/60">
              Full-text, filters and typo tolerance in one round trip. The median is 18 ms, so your users never see a spinner.
            </p>
            <div className="mt-auto pt-12">
              <div aria-hidden className="relative flex h-36 items-end gap-[2px] sm:gap-[3px] lg:h-52">
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
              <div aria-hidden className="relative mt-2 h-4 font-mono text-[11px] text-white/50">
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

          {/* The rest is a ledger under one light, not five more cards. */}
          <SpotlightCard radius={420} className="flex flex-col justify-between rounded-[14px] border-white/[0.08] bg-transparent lg:col-span-5">
            <Figure value="99.99" unit="%" label="Uptime, 90 days">
              One incident: 4 minutes of partial writes in fra, Aug 12.
              <span aria-hidden className="mt-3 flex h-4 gap-px sm:gap-[2px]">
                {UPTIME.map((day, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex-1 rounded-[1px]",
                      day === "up" ? "bg-[rgb(var(--neon)/0.4)]" : "bg-[#fbbf24] shadow-[0_0_8px_rgb(251_191_36/0.7)]",
                    )}
                  />
                ))}
              </span>
            </Figure>
            <Figure value="12" label="Regions">
              Reads from the nearest. Writes replicate in under a second.
              <span className="mt-1.5 block font-mono text-[12px] text-white/50">{REGIONS.join(" ")}</span>
            </Figure>
            <Figure value="3.4B" label="Documents indexed">
              About 1,180 new ones a second.
              <span className="mt-1.5 flex items-center gap-2">
                <span aria-hidden className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon)/0.7)] motion-reduce:hidden" />
                  <span className="relative size-1.5 rounded-full bg-[rgb(var(--neon))]" />
                </span>
                <LiveDocs />
              </span>
            </Figure>
            <Figure value="$0.40" unit="/ 1k" label="Per thousand queries">
              The first 100,000 every month are free. No seats, no minimums.
            </Figure>
            <Figure value="0" label="Shards to manage">
              Indexes split and rebalance themselves as they grow.
            </Figure>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
