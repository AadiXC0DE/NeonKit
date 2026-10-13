"use client";

import * as React from "react";
import { Mail } from "@/components/ui/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { contactEmail } from "./config";
import type { Faq as FaqItem } from "./data";
import { Headline, focusRing } from "./primitives";

const CREW = ["Leah Oduya", "Marco Ruiz", "Jun Sato"];

// Inline `code` in answers renders as mono, so CLI flags read as flags.
function Answer({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-white/85">
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
  title: string;
  intro: string;
  items: FaqItem[];
  updated: string;
};

export function Faq({ id, clock, title, intro, items, updated }: FaqProps) {
  const [open, setOpen] = React.useState(items[0]?.id ?? "");

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative isolate scroll-mt-20 overflow-clip px-5 py-24 sm:px-8 lg:py-36"
    >
      <div className="mx-auto grid max-w-[1120px] gap-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-16">
        <div className="lg:col-span-5 lg:row-start-1">
          <Headline id={`${id}-title`} clock={clock} className="max-w-[13ch] text-[clamp(2.25rem,4.6vw,3.75rem)]">
            {title}
          </Headline>
          <p className="mt-7 max-w-[42ch] text-pretty text-[16px] leading-[1.6] text-white/60">{intro}</p>
          <p className="mt-4 text-[13px] text-white/55">Last updated {updated}</p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:pt-2">
          <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="border-t border-white/10">
            {items.map((item) => {
              const isOpen = open === item.id;
              return (
                <AccordionItem key={item.id} value={item.id} className="border-white/[0.08]">
                  <AccordionTrigger className="gap-5 py-5 text-[16px] sm:text-[17px]">
                    <span className={cn("transition-colors duration-200", isOpen ? "text-white" : "text-white/80")}>
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-7 pr-8 text-[15px] leading-[1.65] text-white/60">
                    <p className="max-w-[60ch] text-pretty">
                      <Answer text={item.a} />
                    </p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="max-w-md self-start lg:sticky lg:top-24 lg:col-span-4 lg:row-start-2">
          <AvatarGroup size="md">
            {CREW.map((name, i) => (
              <Avatar key={name} alt={name} status={i === CREW.length - 1 ? "online" : undefined} />
            ))}
          </AvatarGroup>
          <h3 className="mt-5 text-[17px] font-medium text-white">Still have a question?</h3>
          <p className="mt-2 text-pretty text-[14px] leading-relaxed text-white/60">
            Three engineers who have all been paged at 2am answer in daylight hours, usually within 11 minutes. Send
            your deploy setup and we&apos;ll sketch what a window would look like.
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-md text-[14px] font-medium text-white/90 underline decoration-white/25 underline-offset-[5px] transition-colors hover:text-[rgb(var(--neon))] hover:decoration-[rgb(var(--neon)/0.6)]",
              focusRing,
            )}
          >
            <Mail aria-hidden className="size-4" /> {contactEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
