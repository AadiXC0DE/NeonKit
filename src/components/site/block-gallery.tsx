"use client";

import * as React from "react";
import Link from "next/link";
import { LiveFrame } from "./live-preview";
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
  const panelId = React.useId();

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 border-b border-white/[0.06] bg-background/85 px-4 backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6">
        <div
          role="tablist"
          aria-label="Category"
          className="-mx-4 flex w-auto gap-x-1 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {["All", ...categories].map((name) => {
            const count = name === "All" ? blocks.length : blocks.filter((block) => block.category === name).length;
            const active = category === name;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={panelId}
                onClick={() => setCategory(name)}
                className={cn(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[13.5px] transition-colors duration-150 first:-ml-2.5",
                  active ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg",
                )}
              >
                {name}
                <span className="text-[12px] tabular-nums text-muted">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id={panelId} role="tabpanel" aria-label={category === "All" ? "All blocks" : category} className="space-y-24 pt-14 sm:space-y-28 sm:pt-16">
        {groups.map((name) => {
          const items = shown.filter((block) => block.category === name);
          return (
            <section key={name} aria-labelledby={blockCategoryId(name)} className="scroll-mt-32">
              <h2
                id={blockCategoryId(name)}
                className="type-display mb-8 scroll-mt-32 text-[clamp(1.75rem,2.6vw,2.25rem)] text-fg"
              >
                {name}
                <span className="ml-3 align-top font-sans text-[14px] font-normal tracking-normal tabular-nums text-muted [font-stretch:100%]">
                  {items.length}
                </span>
              </h2>
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((block) => (
                  <li key={block.slug}>
                    <BlockCard block={block} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function BlockCard({ block }: { block: GalleryBlock }) {
  return (
    <Link href={`/blocks/${block.slug}`} className="group block rounded-xl outline-none">
      <div className="relative aspect-[8/5] overflow-hidden rounded-xl border border-white/[0.07] bg-surface transition-[border-color,box-shadow] duration-200 ease-out-quint group-hover:border-[rgb(var(--neon-accent)/0.4)] group-hover:shadow-[0_0_0_1px_rgb(var(--neon-accent)/0.12),0_18px_48px_-20px_rgb(var(--neon-accent)/0.45)] group-focus-visible:ring-2 group-focus-visible:ring-[rgb(var(--neon-accent)/0.6)] group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-background">
        <LiveFrame src={`/view/${block.slug}`} title={`${block.name} preview`} still className="size-full" />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="text-[15.5px] font-medium text-fg">{block.name}</span>
        <span className="flex shrink-0 items-baseline gap-2.5 text-[13px] text-muted">
          {block.isNew && <span className="text-[rgb(var(--neon-accent))]">New</span>}
          {block.uses} {block.uses === 1 ? "component" : "components"}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-[14px] leading-[1.55] text-muted">{block.description}</p>
    </Link>
  );
}
