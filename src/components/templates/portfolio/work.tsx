"use client";

import * as React from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CaseStudy } from "./case-study";
import { Cover } from "./covers";
import { projects, type Project } from "./data";
import { useLights } from "./lights";
import { SectionHeading, display } from "./section-heading";

/** The cover of whichever project you're pointing at, on a lit table that follows you down the list. */
function LightTable({ active }: { active: number }) {
  const { on } = useLights();
  const project = projects[active];
  return (
    <figure className="sticky top-24">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#07080d]">
        {projects.map((item, i) => (
          <Cover
            key={item.slug}
            art={item.cover}
            lit={on && i === active}
            className={cn(
              "absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      <figcaption aria-live="polite" className="mt-4 flex items-baseline justify-between gap-4 text-[14px]">
        <span className="text-white/85">
          {project.client}, {project.year}
        </span>
        <span className="text-right text-white/55">
          {project.team}. {project.duration}.
        </span>
      </figcaption>
    </figure>
  );
}

function ProjectRow({
  project,
  active,
  onActivate,
  onOpen,
}: {
  project: Project;
  active: boolean;
  onActivate: () => void;
  onOpen: () => void;
}) {
  const { on } = useLights();
  const [stat] = project.stats;
  const lit = active && on;

  return (
    <li
      onPointerEnter={onActivate}
      onFocus={onActivate}
      className="group/row relative border-t border-white/[0.08] py-9 last:border-b sm:py-11"
    >
      {/* The cover sits in the row on small screens; on wide ones it lives on the light table. */}
      <Cover
        art={project.cover}
        lit={on}
        className="mb-7 aspect-[16/10] rounded-xl border border-white/[0.08] lg:hidden"
      />
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-10">
        <div className="min-w-0">
          <p className="text-[14px] text-white/55">
            <span className="text-white/80">{project.client}</span>, {project.year}
            <span className="text-white/30"> / </span>
            {project.role}
          </p>
          <h3 className={cn(display, "mt-3 max-w-[16ch] text-[clamp(28px,3.3vw,44px)] leading-[1.02]")}>
            <button
              type="button"
              onClick={onOpen}
              aria-haspopup="dialog"
              className={cn(
                "text-left outline-none transition-colors duration-200 after:absolute after:inset-0 after:content-['']",
                "focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-[rgb(var(--neon)/0.6)]",
                active ? "text-white" : "text-white/80",
              )}
            >
              {project.title}
            </button>
          </h3>
          <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-white/60">{project.outcome}</p>
        </div>

        <p className="flex items-baseline gap-3 sm:block sm:pt-6 sm:text-right">
          <span
            className={cn(
              display,
              "block text-[clamp(44px,5vw,72px)] leading-none transition-[color,text-shadow] duration-300",
              lit
                ? "text-[color-mix(in_srgb,rgb(var(--neon))_55%,white)] [text-shadow:0_0_2px_rgb(var(--neon)/0.8),0_0_24px_rgb(var(--neon)/0.45)]"
                : "text-white/85",
            )}
          >
            {stat.value}
          </span>
          <span className="mt-2 block max-w-[18ch] text-balance text-[14px] leading-snug text-white/55 sm:ml-auto">
            {stat.label.toLowerCase()}
          </span>
        </p>
      </div>
      <span
        aria-hidden
        className={cn(
          "mt-6 inline-flex items-center gap-1 text-[14px] transition-colors duration-200",
          active ? "text-[rgb(var(--neon))]" : "text-white/55",
        )}
      >
        Read the case study
        <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5" />
      </span>
    </li>
  );
}

export function Work() {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [active, setActive] = React.useState(0);

  const openProject = (next: number) => {
    setIndex(next);
    setOpen(true);
  };

  const goToContact = () => {
    setOpen(false);
    // After the sheet has slid away and handed focus back.
    window.setTimeout(() => {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("contact")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }, 280);
  };

  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-16">
      <div className="mx-auto max-w-[1200px] px-5 pb-28 pt-8 sm:px-10 sm:pb-40">
        <SectionHeading
          id="work-title"
          title="Four things I drew, then shipped."
          lede="Each one designed and built by me, usually alongside a small team. Open one for the long version: the problem, what I did, and what the numbers did after."
        />

        <div className="mt-16 grid gap-10 sm:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="hidden lg:col-span-5 lg:block">
            <LightTable active={active} />
          </div>
          <ol className="lg:col-span-7" aria-label="Selected work">
            {projects.map((project, i) => (
              <ProjectRow
                key={project.slug}
                project={project}
                active={active === i}
                onActivate={() => setActive(i)}
                onOpen={() => openProject(i)}
              />
            ))}
          </ol>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" size="lg" className="bg-[#07080d]">
          <CaseStudy
            project={projects[index]}
            index={index}
            total={projects.length}
            onStep={(direction) => setIndex((current) => (current + direction + projects.length) % projects.length)}
            onContact={goToContact}
          />
        </SheetContent>
      </Sheet>
    </section>
  );
}
