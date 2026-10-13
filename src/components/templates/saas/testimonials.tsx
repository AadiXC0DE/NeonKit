"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sections } from "./config";
import { quotes, type Quote } from "./data";
import { Eyebrow } from "./primitives";

const section = sections[3];

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
        <div
          className={cn(
            "relative mb-5 border-b pb-4",
            featured ? "border-[rgb(var(--neon)/0.18)]" : "border-white/[0.06]",
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">{item.metric.label}</p>
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
          featured
            ? "text-[19px] leading-[1.45] tracking-[-0.01em] text-white/90"
            : "text-[15px] leading-relaxed text-white/70",
        )}
      >
        <p>{item.quote}</p>
      </blockquote>
      <figcaption className="relative mt-5 flex items-center gap-3">
        <Avatar alt={item.name} size="sm" ring={featured} />
        <span className="min-w-0 text-sm leading-tight">
          <span className="block truncate font-medium text-white/90">{item.name}</span>
          <span className="block truncate text-[13px] text-white/60">
            {item.role}, {item.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <section
      id={section.id}
      aria-labelledby="customers-title"
      className="relative scroll-mt-20 overflow-hidden px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow clock={section.clock}>Field notes</Eyebrow>
            <h2
              id="customers-title"
              className="mt-5 max-w-[16ch] text-balance text-[clamp(2.1rem,5vw,3.5rem)] font-semibold leading-[1] tracking-[-0.04em] text-white"
            >
              Fewer alarms set for 1:55am.
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-white/60 lg:justify-self-end lg:text-right">
            From teams that moved their releases to the middle of the night this year. We asked for numbers; most of
            them sent some.
          </p>
        </div>

        <div className="relative mt-14 sm:mt-16">
          {/* Clipped by a wrapper: a height cap on the columns element itself would spill extra columns sideways. */}
          <div
            id="customers-wall"
            className={cn(
              // The negative margin and matching padding leave room for the featured card's glow.
              "-mx-5 -mt-10 px-5 pt-10 sm:-mx-8 sm:px-8",
              !expanded && "max-h-[1120px] overflow-hidden sm:max-h-[880px] lg:max-h-[700px]",
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
              aria-controls="customers-wall"
              onClick={() => setExpanded((value) => !value)}
              className="bg-[#05060a]"
            >
              {expanded ? "Show fewer" : `Read all ${quotes.length}`}
              <ChevronDown
                aria-hidden
                className={cn(
                  "transition-transform duration-200 motion-reduce:transition-none",
                  expanded && "rotate-180",
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
