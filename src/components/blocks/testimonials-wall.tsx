"use client";

import * as React from "react";
import { ArrowRight, ChevronDown } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

type Quote = {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric?: { label: string; value: string };
  featured?: boolean;
};

// Ordered so the three CSS columns come out close to even.
const quotes: Quote[] = [
  {
    name: "Priya Raman",
    role: "Staff engineer",
    company: "Okapi Freight",
    metric: { label: "Deploy queue", value: "40 min → 6 min" },
    quote:
      "We cut our deploy queue from 40 minutes to 6. Nobody batches PRs on a Friday afternoon anymore, because there's nothing left to wait for.",
    featured: true,
  },
  {
    name: "Tom Weller",
    role: "Engineering manager",
    company: "Saltmarsh",
    quote:
      "The flaky-test quarantine paid for the seats in the first month. We'd been retrying the same four tests since 2023.",
  },
  {
    name: "Sam Okoro",
    role: "CTO",
    company: "Pellucid",
    quote: "I stopped writing YAML. That's the review.",
  },
  {
    name: "Leo Fischer",
    role: "Senior engineer",
    company: "Marrow",
    quote: "Support answered a question about cache eviction at 11pm on a Sunday. With a diff.",
  },
  {
    name: "Hannah Lindqvist",
    role: "Infrastructure lead",
    company: "Coldharbour",
    metric: { label: "CI spend", value: "−$7,400 / month" },
    quote:
      "We ran our own runner fleet: 40 spot instances and a cron job whose only purpose was killing zombie containers. Migrating took two afternoons. Remote cache hits went from 31% to 88% in the first week.",
  },
  {
    name: "Ines Duarte",
    role: "Platform lead",
    company: "Verso Rail",
    quote:
      "Our monorepo has 214 packages. Lockstep works out which nine actually changed, every time, and only builds those.",
  },
  {
    name: "Marcus Bell",
    role: "SRE",
    company: "Brickyard",
    quote: "Rollbacks are one command and they're boring. Boring was the whole goal.",
  },
  {
    name: "Grace Achebe",
    role: "Engineering manager",
    company: "quillon",
    quote: "We rolled it out to 60 engineers without writing a migration doc. The defaults were right.",
  },
  {
    name: "Aiko Tanaka",
    role: "Design engineer",
    company: "tessel",
    quote:
      "Preview environments on every PR changed how design review works here. Designers comment on the real build, not a screenshot from Tuesday.",
  },
  {
    name: "Dana Whitfield",
    role: "VP Engineering",
    company: "Arkline",
    metric: { label: "p95 build time", value: "18m 40s → 4m 12s" },
    quote: "Same hardware budget. I've stopped asking for more runners in quarterly planning.",
  },
  {
    name: "Rafael Mendes",
    role: "Security lead",
    company: "Halvard & Co.",
    quote:
      "The audit log is the first one our SOC 2 auditor didn't have follow-up questions about. Every deploy has an approver, a diff and a reason.",
  },
  {
    name: "Owen Price",
    role: "On-call lead",
    company: "Plinth",
    quote:
      "Our runbook used to have a section called 'babysit the release train'. I deleted it in March and nobody noticed.",
  },
];

const lit =
  "[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_1px_rgb(255_255_255/0.8),0_0_6px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.7),0_0_42px_rgb(var(--neon)/0.4)]";

const FEATURED = quotes.find((item) => item.featured)!;
const REST = quotes.filter((item) => !item.featured);

function Note({ item }: { item: Quote }) {
  return (
    <figure className="mb-12 break-inside-avoid">
      {item.metric && (
        <p className="mb-4">
          <span className="block text-[26px] font-[600] leading-tight tracking-[-0.03em] text-white [font-stretch:108%]">
            {item.metric.value}
          </span>
          <span className="mt-0.5 block text-[13px] text-white/55">{item.metric.label}</span>
        </p>
      )}
      <blockquote className="text-pretty text-[16px] leading-[1.6] text-white/70">
        <p>{item.quote}</p>
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <Avatar alt={item.name} size="sm" />
        <span className="min-w-0 text-sm leading-tight">
          <span className="block truncate font-medium text-white/90">{item.name}</span>
          <span className="block truncate text-[13px] text-white/55">
            {item.role}, {item.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function TestimonialsWall() {
  const titleId = React.useId();
  const wallId = React.useId();
  const [expanded, setExpanded] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  // Collapsing removes most of the wall from under the reader, so bring the button back into view.
  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (!next) requestAnimationFrame(() => toggleRef.current?.scrollIntoView({ block: "nearest" }));
  }

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("pink")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      {/* The one lit number throws a little light on the wall behind it */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-40 -z-10 h-[420px] w-[680px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.1),transparent)]"
      />
      <div className="mx-auto max-w-6xl">
        <h2
          id={titleId}
          className="text-[clamp(2rem,5.4vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
        >
          <span className="block">Fewer pages at 3&nbsp;a.m.</span>
          <span className="block text-white/50">Their words, not ours.</span>
        </h2>

        <figure className="mt-16 grid gap-8 border-t border-white/[0.08] pt-10 lg:mt-20 lg:grid-cols-12 lg:gap-8 lg:pt-12">
          <p className="lg:col-span-5">
            {/* Before and after: only the result is lit. */}
            <span className="block text-[clamp(3rem,7vw,6rem)] font-[620] leading-[0.95] tracking-[-0.045em] [font-stretch:112%]">
              <span className="block text-white/40">{FEATURED.metric!.value.split(" → ")[0]}</span>
              <span className={cn("block whitespace-nowrap", lit)}>
                <span aria-hidden className="text-white/30 [text-shadow:none]">→ </span>
                <span className="sr-only">down to </span>
                {FEATURED.metric!.value.split(" → ")[1]}
              </span>
            </span>
            <span className="mt-3 block text-[14px] text-white/55">
              {FEATURED.metric!.label}, {FEATURED.company}
            </span>
          </p>
          <div className="lg:col-span-7 lg:pt-2">
            <blockquote className="text-pretty text-[clamp(1.35rem,2.2vw,1.85rem)] leading-[1.35] tracking-[-0.015em] text-white/90">
              <p>&ldquo;{FEATURED.quote}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <Avatar alt={FEATURED.name} size="md" ring />
              <span className="text-sm leading-tight">
                <span className="block font-medium text-white/90">{FEATURED.name}</span>
                <span className="block text-[13px] text-white/55">
                  {FEATURED.role}, {FEATURED.company}
                </span>
              </span>
            </figcaption>
          </div>
        </figure>

        <div className="relative mt-16 border-t border-white/[0.08] pt-12 lg:mt-20">
          {/* Clipped by a wrapper: a height cap on the columns element itself would spill extra columns sideways. */}
          <div
            id={wallId}
            className={cn(!expanded && "max-h-[1100px] overflow-hidden sm:max-h-[820px] lg:max-h-[640px]")}
          >
            <div className="columns-1 gap-12 sm:columns-2 lg:columns-3 [column-rule:1px_solid_rgb(255_255_255/0.06)]">
              {REST.map((item) => (
                <Note key={item.name} item={item} />
              ))}
            </div>
          </div>
          {!expanded && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_bottom,transparent,#05060a_85%)]"
            />
          )}
          <div className={cn("flex justify-center", expanded ? "mt-4" : "absolute inset-x-0 bottom-2")}>
            <Button
              variant="outline"
              aria-expanded={expanded}
              aria-controls={wallId}
              ref={toggleRef}
              onClick={toggle}
              className="bg-[#05060a]"
            >
              {expanded ? "Show fewer" : `Show all ${quotes.length}`}
              <ChevronDown
                aria-hidden
                className={cn("transition-transform duration-200 motion-reduce:transition-none", expanded && "rotate-180")}
              />
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>Unedited, from teams that moved their pipelines over this year. We asked for numbers; most sent some.</p>
          <a
            href="#"
            className="group -my-2 inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-md py-2 text-sm font-medium text-white/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] sm:self-auto"
          >
            Read all 212 case notes
            <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
