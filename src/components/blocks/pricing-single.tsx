"use client";

import * as React from "react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

// One plan, priced by traffic. Every step includes every feature.
const VOLUMES = [
  { views: "10k", price: 6 },
  { views: "50k", price: 9 },
  { views: "100k", price: 14 },
  { views: "250k", price: 24 },
  { views: "500k", price: 39 },
  { views: "1M", price: 64 },
  { views: "2M", price: 99 },
  { views: "5M", price: 199 },
];

const INCLUDED = [
  "Unlimited sites and team members",
  "No cookies, so no consent banner",
  "Data stored in Frankfurt, never sold",
  "Goals, funnels and UTM campaigns",
  "Live view, updated every 5 seconds",
  "Weekly email digest, plain text",
  "Full CSV and API export, any time",
  "A 1.1 kB script that won't dent page speed",
  "Shared dashboards with a private link",
  "Two years of history, then your call",
];

const NOT_INCLUDED = ["Session replays", "Heatmaps", "Cross-site tracking", "Anything that needs a cookie"];

export default function PricingSingle() {
  const [step, setStep] = React.useState(2);
  const volume = VOLUMES[step];

  return (
    <section
      aria-labelledby="pricing-single-title"
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Stillwater · Pricing</p>
            <h2
              id="pricing-single-title"
              className="mt-4 text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
            >
              One plan. Everything in it. Nothing creepy.
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-white/55 lg:col-span-4 lg:col-start-9 lg:pb-1.5">
            Privacy-first analytics with a single price that moves only with your traffic. No feature gates and no
            sales calls.
          </p>
        </header>

        <div className="mt-14 grid overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.02] lg:grid-cols-[5fr_7fr]">
          <div className="relative isolate flex flex-col border-b border-white/[0.08] p-6 sm:p-9 lg:border-b-0 lg:border-r">
            {/* The price is the lit object; this is its light on the panel */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-24 -z-10 size-[440px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.13),transparent)]"
            />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Stillwater</h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Monthly</span>
            </div>

            <p className="mt-10 flex items-start">
              <span className="mr-1 mt-3 text-3xl font-medium text-white/45">$</span>
              <span
                key={volume.price}
                className="text-[clamp(5rem,12vw,7.5rem)] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums [color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_2px_rgb(255_255_255/0.5),0_0_18px_rgb(var(--neon)/0.65),0_0_54px_rgb(var(--neon)/0.35)] motion-safe:animate-[nk-pricing-single-in_260ms_cubic-bezier(0.23,1,0.32,1)]"
              >
                {volume.price}
              </span>
              <span className="ml-3 mt-auto pb-2 text-sm leading-tight text-white/60">
                per month
                <br />
                <span className="font-mono text-[11px]">up to {volume.views} views</span>
              </span>
            </p>
            <style>{`@keyframes nk-pricing-single-in { from { opacity: 0.4; transform: translateY(6px); } }`}</style>

            <div className="mt-10">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-white/60">
                  Monthly pageviews
                </span>
                <span className="font-mono tabular-nums text-white">{volume.views}</span>
              </div>
              <Slider
                className="mt-4"
                min={0}
                max={VOLUMES.length - 1}
                step={1}
                value={[step]}
                onValueChange={([v]) => setStep(v)}
                formatValue={(v) => `${VOLUMES[v].views} pageviews, $${VOLUMES[v].price} a month`}
                thumbLabels={["Monthly pageviews"]}
              />
              <div aria-hidden className="relative mt-3 h-4 font-mono text-[10px] text-white/50">
                {VOLUMES.map((v, i) => (
                  <span
                    key={v.views}
                    className={cn(
                      "absolute -translate-x-1/2 transition-colors",
                      i === 0 && "translate-x-0",
                      i === VOLUMES.length - 1 && "-translate-x-full",
                      i === step && "text-[rgb(var(--neon))]",
                      i % 2 === 1 && i !== step && i !== VOLUMES.length - 1 && "hidden sm:block",
                    )}
                    style={{ left: `${(i / (VOLUMES.length - 1)) * 100}%` }}
                  >
                    {v.views}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-10">
              <Button variant="solid" size="lg" className="w-full">
                Start a 30-day trial <ArrowRight aria-hidden />
              </Button>
              <p className="mt-3 text-center text-xs text-white/55">No card needed. Over 5M views? We&apos;ll quote it.</p>
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-9">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Everything included</p>
            <ul className="mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-snug text-white/80">
                  <Check aria-hidden strokeWidth={2.25} className="mt-0.5 size-4 shrink-0 text-[rgb(var(--neon))]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-2xl border border-dashed border-white/[0.12] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Not included, on purpose</p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {NOT_INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                    <Minus aria-hidden className="size-3.5 text-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                If you need to watch individual visitors, we&apos;re the wrong tool, and we&apos;d rather say so now.
              </p>
            </div>

            <div aria-hidden className="flex-1" />
            <p className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-sm text-white/60">
              <span>GDPR, switching from another tool, or data export?</span>
              <a
                href="#faq"
                className="-my-2 inline-flex items-center gap-1 rounded-md py-2 text-white/85 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
              >
                Read the FAQ <ArrowRight aria-hidden className="size-3.5" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
