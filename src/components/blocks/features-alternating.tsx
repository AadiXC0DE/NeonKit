"use client";

import * as React from "react";
import { BellRing, Download, FilePlus2 } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const INVOICES = [
  { id: "INV-1049", client: "Odd Hours Studio", amount: "$12,400.00", status: "Overdue", note: "Due Oct 7 · reminder 2 of 3 goes out Thursday" },
  { id: "INV-1051", client: "Fernhill Records", amount: "$1,250.00", status: "Open", note: "Due Nov 14 · viewed twice by finance@fernhill" },
  { id: "INV-1052", client: "Marlow & Pike", amount: "$2,975.50", status: "Open", note: "Due Nov 7 · net 30" },
  { id: "INV-1048", client: "Fernhill Records", amount: "$4,800.00", status: "Paid", note: "Paid Oct 9 by ACH · matched automatically" },
  { id: "INV-1053", client: "Northpaw Games", amount: "$8,000.00", status: "Draft", note: "Milestone 2 of 4 · not sent yet" },
  { id: "INV-1046", client: "Saltmarsh Type Foundry", amount: "$680.00", status: "Paid", note: "Paid Sep 30 by card · fee $20.02" },
] as const;

const ACTIONS = [
  { label: "New invoice", icon: <FilePlus2 />, result: "Draft INV-1054 created" },
  { label: "Remind overdue clients", icon: <BellRing />, result: "1 reminder queued for Odd Hours Studio" },
  { label: "Export Q3 for your accountant", icon: <Download />, result: "ledgerline-q3-2026.csv is ready" },
];

const STATUS = {
  Paid: { color: "green" },
  Open: { color: "white" },
  Overdue: { color: "red" },
  Draft: { color: "white" },
} as const;

// Due dates in November 2026. Days are matched by the calendar's data-day attribute.
const DUE: Record<string, { client: string; amount: string; ref: string }[]> = {
  "2026-11-03": [{ client: "Kettle Pictures", amount: "$3,420.00", ref: "INV-1047" }],
  "2026-11-07": [{ client: "Marlow & Pike", amount: "$2,975.50", ref: "INV-1052" }],
  "2026-11-14": [
    { client: "Fernhill Records", amount: "$1,250.00", ref: "INV-1051" },
    { client: "Saltmarsh Type Foundry", amount: "$940.00", ref: "INV-1055" },
  ],
  "2026-11-21": [{ client: "Northpaw Games", amount: "$8,000.00", ref: "INV-1053" }],
  "2026-11-28": [{ client: "Odd Hours Studio", amount: "$6,200.00", ref: "INV-1050" }],
};
const MONTH = new Date(2026, 10, 1);

const TRANSACTIONS = [
  { id: "t1", date: "Oct 09", memo: "ACH FERNHILL RECORDS LLC", match: "INV-1048", amount: 4800, matched: true },
  { id: "t2", date: "Oct 08", memo: "STRIPE PAYOUT 8H2KQ", match: "3 invoices", amount: 2140.36, matched: true },
  { id: "t3", date: "Oct 08", memo: "CANAL ST STUDIOS RENT", match: "Rent", amount: -3600, matched: true },
  { id: "t4", date: "Oct 07", memo: "GEARHOUSE RENTALS 5124", match: "Equipment", amount: -1318.4, matched: false },
  { id: "t5", date: "Oct 06", memo: "FIGTREE SOFTWARE ANNUAL", match: "Software", amount: -588, matched: false },
  { id: "t6", date: "Oct 06", memo: "CITY CAB 0291", match: "Travel", amount: -42.18, matched: false },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const formatAmount = (n: number) => (n < 0 ? `−${money.format(-n)}` : `+${money.format(n)}`);
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const longDay = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" });

// Marks due days on the calendar without touching its internals.
const dueCss = `
${Object.keys(DUE).map((d) => `.nk-features-alternating-cal [data-day="${d}"]`).join(",")} {
  box-shadow: inset 0 0 0 1px rgb(var(--neon) / 0.35);
}
${Object.keys(DUE).map((d) => `.nk-features-alternating-cal [data-day="${d}"]:not([data-selected])::after`).join(",")} {
  content: ""; position: absolute; bottom: 5px; left: 50%; width: 10px; height: 2px; border-radius: 2px;
  transform: translateX(-50%); background: rgb(var(--neon)); box-shadow: 0 0 6px rgb(var(--neon));
}
`;

function Mark({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query.trim().toLowerCase()) : -1;
  if (at < 0 || !query.trim()) return <>{text}</>;
  const end = at + query.trim().length;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]">{text.slice(at, end)}</span>
      {text.slice(end)}
    </>
  );
}

function Specs({ specs, className }: { specs: [string, string][]; className?: string }) {
  return (
    <dl className={cn("border-b border-white/[0.07]", className)}>
      {specs.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-6 border-t border-white/[0.07] py-3">
          <dt className="text-[14px] text-white/55">{k}</dt>
          <dd className="text-right text-[14px] text-white/85">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const rowTitle =
  "text-balance text-[clamp(1.85rem,3.4vw,2.75rem)] font-[620] leading-[0.98] tracking-[-0.035em] text-white [font-stretch:112%]";

function Row({
  slug,
  title,
  body,
  specs,
  layout,
  children,
}: {
  slug: string;
  title: string;
  body: string;
  specs: [string, string][];
  layout: "left" | "right" | "stacked";
  children: React.ReactNode;
}) {
  const id = `features-alternating-${slug}`;

  // The third row breaks the zigzag: copy runs across the top and the table gets the full width.
  if (layout === "stacked") {
    return (
      <div className="border-t border-white/[0.07] py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
          <h3 id={id} className={cn(rowTitle, "lg:col-span-5")}>
            {title}
          </h3>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-[52ch] text-[17px] leading-[1.6] text-white/60">{body}</p>
            <Specs specs={specs} className="mt-8" />
          </div>
        </div>
        <div aria-labelledby={id} role="group" className="mt-12 min-w-0 lg:mt-16">
          {children}
        </div>
      </div>
    );
  }

  const flip = layout === "right";
  return (
    <div className="grid gap-10 border-t border-white/[0.07] py-16 lg:grid-cols-12 lg:gap-x-12 lg:py-20">
      <div className={cn("lg:row-start-1 lg:col-span-4", flip ? "lg:col-start-9 lg:self-end" : "lg:col-start-1 lg:pt-2")}>
        <h3 id={id} className={rowTitle}>
          {title}
        </h3>
        <p className="mt-5 max-w-[44ch] text-[16px] leading-[1.6] text-white/60">{body}</p>
        <Specs specs={specs} className="mt-8" />
      </div>
      <div aria-labelledby={id} role="group" className={cn("min-w-0 lg:row-start-1 lg:col-span-8", flip ? "lg:col-start-1" : "lg:col-start-5")}>
        {children}
      </div>
    </div>
  );
}

function Stage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative", className)}>{children}</div>;
}

function InvoiceSearch() {
  const [search, setSearch] = React.useState("");
  const [active, setActive] = React.useState<string>(INVOICES[0].id);
  const [result, setResult] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const invoice = INVOICES.find((i) => i.id === active.split(" ")[0]);

  return (
    <Stage>
      <Command
        label="Search invoices"
        onValueChange={setActive}
        className="shadow-none"
      >
        <CommandInput
          ref={inputRef}
          placeholder="Search invoices, clients, amounts…"
          value={search}
          onValueChange={(v) => {
            setSearch(v);
            setResult(null);
          }}
        />
        <CommandList className="h-[248px] max-h-none">
          <CommandEmpty>No invoice matches that. Try a client or an amount.</CommandEmpty>
          <CommandGroup heading="Invoices">
            {INVOICES.map((inv) => (
              <CommandItem
                key={inv.id}
                value={`${inv.id} ${inv.client}`}
                keywords={[inv.amount.replace(/[$,]/g, ""), inv.status.toLowerCase()]}
                onSelect={() => setResult(`Opened ${inv.id} for ${inv.client}`)}
              >
                <span className="flex items-center gap-3">
                  <span className="w-[4.25rem] shrink-0 font-mono text-xs text-white/60">
                    <Mark text={inv.id} query={search} />
                  </span>
                  <span className="truncate">
                    <Mark text={inv.client} query={search} />
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-white/55">{inv.amount}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            {ACTIONS.map((a) => (
              <CommandItem key={a.label} value={a.label} icon={a.icon} onSelect={() => setResult(a.result)}>
                {a.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="flex min-h-12 items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2.5 text-xs">
          {invoice ? (
            <>
              <span className="min-w-0 truncate text-white/55">{invoice.note}</span>
              <Badge size="sm" variant="soft" color={STATUS[invoice.status].color} className="shrink-0">
                {invoice.status}
              </Badge>
            </>
          ) : (
            <span className="text-white/60">Enter to run</span>
          )}
        </div>
      </Command>
      <p aria-live="polite" className="flex h-12 items-center gap-2 pt-3 text-[13px] text-white/60 sm:h-11">
        {result ? (
          <>
            <span aria-hidden className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" />
            {result}
          </>
        ) : (
          <>
            Try
            {["fernhill", "12400", "overdue"].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setSearch(q);
                  inputRef.current?.focus();
                }}
                className="inline-flex h-8 cursor-pointer items-center rounded-md border border-white/10 px-2 font-mono text-[12px] text-white/65 sm:h-7 outline-none transition-colors hover:border-[rgb(var(--neon)/0.5)] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                {q}
              </button>
            ))}
          </>
        )}
      </p>
    </Stage>
  );
}

function DueCalendar() {
  const [day, setDay] = React.useState<Date>(() => new Date(2026, 10, 14));
  const due = DUE[dayKey(day)] ?? [];

  return (
    <Stage>
      <style>{dueCss}</style>
      <div className="grid overflow-hidden rounded-xl border border-white/10 bg-[#0a0b11] sm:grid-cols-[auto_1fr]">
        <div className="flex justify-center border-b border-white/[0.06] p-3 sm:border-b-0 sm:border-r">
          <Calendar
            className="nk-features-alternating-cal"
            selected={day}
            onSelect={setDay}
            defaultMonth={MONTH}
            weekStartsOn={1}
          />
        </div>
        <div className="flex min-w-0 flex-col p-5">
          <p className="text-[13px] text-white/55">Due on</p>
          <p className="mt-1 text-lg font-medium tracking-[-0.01em] text-white">{longDay.format(day)}</p>
          <ul aria-live="polite" className="mt-4 flex-1 space-y-2">
            {due.length ? (
              due.map((d) => (
                <li key={d.ref} className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm text-white/85">{d.client}</span>
                    <span className="shrink-0 font-mono text-[13px] tabular-nums text-white/85">{d.amount}</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-white/55">{d.ref} · reminder 3 days before</div>
                </li>
              ))
            ) : (
              <li className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-sm text-white/60">
                Nothing due. A good day to send invoices.
              </li>
            )}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-white/[0.06] pt-3">
            <span className="text-[13px] text-white/55">Due in November</span>
            <span className="font-mono text-sm tabular-nums text-[rgb(var(--neon))]">$22,785.50</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}

function BankFeed() {
  const [rows, setRows] = React.useState(TRANSACTIONS);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(["t4", "t5"]));
  const open = rows.filter((r) => !r.matched);
  const allOpen = open.length > 0 && open.every((r) => selected.has(r.id));

  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  function reconcile() {
    setRows((r) => r.map((row) => (selected.has(row.id) ? { ...row, matched: true } : row)));
    setSelected(new Set());
  }

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-white/90">Northline Credit Union ··4410</p>
          <p className="mt-0.5 text-[13px] text-white/55">
            {rows.length - open.length} of {rows.length} reconciled, synced 4 min ago
          </p>
        </div>
        <Button size="sm" variant={selected.size ? "solid" : "outline"} disabled={!selected.size} onClick={reconcile}>
          {selected.size ? `Reconcile ${selected.size}` : open.length ? "Select to reconcile" : "All reconciled"}
        </Button>
      </div>
      <Table containerClassName="bg-[#0a0b11] overscroll-x-contain" className="min-w-[560px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                size="sm"
                aria-label="Select all unreconciled"
                checked={allOpen}
                indeterminate={!allOpen && selected.size > 0}
                disabled={!open.length}
                onCheckedChange={(on) => setSelected(on ? new Set(open.map((r) => r.id)) : new Set())}
              />
            </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} selected={selected.has(row.id)}>
              <TableCell>
                <Checkbox
                  size="sm"
                  aria-label={`Select ${row.memo}`}
                  checked={selected.has(row.id)}
                  disabled={row.matched}
                  onCheckedChange={(on) => toggle(row.id, on)}
                />
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs text-white/60">{row.date}</TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs text-white/80">{row.memo}</TableCell>
              <TableCell className="whitespace-nowrap">
                {row.matched ? (
                  <span className="text-white/70">{row.match}</span>
                ) : (
                  <Badge size="sm" variant="outline" color="amber">
                    {row.match}?
                  </Badge>
                )}
              </TableCell>
              <TableCell
                align="right"
                className={cn("whitespace-nowrap font-mono text-xs", row.amount > 0 ? "text-[rgb(var(--neon))]" : "text-white/75")}
              >
                {formatAmount(row.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stage>
  );
}

export default function FeaturesAlternating() {
  return (
    <section
      aria-labelledby="features-alternating-title"
      // Change the color here; everything inside follows it.
      style={neonVars("green")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 pt-20 text-white/90 sm:px-10 sm:pt-24 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="grid gap-8 pb-14 lg:grid-cols-12 lg:items-end lg:pb-20">
          <h2
            id="features-alternating-title"
            className="text-[clamp(2.4rem,5.4vw,4.25rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%] lg:col-span-8"
          >
            The books, kept while you do the actual work.
          </h2>
          <p className="max-w-[38ch] text-[17px] leading-[1.6] text-white/90 lg:col-span-4 lg:pb-2">
            Ledgerline does the bookkeeping for studios of 2 to 40.{" "}
            <span className="text-white/50">Invoices, reminders and the bank feed, in one place.</span>
          </p>
        </header>

        <Row
          slug="find"
          layout="left"
          title="Every invoice, two keystrokes away."
          body="Press ⌘K anywhere in Ledgerline and type what you remember: a client, an amount, a word from the memo. Arrow through results; the status follows you."
          specs={[
            ["Searches", "Invoices, clients, memos"],
            ["History", "Six years, 41,200 documents"],
            ["Median lookup", "38 ms"],
          ]}
        >
          <InvoiceSearch />
        </Row>

        <Row
          slug="get-paid"
          layout="right"
          title="Due dates you can actually see."
          body="Every open invoice lands on one calendar. Clients get a polite nudge three days before, on the day, and a week after, written in your voice, sent from your address."
          specs={[
            ["Reminders", "−3, 0 and +7 days"],
            ["Clients pay by", "ACH, card or wire"],
            ["Late fees", "Optional, never by default"],
          ]}
        >
          <DueCalendar />
        </Row>

        <Row
          slug="reconcile"
          layout="stacked"
          title="Close the month on a Tuesday afternoon."
          body="Bank lines match themselves to invoices and receipts. What's left is a short list you tick through, not a spreadsheet you dread."
          specs={[
            ["Matched automatically", "94% of lines"],
            ["Month-end close", "About 20 minutes"],
            ["Your accountant", "Gets read-only access, free"],
          ]}
        >
          <BankFeed />
        </Row>
      </div>
    </section>
  );
}
