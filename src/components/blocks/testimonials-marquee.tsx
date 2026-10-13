"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
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

const lift =
  "transition-[border-color,box-shadow,background-color] duration-300 hover:border-[rgb(var(--neon)/0.55)] hover:bg-[rgb(var(--neon)/0.03)] hover:shadow-[0_0_0_1px_rgb(var(--neon)/0.14),0_0_30px_-6px_rgb(var(--neon)/0.5),inset_0_0_20px_-10px_rgb(var(--neon)/0.4)] motion-reduce:transition-none";

export default function TestimonialsMarquee() {
  const titleId = React.useId();
  const [paused, setPaused] = React.useState(false);

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative overflow-hidden bg-[#05060a] py-20 text-white/90 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Marginalia · reader mail</p>
          <h2
            id={titleId}
            className="mt-5 max-w-[15ch] text-balance text-[clamp(2.1rem,5vw,3.5rem)] font-semibold leading-[1] tracking-[-0.04em]"
          >
            Docs people stopped complaining about.
          </h2>
        </div>
        <div className="flex flex-col gap-5 lg:items-end">
          <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-white/55 lg:text-right">
            Across 140 API teams, support tickets tagged &ldquo;docs&rdquo; fell by 38% in the first quarter after
            the switch.
          </p>
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            className="inline-flex h-9 items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 outline-none transition-colors hover:border-white/20 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] lg:self-end"
          >
            {paused ? <Play aria-hidden className="size-3" /> : <Pause aria-hidden className="size-3" />}
            {paused ? "Play" : "Pause"}
            <span className="sr-only"> scrolling testimonials</span>
          </button>
        </div>
      </div>

      <div className="mt-14 grid gap-4 sm:mt-16">
        <Marquee speed={30} gap={16} fade={80} paused={paused} aria-label="Testimonials from API teams">
          {stories.map((story) => (
            <figure
              key={story.name}
              className={`group flex w-[300px] shrink-0 flex-col justify-between gap-6 rounded-[18px] border border-white/[0.07] bg-white/[0.02] p-5 sm:w-[380px] sm:p-6 ${lift}`}
            >
              <blockquote className="text-pretty text-[15px] leading-relaxed text-white/75">
                <p>
                  {story.quote[0]}
                  <mark className="rounded-[3px] bg-[rgb(var(--neon)/0.09)] text-white/90 transition-[color,background-color,text-shadow] duration-300 [-webkit-box-decoration-break:clone] [box-decoration-break:clone] group-hover:bg-[rgb(var(--neon)/0.16)] group-hover:[color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] group-hover:[text-shadow:0_0_8px_rgb(var(--neon)/0.7),0_0_22px_rgb(var(--neon)/0.35)] motion-reduce:transition-none">
                    {story.quote[1]}
                  </mark>
                  {story.quote[2]}
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <Avatar alt={story.name} size="sm" />
                <span className="min-w-0 text-sm leading-tight">
                  <span className="block truncate font-medium text-white/90">{story.name}</span>
                  <span className="block truncate text-[13px] text-white/60">{story.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Marquee>

        <Marquee reverse speed={22} gap={16} fade={80} paused={paused} aria-label="Notes from developers reading the docs">
          {notes.map((note) => (
            <figure
              key={note.who}
              className={`flex w-[280px] shrink-0 flex-col gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3.5 sm:w-[300px] ${lift}`}
            >
              <blockquote className="text-pretty text-sm leading-snug text-white/70">
                <p>{note.quote}</p>
              </blockquote>
              <figcaption className="flex items-baseline justify-between gap-3">
                <span className="truncate text-xs text-white/60">{note.who}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">
                  via {note.source}
                </span>
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
