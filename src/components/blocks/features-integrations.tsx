"use client";

import * as React from "react";
import {
  Archive,
  ArrowRight,
  CreditCard,
  Database,
  GitPullRequest,
  LifeBuoy,
  MessageSquare,
  MousePointer2,
  ShoppingBag,
  Smartphone,
  Snowflake,
  Waves,
  Webhook,
} from "@/components/ui/icons";
import { SignalBeam } from "@/components/ui/signal-beam";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// Events per second from each source. They add up to the hub's reading.
const SOURCES: { name: string; detail: string; icon: Icon; rate: number }[] = [
  { name: "Postgres", detail: "orders, CDC", icon: Database, rate: 9120 },
  { name: "Stripe", detail: "charge.succeeded", icon: CreditCard, rate: 2340 },
  { name: "Shopify", detail: "orders/create", icon: ShoppingBag, rate: 1880 },
  { name: "Web SDK", detail: "page, track", icon: MousePointer2, rate: 21400 },
  { name: "iOS and Android", detail: "screen, track", icon: Smartphone, rate: 11260 },
  { name: "Zendesk", detail: "ticket.created", icon: LifeBuoy, rate: 310 },
  { name: "GitHub", detail: "deployment_status", icon: GitPullRequest, rate: 40 },
  { name: "Webhooks", detail: "any POST", icon: Webhook, rate: 1860 },
];

const DESTINATIONS: { name: string; detail: [string, string]; icon: Icon }[] = [
  { name: "Snowflake", detail: ["RAW.EVENTS", "p99 380 ms"], icon: Snowflake },
  { name: "S3", detail: ["Parquet, hourly", "30 days"], icon: Archive },
  { name: "Slack", detail: ["#growth", "4 alerts today"], icon: MessageSquare },
];

const format = (n: number) => n.toLocaleString("en-US");

/** True from the given width up. False on the server and the first client render, so both agree. */
function useMinWidth(px: number) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia(`(min-width: ${px}px)`);
    const sync = () => setMatches(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [px]);
  return matches;
}

const tile =
  "relative z-10 grid shrink-0 place-items-center rounded-[10px] border bg-[#0b0d14] transition-[color,border-color,opacity] duration-200 [&_svg]:size-[18px]";

export default function FeaturesIntegrations() {
  const wide = useMinWidth(768);
  const [on, setOn] = React.useState(() => SOURCES.map(() => true));
  const [last, setLast] = React.useState<number | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const hubRef = React.useRef<HTMLSpanElement>(null);
  // Fixed-length lists, so a ref per node is created once and never changes order.
  const [sourceRefs] = React.useState(() => SOURCES.map(() => React.createRef<HTMLButtonElement>()));
  const [destRefs] = React.useState(() => DESTINATIONS.map(() => React.createRef<HTMLSpanElement>()));

  const rate = SOURCES.reduce((sum, source, i) => sum + (on[i] ? source.rate : 0), 0);
  const flowing = on.filter(Boolean).length;
  const live = flowing > 0;

  function toggle(i: number) {
    setOn((prev) => prev.map((value, j) => (j === i ? !value : value)));
    setLast(i);
  }

  const status =
    last === null
      ? `All ${SOURCES.length} sources flowing.`
      : `${SOURCES[last].name} ${on[last] ? "back on" : "cut off"}. ${flowing} of ${SOURCES.length} flowing.`;

  return (
    <section
      aria-labelledby="tideline-sources-title"
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-24 text-white sm:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1160px]">
        <div className="max-w-[640px]">
          <h2
            id="tideline-sources-title"
            className="text-[clamp(2.5rem,5.6vw,4.25rem)] font-[620] leading-[0.98] tracking-[-0.042em] text-white [font-stretch:112%]"
          >
            140 sources.
            <br />
            One table.
          </h2>
          <p className="mt-6 max-w-[52ch] text-pretty text-[17px] leading-[1.6] text-white/60">
            Tideline pulls events from your database, payments, shop and apps, checks each one against your schema and
            lands it in the warehouse in under 400 ms. Switch a source off and watch the count drop.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative mt-16 flex flex-col items-center gap-28 md:mt-20 md:flex-row md:items-center md:justify-between md:gap-10"
        >
          {/* Sources: a row of tiles on phones, a labelled column from tablets up. */}
          <ul aria-label="Sources" className="grid w-full max-w-[400px] grid-cols-8 gap-1.5 md:flex md:w-auto md:max-w-none md:flex-col md:gap-3.5">
            {SOURCES.map((source, i) => {
              const Icon = source.icon;
              return (
                <li key={source.name} className="flex justify-center md:items-center md:justify-end md:gap-4">
                  <span className="hidden min-w-0 text-right md:block">
                    <span className={cn("block text-[14px] transition-colors", on[i] ? "text-white/85" : "text-white/40")}>
                      {source.name}
                    </span>
                    <span className="block font-mono text-[11.5px] text-white/45">{source.detail}</span>
                  </span>
                  <button
                    ref={sourceRefs[i]}
                    type="button"
                    aria-pressed={on[i]}
                    aria-label={`${source.name}, ${format(source.rate)} events per second`}
                    onClick={() => toggle(i)}
                    className={cn(
                      tile,
                      "aspect-square w-full max-w-11 cursor-pointer outline-none hover:border-white/25 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] md:size-11",
                      on[i] ? "border-white/[0.12] text-white/85" : "border-dashed border-white/[0.12] text-white/30",
                    )}
                  >
                    <Icon aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* The hub. Lit while anything flows into it. */}
          <div className="relative flex flex-col items-center">
            <span
              ref={hubRef}
              className={cn(
                "relative z-10 grid size-[76px] place-items-center rounded-full border bg-[#0b0d14] transition-[color,border-color,box-shadow] duration-500 md:size-24 [&_svg]:size-8 md:[&_svg]:size-9",
                live
                  ? "border-[rgb(var(--neon)/0.6)] text-[rgb(var(--neon))] shadow-[0_0_0_5px_rgb(var(--neon)/0.06),0_0_36px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]"
                  : "border-white/10 text-white/30",
              )}
            >
              <Waves aria-hidden />
            </span>
            <span className="absolute left-full top-1/2 ml-4 w-max -translate-y-1/2 md:left-1/2 md:top-full md:ml-0 md:mt-5 md:-translate-x-1/2 md:translate-y-0 md:text-center">
              <span className="block text-[14px] text-white/85">Tideline</span>
              <span className="block font-mono text-[13px] tabular-nums text-white/65">{format(rate)} events/s</span>
            </span>
          </div>

          <ul aria-label="Destinations" className="grid w-full max-w-[400px] grid-cols-3 gap-3 md:flex md:w-[240px] md:flex-col md:gap-12 lg:w-[270px]">
            {DESTINATIONS.map((dest, i) => {
              const Icon = dest.icon;
              return (
                <li key={dest.name} className="flex flex-col items-center gap-2.5 text-center md:flex-row md:gap-4 md:text-left">
                  <span
                    ref={destRefs[i]}
                    className={cn(tile, "size-11", live ? "border-white/[0.12] text-white/85" : "border-white/[0.08] text-white/30")}
                  >
                    <Icon aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] text-white/85">{dest.name}</span>
                    <span className="block text-[12.5px] leading-snug text-white/50 md:font-mono md:text-[11.5px]">
                      <span className="block md:inline">{dest.detail[0]}</span>
                      <span className="hidden md:inline"> · </span>
                      <span className="block md:inline">{dest.detail[1]}</span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {SOURCES.map((source, i) => (
            <SignalBeam
              key={source.name}
              containerRef={containerRef}
              fromRef={sourceRefs[i]}
              toRef={hubRef}
              active={on[i]}
              curvature={wide ? (i - 3.5) * -11 : 0}
              duration={wide ? 1.7 : 1.3}
              // Busier sources fire more often.
              repeatDelay={Math.max(0.3, 3.2 - Math.log10(source.rate) * 0.7)}
              delay={(i * 0.37) % 1.6}
              width={wide ? 2 : 1.5}
            />
          ))}
          {DESTINATIONS.map((dest, i) => (
            <SignalBeam
              key={dest.name}
              containerRef={containerRef}
              fromRef={hubRef}
              toRef={destRefs[i]}
              active={live}
              curvature={wide ? (i - 1) * 18 : 0}
              duration={1.1}
              repeatDelay={0.5 + i * 0.4}
              delay={0.6 + i * 0.3}
              pulseLength={0.4}
              width={wide ? 2 : 1.5}
            />
          ))}
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-white/[0.07] pt-6 text-[14px] sm:flex-row sm:items-baseline sm:justify-between md:mt-20">
          <p aria-live="polite" className="text-white/60">
            {status}
          </p>
          <a href="#" className="group inline-flex items-center gap-1.5 text-white/85 transition-colors hover:text-[rgb(var(--neon))]">
            All 140 connectors
            <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
