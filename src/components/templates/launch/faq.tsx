"use client";

import * as React from "react";
import { ArrowUpRight } from "@/components/ui/icons";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import { contact } from "./config";
import { faqs } from "./data";

export function Faq() {
  const [open, setOpen] = React.useState(faqs[0].id);

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[1176px] gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <h2
            id="faq-title"
            className="max-w-[10ch] text-balance text-[clamp(2.6rem,6vw,5rem)] font-[640] leading-[0.92] tracking-[-0.045em] text-white [font-stretch:112%]"
          >
            Before you ask.
          </h2>
          <p className="mt-7 max-w-[34ch] text-pretty text-[16px] leading-[1.6] text-white/70">
            Something we missed? Two of us answer the inbox, usually the same evening.
          </p>
          <a
            href={`mailto:${contact.email}`}
            className="group mt-5 inline-flex items-center gap-1.5 rounded-md text-[15px] font-medium text-white/90 underline decoration-white/25 underline-offset-4 outline-none transition-colors hover:decoration-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            {contact.email}
            <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
          </a>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="border-t border-white/10">
            {faqs.map((item) => {
              const isOpen = open === item.id;
              return (
                <AccordionItem key={item.id} value={item.id} className="border-white/[0.08]">
                  <AccordionTrigger className="gap-5 py-6 text-[18px] font-medium tracking-[-0.015em] sm:text-[21px]">
                    <span className={cn("transition-colors duration-200", isOpen ? "text-white" : "text-white/80")}>{item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-7 text-[16px]">
                    <p className="max-w-[60ch] text-pretty leading-[1.6] text-white/70">{item.a}</p>
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
