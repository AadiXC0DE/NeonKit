import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockCard } from "@/components/site/block-gallery";
import { BlockPreview } from "@/components/site/block-preview";
import { CodeBlock } from "@/components/site/code-block";
import { CommandBlock } from "@/components/site/install-tabs";
import { JsonLd } from "@/components/site/json-ld";
import { PageShell } from "@/components/site/page-shell";
import { PagerLinks } from "@/components/site/prose";
import { registryUrl, siteConfig } from "@/config/site";
import { runCommand } from "@/lib/commands";
import { highlight, readSource } from "@/lib/highlight";
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
      <header className="mb-10 max-w-3xl">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
          <Link href="/blocks" className="transition-colors hover:text-muted">
            Blocks
          </Link>
          <span className="mx-2 text-white/15">/</span>
          <Link href={`/blocks#${blockCategoryId(block.category)}`} className="transition-colors hover:text-muted">
            {block.category}
          </Link>
          {isNew(block) && <span className="ml-3 text-[rgb(var(--neon-accent))]">new</span>}
        </p>
        <h1 className="text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-fg">
          {block.name}
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{block.description}</p>
        {(uses.length > 0 || block.dependencies.length > 0) && (
          <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-dim">
            <span className="uppercase tracking-[0.14em]">Uses</span>
            {uses.map((dep) => (
              <Link
                key={dep.slug}
                href={`/components/${dep.slug}`}
                className="rounded-md border border-[rgb(var(--neon-accent)/0.3)] px-2 py-0.5 text-[rgb(var(--neon-accent))] transition-colors hover:border-[rgb(var(--neon-accent)/0.6)]"
              >
                {dep.name}
              </Link>
            ))}
            {block.dependencies.map((dep) => (
              <a
                key={dep}
                href={`https://www.npmjs.com/package/${dep}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line px-2 py-0.5 text-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                {dep}
              </a>
            ))}
          </div>
        )}
      </header>

      <BlockPreview slug={slug} html={html} code={code} height={block.height} />

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="installation">
          <h2 id="installation" className="mb-4 text-xl font-semibold tracking-[-0.02em] text-fg">
            Installation
          </h2>
          <CommandBlock commands={cli} />
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
            Adds <code className="font-mono text-[13px] text-fg">components/{slug}.tsx</code>
            {uses.length > 0 && <> and the {uses.length} NeonKit components it is built from</>}. The color is set once
            at the root of the block; change it there and everything inside follows.
          </p>
        </section>
        <section aria-labelledby="usage">
          <h2 id="usage" className="mb-4 text-xl font-semibold tracking-[-0.02em] text-fg">
            Usage
          </h2>
          <CodeBlock code={`import ${name} from "@/components/${slug}";\n\nexport default function Page() {\n  return <${name} />;\n}`} />
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-20">
          <h2
            id="related"
            className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim"
          >
            More {block.category.toLowerCase()}
            <span className="h-px flex-1 bg-line" />
          </h2>
          <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
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
