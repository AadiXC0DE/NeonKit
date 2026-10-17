"use client";

import * as React from "react";
import { ArrowUp, Check, Eye, FileText, Hash, Lock, Menu, Search, ThumbsUp } from "@/components/ui/icons";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

type Reaction = { icon: "check" | "thumbs" | "eye"; count: number; mine?: boolean };
type Message = {
  id: string;
  author: string;
  time: number;
  text?: string;
  code?: string;
  file?: { name: string; size: string };
  reactions?: Reaction[];
};

const ME = "Mika Sato";
const PEOPLE: Record<string, { role: string; status: "online" | "away" | "offline" }> = {
  "Rhea Kapoor": { role: "Firmware", status: "online" },
  "Tomás Ibarra": { role: "Hardware", status: "online" },
  "Lou Baptiste": { role: "Support", status: "away" },
  [ME]: { role: "Product", status: "online" },
};

const CHANNELS = [
  { id: "launch", name: "launch", topic: "Firmware 2.4 to the beta ring, today 10:00", unread: 0 },
  { id: "hardware", name: "hardware", topic: "Cells, enclosures and the factory in Brno", unread: 4 },
  { id: "support", name: "support-escalations", topic: "Tickets that need an engineer", unread: 2, locked: true },
  { id: "random", name: "random", topic: "Lunch, dogs, the office plant", unread: 0 },
];

const THREADS: Record<string, Message[]> = {
  launch: [
    { id: "a1", author: "Rhea Kapoor", time: 552, text: "Firmware 2.4 is signed. Build hash 7f3c1e0." },
    { id: "a2", author: "Rhea Kapoor", time: 552, text: "Pushing to the beta ring at 10:00 unless someone shouts." },
    { id: "a3", author: "Tomás Ibarra", time: 555, text: "Shouting a little: the battery estimate still drifts on the old cells. The fix is in 2.4.1, not 2.4." },
    { id: "a4", author: "Rhea Kapoor", time: 556, text: "Then 2.4 goes to new cells only. Ring B is 412 devices, all built after March.", reactions: [{ icon: "check", count: 3 }] },
    { id: "a5", author: "Lou Baptiste", time: 571, text: "Release notes draft, edits welcome until 09:50.", file: { name: "release-notes-2.4.md", size: "6 KB" } },
    { id: "a6", author: ME, time: 580, text: "Read it. Cut the second paragraph, nobody needs the history of the bootloader.", reactions: [{ icon: "thumbs", count: 2 }] },
    { id: "a7", author: "Tomás Ibarra", time: 584, text: "Rollout filter for ring B, in case anyone wants to check my work:" },
    { id: "a8", author: "Tomás Ibarra", time: 584, code: "ring = \"B\" and cell_batch >= \"2026-03\"\n  and fw_version < \"2.4.0\"   # 412 devices", reactions: [{ icon: "eye", count: 1 }] },
  ],
  hardware: [
    { id: "h1", author: "Tomás Ibarra", time: 501, text: "Brno shipped the first 600 enclosures. Two had the gasket seated wrong; both caught at intake." },
    { id: "h2", author: "Rhea Kapoor", time: 503, text: "Is the jig fixed or are we inspecting by hand for now?" },
    { id: "h3", author: "Tomás Ibarra", time: 504, text: "By hand until Thursday. New jig is on a truck." },
  ],
  support: [
    { id: "s1", author: "Lou Baptiste", time: 530, text: "Ticket 8812: device reboots when charging from a car adapter. Third report this week." },
    { id: "s2", author: "Rhea Kapoor", time: 534, text: "Send me the logs. Probably the brown-out threshold." },
  ],
  random: [{ id: "r1", author: "Lou Baptiste", time: 480, text: "The office fern has a new leaf. That is the update." }],
};

const REPLIES: Record<string, string[]> = {
  "Rhea Kapoor": ["Noted. I'll fold that into the 10:00 push.", "Fair. I'll hold ring B until Tomás signs off.", "Done. It's in the build notes now."],
  "Tomás Ibarra": ["Agreed. I'll watch the drift numbers after it lands.", "Works for me. Ring B is 0 of 412 so far.", "Good call. I'll update the filter."],
  "Lou Baptiste": ["Got it, I'll tell support what to expect.", "Updated the draft. Shorter now."],
};

const ICONS = { check: Check, thumbs: ThumbsUp, eye: Eye };
const clock = (t: number) => `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

function Reactions({ reactions, onToggle }: { reactions: Reaction[]; onToggle: (i: number) => void }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {reactions.map((r, i) => {
        const Icon = ICONS[r.icon];
        return (
          <button
            key={r.icon}
            type="button"
            aria-pressed={!!r.mine}
            aria-label={`${r.icon === "thumbs" ? "Thumbs up" : r.icon === "eye" ? "Looking" : "Done"}, ${r.count}`}
            onClick={() => onToggle(i)}
            className={cn(
              "relative inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-full border px-2 after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] text-[11px] tabular-nums outline-none transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] [&_svg]:size-3",
              r.mine
                ? "border-[rgb(var(--neon)/0.5)] bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))] shadow-[0_0_10px_-2px_rgb(var(--neon)/0.5)]"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20",
            )}
          >
            <Icon aria-hidden /> {r.count}
          </button>
        );
      })}
    </div>
  );
}

export default function AppChat() {
  const [channel, setChannel] = React.useState("launch");
  const [threads, setThreads] = React.useState(THREADS);
  const [unread, setUnread] = React.useState<Record<string, number>>(() => Object.fromEntries(CHANNELS.map((c) => [c.id, c.unread])));
  const [draft, setDraft] = React.useState("");
  const [typing, setTyping] = React.useState<{ channel: string; who: string } | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [query, setQuery] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const searchRef = React.useRef<HTMLButtonElement>(null);
  const timers = React.useRef<number[]>([]);
  const turn = React.useRef(0);

  const all = threads[channel];
  const q = query?.trim().toLowerCase();
  const messages = q ? all.filter((m) => `${m.author} ${m.text ?? ""} ${m.code ?? ""} ${m.file?.name ?? ""}`.toLowerCase().includes(q)) : all;
  const current = CHANNELS.find((c) => c.id === channel)!;

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Stick to the bottom of the thread, without scrolling the page around it.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing, channel]);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function post(ch: string, message: Omit<Message, "id" | "time">) {
    setThreads((all) => {
      const list = all[ch];
      const time = (list[list.length - 1]?.time ?? 540) + 1;
      return { ...all, [ch]: [...list, { ...message, id: `${ch}-${list.length}-${time}`, time }] };
    });
  }

  function send(event?: React.FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    post(channel, { author: ME, text });
    setDraft("");
    // The send button disables itself once the draft is empty, so keep focus in the composer.
    composerRef.current?.focus();

    setQuery(null);
    const others = Array.from(new Set(all.map((m) => m.author))).filter((a) => a !== ME && REPLIES[a]);
    const who = others[turn.current % others.length] ?? "Rhea Kapoor";
    const lines = REPLIES[who];
    const line = lines[turn.current % lines.length];
    turn.current += 1;
    const ch = channel;
    later(() => setTyping({ channel: ch, who }), 700);
    later(() => {
      setTyping(null);
      post(ch, { author: who, text: line });
    }, 2600);
  }

  function toggleReaction(id: string, index: number) {
    setThreads((all) => ({
      ...all,
      [channel]: all[channel].map((m) =>
        m.id !== id || !m.reactions
          ? m
          : { ...m, reactions: m.reactions.map((r, i) => (i !== index ? r : { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) })) },
      ),
    }));
  }

  function open(id: string) {
    setChannel(id);
    setQuery(null);
    setUnread((u) => ({ ...u, [id]: 0 }));
    setMenuOpen(false);
  }

  const channelList = (
    <nav aria-label="Channels" className="grid gap-6">
      <div>
        <h2 className="px-2 text-xs font-medium text-white/55">Channels</h2>
        <ul className="mt-2 grid gap-0.5">
          {CHANNELS.map((c) => {
            const active = c.id === channel;
            const Icon = c.locked ? Lock : Hash;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => open(c.id)}
                  className={cn(
                    "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                    active ? "bg-[rgb(var(--neon)/0.1)] text-white" : unread[c.id] ? "text-white/90 hover:bg-white/[0.04]" : "text-white/60 hover:bg-white/[0.04] hover:text-white/85",
                  )}
                >
                  <Icon aria-hidden className={cn("size-3.5 shrink-0", active ? "text-[rgb(var(--neon))]" : "text-white/35")} />
                  <span className={cn("truncate", unread[c.id] > 0 && !active && "font-semibold")}>{c.name}</span>
                  {unread[c.id] > 0 && !active && (
                    <span className="ml-auto rounded-full bg-[rgb(var(--neon)/0.16)] px-1.5 font-mono text-[10px] leading-4 text-[rgb(var(--neon))]">
                      {unread[c.id]}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <h2 className="px-2 text-xs font-medium text-white/55">People</h2>
        <ul className="mt-2 grid gap-1">
          {Object.entries(PEOPLE).filter(([n]) => n !== ME).map(([name, p]) => (
            <li key={name} className="flex h-8 items-center gap-2.5 px-2 text-sm text-white/60">
              <Avatar alt={name} size="sm" status={p.status} className="size-6 text-[9px]" />
              <span className="truncate">{name}</span>
              <span className="ml-auto text-xs text-white/55">{p.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  return (
    <div
      // Change the color here; everything inside follows it.
      style={neonVars("green")}
      className="flex h-[100svh] min-h-[600px] bg-[#05060a] text-white/90"
    >
      <style>{`
        @keyframes nk-app-chat-dot { 0%, 60%, 100% { opacity: .25; transform: translateY(0) } 30% { opacity: 1; transform: translateY(-2px) } }
        .nk-app-chat-dot { animation: nk-app-chat-dot 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .nk-app-chat-dot { animation: none; opacity: .7; } }
      `}</style>

      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07080d] px-3 py-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5 text-[rgb(var(--neon))]">
            <circle cx="5" cy="5" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="15" cy="15" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 6.5c4 0 2 7 6 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgb(var(--neon)))" }} />
          </svg>
          <span className="text-[15px] font-[620] tracking-[-0.02em] [font-stretch:112%]">Switchboard</span>
          <span className="ml-auto text-xs text-white/55">Northbound</span>
        </div>
        {channelList}
        <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.06] px-2 pt-3">
          <Avatar alt={ME} size="sm" status="online" />
          <div className="min-w-0 text-xs">
            <p className="truncate text-white/85">{ME}</p>
            <p className="truncate text-white/60">Heads down until 11</p>
          </div>
        </div>
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" size="sm" className="p-4">
          <SheetTitle className="mb-6 text-[15px]">Switchboard</SheetTitle>
          {channelList}
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-3 sm:px-5">
          <Button variant="ghost" size="icon" aria-label="Channels" className="size-8 md:hidden" onClick={() => setMenuOpen(true)}>
            <Menu />
          </Button>
          <div className="min-w-0">
            <h1 className="flex items-center gap-1 text-[17px] font-[620] tracking-[-0.02em] [font-stretch:112%]">
              <Hash aria-hidden className="size-4 text-white/40" />
              {current.name}
            </h1>
            <p className="truncate text-xs text-white/60">{current.topic}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <AvatarGroup size="sm" className="hidden sm:flex">
              {Object.keys(PEOPLE).map((n) => <Avatar key={n} alt={n} />)}
            </AvatarGroup>
            {query !== null ? (
              <Input
                size="sm"
                type="search"
                autoFocus
                aria-label={`Search #${current.name}`}
                placeholder="Search"
                leading={<Search />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") return;
                  setQuery(null);
                  requestAnimationFrame(() => searchRef.current?.focus());
                }}
                onBlur={() => !query && setQuery(null)}
                containerClassName="w-40 sm:w-56"
              />
            ) : (
              <Button ref={searchRef} variant="ghost" size="icon" aria-label="Search this channel" className="size-8" onClick={() => setQuery("")}>
                <Search />
              </Button>
            )}
          </div>
        </header>

        <div ref={scrollRef} role="log" aria-label={`Messages in ${current.name}`} className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:rgb(255_255_255/0.1)_transparent] [scrollbar-width:thin]">
          <div className="mx-auto flex min-h-full w-full max-w-[820px] flex-col justify-end px-3 pb-4 pt-10 sm:px-5">
            <div className="mb-6 flex items-center gap-3 text-xs text-white/55">
              <span aria-hidden className="h-px flex-1 bg-white/[0.06]" /> Today, 13 October <span aria-hidden className="h-px flex-1 bg-white/[0.06]" />
            </div>
            {q && (
              <p className="mb-4 px-2 text-xs text-white/60">
                {messages.length ? `${messages.length} ${messages.length === 1 ? "message matches" : "messages match"} “${query}”` : `Nothing in #${current.name} matches “${query}”.`}
              </p>
            )}
            <ol className="grid grid-cols-1">
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const grouped = prev && prev.author === m.author && m.time - prev.time <= 5;
                const mine = m.author === ME;
                return (
                  <li key={m.id} className={cn("group relative flex gap-3 rounded-lg px-2 py-0.5 transition-colors hover:bg-white/[0.02]", !grouped && i > 0 && "mt-4")}>
                    <div className="w-9 shrink-0">
                      {grouped ? (
                        <span className="block pt-1 text-right font-mono text-[10px] text-white/0 group-hover:text-white/55">{clock(m.time)}</span>
                      ) : (
                        <Avatar alt={m.author} size="md" ring={mine} className="mt-0.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {!grouped && (
                        <p className="flex items-baseline gap-2">
                          <span className={cn("text-sm font-semibold", mine ? "text-[rgb(var(--neon))]" : "text-white/90")}>{mine ? "You" : m.author}</span>
                          <span className="text-xs text-white/55">{PEOPLE[m.author]?.role}</span>
                          <span className="font-mono text-[11px] tabular-nums text-white/50">{clock(m.time)}</span>
                        </p>
                      )}
                      {m.text && <p className="whitespace-pre-wrap break-words text-[14.5px] leading-6 text-white/80">{m.text}</p>}
                      {m.code && (
                        <pre tabIndex={0} className="mt-1.5 overflow-x-auto rounded-lg border border-white/[0.08] bg-[#0a0b11] px-3.5 py-3 font-mono text-[12.5px] leading-5 text-white/80 [font-variant-ligatures:none] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]"><code>{m.code}</code></pre>
                      )}
                      {m.file && (
                        <a href="#file" onClick={(e) => e.preventDefault()} className="mt-2 flex w-fit max-w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-2.5 pr-4 outline-none transition-colors hover:border-[rgb(var(--neon)/0.4)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                          <FileText aria-hidden className="size-4 shrink-0 text-[rgb(var(--neon))]" />
                          <span className="truncate text-sm text-white/85">{m.file.name}</span>
                          <span className="shrink-0 text-xs text-white/60">{m.file.size}</span>
                        </a>
                      )}
                      {m.reactions && <Reactions reactions={m.reactions} onToggle={(r) => toggleReaction(m.id, r)} />}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div aria-live="polite" className="mt-3 h-6 px-2">
              {typing?.channel === channel && (
                <p className="flex items-center gap-2 text-xs text-white/60">
                  <span aria-hidden className="flex gap-[3px]">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="nk-app-chat-dot size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" style={{ animationDelay: `${d * 160}ms` }} />
                    ))}
                  </span>
                  {typing.who.split(" ")[0]} is typing
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={send} className="shrink-0 px-3 pb-4 sm:px-5">
          <div className="mx-auto max-w-[820px]">
            <div className="relative">
              <Textarea
                ref={composerRef}
                aria-label={`Message #${current.name}`}
                placeholder={`Message #${current.name}`}
                minRows={1}
                maxRows={6}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                className="rounded-xl pr-12"
              />
              <Button
                type="submit"
                size="icon"
                variant={draft.trim() ? "solid" : "ghost"}
                aria-label="Send message"
                disabled={!draft.trim()}
                className="absolute bottom-1.5 right-1.5 size-8 rounded-lg"
              >
                <ArrowUp />
              </Button>
            </div>
            <p className="mt-2 hidden text-xs text-white/50 sm:block">Enter to send, Shift Enter for a new line</p>
          </div>
        </form>
      </main>
    </div>
  );
}
