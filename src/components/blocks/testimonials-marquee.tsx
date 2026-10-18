"use client";

import * as React from "react";
import { Pause, Play } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Marquee } from "@/components/ui/marquee";
import { neonVars } from "@/lib/neon";

// Each quote is [before, highlighted phrase, after].
const stories: { name: string; role: string; quote: [string, string, string] }[] = [
  {
    name: "Naomi Achterberg",
    role: "DevRel lead, Parcelwise",
    quote: ["Our API reference used to drift a week behind the code. Now it's generated on merge, and ", "every example on it actually runs", "."],
  },
  {
    name: "Julian Park",
    role: "Developer experience, Tollgate",
    quote: ["", "Time to first successful call went from 26 minutes to 7", ". We measured it with screen recordings of new users, which was humbling."],
  },
  {
    name: "Mei Lin",
    role: "Support engineering, ninebark",
    quote: ["The try-it console signs requests with the reader's own sandbox key. That one change ", "halved our “how do I authenticate” tickets", "."],
  },
  {
    name: "Ade Bankole",
    role: "Platform PM, Cinder",
    quote: ["Docs are versioned per API release now. ", "Nobody follows v3 instructions against a v4 endpoint", " anymore."],
  },
  {
    name: "Clara Voss",
    role: "Staff technical writer, Sundial",
    quote: ["", "Search finds the parameter, not just the page", ". Readers land on the exact field they were looking for."],
  },
  {
    name: "Ravi Shah",
    role: "Docs engineer, pewter",
    quote: ["", "We moved 1,400 pages of Markdown over a weekend", ". Redirects, anchors, code tabs, the lot."],
  },
];

const notes = [
  { quote: "Finally, code samples that compile.", who: "Kofi Osei, backend", source: "feedback widget" },
  { quote: "The changelog links straight to the endpoints that changed. More of this.", who: "Lena Brandt, mobile", source: "changelog reply" },
  { quote: "Dark mode that doesn't turn code blocks into soup.", who: "Tomás Rey, frontend", source: "feedback widget" },
  { quote: "The copy button gives me the curl with my key already in it.", who: "Aisha Karim, data eng", source: "office hours" },
  { quote: "Understood the rate-limit page on the first read. A career first.", who: "Ben Hollis, SRE", source: "survey, Q3" },
  { quote: "Error codes link to the fix, not to a glossary.", who: "Yuki Mori, integrations", source: "support ticket" },
  { quote: "Every page says when it was last checked against production.", who: "Nadia Petrova, fintech", source: "feedback widget" },
];

export default function TestimonialsMarquee() {
  const titleId = React.useId();
  const [paused, setPaused] = React.useState(false);

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate overflow-hidden bg-[#05060a] py-20 text-white/90 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-10 lg:grid-cols-12 lg:items-end lg:gap-8">
        <h2
          id={titleId}
          className="text-[clamp(2.2rem,4.6vw,4rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%] lg:col-span-8"
        >
          <span className="block">Docs people stopped</span>
          <span className="block">complaining about.</span>
        </h2>
        <p className="flex items-end gap-4 lg:col-span-4 lg:justify-end lg:pb-1">
          <span className="text-[clamp(3rem,5vw,4.25rem)] font-[620] leading-[0.85] tracking-[-0.05em] text-[rgb(var(--neon))] [font-stretch:112%] [text-shadow:0_0_2px_rgb(var(--neon)/0.6),0_0_26px_rgb(var(--neon)/0.45)]">
            −38%
          </span>
          <span className="max-w-[22ch] text-[14px] leading-snug text-white/60">
            support tickets tagged &ldquo;docs&rdquo;, across 140 API teams in their first quarter
          </span>
        </p>
      </div>

      <div className="mt-16 border-y border-white/[0.07] py-10 sm:mt-20 sm:py-12">
        <Marquee speed={34} gap={0} fade={120} paused={paused} aria-label="Testimonials from API teams">
          {stories.map((story) => (
            <figure
              key={story.name}
              className="group flex w-[320px] shrink-0 flex-col justify-between gap-6 border-r border-white/[0.07] px-6 sm:w-[520px] sm:px-10"
            >
              <blockquote className="text-pretty text-[19px] leading-[1.35] tracking-[-0.015em] text-white/50 sm:text-[24px]">
                <p>
                  {story.quote[0]}
                  <mark className="bg-transparent text-white/95 transition-[color,text-shadow] duration-300 group-hover:[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] group-hover:[text-shadow:0_0_8px_rgb(var(--neon)/0.7),0_0_22px_rgb(var(--neon)/0.35)] motion-reduce:transition-none">
                    {story.quote[1]}
                  </mark>
                  {story.quote[2]}
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <Avatar alt={story.name} size="sm" />
                <span className="min-w-0 text-sm leading-tight">
                  <span className="block truncate font-medium text-white/90">{story.name}</span>
                  <span className="block truncate text-[13px] text-white/55">{story.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </div>

      <div className="py-6">
        <Marquee reverse speed={22} gap={56} fade={120} paused={paused} aria-label="Notes from developers reading the docs">
          {notes.map((note) => (
            <figure key={note.who} className="flex shrink-0 items-baseline gap-3 whitespace-nowrap">
              <blockquote className="text-[15px] text-white/75">
                <p>&ldquo;{note.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="text-[13px] text-white/50">
                {note.who}, via {note.source}
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto mt-2 flex max-w-6xl justify-end px-5 sm:px-10">
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-[13px] text-white/60 outline-none transition-colors hover:bg-white/[0.04] hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
        >
          {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
          {paused ? "Play" : "Pause"}
          <span className="sr-only"> scrolling testimonials</span>
        </button>
      </div>
    </section>
  );
}
