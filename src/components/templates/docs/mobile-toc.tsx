"use client";

import * as React from "react";
import { ChevronDown } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

import type { Doc } from "./docs";
import { scrollToHeading, useActiveHeading } from "./toc";

/**
 * Below xl there's no right rail, so the outline rides under the header instead: it names the
 * section you're in and opens into the full list.
 */
export function MobileToc({ doc }: { doc: Doc }) {
  const active = useActiveHeading(
    doc.headings.map((heading) => heading.id),
    { beforeFirst: true },
  );
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panelId = React.useId();
  const current = doc.headings.find((heading) => heading.id === active);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="sticky top-14 z-30 -mx-5 mt-8 border-y border-white/[0.07] bg-[#05060a]/90 backdrop-blur-[12px] sm:-mx-10 lg:-mx-14 xl:hidden"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center gap-3 px-5 text-left text-[14px] sm:px-10 lg:px-14",
          "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
        )}
      >
        <span className="shrink-0 text-white/55">On this page</span>
        <span aria-hidden className="h-3.5 w-px shrink-0 bg-white/15" />
        <span className={cn("min-w-0 flex-1 truncate", current ? "text-white" : "text-white/55")}>
          {current?.title ?? `${doc.headings.length} sections`}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-white/50 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-white/[0.07] bg-[#07080c] shadow-[0_24px_48px_-16px_rgb(0_0_0/0.9)]"
      >
        <ul className="max-h-[60svh] overflow-y-auto px-5 py-2 sm:px-10 lg:px-14">
          {doc.headings.map((heading) => {
            const here = heading.id === active;
            return (
              <li key={heading.id} className="relative">
                {here && (
                  <span
                    aria-hidden
                    className="absolute inset-y-3 -left-3 w-[2px] rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.9)] sm:-left-4"
                  />
                )}
                <a
                  href={`#${heading.id}`}
                  aria-current={here ? "location" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setOpen(false);
                    scrollToHeading(heading.id);
                  }}
                  className={cn(
                    "block rounded-md py-2.5 text-[15px] transition-colors duration-150",
                    "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                    heading.level === 3 && "pl-4 text-[14px]",
                    here ? "text-white" : "text-white/65 hover:text-white",
                  )}
                >
                  {heading.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
