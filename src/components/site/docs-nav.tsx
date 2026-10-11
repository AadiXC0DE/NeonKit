"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { docsNav, type NavSection } from "@/config/nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "neonkit:nav-collapsed";

// Remembered per visitor; a tiny external store keeps server and client markup in agreement.
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: string[] } = { raw: null, value: [] };
const empty: string[] = [];

function readCollapsed(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {}
  if (raw !== cache.raw) {
    try {
      cache = { raw, value: raw ? (JSON.parse(raw) as string[]) : [] };
    } catch {
      cache = { raw, value: [] };
    }
  }
  return cache.value;
}

function writeCollapsed(next: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((listener) => listener());
}

function Section({
  section,
  pathname,
  collapsible,
  collapsed,
  onToggle,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  collapsible: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const id = React.useId();
  const containsActive = section.items.some((item) => item.href === pathname);
  const open = !collapsible || !collapsed || containsActive;

  return (
    <div>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="group mb-2 flex w-full cursor-pointer items-center justify-between px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim transition-colors hover:text-muted"
        >
          <span className="flex items-center gap-1.5">
            <ChevronRight className={cn("size-3 transition-transform duration-200", open && "rotate-90")} />
            {section.title}
          </span>
          <span className="tabular-nums">{section.items.length}</span>
        </button>
      ) : (
        <h4 className="mb-2.5 px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{section.title}</h4>
      )}
      <ul id={id} hidden={!open} className="space-y-px">
        {section.items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-8 items-center justify-between rounded-md px-3 text-[13.5px] transition-colors",
                  active ? "bg-white/[0.04] text-fg" : "text-muted hover:text-fg",
                )}
              >
                {active && (
                  <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[rgb(var(--neon-accent))] shadow-[0_0_8px_rgb(var(--neon-accent))]" />
                )}
                {item.title}
                {item.isNew && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--neon-accent))]">new</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const collapsed = React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    readCollapsed,
    () => empty,
  );

  const toggle = (title: string) =>
    writeCollapsed(collapsed.includes(title) ? collapsed.filter((t) => t !== title) : [...collapsed, title]);

  return (
    <nav aria-label="Documentation" className="space-y-7">
      {docsNav.map((section, index) => (
        <Section
          key={section.title}
          section={section}
          pathname={pathname}
          collapsible={index > 0}
          collapsed={collapsed.includes(section.title)}
          onToggle={() => toggle(section.title)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
