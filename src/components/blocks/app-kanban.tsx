"use client";

import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, CloudRain, FileWarning, Plus, Clapperboard } from "@/components/ui/icons";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

type Dept = "Camera" | "Lighting" | "Art" | "Sound" | "Locations" | "Cast";
type Card = { id: string; title: string; dept: Dept; scene?: string; day: string; crew: string[]; flag?: "rain" | "permit" };
type ColumnId = "prep" | "ready" | "set" | "wrapped";

const COLUMNS: { id: ColumnId; title: string; note: string; limit?: number }[] = [
  { id: "prep", title: "Prep", note: "Needs a call sheet slot" },
  { id: "ready", title: "Ready", note: "Locked for the next two days", limit: 4 },
  { id: "set", title: "On set", note: "Shooting today", limit: 3 },
  { id: "wrapped", title: "Wrapped", note: "In the can" },
];

const CARDS: Record<ColumnId, Card[]> = {
  prep: [
    { id: "c1", title: "Clear drone permit with the harbour authority", dept: "Locations", day: "Day 11", crew: ["Ruth Abara"], flag: "permit" },
    { id: "c2", title: "Build the lighthouse interior flat", dept: "Art", scene: "Sc. 31", day: "Day 14", crew: ["Tomasz Wilk", "Imke Sol"] },
    { id: "c3", title: "Callbacks for young Ada", dept: "Cast", day: "Day 12", crew: ["Joy Mensah"] },
  ],
  ready: [
    { id: "c4", title: "Ferry dock, night exterior", dept: "Camera", scene: "Sc. 14", day: "Day 9", crew: ["Ola Brandt", "Dev Iyer"], flag: "rain" },
    { id: "c5", title: "Rig the 18K on the dock crane", dept: "Lighting", scene: "Sc. 14", day: "Day 9", crew: ["Marco Pel"] },
    { id: "c6", title: "Wild track: gulls and engine idle", dept: "Sound", scene: "Sc. 14", day: "Day 9", crew: ["Hana Ueda"] },
  ],
  set: [
    { id: "c7", title: "Kitchen, day interior", dept: "Camera", scene: "Sc. 12", day: "Day 8", crew: ["Ola Brandt", "Dev Iyer", "Sami Roy"] },
    { id: "c8", title: "Practical lamps dressed for the kitchen", dept: "Art", scene: "Sc. 12", day: "Day 8", crew: ["Imke Sol"] },
    { id: "c9", title: "Boom and lavs on both leads", dept: "Sound", scene: "Sc. 12", day: "Day 8", crew: ["Hana Ueda"] },
  ],
  wrapped: [
    { id: "c10", title: "Quarry road at dusk", dept: "Camera", scene: "Sc. 7", day: "Day 6", crew: ["Ola Brandt"] },
    { id: "c11", title: "Signed release for Marlow quarry", dept: "Locations", day: "Day 6", crew: ["Ruth Abara"] },
  ],
};

const ORDER = COLUMNS.map((c) => c.id);
// The pseudo-element stretches the tap area to 36px without changing the card's layout.
const MOVE = "size-7 rounded-md after:absolute after:-inset-1 after:content-[''] [&_svg]:size-3.5";
const DEPTS: Dept[] = ["Camera", "Lighting", "Art", "Sound", "Locations", "Cast"];

function Tube({ state }: { state: "idle" | "full" | "over" }) {
  return (
    <span
      aria-hidden
      style={state === "over" ? neonVars("red") : undefined}
      className={cn(
        "absolute inset-x-0 top-0 h-[2px] rounded-full transition-[background-color,box-shadow] duration-300",
        state === "idle" && "bg-white/[0.1]",
        state === "full" && "bg-[rgb(var(--neon)/0.55)] shadow-[0_0_8px_rgb(var(--neon)/0.45)]",
        state === "over" && "nk-app-kanban-buzz bg-[color-mix(in_srgb,rgb(var(--neon))_45%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.8),0_0_32px_rgb(var(--neon)/0.4)]",
      )}
    />
  );
}

export default function AppKanban() {
  const [board, setBoard] = React.useState(CARDS);
  const [dept, setDept] = React.useState("all");
  const [moved, setMoved] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState<ColumnId | null>(null);
  const [draft, setDraft] = React.useState("");
  const [announce, setAnnounce] = React.useState("");
  const reduceMotion = useReducedMotion() ?? false;
  const refs = React.useRef(new Map<string, HTMLElement>());
  const focusNext = React.useRef<{ id: string; button?: number } | null>(null);
  const nextId = React.useRef(12);

  React.useEffect(() => {
    if (!focusNext.current) return;
    const { id, button } = focusNext.current;
    const card = refs.current.get(id);
    // A move button keeps focus in the moved card, so pressing it again keeps the card travelling.
    const control = button ? card?.querySelector<HTMLElement>(`[data-move="${button}"]:not(:disabled)`) : null;
    (control ?? card)?.focus({ preventScroll: false });
    focusNext.current = null;
  });

  React.useEffect(() => {
    if (!moved) return;
    const t = window.setTimeout(() => setMoved(null), 1400);
    return () => window.clearTimeout(t);
  }, [moved]);

  function locate(id: string) {
    for (const col of ORDER) {
      const index = board[col].findIndex((c) => c.id === id);
      if (index !== -1) return { col, index };
    }
    return null;
  }

  function move(id: string, dx: number, dy = 0, focus?: "card" | "button") {
    const at = locate(id);
    if (!at) return;
    const toCol = ORDER[ORDER.indexOf(at.col) + dx];
    if (!toCol) return;
    const card = board[at.col][at.index];
    const next = { ...board, [at.col]: board[at.col].filter((c) => c.id !== id) };
    const target = toCol === at.col ? next[toCol] : board[toCol];
    const index = dx === 0 ? Math.max(0, Math.min(target.length, at.index + dy)) : target.length;
    next[toCol] = [...target.slice(0, index), card, ...target.slice(index)];
    setBoard(next);
    if (dx !== 0) {
      const column = COLUMNS.find((c) => c.id === toCol)!;
      setMoved(id);
      const over = column.limit !== undefined && next[toCol].length > column.limit;
      setAnnounce(`Moved “${card.title}” to ${column.title}.${over ? ` ${column.title} is over its limit of ${column.limit}.` : ""}`);
    }
    if (focus) focusNext.current = { id, button: focus === "button" ? dx : undefined };
  }

  function onCardKey(event: React.KeyboardEvent, id: string) {
    const at = locate(id);
    if (!at) return;
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const step = arrows[event.key];
    if (!step) return;
    event.preventDefault();
    if (event.shiftKey) return move(id, step[0], step[1], "card");
    const col = ORDER[ORDER.indexOf(at.col) + step[0]];
    if (!col) return;
    const list = board[col];
    const target = step[0] ? list[Math.min(at.index, list.length - 1)] : list[at.index + step[1]];
    if (target) refs.current.get(target.id)?.focus();
  }

  // Closing the inline field hands focus back to its "Add card" button.
  function closeAdd(from: HTMLElement) {
    const slot = from.closest("li");
    setDraft("");
    setAdding(null);
    requestAnimationFrame(() => slot?.querySelector<HTMLElement>("button")?.focus());
  }

  function addCard(event: React.FormEvent<HTMLFormElement>, col: ColumnId) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return closeAdd(event.currentTarget);
    const card: Card = { id: `c${nextId.current++}`, title, dept: dept === "all" ? "Art" : (dept as Dept), day: "Day 15", crew: ["Noor Haddad"] };
    setBoard((b) => ({ ...b, [col]: [...b[col], card] }));
    setDraft("");
    setMoved(card.id);
  }

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      aria-labelledby="kanban-title"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#05060a] text-white/90"
    >
      <style>{`
        @keyframes nk-app-kanban-buzz { 0%, 100% { opacity: 1 } 8% { opacity: .55 } 12% { opacity: 1 } 61% { opacity: .8 } 63% { opacity: 1 } }
        .nk-app-kanban-buzz { animation: nk-app-kanban-buzz 2.4s steps(1, end) infinite; }
        @media (prefers-reduced-motion: reduce) { .nk-app-kanban-buzz { animation: none; } }
      `}</style>
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[70%] -translate-x-1/2 rounded-full bg-[rgb(var(--neon)/0.06)] blur-[90px]" />

      <header className="mx-auto flex w-full max-w-[1400px] flex-wrap items-end justify-between gap-x-8 gap-y-5 px-4 pb-6 pt-8 sm:px-8 lg:pt-12">
        <div className="min-w-0">
          <h1 id="kanban-title" className="flex flex-wrap items-baseline gap-x-3 text-[30px] font-[620] leading-none tracking-[-0.035em] text-white [font-stretch:112%] sm:text-[34px]">
            <span className="flex items-center gap-2.5">
              <Clapperboard aria-hidden className="size-6 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.6))]" />
              Saltmarsh
            </span>
            <span className="text-white/50">day 8 of 32</span>
          </h1>
          <p className="mt-3 text-sm text-white/60">
            Tuesday 13 October. Unit call <span className="tabular-nums text-white/85">06:30</span>, wrap <span className="tabular-nums text-white/85">19:00</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <AvatarGroup size="sm" max={5}>
            {["Ola Brandt", "Dev Iyer", "Imke Sol", "Hana Ueda", "Ruth Abara", "Marco Pel", "Joy Mensah"].map((n) => (
              <Avatar key={n} alt={n} />
            ))}
          </AvatarGroup>
          <p className="hidden items-center gap-1.5 text-xs text-white/60 xl:flex">
            <Kbd size="sm">⇧</Kbd>
            <Kbd size="sm">←</Kbd>
            <Kbd size="sm">→</Kbd>
            moves a focused card
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <ToggleGroup size="sm" variant="segmented" aria-label="Department" value={dept} onValueChange={(v) => v && setDept(v)} className="min-w-max">
            <ToggleGroupItem value="all">All crew</ToggleGroupItem>
            {DEPTS.map((d) => (
              <ToggleGroupItem key={d} value={d}>{d}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">{announce}</p>

      <LayoutGroup>
        <div className="mx-auto mt-5 w-full max-w-[1400px] snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-12 [scrollbar-color:rgb(255_255_255/0.12)_transparent] [scrollbar-width:thin] sm:scroll-px-8 sm:px-8 lg:snap-none">
          <ol className="grid min-w-max grid-cols-[repeat(4,288px)] gap-4 lg:min-w-0 lg:grid-cols-4 lg:gap-6">
            {COLUMNS.map((column) => {
              const cards = board[column.id];
              const state = column.limit === undefined ? "idle" : cards.length > column.limit ? "over" : cards.length === column.limit ? "full" : "idle";
              return (
                <li key={column.id} aria-labelledby={`col-${column.id}`} className="relative flex snap-start flex-col">
                  <Tube state={state} />
                  {state === "over" && <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgb(255_77_94/0.14),transparent)]" />}
                  <div className="relative flex items-start justify-between gap-3 pb-3.5 pt-4">
                    <div className="min-w-0">
                      <h2 id={`col-${column.id}`} className="text-[15px] font-[620] tracking-[-0.015em] text-white/90 [font-stretch:112%]">{column.title}</h2>
                      <p className={cn("mt-0.5 truncate text-xs", state === "over" ? "text-[rgb(255_77_94)]" : "text-white/60")}>
                        {state === "over" ? `Over the WIP limit by ${cards.length - column.limit!}` : column.note}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 pt-0.5 font-mono text-xs tabular-nums transition-[color,text-shadow] duration-300",
                        state === "over" && "text-[rgb(255_77_94)] [text-shadow:0_0_8px_rgb(255_77_94/0.8)]",
                        state === "full" && "text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]",
                        state === "idle" && "text-white/55",
                      )}
                    >
                      {cards.length}
                      {column.limit !== undefined && <span>/{column.limit}</span>}
                      <span className="sr-only">{column.limit !== undefined ? " cards, limit " : " cards"}</span>
                    </span>
                  </div>

                  <ul className="flex flex-1 flex-col gap-2">
                    {cards.map((card) => {
                      const at = ORDER.indexOf(column.id);
                      const dim = dept !== "all" && card.dept !== dept;
                      return (
                        <motion.li key={card.id} layout={!reduceMotion} layoutId={reduceMotion ? undefined : card.id} transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.8 }} className="relative">
                          <article
                            ref={(node) => {
                              if (node) refs.current.set(card.id, node);
                              else refs.current.delete(card.id);
                            }}
                            tabIndex={0}
                            aria-label={`${card.title}, ${card.dept}, ${card.day}`}
                            aria-describedby="kanban-keys"
                            onKeyDown={(e) => onCardKey(e, card.id)}
                            className={cn(
                              "group relative rounded-xl border bg-[#0b0c12] p-3.5 outline-none transition-[opacity,border-color,box-shadow] duration-300",
                              "focus-visible:border-[rgb(var(--neon)/0.6)] focus-visible:shadow-[0_0_0_1px_rgb(var(--neon)/0.3),0_0_24px_-6px_rgb(var(--neon)/0.6)]",
                              moved === card.id ? "border-[rgb(var(--neon)/0.7)] shadow-[0_0_0_1px_rgb(var(--neon)/0.35),0_0_28px_-4px_rgb(var(--neon)/0.6)]" : "border-white/[0.08] hover:border-white/[0.16]",
                              dim && "opacity-30",
                            )}
                          >
                            <h3 className="text-[14px] leading-snug text-white/90">{card.title}</h3>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/55">
                              <span className={cn(card.dept === dept && "text-[rgb(var(--neon))]")}>{card.dept}</span>
                              {card.scene && <span aria-hidden>·</span>}
                              {card.scene && <span className="tabular-nums">{card.scene}</span>}
                              <span className="ml-auto tabular-nums">{card.day}</span>
                            </div>
                            <div className="mt-3 flex min-h-7 items-center gap-2 border-t border-white/[0.05] pt-2.5">
                              <span className="flex gap-1">
                                {card.crew.map((n) => <Avatar key={n} alt={n} size="sm" className="size-6 text-[9px]" />)}
                              </span>
                              {card.flag === "rain" && <span className="flex items-center gap-1 text-[11px] text-white/60"><CloudRain aria-hidden className="size-3.5" />Rain 60%</span>}
                              {card.flag === "permit" && <span className="flex items-center gap-1 text-[11px] text-white/60"><FileWarning aria-hidden className="size-3.5" />Permit pending</span>}
                              <div className="ml-auto flex gap-0.5 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
                                <Button size="icon" variant="ghost" aria-label={at > 0 ? `Move to ${COLUMNS[at - 1].title}` : "Already in the first column"} data-move="-1" disabled={at === 0} onClick={() => move(card.id, -1, 0, "button")} className={MOVE}>
                                  <ChevronLeft />
                                </Button>
                                <Button size="icon" variant="ghost" aria-label={at < ORDER.length - 1 ? `Move to ${COLUMNS[at + 1].title}` : "Already in the last column"} data-move="1" disabled={at === ORDER.length - 1} onClick={() => move(card.id, 1, 0, "button")} className={MOVE}>
                                  <ChevronRight />
                                </Button>
                              </div>
                            </div>
                          </article>
                        </motion.li>
                      );
                    })}
                    <li className="mt-auto pt-1">
                      {adding === column.id ? (
                        <form onSubmit={(e) => addCard(e, column.id)}>
                          <Input
                            size="sm"
                            autoFocus
                            aria-label={`New card in ${column.title}`}
                            placeholder="What needs doing? Enter to add"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => { if (!draft.trim()) setAdding(null); }}
                            onKeyDown={(e) => { if (e.key === "Escape") closeAdd(e.currentTarget); }}
                          />
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setDraft(""); setAdding(column.id); }}
                          className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-[13px] text-white/55 outline-none transition-colors hover:bg-white/[0.03] hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                        >
                          <Plus aria-hidden className="size-3.5" /> Add card
                        </button>
                      )}
                    </li>
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </LayoutGroup>
      <p id="kanban-keys" hidden>Arrow keys move between cards. Shift with an arrow moves the card.</p>
    </section>
  );
}
