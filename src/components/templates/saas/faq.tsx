"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { contactEmail } from "./config";
import type { Faq as FaqItem } from "./data";
import { Eyebrow } from "./primitives";

const CREW = ["Leah Oduya", "Marco Ruiz", "Jun Sato"];

// Inline `code` in answers renders as mono, so CLI flags read as flags.
function Answer({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="rounded-[5px] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-white/85">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

type FaqProps = {
  id: string;
  clock?: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: FaqItem[];
  updated: string;
};

export function Faq({ id, clock, eyebrow, title, intro, items, updated }: FaqProps) {
  const [open, setOpen] = React.useState(items[0]?.id ?? "");

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative isolate scroll-mt-20 overflow-clip px-5 py-20 sm:px-8 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 -z-10 h-[560px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.06),transparent)]"
      />

      <div className="mx-auto grid max-w-[1120px] gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <Eyebrow clock={clock}>{eyebrow}</Eyebrow>
          <h2
            id={`${id}-title`}
            className="mt-5 max-w-[14ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            {title}
          </h2>
          <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-white/60">{intro}</p>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
            <span>{String(items.length).padStart(2, "0")} questions</span>
            <span>Updated {updated}</span>
          </div>
          <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
            {items.map((item, i) => {
              const isOpen = open === item.id;
              return (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-white/[0.07] transition-[background-color] duration-300 data-[state=open]:bg-[radial-gradient(45%_90%_at_0%_45%,rgb(var(--neon)/0.07),transparent)]"
                >
                  <AccordionTrigger className="gap-5 py-5 text-[15px] sm:text-base">
                    <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
                      <span
                        className={cn(
                          "w-5 shrink-0 font-mono text-[11px] tabular-nums transition-colors duration-200",
                          isOpen
                            ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]"
                            : "text-white/60",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("transition-colors duration-200", isOpen ? "text-white" : "text-white/80")}>
                        {item.q}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-[3.25rem] text-[15px] text-white/60 sm:pl-[3.75rem]">
                    <p className="max-w-[60ch] text-pretty">
                      <Answer text={item.a} />
                    </p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="relative max-w-md self-start overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-24 lg:col-start-1 lg:row-start-2">
          <span
            aria-hidden
            className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.5),transparent)]"
          />
          <div className="flex items-center justify-between gap-4">
            <AvatarGroup size="md">
              {CREW.map((name, i) => (
                <Avatar key={name} alt={name} status={i === CREW.length - 1 ? "online" : undefined} />
              ))}
            </AvatarGroup>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">Median reply 11 min</span>
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white">Still have a question?</h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-white/60">
            Three engineers who have all been paged at 2am, answering in daylight hours. Send your deploy setup and
            we&apos;ll tell you what a window would look like.
          </p>
          <Button asChild size="sm" className="mt-5">
            <a href={`mailto:${contactEmail}`}>
              <Mail aria-hidden /> {contactEmail}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
