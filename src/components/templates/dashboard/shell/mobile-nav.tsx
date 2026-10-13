"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { brand, team } from "../config";
import { Logo } from "../parts/logo";
import { NAV_ITEMS, PINNED, StatusLamp, UsageCard, useActivePage } from "./nav-items";

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const active = useActivePage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => onOpenChange(true)}
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/70 outline-none transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] md:hidden"
      >
        <Menu aria-hidden className="size-[18px]" />
      </button>
      <SheetContent side="left" size="sm" className="max-w-[300px]">
        <SheetHeader className="flex-row items-center gap-3">
          <Logo />
          <div className="min-w-0">
            <SheetTitle>{brand}</SheetTitle>
            <SheetDescription className="font-mono text-[11px] uppercase leading-4 tracking-[0.14em]">
              {team.name} · {team.plan} plan
            </SheetDescription>
          </div>
        </SheetHeader>

        <nav aria-label="Main" className="mt-8">
          <ul className="grid gap-1">
            {NAV_ITEMS.map(({ url, label, Icon }) => {
              const current = active.url === url;
              return (
                <li key={url}>
                  <SheetClose asChild>
                    <Link
                      href={url}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "relative flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                        current ? "bg-[rgb(var(--neon)/0.08)] text-white" : "text-white/70 hover:bg-white/[0.04] hover:text-white",
                      )}
                    >
                      {current && (
                        <span aria-hidden className="absolute inset-y-2.5 -left-[5px] w-[3px] rounded-full bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.85)]" />
                      )}
                      <Icon aria-hidden className={cn("size-[18px]", current ? "text-[rgb(var(--neon))]" : "text-white/55")} />
                      {label}
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Pinned</p>
          <ul className="mt-2 grid gap-0.5">
            {PINNED.map((project) => (
              <li key={project.name}>
                <SheetClose asChild>
                  <Link
                    href={project.url}
                    className="flex h-10 items-center gap-3 rounded-lg px-3 font-mono text-[13px] text-white/70 outline-none transition-colors duration-150 hover:bg-white/[0.04] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    <span className="grid size-[18px] place-items-center">
                      <StatusLamp status={project.status} />
                    </span>
                    {project.name}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <UsageCard className="mt-auto" />
      </SheetContent>
    </Sheet>
  );
}
