import * as React from "react";
import { cn } from "@/lib/utils";

/** The numbered mono label above every section title. */
export function Eyebrow({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
      <span className="text-[rgb(var(--neon))]">{String(index).padStart(2, "0")}</span>
      <span aria-hidden className="h-px w-6 bg-white/20" />
      {children}
    </p>
  );
}

/** The shared section opener: a numbered eyebrow, a tight headline and an optional note on the right. */
export function SectionHeading({
  index,
  eyebrow,
  id,
  title,
  note,
  className,
}: {
  index: number;
  eyebrow: string;
  id: string;
  title: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8", className)}>
      <div className="lg:col-span-7">
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <h2
          id={id}
          className="mt-5 text-balance text-[clamp(32px,4.6vw,56px)] font-medium leading-[1.02] tracking-[-0.04em] text-white"
        >
          {title}
        </h2>
      </div>
      {note && (
        <p className="max-w-md text-[15px] leading-relaxed text-white/60 lg:col-span-4 lg:col-start-9 lg:pb-1.5">{note}</p>
      )}
    </div>
  );
}
