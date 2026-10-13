"use client";

import * as React from "react";
import {
  Archive,
  ArrowLeft,
  Clock,
  File,
  FilePen,
  Inbox,
  Mail,
  MailOpen,
  Menu,
  PenLine,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip } from "@/components/ui/tooltip";
import { neonVars, type NeonColor } from "@/lib/neon";
import { cn } from "@/lib/utils";

type Folder = "inbox" | "starred" | "snoozed" | "sent" | "drafts" | "archive" | "trash";
type Label = "Billing" | "Hiring" | "Design" | "Ops";
type Message = {
  id: string;
  from: string;
  email: string;
  subject: string;
  time: string;
  date: string;
  body: string[];
  folder: Folder;
  label?: Label;
  unread?: boolean;
  starred?: boolean;
  attachment?: { name: string; size: string };
  replies?: string[];
};

const LABELS: Record<Label, NeonColor | undefined> = { Billing: "amber", Hiring: "green", Design: undefined, Ops: "white" };

const FOLDERS: { id: Folder; label: string; icon: React.ReactNode }[] = [
  { id: "inbox", label: "Inbox", icon: <Inbox /> },
  { id: "starred", label: "Starred", icon: <Star /> },
  { id: "snoozed", label: "Snoozed", icon: <Clock /> },
  { id: "sent", label: "Sent", icon: <Send /> },
  { id: "drafts", label: "Drafts", icon: <FilePen /> },
  { id: "archive", label: "Archive", icon: <Archive /> },
  { id: "trash", label: "Trash", icon: <Trash2 /> },
];

const MESSAGES: Message[] = [
  {
    id: "m1", from: "Mara Lindqvist", email: "mara@northpier.studio", subject: "Q4 retainer: revised scope attached", time: "09:42", date: "Tue, Oct 13 · 09:42", folder: "inbox", label: "Billing",
    body: [
      "Hi Noa, attached is v3 of the Q4 scope. We dropped the second illustration round and moved the motion work into November, which brings the retainer down from 64 to 52 hours a month.",
      "If finance is happy with that, I can countersign by Thursday and we start on the 20th. The rate stays at $145 an hour.",
      "Mara",
    ],
    attachment: { name: "halyard-q4-scope-v3.pdf", size: "284 KB" },
  },
  {
    id: "m2", from: "Devon Achebe", email: "devon@halyard.co", subject: "Offer letter for the staff designer role", time: "09:15", date: "Tue, Oct 13 · 09:15", folder: "inbox", label: "Hiring", unread: true,
    body: ["Draft offer for Priya is in the hiring folder. Base is at the top of band 4, start date Nov 3, equity matches what we told her on the call.", "Can you read it before 2pm? I'd like to send it today while she's still choosing between us and the other offer."],
  },
  {
    id: "m3", from: "Priya Raman", email: "priya.raman@fieldmail.net", subject: "Type specimen for the new wordmark", time: "08:03", date: "Tue, Oct 13 · 08:03", folder: "inbox", label: "Design", unread: true,
    body: ["Three directions for the wordmark, set at 12, 48 and 160 px so you can see where each one breaks. My pick is B: the narrower counters hold up on the tiny app icon.", "Happy to walk through it on a call. Wednesday afternoon works."],
    attachment: { name: "wordmark-specimen.pdf", size: "1.9 MB" },
  },
  {
    id: "m4", from: "Ferrymill Status", email: "status@ferrymill.io", subject: "Resolved: elevated 502s in eu-west", time: "Yesterday", date: "Mon, Oct 12 · 22:17", folder: "inbox", label: "Ops",
    body: ["Between 21:02 and 21:48 UTC about 3.1% of requests to eu-west returned 502. A bad load balancer config was rolled back at 21:44.", "No data was lost. A full write-up follows within 48 hours."],
  },
  {
    id: "m5", from: "Jonas Weber", email: "jonas@halyard.co", subject: "Re: Thursday's offsite, room change", time: "Yesterday", date: "Mon, Oct 12 · 16:40", folder: "inbox", starred: true,
    body: ["We lost the big room, so we're in the library on the 4th floor. Same time, 10:00. I'll bring the projector adapter this time."],
  },
  {
    id: "m6", from: "Ana Costa", email: "ana@lumenprint.pt", subject: "Invoice INV-2207 is 14 days overdue", time: "Oct 10", date: "Sat, Oct 10 · 11:05", folder: "inbox", label: "Billing",
    body: ["Friendly nudge on INV-2207 for the trade show banners, €1,840.00, due Sep 26. If it's already been paid, send me the remittance and I'll chase our bank."],
  },
  {
    id: "m7", from: "Theo Marsh", email: "theo@halyard.co", subject: "Portfolio review notes", time: "Oct 9", date: "Fri, Oct 9 · 17:22", folder: "inbox", label: "Hiring", starred: true,
    body: ["Notes from today's three reviews are in the doc. Short version: strong yes on Priya, maybe on Callum, no on the third."],
  },
  {
    id: "m8", from: "Kai Nakamura", email: "kai@halyard.co", subject: "Pager handoff for the weekend", time: "Oct 8", date: "Thu, Oct 8 · 18:00", folder: "inbox", label: "Ops",
    body: ["I'm on call Saturday and Sunday. Two open alerts, both noisy, both muted until Monday. Runbook link is pinned in the channel."],
  },
  {
    id: "m9", from: "Noa Brandt", email: "noa@halyard.co", subject: "Re: Hotel block for the offsite", time: "Oct 7", date: "Wed, Oct 7 · 10:12", folder: "sent",
    body: ["Confirmed for 14 rooms, two nights. The group code is HALYARD26."],
  },
  {
    id: "m10", from: "Lena Fischer", email: "lena@moss.agency", subject: "Moodboard round two", time: "Oct 2", date: "Fri, Oct 2 · 14:30", folder: "archive", label: "Design",
    body: ["Round two leans warmer. Less chrome, more paper. Let me know which board to carry forward."],
  },
];

function inFolder(m: Message, folder: Folder) {
  if (folder === "starred") return m.starred && m.folder !== "trash";
  return m.folder === folder;
}

function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Tooltip content={label} side="bottom">
      <Button variant="ghost" size="icon" aria-label={label} onClick={onClick} className="size-8 rounded-lg">
        {children}
      </Button>
    </Tooltip>
  );
}

export default function AppInbox() {
  const [messages, setMessages] = React.useState(MESSAGES);
  const [folder, setFolder] = React.useState<Folder>("inbox");
  const [label, setLabel] = React.useState<Label | null>(null);
  const [filter, setFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>("m1");
  const [view, setView] = React.useState<"list" | "reader">("list");
  const [foldersOpen, setFoldersOpen] = React.useState(false);
  const [reply, setReply] = React.useState("");
  const [compose, setCompose] = React.useState<{ to: string; subject: string; body: string; error?: string } | null>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const readerRef = React.useRef<HTMLElement>(null);
  const toRef = React.useRef<HTMLInputElement>(null);
  const shownView = React.useRef(view);

  const focusList = () => {
    const list = listRef.current;
    (list?.querySelector<HTMLElement>("[data-message][aria-current]") ?? list?.querySelector<HTMLElement>("[data-message]"))?.focus({ preventScroll: true });
  };
  const focusReader = () => {
    if (!readerRef.current?.contains(document.activeElement)) readerRef.current?.focus({ preventScroll: true });
  };

  // On phones only one pane shows at a time, so focus moves with it instead of falling to the page.
  React.useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    if (!window.matchMedia("(max-width: 767.98px)").matches) return;
    if (view === "reader") focusReader();
    else focusList();
  }, [view]);

  const update = (id: string, patch: Partial<Message>) =>
    setMessages((all) => all.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const visible = messages.filter((m) => {
    const q = query.trim().toLowerCase();
    return (
      (label ? m.label === label && m.folder !== "trash" : inFolder(m, folder)) &&
      (filter === "all" || m.unread) &&
      (!q || `${m.from} ${m.subject} ${m.body.join(" ")}`.toLowerCase().includes(q))
    );
  });
  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const unreadCount = messages.filter((m) => m.folder === "inbox" && m.unread).length;
  const title = label ?? FOLDERS.find((f) => f.id === folder)?.label;

  function open(id: string) {
    setCompose(null);
    setSelectedId(id);
    update(id, { unread: false });
    setReply("");
    setView("reader");
  }

  function move(to: Folder) {
    if (!selected) return;
    const index = visible.findIndex((m) => m.id === selected.id);
    const next = visible[index + 1] ?? visible[index - 1];
    update(selected.id, { folder: to });
    setSelectedId(next && next.id !== selected.id ? next.id : null);
    if (next) update(next.id, { unread: false });
    else setView("list");
  }

  function chooseFolder(next: Folder | null, nextLabel: Label | null = null) {
    if (next) setFolder(next);
    setLabel(nextLabel);
    setFoldersOpen(false);
    setView("list");
  }

  function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    update(selected.id, { replies: [...(selected.replies ?? []), reply.trim()] });
    setReply("");
  }

  function startCompose() {
    setCompose({ to: "", subject: "", body: "" });
    setView("reader");
    if (!foldersOpen) return;
    setFoldersOpen(false);
    // The sheet hands focus back to its trigger once it has slid away; send it to the new message instead.
    window.setTimeout(() => toRef.current?.focus(), 260);
  }

  function sendCompose(event: React.FormEvent) {
    event.preventDefault();
    if (!compose) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compose.to)) {
      setCompose({ ...compose, error: "Add a valid recipient." });
      return;
    }
    const id = `m${Date.now()}`;
    const sent: Message = {
      id, from: "Noa Brandt", email: "noa@halyard.co", subject: compose.subject.trim() || "(no subject)", time: "Now", date: "Tue, Oct 13 · just now",
      folder: "sent", body: compose.body.trim() ? compose.body.trim().split(/\n{2,}/) : [""],
    };
    setMessages((all) => [sent, ...all]);
    setCompose(null);
    setFolder("sent");
    setLabel(null);
    setSelectedId(id);
    requestAnimationFrame(focusReader);
  }

  function onListKey(event: React.KeyboardEvent<HTMLUListElement>) {
    if (!["ArrowDown", "ArrowUp", "j", "k"].includes(event.key)) return;
    event.preventDefault();
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-message]") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const step = event.key === "ArrowDown" || event.key === "j" ? 1 : -1;
    buttons[Math.min(buttons.length - 1, Math.max(0, index + step))]?.focus();
  }

  const nav = (
    <nav aria-label="Mailboxes" className="grid gap-6">
      <ul className="grid gap-0.5">
        {FOLDERS.map((f) => {
          const active = !label && folder === f.id;
          const count = f.id === "inbox" ? unreadCount : messages.filter((m) => inFolder(m, f.id)).length;
          return (
            <li key={f.id}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => chooseFolder(f.id)}
                className={cn(
                  "relative flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm outline-none transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                  active ? "bg-[rgb(var(--neon)/0.1)] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white/90",
                )}
              >
                <span className={active ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.7))]" : "text-white/40"}>{f.icon}</span>
                {f.label}
                {count > 0 && (f.id === "inbox" || f.id === "drafts" || f.id === "starred") && (
                  <span className={cn("ml-auto font-mono text-[11px] tabular-nums", active ? "text-[rgb(var(--neon))]" : "text-white/55")}>{count}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div>
        <p className="px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">Labels</p>
        <ul className="mt-2 grid gap-0.5">
          {(Object.keys(LABELS) as Label[]).map((l) => (
            <li key={l}>
              <button
                type="button"
                aria-current={label === l ? "page" : undefined}
                onClick={() => chooseFolder(null, l)}
                style={neonVars(LABELS[l])}
                className={cn(
                  "flex h-8 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-[13px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                  label === l ? "bg-white/[0.06] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white/90",
                )}
              >
                <span aria-hidden className={cn("size-2 rounded-full border border-[rgb(var(--neon)/0.7)]", label === l && "bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]")} />
                {l}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  return (
    <div
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="flex h-[100svh] min-h-[600px] bg-[#05060a] text-white/90"
    >
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07080d] p-3 lg:flex">
        <div className="flex h-10 items-center gap-2 px-2">
          <Mail aria-hidden className="size-4 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.8))]" />
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Dispatch</span>
        </div>
        <Button variant="soft" className="mb-5 mt-3 w-full justify-start" onClick={startCompose}>
          <PenLine /> Compose
        </Button>
        {nav}
        <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.06] px-2 pt-3">
          <Avatar alt="Noa Brandt" size="sm" status="online" />
          <div className="min-w-0 text-xs">
            <p className="truncate text-white/85">Noa Brandt</p>
            <p className="truncate text-white/60">noa@halyard.co</p>
          </div>
        </div>
      </aside>

      <Sheet open={foldersOpen} onOpenChange={setFoldersOpen}>
        <SheetContent side="left" size="sm" className="p-4">
          <SheetTitle className="mb-5 flex items-center gap-2 text-[15px]">
            <Mail aria-hidden className="size-4 text-[rgb(var(--neon))]" /> Dispatch
          </SheetTitle>
          <Button variant="soft" className="mb-5 w-full justify-start" onClick={startCompose}>
            <PenLine /> Compose
          </Button>
          {nav}
        </SheetContent>
      </Sheet>

      <section aria-labelledby="inbox-list-title" className={cn("min-w-0 flex-col border-r border-white/[0.06] md:flex md:w-[340px] md:shrink-0 xl:w-[380px]", view === "list" ? "flex w-full" : "hidden")}>
        <div className="grid gap-3 border-b border-white/[0.06] p-3">
          <div className="flex h-10 items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Mailboxes" className="size-8 lg:hidden" onClick={() => setFoldersOpen(true)}>
              <Menu />
            </Button>
            <h2 id="inbox-list-title" className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
            <span className="font-mono text-xs text-white/55">{visible.length}</span>
            <ToggleGroup size="sm" aria-label="Show" value={filter} onValueChange={(v) => v && setFilter(v)} className="ml-auto">
              <ToggleGroupItem value="all" className="max-sm:h-8">All</ToggleGroupItem>
              <ToggleGroupItem value="unread" className="max-sm:h-8">Unread</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Input size="sm" type="search" aria-label="Search mail" placeholder="Search mail" leading={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <ul ref={listRef} onKeyDown={onListKey} aria-label={`${title} messages`} className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-color:rgb(255_255_255/0.1)_transparent] [scrollbar-width:thin]">
          {visible.map((m) => {
            const isSelected = m.id === selectedId;
            return (
              <li key={m.id} className="relative">
                <button
                  type="button"
                  data-message
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => open(m.id)}
                  className={cn(
                    "relative grid w-full cursor-pointer gap-1 rounded-xl px-3.5 py-3 text-left outline-none transition-colors duration-150",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                    isSelected ? "bg-[rgb(var(--neon)/0.08)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.18)]" : "hover:bg-white/[0.03]",
                  )}
                >
                  {isSelected && <span aria-hidden className="absolute inset-y-3 left-0 w-[2px] rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />}
                  <span className="flex items-center gap-2">
                    {m.unread && <span className="size-1.5 shrink-0 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]"><span className="sr-only">Unread, </span></span>}
                    <span className={cn("min-w-0 flex-1 truncate text-sm", m.unread ? "font-semibold text-white" : "text-white/80")}>{m.from}</span>
                    <span className="shrink-0 text-xs tabular-nums text-white/60">{m.time}</span>
                  </span>
                  <span className={cn("truncate text-[13px]", m.unread ? "text-white/90" : "text-white/75")}>{m.subject}</span>
                  <span className="line-clamp-1 pr-8 text-[13px] text-white/60">{m.body[0]}</span>
                  {(m.label || m.attachment) && (
                    <span className="mt-1 flex items-center gap-2">
                      {m.label && <Badge size="sm" color={LABELS[m.label]}>{m.label}</Badge>}
                      {m.attachment && <File aria-label="Has attachment" className="size-3.5 text-white/50" />}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  aria-label={m.starred ? `Unstar ${m.subject}` : `Star ${m.subject}`}
                  aria-pressed={!!m.starred}
                  onClick={() => update(m.id, { starred: !m.starred })}
                  className={cn(
                    "absolute bottom-1.5 right-1.5 grid size-9 cursor-pointer place-items-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] [&_svg]:size-3.5",
                    m.starred ? "text-[rgb(251_191_36)]" : "text-white/45 hover:text-white/80",
                  )}
                >
                  <Star className={m.starred ? "fill-current" : undefined} />
                </button>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="grid place-items-center gap-1 px-6 py-16 text-center">
              <p className="text-sm text-white/70">{query ? `Nothing matches “${query}”.` : filter === "unread" ? "No unread mail." : "Nothing here."}</p>
              <p className="text-xs text-white/60">{query ? "Try another folder or search." : filter === "unread" ? "You're caught up." : folder === "inbox" ? "Inbox zero. Go outside." : "Nothing filed here yet."}</p>
            </li>
          )}
        </ul>
      </section>

      <section ref={readerRef} tabIndex={-1} aria-label="Message" className={cn("min-w-0 flex-1 flex-col outline-none md:flex", view === "reader" ? "flex" : "hidden")}>
        {compose ? (
          <form onSubmit={sendCompose} className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-[65px] shrink-0 items-center gap-2 border-b border-white/[0.06] px-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setCompose(null); setView("list"); requestAnimationFrame(focusList); }}>
                <ArrowLeft /> Discard
              </Button>
              <h3 className="text-sm text-white/60">New message</h3>
              <Button type="submit" size="sm" variant="solid" className="ml-auto">
                <Send /> Send
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto grid w-full max-w-[680px] gap-4 px-5 py-8 sm:px-8">
                <Input ref={toRef} label="To" type="email" placeholder="name@company.com" autoFocus value={compose.to} error={compose.error} onChange={(e) => setCompose({ ...compose, to: e.target.value, error: undefined })} />
                <Input label="Subject" value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} />
                <Textarea label="Message" minRows={8} value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} />
              </div>
            </div>
          </form>
        ) : selected ? (
          <>
            <div className="flex h-[65px] shrink-0 items-center gap-1 border-b border-white/[0.06] px-3">
              <Button variant="ghost" size="sm" className="mr-auto md:hidden" onClick={() => setView("list")}>
                <ArrowLeft /> {title}
              </Button>
              <IconButton label="Archive" onClick={() => move("archive")}><Archive /></IconButton>
              <IconButton label="Snooze until tomorrow" onClick={() => move("snoozed")}><Clock /></IconButton>
              <IconButton label="Mark as unread" onClick={() => { update(selected.id, { unread: true }); setView("list"); }}><MailOpen /></IconButton>
              <IconButton label="Delete" onClick={() => move("trash")}><Trash2 /></IconButton>
              <span className="ml-auto hidden font-mono text-[11px] text-white/55 md:inline">{selected.date}</span>
            </div>
            <article className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:rgb(255_255_255/0.1)_transparent] [scrollbar-width:thin]">
              <div className="mx-auto max-w-[680px] px-5 py-8 sm:px-8">
                <div className="flex flex-wrap items-center gap-2">
                  {selected.label && <Badge size="sm" color={LABELS[selected.label]}>{selected.label}</Badge>}
                  <Badge size="sm" variant="soft" color="white">{FOLDERS.find((f) => f.id === selected.folder)?.label}</Badge>
                </div>
                <h3 className="mt-4 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[30px]">{selected.subject}</h3>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar alt={selected.from} size="md" />
                  <div className="min-w-0 text-sm">
                    <p className="truncate text-white/90">{selected.from} <span className="text-white/60">&lt;{selected.email}&gt;</span></p>
                    <p className="truncate text-xs text-white/60">to Noa Brandt<span className="md:hidden"> · {selected.date}</span></p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 text-[15px] leading-7 text-white/75">
                  {selected.body.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {selected.attachment && (
                  <a href="#attachment" onClick={(e) => e.preventDefault()} className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-3 pr-4 outline-none transition-colors hover:border-[rgb(var(--neon)/0.4)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                    <span className="grid size-8 place-items-center rounded-lg bg-[rgb(var(--neon)/0.1)] font-mono text-[9px] font-semibold text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)]">PDF</span>
                    <span className="text-sm">
                      <span className="block text-white/85">{selected.attachment.name}</span>
                      <span className="block text-xs text-white/60">{selected.attachment.size}</span>
                    </span>
                  </a>
                )}
                {selected.replies?.map((r, i) => (
                  <div key={i} className="mt-8 border-t border-white/[0.06] pt-6">
                    <p className="flex items-center gap-2 text-xs text-white/60">
                      <Avatar alt="" fallback="NB" size="sm" className="size-6 text-[9px]" /> You replied · just now
                    </p>
                    <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-white/75">{r}</p>
                  </div>
                ))}
                <form onSubmit={sendReply} className="mt-10 grid gap-3">
                  <Textarea
                    aria-label={`Reply to ${selected.from}`}
                    placeholder={`Reply to ${selected.from.split(" ")[0]}…`}
                    minRows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply(e);
                    }}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-white/60">⌘ Enter to send</p>
                    <Button type="submit" size="sm" variant="solid" disabled={!reply.trim()}>
                      <Send /> Send
                    </Button>
                  </div>
                </form>
              </div>
            </article>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <Mail aria-hidden className="mx-auto size-6 text-white/20" />
              <p className="mt-3 text-sm text-white/60">No message selected.</p>
              <p className="mt-1 text-xs text-white/60">Use ↑ and ↓ in the list, Enter to open.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
