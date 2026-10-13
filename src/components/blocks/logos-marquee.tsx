import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { neonVars } from "@/lib/neon";

// Fictional customers, drawn with type and a few SVG primitives in currentColor.
const logos: { name: string; mark: React.ReactNode }[] = [
  { name: "Juniper Row", mark: <span className="font-serif text-[27px] tracking-[-0.02em]">Juniper Row</span> },
  {
    name: "Parallel Goods",
    mark: (
      <span className="flex items-center gap-2.5">
        <span className="h-7 w-[3px] bg-current" />
        <span className="font-mono text-[11px] font-semibold uppercase leading-[1.25] tracking-[0.3em]">
          Parallel
          <br />
          Goods
        </span>
      </span>
    ),
  },
  {
    name: "ninebark",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden fill="currentColor">
          <path d="M2 16C2 7 7 2 16 2 16 11 11 16 2 16Z" />
        </svg>
        <span className="text-[25px] font-bold tracking-[-0.05em]">ninebark</span>
      </span>
    ),
  },
  {
    name: "Tollgate",
    mark: (
      <span className="flex items-center gap-2.5">
        <svg viewBox="0 0 20 18" className="h-[18px] w-5" aria-hidden fill="currentColor">
          <rect x="0" y="0" width="3" height="18" />
          <rect x="17" y="0" width="3" height="18" />
          <rect x="3" y="5" width="14" height="2.5" />
        </svg>
        <span className="text-[19px] font-black uppercase tracking-[0.06em]">Tollgate</span>
      </span>
    ),
  },
  {
    name: "Sundial",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 22 12" className="h-3 w-[22px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 11a8 8 0 0 1 16 0M11 1v3M3.5 3.5l2 2M18.5 3.5l-2 2M1 11h20" />
        </svg>
        <span className="text-[25px] font-light italic tracking-[-0.03em]">Sundial</span>
      </span>
    ),
  },
  { name: "pewter", mark: <span className="font-mono text-[22px] font-medium tracking-[-0.04em]">pewter/</span> },
  {
    name: "Wexford Labs",
    mark: (
      <span className="flex items-baseline gap-2">
        <span className="font-serif text-[26px] italic tracking-[-0.02em]">Wexford</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Labs</span>
      </span>
    ),
  },
  {
    name: "Cinder",
    mark: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 16 14" className="h-3.5 w-4" aria-hidden fill="currentColor">
          <path d="M8 0 16 14H0Z" />
        </svg>
        <span className="text-[26px] font-black tracking-[-0.06em]">Cinder</span>
      </span>
    ),
  },
  {
    name: "Odd Lot",
    mark: (
      <span className="flex items-center gap-1 text-[24px] font-semibold tracking-[-0.03em]">
        <span className="size-[17px] rounded-full border-[3px] border-current" />
        dd lot
      </span>
    ),
  },
  { name: "Ashgrove", mark: <span className="font-serif text-[17px] uppercase tracking-[0.28em]">Ashgrove</span> },
];

const edge = "min(140px, 14%)";
const outer = "min(330px, 40%)";
const inner = "min(170px, 22%)";
const lamp = `linear-gradient(90deg, transparent, rgb(0 0 0 / 0.3) ${edge}, rgb(0 0 0 / 0.3) calc(50% - ${outer}), rgb(0 0 0 / 0.6) calc(50% - ${inner}), #000 50%, rgb(0 0 0 / 0.6) calc(50% + ${inner}), rgb(0 0 0 / 0.3) calc(50% + ${outer}), rgb(0 0 0 / 0.3) calc(100% - ${edge}), transparent)`;

export default function LogosMarquee() {
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="relative overflow-hidden bg-[#05060a] py-20 text-white/90 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">In production</p>
          <h2
            id={titleId}
            className="mt-4 text-balance text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1] tracking-[-0.04em]"
          >
            Shipped inside <span className="tabular-nums">3,912</span> teams.
          </h2>
        </div>
        <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-white/55">
          Our SDK runs in apps that 41 million people open every month. These are some of the teams who put it there.
        </p>
      </div>

      <div className="relative isolate mt-12 sm:mt-16">
        {/* Hairlines above and below, and the strip lamp the logos pass under */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]" />
        <span aria-hidden className="absolute bottom-0 left-1/2 h-px w-[min(640px,90%)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.35),transparent)]" />
        <span aria-hidden className="absolute left-1/2 top-0 h-px w-[min(720px,100%)] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.6),transparent)]" />
        <span
          aria-hidden
          className="absolute left-1/2 top-[-1px] h-[3px] w-[min(200px,40%)] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.8),0_0_40px_6px_rgb(var(--neon)/0.35)]"
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_420px_150px_at_50%_0%,rgb(var(--neon)/0.13),transparent)]"
        />

        {/* Every logo is drawn lit. The mask fades the edges out and holds the
            rest at a third, so each one lights up as it passes under the lamp. */}
        <Marquee
          aria-label="Customer logos"
          speed={34}
          gap={72}
          style={{ maskImage: lamp, WebkitMaskImage: lamp }}
          className="py-11 sm:py-14"
        >
          {logos.map((logo) => (
            <span
              key={logo.name}
              role="img"
              aria-label={logo.name}
              className="flex shrink-0 items-center whitespace-nowrap leading-none [color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [filter:drop-shadow(0_0_1px_rgb(var(--neon)))_drop-shadow(0_0_6px_rgb(var(--neon)/0.65))_drop-shadow(0_0_16px_rgb(var(--neon)/0.3))]"
            >
              <span aria-hidden className="contents">
                {logo.mark}
              </span>
            </span>
          ))}
        </Marquee>

      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
          <span className="text-white/60">+41</span> since Monday · list updated weekly
        </p>
        <a
          href="#"
          className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-white/75 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
        >
          Customer stories
          <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
