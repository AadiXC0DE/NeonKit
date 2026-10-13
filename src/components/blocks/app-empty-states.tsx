"use client";

import * as React from "react";
import { Search, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const NOTES = [
  { title: "Standup, Tuesday", room: "Platform", length: "4:12" },
  { title: "Launch checklist walkthrough", room: "Marketing site", length: "11:40" },
  { title: "Retro: September release", room: "Platform", length: "18:05" },
  { title: "Pricing page feedback", room: "Marketing site", length: "6:31" },
  { title: "Onboarding interview, Kofi", room: "Research", length: "22:48" },
];

// Each illustration is a few tube paths in a 160 × 100 box.
const ART = {
  rooms: ["M58 86V24a4 4 0 0 1 4-4h36a4 4 0 0 1 4 4v62", "M38 86h84", "M92 54v4", "M128 26v14M121 33h14"],
  search: ["M88 48a22 22 0 1 1-44 0 22 22 0 0 1 44 0z", "M82 64l20 20", "M58 48h16"],
  offline: ["M46 50a48 48 0 0 1 68 0", "M57 61a32 32 0 0 1 46 0", "M68 72a16 16 0 0 1 24 0", "M80 84v.5"],
  caughtUp: ["M28 80h104", "M56 80a24 24 0 0 1 48 0", "M80 44v-10", "M55 54l-7-6", "M105 54l7-6"],
};
const SLASH = "M50 26l60 62";

// Unlit glass by default. The lit layers fade in on hover or focus, or stay on when `lit` is set.
function Tubes({ paths, lit, broken, className }: { paths: string[]; lit?: boolean; broken?: boolean; className?: string }) {
  const litLayer = cn(
    "transition-opacity duration-300 ease-out",
    lit ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:[animation:nk-app-empty-states-ignite_420ms_linear_both] motion-reduce:group-hover:[animation:none]",
  );
  const all = broken ? [...paths, SLASH] : paths;
  return (
    <div className={cn("relative grid place-items-center", className)}>
      <div aria-hidden className={cn("absolute inset-x-[15%] top-1/2 h-2/3 -translate-y-1/2 rounded-full bg-[rgb(var(--neon)/0.22)] blur-[48px]", litLayer)} />
      <svg aria-hidden viewBox="0 0 160 100" className="relative h-full w-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Unlit glass: a tinted tube with a faint highlight running along it. */}
        {all.map((d) => <path key={d} d={d} stroke="rgb(var(--neon) / 0.2)" strokeWidth="3" />)}
        {all.map((d) => <path key={`${d}-hi`} d={d} stroke="rgb(255 255 255 / 0.1)" strokeWidth="0.6" />)}
        <g className={litLayer} style={{ filter: "drop-shadow(0 0 2px rgb(var(--neon))) drop-shadow(0 0 8px rgb(var(--neon) / 0.6))" }}>
          {all.map((d) => (
            <path key={d} d={d} stroke={d === SLASH ? "rgb(255 77 94)" : "color-mix(in srgb, rgb(var(--neon)) 30%, white)"} strokeWidth="1.6" />
          ))}
        </g>
      </svg>
    </div>
  );
}

// The smaller states sit in a column of rows: the drawing on the left, words and one action on the right.
function Row({ title, children, art }: { title: string; children: React.ReactNode; art: React.ReactNode }) {
  const id = React.useId();
  return (
    <article aria-labelledby={id} className="group grid grid-cols-[88px_minmax(0,1fr)] gap-5 border-t border-white/[0.07] py-7 lg:first:border-t-0 lg:first:pt-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-6">
      {art}
      <div className="min-w-0">
        <h3 id={id} className="text-[17px] font-semibold tracking-[-0.015em] text-white/90">{title}</h3>
        {children}
      </div>
    </article>
  );
}

export default function AppEmptyStates() {
  const [creating, setCreating] = React.useState<"idle" | "busy" | "done">("idle");
  const [query, setQuery] = React.useState("quarterly offsite budget");
  const [network, setNetwork] = React.useState<"offline" | "busy" | "online">("offline");
  const [quiet, setQuiet] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const createRef = React.useRef<HTMLButtonElement>(null);
  const undoRef = React.useRef<HTMLButtonElement>(null);
  const networkRef = React.useRef<HTMLButtonElement>(null);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  // Loading buttons are disabled, which drops focus. Put it back once the action settles,
  // unless the person has already moved on to something else.
  const refocus = (ref: React.RefObject<HTMLElement | null>) =>
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body) ref.current?.focus();
    });

  const q = query.trim().toLowerCase();
  const results = q ? NOTES.filter((n) => `${n.title} ${n.room}`.toLowerCase().includes(q)) : [];

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("blue")}
      aria-labelledby="qr-empty-title"
      className="relative isolate overflow-hidden bg-[#05060a] px-4 py-14 text-white/90 sm:px-8 sm:py-20"
    >
      <style>{`@keyframes nk-app-empty-states-ignite{0%{opacity:0}12%{opacity:.85}22%{opacity:.15}40%{opacity:1}52%{opacity:.45}68%,100%{opacity:1}}`}</style>

      <div className="mx-auto max-w-[1160px]">
        <h2 id="qr-empty-title" className="text-[clamp(2.4rem,5.4vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] [font-stretch:112%]">
          Nothing here yet,
          <span className="block text-white/40">and that&apos;s fine.</span>
        </h2>
        <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.6] text-white/60">
          What Quietroom says before there&apos;s anything to show. Each screen tells you what happened and offers one next step.
        </p>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-0">
          {/* The first empty state anyone meets gets the room: a full-size sign and one clear action. */}
          <article aria-labelledby="qr-rooms" className="group lg:col-span-6 lg:pr-12">
            <Tubes paths={ART.rooms} lit={creating === "done"} className="-mx-4 h-56 sm:h-72" />
            <h3 id="qr-rooms" className="mt-6 text-[clamp(1.75rem,2.6vw,2.25rem)] font-[620] leading-none tracking-[-0.035em] text-white/95 [font-stretch:112%]">
              {creating === "done" ? "Your first room" : "No rooms yet"}
            </h3>
            <p className="mt-3 max-w-[42ch] text-[16px] leading-[1.6] text-white/60">
              A room holds one project&apos;s voice notes, files and decisions. Start one for whatever you&apos;re on this week.
            </p>
            <div className="mt-7 flex min-h-12 flex-wrap items-center gap-3">
              {creating === "done" ? (
                <p role="status" className="flex items-center gap-2 text-[15px] text-white/80">
                  <span className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
                  Untitled room created.
                  <button ref={undoRef} type="button" onClick={() => { setCreating("idle"); requestAnimationFrame(() => createRef.current?.focus()); }} className="rounded-md text-white/60 underline-offset-4 outline-none hover:text-white/80 hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                    Undo
                  </button>
                </p>
              ) : (
                <>
                  <Button ref={createRef} variant="solid" size="lg" loading={creating === "busy"} onClick={() => { setCreating("busy"); later(() => { setCreating("done"); refocus(undoRef); }, 800); }}>
                    Create a room
                  </Button>
                  <Button variant="ghost" size="lg">Import from Slack</Button>
                </>
              )}
            </div>
          </article>

          <div className="lg:col-span-6 lg:border-l lg:border-white/[0.07] lg:pl-12">
            <Row title={q && !results.length ? "No matches" : "Find a note"} art={<Tubes paths={ART.search} lit={results.length > 0} className="h-20" />}>
              <Input
                ref={searchRef}
                aria-label="Search notes"
                size="sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                leading={<Search />}
                trailing={query && (
                  <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); searchRef.current?.focus(); }} className="-m-1.5 grid size-6 place-items-center rounded-md text-white/55 outline-none hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                    <X />
                  </button>
                )}
                containerClassName="mt-3"
              />
              <div aria-live="polite" className="mt-3 min-h-[44px] text-[14px]">
                {!q && <p className="text-white/60">Try <span className="text-white/80">standup</span>, <span className="text-white/80">retro</span> or a room name.</p>}
                {q && !results.length && (
                  <p className="leading-relaxed text-white/55">
                    Nothing for &ldquo;<span className="text-white/85">{query.trim()}</span>&rdquo; in 5 notes. Check the spelling or search all rooms.
                  </p>
                )}
                {results.length > 0 && (
                  <ul className="divide-y divide-white/[0.06]">
                    {results.slice(0, 2).map((n) => (
                      <li key={n.title} className="flex items-baseline justify-between gap-3 py-1.5">
                        <span className="truncate text-white/85">{n.title}</span>
                        <span className="shrink-0 text-[13px] text-white/55">
                          {n.room} <span className="font-mono tabular-nums">{n.length}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Row>

            <Row
              title={network === "online" ? "Back online" : "You're offline"}
              art={<Tubes paths={ART.offline} broken={network !== "online"} lit={network === "online"} className="h-20" />}
            >
              <p role="status" className="mt-1.5 text-[14px] leading-relaxed text-white/55">
                {network === "online"
                  ? "3 notes synced. Everyone in the room can hear them now."
                  : "Recording still works. 3 notes are saved on this device and upload when you reconnect."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {network === "online" ? (
                  <Button ref={networkRef} variant="ghost" size="sm" onClick={() => setNetwork("offline")}>Simulate drop</Button>
                ) : (
                  <Button ref={networkRef} variant="outline" size="sm" loading={network === "busy"} onClick={() => { setNetwork("busy"); later(() => { setNetwork("online"); refocus(networkRef); }, 1200); }}>
                    {network === "busy" ? "Reconnecting" : "Try again"}
                  </Button>
                )}
                <span className="text-[13px] text-white/55">
                  {network === "online" ? "Synced just now" : <>Last sync <span className="font-mono tabular-nums">14:02</span></>}
                </span>
              </div>
            </Row>

            <Row title="All caught up" art={<Tubes paths={ART.caughtUp} lit className="h-20" />}>
              <p role="status" className="mt-1.5 text-[14px] leading-relaxed text-white/55">
                {quiet
                  ? "Notifications are paused until 09:00. Mentions from your manager still get through."
                  : "Nothing needs you until Thursday\u2019s design review. Close the laptop for a bit."}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Switch size="sm" checked={quiet} onCheckedChange={setQuiet} label={<span className="text-white/70">Quiet hours until 09:00</span>} />
                <Button variant="ghost" size="sm">See earlier</Button>
              </div>
            </Row>
          </div>
        </div>
      </div>
    </section>
  );
}
