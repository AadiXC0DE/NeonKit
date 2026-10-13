"use client";

import * as React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
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

function Card({ item }: { item: Quote }) {
  const featured = item.featured;
  return (
    <figure
      className={cn(
        "relative mb-4 break-inside-avoid overflow-hidden rounded-[18px] border p-5 sm:p-6",
        featured
          ? "border-[rgb(var(--neon)/0.5)] bg-[rgb(var(--neon)/0.035)] shadow-[0_0_0_1px_rgb(var(--neon)/0.12),0_0_36px_-6px_rgb(var(--neon)/0.45),inset_0_0_28px_-10px_rgb(var(--neon)/0.35)]"
          : "border-white/[0.07] bg-white/[0.02]",
      )}
    >
      {featured && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.16)] blur-[40px]"
        />
      )}
      {item.metric && (
        <div className={cn("relative mb-5 border-b pb-4", featured ? "border-[rgb(var(--neon)/0.18)]" : "border-white/[0.06]")}>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{item.metric.label}</p>
          <p
            className={cn(
              "mt-1.5 font-semibold tabular-nums tracking-[-0.03em]",
              featured ? cn("text-[28px] leading-tight", lit) : "text-xl text-white/90",
            )}
          >
            {item.metric.value}
          </p>
        </div>
      )}
      <blockquote
        className={cn(
          "relative text-pretty",
          featured ? "text-[19px] leading-[1.45] tracking-[-0.01em] text-white/90" : "text-[15px] leading-relaxed text-white/70",
        )}
      >
        <p>{item.quote}</p>
      </blockquote>
      <figcaption className="relative mt-5 flex items-center gap-3">
        <Avatar alt={item.name} size="sm" ring={featured} />
        <span className="min-w-0 text-sm leading-tight">
          <span className="block truncate font-medium text-white/90">{item.name}</span>
          <span className="block truncate text-[13px] text-white/45">
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

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("pink")}
      className="relative overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Lockstep · field reports</p>
            <h2
              id={titleId}
              className="mt-5 max-w-[17ch] text-balance text-[clamp(2.1rem,5vw,3.5rem)] font-semibold leading-[1] tracking-[-0.04em]"
            >
              Fewer pages at 3 a.m. Their words, not ours.
            </h2>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-white/55 lg:text-right">
              Unedited, from the teams that moved their pipelines over this year. We asked for numbers; most of them
              sent some.
            </p>
            <a
              href="#"
              className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-white/75 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              Read all 212 case notes
              <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div className="relative mt-14 sm:mt-16">
          {/* Clipped by a wrapper: a height cap on the columns element itself would spill extra columns sideways. */}
          <div
            id={wallId}
            className={cn(
              // The negative margin and matching padding leave room for the featured card's glow.
              "-mx-5 -mt-10 px-5 pt-10 sm:-mx-8 sm:px-8",
              !expanded && "max-h-[1180px] overflow-hidden sm:max-h-[900px] lg:max-h-[700px]",
            )}
          >
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {quotes.map((item) => (
                <Card key={item.name} item={item} />
              ))}
            </div>
          </div>
          {!expanded && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_bottom,transparent,#05060a_85%)]"
            />
          )}
          <div className={cn("flex justify-center", expanded ? "mt-8" : "absolute inset-x-0 bottom-2")}>
            <Button
              variant="outline"
              aria-expanded={expanded}
              aria-controls={wallId}
              onClick={() => setExpanded((value) => !value)}
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
      </div>
    </section>
  );
}
