"use client";

import * as React from "react";
import { ChevronDown } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sections } from "./config";
import { quotes, type Quote } from "./data";
import { Headline, display } from "./primitives";

const section = sections[3];

function Attribution({ item, className }: { item: Quote; className?: string }) {
  return (
    <figcaption className={cn("text-[14px] leading-snug", className)}>
      <span className="text-white/90">{item.name}</span>
      <span className="text-white/50">
        , {item.role} at {item.company}
      </span>
    </figcaption>
  );
}

/** A note from the wall: just the words and who said them. A number, when they sent one, goes on top. */
function Note({ item }: { item: Quote }) {
  return (
    <figure className="mb-12 break-inside-avoid">
      {item.metric && (
        <p className="mb-4">
          <span className={cn("block text-[34px] leading-none text-white", display)}>{item.metric.value}</span>
          <span className="mt-1.5 block text-[13px] text-white/50">{item.metric.label}</span>
        </p>
      )}
      <blockquote className="text-pretty text-[16px] leading-[1.6] text-white/70">
        <p>{item.quote}</p>
      </blockquote>
      <Attribution item={item} className="mt-3" />
    </figure>
  );
}

export function Testimonials() {
  const [expanded, setExpanded] = React.useState(false);
  const lead = quotes.find((q) => q.featured) ?? quotes[0];
  const rest = quotes.filter((q) => q !== lead);

  return (
    <section
      id={section.id}
      aria-labelledby="customers-title"
      className="relative scroll-mt-20 overflow-hidden px-5 py-24 sm:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1120px]">
        <Headline id="customers-title" clock={section.clock} className="text-[clamp(2.25rem,5.4vw,4.5rem)]">
          Fewer alarms set for 1:55am.
        </Headline>

        {/* One team's number, set as large as the headline, then the quote that explains it */}
        <figure className="mt-16 grid gap-8 border-t border-white/[0.08] pt-10 lg:mt-20 lg:grid-cols-12 lg:gap-8 lg:pt-14">
          {lead.metric && (
            <p className="lg:col-span-5">
              <span
                className={cn(
                  "block whitespace-nowrap text-[clamp(4rem,10vw,8.5rem)]",
                  display,
                  "leading-[0.9]",
                  "[color:color-mix(in_srgb,rgb(var(--neon))_22%,white)] [text-shadow:0_0_30px_rgb(var(--neon)/0.35)]",
                )}
              >
                {lead.metric.value}
              </span>
              <span className="mt-4 block text-[14px] text-white/55">
                {lead.metric.label}, {lead.company}
              </span>
            </p>
          )}
          <div className="lg:col-span-6 lg:col-start-7">
            <blockquote className="text-pretty text-[clamp(1.35rem,2.3vw,1.75rem)] leading-[1.4] tracking-[-0.012em] text-white/90">
              <p>&ldquo;{lead.quote}&rdquo;</p>
            </blockquote>
            <Attribution item={lead} className="mt-6" />
          </div>
        </figure>

        <div className="relative mt-20 lg:mt-28">
          {/* Clipped by a wrapper: a height cap on the columns element itself would spill extra columns sideways. */}
          <div
            id="customers-wall"
            className={cn(!expanded && "max-h-[980px] overflow-hidden sm:max-h-[760px] lg:max-h-[620px]")}
          >
            <div className="columns-1 gap-12 sm:columns-2 lg:columns-3">
              {rest.map((item) => (
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
          <div className={cn("flex", expanded ? "mt-4" : "absolute inset-x-0 bottom-2")}>
            <Button
              variant="ghost"
              aria-expanded={expanded}
              aria-controls="customers-wall"
              onClick={() => setExpanded((value) => !value)}
              className="-ml-4 text-white/85"
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
