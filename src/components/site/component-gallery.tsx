"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryItem = {
  slug: string;
  name: string;
  category: string;
  description: string;
  isNew: boolean;
};

const STAGE_WIDTH = 720;

/** Mounts its demo only once scrolled near, scaled to fit the card, and inert. */
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
      const pad = 28;
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
    <div ref={ref} className="relative h-52 overflow-hidden bg-background bg-dots">
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
  const [category, setCategory] = React.useState<string>("All");

  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      (!q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Category" className="flex flex-wrap gap-1.5">
          {["All", ...categories].map((name) => {
            const count = name === "All" ? items.length : items.filter((item) => item.category === name).length;
            const active = category === name;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(name)}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-[13px] transition-colors",
                  active
                    ? "border-[rgb(var(--neon-accent)/0.5)] bg-[rgb(var(--neon-accent)/0.08)] text-fg shadow-[0_0_14px_rgb(var(--neon-accent)/0.2)]"
                    : "border-line text-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {name}
                <span className="font-mono text-[10.5px] tabular-nums text-dim">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Filter components</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter components"
            className="h-9 w-full rounded-lg border border-line bg-white/[0.02] pl-9 pr-3 text-[14px] text-fg outline-none transition-colors placeholder:text-dim focus:border-[rgb(var(--neon-accent)/0.5)]"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-line py-16 text-center text-[15px] text-dim">
          Nothing lit up for &ldquo;{query}&rdquo;.{" "}
          <Link href="/request" className="text-fg underline decoration-white/20 underline-offset-4">
            Request it
          </Link>
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/components/${item.slug}`}
                className="group block overflow-hidden rounded-xl border border-line transition-[border-color,box-shadow] duration-200 hover:border-[rgb(var(--neon-accent)/0.4)] hover:shadow-[0_0_28px_-8px_rgb(var(--neon-accent)/0.45)]"
              >
                <LivePreview>{previews[item.slug]}</LivePreview>
                <div className="border-t border-line bg-surface px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-fg transition-[color,text-shadow] group-hover:neon-text">
                      {item.name}
                    </span>
                    <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
                      {item.isNew && <span className="text-[rgb(var(--neon-accent))]">new</span>}
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[13.5px] text-muted">{item.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
