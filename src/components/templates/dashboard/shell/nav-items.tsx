"use client";

import { usePathname } from "next/navigation";
import { FolderGit2, LayoutGrid, Settings } from "@/components/ui/icons";
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

/** A small status lamp. Healthy is an unlit grey bulb; it only lights for work in flight or a failure. */
export function StatusLamp({ status, className = "" }: { status: string; className?: string }) {
  const tone =
    status === "failed"
      ? "bg-[rgb(255_77_94)] shadow-[0_0_0_1px_rgb(255_77_94/0.4),0_0_8px_rgb(255_77_94/0.8)]"
      : status === "building"
        ? "bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.9)]"
        : status === "paused"
          ? "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)]"
          : "bg-white/35";
  return <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${tone} ${className}`} />;
}

/** Build minutes for the cycle: a hairline gauge, no card around it. */
export function UsageCard({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-2 border-t border-white/[0.06] px-2 pt-4 ${className}`}>
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="text-white/75">Build minutes</span>
        <span className="font-mono text-xs tabular-nums text-white/60">1,842 / 3,000</span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full w-[61%] rounded-full bg-white/50" />
      </div>
      <p className="text-xs leading-4 text-white/55">Resets in 18 days</p>
    </div>
  );
}
