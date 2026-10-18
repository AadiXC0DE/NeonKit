"use client";

import * as React from "react";
import { ArrowUp } from "@/components/ui/icons";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const sections = [
  {
    heading: "Where we are",
    body: "Relay delivers webhooks at most once. When a receiver times out after we've written the request, we mark the event failed and move on. Last quarter that lost 0.04% of events, about 1.9 million, and every one of them became a support ticket that started with “we never got it”.",
  },
  {
    heading: "Proposal",
    body: "Move to at-least-once delivery. Each event keeps a delivery id that survives retries, and receivers deduplicate on it. We retry on any non-2xx or timeout with jittered exponential backoff: 10 s, 40 s, 2.5 min, 10 min, then hourly for 24 hours.",
  },
  {
    heading: "What receivers have to do",
    body: "Store the Relay-Delivery-Id header for 72 hours and drop repeats. The SDKs for Node, Go and Python do this with a one-line Redis or Postgres adapter. Receivers that already key on our event id need no change, which by our logs is 71% of traffic.",
  },
  {
    heading: "Cost",
    body: "Retries add an estimated 3.8% to outbound volume at today's failure rate. Queue storage grows by 14 GB per region for the 24-hour window. Both fit inside current capacity; no new hardware.",
  },
  {
    heading: "Rollout",
    body: "Opt-in per endpoint from 4 November, default for new endpoints from 2 December, and default for everyone on 13 January after a month of dashboards showing duplicate rates per receiver.",
  },
];

export default function ScrollProgressDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [percent, setPercent] = React.useState(0);

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b11]">
      <div className="border-b border-white/[0.06] px-5 pb-3 pt-4">
        <p className="text-[15px] font-medium text-white/90">RFC 0042: At-least-once webhooks</p>
        <p className="mt-0.5 text-[13px] text-white/50">Mira Okafor · 6 min read</p>
      </div>
      <ScrollProgress target={scrollRef} onProgressChange={setPercent} aria-label="RFC reading progress" />
      <div ref={scrollRef} tabIndex={0} aria-label="RFC 0042" className="h-80 overflow-y-auto px-5 py-5 outline-none [mask-image:linear-gradient(to_bottom,transparent,#000_20px)] [scrollbar-width:none]">
        {sections.map((section) => (
          <section key={section.heading} className="mb-6 last:mb-2">
            <h4 className="text-sm font-medium text-white/90">{section.heading}</h4>
            <p className="mt-1.5 text-[14px] leading-relaxed text-white/60">{section.body}</p>
          </section>
        ))}
      </div>
      <button
        type="button"
        aria-label="Back to top"
        tabIndex={percent > 12 ? 0 : -1}
        onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
        className={`absolute bottom-4 right-4 grid cursor-pointer place-items-center rounded-full bg-[#0a0b11]/90 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] ${
          percent > 12 ? "opacity-100" : "pointer-events-none translate-y-1 scale-[0.96] opacity-0"
        }`}
      >
        <ScrollProgress variant="ring" target={scrollRef} size={40}>
          <ArrowUp className="size-4" />
        </ScrollProgress>
      </button>
    </div>
  );
}
