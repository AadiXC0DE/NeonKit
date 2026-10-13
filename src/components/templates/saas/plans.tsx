"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { basePath, contactEmail } from "./config";
import { plans, type Billing, type Plan } from "./data";
import { Eyebrow, focusRing } from "./primitives";

const css = `
.nk-saas-reel { transition: transform 560ms cubic-bezier(0.23, 1, 0.32, 1); }
@media (prefers-reduced-motion: reduce) { .nk-saas-reel { transition: none; } }
`;

// Each digit is a reel of 0–9 that rolls to its new value, staggered from the right like an odometer.
function RollingPrice({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="inline-flex tabular-nums" aria-hidden>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="relative inline-block h-[1em] overflow-hidden leading-none">
          <span
            className="nk-saas-reel flex flex-col"
            style={{
              transform: `translateY(-${Number(d) * 10}%)`,
              transitionDelay: `${(digits.length - 1 - i) * 60}ms`,
            }}
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

function PlanCard({ plan, billing, level: Name }: { plan: Plan; billing: Billing; level: "h2" | "h3" }) {
  const price = plan[billing];
  const free = price === 0;

  return (
    <div className={cn("relative flex h-full flex-col p-6 sm:p-7", plan.featured && "lg:py-9")}>
      <div className="flex items-center justify-between gap-3">
        <Name className={cn("text-lg font-medium tracking-[-0.01em]", plan.featured ? "text-white" : "text-white/85")}>
          {plan.name}
        </Name>
        {plan.featured && (
          <Badge size="sm" variant="outline">
            Most teams start here
          </Badge>
        )}
      </div>
      <p className="mt-1.5 text-sm text-white/60">{plan.pitch}</p>

      <p className="mt-8 flex items-end gap-2.5">
        <span
          className={cn(
            "flex items-start text-[56px] font-semibold leading-none tracking-[-0.045em]",
            plan.featured
              ? "[color:color-mix(in_srgb,rgb(var(--neon))_25%,white)] [filter:drop-shadow(0_0_14px_rgb(var(--neon)/0.55))]"
              : "text-white",
          )}
        >
          <span className="mr-0.5 mt-1.5 text-2xl font-medium text-white/60">$</span>
          <RollingPrice value={price} />
        </span>
        <span className="sr-only">
          {free
            ? "Free"
            : `$${price} per seat per month${billing === "yearly" ? `, billed $${price * 12} yearly` : ""}`}
        </span>
        <span aria-hidden className="pb-1 text-sm leading-tight text-white/60">
          {plan.unit}
          <br />
          <span className="font-mono text-[11px]">
            {free ? "no card" : billing === "yearly" ? `$${price * 12} / seat billed yearly` : "billed monthly"}
          </span>
        </span>
      </p>

      <dl className="mt-7 grid grid-cols-3 overflow-hidden rounded-xl border border-white/[0.07]">
        {plan.limits.map(([k, v], i) => (
          <div key={k} className={cn("min-w-0 px-3 py-2.5", i > 0 && "border-l border-white/[0.07]")}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">{k}</dt>
            <dd className="mt-1 truncate text-sm tabular-nums text-white/85">{v}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-7 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3 text-sm leading-snug text-white/70">
            <Check
              aria-hidden
              strokeWidth={2.25}
              className={cn(
                "mt-px size-4 shrink-0",
                plan.featured
                  ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.7))]"
                  : "text-white/40",
              )}
            />
            {f}
          </li>
        ))}
      </ul>

      <Button asChild variant={plan.featured ? "solid" : "soft"} size="lg" className="mt-9 w-full">
        <Link href={plan.name === "Fleet" ? `mailto:${contactEmail}` : "#"}>
          {plan.cta}
          {plan.featured && <ArrowRight aria-hidden />}
        </Link>
      </Button>
    </div>
  );
}

export function BillingToggle({ billing, onChange }: { billing: Billing; onChange: (billing: Billing) => void }) {
  return (
    <div className="flex items-center gap-3">
      <ToggleGroup aria-label="Billing period" value={billing} onValueChange={(v) => v && onChange(v as Billing)}>
        <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
        <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
      </ToggleGroup>
      <span
        className={cn(
          "whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] transition-[color,text-shadow] duration-300",
          billing === "yearly"
            ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]"
            : "text-white/60",
        )}
      >
        2 months free
      </span>
    </div>
  );
}

type PlansProps = {
  /** The landing page uses an h2 inside its flow; the pricing page leads with this as its h1. */
  as?: "h1" | "h2";
  id?: string;
  clock?: string;
  title: string;
  intro?: string;
  billing?: Billing;
  onBillingChange?: (billing: Billing) => void;
  compareLink?: boolean;
};

export function Plans({
  as: Heading = "h2",
  id,
  clock,
  title,
  intro,
  billing: billingProp,
  onBillingChange,
  compareLink,
}: PlansProps) {
  const [own, setOwn] = React.useState<Billing>("yearly");
  const billing = billingProp ?? own;
  const setBilling = onBillingChange ?? setOwn;
  const titleId = `${id ?? "plans"}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "relative isolate scroll-mt-20 overflow-hidden px-5 sm:px-8",
        Heading === "h1" ? "pb-20 pt-32 sm:pb-24 sm:pt-40" : "py-20 lg:py-28",
      )}
    >
      <style>{css}</style>
      {/* The featured plan throws light on the floor beneath it */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[12%] left-1/2 -z-10 hidden h-64 w-[36rem] -translate-x-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.1)] blur-[90px] lg:block"
      />
      <div className="mx-auto max-w-[1120px]">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow clock={clock}>Pricing</Eyebrow>
            <Heading
              id={titleId}
              className={cn(
                "mt-4 text-balance font-semibold tracking-[-0.04em] text-white",
                Heading === "h1"
                  ? "text-[clamp(2.6rem,6.4vw,5rem)] leading-[0.95]"
                  : "text-[clamp(2.25rem,5vw,3.75rem)] leading-[0.98]",
              )}
            >
              {title}
            </Heading>
            {intro && (
              <p className="mt-6 max-w-[48ch] text-pretty text-[15px] leading-relaxed text-white/60">{intro}</p>
            )}
          </div>
          <BillingToggle billing={billing} onChange={setBilling} />
        </header>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-center lg:gap-5">
          {plans.map((plan) =>
            plan.featured ? (
              <BorderBeam
                key={plan.name}
                duration={9}
                size={70}
                className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgb(var(--neon)/0.07),rgb(255_255_255/0.02)_45%)] shadow-[0_40px_100px_-40px_rgb(var(--neon)/0.55)] md:order-first md:col-span-2 lg:order-none lg:col-span-1"
              >
                <PlanCard plan={plan} billing={billing} level={Heading === "h1" ? "h2" : "h3"} />
              </BorderBeam>
            ) : (
              <div key={plan.name} className="rounded-[20px] border border-white/[0.08] bg-white/[0.02]">
                <PlanCard plan={plan} billing={billing} level={Heading === "h1" ? "h2" : "h3"} />
              </div>
            ),
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-sm text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <p>Every plan: unlimited readers, rollbacks that never count against you, and no per-deploy fees.</p>
          {compareLink ? (
            <Link
              href={`${basePath}/pricing`}
              className={cn(
                "group inline-flex items-center gap-1.5 self-start rounded-md font-medium text-white/85 transition-colors hover:text-[rgb(var(--neon))] lg:self-auto",
                focusRing,
              )}
            >
              Compare every line
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          ) : (
            <a
              href={`mailto:${contactEmail}`}
              className={cn(
                "inline-flex items-center gap-1 self-start rounded-md text-white/85 transition-colors hover:text-[rgb(var(--neon))] lg:self-auto",
                focusRing,
              )}
            >
              More than 200 engineers?{" "}
              <span className="underline decoration-white/25 underline-offset-4">Talk to us</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
