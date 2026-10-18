"use client";

import * as React from "react";
import { ArrowUpRight, Mail, Phone } from "@/components/ui/icons";
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
  const thanksRef = React.useRef<HTMLParagraphElement>(null);

  // The buttons unmount on vote, so hand focus to the thank-you line instead of dropping it on <body>.
  React.useEffect(() => {
    if (vote) thanksRef.current?.focus();
  }, [vote]);

  if (vote) {
    return (
      <p ref={thanksRef} role="status" tabIndex={-1} className="mt-5 text-[13px] text-white/55 outline-none">
        {vote === "yes" ? "Noted. Thanks." : "Thanks. We read every one of these."}
      </p>
    );
  }
  return (
    <div className="mt-5 flex items-center gap-1 text-[13px] text-white/55">
      <span className="mr-2">Did this answer it?</span>
      {(["yes", "no"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setVote(value)}
          className="inline-flex h-8 cursor-pointer items-center rounded-md px-2.5 capitalize text-white/70 outline-none transition-colors duration-150 hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
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
      className="relative isolate overflow-clip bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16 lg:py-32"
    >
      {/* Late-afternoon light falling across the top-left corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-56 -z-10 h-[520px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.07),transparent)]"
      />

      <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-12">
            <h2
              id="faq-accordion-title"
              className="text-[clamp(2.6rem,5vw,4.25rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
            >
              <span className="block">The week-one</span>
              <span className="block">questions.</span>
            </h2>
            <p className="mt-6 max-w-[40ch] text-[17px] leading-[1.6] text-white/60">
              Brightline reads your inverter every ten seconds.{" "}
              <span className="text-white/50">Once new owners see the numbers move, these are what land in our inbox.</span>
            </p>

            <div className="mt-12 hidden max-w-sm border-t border-white/[0.08] pt-6 lg:block">
              <StillStuck />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="border-t border-white/[0.08]">
            {FAQS.map((item) => {
              const isOpen = open === item.id;
              return (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-white/[0.08] transition-[background-color] duration-300 data-[state=open]:bg-[radial-gradient(45%_90%_at_0%_45%,rgb(var(--neon)/0.06),transparent)]"
                >
                  <AccordionTrigger className="gap-6 py-6 text-left text-[18px] font-[480] leading-snug tracking-[-0.015em] sm:text-[20px]">
                    <span className={cn("transition-colors duration-200", isOpen ? "text-white" : "text-white/75")}>
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-7 text-[16px] leading-[1.6] text-white/60">
                    <p className="max-w-[56ch] text-pretty">{item.a}</p>
                    <Helpful />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <p className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/55">
            <span>Eight of the most asked, updated 2 Oct 2026.</span>
            <a
              href="#"
              className="group -my-2 inline-flex items-center gap-1.5 rounded-md py-2 text-sm text-white/75 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              All 140 help articles
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </p>

          <div className="mt-14 border-t border-white/[0.08] pt-6 lg:hidden">
            <StillStuck />
          </div>
        </div>
      </div>
    </section>
  );
}

function StillStuck() {
  return (
    <>
      <div className="flex items-center gap-4">
        <AvatarGroup size="md">
          {CREW.map((name, i) => (
            <Avatar key={name} alt={name} status={i === CREW.length - 1 ? "online" : undefined} />
          ))}
        </AvatarGroup>
        <p className="text-[13px] leading-snug text-white/55">
          Median reply <span className="tabular-nums text-white/90">9 min</span>
          <br />
          Mon–Sat, 07:00–19:00 CET
        </p>
      </div>
      <h3 className="mt-6 text-lg font-medium tracking-[-0.015em] text-white">Still stuck?</h3>
      <p className="mt-1.5 text-pretty text-[15px] leading-relaxed text-white/60">
        Our desk is three electricians and one very patient engineer. Send a photo of your inverter&apos;s label and
        we&apos;ll take it from there.
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
    </>
  );
}
