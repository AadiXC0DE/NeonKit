"use client";

import * as React from "react";
import { ArrowRight, CornerDownLeft } from "@/components/ui/icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

type Faq = { id: string; q: string; a: string; keywords?: string[] };

const TOPICS: { topic: string; items: Faq[] }[] = [
  {
    topic: "Scheduling",
    items: [
      {
        id: "pick",
        q: "How does Tidewater pick a meeting time?",
        a: "It reads everyone's working hours, calendar holds and focus blocks, then offers the three slots that cost the fewest people the least. Required attendees are never pushed into early or late hours; optional ones can be.",
        keywords: ["slot", "suggest", "algorithm"],
      },
      {
        id: "focus",
        q: "Can I block focus time it won't book over?",
        a: "Mark any recurring block as Focus. Tidewater treats it like a meeting when booking, but it shows as free to people outside your workspace. Most teams settle on two 2-hour blocks a day.",
        keywords: ["deep work", "busy", "protect"],
      },
      {
        id: "zones",
        q: "What happens across time zones?",
        a: "Everyone's working hours stay in their own zone. When there's no overlap at all, Tidewater says so instead of suggesting 6am, and offers an async thread or a meeting split in two.",
        keywords: ["timezone", "utc", "remote", "overlap"],
      },
    ],
  },
  {
    topic: "Teams and seats",
    items: [
      {
        id: "seat",
        q: "Who counts as a seat?",
        a: "Anyone who owns a calendar in your workspace. Guests you book with, and people who only receive invites, are free.",
        keywords: ["user", "member", "license"],
      },
      {
        id: "contractors",
        q: "Can contractors join without seeing everything?",
        a: "Invite them as Limited members. They see the meetings they're in and the teams you share with them, nothing else, and they cost half a seat.",
        keywords: ["guest", "freelancer", "permissions", "limited"],
      },
      {
        id: "rotation",
        q: "How do round-robin booking links work?",
        a: "A team link rotates across members by fewest meetings this week, or strictly in order if you prefer. Holidays and sick days take people out of the rotation automatically.",
        keywords: ["round robin", "rotate", "sales", "support"],
      },
    ],
  },
  {
    topic: "Integrations",
    items: [
      {
        id: "calendars",
        q: "Which calendars does it connect to?",
        a: "Any calendar that speaks CalDAV or publishes ICS, plus the two big hosted ones. Changes sync both ways within about 20 seconds.",
        keywords: ["sync", "caldav", "ics", "connect"],
      },
      {
        id: "video",
        q: "Does it add video links?",
        a: "It generates a link from your workspace's default video provider, or uses your personal room. You can override either per booking link.",
        keywords: ["zoom", "call", "conference", "room"],
      },
      {
        id: "api",
        q: "Is there an API?",
        a: "A REST API, plus webhooks for booked, moved and cancelled events. The limit is 600 requests a minute per workspace, and every key can be scoped to read-only.",
        keywords: ["webhook", "developer", "rest", "rate limit"],
      },
    ],
  },
  {
    topic: "Billing",
    items: [
      {
        id: "price",
        q: "How much does it cost?",
        a: "$9 per seat a month, or $90 a year. Limited members are half price, and workspaces under five seats are free for good.",
        keywords: ["pricing", "plan", "free"],
      },
      {
        id: "prorate",
        q: "Do you prorate when we add people mid-month?",
        a: "To the day. Removing someone credits their unused days to your next invoice, so there's no reason to wait for the 1st.",
        keywords: ["refund", "credit", "invoice", "add user"],
      },
      {
        id: "invoice",
        q: "Can we pay by invoice?",
        a: "On annual plans of 25 seats or more. Net 30, by bank transfer or card, with your PO number on every invoice.",
        keywords: ["purchase order", "po", "bank transfer", "net 30"],
      },
    ],
  },
];

const ALL = TOPICS.flatMap(({ topic, items }) => items.map((item) => ({ ...item, topic })));

export default function FaqSearch() {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState("zones");
  const [highlight, setHighlight] = React.useState("zones");
  const [vote, setVote] = React.useState<Record<string, "yes" | "no">>({});
  const answerRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const voteRef = React.useRef<HTMLSpanElement>(null);
  // The article remounts per answer, so buttons inside it vanish on click. Say where focus should land next.
  const focusNext = React.useRef<"title" | "vote" | null>(null);

  React.useEffect(() => {
    if (focusNext.current === "title") titleRef.current?.focus({ preventScroll: true });
    if (focusNext.current === "vote") voteRef.current?.focus();
    focusNext.current = null;
  }, [selected, vote]);

  const current = ALL.find((item) => item.id === selected) ?? ALL[0];
  const related = ALL.filter((item) => item.topic === current.topic && item.id !== current.id);

  function open(id: string, moveFocus = false) {
    setSelected(id);
    if (moveFocus) focusNext.current = "title";
    setHighlight(id);
    // On narrow screens the answer sits under the list, so bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => answerRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }));
    }
  }

  return (
    <section
      aria-labelledby="faq-search-title"
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      className="relative isolate overflow-hidden bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16 lg:py-28"
    >
      <style>{`
        @keyframes nk-faq-search-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .nk-faq-search-in { animation: nk-faq-search-in 260ms cubic-bezier(0.23, 1, 0.32, 1) both; }
        @media (prefers-reduced-motion: reduce) { .nk-faq-search-in { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-[1180px]">
        <h2
          id="faq-search-title"
          className="max-w-[16ch] text-[clamp(2.5rem,5.6vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
        >
          Ask it the way you&apos;d ask a coworker.
        </h2>
        <p className="mt-6 max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-white/60">
          Twelve answers, searched as you type.{" "}
          <span className="text-white/50">If yours isn&apos;t here, it goes to a person on the team, not a ticket queue.</span>
        </p>

        <div className="mt-12 grid grid-cols-1 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.02] lg:mt-16 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          <div className="flex flex-col border-b border-white/[0.08] lg:border-b-0 lg:border-r">
            <Command
              label="Search the FAQ"
              value={highlight}
              onValueChange={setHighlight}
              className="flex-1 rounded-none border-0 bg-transparent shadow-none"
            >
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder="Try “time zones” or “invoice”"
              />
              <CommandList className="max-h-[300px] lg:max-h-[440px] lg:flex-1">
                <CommandEmpty>
                  <span className="text-white/70">Nothing on the calendar for “{search.trim()}”.</span>
                  <a
                    href="mailto:crew@tidewater.example"
                    className="rounded-md text-[rgb(var(--neon))] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    Ask the crew directly
                  </a>
                </CommandEmpty>
                {TOPICS.map(({ topic, items }) => (
                  <CommandGroup key={topic} heading={<span className="text-white/55">{topic}</span>}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        keywords={[topic, ...(item.keywords ?? [])]}
                        onSelect={open}
                        className={cn(
                          "[&>span]:whitespace-normal after:ml-1 after:size-1.5 after:shrink-0 after:rounded-full after:transition-opacity after:duration-200",
                          item.id === selected
                            ? "text-white after:bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] after:shadow-[0_0_0_2px_rgb(var(--neon)/0.25),0_0_10px_2px_rgb(var(--neon)/0.7)]"
                            : "after:opacity-0",
                        )}
                      >
                        {item.q}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
              <div className="mt-auto hidden items-center gap-4 border-t border-white/[0.06] px-4 py-3 text-[12px] text-white/55 sm:flex">
                <span className="flex items-center gap-1.5">
                  <Kbd size="sm" listen="ArrowUp">↑</Kbd>
                  <Kbd size="sm" listen="ArrowDown">↓</Kbd>
                  move
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd size="sm" listen="Enter">
                    <CornerDownLeft />
                  </Kbd>
                  open
                </span>
                <span className="ml-auto">{ALL.length} answers</span>
              </div>
            </Command>
          </div>

          <div ref={answerRef} className="relative scroll-mt-6 p-7 sm:p-10 lg:p-12">
            {/* The selected answer catches a little of the list's light */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_0%_0%,rgb(var(--neon)/0.06),transparent)]"
            />
            <p role="status" className="sr-only">
              Showing: {current.q}
            </p>
            <article key={current.id} className="nk-faq-search-in">
              <p className="text-[13px] text-white/55">
                <span className="text-[rgb(var(--neon))]">{current.topic}</span>
                <span aria-hidden className="px-2 text-white/25">
                  ·
                </span>
                <span className="tabular-nums">
                  {ALL.indexOf(current) + 1} of {ALL.length}
                </span>
              </p>
              <h3
                ref={titleRef}
                tabIndex={-1}
                className="mt-4 max-w-[20ch] text-balance text-[clamp(1.75rem,3.2vw,2.75rem)] font-[620] leading-[1.02] tracking-[-0.035em] text-white outline-none [font-stretch:112%]"
              >
                {current.q}
              </h3>
              <p className="mt-6 max-w-[56ch] text-pretty text-[17px] leading-[1.6] text-white/65">{current.a}</p>

              <div className="mt-8 flex flex-wrap items-center gap-1 border-t border-white/[0.06] pt-5 text-[13px] text-white/55">
                {vote[current.id] ? (
                  <span ref={voteRef} role="status" tabIndex={-1} className="outline-none">{vote[current.id] === "yes" ? "Glad it helped." : "Noted. We'll rewrite this one."}</span>
                ) : (
                  <>
                    <span className="mr-2">Did this answer it?</span>
                    {(["yes", "no"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setVote((votes) => ({ ...votes, [current.id]: value }));
                          focusNext.current = "vote";
                        }}
                        className="inline-flex h-8 cursor-pointer items-center rounded-md px-2.5 capitalize text-white/75 outline-none transition-colors duration-150 hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                      >
                        {value}
                      </button>
                    ))}
                  </>
                )}
                <span className="ml-auto hidden sm:inline">Updated 18 Sep 2026</span>
              </div>

              <div className="mt-10">
                <h4 className="text-[14px] font-medium text-white/80">More on {current.topic.toLowerCase()}</h4>
                <ul className="mt-3">
                  {related.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => open(item.id, true)}
                        className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-md border-b border-white/[0.06] py-3 text-left text-[15px] text-white/65 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                      >
                        {item.q}
                        <ArrowRight className="size-4 shrink-0 text-white/30 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--neon))]" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
