import type { Metadata } from "next";
import { BlockGallery } from "@/components/site/block-gallery";
import { PageShell } from "@/components/site/page-shell";
import { blockCategories, blocks, isNew } from "@/registry";

export const metadata: Metadata = {
  title: "Blocks",
  description: `${blocks.length} neon sections for React and Tailwind: heroes, navbars, features, pricing, testimonials, auth screens and app shells. Install any of them with one shadcn command.`,
  alternates: { canonical: "/blocks" },
};

export default function BlocksPage() {
  const categories = blockCategories.filter((category) => blocks.some((block) => block.category === category));

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Blocks</p>
        <h1 className="text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
          Whole sections, ready to glow.
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
          {blocks.length} heroes, pricing tables, auth screens and app shells, built from NeonKit components and working
          out of the box. One command adds the block and everything it uses.
        </p>
      </div>

      <div className="mt-14">
        <BlockGallery
          categories={categories}
          blocks={blocks.map((block) => ({
            slug: block.slug,
            name: block.name,
            category: block.category,
            description: block.description,
            isNew: isNew(block),
            uses: block.registryDependencies.length,
          }))}
        />
      </div>
    </PageShell>
  );
}
