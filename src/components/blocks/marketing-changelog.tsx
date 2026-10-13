"use client";

import * as React from "react";
import { ArrowDown, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

type Tag = "new" | "improved" | "fixed";

type Release = {
  version: string;
  date: string;
  title: string;
  summary?: string;
  code?: { file: string; lines: string[] };
  changes: { tag: Tag; text: string }[];
};

const RELEASES: Release[] = [
  {
    version: "4.2.0",
    date: "2026-10-06",
    title: "Warm remote cache on cold starts",
    summary: "The first build on a fresh CI runner used to pay for everything. Now it pays for what changed.",
    changes: [
      { tag: "new", text: "`kiln cache warm` primes the remote cache from the last green build before the first task runs." },
      { tag: "improved", text: "Cold builds on a 14k-module monorepo went from 3m 41s to 52s on an 8-core runner." },
      { tag: "fixed", text: "Watch mode no longer rebuilds twice when an editor saves by writing a temp file and renaming it." },
    ],
  },
  {
    version: "4.1.2",
    date: "2026-09-22",
    title: "Source maps and profiles, fixed",
    changes: [
      { tag: "fixed", text: "Source maps for re-exported barrel files point at the original module again." },
      { tag: "fixed", text: "`kiln build --profile` writes valid JSON on Windows paths with spaces." },
    ],
  },
  {
    version: "4.1.0",
    date: "2026-09-08",
    title: "Size budgets per package",
    summary: "Set a ceiling per package. The build fails with a diff of what grew, not just a number.",
    code: { file: "kiln.toml", lines: ["[budgets]", "\"@acme/checkout\" = \"48 kB\"", "\"@acme/search\"   = \"32 kB\""] },
    changes: [
      { tag: "new", text: "Per-package size budgets in `kiln.toml`, checked on every production build." },
      { tag: "new", text: "`kiln why <module>` prints the import chain that pulled a module into a chunk." },
      { tag: "improved", text: "Tree-shaking now drops unused class members in side-effect-free packages." },
    ],
  },
  {
    version: "4.0.0",
    date: "2026-08-11",
    title: "Kiln 4",
    summary: "A new resolver written in Rust, and Node 20 is the floor. Upgrade notes cover the three breaking changes.",
    changes: [
      { tag: "new", text: "Rust module resolver: 6.1× faster on deep `node_modules` trees." },
      { tag: "improved", text: "Config errors name the key, the file and the line instead of a stack trace." },
      { tag: "fixed", text: "Circular imports through type-only re-exports no longer stall the graph walker." },
    ],
  },
  {
    version: "3.9.4",
    date: "2026-07-28",
    title: "Stable CSS order",
    changes: [
      { tag: "fixed", text: "CSS modules with :global blocks keep their order across chunks." },
      { tag: "improved", text: "Lockfile hashing skips workspace packages that didn't change." },
    ],
  },
  {
    version: "3.9.0",
    date: "2026-07-14",
    title: "Task graph in the terminal",
    changes: [
      { tag: "new", text: "`kiln graph --tui` draws the task graph live, with the critical path lit." },
      { tag: "fixed", text: "Ctrl-C during a build now stops child workers instead of orphaning them." },
    ],
  },
];

const VISIBLE_AT_FIRST = 4;

const TAGS: { value: Tag; label: string; color: string; dot: string }[] = [
  { value: "new", label: "New", color: "cyan", dot: "bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" },
  { value: "improved", label: "Improved", color: "white", dot: "bg-white/70" },
  { value: "fixed", label: "Fixed", color: "green", dot: "bg-[#34d399]" },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${iso}T00:00:00Z`))
    .replace(/[   ]/g, " ");

// Backticks in a change mark commands and file names.
function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 ? (
          <code key={i} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-px font-mono text-[12.5px] text-white/90">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function TagBadge({ tag }: { tag: Tag }) {
  const meta = TAGS.find((t) => t.value === tag)!;
  // New inherits the block color; the other two carry their own meaning.
  return (
    <Badge size="sm" color={tag === "new" ? undefined : meta.color} variant={tag === "new" ? "outline" : "soft"} className="w-[68px] justify-center">
      {meta.label}
    </Badge>
  );
}

function Node({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 grid size-[15px] place-items-center rounded-full border-2 bg-[#05060a]",
        lit
          ? "border-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.9),0_0_26px_rgb(var(--neon)/0.5)]"
          : "border-[rgb(var(--neon)/0.22)] transition-colors duration-300 group-hover/release:border-[rgb(var(--neon)/0.55)]",
      )}
    >
      {lit && <span className="size-[5px] rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)]" />}
    </span>
  );
}

export default function MarketingChangelog() {
  const [filter, setFilter] = React.useState<"all" | Tag>("all");
  const [showAll, setShowAll] = React.useState(false);

  const releases = (showAll ? RELEASES : RELEASES.slice(0, VISIBLE_AT_FIRST))
    .map((release) => ({
      ...release,
      changes: release.changes.filter((change) => filter === "all" || change.tag === filter),
    }))
    .filter((release) => release.changes.length > 0);

  const count = (tag: Tag) =>
    RELEASES.reduce((sum, release) => sum + release.changes.filter((change) => change.tag === tag).length, 0);

  return (
    <section
      aria-labelledby="kiln-changelog-title"
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-12 lg:gap-10">
        <header className="lg:sticky lg:top-12 lg:col-span-4 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Kiln · Changelog</p>
          <h2
            id="kiln-changelog-title"
            className="mt-5 text-[clamp(2.4rem,5vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            What changed, and why.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
            Release notes for Kiln, the build tool. Shipped every other Tuesday, written by whoever did the work.
          </p>

          <div className="mt-8">
            <p id="kiln-filter-label" className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              Filter
            </p>
            <ToggleGroup
              aria-labelledby="kiln-filter-label"
              size="sm"
              value={filter}
              onValueChange={(value) => setFilter(value as typeof filter)}
              className="mt-2.5 max-w-full overflow-x-auto"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              {TAGS.map((tag) => (
                <ToggleGroupItem key={tag.value} value={tag.value}>
                  <span aria-hidden className={cn("size-1.5 rounded-full", tag.dot)} />
                  {tag.label}
                  <span className="font-mono text-[10px] text-white/35">{count(tag.value)}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-5 text-[13px]">
            <a href="#" className="inline-flex items-center gap-1.5 rounded-md text-white/60 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
              <Rss aria-hidden className="size-3.5" /> RSS
            </a>
            <a href="#" className="rounded-md text-white/60 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
              Upgrade guide for 4.0
            </a>
            <span className="font-mono text-[11px] text-white/35">npm i -D kiln@4.2.0</span>
          </div>

          <dl className="mt-8 hidden grid-cols-3 gap-4 lg:grid">
            {[
              ["19", "Releases in 2026"],
              ["2.4 d", "Median time to fix"],
              ["3", "Breaking changes"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse justify-end border-l border-white/[0.08] pl-3">
                <dt className="mt-1 text-[12px] leading-snug text-white/45">{label}</dt>
                <dd className="text-xl font-medium tracking-[-0.02em] text-white/90">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="lg:col-span-8">
          <ol aria-label="Releases" className="relative">
            {releases.map((release, index) => {
              const latest = release.version === RELEASES[0].version;
              const last = index === releases.length - 1;
              return (
                <li key={release.version} className="group/release relative grid grid-cols-[28px_1fr] gap-x-4 sm:grid-cols-[40px_1fr] sm:gap-x-6">
                  <div className="relative flex justify-center pt-[5px]">
                    {/* The tube: lit from the newest release down, dark glass after */}
                    {!last && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute bottom-[-6px] top-[20px] w-[2px] rounded-full",
                          latest
                            ? "bg-[linear-gradient(180deg,color-mix(in_srgb,rgb(var(--neon))_40%,white),rgb(var(--neon))_30%,rgb(var(--neon)/0.14))] shadow-[0_0_8px_rgb(var(--neon)/0.6)]"
                            : "bg-[rgb(var(--neon)/0.14)]",
                        )}
                      />
                    )}
                    <Node lit={latest} />
                  </div>

                  <article className={cn("min-w-0", last ? "pb-2" : "pb-14 sm:pb-16")}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px]">
                      <span className={latest ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]" : "text-white/70"}>
                        v{release.version}
                      </span>
                      <time dateTime={release.date} className="text-white/40">
                        {formatDate(release.date)}
                      </time>
                      {latest && (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
                          Latest
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[26px]">
                      {release.title}
                    </h3>
                    {release.summary && (
                      <p className="mt-2.5 max-w-[60ch] text-[15px] leading-relaxed text-white/55">{release.summary}</p>
                    )}
                    {release.code && (filter === "all" || filter === "new") && (
                      <figure className="mt-5 max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0a0b11]">
                        <figcaption className="border-b border-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                          {release.code.file}
                        </figcaption>
                        <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-white/75">
                          {release.code.lines.map((line, i) => (
                            <span key={i} className="block">
                              {line.startsWith("[") ? <span className="text-[rgb(var(--neon))]">{line}</span> : line}
                            </span>
                          ))}
                        </pre>
                      </figure>
                    )}
                    <ul className="mt-5 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06]">
                      {release.changes.map((change) => (
                        <li key={change.text} className="flex flex-col gap-2 bg-[#07080c] px-4 py-3.5 sm:flex-row sm:items-start sm:gap-4">
                          <TagBadge tag={change.tag} />
                          <p className="text-[14px] leading-relaxed text-white/75">
                            <Prose text={change.text} />
                          </p>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ol>

          {releases.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/50">
              Nothing tagged like that in these releases.
            </p>
          )}

          <div className="mt-6 pl-[44px] sm:pl-16">
            {!showAll ? (
              <Button variant="ghost" size="sm" onClick={() => setShowAll(true)} className="-ml-3">
                Older releases <ArrowDown aria-hidden />
              </Button>
            ) : (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
                Earlier history lives in the 3.x archive.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
