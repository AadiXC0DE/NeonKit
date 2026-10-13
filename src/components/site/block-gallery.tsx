"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { blockCategoryId } from "@/registry/ids";

export type GalleryBlock = {
  slug: string;
  name: string;
  category: string;
  description: string;
  isNew: boolean;
  /** How many NeonKit components the block is built from. */
  uses: number;
};

export function BlockGallery({ blocks, categories }: { blocks: GalleryBlock[]; categories: string[] }) {
  const [category, setCategory] = React.useState<string>("All");
  const shown = category === "All" ? blocks : blocks.filter((block) => block.category === category);
  const groups = (category === "All" ? categories : [category]).filter((name) =>
    shown.some((block) => block.category === name),
  );

  return (
    <div>
      <div role="tablist" aria-label="Category" className="flex flex-wrap gap-1.5">
        {["All", ...categories].map((name) => {
          const count = name === "All" ? blocks.length : blocks.filter((block) => block.category === name).length;
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

      <div className="mt-14 space-y-16">
        {groups.map((name) => (
          <section key={name} aria-labelledby={blockCategoryId(name)}>
            <h2
              id={blockCategoryId(name)}
              className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim"
            >
              {name}
              <span className="h-px flex-1 bg-line" />
            </h2>
            <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {shown
                .filter((block) => block.category === name)
                .map((block) => (
                  <li key={block.slug}>
                    <BlockCard block={block} />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export function BlockCard({ block }: { block: GalleryBlock }) {
  return (
    <Link href={`/blocks/${block.slug}`} className="group block outline-none">
      <div className="relative aspect-[8/5] overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 group-hover:border-[rgb(var(--neon-accent)/0.4)] group-hover:shadow-[0_0_32px_-8px_rgb(var(--neon-accent)/0.45)] group-focus-visible:ring-2 group-focus-visible:ring-[rgb(var(--neon-accent)/0.6)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
        <Image
          src={`/thumbs/${block.slug}.jpg`}
          alt=""
          width={960}
          height={600}
          unoptimized
          className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
        />
      </div>
      <div className="mt-3.5 flex items-baseline justify-between gap-3">
        <span className="font-medium text-fg transition-[color,text-shadow] group-hover:neon-text">{block.name}</span>
        <span className="flex shrink-0 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
          {block.isNew && <span className="text-[rgb(var(--neon-accent))]">new</span>}
          {block.uses} {block.uses === 1 ? "component" : "components"}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{block.description}</p>
    </Link>
  );
}
