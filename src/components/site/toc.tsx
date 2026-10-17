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
    if (!headings.length) return;
    // The current section is the last heading above a line just under the header; at the very
    // bottom the last one wins even if it can't scroll that far.
    const update = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = headings[0].id;
      for (const heading of headings) if (heading.getBoundingClientRect().top <= 120) current = heading.id;
      setActive(atBottom && window.scrollY > 0 ? headings[headings.length - 1].id : current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <nav aria-label="On this page" className="text-[13.5px]">
      <p className="mb-4 font-medium text-fg">On this page</p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const current = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "relative block rounded-md py-1 pl-4 leading-snug transition-colors duration-150",
                  item.depth === 3 && "pl-7",
                  current ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-1/2 h-3.5 w-[2px] -translate-y-1/2 rounded-full transition-[opacity,box-shadow] duration-200",
                    current
                      ? "bg-[rgb(var(--neon-accent))] opacity-100 shadow-[0_0_6px_rgb(var(--neon-accent)/0.9),0_0_14px_rgb(var(--neon-accent)/0.5)]"
                      : "bg-white/15 opacity-0",
                  )}
                />
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
