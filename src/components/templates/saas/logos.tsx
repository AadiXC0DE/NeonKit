import * as React from "react";
import { Marquee } from "@/components/ui/marquee";
import { stats } from "./data";

// Fictional customers, drawn with type and a few SVG primitives in currentColor.
const logos: { name: string; mark: React.ReactNode }[] = [
  {
    name: "Okapi Freight",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
          <path d="M2 18V8l8-6 8 6v10h-5v-6H7v6Z" />
        </svg>
        <span className="text-[22px] font-bold tracking-[-0.04em]">okapi</span>
        <span className="text-[11px] font-medium tracking-[0.3em]">FREIGHT</span>
      </span>
    ),
  },
  {
    name: "Saltmarsh",
    mark: <span className="font-serif text-[27px] italic tracking-[-0.02em]">Saltmarsh</span>,
  },
  {
    name: "Verso Rail",
    mark: (
      <span className="flex items-center gap-2.5">
        <svg viewBox="0 0 24 14" className="h-3.5 w-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 3h22M1 11h22M5 1v12M12 1v12M19 1v12" />
        </svg>
        <span className="text-[19px] font-black uppercase tracking-[0.08em]">Verso Rail</span>
      </span>
    ),
  },
  {
    name: "pellucid",
    mark: <span className="font-mono text-[22px] font-medium tracking-[-0.04em]">pellucid_</span>,
  },
  {
    name: "Brickyard",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 18 14" className="h-3.5 w-[18px]" aria-hidden fill="currentColor">
          <rect x="0" y="0" width="8" height="6" />
          <rect x="10" y="0" width="8" height="6" />
          <rect x="5" y="8" width="8" height="6" />
        </svg>
        <span className="text-[24px] font-semibold tracking-[-0.035em]">Brickyard</span>
      </span>
    ),
  },
  {
    name: "Coldharbour",
    mark: <span className="font-serif text-[17px] uppercase tracking-[0.3em]">Coldharbour</span>,
  },
  {
    name: "Arkline",
    mark: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 22 12" className="h-3 w-[22px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 11a10 10 0 0 1 20 0" />
        </svg>
        <span className="text-[25px] font-light tracking-[-0.03em]">arkline</span>
      </span>
    ),
  },
  {
    name: "tessel",
    mark: (
      <span className="flex items-center gap-2 text-[24px] font-bold tracking-[-0.05em]">
        <span className="grid grid-cols-2 gap-[2px]" aria-hidden>
          <span className="size-[7px] bg-current" />
          <span className="size-[7px] rounded-full bg-current" />
          <span className="size-[7px] rounded-full bg-current" />
          <span className="size-[7px] bg-current" />
        </span>
        tessel
      </span>
    ),
  },
  {
    name: "Halvard & Co.",
    mark: (
      <span className="flex items-baseline gap-1.5">
        <span className="font-serif text-[26px] tracking-[-0.02em]">Halvard</span>
        <span className="font-serif text-[18px] italic">&amp; Co.</span>
      </span>
    ),
  },
  {
    name: "Plinth",
    mark: (
      <span className="flex items-center gap-2">
        <span aria-hidden className="h-6 w-[3px] bg-current" />
        <span className="text-[22px] font-black uppercase tracking-[-0.02em]">Plinth</span>
      </span>
    ),
  },
];

const edge = "min(140px, 14%)";
const outer = "min(330px, 40%)";
const inner = "min(170px, 22%)";
// Edges fade out, the run sits at a third, and the middle is full strength: each logo lights as it passes the lamp.
const lamp = `linear-gradient(90deg, transparent, rgb(0 0 0 / 0.32) ${edge}, rgb(0 0 0 / 0.32) calc(50% - ${outer}), rgb(0 0 0 / 0.6) calc(50% - ${inner}), #000 50%, rgb(0 0 0 / 0.6) calc(50% + ${inner}), rgb(0 0 0 / 0.32) calc(50% + ${outer}), rgb(0 0 0 / 0.32) calc(100% - ${edge}), transparent)`;

export function Logos() {
  return (
    <section aria-labelledby="logos-title" className="relative overflow-hidden pb-24 pt-8 sm:pb-32">
      <div className="px-5 sm:px-8">
        <h2
          id="logos-title"
          className="mx-auto max-w-[60ch] text-balance text-center text-[15px] leading-relaxed text-white/60 sm:text-[17px]"
        >
          <span className="font-medium text-white">
            <span className="tabular-nums">{stats.teams}</span> teams ship while they sleep.
          </span>{" "}
          Freight, rail, payments and shops whose busiest hour is nobody&apos;s 2am, passing under the lamp.
        </h2>
      </div>

      <div className="relative isolate mt-10 sm:mt-12">
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]" />
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-px w-[min(720px,100%)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.6),transparent)]"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-[-1px] h-[3px] w-[min(200px,40%)] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.8),0_0_40px_6px_rgb(var(--neon)/0.3)]"
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_420px_150px_at_50%_0%,rgb(var(--neon)/0.12),transparent)]"
        />

        <Marquee
          aria-label="Teams using Nightshift"
          speed={32}
          gap={72}
          fade={false}
          style={{ maskImage: lamp, WebkitMaskImage: lamp }}
          className="py-11 sm:py-14"
        >
          {logos.map((logo) => (
            <span
              key={logo.name}
              role="img"
              aria-label={logo.name}
              className="flex shrink-0 items-center whitespace-nowrap leading-none [color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [filter:drop-shadow(0_0_1px_rgb(var(--neon)))_drop-shadow(0_0_6px_rgb(var(--neon)/0.6))_drop-shadow(0_0_16px_rgb(var(--neon)/0.28))]"
            >
              <span aria-hidden className="contents">
                {logo.mark}
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
