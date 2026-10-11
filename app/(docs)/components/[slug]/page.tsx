import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/site/code-block";
import { CopyPage } from "@/components/site/copy-page";
import { JsonLd } from "@/components/site/json-ld";
import { ComponentPreview } from "@/components/site/component-preview";
import { CommandBlock, InstallTabs } from "@/components/site/install-tabs";
import { H2, H3, InlineCode, P, PagerLinks, Step, Steps } from "@/components/site/prose";
import { PropsTable } from "@/components/site/props-table";
import { Toc, type TocItem } from "@/components/site/toc";
import { registryUrl, siteConfig } from "@/config/site";
import { installCommand, runCommand } from "@/lib/commands";
import { highlight, readSource } from "@/lib/highlight";
import { componentPath, examplePath, getItem, getNeighbours, registry } from "@/registry";
import { docs } from "@/registry/docs";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return {};
  const title = `${item.name}`;
  const description = `${item.description} A neon ${item.name.toLowerCase()} component for React and Tailwind, installable with the shadcn CLI.`;
  return {
    title,
    description,
    keywords: [`neon ${item.name.toLowerCase()}`, `react ${item.name.toLowerCase()}`, `tailwind ${item.name.toLowerCase()}`, `shadcn ${item.name.toLowerCase()}`, ...siteConfig.keywords.slice(0, 4)],
    alternates: {
      canonical: `/components/${slug}`,
      types: { "text/markdown": [{ url: `/components/${slug}.md`, title: `${item.name} as Markdown` }] },
    },
    openGraph: {
      title: `${item.name} · NeonKit`,
      description,
      url: `/components/${slug}`,
      type: "article",
      siteName: "NeonKit",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} · NeonKit`,
      description,
      creator: `@${siteConfig.author.handle}`,
    },
  };
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params;
  const item = getItem(slug);
  const doc = docs[slug];
  if (!item || !doc) notFound();

  const [source, cli, deps, examples] = await Promise.all([
    readSource(componentPath(slug)),
    runCommand(`shadcn@latest add ${registryUrl(slug)}`),
    item.dependencies.length ? installCommand(item.dependencies) : null,
    Promise.all(
      doc.examples.map(async (example) => {
        const code = await readSource(examplePath(slug, example.name));
        return { ...example, code, html: await highlight(code) };
      }),
    ),
  ]);

  const [hero, ...rest] = examples;
  const { prev, next } = getNeighbours(slug);

  const toc: TocItem[] = [
    { id: "installation", title: "Installation" },
    { id: "usage", title: "Usage" },
    ...(rest.length
      ? [
          { id: "examples", title: "Examples" },
          ...rest.map((example) => ({ id: `example-${example.name}`, title: example.title, depth: 3 as const })),
        ]
      : []),
    { id: "api", title: "API reference" },
    ...(doc.notes?.length ? [{ id: "accessibility", title: "Accessibility" }] : []),
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: `${item.name}: neon React component`,
      description: item.description,
      url: `${siteConfig.url}/components/${slug}`,
      author: { "@type": "Person", name: siteConfig.author.name, url: siteConfig.author.site },
      isPartOf: { "@type": "WebSite", name: "NeonKit", url: siteConfig.url },
      proficiencyLevel: "Beginner",
      dependencies: item.dependencies.join(", ") || undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NeonKit", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Components", item: `${siteConfig.url}/components` },
        { "@type": "ListItem", position: 3, name: item.name, item: `${siteConfig.url}/components/${slug}` },
      ],
    },
  ];

  return (
    <div className="flex gap-14">
      <JsonLd data={structuredData} />
      <article className="min-w-0 max-w-3xl flex-1">
        <header className="mb-8">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
            <Link href="/components" className="transition-colors hover:text-muted">
              Components
            </Link>
            <span className="mx-2 text-white/15">/</span>
            {item.category}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-fg">{item.name}</h1>
            <CopyPage href={`/components/${slug}.md`} />
          </div>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">{item.description}</p>
          {item.dependencies.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-dim">
              <span className="uppercase tracking-[0.14em]">Uses</span>
              {item.dependencies.map((dep) => (
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

        <ComponentPreview html={hero.html} code={hero.code} title={hero.title}>
          <hero.component />
        </ComponentPreview>

        <H2 id="installation">Installation</H2>
        <InstallTabs
          cli={cli}
          manual={
            <Steps>
              {deps && (
                <Step title="Install the dependencies">
                  <CommandBlock commands={deps} />
                </Step>
              )}
              <Step title="Add the helpers">
                <p>
                  Every component imports <InlineCode>cn</InlineCode> and <InlineCode>neonVars</InlineCode>. Copy{" "}
                  <InlineCode>lib/utils.ts</InlineCode> and <InlineCode>lib/neon.ts</InlineCode> from the{" "}
                  <Link href="/docs/installation#manual" className="text-fg underline decoration-white/20 underline-offset-4">
                    installation guide
                  </Link>{" "}
                  if you have not already.
                </p>
              </Step>
              <Step title={<>Paste the component into <InlineCode>components/ui/{slug}.tsx</InlineCode></>}>
                <CodeBlock code={source} title={`components/ui/${slug}.tsx`} maxHeight={440} />
              </Step>
            </Steps>
          }
        />

        <H2 id="usage">Usage</H2>
        <CodeBlock code={doc.usage} />

        {rest.length > 0 && (
          <>
            <H2 id="examples">Examples</H2>
            {rest.map((example) => (
              <section key={example.name}>
                <H3 id={`example-${example.name}`}>{example.title}</H3>
                {example.description && <P>{example.description}</P>}
                <ComponentPreview html={example.html} code={example.code} title={example.title} className="mt-4">
                  <example.component />
                </ComponentPreview>
              </section>
            ))}
          </>
        )}

        <H2 id="api">API reference</H2>
        <div className="space-y-10">
          {doc.api.map((part) => (
            <section key={part.name}>
              <h3 className="mb-1 font-mono text-[15px] text-fg">{part.name}</h3>
              {part.description && <p className="mb-4 text-[14px] text-muted">{part.description}</p>}
              <PropsTable rows={part.props} />
            </section>
          ))}
        </div>

        {doc.notes?.length ? (
          <>
            <H2 id="accessibility">Accessibility</H2>
            <ul className="max-w-2xl space-y-3 text-[15px] leading-relaxed text-muted">
              {doc.notes.map((note) => (
                <li key={note} className="flex gap-3">
                  <span className="mt-[11px] h-px w-3 shrink-0 bg-[rgb(var(--neon-accent))]" />
                  {note}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <PagerLinks
          prev={prev && { title: prev.name, href: `/components/${prev.slug}` }}
          next={next && { title: next.name, href: `/components/${next.slug}` }}
        />
      </article>

      <aside className="sticky top-24 hidden h-fit w-48 shrink-0 xl:block">
        <Toc items={toc} />
      </aside>
    </div>
  );
}
