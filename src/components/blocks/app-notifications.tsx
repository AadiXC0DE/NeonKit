"use client";

import * as React from "react";
import { ArrowLeft, AtSign, Bell, CheckCheck, CornerDownLeft, MailOpen, Settings2, Siren } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/ui/glow-chart";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

type Kind = "alert" | "mention" | "system";
type Status = "firing" | "acked" | "resolved";

interface Note {
  id: string;
  kind: Kind;
  day: string;
  time: string;
  title: string;
  body: string;
  source: string;
  unread: boolean;
  severity?: 1 | 2 | 3;
  status?: Status;
  author?: string;
  trend?: number[];
  metric?: [string, string];
  facts?: [string, string][];
  log?: [string, string][];
}

const DAYS = [
  { key: "today", label: "Today", date: "Tue 13 Oct" },
  { key: "yesterday", label: "Yesterday", date: "Mon 12 Oct" },
  { key: "fri", label: "Friday", date: "Fri 9 Oct" },
];

const NOTES: Note[] = [
  {
    id: "n1", kind: "alert", day: "today", time: "02:14", severity: 1, status: "firing", unread: true,
    title: "checkout-api 5xx rate at 8.4%", source: "INC-2294 · checkout-api",
    body: "Error rate above 2% for 6 minutes in eu-west-1. Paging primary on-call.",
    metric: ["5xx rate", "%"],
    trend: [0.3, 0.4, 0.3, 0.5, 0.4, 0.6, 1.1, 2.4, 3.9, 5.2, 6.8, 7.7, 8.4],
    facts: [["Service", "checkout-api"], ["Region", "eu-west-1"], ["Policy", "Payments primary"], ["Started", "02:08 · 6 min"]],
    log: [["02:08", "Threshold crossed: 5xx > 2%"], ["02:09", "Paged you by push and SMS"], ["02:12", "Escalation in 3 min if unacknowledged"]],
  },
  {
    id: "n2", kind: "mention", day: "today", time: "01:58", unread: true, author: "Priya Raman",
    title: "Priya Raman mentioned you", source: "INC-2291 · #inc-ledger",
    body: "Can you confirm the rollback of 4.18.2 finished before we close this one out?",
  },
  {
    id: "n3", kind: "alert", day: "today", time: "01:32", severity: 3, status: "acked", unread: true,
    title: "ledger-worker queue depth over 12k", source: "INC-2293 · ledger-worker",
    body: "Backlog growing at 340 jobs/min. Acknowledged by Tomás Ferreira.",
    metric: ["Queue depth", "k"],
    trend: [2.1, 2.4, 3.2, 4.8, 6.1, 7.4, 8.9, 10.2, 11.6, 12.3, 12.8],
    facts: [["Service", "ledger-worker"], ["Region", "us-east-2"], ["Policy", "Data platform"], ["Started", "01:19 · 55 min"]],
    log: [["01:19", "Queue depth > 10k"], ["01:21", "Paged Tomás Ferreira"], ["01:24", "Acknowledged by Tomás Ferreira"]],
  },
  {
    id: "n4", kind: "system", day: "today", time: "00:40", unread: false,
    title: "Escalation policy updated", source: "Payments primary · Dana Okafor",
    body: "Second tier now pages after 5 minutes instead of 10. SMS added for SEV1.",
  },
  {
    id: "n5", kind: "alert", day: "yesterday", time: "16:47", severity: 2, status: "resolved", unread: false,
    title: "search-gateway p95 at 1.8 s", source: "INC-2290 · search-gateway",
    body: "Resolved after 23 minutes. Cause: cold cache after the 16:20 deploy.",
    metric: ["p95 latency", " s"],
    trend: [0.4, 0.4, 0.5, 1.2, 1.8, 1.7, 1.4, 0.9, 0.6, 0.4, 0.4],
    facts: [["Service", "search-gateway"], ["Region", "global"], ["Policy", "Search"], ["Duration", "23 min"]],
    log: [["16:24", "p95 > 1 s"], ["16:26", "Acknowledged by you"], ["16:47", "Resolved by you"]],
  },
  {
    id: "n6", kind: "mention", day: "yesterday", time: "11:05", unread: true, author: "Marcus Lee",
    title: "Marcus Lee replied in a postmortem", source: "INC-2287 · Postmortem",
    body: "Added the Grafana timeline. Your section on the retry storm is the last one open.",
  },
  {
    id: "n7", kind: "system", day: "yesterday", time: "09:00", unread: false,
    title: "You're on call", source: "Payments primary",
    body: "Your shift runs from Mon 12 Oct 09:00 to Thu 15 Oct 09:00. Backup is Aiko Sato.",
  },
  {
    id: "n8", kind: "alert", day: "fri", time: "18:30", severity: 3, status: "resolved", unread: false,
    title: "TLS cert for status.beacon.dev expires in 7 days", source: "INC-2281 · edge",
    body: "Renewed automatically at 18:52. Nothing to do.",
    metric: ["Days to expiry", " d"],
    trend: [7, 7, 7, 7, 7, 7, 90],
    facts: [["Service", "edge"], ["Region", "global"], ["Policy", "Platform"], ["Duration", "22 min"]],
    log: [["18:30", "Cert expiry < 7 days"], ["18:52", "Renewed, auto-resolved"]],
  },
  {
    id: "n9", kind: "mention", day: "fri", time: "10:12", unread: false, author: "Aiko Sato",
    title: "Aiko Sato mentioned you", source: "#ops-handoff",
    body: "Handing over with two open alerts, both quiet. Runbook links are pinned in the channel.",
  },
];

const KIND_ICON = { alert: Siren, mention: AtSign, system: Settings2 };
const FILTERS = [
  { value: "all", label: "All" },
  { value: "mention", label: "Mentions" },
  { value: "alert", label: "Alerts" },
];

function StatusBadge({ status }: { status: Status }) {
  if (status === "firing")
    return <Badge size="sm" color="red" variant="outline" pulse>Firing</Badge>;
  if (status === "acked") return <Badge size="sm" dot>Acknowledged</Badge>;
  return <Badge size="sm" className="border-white/10 bg-white/[0.04] text-white/60">Resolved</Badge>;
}

function BeaconMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" strokeLinecap="round">
      <path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.6" />
      <path d="M9.2 9.2a4 4 0 0 0 0 5.6M14.8 9.2a4 4 0 0 1 0 5.6" stroke="rgb(255 255 255 / 0.6)" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.9" fill="color-mix(in srgb, rgb(var(--neon)) 35%, white)" style={{ filter: "drop-shadow(0 0 3px rgb(var(--neon)))" }} />
    </svg>
  );
}

function Detail({ note, onAck, onResolve, onUnread, onBack }: {
  note: Note;
  onAck: () => void;
  onResolve: () => void;
  onUnread: () => void;
  onBack: () => void;
}) {
  const [reply, setReply] = React.useState("");
  const [sent, setSent] = React.useState<string[]>([]);
  const Icon = KIND_ICON[note.kind];

  return (
    <article aria-labelledby={`${note.id}-title`} className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
        <button type="button" onClick={onBack} className="-my-1 -ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-2 text-xs text-white/60 outline-none hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] lg:hidden">
          <ArrowLeft aria-hidden className="size-3.5" /> Back
        </button>
        <span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55 lg:inline-flex">
          <Icon className="size-3.5" aria-hidden /> {note.kind}
        </span>
        <Button variant="ghost" size="sm" onClick={onUnread} disabled={note.unread}>
          <MailOpen /> Mark unread
        </Button>
      </div>

      <div className="flex-1 space-y-6 p-5 sm:p-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
            {note.source}{note.severity ? ` · SEV${note.severity}` : ""}
          </p>
          <h2 id={`${note.id}-title`} className="mt-2 text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-white/90">
            {note.title}
          </h2>
          {note.status && <div className="mt-3"><StatusBadge status={note.status} /></div>}
        </div>

        {note.kind === "mention" ? (
          <div className="space-y-4">
            <figure className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <figcaption className="flex items-center gap-2.5 text-sm text-white/70">
                <Avatar alt={note.author ?? ""} size="sm" /> {note.author}
                <span className="ml-auto font-mono text-[11px] text-white/55">{note.time}</span>
              </figcaption>
              <blockquote className="mt-3 text-[15px] leading-relaxed text-white/80">
                <span className="text-[rgb(var(--neon))]">@you</span> {note.body}
              </blockquote>
            </figure>
            {sent.map((text, i) => (
              <p key={i} className="ml-8 rounded-xl border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--neon)/0.06)] px-4 py-3 text-sm text-white/80">{text}</p>
            ))}
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                setSent((s) => [...s, reply.trim()]);
                setReply("");
              }}
            >
              <Input
                aria-label={`Reply to ${note.author}`}
                placeholder={`Reply to ${note.author?.split(" ")[0]}…`}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                containerClassName="flex-1"
              />
              <Button type="submit" variant="soft" size="icon" aria-label="Send reply" disabled={!reply.trim()}>
                <CornerDownLeft />
              </Button>
            </form>
          </div>
        ) : (
          <p className="text-[15px] leading-relaxed text-white/70">{note.body}</p>
        )}

        {note.trend && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
              <span>{note.metric?.[0]} · last 30 min</span>
              <span className="text-white/70">{note.trend[note.trend.length - 1]}{note.metric?.[1]}</span>
            </div>
            <Sparkline data={note.trend} width="100%" height={56} live={note.status === "firing"} className="mt-3" />
          </div>
        )}

        {note.facts && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {note.facts.map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">{k}</dt>
                <dd className="mt-0.5 text-white/80">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {note.log && (
          <ol className="space-y-2 border-l border-white/10 pl-4">
            {note.log.map(([t, text]) => (
              <li key={t + text} className="flex gap-3 text-[13px] text-white/60">
                <span className="w-10 shrink-0 font-mono text-[11px] leading-5 text-white/55">{t}</span> {text}
              </li>
            ))}
            {note.status !== "firing" && note.id === "n1" && (
              <li className="flex gap-3 text-[13px] text-white/80">
                <span className="w-10 shrink-0 font-mono text-[11px] leading-5 text-white/55">02:15</span>
                {note.status === "acked" ? "Acknowledged by you" : "Resolved by you"}
              </li>
            )}
          </ol>
        )}
      </div>

      {note.status && note.status !== "resolved" && (
        <div data-actions className="flex flex-wrap gap-2 border-t border-white/[0.06] px-5 py-4 sm:px-6">
          {note.status === "firing" && <Button variant="solid" onClick={onAck}>Acknowledge</Button>}
          <Button variant={note.status === "firing" ? "ghost" : "solid"} onClick={onResolve}>Resolve</Button>
        </div>
      )}
    </article>
  );
}

export default function AppNotifications() {
  const [notes, setNotes] = React.useState(NOTES);
  const [filter, setFilter] = React.useState("all");
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState("n1");
  const [mobileDetail, setMobileDetail] = React.useState(false);

  const update = (id: string, patch: Partial<Note>) =>
    setNotes((all) => all.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const visible = notes.filter((n) => (filter === "all" || n.kind === filter) && (!unreadOnly || n.unread));
  const unread = notes.filter((n) => n.unread);
  const count = (kind: string) => unread.filter((n) => kind === "all" || n.kind === kind).length;
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0];

  const detailRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const narrow = () => window.matchMedia("(max-width: 1023.98px)").matches;

  const open = (id: string) => {
    setSelectedId(id);
    update(id, { unread: false });
    setMobileDetail(true);
    if (!narrow()) return;
    // Below lg the list gives way to the detail, so bring focus and the detail's top into view.
    requestAnimationFrame(() => {
      const detail = detailRef.current;
      if (!detail) return;
      detail.focus({ preventScroll: true });
      const top = detail.getBoundingClientRect().top;
      if (top < 0) window.scrollBy({ top: top - 16 });
    });
  };

  const back = () => {
    setMobileDetail(false);
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>("button[aria-current]")?.focus());
  };

  // Acting on a note can remove the button that was pressed; keep focus inside the detail.
  const act = (patch: Partial<Note>) => {
    update(selected.id, patch);
    requestAnimationFrame(() => {
      const detail = detailRef.current;
      if (!detail || detail.contains(document.activeElement)) return;
      (detail.querySelector<HTMLElement>("[data-actions] button:not(:disabled)") ?? detail).focus({ preventScroll: true });
    });
  };

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("magenta")}
      className="relative isolate min-h-[880px] overflow-hidden bg-[#05060a] text-white/90"
    >
      <div aria-hidden className="absolute -left-40 -top-40 -z-10 size-[520px] rounded-full bg-[rgb(var(--neon)/0.07)] blur-[120px]" />

      <header className="flex h-14 items-center gap-6 border-b border-white/[0.06] px-4 sm:px-8">
        <a href="#" className="-my-2 flex items-center gap-2 rounded-md py-2 text-[15px] font-semibold tracking-[-0.01em] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
          <BeaconMark /> Beacon
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-5 text-sm text-white/60 md:flex">
          {["Incidents", "On-call", "Services", "Postmortems"].map((item) => (
            <a key={item} href="#" className="rounded-md outline-none hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">{item}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-white/55 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_6px_rgb(52_211_153)]" /> On call until Thu 09:00
          </span>
          <span className="relative inline-flex size-9 items-center justify-center rounded-lg bg-white/[0.05] text-white/80" aria-label={`${unread.length} unread notifications`} role="img">
            <Bell className="size-4" aria-hidden />
            {unread.length > 0 && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_6px_rgb(var(--neon))]" />}
          </span>
          <Avatar alt="Jordan Vale" size="sm" status="online" />
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-10 pt-8 sm:px-8 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Inbox · Payments primary</p>
            <h1 className="mt-2 text-4xl font-semibold leading-none tracking-[-0.035em] sm:text-[44px]">Notifications</h1>
            <p className="mt-3 flex items-center gap-3 font-mono text-xs text-white/60">
              <span aria-live="polite">{unread.length ? `${unread.length} unread` : "All read"}</span>
              <span aria-hidden className="h-3 w-px bg-white/15" />
              {/* aria-disabled rather than disabled, so focus stays put after the click empties the list. */}
              <button
                type="button"
                aria-disabled={!unread.length}
                onClick={() => unread.length && setNotes((all) => all.map((n) => ({ ...n, unread: false })))}
                className="-my-2 inline-flex items-center gap-1.5 rounded-md py-2 text-white/70 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] aria-disabled:cursor-default aria-disabled:text-white/30 aria-disabled:hover:text-white/30"
              >
                <CheckCheck className="size-3.5" aria-hidden /> Mark all read
              </button>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <ToggleGroup aria-label="Filter notifications" value={filter} onValueChange={(v) => v && setFilter(v)} size="sm">
              {FILTERS.map((f) => (
                <ToggleGroupItem key={f.value} value={f.value} className="max-sm:h-8">
                  {f.label}
                  <span className="font-mono text-[10px]">{count(f.value)}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Switch size="sm" checked={unreadOnly} onCheckedChange={setUnreadOnly} label={<span className="text-white/60">Unread only</span>} />
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div ref={listRef} className={cn("flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] lg:max-h-[680px] lg:overflow-y-auto", mobileDetail && "hidden lg:flex")}>
            {visible.length === 0 && (
              <div className="grid flex-1 place-items-center content-center px-6 py-24 text-center">
                <svg aria-hidden viewBox="0 0 24 24" className="size-14" fill="none" strokeLinecap="round" strokeWidth="1.4" stroke="rgb(var(--neon) / 0.18)">
                  <path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M9.2 9.2a4 4 0 0 0 0 5.6M14.8 9.2a4 4 0 0 1 0 5.6" />
                  <circle cx="12" cy="12" r="1.6" fill="rgb(var(--neon) / 0.18)" stroke="none" />
                </svg>
                <p className="mt-5 text-[15px] text-white/80">Nothing unread here.</p>
                <p className="mt-1 text-sm text-white/60">The pager is quiet. Go get some sleep.</p>
              </div>
            )}
            {DAYS.map((day) => {
              const items = visible.filter((n) => n.day === day.key);
              if (!items.length) return null;
              return (
                <div key={day.key} role="group" aria-label={day.label}>
                  <div className="sticky top-0 z-10 flex items-baseline justify-between border-b border-white/[0.06] bg-[#08090e] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em]">
                    <span className="text-white/60">{day.label}</span>
                    <span className="text-white/55">{day.date}</span>
                  </div>
                  <ul>
                    {items.map((n) => {
                      const Icon = KIND_ICON[n.kind];
                      const active = n.id === selected.id;
                      return (
                        <li key={n.id} className="border-b border-white/[0.06] last:border-b-0">
                          <button
                            type="button"
                            onClick={() => open(n.id)}
                            aria-current={active || undefined}
                            className={cn(
                              "relative grid w-full grid-cols-[16px_minmax(0,1fr)_auto] gap-x-3.5 px-5 py-4 text-left outline-none transition-colors duration-150",
                              "hover:bg-white/[0.03] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                              active && "lg:bg-white/[0.04]",
                            )}
                          >
                            {active && (
                              <span aria-hidden className="absolute inset-y-3 left-0 hidden w-[3px] rounded-r-full bg-[color-mix(in_srgb,rgb(var(--neon))_45%,white)] shadow-[0_0_8px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.6)] lg:block" />
                            )}
                            <Icon aria-hidden className={cn("mt-0.5 size-4", n.status === "firing" ? "text-[rgb(255_77_94)]" : "text-white/35")} />
                            <span className="min-w-0">
                              <span className={cn("block text-[15px] leading-snug", n.unread ? "font-medium text-white/90" : "text-white/70")}>{n.title}</span>
                              <span className={cn("mt-1 line-clamp-2 text-sm leading-relaxed sm:line-clamp-1", n.unread ? "text-white/70" : "text-white/60")}>{n.body}</span>
                              <span className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/55">
                                {n.source}
                                {n.status && <StatusBadge status={n.status} />}
                              </span>
                            </span>
                            <span className="flex flex-col items-end gap-2.5 font-mono text-[11px] leading-6 text-white/55">
                              {n.time}
                              {n.unread && (
                                <span className="size-1.5 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.7)]">
                                  <span className="sr-only">Unread</span>
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div ref={detailRef} tabIndex={-1} className={cn("rounded-2xl border border-white/10 bg-[#0a0b11] outline-none lg:sticky lg:top-6 lg:block lg:self-start", !mobileDetail && "hidden")}>
            <Detail
              key={selected.id}
              note={selected}
              onAck={() => act({ status: "acked", unread: false })}
              onResolve={() => act({ status: "resolved", unread: false })}
              onUnread={() => act({ unread: true })}
              onBack={back}
            />
          </div>
        </div>
      </main>
    </section>
  );
}
