"use client";

import { usePathname } from "next/navigation";
import { FolderGit2, LayoutGrid, Settings } from "lucide-react";
import { basePath, nav } from "../config";
import { PROJECTS } from "../data";

const ICONS = { "": LayoutGrid, "/projects": FolderGit2, "/settings": Settings } as const;

export const NAV_ITEMS = nav.map((item) => ({ ...item, url: `${basePath}${item.href}`, Icon: ICONS[item.href] }));

export const PINNED = ["storefront", "checkout-api", "webhooks"].map((name) => {
  const project = PROJECTS.find((p) => p.name === name)!;
  return { name, status: project.status, url: `${basePath}/projects?q=${name}` };
});

export function useActivePage() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  return NAV_ITEMS.find((item) => item.url === pathname) ?? NAV_ITEMS[0];
}

/** A small status lamp: lit in the brand color, red when failing, unlit when paused. */
export function StatusLamp({ status, className = "" }: { status: string; className?: string }) {
  const tone =
    status === "failed"
      ? "bg-[rgb(255_77_94)] shadow-[0_0_6px_rgb(255_77_94/0.8)]"
      : status === "paused"
        ? "bg-white/25"
        : "bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/0.8)]";
  return <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${tone} ${className}`} />;
}

export function UsageCard({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 ${className}`}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-white/75">Build minutes</span>
        <span className="font-mono tabular-nums text-white/60">1,842 / 3k</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full w-[61%] rounded-full bg-[rgb(var(--neon)/0.75)] shadow-[0_0_8px_rgb(var(--neon)/0.6)]" />
      </div>
      <p className="text-[11px] leading-4 text-white/60">Pro plan · resets in 18 days</p>
    </div>
  );
}
