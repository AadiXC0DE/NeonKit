"use client";

import * as React from "react";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    id: "inverters",
    q: "Which inverters does Brightline work with?",
    a: "Anything with a Modbus TCP port, which covers roughly nine in ten home inverters sold since 2016. Setup checks yours in about a minute. If it can't talk to it, the Brightline Clip ($39) reads your meter instead.",
  },
  {
    id: "mismatch",
    q: "Why does the app show less than my inverter's screen?",
    a: "Your inverter shows DC power coming off the panels. We show AC power after conversion, which is what your house can actually use. A 3–4% gap is normal; past 6% we flag it on the home screen.",
  },
  {
    id: "refresh",
    q: "How often does the data refresh?",
    a: "Every 10 seconds while the app is open and every 5 minutes in the background. History is kept at 5-minute resolution for as long as you have an account, on every plan.",
  },
  {
    id: "offline",
    q: "What happens when my Wi-Fi drops?",
    a: "The Clip buffers up to 14 days of readings and uploads them once it's back online. You'll see a dashed line over the gap until the backfill lands, usually within a minute.",
  },
  {
    id: "panels",
    q: "Can it tell me when a panel is underperforming?",
    a: "With panel-level optimisers, yes, panel by panel. Without them we compare each string to a forecast for your roof's pitch and orientation, and alert you when it trails by more than 12% for three clear days in a row.",
  },
  {
    id: "battery",
    q: "Does it work with a home battery?",
    a: "It shows charge, discharge and state of charge next to your solar, and can schedule charging for cheap overnight hours if your tariff has time-of-use pricing.",
  },
  {
    id: "privacy",
    q: "Who can see my data?",
    a: "You, and anyone you invite to your home. We don't sell it and we don't share it with your energy supplier. Export everything as CSV whenever you like; delete your account and it's gone within 30 days.",
  },
  {
    id: "price",
    q: "What does it cost after the trial?",
    a: "$4 a month or $40 a year per home. The 30-day trial doesn't ask for a card, and the Clip is yours to keep either way.",
  },
];

const CREW = ["Ines Carvalho", "Tomasz Wolny", "Mariam Okafor"];

function Helpful() {
  const [vote, setVote] = React.useState<"yes" | "no" | null>(null);

  if (vote) {
    return (
      <p role="status" className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
        {vote === "yes" ? "Noted. Thanks." : "Thanks. We read every one of these."}
      </p>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
      <span>Helpful?</span>
      {(["yes", "no"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setVote(value)}
          className="cursor-pointer rounded-md border border-white/10 px-2 py-1 uppercase text-white/55 outline-none transition-colors duration-150 hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export default function FaqAccordion() {
  const [open, setOpen] = React.useState("inverters");

  return (
    <section
      aria-labelledby="faq-accordion-title"
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate overflow-clip bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16 lg:py-28"
    >
      {/* Late-afternoon light falling across the top-left corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-56 -z-10 h-[520px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.07),transparent)]"
      />

      <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Brightline · Help desk</p>
          <h2
            id="faq-accordion-title"
            className="mt-5 max-w-[14ch] text-[clamp(2.4rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            What owners ask in week one.
          </h2>
          <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-white/55">
            Brightline reads your inverter every ten seconds. Once the numbers start moving, these are the questions
            that land in our inbox.
          </p>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
            <span>{String(FAQS.length).padStart(2, "0")} questions</span>
            <span>Updated 2 Oct 2026</span>
          </div>
          <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
            {FAQS.map((item, i) => {
              const isOpen = open === item.id;
              return (
                <AccordionItem key={item.id} value={item.id} className="border-white/[0.07] transition-[background-color] duration-300 data-[state=open]:bg-[radial-gradient(45%_90%_at_0%_45%,rgb(var(--neon)/0.07),transparent)]">
                  <AccordionTrigger className="gap-5 py-5 text-[15px] sm:text-base">
                    <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
                      <span
                        className={cn(
                          "w-5 shrink-0 font-mono text-[11px] tabular-nums transition-colors duration-200",
                          isOpen ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]" : "text-white/30",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("transition-colors duration-200", isOpen ? "text-white" : "text-white/80")}>
                        {item.q}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-[3.25rem] text-[15px] sm:pl-[3.75rem]">
                    <p className="max-w-[60ch] text-pretty">{item.a}</p>
                    <Helpful />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <a
            href="#"
            className="group mt-8 inline-flex items-center gap-1.5 rounded-md text-sm text-white/55 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            All 140 help articles
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="relative max-w-md self-start overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-10 lg:col-start-1 lg:row-start-2">
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
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">Median reply 9 min</span>
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white">Still stuck?</h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-white/55">
            Our desk is three electricians and one very patient engineer. Send a photo of your inverter&apos;s label
            and we&apos;ll take it from there.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="sm">
              <a href="mailto:help@brightline.example">
                <Mail /> Email the desk
              </a>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <a href="tel:+442038081172">
                <Phone /> +44 20 3808 1172
              </a>
            </Button>
          </div>
          <p className="mt-5 border-t border-white/[0.06] pt-4 font-mono text-[11px] tracking-[0.04em] text-white/35">
            Mon–Sat, 07:00–19:00 CET
          </p>
        </div>
      </div>
    </section>
  );
}
