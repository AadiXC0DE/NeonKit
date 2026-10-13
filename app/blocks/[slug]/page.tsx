import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockCard } from "@/components/site/block-gallery";
import { BlockPreview } from "@/components/site/block-preview";
import { CodeBlock } from "@/components/site/code-block";
import { CommandBlock } from "@/components/site/install-tabs";
import { JsonLd } from "@/components/site/json-ld";
import { PageShell } from "@/components/site/page-shell";
import { InlineCode, PageHeader, PagerLinks, Trail, series, textLink } from "@/components/site/prose";
import { registryUrl, siteConfig } from "@/config/site";
import { runCommand } from "@/lib/commands";
import { highlight, readSource } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import { blockCategoryId, blockPath, blocks, getBlock, getBlockNeighbours, getItem, isNew } from "@/registry";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.slug }));
}

const componentName = (slug: string) => slug.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) return {};
  const description = `${block.description} A neon ${block.category.toLowerCase()} block for React and Tailwind, installable with the shadcn CLI.`;
  const image = { url: `/thumbs/${slug}.jpg`, width: 960, height: 600, alt: `${block.name} block preview` };
  return {
    title: `${block.name} block`,
    description,
    alternates: { canonical: `/blocks/${slug}` },
    openGraph: {
      title: `${block.name} · NeonKit blocks`,
      description,
      url: `/blocks/${slug}`,
      type: "article",
      siteName: "NeonKit",
      locale: "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${block.name} · NeonKit blocks`,
      description,
      creator: `@${siteConfig.author.handle}`,
      images: [image.url],
    },
  };
}

export default async function BlockPage({ params }: Props) {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) notFound();

  const [code, cli] = await Promise.all([
    readSource(blockPath(slug)),
    runCommand(`shadcn@latest add ${registryUrl(slug)}`),
  ]);
  const html = await highlight(code);
  const uses = block.registryDependencies.map((dep) => getItem(dep)).filter((dep) => dep !== undefined);
  const related = blocks.filter((other) => other.category === block.category && other.slug !== slug).slice(0, 3);
  const { prev, next } = getBlockNeighbours(slug);
  const name = componentName(slug);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: `${block.name}: neon React block`,
      description: block.description,
      url: `${siteConfig.url}/blocks/${slug}`,
      image: `${siteConfig.url}/thumbs/${slug}.jpg`,
      author: { "@type": "Person", name: siteConfig.author.name, url: siteConfig.author.site },
      isPartOf: { "@type": "WebSite", name: "NeonKit", url: siteConfig.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NeonKit", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Blocks", item: `${siteConfig.url}/blocks` },
        { "@type": "ListItem", position: 3, name: block.name, item: `${siteConfig.url}/blocks/${slug}` },
      ],
    },
  ];

  return (
    <PageShell>
      <JsonLd data={structuredData} />
      <PageHeader
        meta={
          <Trail
            items={[
              { title: "Blocks", href: "/blocks" },
              { title: block.category, href: `/blocks#${blockCategoryId(block.category)}` },
            ]}
          />
        }
        title={block.name}
        className="mb-12"
      >
        <p>{block.description}</p>
        {(uses.length > 0 || block.dependencies.length > 0 || isNew(block)) && (
          <p className="mt-4 text-[14.5px] leading-[1.6]">
            {isNew(block) && <span className="mr-2 text-[rgb(var(--neon-accent))]">New in {block.addedIn}.</span>}
            {uses.length > 0 && (
              <>
                Built from{" "}
                {series(
                  uses.map((dep) => (
                    <Link key={dep.slug} href={`/components/${dep.slug}`} className={textLink}>
                      {dep.name}
                    </Link>
                  )),
                )}
                .{" "}
              </>
            )}
            {block.dependencies.length > 0 && (
              <>
                Installs{" "}
                {series(
                  block.dependencies.map((dep) => (
                    <a
                      key={dep}
                      href={`https://www.npmjs.com/package/${dep}`}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(textLink, "font-mono text-[0.9em]")}
                    >
                      {dep}
                    </a>
                  )),
                )}
                .
              </>
            )}
          </p>
        )}
      </PageHeader>

      <BlockPreview slug={slug} html={html} code={code} height={block.height} />

      <div className="mt-24 grid gap-16 lg:grid-cols-12 lg:gap-8">
        <section aria-labelledby="installation" className="min-w-0 lg:col-span-6">
          <h2 id="installation" className="type-display mb-6 text-[1.75rem] text-fg sm:text-[2rem]">
            Installation
          </h2>
          <CommandBlock commands={cli} />
          <p className="mt-5 max-w-[34rem] text-[15px] leading-[1.65] text-muted">
            Adds <InlineCode>components/{slug}.tsx</InlineCode>
            {uses.length > 0 && <> and the {uses.length} NeonKit components it&apos;s built from</>}. The color is set once,
            at the root of the block; change it there and everything inside follows.
          </p>
        </section>
        <section aria-labelledby="usage" className="min-w-0 lg:col-span-5 lg:col-start-8">
          <h2 id="usage" className="type-display mb-6 text-[1.75rem] text-fg sm:text-[2rem]">
            Usage
          </h2>
          <CodeBlock
            title="app/page.tsx"
            code={`import ${name} from "@/components/${slug}";\n\nexport default function Page() {\n  return <${name} />;\n}`}
          />
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-28">
          <h2 id="related" className="type-display mb-8 text-[1.75rem] text-fg sm:text-[2rem]">
            More {block.category.toLowerCase()}
          </h2>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((other) => (
              <li key={other.slug}>
                <BlockCard
                  block={{
                    slug: other.slug,
                    name: other.name,
                    category: other.category,
                    description: other.description,
                    isNew: isNew(other),
                    uses: other.registryDependencies.length,
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <PagerLinks
        prev={prev && { title: prev.name, href: `/blocks/${prev.slug}` }}
        next={next && { title: next.name, href: `/blocks/${next.slug}` }}
      />
    </PageShell>
  );
}
