"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; title: string; depth?: 2 | 3 };

export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = React.useState(items[0]?.id);

  React.useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">On this page</p>
      <ul className="space-y-2 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l pl-3 transition-colors",
                item.depth === 3 && "pl-6",
                active === item.id
                  ? "border-[rgb(var(--neon-accent))] text-fg"
                  : "border-transparent text-dim hover:text-muted",
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
