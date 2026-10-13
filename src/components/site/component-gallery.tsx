"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { componentCategoryId } from "./category-id";

export type GalleryItem = {
  slug: string;
  name: string;
  category: string;
  description: string;
  isNew: boolean;
};

const STAGE_WIDTH = 720;

/** One dry line per group. Groups added later simply go without. */
const blurbs: Record<string, string> = {
  Foundations: "What everything else is drawn with.",
  Forms: "Every field a settings page or a checkout needs, from a text box to a date range.",
  Buttons: "For when a plain button isn't enough: hold to confirm, a power key, a shimmer.",
  "Data Display": "Badges, tables, tabs, charts and the containers that hold content.",
  Navigation: "Breadcrumbs, menus, steppers and sidebars.",
  Overlay: "Everything that floats above the page: dialogs, menus, popovers, sheets.",
  Feedback: "Progress, loading, alerts, toasts and the screen for when there's nothing yet.",
  Layout: "Separators, scroll areas and rows that fold away.",
  AI: "Messages, a prompt box and the conversation that holds them.",
  Text: "Type that lights up, flickers, scrambles or flips.",
  Instruments: "Knobs, faders, gauges and scopes. Each one is a real input or a live readout.",
  Effects: "Light you put on something else: beams, frames, a cursor, CRT glass.",
  Backgrounds: "Full-bleed scenery for behind a section.",
};

/** Mounts its demo only once scrolled near, scaled to fit the tile, and inert. */
function LivePreview({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [scale, setScale] = React.useState(0.5);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Fit both ways: offsetWidth/Height ignore the transform, so they're the demo's natural size.
  React.useEffect(() => {
    const node = ref.current;
    const stage = stageRef.current;
    if (!node || !stage) return;
    const fit = () => {
      const pad = 36;
      setScale(
        Math.min(
          1,
          (node.clientWidth - pad) / STAGE_WIDTH,
          (node.clientHeight - pad) / Math.max(stage.offsetHeight, 1),
        ),
      );
    };
    const ro = new ResizeObserver(fit);
    ro.observe(node);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className="nk-stage relative h-56 overflow-hidden rounded-xl border border-white/[0.06] transition-[border-color] duration-200 group-hover:border-[rgb(var(--neon-accent)/0.35)] [--neon:var(--neon-accent)]"
    >
      {visible && (
        <div
          ref={stageRef}
          inert
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 flex items-center justify-center"
          style={{ width: STAGE_WIDTH, transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Keeps the jump link for the group in view lit while you scroll. */
function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = React.useState<string | undefined>();
  const key = ids.join(",");
  React.useEffect(() => {
    const nodes = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;
    const onScroll = () => {
      const line = 160;
      let found: string | undefined;
      for (const node of nodes) if (node.getBoundingClientRect().top <= line) found = node.id;
      setCurrent(found);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);
  return current;
}

export function ComponentGallery({
  items,
  categories,
  previews,
}: {
  items: GalleryItem[];
  categories: string[];
  previews: Record<string, React.ReactNode>;
}) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const matches = (item: GalleryItem) =>
    !q ||
    item.name.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q);

  const groups = categories
    .map((category) => ({ category, items: items.filter((item) => item.category === category && matches(item)) }))
    .filter((group) => group.items.length > 0);
  const shown = groups.reduce((sum, group) => sum + group.items.length, 0);
  const current = useCurrentSection(groups.map((group) => componentCategoryId(group.category)));

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 border-b border-white/[0.06] bg-background/85 px-4 backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
        <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:gap-8">
          <label className="relative block shrink-0 lg:order-2 lg:ml-auto lg:w-64">
            <span className="sr-only">Filter components</span>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Filter ${items.length} components`}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 text-[14px] text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-[rgb(var(--neon-accent)/0.55)] focus:shadow-[0_0_0_3px_rgb(var(--neon-accent)/0.12)]"
            />
          </label>
          <nav aria-label="Groups" className="-mx-4 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 lg:order-1">
            <ul className="flex w-max items-center gap-x-5 text-[13.5px] lg:w-auto lg:flex-wrap lg:gap-y-1">
              {groups.map(({ category, items: groupItems }) => {
                const id = componentCategoryId(category);
                const active = current === id;
                return (
                  <li key={category}>
                    <a
                      href={`#${id}`}
                      aria-current={active ? "location" : undefined}
                      className={cn(
                        "inline-flex h-7 items-center gap-1.5 rounded-md whitespace-nowrap transition-colors duration-150",
                        active ? "text-fg" : "text-muted hover:text-fg",
                      )}
                    >
                      <span className={cn(active && "[text-shadow:0_0_12px_rgb(var(--neon-accent)/0.6)]")}>{category}</span>
                      <span className="text-[12px] tabular-nums text-muted">{groupItems.length}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {q ? `${shown} ${shown === 1 ? "component matches" : "components match"}` : ""}
      </p>

      {groups.length === 0 ? (
        <div className="py-28">
          <p className="type-display text-[clamp(1.75rem,3vw,2.5rem)] text-fg">Nothing called &ldquo;{query}&rdquo; yet.</p>
          <p className="mt-4 text-[16px] text-muted">
            <Link
              href="/request"
              className="text-fg underline decoration-white/25 underline-offset-[0.22em] transition-[text-decoration-color] hover:decoration-[rgb(var(--neon-accent))]"
            >
              Request it
            </Link>{" "}
            and it goes on the list.
          </p>
        </div>
      ) : (
        <div className="space-y-24 pt-14 sm:space-y-32 sm:pt-16">
          {groups.map(({ category, items: groupItems }) => {
            const id = componentCategoryId(category);
            return (
              <section key={category} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 lg:scroll-mt-28">
                <div className="mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-baseline lg:gap-10">
                  <h2 id={`${id}-title`} className="type-display shrink-0 text-[clamp(1.9rem,3vw,2.6rem)] text-fg lg:w-[17rem]">
                    {category}
                    <span className="ml-3 align-top font-sans text-[14px] font-normal tracking-normal tabular-nums text-muted [font-stretch:100%]">
                      {groupItems.length}
                    </span>
                  </h2>
                  {blurbs[category] && !q && (
                    <p className="max-w-[34rem] text-[15.5px] leading-[1.55] text-muted">{blurbs[category]}</p>
                  )}
                </div>
                <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 2xl:grid-cols-3">
                  {groupItems.map((item) => (
                    <li key={item.slug} className="group relative">
                      <LivePreview>{previews[item.slug]}</LivePreview>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <Link
                          href={`/components/${item.slug}`}
                          className="rounded-md text-[15.5px] font-medium text-fg outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-[rgb(var(--neon-accent)/0.6)] focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-background"
                        >
                          {item.name}
                        </Link>
                        {item.isNew && <span className="text-[12.5px] text-[rgb(var(--neon-accent))]">New</span>}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[14px] leading-[1.55] text-muted">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
