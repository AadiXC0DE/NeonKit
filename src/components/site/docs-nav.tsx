"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "@/components/ui/icons";
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
          className="group mb-1 flex h-8 w-full cursor-pointer items-center gap-2 rounded-md pl-3 pr-2 text-left text-[13px] font-medium text-fg/90 transition-colors hover:text-fg"
        >
          <span className="flex-1">{section.title}</span>
          <span className="text-[12px] font-normal tabular-nums text-muted">{section.items.length}</span>
          <ChevronRight
            size={13}
            strokeWidth={2}
            className={cn("text-muted transition-transform duration-200 ease-out-quint", open && "rotate-90")}
          />
        </button>
      ) : (
        <p className="mb-1 flex h-8 items-center pl-3 text-[13px] font-medium text-fg/90">{section.title}</p>
      )}
      <ul id={id} hidden={!open}>
        {section.items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-[30px] items-center gap-2 rounded-md pl-3 pr-2 text-[14px] transition-colors duration-150",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-3.5 w-[2px] -translate-y-1/2 rounded-full bg-[rgb(var(--neon-accent))] shadow-[0_0_6px_rgb(var(--neon-accent)/0.9),0_0_14px_rgb(var(--neon-accent)/0.5)]"
                  />
                )}
                <span className="truncate">{item.title}</span>
                {item.isNew && <span className="ml-auto text-[12px] text-[rgb(var(--neon-accent))]">New</span>}
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
    <nav aria-label="Documentation" className="space-y-6">
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
