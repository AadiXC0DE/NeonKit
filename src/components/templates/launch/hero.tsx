"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Cityscape } from "@/components/ui/cityscape";

import { event } from "./config";
import { replay, speakers } from "./data";
import { DepartureBoard } from "./departure-board";
import { useEvent, type Phase } from "./event-state";

const LEDE: Record<Phase, string> = {
  before:
    "Seven talks and a workshop on the details nobody asks for: shadows, small type, the 100 ms after a tap. 340 seats in an old filament factory on the Maas, and a free stream for everyone else.",
  live: "We're on air from the Wolfraamhal. Seven talks and a workshop on the details nobody asks for, streamed free with live captions until 23:45.",
  after: `Seven talks, a workshop and a panel on the details nobody asks for. Thanks to the 340 of you in the room and the ${replay.watched} on the stream. The replay is up.`,
};

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2);

const FACTS = [`${speakers.length} speakers`, `${event.seats} seats`, "Captioned stream", "Bar till 01:00"];

const secondary =
  "group inline-flex h-12 items-center gap-2 rounded-lg px-1 text-[15px] font-medium text-white/75 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5";

function Actions({ phase }: { phase: Phase }) {
  if (phase === "live") {
    return (
      <>
        <Button asChild variant="solid" size="lg">
          <a href={event.streamUrl} target="_blank" rel="noreferrer">
            Watch the stream <ArrowUpRight aria-hidden />
          </a>
        </Button>
        <a href="#agenda" className={secondary}>
          What&apos;s on now <ArrowRight aria-hidden className="size-4" />
        </a>
      </>
    );
  }
  if (phase === "after") {
    return (
      <>
        <Button asChild variant="solid" size="lg">
          <a href={event.replayUrl} target="_blank" rel="noreferrer">
            Watch the replay <ArrowUpRight aria-hidden />
          </a>
        </Button>
        <a href="#waitlist" className={secondary}>
          Send it to me <ArrowRight aria-hidden className="size-4" />
        </a>
      </>
    );
  }
  return (
    <>
      <Button asChild variant="solid" size="lg">
        <a href="#waitlist">
          Take a number <ArrowRight aria-hidden />
        </a>
      </Button>
      <a href="#tickets" className={secondary}>
        Late passes from €39 <ArrowRight aria-hidden className="size-4" />
      </a>
    </>
  );
}

export function Hero() {
  const { phase, ready } = useEvent();
  const shown: Phase = ready ? phase : "before";

  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-16 overflow-hidden pt-16">
      <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,#05060a_0%,#090812_50%,#150a16_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[280px] sm:h-[340px] lg:h-[380px]">
        <Cityscape seed={41} lights={0.2} signs={["LOW LIGHT", "HOTEL"]} style={{ fontFamily: "var(--font-tilt-neon, inherit)" }} />
      </div>

      <div className="mx-auto max-w-[1240px] px-5 pb-[300px] pt-12 sm:px-8 sm:pb-[360px] sm:pt-16 lg:pb-[390px] lg:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
          {event.city} <span className="text-white/30">·</span> {event.dateLabel}
        </p>
        <h1
          id="hero-title"
          className="mt-6 text-[clamp(3rem,11vw,8.25rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white"
        >
          Interface craft,
          <br />
          <span className="text-white/45">after dark.</span>
        </h1>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:items-start lg:gap-16">
          <div className="max-w-[46ch] lg:pt-2">
            <p className="text-pretty text-base leading-relaxed text-white/65 sm:text-[17px]">{LEDE[shown]}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Actions phase={shown} />
            </div>
            <a
              href="#speakers"
              className="group mt-10 flex items-center gap-4 rounded-lg border-t border-white/[0.07] pt-6 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              <AvatarGroup size="sm">
                {speakers.slice(0, 4).map((speaker) => (
                  <Avatar key={speaker.id} alt="" fallback={initials(speaker.name)} />
                ))}
              </AvatarGroup>
              <span className="text-sm leading-snug text-white/60 transition-colors group-hover:text-white/85">
                With {speakers[0].name}, {speakers[1].name} and {speakers.length - 2} more
              </span>
            </a>
          </div>

          <div className="relative max-w-[600px]">
            <div
              aria-hidden
              className="absolute -inset-x-10 -inset-y-12 -z-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.14),transparent)]"
            />
            <DepartureBoard />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] bg-[#05060a]/85 backdrop-blur-[6px]">
        <ul className="mx-auto flex max-w-[1240px] justify-between gap-x-6 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 sm:px-8">
          {FACTS.map((fact, i) => (
            <li key={fact} className={i % 2 === 1 ? "hidden sm:block" : undefined}>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
