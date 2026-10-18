"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search as SearchIcon } from "@/components/ui/icons";
import { docsNav } from "@/config/nav";
import { cn } from "@/lib/utils";
import { blocks, orderedBlocks, registry, templates } from "@/registry";

type Entry = { title: string; href: string; section: string; hint?: string };

export const searchEntries: Entry[] = [
  ...docsNav.flatMap((section) =>
    section.items.map((item) => ({
      title: item.title,
      href: item.href,
      section: section.title,
      hint: registry.find((r) => `/components/${r.slug}` === item.href)?.description,
    })),
  ),
  ...(blocks.length
    ? orderedBlocks.map((block) => ({
        title: block.name,
        href: `/blocks/${block.slug}`,
        section: "Blocks",
        hint: block.description,
      }))
    : []),
  ...templates.map((template) => ({
    title: template.name,
    href: `/templates/${template.slug}`,
    section: "Templates",
    hint: template.description,
  })),
];

function score(entry: Entry, query: string) {
  const q = query.toLowerCase();
  const title = entry.title.toLowerCase();
  if (title.startsWith(q)) return 4;
  if (title.split(/[\s-]+/).some((word) => word.startsWith(q))) return 3;
  if (title.includes(q)) return 2;
  if (entry.hint?.toLowerCase().includes(q) || entry.section.toLowerCase().includes(q)) return 1;
  return 0;
}

export function searchFor(query: string, entries: Entry[] = searchEntries) {
  const q = query.trim();
  if (!q) return entries;
  return entries
    .map((entry, index) => ({ entry, s: score(entry, q), index }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.index - b.index)
    .map((r) => r.entry);
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-md bg-white/[0.07] px-1.5 font-sans text-[11.5px] text-muted">
      {children}
    </kbd>
  );
}

export function Search() {
  const router = useRouter();
  const dialog = React.useRef<HTMLDialogElement>(null);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  const results = React.useMemo(() => searchFor(query), [query]);
  const grouped = !query.trim();

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
        className="group inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] pl-2.5 pr-1.5 text-[13px] text-muted transition-colors hover:border-white/15 hover:text-fg"
      >
        <SearchIcon size={14} />
        <span className="sr-only lg:not-sr-only">Search</span>
        <span aria-hidden className="ml-3 hidden sm:inline-flex">
          <Kbd>⌘K</Kbd>
        </span>
      </button>

      <dialog
        ref={dialog}
        aria-label="Search the site"
        onClick={(event) => event.target === dialog.current && close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/65 backdrop:backdrop-blur-[3px]"
      >
        <div className="mx-auto mt-[11vh] flex max-h-[min(620px,76dvh)] w-[min(600px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a0b11] shadow-[0_32px_96px_rgb(0_0_0/0.75),inset_0_1px_0_rgb(255_255_255/0.05)]">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
            <SearchIcon size={17} className="shrink-0 text-muted" />
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
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              placeholder={`Search ${registry.length} components, ${blocks.length} blocks and the docs`}
              className="h-14 w-full min-w-0 bg-transparent text-[15.5px] text-fg outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={close}
              className="shrink-0 cursor-pointer rounded-md text-[12.5px] text-muted transition-colors hover:text-fg"
            >
              <Kbd>Esc</Kbd>
              <span className="sr-only">Close search</span>
            </button>
          </div>
          <ul id={listId} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {results.length === 0 && (
              <li role="presentation" className="px-3 py-12 text-center text-[14.5px] text-muted">
                Nothing called &ldquo;{query.trim()}&rdquo;.{" "}
                <a
                  href="/request"
                  onClick={(event) => {
                    event.preventDefault();
                    go({ title: "Request", href: "/request", section: "" });
                  }}
                  className="text-fg underline decoration-white/25 underline-offset-[0.22em]"
                >
                  Request it
                </a>
              </li>
            )}
            {results.map((entry, i) => {
              const heading = grouped && (i === 0 || results[i - 1].section !== entry.section);
              return (
                <React.Fragment key={entry.href}>
                  {heading && (
                    <li role="presentation" className={cn("px-3 pb-1.5 text-[12.5px] font-medium text-muted", i > 0 ? "pt-5" : "pt-2")}>
                      {entry.section}
                    </li>
                  )}
                  <li
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(entry)}
                    ref={(node) => {
                      if (i === active) node?.scrollIntoView({ block: "nearest" });
                    }}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                      i === active && "bg-white/[0.05]",
                    )}
                  >
                    {i === active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[rgb(var(--neon-accent))] shadow-[0_0_6px_rgb(var(--neon-accent)/0.9),0_0_14px_rgb(var(--neon-accent)/0.5)]"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] text-fg">{entry.title}</span>
                      {entry.hint && <span className="mt-0.5 block truncate text-[13px] text-muted">{entry.hint}</span>}
                    </span>
                    {!grouped && <span className="shrink-0 text-[12.5px] text-muted">{entry.section}</span>}
                    {i === active && <CornerDownLeft size={14} className="shrink-0 text-muted" />}
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
          <div className="hidden items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[12.5px] text-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> to move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd> to open
            </span>
            <span className="ml-auto tabular-nums">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}
