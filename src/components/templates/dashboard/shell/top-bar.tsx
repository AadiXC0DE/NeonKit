"use client";

import Link from "next/link";
import { Search } from "@/components/ui/icons";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { KbdCombo } from "@/components/ui/kbd";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { basePath, team } from "../config";
import type { Notice } from "../data";
import { AccountMenu } from "./account-menu";
import { MobileNav } from "./mobile-nav";
import { useActivePage } from "./nav-items";
import { Notifications } from "./notifications";

export function TopBar({
  notices,
  onRead,
  onReadAll,
  onOpenPalette,
  mobileNavOpen,
  onMobileNavChange,
}: {
  notices: Notice[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onOpenPalette: () => void;
  mobileNavOpen: boolean;
  onMobileNavChange: (open: boolean) => void;
}) {
  const page = useActivePage();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 border-b border-white/[0.06] bg-[#05060a]/85 px-3 backdrop-blur-[12px] sm:px-4 lg:px-6">
      <SidebarTrigger aria-label="Toggle sidebar" aria-keyshortcuts="Meta+B Control+B" className="-ml-1 max-md:hidden" />
      <MobileNav open={mobileNavOpen} onOpenChange={onMobileNavChange} />
      <span aria-hidden className="mx-1.5 h-4 w-px bg-white/10" />

      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={basePath}>
                <span aria-hidden className="grid size-5 place-items-center rounded-[5px] bg-white/[0.08] font-mono text-[10px] font-semibold text-white/80">
                  {team.name[0]}
                </span>
                {team.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{page.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenPalette}
          aria-keyshortcuts="Meta+K Control+K"
          className="group hidden h-9 w-60 cursor-pointer items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] pl-3 pr-1.5 text-left text-[13px] text-white/60 outline-none transition-[border-color,background-color,color] duration-150 hover:border-white/15 hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] lg:flex xl:w-72"
        >
          <Search aria-hidden className="size-4 shrink-0 text-white/55 group-hover:text-white/75" />
          <span className="flex-1 truncate">Search or jump to…</span>
          <KbdCombo keys={["⌘", "K"]} size="sm" separator={null} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Search"
          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/70 outline-none transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] lg:hidden"
        >
          <Search aria-hidden className="size-[18px]" />
        </button>
        <Notifications notices={notices} onRead={onRead} onReadAll={onReadAll} />
        <AccountMenu onOpenPalette={onOpenPalette} />
      </div>
    </header>
  );
}
