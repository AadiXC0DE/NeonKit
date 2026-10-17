"use client";

import * as React from "react";
import { ArrowRight, Play } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { RetroGrid } from "@/components/ui/retro-grid";
import { RotatingText } from "@/components/ui/rotating-text";
import { Sunset } from "@/components/ui/sunset";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";

// Friday 26 February 2027, midnight in London.
const RELEASE = "2027-02-26T00:00:00Z";

// Where the sun meets the floor, as a share of the scene's height. The grid's own horizon sits at its middle,
// so it starts (2 × HORIZON − 1) of the way down to line up.
const HORIZON = 0.5;

const FORMATS = [
  { id: "tape", word: "cassette.", label: "Cassette", noun: "cassette", price: "£12", note: "500 numbered, chrome tape" },
  { id: "vinyl", word: "12-inch vinyl.", label: "Vinyl", noun: "vinyl", price: "£28", note: "180 g, pressed in Czechia" },
  { id: "md", word: "MiniDisc.", label: "MiniDisc", noun: "MiniDisc", price: "£18", note: "200 made, all signed" },
  { id: "digital", word: "every app.", label: "Digital", noun: "download", price: "£8", note: "FLAC and MP3, no DRM" },
];

export default function HeroSunset() {
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState(false);
  const format = FORMATS[index];

  return (
    <section
      aria-labelledby="coastline-hero-title"
      // Change the color here; everything inside follows it.
      style={neonVars("magenta")}
      className="relative isolate flex min-h-[880px] flex-col overflow-hidden bg-[#05060a] text-white lg:min-h-[860px]"
    >
      {/* The scene: sun behind, floor in front, and the floor sinking into shadow where the copy sits. */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[620px] sm:h-[700px] lg:h-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#05060a_0%,#0d0716_35%,#1a0a1f_50%,#05060a_50.2%)]" />
        <Sunset horizon={HORIZON} size={0.46} slits={8} line={false} seed={11} />
        <RetroGrid style={{ top: `${(2 * HORIZON - 1) * 100}%` }} cellSize={64} speed={1.6} />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_top,#05060a_8%,rgb(5_6_10/0.55)_55%,transparent)]" />
      </div>

      <header className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
        <span className="text-[19px] font-semibold lowercase tracking-[-0.03em] text-white/90">vela nova</span>
        <nav aria-label="Main" className="flex items-center gap-7 text-[14px] text-white/65">
          <a href="#" className="transition-colors hover:text-white">
            Tour
          </a>
          <a href="#" className="hidden transition-colors hover:text-white sm:inline">
            Store
          </a>
          <a href="#" className="transition-colors hover:text-white">
            Listen
          </a>
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-end px-5 pb-10 pt-[300px] sm:px-8 sm:pb-14 sm:pt-[400px] lg:pt-0">
        <div className="grid items-end gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h1
              id="coastline-hero-title"
              className="text-[clamp(2.9rem,7.2vw,6.25rem)] font-[620] leading-[0.98] tracking-[-0.045em] text-white [font-stretch:112%] [text-shadow:0_2px_24px_rgb(5_6_10/0.8)]"
            >
              Coastline FM,
              <br />
              on{" "}
              <RotatingText
                words={FORMATS.map((f) => f.word)}
                index={index}
                onIndexChange={setIndex}
                paused={picked}
                interval={2800}
                className="font-normal tracking-[-0.01em] [font-stretch:100%]"
                style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
              />
            </h1>
            <p className="mt-7 max-w-[48ch] text-pretty text-[17px] leading-[1.6] text-white/65">
              <span className="text-white/90">The second Vela Nova record.</span> Ten tracks, 41 minutes, every one of
              them at 104 BPM. Recorded on a Juno-106 and a borrowed drum machine in a Margate flat.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ToggleGroup
                type="single"
                variant="outline"
                aria-label="Format"
                value={format.id}
                onValueChange={(value) => {
                  const next = FORMATS.findIndex((f) => f.id === value);
                  if (next < 0) return;
                  setIndex(next);
                  setPicked(true);
                }}
                className="flex-wrap"
              >
                {FORMATS.map((f) => (
                  <ToggleGroupItem key={f.id} value={f.id}>
                    {f.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-[14px] text-white/60" aria-live="polite">
                <span className="font-medium text-white/90">{format.price}</span> · {format.note}
              </p>
            </div>
          </div>

          {/* The release clock: what the countdown is for, then the thing to press. */}
          <div className="min-w-0 lg:pb-1">
            <p className="text-[14px] text-white/65">
              Out Friday 26 February, <span className="font-mono text-white/85">00:00</span> GMT
            </p>
            <Countdown
              to={RELEASE}
              variant="digital"
              size="md"
              labels={{ days: "days", hours: "hours", minutes: "min", seconds: "sec" }}
              className="mt-4 [--countdown-h:38px] sm:[--countdown-h:56px] [&_.uppercase]:normal-case [&_.uppercase]:tracking-normal"
            />
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild variant="solid" size="lg">
                <a href="#">
                  Pre-order the {format.noun} <ArrowRight />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="#">
                  <Play /> Video, 3:58
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
