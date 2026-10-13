"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

// Yearly is ten months' price for twelve months, shown per month.
const TIERS = [
  {
    name: "Hobby",
    pitch: "One show, finding its feet.",
    monthly: 12,
    yearly: 10,
    limits: [["Shows", "1"], ["Upload", "4 h/mo"], ["Seats", "1"]],
    features: [
      "Unlimited downloads, no bandwidth bills",
      "Apple, Spotify and 20 more directories",
      "Analytics for the last 90 days",
      "Embeddable Wavelength player",
    ],
    cta: "Start the show",
  },
  {
    name: "Studio",
    pitch: "For shows that publish on a schedule.",
    monthly: 36,
    yearly: 30,
    featured: true,
    limits: [["Shows", "3"], ["Upload", "20 h/mo"], ["Seats", "3"]],
    features: [
      "Everything in Hobby, analytics kept forever",
      "IAB-certified download counts",
      "Private feeds for up to 500 listeners",
      "Transcripts in 31 languages",
      "Dynamic ad insertion, your own sponsors",
    ],
    cta: "Start 14-day trial",
  },
  {
    name: "Network",
    pitch: "For networks and companies with many feeds.",
    monthly: 120,
    yearly: 100,
    limits: [["Shows", "No limit"], ["Upload", "100 h/mo"], ["Seats", "10"]],
    features: [
      "Everything in Studio, unlimited private listeners",
      "SSO, SCIM and an audit log",
      "Ad marketplace at a 70/30 split",
      "Support that answers in 4 hours",
    ],
    cta: "Talk to us",
  },
] as const;

const css = `
.nk-pricing-tiers-reel { transition: transform 560ms cubic-bezier(0.23, 1, 0.32, 1); }
@media (prefers-reduced-motion: reduce) { .nk-pricing-tiers-reel { transition: none; } }
`;

// Each digit is a reel of 0–9 that rolls to its new value, staggered from the right like an odometer.
function RollingPrice({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="inline-flex tabular-nums" aria-hidden>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="relative inline-block h-[1em] overflow-hidden leading-none">
          <span
            className="nk-pricing-tiers-reel flex flex-col"
            style={{ transform: `translateY(-${Number(d) * 10}%)`, transitionDelay: `${(digits.length - 1 - i) * 60}ms` }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-[1em]">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

function Tier({ tier, billing }: { tier: (typeof TIERS)[number]; billing: Billing }) {
  const featured = "featured" in tier && tier.featured;
  const price = tier[billing];

  return (
    <div className={cn("relative flex h-full flex-col p-6 sm:p-7", featured && "lg:py-9")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className={cn("text-lg font-medium tracking-[-0.01em]", featured ? "text-white" : "text-white/85")}>{tier.name}</h3>
        {featured && (
          <Badge size="sm" variant="outline">
            Most shows pick this
          </Badge>
        )}
      </div>
      <p className="mt-1.5 text-sm text-white/60 md:min-h-10 lg:min-h-0">{tier.pitch}</p>

      <p className="mt-8 flex items-end gap-2">
        <span
          className={cn(
            "flex items-start text-[56px] font-semibold leading-none tracking-[-0.045em]",
            featured
              ? "[color:color-mix(in_srgb,rgb(var(--neon))_25%,white)] [filter:drop-shadow(0_0_14px_rgb(var(--neon)/0.55))]"
              : "text-white",
          )}
        >
          <span className="mr-0.5 mt-1.5 text-2xl font-medium text-white/50">$</span>
          <RollingPrice value={price} />
        </span>
        <span className="sr-only">
          ${price} per month{billing === "yearly" ? `, billed $${price * 12} yearly` : ""}
        </span>
        <span aria-hidden className="pb-1 text-sm leading-tight text-white/60">
          / month
          <br />
          <span className="font-mono text-[11px]">{billing === "yearly" ? `$${(price * 12).toLocaleString("en-US")} billed yearly` : "billed monthly"}</span>
        </span>
      </p>

      <dl className="mt-7 grid grid-cols-3 overflow-hidden rounded-xl border border-white/[0.07]">
        {tier.limits.map(([k, v], i) => (
          <div key={k} className={cn("px-3 py-2.5", i > 0 && "border-l border-white/[0.07]")}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">{k}</dt>
            <dd className="mt-1 text-sm tabular-nums text-white/85">{v}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-7 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-3 text-sm leading-snug text-white/70">
            <Check
              aria-hidden
              strokeWidth={2.25}
              className={cn(
                "mt-px size-4 shrink-0",
                featured ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.7))]" : "text-white/35",
              )}
            />
            {f}
          </li>
        ))}
      </ul>

      <Button variant={featured ? "solid" : "soft"} size="lg" className="mt-9 w-full">
        {tier.cta}
        {featured && <ArrowRight aria-hidden />}
      </Button>
    </div>
  );
}

export default function PricingTiers() {
  const [billing, setBilling] = React.useState<Billing>("yearly");

  return (
    <section
      aria-labelledby="pricing-tiers-title"
      // Change the color here; everything inside follows it.
      style={neonVars("magenta")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16"
    >
      <style>{css}</style>
      {/* The featured plan throws light on the floor beneath it */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 hidden h-72 w-[38rem] -translate-x-1/2 translate-y-1/3 rounded-[50%] bg-[rgb(var(--neon)/0.12)] blur-[90px] lg:block"
      />
      <div className="mx-auto max-w-[1200px]">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Wavelength · Podcast hosting</p>
            <h2
              id="pricing-tiers-title"
              className="mt-4 text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
            >
              Pay for the show, not for the downloads.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ToggleGroup aria-label="Billing period" value={billing} onValueChange={(v) => v && setBilling(v as Billing)}>
              <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
              <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
            </ToggleGroup>
            <span
              className={cn(
                "whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] transition-[color,text-shadow] duration-300",
                billing === "yearly" ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]" : "text-white/55",
              )}
            >
              2 months free
            </span>
          </div>
        </header>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-center lg:gap-5">
          {TIERS.map((tier) =>
            "featured" in tier && tier.featured ? (
              <BorderBeam
                key={tier.name}
                duration={9}
                size={70}
                className="rounded-[22px] border border-white/10 md:order-first md:col-span-2 lg:order-none lg:col-span-1 bg-[linear-gradient(180deg,rgb(var(--neon)/0.07),rgb(255_255_255/0.02)_45%)] shadow-[0_40px_100px_-40px_rgb(var(--neon)/0.55)]"
              >
                <Tier tier={tier} billing={billing} />
              </BorderBeam>
            ) : (
              <div key={tier.name} className="rounded-[20px] border border-white/[0.08] bg-white/[0.02]">
                <Tier tier={tier} billing={billing} />
              </div>
            ),
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-sm text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <p>Every plan: unlimited downloads, no overage, and a 301 redirect for your RSS if you ever leave.</p>
          <a
            href="#contact"
            className="-my-2 inline-flex items-center gap-1 self-start rounded-md py-2 text-white/80 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] lg:self-auto"
          >
            Hosting a network of 50+ shows? <span className="underline decoration-white/25 underline-offset-4">Let&apos;s talk</span>
          </a>
        </div>
      </div>
    </section>
  );
}
