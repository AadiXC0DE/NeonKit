"use client";

import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";

import { Button } from "@/components/ui/button";
import { Cityscape } from "@/components/ui/cityscape";
import { cn } from "@/lib/utils";

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

// The poster's top-right corner, which keeps up with the night.
const WHEN: Record<Phase, string> = {
  before: "Doors 18:30, bar till 01:00",
  live: "On air until 23:45, bar till 01:00",
  after: `Replay out now, ${replay.runtime}`,
};

// How much of the city is still awake: a little before, most of it while we're on air, nearly nobody by Sunday.
const WINDOWS: Record<Phase, number> = { before: 0.16, live: 0.3, after: 0.07 };

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

// "after dark." is lettered in glass tube. It only strikes while the night is actually on.
const tube =
  "[color:color-mix(in_srgb,rgb(var(--neon))_32%,white)] [text-shadow:0_0_2px_rgb(255_255_255/0.6),0_0_10px_rgb(var(--neon)/0.95),0_0_34px_rgb(var(--neon)/0.6),0_0_90px_rgb(var(--neon)/0.35)]";

export function Hero() {
  const { phase, ready } = useEvent();
  const shown: Phase = ready ? phase : "before";
  const host = speakers.find((speaker) => speaker.role === "Host");
  const billed = speakers.filter((speaker) => speaker !== host);

  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-16 overflow-hidden pt-16">
      <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,#05060a_0%,#090812_55%,#170a17_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[300px] sm:h-[360px] lg:h-[420px]">
        <Cityscape
          seed={41}
          lights={WINDOWS[shown]}
          signs={["LOW LIGHT", "HOTEL"]}
          style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
        />
      </div>

      <div className="mx-auto max-w-[1240px] px-5 pb-[268px] pt-10 sm:px-8 sm:pb-[330px] sm:pt-14 lg:pb-[300px] lg:pt-16">
        {/* The poster's top line: when, where, and when to turn up. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 text-[14px] text-white/60 sm:text-[15px]">
          <p>
            <span className="text-white/90">{event.dateLabel}</span>
            <span className="hidden sm:inline">, {event.venue}, {event.city}</span>
          </p>
          <p>{WHEN[shown]}</p>
        </div>

        <h1
          id="hero-title"
          className="mt-8 font-[640] leading-[0.84] tracking-[-0.05em] text-white [font-stretch:112%] sm:mt-12"
        >
          <span className="block text-[clamp(3.1rem,11.4vw,9.75rem)]">Interface craft,</span>
          <span
            className={cn(
              "block text-right text-[clamp(3.1rem,11.4vw,9.75rem)] transition-[color,text-shadow] duration-700",
              shown === "live" ? tube : "text-white/40",
            )}
          >
            after dark.
          </span>
        </h1>

        <div className="mt-10 grid gap-12 sm:mt-14 lg:mt-12 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-5 lg:pt-3">
            <p className="max-w-[44ch] text-pretty text-[16px] leading-[1.6] text-white/70 sm:text-[17px]">{LEDE[shown]}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Actions phase={shown} />
            </div>
            <p className="mt-10 max-w-[44ch] border-t border-white/[0.08] pt-5 text-[14px] leading-relaxed text-white/60">
              {shown === "after" ? "With thanks to" : "On stage:"}{" "}
              {billed.map((speaker, index) => (
                <span key={speaker.id}>
                  <a
                    href="#speakers"
                    className="rounded-[3px] text-white/85 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    {speaker.name}
                  </a>
                  {index < billed.length - 2 ? ", " : index === billed.length - 2 ? " and " : "."}
                </span>
              ))}
              {host && <> Hosted by {host.name}.</>}
            </p>
          </div>

          {/* Hung over the skyline like the board in a station hall. */}
          <div className="relative lg:col-span-7 lg:col-start-6">
            <div
              aria-hidden
              className="absolute -inset-x-10 -inset-y-12 -z-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.13),transparent)]"
            />
            <DepartureBoard />
          </div>
        </div>
      </div>
    </section>
  );
}
