"use client";

import * as React from "react";
import { ArrowRight, Check, Minus } from "@/components/ui/icons";
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

const VIEWS = [10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

export default function PricingSingle() {
  const [step, setStep] = React.useState(2);
  const volume = VOLUMES[step];
  const perThousand = (volume.price / (VIEWS[step] / 1000)).toFixed(volume.price / (VIEWS[step] / 1000) < 0.1 ? 3 : 2);

  return (
    <section
      aria-labelledby="pricing-single-title"
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16 lg:py-28"
    >
      {/* The price is the lit object; this is its light on the wall */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[22%] top-[58%] -z-10 h-[30rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.1),transparent)]"
      />
      <style>{`@keyframes nk-pricing-single-in { from { opacity: 0.4; transform: translateY(0.06em); } }`}</style>
      <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h2
            id="pricing-single-title"
            className="text-[clamp(2.5rem,5.8vw,4.75rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
          >
            <span className="block">One plan, all in.</span>
            <span className="block">Nothing creepy.</span>
          </h2>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-white/60">
            Stillwater is privacy-first analytics with one price that moves only with your traffic.{" "}
            <span className="text-white/50">No feature gates, no sales calls.</span>
          </p>

          <div className="mt-14 lg:mt-16">
            <p className="flex flex-wrap items-end gap-x-5 gap-y-2">
              <span className="flex items-start">
                <span className="mr-1 mt-[0.14em] text-[clamp(1.75rem,3vw,2.75rem)] font-medium text-white/50">$</span>
                <span
                  key={volume.price}
                  className="text-[clamp(7rem,19vw,14rem)] font-[620] leading-[0.8] tracking-[-0.06em] [font-stretch:112%] [color:color-mix(in_srgb,rgb(var(--neon))_28%,white)] [text-shadow:0_0_2px_rgb(255_255_255/0.5),0_0_22px_rgb(var(--neon)/0.6),0_0_70px_rgb(var(--neon)/0.3)] motion-safe:animate-[nk-pricing-single-in_260ms_cubic-bezier(0.23,1,0.32,1)]"
                >
                  {volume.price}
                </span>
              </span>
              <span className="pb-2 text-[15px] leading-[1.45] text-white/60">
                a month for up to <span className="text-white/90">{volume.views} pageviews</span>
                <br />
                <span className="font-mono text-[13px] text-white/50">${perThousand} per 1,000</span>
              </span>
            </p>

            <div className="mt-12 max-w-[560px]">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-white/60">Pageviews a month</span>
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
              <div aria-hidden className="relative mt-3 h-4 font-mono text-[11px] text-white/50">
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

              <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <Button variant="solid" size="lg" className="sm:px-8">
                  Start a 30-day trial <ArrowRight aria-hidden />
                </Button>
                <p className="text-[13px] text-white/55">No card needed. Over 5M views? We&apos;ll quote it.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
          <h3 className="text-[15px] font-medium text-white/90">Every feature, at every size</h3>
          <ul className="mt-4 border-t border-white/[0.08] md:grid md:grid-cols-2 md:gap-x-8 lg:block">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex gap-3 border-b border-white/[0.06] py-2.5 text-[15px] leading-snug text-white/75"
              >
                <Check aria-hidden strokeWidth={2.25} className="mt-0.5 size-4 shrink-0 text-[rgb(var(--neon))]" />
                {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-[15px] font-medium text-white/90">Left out on purpose</h3>
          <ul className="mt-3 space-y-1.5">
            {NOT_INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[15px] text-white/55">
                <Minus aria-hidden className="size-3.5 text-white/30" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            If you need to watch individual visitors, we&apos;re the wrong tool, and we&apos;d rather say so now.
          </p>
          <a
            href="#faq"
            className="-my-2 mt-6 inline-flex items-center gap-1.5 rounded-md py-2 text-sm text-white/85 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
          >
            GDPR, migrating, exports: read the FAQ <ArrowRight aria-hidden className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
