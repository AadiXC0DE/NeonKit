"use client";

import * as React from "react";
import { Archive, Inbox, Send, Star } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const folders = [
  { name: "Inbox", icon: Inbox, count: 12 },
  { name: "Starred", icon: Star, count: 3 },
  { name: "Sent", icon: Send },
  { name: "Archive", icon: Archive },
];

const threads = [
  {
    from: "Priya Raman",
    subject: "Q4 pricing review",
    preview: "Pulled the churn numbers for the Team plan…",
  },
  {
    from: "Linear",
    subject: "ENG-2201 moved to Done",
    preview: "Cache edge config between deploys",
  },
  {
    from: "Marco Bellini",
    subject: "Re: SOC 2 evidence",
    preview: "Uploaded the access reviews for September.",
  },
];

// The folder pane collapses to a 56px-ish icon rail instead of disappearing.
export default function ResizableRail() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="w-full max-w-4xl overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="h-[340px] min-w-[600px]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={22}
            minSize={16}
            maxSize={30}
            collapsible
            collapsedSize={7}
            onCollapse={() => setCollapsed(true)}
            onExpand={() => setCollapsed(false)}
          >
            <nav aria-label="Folders" className="grid gap-0.5 p-2">
              {folders.map(({ name, icon: Icon, count }, i) => (
                <a
                  key={name}
                  href="#"
                  title={collapsed ? name : undefined}
                  className={cn(
                    "flex h-9 items-center gap-3 rounded-md px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]",
                    i === 0
                      ? "bg-white/[0.06] text-white/90"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white/85",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon aria-hidden className="size-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 truncate">{name}</span>
                  )}
                  {!collapsed && count && (
                    <span className="text-xs tabular-nums text-white/40">
                      {count}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </ResizablePanel>
          <ResizableHandle aria-label="Resize folders" />
          <ResizablePanel defaultSize={36} minSize={24}>
            <ul className="divide-y divide-white/[0.06]">
              {threads.map((t, i) => (
                <li
                  key={t.subject}
                  className={cn(
                    "grid gap-0.5 px-4 py-3",
                    i === 0 && "bg-white/[0.03]",
                  )}
                >
                  <p className="truncate text-sm font-medium text-white/90">
                    {t.from}
                  </p>
                  <p className="truncate text-[13px] text-white/70">
                    {t.subject}
                  </p>
                  <p className="truncate text-xs text-white/40">{t.preview}</p>
                </li>
              ))}
            </ul>
          </ResizablePanel>
          <ResizableHandle aria-label="Resize thread list" />
          <ResizablePanel defaultSize={42} minSize={30}>
            <article className="grid gap-3 p-6">
              <h3 className="text-lg font-medium text-white/90">
                Q4 pricing review
              </h3>
              <p className="max-w-prose text-sm leading-6 text-white/60">
                Pulled the churn numbers for the Team plan. Annual seats churn
                at a third of monthly ones, so I&apos;d like to test a 20%
                annual discount before we touch list prices. Draft deck by
                Thursday.
              </p>
            </article>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
