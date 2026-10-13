"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Cover } from "./covers";
import type { Project } from "./data";
import { useLights } from "./lights";

export function CaseStudy({
  project,
  index,
  total,
  onStep,
  onContact,
}: {
  project: Project;
  index: number;
  total: number;
  onStep: (direction: 1 | -1) => void;
  onContact: () => void;
}) {
  const { on } = useLights();
  const topRef = React.useRef<HTMLDivElement>(null);

  // Stepping to another project starts it from the top of the sheet.
  React.useEffect(() => {
    topRef.current?.parentElement?.scrollTo({ top: 0 });
  }, [project.slug]);

  const meta = [
    ["Client", project.client],
    ["Year", String(project.year)],
    ["Role", project.role],
    ["Team", project.team],
    ["Duration", project.duration],
    ["Stack", project.stack.join(", ")],
  ];

  return (
    <div ref={topRef} className="flex flex-1 flex-col">
      <SheetHeader>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[rgb(var(--neon))]">
          Case study {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <SheetTitle className="mt-3 text-[clamp(26px,4vw,34px)] font-medium leading-[1.08] tracking-[-0.03em] text-white">
          {project.title}
        </SheetTitle>
        <SheetDescription className="mt-1 text-[15px] leading-relaxed text-white/60">{project.outcome}</SheetDescription>
      </SheetHeader>

      <Cover art={project.cover} lit={on} className="mt-7 aspect-[16/10] shrink-0 rounded-xl border border-white/[0.08]" />

      <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-b border-white/[0.07] pb-7 sm:grid-cols-3">
        {meta.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">{label}</dt>
            <dd className="mt-1 text-sm leading-snug text-white/85">{value}</dd>
          </div>
        ))}
      </dl>

      <dl className="grid grid-cols-3 gap-4 border-b border-white/[0.07] py-7">
        {project.stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-col-reverse justify-end">
            <dt className="mt-1 text-[13px] leading-snug text-white/60">{stat.label}</dt>
            <dd
              className={cn(
                "text-[clamp(22px,4vw,30px)] font-medium tabular-nums tracking-[-0.03em] transition-[color,text-shadow] duration-500",
                on
                  ? "text-[color-mix(in_srgb,rgb(var(--neon))_70%,white)] [text-shadow:0_0_18px_rgb(var(--neon)/0.45)]"
                  : "text-white/90",
              )}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-7 py-7 text-[15px] leading-relaxed text-white/75">
        <section aria-labelledby={`${project.slug}-problem`}>
          <h3 id={`${project.slug}-problem`} className="mb-2 text-sm font-medium text-white">
            The problem
          </h3>
          <p>{project.problem}</p>
        </section>
        <section aria-labelledby={`${project.slug}-work`}>
          <h3 id={`${project.slug}-work`} className="mb-3 text-sm font-medium text-white">
            What I did
          </h3>
          <ol className="space-y-3">
            {project.work.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="mt-[3px] font-mono text-[11px] text-white/55">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby={`${project.slug}-result`}>
          <h3 id={`${project.slug}-result`} className="mb-2 text-sm font-medium text-white">
            What happened
          </h3>
          <p>{project.result}</p>
        </section>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onStep(-1)}>
            <ArrowLeft aria-hidden /> Previous<span className="sr-only"> project</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onStep(1)}>
            Next<span className="sr-only"> project</span> <ArrowRight aria-hidden />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onContact}>
          Start a project like this
        </Button>
      </div>
    </div>
  );
}
