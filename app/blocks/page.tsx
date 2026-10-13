import type { Metadata } from "next";
import { BlockGallery } from "@/components/site/block-gallery";
import { PageShell } from "@/components/site/page-shell";
import { PageHeader } from "@/components/site/prose";
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
      <PageHeader title="Blocks" size="lg" className="mb-10 sm:mb-12">
        {blocks.length} heroes, pricing tables, auth screens and app shells, each one assembled from NeonKit
        components with believable copy. One command adds the block and every component it uses.
      </PageHeader>
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
    </PageShell>
  );
}
