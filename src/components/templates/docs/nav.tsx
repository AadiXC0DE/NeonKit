"use client";

import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

import { SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { releasedOn, repoUrl, version } from "./config";
import { docHref, docs, groups } from "./docs";
import { GantryMark } from "./logo";
import { focusRing } from "./styles";

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">{children}</span>;
}

function ReleaseNote() {
  return (
    <a
      href={`${repoUrl}/releases/tag/v${version}`}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors duration-150 hover:bg-white/[0.04]",
        focusRing,
      )}
    >
      <span className="flex min-w-0 flex-col">
        <span className="font-medium text-white/85">What&apos;s new in {version}</span>
        <span className="text-xs text-white/55">Released {releasedOn}</span>
      </span>
      <ArrowUpRight
        aria-hidden
        className="size-4 shrink-0 text-white/45 transition-[transform,color] duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-white/80"
      />
    </a>
  );
}

/** The left column from lg up. Below that, MobileNav shows the same links in a sheet. */
export function DocsSidebar({ slug }: { slug: string }) {
  return (
    <div className="hidden w-[264px] shrink-0 border-r border-white/[0.06] lg:block">
      <Sidebar
        collapsible="none"
        className="border-r-0 bg-transparent md:top-14 md:h-[calc(100svh-3.5rem)] md:w-full"
      >
        <SidebarContent aria-label="Documentation" className="gap-7 px-4 pb-8 pt-9">
          {groups.map((group) => (
            <SidebarGroup key={group} label={<GroupLabel>{group}</GroupLabel>}>
              {docs
                .filter((doc) => doc.group === group)
                .map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <SidebarItem key={doc.slug} asChild active={doc.slug === slug} icon={<Icon />}>
                      <Link href={docHref(doc.slug)} className={doc.mono ? "font-mono text-[13px]" : undefined}>
                        {doc.navTitle ?? doc.title}
                      </Link>
                    </SidebarItem>
                  );
                })}
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-white/[0.06] px-3 py-3">
          <ReleaseNote />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

type MobileNavProps = {
  slug: string;
  onSearch: () => void;
};

/** Rendered inside the shell's <Sheet>, so the header's menu button can be its trigger. */
export function MobileNav({ slug, onSearch }: MobileNavProps) {
  return (
    <SheetContent side="left" size="sm" className="w-[min(320px,86vw)]">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2 text-[15px] lowercase tracking-[-0.03em]">
          <GantryMark />
          Gantry docs
        </SheetTitle>
        <SheetDescription className="font-mono text-xs text-white/55">
          v{version} · {releasedOn}
        </SheetDescription>
      </SheetHeader>

      <button
        type="button"
        onClick={onSearch}
        className={cn(
          "mt-6 flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white/60",
          "transition-colors duration-150 hover:border-white/20 hover:text-white/85",
          focusRing,
        )}
      >
        <Search aria-hidden className="size-4" />
        Search docs
      </button>

      <nav aria-label="Documentation" className="mt-7 flex flex-col gap-7">
        {groups.map((group) => (
          <div key={group}>
            <h3 className="px-3">
              <GroupLabel>{group}</GroupLabel>
            </h3>
            <ul className="mt-2 flex flex-col gap-0.5">
              {docs
                .filter((doc) => doc.group === group)
                .map((doc) => {
                  const Icon = doc.icon;
                  const active = doc.slug === slug;
                  return (
                    <li key={doc.slug} className="relative">
                      {active && (
                        <span
                          aria-hidden
                          className="absolute inset-y-2 -left-[5px] w-[3px] rounded-full bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.85),0_0_2px_rgb(var(--neon))]"
                        />
                      )}
                      <SheetClose asChild>
                        <Link
                          href={docHref(doc.slug)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150",
                            "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                            active
                              ? "bg-[rgb(var(--neon)/0.08)] text-white shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.14)]"
                              : "text-white/65 hover:bg-white/[0.04] hover:text-white/90",
                            doc.mono && "font-mono text-[13px]",
                          )}
                        >
                          <Icon
                            aria-hidden
                            className={cn(
                              "size-4 shrink-0",
                              active ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.7))]" : "text-white/45",
                            )}
                          />
                          {doc.navTitle ?? doc.title}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 border-t border-white/[0.06] pt-3">
        <ReleaseNote />
      </div>
    </SheetContent>
  );
}
