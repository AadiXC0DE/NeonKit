"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
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
function Tubes({ paths, lit, broken }: { paths: string[]; lit?: boolean; broken?: boolean }) {
  const litLayer = cn(
    "transition-opacity duration-300 ease-out",
    lit ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:[animation:nk-app-empty-states-ignite_420ms_linear_both] motion-reduce:group-hover:[animation:none]",
  );
  const all = broken ? [...paths, SLASH] : paths;
  return (
    <div className="relative grid h-40 place-items-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#08090e]">
      <div aria-hidden className={cn("absolute inset-x-10 top-1/2 h-24 -translate-y-1/2 rounded-full bg-[rgb(var(--neon)/0.22)] blur-[48px]", litLayer)} />
      <svg aria-hidden viewBox="0 0 160 100" className="relative h-full w-full max-w-[280px]" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {all.map((d) => <path key={d} d={d} stroke="rgb(var(--neon) / 0.16)" strokeWidth="3" />)}
        <g className={litLayer} style={{ filter: "drop-shadow(0 0 2px rgb(var(--neon))) drop-shadow(0 0 8px rgb(var(--neon) / 0.6))" }}>
          {all.map((d) => (
            <path key={d} d={d} stroke={d === SLASH ? "rgb(255 77 94)" : "color-mix(in srgb, rgb(var(--neon)) 30%, white)"} strokeWidth="1.6" />
          ))}
        </g>
      </svg>
    </div>
  );
}

function Panel({ eyebrow, title, children, art }: { eyebrow: string; title: string; children: React.ReactNode; art: React.ReactNode }) {
  const id = React.useId();
  return (
    <article aria-labelledby={id} className="group flex flex-col rounded-[20px] border border-white/10 bg-white/[0.02] p-3 outline-none transition-colors duration-300 hover:border-white/[0.16]">
      {art}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">{eyebrow}</p>
        <h3 id={id} className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white/90">{title}</h3>
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

      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Quietroom · Empty states</p>
            <h2 id="qr-empty-title" className="mt-3 text-[clamp(2.25rem,4.6vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
              Nothing here yet,
              <span className="block text-white/40">and that&apos;s fine.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-white/55">
            Four screens people meet before there&apos;s anything to show. Each one says what happened and offers one next step.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Panel eyebrow="Rooms" title="No rooms yet" art={<Tubes paths={ART.rooms} lit={creating === "done"} />}>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
              A room holds one project&apos;s voice notes, files and decisions. Start one for whatever you&apos;re on this week.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              {creating === "done" ? (
                <p role="status" className="flex items-center gap-2 text-sm text-white/80">
                  <span className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
                  Untitled room created.
                  <button ref={undoRef} type="button" onClick={() => { setCreating("idle"); requestAnimationFrame(() => createRef.current?.focus()); }} className="rounded-md text-white/60 underline-offset-4 outline-none hover:text-white/80 hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                    Undo
                  </button>
                </p>
              ) : (
                <>
                  <Button ref={createRef} variant="solid" size="sm" loading={creating === "busy"} onClick={() => { setCreating("busy"); later(() => { setCreating("done"); refocus(undoRef); }, 800); }}>
                    Create a room
                  </Button>
                  <Button variant="ghost" size="sm">Import from Slack</Button>
                </>
              )}
            </div>
          </Panel>

          <Panel eyebrow="Search" title={q && !results.length ? "No matches" : "Find a note"} art={<Tubes paths={ART.search} lit={results.length > 0} />}>
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
            <div aria-live="polite" className="mt-3 min-h-[60px] text-sm">
              {!q && <p className="text-white/60">Try <span className="text-white/75">standup</span>, <span className="text-white/75">retro</span> or a room name.</p>}
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
                      <span className="shrink-0 font-mono text-[11px] text-white/55">{n.room} · {n.length}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel
            eyebrow="Connection"
            title={network === "online" ? "Back online" : "You're offline"}
            art={<Tubes paths={ART.offline} broken={network !== "online"} lit={network === "online"} />}
          >
            <p role="status" className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
              {network === "online"
                ? "3 notes synced. Everyone in the room can hear them now."
                : "Recording still works. 3 notes are saved on this device and upload when you reconnect."}
            </p>
            <div className="mt-auto flex items-center gap-3 pt-6">
              {network === "online" ? (
                <Button ref={networkRef} variant="ghost" size="sm" onClick={() => setNetwork("offline")}>Simulate drop</Button>
              ) : (
                <Button ref={networkRef} variant="outline" size="sm" loading={network === "busy"} onClick={() => { setNetwork("busy"); later(() => { setNetwork("online"); refocus(networkRef); }, 1200); }}>
                  {network === "busy" ? "Reconnecting" : "Try again"}
                </Button>
              )}
              <span className="font-mono text-[11px] text-white/55">{network === "online" ? "Synced just now" : "Last sync 14:02"}</span>
            </div>
          </Panel>

          <Panel eyebrow="Inbox" title="All caught up" art={<Tubes paths={ART.caughtUp} lit />}>
            <p role="status" className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
              {quiet
                ? "Notifications are paused until 09:00. Mentions from your manager still get through."
                : "Nothing needs you until Thursday\u2019s design review. Close the laptop for a bit."}
            </p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
              <Switch size="sm" checked={quiet} onCheckedChange={setQuiet} label={<span className="text-white/70">Quiet hours until 09:00</span>} />
              <Button variant="ghost" size="sm">See earlier</Button>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
