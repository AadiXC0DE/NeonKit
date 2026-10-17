"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { NeonSign } from "@/components/ui/neon-sign";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

// Each quote is [before, the line that matters, after].
const stories = [
  {
    name: "Marguerite Osei",
    role: "Operations director",
    company: "Cobble & Vine",
    detail: "14 restaurants, Manchester and Leeds",
    quote: [
      "Sunday nights used to be four hours of spreadsheets and group texts. ",
      "Now the rota is done before the last table pays,",
      " and nobody asks who’s closing.",
    ],
    stats: [
      { value: "4 h → 25 min", label: "Building the weekly rota" },
      { value: "−31%", label: "Overtime hours, first quarter" },
      { value: "14", label: "Sites on one shared rota" },
    ],
  },
  {
    name: "Dev Malhotra",
    role: "General manager",
    company: "The Copper Still",
    detail: "Cocktail bar, 38 staff",
    quote: [
      "",
      "Staff swap shifts with each other in the app, and I approve with one tap.",
      " I haven’t refereed a shift trade over text since February.",
    ],
    stats: [
      { value: "312", label: "Shift swaps a month" },
      { value: "9 s", label: "Median time to approve one" },
      { value: "0", label: "Uncovered shifts since February" },
    ],
  },
  {
    name: "Ellie Hargreaves",
    role: "Head chef and co-owner",
    company: "Saltbox Kitchen",
    detail: "52 covers, open six days",
    quote: [
      "Labour cost sits next to covers on the same screen. ",
      "We cut a ten-hour Tuesday shift we’d been running for three years,",
      " and the only person who noticed was our accountant.",
    ],
    stats: [
      { value: "24.8%", label: "Labour cost, down from 29.1%" },
      { value: "£1,940", label: "Saved a month on Tuesdays alone" },
      { value: "11", label: "Staff, all on the app in a week" },
    ],
  },
];

const css = `
@keyframes nk-testimonial-hero-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.nk-testimonial-hero-in { animation: nk-testimonial-hero-in 420ms cubic-bezier(0.23, 1, 0.32, 1) both; }
@media (prefers-reduced-motion: reduce) { .nk-testimonial-hero-in { animation: none; } }
`;

function PagerButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 outline-none transition-[color,border-color,transform] duration-150 hover:border-white/20 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] active:scale-[0.97] [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

export default function TestimonialHero() {
  const titleId = React.useId();
  const ref = React.useRef<HTMLElement>(null);
  const [index, setIndex] = React.useState(0);
  const [shown, setShown] = React.useState(0);
  const [inView, setInView] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const story = stories[shown];

  // The name sign strikes when the section first scrolls into view.
  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  // Cut the power, swap the story while the tubes are dark, then strike again.
  const go = (step: number) => {
    const next = (index + step + stories.length) % stories.length;
    setIndex(next);
    clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(next);
      return;
    }
    setSwitching(true);
    timer.current = setTimeout(() => {
      setShown(next);
      setSwitching(false);
    }, 280);
  };

  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      className="relative overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <style>{css}</style>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-6 border-b border-white/[0.07] pb-5">
          <h2 id={titleId} className="text-[15px] font-medium tracking-[-0.01em] text-white/85">
            Three kitchens on Backline<span className="hidden text-white/50 sm:inline">, in their own words</span>
          </h2>
          <div className="flex items-center gap-3">
            <p className="whitespace-nowrap text-[13px] tabular-nums text-white/55">
              <span className="text-white/90">{index + 1}</span> of {stories.length}
            </p>
            {/* The figure remounts on every switch, so announce from a region that stays put. */}
            <p aria-live="polite" className="sr-only">
              Story {index + 1} of {stories.length}: {stories[index].name}, {stories[index].company}
            </p>
            <PagerButton label="Previous story" onClick={() => go(-1)}>
              <ArrowLeft />
            </PagerButton>
            <PagerButton label="Next story" onClick={() => go(1)}>
              <ArrowRight />
            </PagerButton>
          </div>
        </div>

        <div className="mt-20 grid gap-14 sm:mt-24 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
          <figure
            key={shown}
            className={cn(
              "nk-testimonial-hero-in relative transition-opacity duration-200 motion-reduce:transition-none",
              switching && "opacity-0",
            )}
          >
            {/* An unlit glass quote mark, hung above the text */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-1 -top-[72px] select-none font-serif text-[150px] leading-none text-[rgb(var(--neon)/0.16)] [text-shadow:0_-1px_0_rgb(255_255_255/0.06)] sm:-left-3 sm:-top-[88px] sm:text-[190px]"
            >
              &ldquo;
            </span>
            <blockquote className="relative text-pretty sm:min-h-[4.48em] lg:min-h-[5.6em] text-[clamp(1.65rem,4.6vw,3.25rem)] font-[540] leading-[1.1] tracking-[-0.032em] text-white/40 [font-stretch:104%]">
              <p>
                {story.quote[0]}
                <span className="text-white/95">{story.quote[1]}</span>
                {story.quote[2]}
              </p>
            </blockquote>
            <figcaption className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <span className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.14)] blur-[50px] transition-opacity duration-500",
                    inView && !switching ? "opacity-100" : "opacity-0",
                  )}
                />
                <NeonSign
                  on={inView && !switching}
                  size="sm"
                  cable="right"
                  lines={[story.name]}
                  style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
                  className="sm:mb-0"
                />
              </span>
              <span className="grid gap-1">
                <span className="text-sm font-medium text-white/85">
                  {story.role}, {story.company}
                </span>
                <span className="text-[13px] text-white/55">{story.detail}</span>
              </span>
            </figcaption>
          </figure>

          <div
            key={`stats-${shown}`}
            className={cn(
              "nk-testimonial-hero-in transition-opacity duration-200 motion-reduce:transition-none lg:border-l lg:border-white/[0.07] lg:pl-10",
              switching && "opacity-0",
            )}
          >
            <dl className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0">
              {story.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col-reverse gap-2 border-t border-white/[0.07] pt-4 lg:border-b lg:border-t-0 lg:py-6 lg:first:pt-0"
                >
                  <dt className="text-sm text-white/60">{stat.label}</dt>
                  <dd className="whitespace-nowrap text-[clamp(1.85rem,3vw,2.3rem)] font-[620] leading-none tracking-[-0.04em] text-white/95 [font-stretch:112%]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href="#"
              className="group mt-6 inline-flex items-center gap-1.5 rounded-md py-2 text-sm font-medium text-white/75 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              Read the case study
              <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
