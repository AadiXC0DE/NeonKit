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
  const groups = categories.filter((category) => registry.some((item) => item.category === category));

  return (
    <article>
      <PageHeader title="Components" size="lg" className="mb-10 sm:mb-12">
        {registry.length} components in {groups.length} groups, each one running below. Every one is a single file
        that lands in your repo, and all of them take their color from one variable.
      </PageHeader>
      <ComponentGallery
        categories={groups}
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
