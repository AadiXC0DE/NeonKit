"use client";

import * as React from "react";
import { ChartNoAxesColumn, FolderKanban, House, Inbox, Settings } from "@/components/ui/icons";
import { Dock, DockItem, DockSeparator } from "@/components/ui/dock";

const pages = [
  { href: "#home", label: "Home", icon: House },
  { href: "#inbox", label: "Inbox", icon: Inbox, badge: 4 },
  { href: "#projects", label: "Projects", icon: FolderKanban },
  { href: "#analytics", label: "Analytics", icon: ChartNoAxesColumn },
];

export default function DockVertical() {
  const [current, setCurrent] = React.useState("#inbox");

  return (
    <div className="flex h-[400px] w-full max-w-[640px] items-center gap-8 overflow-hidden rounded-xl border border-white/[0.06] bg-[#07080c] pl-4">
      <Dock orientation="vertical" size="sm" magnification={1.5} aria-label="Workspace">
        {pages.map((page) => (
          <DockItem key={page.href} asChild label={page.label} badge={page.badge} running={current === page.href} runningLabel="current page">
            <a
              href={page.href}
              aria-current={current === page.href ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(page.href);
              }}
            >
              <page.icon strokeWidth={1.75} />
            </a>
          </DockItem>
        ))}
        <DockSeparator />
        <DockItem asChild label="Settings" running={current === "#settings"} runningLabel="current page">
          <a
            href="#settings"
            aria-current={current === "#settings" ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setCurrent("#settings");
            }}
          >
            <Settings strokeWidth={1.75} />
          </a>
        </DockItem>
      </Dock>
      <div className="min-w-0">
        <p className="text-[22px] font-semibold tracking-[-0.02em] text-white/90">
          {[...pages, { href: "#settings", label: "Settings" }].find((p) => p.href === current)?.label}
        </p>
        <p className="mt-1 text-[14px] text-white/55">Arrow keys move along the rail. The lit tube marks this page.</p>
      </div>
    </div>
  );
}
