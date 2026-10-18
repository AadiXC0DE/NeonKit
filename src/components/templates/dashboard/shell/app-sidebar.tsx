"use client";

import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { basePath, brand, team } from "../config";
import { Logo } from "../parts/logo";
import { NAV_ITEMS, PINNED, StatusLamp, UsageCard, useActivePage } from "./nav-items";

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const active = useActivePage();

  return (
    <Sidebar aria-label={brand} className="max-md:hidden">
      <SidebarHeader className="h-14 border-b border-white/[0.06] px-3">
        <Link
          href={basePath}
          className="-ml-0.5 flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          <Logo />
          <span className={cn("grid min-w-0 transition-opacity duration-200", collapsed && "opacity-0")}>
            <span className="truncate text-[15px] font-semibold leading-5 tracking-[-0.02em] text-white">{brand}</span>
            <span className="truncate text-xs leading-4 text-white/55">
              {team.name}, {team.plan} plan
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-3">
        <SidebarGroup>
          {NAV_ITEMS.map(({ url, label, Icon }) => (
            <SidebarItem
              key={url}
              icon={<Icon />}
              active={active.url === url}
              asChild
            >
              <Link href={url}>{label}</Link>
            </SidebarItem>
          ))}
        </SidebarGroup>
        {/* The group label ships at 40% white; lift it to pass contrast on this background. */}
        <SidebarGroup label="Pinned" className="[&>div>span:first-child]:text-white/60">
          {PINNED.map((project) => (
            <SidebarItem key={project.name} icon={<PinnedIcon status={project.status} />} tooltip={project.name} asChild>
              <Link href={project.url} className="font-mono text-[13px]">
                {project.name}
              </Link>
            </SidebarItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn("p-3 transition-opacity duration-200", collapsed && "pointer-events-none opacity-0")}>
        <UsageCard />
      </SidebarFooter>
    </Sidebar>
  );
}

function PinnedIcon({ status }: { status: string }) {
  return (
    <span className="grid size-4 place-items-center">
      <StatusLamp status={status} />
    </span>
  );
}
