import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { componentCategoryId } from "@/components/site/category-id";
import { CodeBlock } from "@/components/site/code-block";
import { CopyPage } from "@/components/site/copy-page";
import { JsonLd } from "@/components/site/json-ld";
import { ComponentPreview } from "@/components/site/component-preview";
import { CommandBlock, InstallTabs } from "@/components/site/install-tabs";
import { H2, H3, InlineCode, P, PageHeader, PagerLinks, Step, Steps, Trail, series, textLink } from "@/components/site/prose";
import { PropsTable } from "@/components/site/props-table";
import { Toc, type TocItem } from "@/components/site/toc";
import { registryUrl, siteConfig } from "@/config/site";
import { installCommand, runCommand } from "@/lib/commands";
import { highlight, readSource } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import { componentPath, examplePath, getItem, getNeighbours, isNew, registry } from "@/registry";
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
  const requires = (item.registryDependencies ?? []).map((dep) => getItem(dep)).filter((dep) => dep !== undefined);
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
    <div className="flex gap-12 xl:gap-16">
      <JsonLd data={structuredData} />
      <article className="min-w-0 max-w-[50rem] flex-1">
        <PageHeader
          meta={
            <Trail
              items={[
                { title: "Components", href: "/components" },
                { title: item.category, href: `/components#${componentCategoryId(item.category)}` },
              ]}
            />
          }
          title={item.name}
          action={<CopyPage href={`/components/${slug}.md`} registryItem={registryUrl(slug)} />}
          className="mb-12 sm:mb-14"
        >
          <p>{item.description}</p>
          {(requires.length > 0 || item.dependencies.length > 0 || isNew(item)) && (
            <p className="mt-4 text-[14.5px] leading-[1.6]">
              {isNew(item) && <span className="mr-2 text-[rgb(var(--neon-accent))]">New in {item.addedIn}.</span>}
              {requires.length > 0 && (
                <>
                  Built on{" "}
                  {series(
                    requires.map((dep) => (
                      <Link key={dep.slug} href={`/components/${dep.slug}`} className={textLink}>
                        {dep.name}
                      </Link>
                    )),
                  )}
                  .{" "}
                </>
              )}
              {item.dependencies.length > 0 && (
                <>
                  Installs{" "}
                  {series(
                    item.dependencies.map((dep) => (
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

        <ComponentPreview
          html={hero.html}
          code={hero.code}
          title={hero.title}
          filename={`${slug}-${hero.name}.tsx`}
          size="lg"
        >
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
              {requires.length > 0 && (
                <Step title="Add the components it builds on">
                  <p>
                    {series(
                      requires.map((dep) => (
                        <Link key={dep.slug} href={`/components/${dep.slug}`} className={textLink}>
                          {dep.name}
                        </Link>
                      )),
                    )}
                    . The CLI adds them for you.
                  </p>
                </Step>
              )}
              <Step title="Add the helpers">
                <p>
                  Every component imports <InlineCode>cn</InlineCode> and <InlineCode>neonVars</InlineCode>. Copy{" "}
                  <InlineCode>lib/utils.ts</InlineCode> and <InlineCode>lib/neon.ts</InlineCode> from the{" "}
                  <Link href="/docs/installation#manual" className={textLink}>
                    installation guide
                  </Link>{" "}
                  if you haven&apos;t already.
                </p>
              </Step>
              <Step title={<>Paste the component into <InlineCode>components/ui/{slug}.tsx</InlineCode></>}>
                <CodeBlock code={source} title={`components/ui/${slug}.tsx`} maxHeight={460} />
              </Step>
            </Steps>
          }
        />

        <H2 id="usage">Usage</H2>
        <CodeBlock code={doc.usage} />

        {rest.length > 0 && (
          <>
            <H2 id="examples">Examples</H2>
            <div className="space-y-20">
              {rest.map((example) => (
                <section key={example.name} aria-labelledby={`example-${example.name}`}>
                  <H3 id={`example-${example.name}`} className="mt-0">
                    {example.title}
                  </H3>
                  {example.description && <P className="mb-4">{example.description}</P>}
                  <ComponentPreview
                    html={example.html}
                    code={example.code}
                    title={example.title}
                    filename={`${slug}-${example.name}.tsx`}
                  >
                    <example.component />
                  </ComponentPreview>
                </section>
              ))}
            </div>
          </>
        )}

        <H2 id="api">API reference</H2>
        <div className="space-y-16">
          {doc.api.map((part) => (
            <section key={part.name} aria-label={part.name}>
              {(doc.api.length > 1 || part.description) && (
                <div className="mb-5">
                  {doc.api.length > 1 && <h3 className="font-mono text-[15px] text-fg">{part.name}</h3>}
                  {part.description && (
                    <p className="mt-1.5 max-w-[40rem] text-[15px] leading-[1.6] text-muted">{part.description}</p>
                  )}
                </div>
              )}
              <PropsTable rows={part.props} />
            </section>
          ))}
        </div>

        {doc.notes?.length ? (
          <>
            <H2 id="accessibility">Accessibility</H2>
            <ul className="max-w-[40rem] divide-y divide-white/[0.06] border-y border-white/[0.06] text-[15.5px] leading-[1.65] text-muted">
              {doc.notes.map((note) => (
                <li key={note} className="py-3.5">
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

      <aside className="sticky top-14 hidden h-fit max-h-[calc(100dvh-3.5rem)] w-48 shrink-0 overflow-y-auto pt-[7.5rem] xl:block">
        <Toc items={toc} />
      </aside>
    </div>
  );
}
