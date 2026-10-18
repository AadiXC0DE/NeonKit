"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { basePath, contactEmail } from "./config";
import { plans, type Billing, type Plan } from "./data";
import { Headline, focusRing } from "./primitives";

const css = `
.nk-saas-reel { transition: transform 560ms cubic-bezier(0.23, 1, 0.32, 1); }
@media (prefers-reduced-motion: reduce) { .nk-saas-reel { transition: none; } }
`;

// Each digit is a reel of 0–9 that rolls to its new value, staggered from the right like an odometer.
function RollingPrice({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="inline-flex" aria-hidden>
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

function Price({ plan, billing, size }: { plan: Plan; billing: Billing; size: "lg" | "md" }) {
  const price = plan[billing];
  const free = price === 0;
  return (
    <p className="flex items-end gap-3">
      <span
        className={cn(
          "flex items-start font-[620] leading-none tracking-[-0.045em] [font-stretch:112%]",
          "[font-feature-settings:'tnum'_0]",
          size === "lg"
            ? "text-[clamp(64px,9vw,96px)] [color:color-mix(in_srgb,rgb(var(--neon))_22%,white)]"
            : "text-[44px] text-white",
        )}
      >
        <span className={cn("mr-1 font-medium text-white/50", size === "lg" ? "mt-[0.12em] text-[0.36em]" : "mt-1 text-xl")}>
          $
        </span>
        <RollingPrice value={price} />
      </span>
      <span className="sr-only">
        {free ? "Free" : `$${price} per seat per month${billing === "yearly" ? `, billed $${price * 12} yearly` : ""}`}
      </span>
      <span aria-hidden className={cn("text-[13px] leading-snug text-white/55", size === "lg" ? "pb-2.5" : "pb-1")}>
        {plan.unit}
        <br />
        {free ? "no card needed" : billing === "yearly" ? `$${price * 12} a seat, billed yearly` : "billed monthly"}
      </span>
    </p>
  );
}

function Limits({ plan }: { plan: Plan }) {
  return (
    <dl className="flex flex-wrap gap-x-7 gap-y-2 text-[14px]">
      {plan.limits.map(([k, v]) => (
        <div key={k} className="flex items-baseline gap-2">
          <dt className="text-white/50">{k}</dt>
          <dd className="text-white/90">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Features({ plan, lit, columns }: { plan: Plan; lit?: boolean; columns?: boolean }) {
  return (
    <ul className={cn("grid gap-x-8 gap-y-3", columns && "sm:grid-cols-2")}>
      {plan.features.map((f) => (
        <li key={f} className="flex gap-3 text-[14px] leading-snug text-white/70">
          <Check
            aria-hidden
            strokeWidth={2.25}
            className={cn(
              "mt-px size-4 shrink-0",
              lit ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.7))]" : "text-white/35",
            )}
          />
          {f}
        </li>
      ))}
    </ul>
  );
}

function ctaHref(plan: Plan) {
  return plan.name === "Fleet" ? `mailto:${contactEmail}` : "#";
}

/** The plan most teams pick, given the room. */
function Featured({ plan, billing, level: Name }: { plan: Plan; billing: Billing; level: "h2" | "h3" }) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-white/[0.09] bg-[linear-gradient(180deg,rgb(var(--neon)/0.06),rgb(255_255_255/0.015)_40%)] p-6 sm:p-9">
      {/* A lit tube along the top edge: the recommended plan, and the only lit one */}
      <span
        aria-hidden
        className="absolute inset-x-9 top-0 h-[2px] rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_22px_rgb(var(--neon)/0.6)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.12)] blur-[60px]"
      />
      <div className="relative">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <Name className="text-[22px] font-semibold tracking-[-0.02em] text-white">{plan.name}</Name>
          <span className="text-[13px] text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)]">
            Most teams start here
          </span>
        </div>
        <p className="mt-1 text-[15px] text-white/60">{plan.pitch}</p>

        <div className="mt-9">
          <Price plan={plan} billing={billing} size="lg" />
        </div>
        <div className="mt-7 border-y border-white/[0.07] py-4">
          <Limits plan={plan} />
        </div>
        <div className="mt-7">
          <Features plan={plan} lit columns />
        </div>
        <Button asChild variant="solid" size="lg" className="mt-10 w-full sm:w-auto sm:px-8">
          <Link href={ctaHref(plan)}>
            {plan.cta} <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** The other two, set as rows beside it: unboxed, smaller, still complete. */
function Other({ plan, billing, level: Name }: { plan: Plan; billing: Billing; level: "h2" | "h3" }) {
  return (
    <div className="py-8 first:pt-0 last:pb-0 md:py-0 lg:py-9 lg:first:pt-0 lg:last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <Name className="text-[19px] font-semibold tracking-[-0.02em] text-white">{plan.name}</Name>
        <Link
          href={ctaHref(plan)}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-md text-[14px] font-medium text-white/80 transition-colors hover:text-[rgb(var(--neon))]",
            focusRing,
          )}
        >
          {plan.cta}
          <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <p className="mt-1 text-[14px] text-white/55">{plan.pitch}</p>
      <div className="mt-5">
        <Price plan={plan} billing={billing} size="md" />
      </div>
      <div className="mt-5">
        <Limits plan={plan} />
      </div>
      <div className="mt-5">
        <Features plan={plan} />
      </div>
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
          "whitespace-nowrap text-[13px] transition-[color,text-shadow] duration-300",
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
  const level = Heading === "h1" ? "h2" : "h3";
  const featured = plans.find((plan) => plan.featured);
  const others = plans.filter((plan) => !plan.featured);

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "relative isolate scroll-mt-20 overflow-hidden px-5 sm:px-8",
        Heading === "h1" ? "pb-20 pt-36 sm:pb-24 sm:pt-48" : "py-24 lg:py-36",
      )}
    >
      <style>{css}</style>
      <div className="mx-auto max-w-[1120px]">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[920px]">
            <Headline
              as={Heading}
              id={titleId}
              clock={clock}
              leading={Heading === "h1" ? "leading-[0.94]" : undefined}
              className={Heading === "h1" ? "text-[clamp(2.75rem,6.6vw,5.75rem)]" : "text-[clamp(2.25rem,5.4vw,4.5rem)]"}
            >
              {title}
            </Headline>
            {intro && (
              <p className="mt-7 max-w-[50ch] text-pretty text-[16px] leading-[1.6] text-white/60">{intro}</p>
            )}
          </div>
          <BillingToggle billing={billing} onChange={setBilling} />
        </header>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            {featured && <Featured plan={featured} billing={billing} level={level} />}
          </div>
          <div className="divide-y divide-white/[0.07] md:grid md:grid-cols-2 md:gap-10 md:divide-y-0 lg:col-span-4 lg:col-start-9 lg:block lg:divide-y lg:pt-9">
            {others.map((plan) => (
              <Other key={plan.name} plan={plan} billing={billing} level={level} />
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-[14px] text-white/55 lg:flex-row lg:items-center lg:justify-between">
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
