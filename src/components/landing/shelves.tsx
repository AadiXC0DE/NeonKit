"use client";

import * as React from "react";
import Link from "next/link";
import { componentCategoryId } from "@/components/site/category-id";
import { LiveDemo } from "@/components/site/live-preview";
import { PreviewShot } from "@/components/site/preview-shot";
import { cn } from "@/lib/utils";
import { featured, shelfPicks, type Reel, type Shelf, type ShelfItem } from "./shelf-data";

const link =
  "font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]";

const frame =
  "relative overflow-hidden rounded-[12px] border border-white/[0.08] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-0.5 group-hover:border-[rgb(var(--neon-accent)/0.45)] group-hover:shadow-[0_0_0_1px_rgb(var(--neon-accent)/0.15),0_0_36px_-12px_rgb(var(--neon-accent)/0.45)] motion-reduce:group-hover:translate-y-0";

/** Everything in the kit, running: three featured, a shelf browser, then blocks and templates in frames. */
export function Shelves({
  total,
  shelves,
  lookup,
  reels,
  blockCount,
  templateCount,
}: {
  total: number;
  shelves: Shelf[];
  lookup: Record<string, ShelfItem>;
  reels: Reel[];
  blockCount: number;
  templateCount: number;
}) {
  const [open, setOpen] = React.useState(shelves[0]?.category ?? "");
  const hoverTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(hoverTimer.current), []);
  const shelf = shelves.find((s) => s.category === open) ?? shelves[0];
  const shown = (shelfPicks[shelf.category] ?? []).map((slug) => lookup[slug]).filter(Boolean).slice(0, 4);

  return (
    <section aria-labelledby="shelves-title" className="relative pb-32 pt-28 sm:pb-44 sm:pt-36">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="shelves-title" className="type-display text-balance text-[clamp(2.4rem,5vw,4.75rem)] text-fg lg:col-span-8">
            {total} components on {shelves.length} shelves.
          </h2>
          <p className="max-w-[30rem] text-[16.5px] leading-[1.6] text-muted lg:col-span-4 lg:self-end lg:justify-self-end">
            Everything here is running, not a picture of it. Open any one for its source, props and examples.
          </p>
        </div>

        {/* Featured: one big, two stacked to its height */}
        <div className="mt-14 grid gap-x-5 gap-y-8 sm:mt-20 lg:grid-cols-12">
          {featured.map((slug, i) => {
            const item = lookup[slug];
            if (!item) return null;
            const big = i === 0;
            return (
              <Link
                key={slug}
                href={`/components/${slug}`}
                className={cn(
                  "group flex flex-col rounded-[14px] outline-offset-4",
                  big ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5",
                )}
              >
                <div className={cn(frame, "rounded-[14px]", !big && "lg:min-h-0 lg:flex-1")}>
                  <LiveDemo slug={slug} className={big ? undefined : "lg:aspect-auto lg:h-full"} />
                </div>
                <span className="mt-3 flex items-baseline justify-between gap-4 px-0.5">
                  <span className="min-w-0 truncate">
                    <span className="text-[16px] font-medium text-fg">{item.name}</span>
                    <span className="ml-3 hidden text-[14px] text-muted sm:inline">{item.description.split(/[.:;]/)[0]}</span>
                  </span>
                  <span className="shrink-0 text-[14px] text-muted">{item.category}</span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* The shelf browser: names on the left, the open shelf running on the right */}
        <div className="mt-24 grid gap-8 sm:mt-32 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 lg:col-span-4 lg:pl-5">
            <p id="shelf-label" className="text-[15px] text-muted">
              Pick a shelf
            </p>
            <ul
              aria-labelledby="shelf-label"
              className="nk-strip -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
            >
              {shelves.map((s) => {
                const active = s.category === shelf.category;
                return (
                  <li key={s.category} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-controls="shelf-stage"
                      onClick={() => setOpen(s.category)}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== "mouse") return;
                        window.clearTimeout(hoverTimer.current);
                        hoverTimer.current = window.setTimeout(() => setOpen(s.category), 140);
                      }}
                      onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                      className={cn(
                        "relative flex cursor-pointer items-baseline gap-3 whitespace-nowrap rounded-full border px-4 py-2 text-left transition-colors duration-150",
                        "lg:w-full lg:rounded-md lg:border-0 lg:px-0 lg:py-2",
                        active ? "border-[rgb(var(--neon-accent)/0.55)] text-fg" : "border-line text-muted hover:text-fg",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -left-5 top-1/2 hidden h-5 w-[2px] -translate-y-1/2 rounded-full transition-opacity duration-150 lg:block",
                          active
                            ? "bg-[rgb(var(--neon-accent))] opacity-100 shadow-[0_0_2px_rgb(var(--neon-accent)),0_0_10px_rgb(var(--neon-accent)/0.7)]"
                            : "opacity-0",
                        )}
                      />
                      <span className="text-[15px] font-medium lg:text-[clamp(1.25rem,1.75vw,1.65rem)] lg:tracking-[-0.02em]">
                        {s.category}
                      </span>
                      <span className="tabular-nums text-[13px] text-muted lg:text-[14px]">{s.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div id="shelf-stage" className="min-w-0 lg:col-span-8">
            <ul aria-label={`${shelf.category}, ${shelf.count} components`} className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
              {shown.map((item) => (
                <li key={item.slug}>
                  <Link href={`/components/${item.slug}`} className="group block rounded-[12px] outline-offset-4">
                    <div className={frame}>
                      <LiveDemo slug={item.slug} />
                    </div>
                    <span className="mt-2.5 block truncate px-0.5 text-[14.5px] font-medium text-fg">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[15px] text-muted">
              {shelf.count > shown.length ? `${shelf.count - shown.length} more on this shelf. ` : ""}
              <Link href={`/components#${componentCategoryId(shelf.category)}`} className={link}>
                Open {shelf.category}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Blocks and templates */}
      <div className="mt-28 sm:mt-40">
        <div className="mx-auto mb-8 flex max-w-[88rem] flex-wrap items-end justify-between gap-x-8 gap-y-3 px-4 sm:px-6">
          <h3 className="max-w-[44rem] text-[clamp(1.35rem,2vw,1.75rem)] font-medium leading-[1.2] tracking-[-0.02em] text-fg">
            {blockCount} blocks and {templateCount} templates.{" "}
            <span className="text-muted">Whole sections and whole sites, built from the same parts.</span>
          </h3>
          <span className="flex gap-6 text-[15px]">
            <Link href="/blocks" className={link}>
              All blocks
            </Link>
            <Link href="/templates" className={link}>
              All templates
            </Link>
          </span>
        </div>
        <ul
          aria-label="Blocks and templates"
          className={cn(
            "nk-strip flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 sm:gap-5",
            "scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 2xl:scroll-px-[calc((100vw-88rem)/2+1.5rem)] 2xl:px-[calc((100vw-88rem)/2+1.5rem)]",
          )}
        >
          {reels.map((reel) => (
            <li key={reel.href} className="w-[82vw] max-w-[600px] shrink-0 snap-start">
              <Link href={reel.href} className="group block rounded-[12px] outline-offset-4">
                <div className={frame}>
                  <PreviewShot base={reel.shot} sizes="(min-width: 732px) 600px, 82vw" />
                </div>
                <span className="mt-3 flex items-baseline justify-between gap-3 px-0.5">
                  <span className="truncate text-[14.5px] font-medium text-fg">{reel.name}</span>
                  <span className="shrink-0 text-[13px] text-muted">{reel.meta}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
