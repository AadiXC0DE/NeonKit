import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/site/prose";
import { categories, registry } from "@/registry";

export const metadata: Metadata = {
  title: "Components",
  description: `All ${registry.length} NeonKit neon components for React and Tailwind: buttons, inputs, selects, dialogs, toasts, tabs and glow effects.`,
  alternates: { canonical: "/components" },
};

export default function ComponentsIndexPage() {
  const number = new Map(registry.map((item, i) => [item.slug, i + 1]));
  return (
    <article className="max-w-4xl">
      <PageHeader eyebrow="Directory" title="Components">
        {registry.length} components across {categories.length} floors. Each is a single file you own.
      </PageHeader>

      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2
              id={`cat-${category}`}
              className="mb-2 flex items-baseline justify-between border-b border-line pb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dim"
            >
              {category}
              <span>{registry.filter((item) => item.category === category).length}</span>
            </h2>
            <ul>
              {registry
                .filter((item) => item.category === category)
                .map((item) => {
                  const index = number.get(item.slug) ?? 0;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/components/${item.slug}`}
                        className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 rounded-lg px-2 py-3 transition-colors hover:bg-white/[0.025] sm:grid-cols-[2.25rem_11rem_1fr_auto]"
                      >
                        <span className="font-mono text-[11px] tabular-nums text-dim">
                          {String(index).padStart(2, "0")}
                        </span>
                        <span className="font-medium text-fg transition-[color,text-shadow] duration-200 group-hover:neon-text">
                          {item.name}
                          {item.isNew && (
                            <span className="ml-2 align-middle font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--neon-accent))]">
                              new
                            </span>
                          )}
                        </span>
                        <span className="col-start-2 text-[14px] text-muted sm:col-start-auto">{item.description}</span>
                        <ArrowUpRight className="row-start-1 size-4 self-center text-dim opacity-0 transition-opacity group-hover:opacity-100 sm:col-start-4" />
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
