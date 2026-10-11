"use client";

import * as React from "react";
import { Activity, Database, LayoutGrid, LifeBuoy, Menu, Rocket, ScrollText, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { label: "Overview", icon: LayoutGrid },
  { label: "Deployments", icon: Rocket, count: 3 },
  { label: "Observability", icon: Activity },
  { label: "Logs", icon: ScrollText },
  { label: "Storage", icon: Database },
  { label: "Settings", icon: Settings },
];

export default function SheetNavigation() {
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState("Deployments");

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Open navigation" className="size-9">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" size="sm" className="w-[min(320px,85vw)]">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
            acme-web
          </SheetTitle>
          <nav aria-label="Project" className="-mx-3 mt-6">
            <ul className="grid gap-0.5">
              {links.map((link) => {
                const current = link.label === page;
                return (
                  <li key={link.label}>
                    <a
                      href={`#${link.label.toLowerCase()}`}
                      aria-current={current ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(link.label);
                        setOpen(false);
                      }}
                      className={
                        "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] " +
                        (current
                          ? "bg-[rgb(var(--neon)/0.08)] text-white"
                          : "text-white/60 hover:bg-white/[0.04] hover:text-white/90")
                      }
                    >
                      {current && (
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
                      )}
                      <link.icon aria-hidden className={current ? "size-4 text-[rgb(var(--neon))]" : "size-4"} />
                      <span className="flex-1">{link.label}</span>
                      {link.count && (
                        <span className="rounded-full bg-white/[0.06] px-1.5 text-[11px] tabular-nums text-white/55">
                          {link.count}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto flex items-center gap-3 border-t border-white/[0.08] pt-4">
            <Avatar size="sm" alt="Ana Lima" status="online" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white/85">Ana Lima</p>
              <p className="truncate text-xs text-white/40">ana@acme.dev</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Help" className="size-8">
              <LifeBuoy />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-sm text-white/50">acme-web /</span>
      <span className="text-sm font-medium text-white/90">{page}</span>
    </div>
  );
}
