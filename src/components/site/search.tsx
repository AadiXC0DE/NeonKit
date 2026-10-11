"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search as SearchIcon } from "lucide-react";
import { docsNav } from "@/config/nav";
import { cn } from "@/lib/utils";
import { registry } from "@/registry";

type Entry = { title: string; href: string; section: string; hint?: string };

const entries: Entry[] = docsNav.flatMap((section) =>
  section.items.map((item) => ({
    title: item.title,
    href: item.href,
    section: section.title,
    hint: registry.find((r) => `/components/${r.slug}` === item.href)?.description,
  })),
);

function score(entry: Entry, query: string) {
  const q = query.toLowerCase();
  const title = entry.title.toLowerCase();
  if (title.startsWith(q)) return 3;
  if (title.includes(q)) return 2;
  if (entry.hint?.toLowerCase().includes(q) || entry.section.toLowerCase().includes(q)) return 1;
  return 0;
}

export function Search() {
  const router = useRouter();
  const dialog = React.useRef<HTMLDialogElement>(null);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  const results = React.useMemo(() => {
    if (!query.trim()) return entries;
    return entries
      .map((entry) => ({ entry, s: score(entry, query.trim()) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.entry);
  }, [query]);

  const open = React.useCallback(() => {
    setQuery("");
    setActive(0);
    dialog.current?.showModal();
  }, []);

  const close = () => dialog.current?.close();

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (entry: Entry | undefined) => {
    if (!entry) return;
    close();
    router.push(entry.href);
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white/[0.02] pl-2.5 pr-1.5 text-[13px] text-dim transition-colors hover:border-line-strong hover:text-muted"
      >
        <SearchIcon className="size-3.5" />
        <span className="hidden lg:inline">Search components</span>
        <kbd className="ml-1 hidden h-5 items-center rounded border border-line px-1.5 font-mono text-[10.5px] text-dim sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label="Search the docs"
        onClick={(event) => event.target === dialog.current && close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="mx-auto mt-[12vh] w-[min(560px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-line-strong bg-[#0a0b11] shadow-[0_24px_80px_rgb(0_0_0/0.7),0_0_0_1px_rgb(var(--neon-accent)/0.08)]">
          <div className="flex items-center gap-3 border-b border-line px-4">
            <SearchIcon className="size-4 shrink-0 text-dim" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((i) => Math.min(i + 1, results.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  go(results[active]);
                }
              }}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              placeholder="Find a component or page…"
              className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-dim"
            />
            <kbd className="font-mono text-[10.5px] text-dim">esc</kbd>
          </div>
          <ul id={listId} role="listbox" className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
            {results.length === 0 && <li className="px-3 py-8 text-center text-[14px] text-dim">Nothing lit up.</li>}
            {results.map((entry, i) => (
              <li
                key={entry.href}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(entry)}
                ref={(node) => {
                  if (i === active) node?.scrollIntoView({ block: "nearest" });
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5",
                  i === active && "bg-white/[0.05]",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[14px]", i === active ? "neon-text" : "text-fg")}>{entry.title}</span>
                  {entry.hint && <span className="block truncate text-[12.5px] text-dim">{entry.hint}</span>}
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">{entry.section}</span>
                {i === active && <CornerDownLeft className="size-3.5 text-dim" />}
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
