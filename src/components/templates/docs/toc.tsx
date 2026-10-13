"use client";

import * as React from "react";
import { ArrowUp, ArrowUpRight } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { repoUrl } from "./config";
import type { Doc } from "./docs";
import { focusRing } from "./styles";

/** Below the sticky header, a heading counts as "current" once it scrolls past this line. */
const READING_LINE = 112;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The id of the heading the reader is in, tracked from scroll position. */
function useActiveHeading(ids: string[]) {
  const key = ids.join(" ");
  const [active, setActive] = React.useState(ids[0]);

  React.useEffect(() => {
    const list = key.split(" ");
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = list[0];
      for (const id of list) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= READING_LINE) current = id;
        else break;
      }
      // Short last sections never reach the line, so the bottom of the page claims the last one.
      const root = document.documentElement;
      if (window.innerHeight + window.scrollY >= root.scrollHeight - 4) current = list[list.length - 1];
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return active;
}

export function scrollToHeading(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  // Moves the keyboard's starting point too, as following a normal in-page link would.
  target.focus({ preventScroll: true });
  window.history.replaceState(window.history.state, "", `#${id}`);
}

export function TableOfContents({ doc }: { doc: Doc }) {
  const titleId = React.useId();
  const active = useActiveHeading(doc.headings.map((heading) => heading.id));
  const listRef = React.useRef<HTMLUListElement>(null);
  const tubeRef = React.useRef<HTMLSpanElement>(null);
  const [ready, setReady] = React.useState(false);

  // The tube is positioned straight on the DOM so scrolling never re-renders the list.
  React.useLayoutEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const tube = tubeRef.current;
    if (!link || !tube) return;
    tube.style.transform = `translateY(${link.offsetTop + 6}px)`;
    tube.style.height = `${Math.max(12, link.offsetHeight - 12)}px`;
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [active, doc.slug]);

  return (
    <nav aria-labelledby={titleId} className="flex min-h-0 flex-1 flex-col">
      <p id={titleId} className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
        On this page
      </p>
      <ScrollArea className="mt-4 min-h-0 shrink" fade={16}>
        <div className="relative">
          <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-white/[0.08]" />
          <span
            ref={tubeRef}
            aria-hidden
            className={cn(
              "absolute left-[-0.5px] top-0 w-[2px] rounded-full bg-[rgb(var(--neon))]",
              "shadow-[0_0_8px_rgb(var(--neon)/0.9),0_0_2px_rgb(var(--neon))]",
              ready
                ? "opacity-100 transition-[transform,height,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                : "opacity-0",
            )}
          />
          <ul ref={listRef} className="flex flex-col py-0.5">
            {doc.headings.map((heading) => {
              const current = heading.id === active;
              return (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    data-id={heading.id}
                    aria-current={current ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToHeading(heading.id);
                    }}
                    className={cn(
                      "block rounded-md py-1.5 pr-2 text-[13px] leading-5 transition-colors duration-150",
                      "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                      heading.level === 3 ? "pl-7" : "pl-4",
                      current ? "text-white" : "text-white/60 hover:text-white/90",
                    )}
                  >
                    {heading.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </ScrollArea>

      <div className="mt-6 flex flex-col items-start gap-2.5 border-t border-white/[0.07] pt-5 text-[13px] text-white/60">
        <a
          href={`${repoUrl}/edit/main/docs/${doc.slug || "index"}.mdx`}
          target="_blank"
          rel="noreferrer"
          className={cn("group inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-white", focusRing)}
        >
          Edit this page
          <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
        </a>
        <a
          href={`${repoUrl}/issues/new?title=${encodeURIComponent(`Docs: ${doc.title}`)}`}
          target="_blank"
          rel="noreferrer"
          className={cn("group inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-white", focusRing)}
        >
          Report an issue
          <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
        </a>
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
            document.getElementById("content")?.focus({ preventScroll: true });
          }}
          className={cn("group inline-flex cursor-pointer items-center gap-1.5 rounded-md transition-colors hover:text-white", focusRing)}
        >
          Back to top
          <ArrowUp aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </nav>
  );
}
