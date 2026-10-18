"use client";

import * as React from "react";
import { Archive, Inbox, Mail, PenLine, Send, Settings, Star, Tag, Trash2 } from "@/components/ui/icons";
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
} from "@/components/ui/sidebar";

const folders = [
  { id: "inbox", label: "Inbox", icon: <Inbox />, badge: 12 },
  { id: "starred", label: "Starred", icon: <Star /> },
  { id: "sent", label: "Sent", icon: <Send /> },
  { id: "drafts", label: "Drafts", icon: <PenLine />, badge: 2 },
  { id: "archive", label: "Archive", icon: <Archive /> },
  { id: "trash", label: "Trash", icon: <Trash2 /> },
];

const labels = [
  { id: "clients", label: "Clients", icon: <Tag className="text-[rgb(52_211_153)]" /> },
  { id: "receipts", label: "Receipts", icon: <Tag className="text-[rgb(251_191_36)]" /> },
];

const threads = [
  { from: "Ines Duarte", subject: "Rail labels look great on the 13-inch", time: "9:41" },
  { from: "Stripe", subject: "Your receipt from Lumen Labs #2291-4410", time: "8:02" },
  { from: "Theo Lambert", subject: "Re: moving the review to Thursday", time: "Yesterday" },
  { from: "Vercel", subject: "Deployment aurora-web ready", time: "Yesterday" },
  { from: "Ada Moreau", subject: "Contract draft, v3 with redlines", time: "Mon" },
];

export default function SidebarRail() {
  const [active, setActive] = React.useState("inbox");
  const current = [...folders, ...labels].find((folder) => folder.id === active);

  return (
    <SidebarProvider
      defaultCollapsed
      shortcut={false}
      className="h-[480px] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#05060a]"
    >
      <Sidebar>
        <SidebarHeader>
          <span className="grid size-10 shrink-0 place-items-center text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.6))]">
            <Mail aria-hidden className="size-5" />
          </span>
          <span className="truncate text-sm font-medium text-white/90">Postbox</span>
        </SidebarHeader>
        <SidebarContent aria-label="Mailboxes">
          <SidebarGroup>
            {folders.map((folder) => (
              <SidebarItem
                key={folder.id}
                icon={folder.icon}
                badge={folder.badge}
                active={active === folder.id}
                onClick={() => setActive(folder.id)}
              >
                {folder.label}
              </SidebarItem>
            ))}
          </SidebarGroup>
          <SidebarGroup label="Labels">
            {labels.map((label) => (
              <SidebarItem
                key={label.id}
                icon={label.icon}
                active={active === label.id}
                onClick={() => setActive(label.id)}
              >
                {label.label}
              </SidebarItem>
            ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarItem icon={<Settings />}>Settings</SidebarItem>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.08] px-3">
          <SidebarTrigger />
          <h3 className="text-sm font-medium text-white/90">{current?.label}</h3>
        </header>
        <ul className="min-h-0 flex-1 divide-y divide-white/[0.05] overflow-y-auto">
          {threads.map((thread) => (
            <li key={thread.subject} className="grid gap-0.5 px-4 py-3 transition-colors duration-150 hover:bg-white/[0.02]">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-white/90">{thread.from}</span>
                <span className="shrink-0 text-xs text-white/40">{thread.time}</span>
              </div>
              <p className="truncate text-xs text-white/55">{thread.subject}</p>
            </li>
          ))}
        </ul>
      </SidebarInset>
    </SidebarProvider>
  );
}
