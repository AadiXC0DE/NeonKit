"use client";

import * as React from "react";
import { Check } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const PLANS = [
  { name: "Sandbox", price: "$0", note: "For prototypes", cta: "Get a key" },
  { name: "Growth", price: "$49", note: "per month, then usage", cta: "Start building", featured: true },
  { name: "Scale", price: "$399", note: "per month, then usage", cta: "Talk to sales" },
] as const;

// true = included, false = not included, string = the limit.
type Value = boolean | string;
const GROUPS: { name: string; rows: { feature: string; tip: string; values: [Value, Value, Value] }[] }[] = [
  {
    name: "Maps",
    rows: [
      { feature: "Map loads", tip: "One load is one map initialised in a browser or app, however long it stays open.", values: ["25k / mo", "250k / mo", "2M / mo"] },
      { feature: "Custom styles", tip: "Styles made in Cartograph Studio. Any style works on any number of maps.", values: ["1", "20", "Unlimited"] },
      { feature: "3D terrain and buildings", tip: "Elevation and extruded buildings, rendered on the GPU.", values: [true, true, true] },
      { feature: "Offline tile packs", tip: "Download regions for apps that work without signal, up to 6,000 km² per pack.", values: [false, true, true] },
    ],
  },
  {
    name: "Search and geocoding",
    rows: [
      { feature: "Geocoding requests", tip: "Address to coordinates, or back again. Batch requests count once per address.", values: ["10k / mo", "100k / mo", "1M / mo"] },
      { feature: "Autocomplete sessions", tip: "First keystroke to a picked result counts as one session, however many keys.", values: ["1k / mo", "25k / mo", "250k / mo"] },
      { feature: "Permanent result storage", tip: "Keep geocoded results in your own database forever. Short-term caching is fine on every plan.", values: [false, false, true] },
    ],
  },
  {
    name: "Routing",
    rows: [
      { feature: "Directions requests", tip: "Turn-by-turn routes for driving, cycling and walking.", values: ["5k / mo", "50k / mo", "500k / mo"] },
      { feature: "Matrix size", tip: "Travel times between many origins and destinations in a single call.", values: [false, "25 × 25", "100 × 100"] },
      { feature: "Live traffic", tip: "Speeds from road sensors and probe data, refreshed every 2 minutes.", values: [false, true, true] },
    ],
  },
  {
    name: "Limits and support",
    rows: [
      { feature: "Rate limit", tip: "Requests per minute across all endpoints, per project.", values: ["300 / min", "3,000 / min", "30,000 / min"] },
      { feature: "Uptime SLA", tip: "Monthly, with service credits if we miss it.", values: [false, "99.9%", "99.99%"] },
      { feature: "Support", tip: "Who answers and how fast, on business days.", values: ["Forum", "Email, 1 day", "Slack, 2 hours"] },
      { feature: "SSO and audit log", tip: "SAML single sign-on and an exportable log of every key and member change.", values: [false, false, true] },
    ],
  },
];

const FEATURED = PLANS.findIndex((p) => "featured" in p && p.featured);

function Cell({ value, featured }: { value: Value; featured: boolean }) {
  if (value === true)
    return (
      <>
        <Check
          aria-hidden
          strokeWidth={2.25}
          className={cn(
            "mx-auto size-4",
            featured ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.7))]" : "text-white/70",
          )}
        />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden className="mx-auto block h-px w-3 bg-white/20" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className={cn("text-[14px]", featured ? "text-white" : "text-white/70")}>{value}</span>;
}

export default function PricingTable() {
  return (
    <section
      aria-labelledby="pricing-table-title"
      // Change the color here; everything inside follows it.
      style={neonVars("blue")}
      className="relative isolate bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header>
          <h2
            id="pricing-table-title"
            className="max-w-[15ch] text-[clamp(2.4rem,5.6vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
          >
            Compare every line before you commit.
          </h2>
          <div className="mt-10 flex flex-col gap-6 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
              <span className="text-[clamp(2.75rem,5vw,3.75rem)] font-[620] leading-[0.85] tracking-[-0.045em] text-[rgb(var(--neon))] [font-stretch:112%] [text-shadow:0_0_24px_rgb(var(--neon)/0.45)]">
                $0.50
              </span>
              <span className="max-w-[30ch] pb-0.5 text-[15px] leading-snug text-white/60">
                <span className="text-white/90">per 1,000 map loads past your plan,</span> the same rate on every tier.
              </span>
            </p>
            <p className="text-[14px] text-white/55 sm:max-w-[26ch] sm:text-right">
              Point at a feature to see exactly what it counts.
            </p>
          </div>
        </header>

        <p className="mt-12 text-[13px] text-white/55 md:hidden">Scroll sideways to see every plan.</p>
        <Table
          stickyHeader
          aria-label="Plan comparison"
          className="min-w-[640px] table-fixed proportional-nums"
          // Scrolls sideways inside its own frame on small screens; on desktop the header sticks to the page.
          containerClassName="mt-3 overscroll-x-contain rounded-none border-0 bg-transparent md:mt-14 lg:overflow-visible"
        >
          <colgroup>
            <col className="w-36 sm:w-44 lg:w-[34%]" />
            <col />
            <col />
            <col />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="left-0 z-20 whitespace-normal bg-[#05060a] align-bottom shadow-[1px_0_0_rgb(255_255_255/0.06)] lg:shadow-none">
                <span className="text-[13px] font-normal text-white/55">Monthly, in USD</span>
              </TableHead>
              {PLANS.map((plan, i) => (
                <TableHead
                  key={plan.name}
                  align="center"
                  className={cn("h-auto bg-[#05060a] py-6 align-top", i === FEATURED && "rounded-t-xl bg-[#0c0f1b]")}
                >
                  {i === FEATURED && (
                    <span
                      aria-hidden
                      className="absolute inset-x-8 top-0 h-[2px] rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_45%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.6)]"
                    />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn("text-[15px] font-medium", i === FEATURED ? "text-[rgb(var(--neon))]" : "text-white/85")}>
                      {plan.name}
                    </span>
                    <span className="mt-1 text-[40px] font-[620] leading-none tracking-[-0.045em] text-white [font-stretch:112%]">
                      {plan.price}
                    </span>
                    <span className="mt-1 text-[13px] font-normal text-white/55">{plan.note}</span>
                    <Button size="sm" variant={i === FEATURED ? "solid" : "ghost"} className={cn("mt-4", i !== FEATURED && "border border-white/10")}>
                      {plan.cta}
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {GROUPS.map((group) => (
              <React.Fragment key={group.name}>
                <tr>
                  <th
                    colSpan={4}
                    scope="colgroup"
                    className="border-b border-white/[0.1] px-4 pb-3 pt-10 text-left text-[15px] font-medium tracking-[-0.01em] text-white/90"
                  >
                    <span className="sticky left-4">{group.name}</span>
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableHead className="sticky left-0 z-10 whitespace-normal bg-[#05060a] font-normal text-white/80 shadow-[1px_0_0_rgb(255_255_255/0.06)] lg:static lg:shadow-none">
                      <Tooltip
                        content={<span className="block w-60 whitespace-normal text-left leading-snug">{row.tip}</span>}
                        side="top"
                        align="start"
                      >
                        <button
                          type="button"
                          className="-my-2 cursor-help rounded-md py-2 text-left underline decoration-white/20 decoration-dashed underline-offset-[5px] outline-none transition-colors hover:text-white hover:decoration-[rgb(var(--neon)/0.7)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                        >
                          {row.feature}
                        </button>
                      </Tooltip>
                    </TableHead>
                    {row.values.map((value, i) => (
                      <TableCell key={PLANS[i].name} align="center" className={cn(i === FEATURED && "bg-[rgb(var(--neon)/0.04)]")}>
                        <Cell value={value} featured={i === FEATURED} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        <p className="mt-6 text-sm text-white/60">
          Prices in USD, before tax. Nonprofits and classrooms get Growth free;{" "}
          <a
            href="#education"
            className="rounded-md text-white/75 underline decoration-white/25 underline-offset-4 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            apply here
          </a>
          .
        </p>
      </div>
    </section>
  );
}
