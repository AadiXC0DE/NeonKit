"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { contactEmail } from "./config";
import { comparison, plans, type Billing } from "./data";
import { Eyebrow, focusRing } from "./primitives";

const FEATURED = plans.findIndex((p) => p.featured);

// Backticks in a tip mark a command.
function Tip({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="font-mono text-[12px] text-white">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Value({ value, featured }: { value: boolean | string; featured: boolean }) {
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
        <span aria-hidden className="mx-auto block h-px w-3 bg-white/25" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className={cn("font-mono text-[13px]", featured ? "text-white" : "text-white/75")}>{value}</span>;
}

export function Compare({ billing }: { billing: Billing }) {
  return (
    <section
      id="compare"
      aria-labelledby="compare-title"
      className="relative isolate scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-[1120px]">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Every line</Eyebrow>
            <h2
              id="compare-title"
              className="mt-4 text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
            >
              Compare before you commit.
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-white/60 lg:col-span-4 lg:col-start-9 lg:pb-1.5">
            Same scheduler, same rollback, on every plan. What changes is how much you can tune it and who signs off.
            Hover or focus a feature for what it actually means.
          </p>
        </header>

        <p className="mt-12 font-mono text-[11px] text-white/60 md:hidden">Scroll sideways to see every plan →</p>
        <Table
          stickyHeader
          aria-label="Plan comparison"
          className="min-w-[680px] table-fixed"
          // Scrolls sideways inside its own frame on small screens; on desktop the header sticks to the page.
          containerClassName="mt-3 md:mt-12 bg-[#07080c] lg:overflow-visible"
        >
          <colgroup>
            <col className="w-48 lg:w-[34%]" />
            <col />
            <col />
            <col />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="left-0 z-20 whitespace-normal rounded-tl-xl align-bottom shadow-[1px_0_0_rgb(255_255_255/0.06)] lg:top-16 lg:shadow-none">
                <span className="font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-white/60">
                  {billing === "yearly" ? "Billed yearly" : "Billed monthly"} · USD
                </span>
              </TableHead>
              {plans.map((plan, i) => {
                const featured = i === FEATURED;
                const price = plan[billing];
                return (
                  <TableHead
                    key={plan.name}
                    align="center"
                    className={cn(
                      "h-auto py-5 align-top lg:top-16",
                      i === plans.length - 1 && "rounded-tr-xl",
                      featured && "bg-[#120f1a]",
                    )}
                  >
                    {featured && (
                      <span
                        aria-hidden
                        className="absolute inset-x-8 top-0 h-[2px] rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_45%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.6)]"
                      />
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={cn("text-sm font-medium", featured ? "text-[rgb(var(--neon))]" : "text-white/85")}
                      >
                        {plan.name}
                      </span>
                      <span className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">
                        ${price}
                      </span>
                      <span className="text-[11px] font-normal text-white/60">
                        {price ? "per seat / month" : "free for good"}
                      </span>
                      <Button
                        asChild
                        size="sm"
                        variant={featured ? "solid" : "ghost"}
                        className={cn("mt-2.5", !featured && "border border-white/10")}
                      >
                        <Link href={plan.name === "Fleet" ? `mailto:${contactEmail}` : "#"}>{plan.cta}</Link>
                      </Button>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparison.map((group) => (
              <React.Fragment key={group.name}>
                <tr>
                  <th
                    colSpan={4}
                    scope="colgroup"
                    className="border-b border-white/[0.06] bg-white/[0.015] px-4 pb-2 pt-6 text-left font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-white/60"
                  >
                    <span className="sticky left-4">{group.name}</span>
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableHead className="sticky left-0 z-10 whitespace-normal bg-[#07080c] font-normal text-white/80 shadow-[1px_0_0_rgb(255_255_255/0.06)] lg:static lg:shadow-none">
                      <Tooltip
                        content={
                          <span className="block w-60 whitespace-normal text-left leading-snug">
                            <Tip text={row.tip} />
                          </span>
                        }
                        side="top"
                        align="start"
                      >
                        <button
                          type="button"
                          className={cn(
                            "cursor-help rounded-md text-left underline decoration-white/25 decoration-dashed underline-offset-[5px] transition-colors hover:text-white hover:decoration-[rgb(var(--neon)/0.7)]",
                            focusRing,
                          )}
                        >
                          {row.feature}
                        </button>
                      </Tooltip>
                    </TableHead>
                    {row.values.map((value, i) => (
                      <TableCell
                        key={plans[i].name}
                        align="center"
                        className={cn(i === FEATURED && "bg-[rgb(var(--neon)/0.04)]")}
                      >
                        <Value value={value} featured={i === FEATURED} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        <p className="mt-6 text-sm text-white/60">
          Prices in USD, before tax. Public open-source projects get Crew free;{" "}
          <a
            href={`mailto:${contactEmail}`}
            className={cn(
              "rounded-md text-white/85 underline decoration-white/25 underline-offset-4 transition-colors hover:text-[rgb(var(--neon))]",
              focusRing,
            )}
          >
            write from the project&apos;s domain
          </a>
          .
        </p>
      </div>
    </section>
  );
}
