"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import { contact } from "./config";
import { faqs } from "./data";

export function Faq() {
  const [open, setOpen] = React.useState(faqs[0].id);

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-[1176px] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">Questions</p>
          <h2
            id="faq-title"
            className="mt-6 max-w-[12ch] text-[clamp(2.5rem,5.6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white"
          >
            Before you ask.
          </h2>
          <p className="mt-6 max-w-[38ch] text-pretty text-[15px] leading-relaxed text-white/65">
            Something we missed? Two of us answer the inbox, usually the same evening.
          </p>
          <a
            href={`mailto:${contact.email}`}
            className="group mt-6 inline-flex items-center gap-1.5 rounded-md font-mono text-[13px] text-white/85 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            {contact.email}
            <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
          </a>
        </div>

        <div>
          <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="border-t border-white/10">
            {faqs.map((item, i) => {
              const isOpen = open === item.id;
              return (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-white/[0.07] transition-[background-color] duration-300 data-[state=open]:bg-[radial-gradient(45%_90%_at_0%_45%,rgb(var(--neon)/0.07),transparent)]"
                >
                  <AccordionTrigger className="gap-5 py-5 text-[15px] sm:text-[17px]">
                    <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
                      <span
                        className={cn(
                          "w-5 shrink-0 font-mono text-[11px] tabular-nums transition-colors duration-200",
                          isOpen ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]" : "text-white/55",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("transition-colors duration-200", isOpen ? "text-white" : "text-white/85")}>{item.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-9 text-[15px] sm:pl-11">
                    <p className="max-w-[60ch] text-pretty leading-relaxed text-white/65">{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
