"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChartLine,
  Download,
  Filter,
  Keyboard,
  LayoutGrid,
  LogOut,
  Plug,
  Search,
  Settings,
  UserRound,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlowChart, Sparkline } from "@/components/ui/glow-chart";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;
const TODAY = Date.UTC(2026, 9, 12);

const NAV = [
  { id: "overview", label: "Overview", icon: <LayoutGrid /> },
  { id: "revenue", label: "Revenue", icon: <Wallet /> },
  { id: "accounts", label: "Accounts", icon: <UsersRound />, badge: 12 },
  { id: "cohorts", label: "Cohorts", icon: <ChartLine /> },
  { id: "reports", label: "Reports", icon: <BookOpen /> },
];

const RANGES = {
  "7d": { days: 7, label: "7 days", nrr: [112.4, 0.3], churn: [0.5, -0.1], losses: [610, 980] },
  "30d": { days: 30, label: "30 days", nrr: [111.8, 1.2], churn: [1.9, -0.4], losses: [2310, 3920] },
  "90d": { days: 90, label: "90 days", nrr: [109.6, 2.8], churn: [5.6, -0.9], losses: [7180, 11240] },
} as const;

type Range = keyof typeof RANGES;
type Status = "Active" | "Trial" | "Past due";

const ACCOUNTS: { name: string; domain: string; plan: string; status: Status; seats: number; mrr: number; since: string }[] = [
  { name: "Ostra Health", domain: "ostra.health", plan: "Scale", status: "Active", seats: 120, mrr: 6900, since: "Feb 2024" },
  { name: "Northwind Freight", domain: "northwind.io", plan: "Scale", status: "Active", seats: 64, mrr: 4200, since: "Mar 2024" },
  { name: "Tessellate", domain: "tessellate.app", plan: "Scale", status: "Active", seats: 48, mrr: 3450, since: "Jul 2025" },
  { name: "Halden Labs", domain: "haldenlabs.com", plan: "Growth", status: "Active", seats: 18, mrr: 1180, since: "Sep 2025" },
  { name: "Quillfeather", domain: "quillfeather.co", plan: "Growth", status: "Active", seats: 15, mrr: 1020, since: "Aug 2026" },
  { name: "Marrow & Finch", domain: "marrowfinch.com", plan: "Growth", status: "Past due", seats: 12, mrr: 860, since: "Jan 2025" },
  { name: "Pellucid", domain: "pellucid.dev", plan: "Starter", status: "Trial", seats: 5, mrr: 290, since: "Oct 2026" },
  { name: "Brightwater", domain: "brightwater.coop", plan: "Starter", status: "Trial", seats: 4, mrr: 240, since: "Oct 2026" },
];

function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// 180 days of MRR and paying accounts, seeded so server and client agree.
const HISTORY = (() => {
  const random = seeded(42);
  const mrr: number[] = [];
  const accounts: number[] = [];
  let m = 147_600;
  let a = 1012;
  for (let i = 0; i < 180; i++) {
    m += 210 + (random() - 0.45) * 820 + (i === 163 ? 1900 : 0);
    a += 1.5 + (random() - 0.4) * 3;
    mrr.push(Math.round(m));
    accounts.push(Math.round(a));
  }
  return { mrr, accounts };
})();

const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const pct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}%`;

function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  const good = invert ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium tabular-nums", good ? "text-[rgb(52_211_153)]" : "text-[rgb(255_77_94)]")}>
      <Icon aria-hidden className="size-3.5" />
      {pct(value)}
    </span>
  );
}

function Brand() {
  const { collapsed } = useSidebar();
  return (
    <a href="#overview" className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
      <svg aria-hidden viewBox="0 0 28 28" className="size-7 shrink-0">
        <rect x="0.5" y="0.5" width="27" height="27" rx="8" fill="rgb(var(--neon) / 0.08)" stroke="rgb(var(--neon) / 0.35)" />
        <path d="M8 9.5 14 19l6-9.5" fill="none" stroke="rgb(var(--neon))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 3px rgb(var(--neon) / 0.8))" }} />
      </svg>
      <span className={cn("grid min-w-0 transition-opacity duration-200", collapsed && "md:opacity-0")}>
        <span className="truncate text-sm font-semibold tracking-[-0.01em] text-white/90">Vantage</span>
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">Fernhill Inc.</span>
      </span>
    </a>
  );
}

function SeatUsage() {
  const { collapsed } = useSidebar();
  return (
    <div className={cn("grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-opacity duration-200", collapsed && "md:pointer-events-none md:opacity-0")}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-white/70">Growth plan</span>
        <span className="tabular-nums text-white/45">8 / 10 seats</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-4/5 rounded-full bg-[rgb(var(--neon)/0.7)]" />
      </div>
      <a href="#billing" className="w-fit text-xs text-white/45 underline-offset-4 outline-none hover:text-white/80 hover:underline focus-visible:text-white/90 focus-visible:underline">
        Manage billing
      </a>
    </div>
  );
}

export default function AppDashboard() {
  const [page, setPage] = React.useState("overview");
  const [range, setRange] = React.useState<Range>("30d");
  const [active, setActive] = React.useState<number | null>(null);
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [sort, setSort] = React.useState<{ key: "mrr" | "seats"; dir: "asc" | "desc" }>({ key: "mrr", dir: "desc" });
  const [unread, setUnread] = React.useState(true);
  const [exportState, setExportState] = React.useState<"idle" | "busy" | "done">("idle");
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const r = RANGES[range];
  const data = React.useMemo(() => {
    const { mrr, accounts } = HISTORY;
    const end = mrr.length;
    const current = mrr.slice(end - r.days);
    const previous = mrr.slice(end - 2 * r.days, end - r.days);
    const dates = current.map((_, i) => new Date(TODAY - (r.days - 1 - i) * DAY));
    const net = current[current.length - 1] - mrr[end - r.days - 1];
    const [contraction, churned] = r.losses;
    const gains = net + contraction + churned;
    const fresh = Math.round(gains * 0.58);
    const step = Math.max(1, Math.floor(r.days / 10));
    const spark = (list: number[]) => list.slice(end - r.days).filter((_, i) => i % step === 0);
    return {
      series: [
        { name: "MRR", data: dates.map((x, i) => ({ x, y: current[i] })) },
        { name: `Previous ${r.label}`, data: dates.map((x, i) => ({ x, y: previous[i] })), type: "line" as const, muted: true },
      ],
      domain: [Math.floor((Math.min(...previous) * 0.985) / 5000) * 5000, Math.ceil((current[current.length - 1] * 1.01) / 5000) * 5000] as [number, number],
      mrr: current[current.length - 1],
      mrrDelta: (net / mrr[end - r.days - 1]) * 100,
      accounts: accounts[end - 1],
      accountsDelta: ((accounts[end - 1] - accounts[end - r.days - 1]) / accounts[end - r.days - 1]) * 100,
      sparkMrr: spark(mrr),
      sparkAccounts: spark(accounts),
      movement: [
        { label: "New business", value: fresh },
        { label: "Expansion", value: gains - fresh },
        { label: "Contraction", value: -contraction },
        { label: "Churned", value: -churned },
      ],
      net,
      quickRatio: gains / (contraction + churned),
      expansionShare: Math.round(((gains - fresh) / gains) * 100),
    };
  }, [r]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ACCOUNTS.filter((a) => !q || `${a.name} ${a.domain} ${a.plan} ${a.status}`.toLowerCase().includes(q)).sort(
      (a, b) => (a[sort.key] - b[sort.key]) * (sort.dir === "asc" ? 1 : -1),
    );
  }, [query, sort]);

  const toggleSort = (key: "mrr" | "seats") =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  function exportCsv() {
    setExportState("busy");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setExportState("done");
      timer.current = window.setTimeout(() => setExportState("idle"), 1800);
    }, 900);
  }

  const point = active !== null ? data.series[0].data[active] : null;
  const maxMove = Math.max(...data.movement.map((m) => Math.abs(m.value)));
  const title = NAV.find((n) => n.id === page)?.label ?? "Overview";

  const kpis = [
    { label: "MRR", value: money(data.mrr), delta: data.mrrDelta, spark: data.sparkMrr },
    { label: "Paying accounts", value: data.accounts.toLocaleString("en-US"), delta: data.accountsDelta, spark: data.sparkAccounts },
    { label: "Net revenue retention", value: `${r.nrr[0].toFixed(1)}%`, delta: r.nrr[1], spark: [104, 106, 105, 107, 108, 108, 110, 109, 111, r.nrr[0]] },
    { label: "Logo churn", value: `${r.churn[0].toFixed(1)}%`, delta: r.churn[1], invert: true, spark: [2.6, 2.4, 2.5, 2.3, 2.2, 2.3, 2.1, 2.0, 2.1, 1.9].map((v) => (v * r.churn[0]) / 1.9) },
  ];

  const search = (autoFocus = false) => (
    <Input
      autoFocus={autoFocus}
      size="sm"
      type="search"
      aria-label="Search accounts"
      placeholder="Search accounts"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      leading={<Search />}
      containerClassName="w-full"
    />
  );

  return (
    <SidebarProvider
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="min-h-[100svh] bg-[#05060a] text-white/90"
    >
      <Sidebar aria-label="Vantage">
        <SidebarHeader className="px-2 pt-3">
          <Brand />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {NAV.map((item) => (
              <SidebarItem key={item.id} href={`#${item.id}`} icon={item.icon} badge={item.badge} active={page === item.id} onClick={(e) => { e.preventDefault(); setPage(item.id); }}>
                {item.label}
              </SidebarItem>
            ))}
          </SidebarGroup>
          <SidebarGroup label="Workspace">
            <SidebarItem href="#integrations" icon={<Plug />} active={page === "integrations"} onClick={(e) => { e.preventDefault(); setPage("integrations"); }}>
              Integrations
            </SidebarItem>
            <SidebarItem href="#settings" icon={<Settings />} active={page === "settings"} onClick={(e) => { e.preventDefault(); setPage("settings"); }}>
              Settings
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <SeatUsage />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-white/[0.06] bg-[#05060a]/90 px-3 backdrop-blur-[10px] sm:px-4">
          {searchOpen ? (
            <>
              <div className="flex-1">{search(true)}</div>
              <Button variant="ghost" size="icon" aria-label="Close search" className="size-8" onClick={() => setSearchOpen(false)}>
                <X />
              </Button>
            </>
          ) : (
            <>
              <SidebarTrigger />
              <span aria-hidden className="h-4 w-px bg-white/10" />
              <p className="min-w-0 truncate px-1 text-sm">
                <span className="hidden text-white/40 sm:inline">Fernhill / </span>
                <span className="text-white/85">{title}</span>
              </p>
              <div className="ml-auto hidden w-48 sm:block lg:w-64">{search()}</div>
              <Button variant="ghost" size="icon" aria-label="Search accounts" className="ml-auto size-8 sm:hidden" onClick={() => setSearchOpen(true)}>
                <Search />
              </Button>
              <Button variant="ghost" size="icon" aria-label={unread ? "Notifications, 3 unread" : "Notifications"} className="relative size-8" onClick={() => setUnread(false)}>
                <Bell />
                {unread && <span aria-hidden className="absolute right-2 top-2 size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Account menu" className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]">
                    <Avatar alt="Ines Ortega" size="sm" status="online" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="block text-sm text-white/90">Ines Ortega</span>
                    <span className="block text-xs font-normal text-white/45">ines@fernhill.co</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon={<UserRound />}>Profile</DropdownMenuItem>
                  <DropdownMenuItem icon={<Wallet />}>Billing</DropdownMenuItem>
                  <DropdownMenuItem icon={<Keyboard />} shortcut="?">Shortcuts</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon={<LogOut />} variant="danger">Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-7 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
                Billing synced 3 min ago
              </p>
              <h1 className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.035em] text-white sm:text-[40px]">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup size="sm" aria-label="Date range" value={range} onValueChange={(v) => { if (!v) return; setActive(null); setRange(v as Range); }}>
                <ToggleGroupItem value="7d">7D</ToggleGroupItem>
                <ToggleGroupItem value="30d">30D</ToggleGroupItem>
                <ToggleGroupItem value="90d">90D</ToggleGroupItem>
              </ToggleGroup>
              <Button variant="ghost" size="sm" loading={exportState === "busy"} onClick={exportCsv} className="border border-white/10">
                {exportState === "done" ? <Check /> : exportState === "idle" ? <Download /> : null}
                {exportState === "done" ? "Exported" : "Export"}
              </Button>
            </div>
          </div>

          <dl className="mt-7 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] lg:grid-cols-4">
            {kpis.map((kpi, i) => (
              <div key={kpi.label} className={cn("p-4 sm:p-5", i % 2 === 1 && "border-l border-white/[0.06]", i > 1 && "border-t border-white/[0.06] lg:border-t-0", i === 2 && "lg:border-l")}>
                <dt className="flex items-center justify-between gap-3 text-xs text-white/55">
                  <span className="truncate">{kpi.label}</span>
                  <Sparkline data={kpi.spark} width={64} height={22} dot={false} color={kpi.invert ? "white" : undefined} label={`${kpi.label}, last ${r.label}`} className="hidden shrink-0 opacity-80 sm:block" />
                </dt>
                <dd className="mt-3">
                  <p className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums sm:text-[28px]">{kpi.value}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                    <Delta value={kpi.delta} invert={kpi.invert} />
                    <span className="hidden sm:inline">vs prior {r.label}</span>
                  </p>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section aria-labelledby="mrr-title" className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
              <div aria-hidden className="pointer-events-none absolute -top-24 left-1/3 h-48 w-2/3 rounded-full bg-[rgb(var(--neon)/0.07)] blur-[60px]" />
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="mrr-title" className="text-sm text-white/55">Monthly recurring revenue</h2>
                  <p className="mt-1.5 text-[28px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">{money(point ? (point.y ?? 0) : data.mrr)}</p>
                  <p className="mt-2 text-xs text-white/45">
                    {point ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }).format(point.x as Date) : `Last ${r.label}, against the ${r.label} before`}
                  </p>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
                  <span className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-3 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" />Current</span>
                  <span className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-3 rounded-full bg-white/30" />Prior</span>
                </div>
              </div>
              <GlowChart
                key={range}
                className="relative mt-5"
                data={data.series}
                legend={false}
                yDomain={data.domain}
                height={250}
                label={`MRR per day, last ${r.label}`}
                yFormat={(v, ctx) => (ctx === "axis" ? `$${Math.round(v / 1000)}k` : money(v))}
                onActiveIndexChange={setActive}
              />
            </section>

            <section aria-labelledby="movement-title" className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
              <h2 id="movement-title" className="text-sm text-white/55">MRR movement</h2>
              <p className="mt-1.5 text-[28px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">
                {data.net >= 0 ? "+" : ""}{money(data.net)}
              </p>
              <p className="mt-2 text-xs text-white/45">Net change, last {r.label}</p>
              <ul className="mt-7 grid gap-4">
                {data.movement.map((m) => (
                  <li key={m.label} className="grid gap-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-white/65">{m.label}</span>
                      <span className={cn("font-mono tabular-nums", m.value >= 0 ? "text-white/85" : "text-white/45")}>
                        {m.value >= 0 ? "+" : ""}{money(m.value)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                          m.value >= 0 ? "bg-[rgb(var(--neon)/0.75)]" : "bg-white/20",
                        )}
                        style={{ width: `${(Math.abs(m.value) / maxMove) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-4 text-xs [&_dd]:mt-1 [&_dd]:font-mono [&_dd]:text-sm [&_dd]:text-white/85 [&_dt]:text-white/45 max-lg:mt-6">
                <div>
                  <dt>Quick ratio</dt>
                  <dd>{data.quickRatio.toFixed(1)}</dd>
                </div>
                <div>
                  <dt>Expansion share</dt>
                  <dd>{data.expansionShare}%</dd>
                </div>
              </dl>
            </section>
          </div>

          <section aria-labelledby="accounts-title" className="mt-4">
            <div className="flex items-center justify-between gap-3 px-1 pb-3 pt-4">
              <h2 id="accounts-title" className="text-base font-semibold tracking-[-0.01em] text-white/90">
                Largest accounts
                <span className="ml-2 font-mono text-xs font-normal text-white/40">{rows.length}</span>
              </h2>
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="flex cursor-pointer items-center gap-1.5 rounded-md text-xs text-white/55 outline-none hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                  <Filter aria-hidden className="size-3.5" />“{query}” <X aria-hidden className="size-3" />
                </button>
              ) : (
                <a href="#accounts" className="text-xs text-white/55 underline-offset-4 outline-none hover:text-white/90 hover:underline focus-visible:underline">View all</a>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell md:hidden lg:table-cell">Status</TableHead>
                  <TableHead align="right" className="hidden lg:table-cell" sortDirection={sort.key === "seats" && sort.dir} onSort={() => toggleSort("seats")}>Seats</TableHead>
                  <TableHead align="right" sortDirection={sort.key === "mrr" && sort.dir} onSort={() => toggleSort("mrr")}>MRR</TableHead>
                  <TableHead align="right" className="hidden xl:table-cell">Customer since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.name}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar alt="" fallback={a.name.slice(0, 2).toUpperCase()} size="sm" shape="square" className="text-[10px]" />
                        <div className="min-w-0">
                          <p className="truncate text-white/90">{a.name}</p>
                          <p className="truncate text-xs text-white/40">{a.domain}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/70">{a.plan}</TableCell>
                    <TableCell className="hidden sm:table-cell md:hidden lg:table-cell">
                      <Badge size="sm" dot variant="soft" color={a.status === "Past due" ? "red" : a.status === "Trial" ? "white" : undefined}>{a.status}</Badge>
                    </TableCell>
                    <TableCell align="right" className="hidden text-white/70 lg:table-cell">{a.seats}</TableCell>
                    <TableCell align="right" className="font-mono text-[13px] text-white/90">{money(a.mrr)}</TableCell>
                    <TableCell align="right" className="hidden text-white/45 xl:table-cell">{a.since}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-white/45">
                      No accounts match “{query}”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
