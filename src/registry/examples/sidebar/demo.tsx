"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  CircleDashed,
  CircleDot,
  CircleCheck,
  Inbox,
  MapIcon,
  Orbit,
  Plus,
  RefreshCcw,
  SquareKanban,
  UserRoundCheck,
} from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
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
import { cn } from "@/lib/utils";

type Status = "todo" | "progress" | "review" | "done";
type Row = { id: string; title: string; meta: string; status: Status };

const pages: Record<string, { title: string; summary: string; rows: Row[] }> = {
  inbox: {
    title: "Inbox",
    summary: "3 unread",
    rows: [
      { id: "ORB-412", title: "Rail loses focus after collapse", meta: "4m", status: "progress" },
      { id: "ORB-398", title: "Ship compact pagination", meta: "1h", status: "todo" },
      { id: "ORB-377", title: "Audit contrast in dark tables", meta: "3h", status: "review" },
      { id: "ORB-351", title: "Stepper connector stutters", meta: "1d", status: "done" },
    ],
  },
  issues: {
    title: "My issues",
    summary: "4 assigned",
    rows: [
      { id: "ORB-415", title: "Animate width on collapse", meta: "Today", status: "progress" },
      { id: "ORB-409", title: "Shortcut clashes with editors", meta: "Today", status: "review" },
      { id: "ORB-398", title: "Ship compact pagination", meta: "Fri", status: "todo" },
      { id: "ORB-362", title: "Document the mobile drawer", meta: "Mon", status: "done" },
    ],
  },
  projects: {
    title: "Projects",
    summary: "4 active",
    rows: [
      { id: "NK", title: "Neon v1.1", meta: "68%", status: "progress" },
      { id: "DS", title: "Docs search", meta: "41%", status: "progress" },
      { id: "MS", title: "Marketing site", meta: "90%", status: "review" },
      { id: "RC", title: "Registry CLI", meta: "12%", status: "todo" },
    ],
  },
  cycles: {
    title: "Cycles",
    summary: "Cycle 24 ends Friday",
    rows: [
      { id: "C25", title: "Cycle 25", meta: "Mar 10", status: "todo" },
      { id: "C24", title: "Cycle 24", meta: "62%", status: "progress" },
      { id: "C23", title: "Cycle 23", meta: "94%", status: "done" },
      { id: "C22", title: "Cycle 22", meta: "100%", status: "done" },
    ],
  },
  roadmap: {
    title: "Roadmap",
    summary: "2026",
    rows: [
      { id: "Q1", title: "Navigation components", meta: "On track", status: "progress" },
      { id: "Q2", title: "Data display", meta: "Planned", status: "todo" },
      { id: "Q2", title: "Theming playground", meta: "At risk", status: "review" },
      { id: "Q3", title: "Figma kit", meta: "Planned", status: "todo" },
    ],
  },
  platform: {
    title: "Platform",
    summary: "Team · 6 members",
    rows: [
      { id: "PLT-88", title: "Cache registry JSON at the edge", meta: "2d", status: "progress" },
      { id: "PLT-84", title: "Upgrade to motion 14", meta: "3d", status: "done" },
      { id: "PLT-79", title: "Flaky visual tests on CI", meta: "5d", status: "todo" },
    ],
  },
  design: {
    title: "Design",
    summary: "Team · 4 members",
    rows: [
      { id: "DES-51", title: "Glow tokens for light surfaces", meta: "1d", status: "review" },
      { id: "DES-47", title: "Rail icon set", meta: "2d", status: "progress" },
      { id: "DES-42", title: "Stepper empty states", meta: "4d", status: "todo" },
    ],
  },
};

const statusIcons: Record<Status, React.ReactNode> = {
  todo: <CircleDashed aria-label="Todo" className="size-4 text-white/35" />,
  progress: <CircleDot aria-label="In progress" className="size-4 text-[rgb(251_191_36)]" />,
  review: <RefreshCcw aria-label="In review" className="size-4 text-[rgb(168_85_247)]" />,
  done: <CircleCheck aria-label="Done" className="size-4 text-[rgb(52_211_153)]" />,
};

function TeamSwatch({ color }: { color: string }) {
  return <span className="size-2.5 rounded-[3px]" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />;
}

function Workspace() {
  const { collapsed } = useSidebar();
  return (
    <button
      type="button"
      className="flex h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg px-1.5 text-left outline-none transition-colors duration-150 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[rgb(var(--neon)/0.45)] bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))] shadow-[0_0_12px_rgb(var(--neon)/0.25)]">
        <Orbit aria-hidden className="size-4" />
      </span>
      <span className={cn("grid min-w-0 flex-1 transition-opacity duration-200", collapsed && "md:opacity-0")}>
        <span className="truncate text-sm font-medium text-white/90">Orbit</span>
        <span className="truncate text-xs text-white/50">Lumen Labs</span>
      </span>
      <ChevronsUpDown
        aria-hidden
        className={cn("size-3.5 shrink-0 text-white/35 transition-opacity duration-200", collapsed && "md:opacity-0")}
      />
    </button>
  );
}

function Account() {
  const { collapsed } = useSidebar();
  return (
    <button
      type="button"
      className="flex h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg px-1.5 text-left outline-none transition-colors duration-150 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
    >
      <Avatar alt="" fallback="MO" size="sm" status="online" />
      <span className="sr-only">Account: </span>
      <span className={cn("grid min-w-0 flex-1 transition-opacity duration-200", collapsed && "md:opacity-0")}>
        <span className="truncate text-sm text-white/90">Mira Okafor</span>
        <span className="truncate text-xs text-white/50">mira@lumenlabs.dev</span>
      </span>
      <ChevronsUpDown
        aria-hidden
        className={cn("size-3.5 shrink-0 text-white/35 transition-opacity duration-200", collapsed && "md:opacity-0")}
      />
    </button>
  );
}

export default function SidebarDemo() {
  const [active, setActive] = React.useState("projects");
  const page = pages[active];

  const item = (id: string, label: string, icon: React.ReactNode, badge?: React.ReactNode) => (
    <SidebarItem icon={icon} active={active === id} badge={badge} onClick={() => setActive(id)}>
      {label}
    </SidebarItem>
  );

  return (
    <SidebarProvider className="h-[520px] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
      <Sidebar>
        <SidebarHeader>
          <Workspace />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {item("inbox", "Inbox", <Inbox />, 3)}
            {item("issues", "My issues", <UserRoundCheck />)}
          </SidebarGroup>
          <SidebarGroup label="Workspace">
            {item("projects", "Projects", <SquareKanban />)}
            {item("cycles", "Cycles", <RefreshCcw />)}
            {item("roadmap", "Roadmap", <MapIcon />)}
          </SidebarGroup>
          <SidebarGroup label="Teams">
            {item("platform", "Platform", <TeamSwatch color="rgb(52 211 153)" />)}
            {item("design", "Design", <TeamSwatch color="rgb(255 95 162)" />)}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Account />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-hidden">
        <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-white/[0.08] px-3">
          <SidebarTrigger />
          <span aria-hidden className="h-4 w-px bg-white/10" />
          <h3 className="min-w-0 truncate px-1 text-sm font-medium text-white/90">{page.title}</h3>
          <span className="ml-auto hidden items-center gap-1 text-xs text-white/35 lg:flex">
            <Kbd size="sm" listen="Meta">
              ⌘
            </Kbd>
            <Kbd size="sm" listen="b">
              B
            </Kbd>
          </span>
          <Button size="sm" variant="soft" className="ml-auto lg:ml-2">
            <Plus /> New
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="px-2 pb-2 pt-1 text-xs text-white/50">{page.summary}</p>
          <ul className="grid gap-px">
            {page.rows.map((row) => (
              <li
                key={`${active}-${row.id}-${row.title}`}
                className="flex h-10 items-center gap-3 rounded-lg px-2 text-sm transition-colors duration-150 hover:bg-white/[0.03]"
              >
                {statusIcons[row.status]}
                <span className="w-14 shrink-0 truncate font-mono text-xs text-white/45">{row.id}</span>
                <span className="min-w-0 flex-1 truncate text-white/80">{row.title}</span>
                {row.meta.endsWith("%") && (
                  <span aria-hidden className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full bg-white/[0.08] sm:block">
                    <span
                      className="block h-full rounded-full bg-white/40"
                      style={{ width: row.meta }}
                    />
                  </span>
                )}
                <span className="min-w-10 shrink-0 text-right text-xs tabular-nums text-white/50">{row.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
