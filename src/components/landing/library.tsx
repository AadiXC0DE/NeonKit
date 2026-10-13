import Link from "next/link";
import { neonColors } from "@/lib/neon";
import { blocks, categories, orderedBlocks, registry, templates, templateThumb } from "@/registry";
import { Catalog } from "./catalog";
import { Filmstrip } from "./filmstrip";

const pages = (n: number) => (n === 1 ? "1 page" : `${n} pages`);

export function Library() {
  // Lead the strip with the blocks that read best as a picture; navbars and footers are thin strips.
  const quiet = ["Navigation", "Footers"];
  const stripBlocks = [
    ...orderedBlocks.filter((block) => !quiet.includes(block.category)),
    ...orderedBlocks.filter((block) => quiet.includes(block.category)),
  ];

  const groups = categories.map((category) => ({
    category,
    items: registry.filter((item) => item.category === category).map(({ slug, name }) => ({ slug, name })),
  }));

  return (
    <section aria-labelledby="library-title" className="relative pb-32 pt-40 sm:pb-44 sm:pt-56 lg:pt-24">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          <h2
            id="library-title"
            className="type-display text-balance text-[clamp(2.4rem,4.8vw,4.6rem)] text-fg lg:col-span-10 lg:col-start-3"
          >
            The whole kit, by name.
          </h2>
          <p className="mt-6 max-w-[36rem] text-[16.5px] leading-[1.6] text-muted lg:col-span-6 lg:col-start-3">
            {registry.length} components in {categories.length} groups. Point at a name to see it running, click it for
            the source.
          </p>
        </div>

        <div className="mt-20 sm:mt-24">
          <Catalog groups={groups} total={registry.length} />
        </div>
      </div>

      <div className="mt-36 sm:mt-48">
        <div className="mx-auto mb-8 flex max-w-[88rem] items-end justify-between gap-6 px-4 sm:px-6">
          <h3 className="max-w-[44rem] text-[clamp(1.35rem,2vw,1.75rem)] font-medium leading-[1.2] tracking-[-0.02em] text-fg">
            {blocks.length} blocks.{" "}
            <span className="text-muted">Heroes, pricing, auth, app shells. Paste three and you have a page.</span>
          </h3>
          <Link
            href="/blocks"
            className="shrink-0 text-[15px] font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]"
          >
            All blocks
          </Link>
        </div>
        <Filmstrip
          label="Blocks"
          color={neonColors.pink}
          frames={stripBlocks.map((block) => ({
            href: `/blocks/${block.slug}`,
            src: `/thumbs/${block.slug}.jpg`,
            name: block.name,
            meta: block.category,
          }))}
        />
      </div>

      <div className="mt-24 sm:mt-32">
        <div className="mx-auto mb-8 flex max-w-[88rem] items-end justify-between gap-6 px-4 sm:px-6">
          <h3 className="max-w-[44rem] text-[clamp(1.35rem,2vw,1.75rem)] font-medium leading-[1.2] tracking-[-0.02em] text-fg">
            {templates.length} templates. <span className="text-muted">Whole sites, every route wired.</span>
          </h3>
          <Link
            href="/templates"
            className="shrink-0 text-[15px] font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]"
          >
            All templates
          </Link>
        </div>
        <Filmstrip
          label="Templates"
          size="lg"
          color={neonColors.amber}
          frames={templates.map((template) => ({
            href: `/templates/${template.slug}`,
            src: templateThumb(template.slug),
            name: template.name,
            meta: pages(template.routes.length),
          }))}
        />
      </div>
    </section>
  );
}
