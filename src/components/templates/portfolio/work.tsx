"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { HologramCard } from "@/components/ui/hologram-card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CaseStudy } from "./case-study";
import { Cover } from "./covers";
import { projects, type Project } from "./data";
import { useLights } from "./lights";
import { SectionHeading } from "./section-heading";

// Alternating wide and narrow cards, so the grid reads as a layout, not a list.
const spans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const { on } = useLights();
  return (
    <HologramCard
      foil="lines"
      maxTilt={4}
      intensity={0.55}
      className="group/card flex w-full flex-col overflow-hidden rounded-[20px]"
    >
      <Cover art={project.cover} lit={on} className="h-[220px] border-b border-white/[0.06] sm:h-[280px]" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
          <span>
            {project.client} · {project.year}
          </span>
          <span>{String(index + 1).padStart(2, "0")}</span>
        </p>
        <h3 className="mt-4 text-[22px] font-medium leading-tight tracking-[-0.025em] text-white">
          <button
            type="button"
            onClick={onOpen}
            aria-haspopup="dialog"
            className="text-left outline-none after:absolute after:inset-0 after:rounded-[20px] after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[rgb(var(--neon)/0.7)]"
          >
            {project.title}
          </button>
        </h3>
        <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-white/60">{project.outcome}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6 text-sm">
          <span className="text-white/60">{project.role}</span>
          <span
            aria-hidden
            className="flex shrink-0 items-center gap-1 whitespace-nowrap text-white/70 transition-colors duration-200 group-hover/card:text-[rgb(var(--neon))]"
          >
            Case study
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
          </span>
        </div>
      </div>
    </HologramCard>
  );
}

export function Work() {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

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
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-10 sm:py-32">
        <SectionHeading
          index={1}
          eyebrow="Selected work"
          id="work-title"
          title="Four projects, from first sketch to shipped."
          note="Each one designed and built by me, usually alongside a small team. Open a card for the long version."
        />

        <ul className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {projects.map((project, i) => (
            <li key={project.slug} className={cn("flex", spans[i % spans.length])}>
              <ProjectCard project={project} index={i} onOpen={() => openProject(i)} />
            </li>
          ))}
        </ul>
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
