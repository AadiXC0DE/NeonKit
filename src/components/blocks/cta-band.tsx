"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TubeDivider } from "@/components/ui/tube-divider";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const REQUESTS = [
  { method: "GET", path: "/v2/orders/8841", service: "orders", status: 200, ms: "3.1" },
  { method: "POST", path: "/v2/payments", service: "billing", status: 201, ms: "11.4" },
  { method: "GET", path: "/v2/users/me", service: "auth", status: 304, ms: "0.9" },
  { method: "GET", path: "/v2/search?q=lamp", service: "search", status: 429, ms: "0.4" },
  { method: "DELETE", path: "/v2/carts/77", service: "carts", status: 204, ms: "2.6" },
];

const TRUST = ["Free to 1M requests a month", "No card", "SOC 2 Type II", "p95 overhead 1.8 ms"];

function RequestTicker() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % REQUESTS.length), 2200);
    return () => window.clearInterval(id);
  }, []);

  const r = REQUESTS[index];
  const limited = r.status === 429;
  return (
    <p aria-hidden className="flex min-w-0 items-center gap-3 font-mono text-[11px] text-white/45">
      <span className="relative flex size-1.5 shrink-0">
        <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon)/0.6)] [animation-duration:2.2s] motion-reduce:hidden" />
        <span className="relative size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
      </span>
      <span key={index} className="nk-cta-band-tick flex min-w-0 items-center gap-2 whitespace-nowrap">
        <span className="shrink-0 text-white/70">{r.method}</span>
        <span className="truncate text-white/55">{r.path}</span>
        <span className="hidden text-white/25 sm:inline">→ {r.service}</span>
        <span className={cn("tabular-nums", limited ? "text-white/40 line-through" : "text-[rgb(var(--neon))]")}>
          {r.status}
        </span>
        <span className="tabular-nums text-white/30">{r.ms} ms</span>
      </span>
    </p>
  );
}

export default function CtaBand() {
  const ref = React.useRef<HTMLElement>(null);
  const [lit, setLit] = React.useState(false);
  const [flow, setFlow] = React.useState(false);

  // The tubes strike when the band scrolls into view.
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLit(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pulse = { onPointerEnter: () => setFlow(true), onPointerLeave: () => setFlow(false), onFocus: () => setFlow(true), onBlur: () => setFlow(false) };

  return (
    <section
      ref={ref}
      aria-labelledby="cta-band-title"
      // Change the color here; everything inside follows it.
      style={neonVars("blue")}
      className="relative isolate overflow-hidden bg-[#05060a] py-14 text-white/90 sm:py-20"
    >
      <style>{`
        @keyframes nk-cta-band-tick { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .nk-cta-band-tick { animation: nk-cta-band-tick 320ms cubic-bezier(0.23, 1, 0.32, 1) both; }
        @media (prefers-reduced-motion: reduce) { .nk-cta-band-tick { animation: none; } }
      `}</style>

      <TubeDivider on={lit} flow={flow} />

      <div className="relative px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        {/* Light from both tubes falling on the wall between them */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(var(--neon)/0.07),transparent_38%,transparent_66%,rgb(var(--neon)/0.05))] transition-opacity duration-700"
          style={{ opacity: lit ? 1 : 0 }}
        />

        <div className="mx-auto max-w-[1180px]">
          <RequestTicker />
          <h2
            id="cta-band-title"
            className="mt-7 max-w-[20ch] text-balance text-[clamp(2.5rem,6.4vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white"
          >
            First request routed in under ten minutes.
          </h2>

          <div className="mt-10 grid gap-10 border-t border-white/[0.07] pt-8 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-20">
            <p className="max-w-[52ch] text-pretty text-base leading-relaxed text-white/55 sm:text-[17px]">
              Overpass sits in front of your services and handles keys, rate limits and retries from one YAML file.
              Point a DNS record at it and you&apos;re live.
            </p>

            <div className="flex flex-col gap-5 lg:items-end">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild variant="solid" size="lg" {...pulse}>
                  <a href="#">
                    Start free <ArrowRight />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <a href="#">Book a 20-minute call</a>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-white/40 lg:justify-end">
                {TRUST.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="size-1 rounded-full bg-[rgb(var(--neon)/0.45)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <TubeDivider on={lit} flow={flow} />
    </section>
  );
}
