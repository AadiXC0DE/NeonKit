"use client";

import * as React from "react";
import { Check, X } from "@/components/ui/icons";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const ROWS = [
  { topic: "Shipping", before: "Merge freeze every Thursday", after: "Merge any time. Releasing is a toggle." },
  { topic: "Rollout", before: "Everyone at once, fingers crossed", after: "1% → 10% → 50% → 100%, halts on error rate" },
  { topic: "Testing", before: "A staging env that drifts from prod", after: "Target your own team in prod first" },
  { topic: "Config", before: "Env vars and a redeploy", after: "Remote config, typed and versioned" },
  { topic: "Audit", before: "“Who changed this?” in #eng", after: "Every flip logged with who, when and why" },
  { topic: "Cleanup", before: "Dead flags, forever", after: "A stale-flag report every Monday" },
];

const css = `
@keyframes nk-features-comparison-ignite {
  0% { opacity: 0.15; } 10% { opacity: 1; } 18% { opacity: 0.3; } 30% { opacity: 1; } 38% { opacity: 0.6; } 100% { opacity: 1; }
}
.nk-features-comparison-ignite { animation: nk-features-comparison-ignite 520ms linear both; }
@media (prefers-reduced-motion: reduce) { .nk-features-comparison-ignite { animation: none; } }
`;

// A check drawn like a bent tube: white-hot core, colored halo. Unlit, it's dark glass.
function TubeCheck({ lit, delay }: { lit: boolean; delay: number }) {
  return (
    <span
      aria-hidden
      className={cn("mt-[3px] flex size-4 shrink-0 items-center justify-center", lit && "nk-features-comparison-ignite")}
      style={lit ? { animationDelay: `${delay}ms` } : undefined}
    >
      <Check
        strokeWidth={2.5}
        className={cn(
          "size-4 transition-[color,filter] duration-200",
          lit
            ? "[color:color-mix(in_srgb,rgb(var(--neon))_35%,white)] [filter:drop-shadow(0_0_3px_rgb(var(--neon)))_drop-shadow(0_0_8px_rgb(var(--neon)/0.7))]"
            : "text-[rgb(var(--neon)/0.16)]",
        )}
      />
    </span>
  );
}

export default function FeaturesComparison() {
  const [on, setOn] = React.useState(true);
  const [seen, setSeen] = React.useState(false);
  const [run, setRun] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const lit = on && seen;

  // The checks power on once, in sequence, the first time the comparison scrolls into view.
  React.useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.2 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [seen]);

  function flip(next: boolean) {
    setOn(next);
    if (next) setRun((r) => r + 1);
  }

  return (
    <section
      aria-labelledby="features-comparison-title"
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16"
    >
      <style>{css}</style>
      <div className="mx-auto max-w-[1200px]">
        <header className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-9">
            <h2
              id="features-comparison-title"
              className="max-w-[17ch] text-[clamp(2.4rem,5.6vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
            >
              Deploying and releasing are two different buttons.
            </h2>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.6] text-white/90">
              Switchyard puts every release behind a flag.{" "}
              <span className="text-white/50">Ship the code on Monday, turn it on for customers when you mean it.</span>
            </p>
          </div>
          {/* The one control on the page. It drives the lit column below. */}
          <div className="flex items-center gap-5 md:col-span-3 md:flex-col md:items-end md:gap-4 md:pb-2">
            <HardwareSwitch size="lg" checked={on} onCheckedChange={flip} aria-label="Switchyard" />
            <p aria-live="polite" className="text-[14px] text-white/60 md:text-right">
              Switchyard is <span className="text-white/90">{on ? "on" : "off"}</span>
            </p>
          </div>
        </header>

        <div ref={ref} className="relative mt-16 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-x-4 md:gap-y-0 lg:grid-cols-[11rem_1fr_1fr]">
          {/* Only the lit column gets a surface: it's the state the switch is showing. */}
          <div
            aria-hidden
            className={cn(
              "hidden rounded-[14px] border transition-[border-color,background-color,box-shadow] duration-500 md:block md:[grid-column:2] lg:[grid-column:3]",
              lit
                ? "border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--neon)/0.04)] shadow-[0_0_0_1px_rgb(var(--neon)/0.08),0_0_60px_-20px_rgb(var(--neon)/0.5),inset_0_0_40px_-20px_rgb(var(--neon)/0.25)]"
                : "border-white/[0.08] bg-white/[0.015]",
            )}
            style={{ gridRow: `1 / span ${ROWS.length + 2}` }}
          />
          {/* Light the lit column throws on the floor */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -bottom-24 right-0 hidden h-48 w-[42%] rounded-[50%] bg-[rgb(var(--neon)/0.14)] blur-[60px] transition-opacity duration-700 md:block",
              lit ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Topic labels, desktop only */}
          <div className="hidden lg:contents">
            <span className="lg:[grid-column:1] lg:[grid-row:1]" />
            {ROWS.map((row, i) => (
              <span
                key={row.topic}
                className="border-t border-white/[0.07] py-5 text-[14px] leading-snug text-white/55 lg:[grid-column:1]"
                style={{ gridRow: i + 2 }}
              >
                {row.topic}
              </span>
            ))}
            <span className="border-t border-white/[0.07] py-8 text-[14px] text-white/55 lg:[grid-column:1]" style={{ gridRow: ROWS.length + 2 }}>
              Median rollback
            </span>
          </div>

          <div className="border-t border-white/[0.07] md:contents md:border-t-0">
            <h3 className="py-5 text-[15px] font-medium text-white/60 md:pr-6 md:[grid-column:1] lg:[grid-column:2] md:[grid-row:1]">Before</h3>
            <ul className="md:contents">
              {ROWS.map((row, i) => (
                <li
                  key={row.topic}
                  className="flex gap-3 border-t border-white/[0.07] py-4 md:mr-6 md:py-5 md:[grid-column:1] lg:[grid-column:2]"
                  style={{ gridRow: i + 2 }}
                >
                  <X aria-hidden strokeWidth={2} className="mt-[3px] size-4 shrink-0 text-white/25" />
                  <div>
                    <span className="mb-1 block text-[13px] text-white/50 lg:hidden">{row.topic}</span>
                    <span
                      className={cn(
                        "text-[15px] leading-snug transition-colors duration-300",
                        on ? "text-white/50 line-through decoration-white/30" : "text-white/80",
                      )}
                    >
                      {row.before}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-white/[0.07] py-8 md:mr-6 md:[grid-column:1] lg:[grid-column:2]" style={{ gridRow: ROWS.length + 2 }}>
              <span className={cn("whitespace-nowrap text-[clamp(2.75rem,5vw,4rem)] font-[620] leading-none tracking-[-0.04em] [font-stretch:112%] transition-colors", on ? "text-white/40 line-through decoration-white/20 decoration-2" : "text-white/85")}>
                38 min
              </span>
              <span className="text-[14px] text-white/50 lg:hidden">median rollback</span>
              <span className="hidden text-[14px] text-white/50 lg:inline">revert, rebuild, redeploy</span>
            </p>
          </div>

          <div
            className={cn(
              "rounded-[14px] border px-5 transition-[border-color,background-color] duration-500 md:contents",
              lit ? "border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--neon)/0.04)]" : "border-white/[0.08] bg-white/[0.015]",
            )}
          >
            <h3
              className={cn(
                "py-5 text-[15px] font-medium transition-colors md:px-6 md:[grid-column:2] lg:[grid-column:3] md:[grid-row:1]",
                lit ? "text-[rgb(var(--neon))] [text-shadow:0_0_12px_rgb(var(--neon)/0.6)]" : "text-white/55",
              )}
            >
              With Switchyard
            </h3>
            <ul key={`list-${run}`} className="md:contents">
              {ROWS.map((row, i) => (
                <li
                  key={row.topic}
                  className={cn(
                    "flex gap-3 border-t py-4 transition-colors md:mx-6 md:py-5 md:[grid-column:2] lg:[grid-column:3]",
                    lit ? "border-[rgb(var(--neon)/0.12)]" : "border-white/[0.06]",
                  )}
                  style={{ gridRow: i + 2 }}
                >
                  <TubeCheck lit={lit} delay={180 + i * 140} />
                  <div>
                    <span className="mb-1 block text-[13px] text-white/50 lg:hidden">{row.topic}</span>
                    <span className={cn("text-[15px] leading-snug transition-colors duration-300", lit ? "text-white/90" : "text-white/50")}>
                      {row.after}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p
              key={`total-${run}`}
              className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t py-8 md:mx-6 md:[grid-column:2] lg:[grid-column:3]", lit ? "border-[rgb(var(--neon)/0.12)]" : "border-white/[0.06]")}
              style={{ gridRow: ROWS.length + 2 }}
            >
              <span
                className={cn(
                  "whitespace-nowrap text-[clamp(2.75rem,5vw,4rem)] font-[620] leading-none tracking-[-0.04em] [font-stretch:112%] transition-[color,text-shadow] duration-300",
                  lit
                    ? "nk-features-comparison-ignite [color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_2px_rgb(255_255_255/0.5),0_0_14px_rgb(var(--neon)/0.9),0_0_40px_rgb(var(--neon)/0.5)]"
                    : "text-white/50",
                )}
                style={lit ? { animationDelay: `${180 + ROWS.length * 140}ms` } : undefined}
              >
                4 s
              </span>
              <span className="text-[14px] text-white/60 lg:hidden">median rollback</span>
              <span className="hidden text-[14px] text-white/60 lg:inline">flip it off, from anywhere</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
