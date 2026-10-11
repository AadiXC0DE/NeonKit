import type { Metadata } from "next";
import { ComponentGallery } from "@/components/site/component-gallery";
import { PageHeader } from "@/components/site/prose";
import { categories, isNew, registry } from "@/registry";
import { docs } from "@/registry/docs";

export const metadata: Metadata = {
  title: "Components",
  description: `All ${registry.length} NeonKit neon components for React and Tailwind: buttons, inputs, menus, date pickers, dialogs, toasts, tables and glow effects.`,
  alternates: { canonical: "/components" },
};

export default function ComponentsIndexPage() {
  const previews = Object.fromEntries(
    registry.map((item) => {
      const Demo = docs[item.slug]?.examples[0]?.component;
      return [item.slug, Demo ? <Demo /> : null];
    }),
  );

  return (
    <article className="max-w-6xl">
      <PageHeader eyebrow="Directory" title="Components">
        {registry.length} components across {categories.length} floors, every one live below. Each is a single file you
        own.
      </PageHeader>
      <ComponentGallery
        categories={categories}
        previews={previews}
        items={registry.map((item) => ({
          slug: item.slug,
          name: item.name,
          category: item.category,
          description: item.description,
          isNew: isNew(item),
        }))}
      />
    </article>
  );
}
