"use client";

import { cn } from "@/lib/utils";

import { agenda, speakers, type Speaker } from "./data";
import { slotAt, useEvent, useNow } from "./event-state";

// Unlit glass at rest; the monogram strikes like a tube on hover, focus, or while that speaker is on stage.
const css = `
@keyframes nk-launch-ignite { 0% { opacity: 0.2; } 10% { opacity: 0.9; } 18% { opacity: 0.3; } 34% { opacity: 1; } 46% { opacity: 0.55; } 60%, 100% { opacity: 1; } }
.nk-launch-monogram { color: transparent; -webkit-text-stroke: 1.25px rgb(var(--neon) / 0.32); transition: color 200ms ease-out, text-shadow 200ms ease-out, -webkit-text-stroke-color 200ms ease-out; }
.group:hover .nk-launch-monogram, .group:focus-visible .nk-launch-monogram, .nk-launch-lit .nk-launch-monogram {
  color: color-mix(in srgb, rgb(var(--neon)) 30%, white);
  -webkit-text-stroke-color: rgb(var(--neon));
  text-shadow: 0 0 4px rgb(var(--neon) / 0.9), 0 0 16px rgb(var(--neon) / 0.6), 0 0 40px rgb(var(--neon) / 0.35);
  animation: nk-launch-ignite 420ms linear both;
}
@media (prefers-reduced-motion: reduce) { .group:hover .nk-launch-monogram, .group:focus-visible .nk-launch-monogram, .nk-launch-lit .nk-launch-monogram { animation: none; } }
`;

const initials = (name: string) =>
  name
    .split(" ")
    .filter((part) => part[0] === part[0].toUpperCase())
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function Billing({ speaker, lit }: { speaker: Speaker; lit: boolean }) {
  const slot = agenda.find((item) => item.speaker === speaker.id);

  return (
    <li className="border-b border-white/[0.07]">
      <a
        href={slot ? `#slot-${slot.id}` : "#agenda"}
        className={cn(
          "group grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-5 outline-none sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-6 sm:py-6 lg:grid-cols-[6rem_minmax(0,1fr)_minmax(0,19rem)] lg:gap-x-8",
          "rounded-[3px] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]",
          lit && "nk-launch-lit",
        )}
      >
        <span
          aria-hidden
          className="nk-launch-monogram row-span-2 text-[44px] leading-none tracking-[-0.02em] sm:text-[68px] lg:row-span-1 lg:text-[76px]"
          style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
        >
          {initials(speaker.name)}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3
              className={cn(
                "text-[clamp(1.6rem,4.4vw,3.4rem)] font-[620] leading-[1] tracking-[-0.035em] transition-colors duration-200 [font-stretch:112%]",
                lit ? "text-white" : "text-white/85 group-hover:text-white group-focus-visible:text-white",
              )}
            >
              {speaker.name}
            </h3>
            {lit && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium [color:color-mix(in_srgb,rgb(var(--neon))_45%,white)]">
                <span aria-hidden className="size-1.5 rounded-full bg-current shadow-[0_0_6px_rgb(var(--neon))]" />
                On stage now
              </span>
            )}
          </div>
          <span className="mt-1.5 block text-[14px] text-white/60 lg:hidden">
            {speaker.role}, {speaker.company} · {speaker.city}
          </span>
        </div>

        <span className="col-start-2 min-w-0 lg:col-start-3 lg:text-right">
          <span className="block text-pretty text-[15px] leading-snug text-white/85 transition-colors duration-200 group-hover:[color:color-mix(in_srgb,rgb(var(--neon))_35%,white)] sm:text-[17px]">
            {speaker.talk}
            {slot && <span className="text-white/50"> · {slot.kind === "workshop" ? "workshop, " : ""}{slot.start}</span>}
          </span>
          <span className="mt-1 hidden text-[14px] text-white/60 lg:block">
            {speaker.role}, {speaker.company} · {speaker.city}
          </span>
        </span>
      </a>
    </li>
  );
}

export function Speakers() {
  const { phase, ready } = useEvent();
  const now = useNow(30000);
  const onStage = ready && phase === "live" ? slotAt(now)?.speaker : undefined;
  const host = speakers.find((speaker) => speaker.role === "Host");
  const billed = speakers.filter((speaker) => speaker !== host);
  const hostSlot = host && agenda.find((slot) => slot.speaker === host.id);

  return (
    <section id="speakers" aria-labelledby="speakers-title" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:pb-32 lg:pt-36">
      <style>{css}</style>
      <div className="mx-auto max-w-[1176px]">
        <h2
          id="speakers-title"
          className="max-w-[18ch] text-balance text-[clamp(2.6rem,6vw,5rem)] font-[640] leading-[0.92] tracking-[-0.045em] text-white [font-stretch:112%]"
        >
          Seven people who care about the last two percent.
        </h2>
        <p className="mt-7 max-w-[52ch] text-pretty text-[17px] leading-[1.6] text-white/70 sm:ml-[7.5rem] lg:ml-[8rem]">
          No keynotes and no sponsors on stage. Each talk is 25 minutes about one thing they shipped, then five for
          questions, which come in on cards.
        </p>

        <ul className="mt-14 border-t border-white/[0.07] lg:mt-20">
          {billed.map((speaker) => (
            <Billing key={speaker.id} speaker={speaker} lit={speaker.id === onStage} />
          ))}
        </ul>

        {host && (
          <p className="mt-8 text-[15px] leading-relaxed text-white/60 sm:ml-[7.5rem] lg:ml-[8rem]">
            Hosted by{" "}
            <a
              href={hostSlot ? `#slot-${hostSlot.id}` : "#agenda"}
              className={cn(
                "rounded-[3px] text-white/90 underline decoration-white/25 underline-offset-4 outline-none transition-colors hover:decoration-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                host.id === onStage && "[color:color-mix(in_srgb,rgb(var(--neon))_45%,white)]",
              )}
            >
              {host.name}
            </a>
            , who opens at 19:15 with &ldquo;{host.talk}&rdquo; and chairs the panel at 23:00.
            {host.id === onStage && " He's on stage now."}
          </p>
        )}
      </div>
    </section>
  );
}
