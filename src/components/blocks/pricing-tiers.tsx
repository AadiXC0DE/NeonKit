"use client";

import * as React from "react";
import { ArrowRight, Check } from "@/components/ui/icons";
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
    summary: "1 show, 4 hours of upload a month, 1 seat",
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
    summary: "3 shows, 20 hours of upload a month, 3 seats",
    features: [
      "Analytics kept forever",
      "IAB-certified download counts",
      "Private feeds for up to 500 listeners",
      "Transcripts in 31 languages",
      "Ad insertion, your own sponsors",
    ],
    cta: "Start 14-day trial",
  },
  {
    name: "Network",
    pitch: "For networks and companies with many feeds.",
    monthly: 120,
    yearly: 100,
    limits: [["Shows", "No limit"], ["Upload", "100 h/mo"], ["Seats", "10"]],
    summary: "Any number of shows, 100 hours of upload a month, 10 seats",
    features: [
      "Everything in Studio, unlimited private feeds",
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
    <span className="inline-flex" aria-hidden>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="relative inline-block h-[1em] overflow-hidden leading-none">
          {/* The resting digit sizes the cell, so a 1 doesn't sit in a 0-wide slot. */}
          <span className="invisible block h-[1em]">{d}</span>
          <span
            className="nk-pricing-tiers-reel absolute left-0 top-0 flex flex-col"
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

function Price({ value, billing, size }: { value: number; billing: Billing; size: "lg" | "md" }) {
  const lit = size === "lg";
  return (
    <p className={cn("flex items-end", lit ? "gap-3" : "gap-2.5")}>
      <span
        className={cn(
          "flex items-start font-[620] leading-none tracking-[-0.05em] [font-stretch:112%]",
          lit
            ? "text-[clamp(5rem,9vw,7.5rem)] [color:color-mix(in_srgb,rgb(var(--neon))_22%,white)] [filter:drop-shadow(0_0_2px_rgb(var(--neon)/0.7))_drop-shadow(0_0_22px_rgb(var(--neon)/0.45))]"
            : "text-[44px] text-white/90",
        )}
      >
        <span className={cn("font-medium text-white/50", lit ? "mr-1 mt-[0.12em] text-[0.32em]" : "mr-0.5 mt-1 text-xl")}>$</span>
        <RollingPrice value={value} />
      </span>
      <span className="sr-only">
        ${value} per month{billing === "yearly" ? `, billed $${value * 12} yearly` : ""}
      </span>
      <span aria-hidden className={cn("whitespace-nowrap text-[13px] leading-[1.35] text-white/55", lit ? "pb-3" : "pb-1")}>
        a month
        {lit ? <br /> : ", "}
        {billing === "yearly" ? `$${(value * 12).toLocaleString("en-US")} billed yearly` : "billed monthly"}
      </span>
    </p>
  );
}

const STUDIO = TIERS[1];
const OTHERS = [TIERS[0], TIERS[2]];

function Featured({ billing }: { billing: Billing }) {
  return (
    <BorderBeam
      duration={9}
      size={80}
      className="h-full rounded-[20px] border border-[rgb(var(--neon)/0.22)] bg-[linear-gradient(160deg,rgb(var(--neon)/0.09),rgb(255_255_255/0.015)_42%)] shadow-[0_50px_120px_-50px_rgb(var(--neon)/0.6)]"
    >
      <div className="flex h-full flex-col p-6 sm:p-9 lg:p-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="text-[22px] font-medium tracking-[-0.02em] text-white">{STUDIO.name}</h3>
          <Badge size="sm" variant="outline">
            Most shows pick this
          </Badge>
        </div>
        <p className="mt-1.5 text-[15px] text-white/60">{STUDIO.pitch}</p>

        <div className="mt-8 sm:mt-10">
          <Price value={STUDIO[billing]} billing={billing} size="lg" />
        </div>

        <dl className="mt-9 flex flex-wrap gap-x-12 gap-y-4 border-t border-white/[0.08] pt-6">
          {STUDIO.limits.map(([k, v]) => (
            <div key={k} className="flex flex-col-reverse">
              <dt className="text-[13px] text-white/55">{k}</dt>
              <dd className="text-[26px] font-[560] leading-tight tracking-[-0.02em] text-white">{v}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-8 grid content-start sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1">
          {STUDIO.features.map((f) => (
            <li key={f} className="flex gap-3 border-b border-white/[0.06] py-3 text-[15px] leading-snug text-white/80">
              <Check
                aria-hidden
                strokeWidth={2.25}
                className="mt-0.5 size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.7))]"
              />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 lg:mt-auto lg:pt-10">
          <Button variant="solid" size="lg" className="sm:px-8">
            {STUDIO.cta}
            <ArrowRight aria-hidden />
          </Button>
          <span className="text-[13px] text-white/55">No card for the trial. Cancel from the dashboard.</span>
        </div>
      </div>
    </BorderBeam>
  );
}

function Quiet({ tier, billing }: { tier: (typeof TIERS)[number]; billing: Billing }) {
  return (
    <div className="flex flex-col border-t border-white/[0.08] py-8 first:pt-8 lg:first:border-t-0 lg:first:pt-2">
      <h3 className="text-lg font-medium tracking-[-0.01em] text-white/90">{tier.name}</h3>
      <p className="mt-1 text-sm text-white/55">{tier.pitch}</p>
      <div className="mt-5">
        <Price value={tier[billing]} billing={billing} size="md" />
      </div>
      <p className="mt-4 text-sm text-white/80">{tier.summary}</p>
      <ul className="mt-4 space-y-2">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-3 text-sm leading-snug text-white/60">
            <Check aria-hidden strokeWidth={2} className="mt-px size-3.5 shrink-0 text-white/35" />
            {f}
          </li>
        ))}
      </ul>
      <Button variant="ghost" className="-ml-4 mt-5 self-start text-white/85">
        {tier.cta} <ArrowRight aria-hidden />
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
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16 lg:py-28"
    >
      <style>{css}</style>
      {/* The featured plan throws light on the wall behind it */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[30%] top-[55%] -z-10 hidden h-[28rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.08)] blur-[110px] lg:block"
      />
      <div className="mx-auto max-w-[1200px]">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2
            id="pricing-tiers-title"
            className="text-[clamp(2.3rem,5.6vw,4.5rem)] md:max-w-[13ch] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
          >
            Pay for the show, not the downloads.
          </h2>
          <div className="flex items-center gap-4 md:pb-2">
            <ToggleGroup aria-label="Billing period" value={billing} onValueChange={(v) => v && setBilling(v as Billing)}>
              <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
              <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
            </ToggleGroup>
            <span
              className={cn(
                "whitespace-nowrap text-[13px] transition-[color,text-shadow] duration-300",
                billing === "yearly" ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.5)]" : "text-white/55",
              )}
            >
              Two months free
            </span>
          </div>
        </header>

        <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Featured billing={billing} />
          </div>
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-x-10 lg:col-span-5 lg:flex">
            {OTHERS.map((tier) => (
              <Quiet key={tier.name} tier={tier} billing={billing} />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-sm text-white/60 lg:flex-row lg:items-center lg:justify-between">
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
