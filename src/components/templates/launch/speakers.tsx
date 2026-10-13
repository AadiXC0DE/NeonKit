"use client";

import { cn } from "@/lib/utils";

import { agenda, speakers, type Speaker } from "./data";
import { slotAt, useEvent, useNow } from "./event-state";

// Unlit glass at rest; the monogram strikes like a tube on hover or focus.
const css = `
@keyframes nk-launch-ignite { 0% { opacity: 0.2; } 10% { opacity: 0.9; } 18% { opacity: 0.3; } 34% { opacity: 1; } 46% { opacity: 0.55; } 60%, 100% { opacity: 1; } }
.nk-launch-monogram { color: transparent; -webkit-text-stroke: 1.5px rgb(var(--neon) / 0.28); transition: color 200ms ease-out, text-shadow 200ms ease-out, -webkit-text-stroke-color 200ms ease-out; }
.group:hover .nk-launch-monogram, .group:focus-visible .nk-launch-monogram, .nk-launch-lit .nk-launch-monogram {
  color: color-mix(in srgb, rgb(var(--neon)) 30%, white);
  -webkit-text-stroke-color: rgb(var(--neon));
  text-shadow: 0 0 6px rgb(var(--neon) / 0.9), 0 0 22px rgb(var(--neon) / 0.6), 0 0 60px rgb(var(--neon) / 0.35);
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

function SpeakerCard({ speaker, index, lit }: { speaker: Speaker; index: number; lit: boolean }) {
  const slot = agenda.find((item) => item.speaker === speaker.id);

  return (
    <li>
      <a
        href={slot ? `#slot-${slot.id}` : "#agenda"}
        className={cn(
          "group block rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]",
          lit && "nk-launch-lit",
        )}
      >
        <div
          className={cn(
            "relative isolate aspect-[6/7] overflow-hidden sm:aspect-[4/3] lg:aspect-[6/7] rounded-[18px] border bg-[#0a0a10] transition-[border-color,box-shadow] duration-300",
            "group-hover:border-[rgb(var(--neon)/0.35)] group-hover:shadow-[0_30px_60px_-30px_rgb(var(--neon)/0.45)] group-focus-visible:border-[rgb(var(--neon)/0.35)]",
            lit ? "border-[rgb(var(--neon)/0.35)] shadow-[0_30px_60px_-30px_rgb(var(--neon)/0.45)]" : "border-white/[0.08]",
          )}
        >
          {/* A painted brick wall, and the light the sign throws on it once lit. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.025)_0_1px,transparent_1px_22px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          />
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_48%,rgb(var(--neon)/0.22),transparent)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
              lit ? "opacity-100" : "opacity-0",
            )}
          />
          <div aria-hidden className="flex items-start justify-between p-3.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/60 sm:p-4">
            <span>No. {String(index + 1).padStart(2, "0")}</span>
            {lit ? (
              <span className="flex items-center gap-1.5 [color:color-mix(in_srgb,rgb(var(--neon))_45%,white)]">
                <span aria-hidden className="size-1.5 rounded-full bg-current shadow-[0_0_6px_rgb(var(--neon))]" />
                On stage
              </span>
            ) : (
              slot && <span className="tabular-nums">{slot.start}</span>
            )}
          </div>
          <span
            aria-hidden
            className="nk-launch-monogram absolute inset-0 grid place-items-center pt-4 text-[clamp(64px,22vw,150px)] leading-none tracking-[-0.02em] lg:text-[clamp(84px,8.4vw,128px)]"
            style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
          >
            {initials(speaker.name)}
          </span>
          <p className="absolute inset-x-0 bottom-0 p-3.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/60 sm:p-4">
            {speaker.city}
          </p>
        </div>

        <div className="px-1 pt-4">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-white sm:text-base">{speaker.name}</h3>
          <p className="mt-0.5 text-[13px] text-white/60">
            {speaker.role}, {speaker.company}
          </p>
          <p className="mt-3 text-pretty text-[14px] leading-snug text-white/85 transition-colors group-hover:text-[color:color-mix(in_srgb,rgb(var(--neon))_35%,white)]">
            {speaker.talk}
          </p>
        </div>
      </a>
    </li>
  );
}

export function Speakers() {
  const { phase, ready } = useEvent();
  const now = useNow(30000);
  const onStage = ready && phase === "live" ? slotAt(now)?.speaker : undefined;

  return (
    <section id="speakers" aria-labelledby="speakers-title" className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32">
      <style>{css}</style>
      <div className="mx-auto max-w-[1176px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end lg:gap-20">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">Speakers · {String(speakers.length).padStart(2, "0")}</p>
            <h2
              id="speakers-title"
              className="mt-6 max-w-[16ch] text-[clamp(2.5rem,5.6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white"
            >
              Eight people who care about the last two percent.
            </h2>
          </div>
          <p className="max-w-[44ch] text-pretty text-[15px] leading-relaxed text-white/65 lg:pb-2">
            No keynotes and no sponsors on stage. Each talk is 25 minutes about one thing they shipped, then five for
            questions, which come in on cards.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:mt-16 lg:grid-cols-4 lg:gap-y-12">
          {speakers.map((speaker, index) => (
            <SpeakerCard key={speaker.id} speaker={speaker} index={index} lit={speaker.id === onStage} />
          ))}
        </ul>
      </div>
    </section>
  );
}
