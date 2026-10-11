"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="space-y-8">
      {docsNav.map((section) => (
        <div key={section.title}>
          <h4 className="mb-2.5 px-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">
            {section.title}
          </h4>
          <ul className="space-y-px">
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
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--neon-accent))]">
                        new
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
