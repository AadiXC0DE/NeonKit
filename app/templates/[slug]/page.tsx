import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/ui/icons";
import { CodeBlock } from "@/components/site/code-block";
import { CommandBlock } from "@/components/site/install-tabs";
import { JsonLd } from "@/components/site/json-ld";
import { PageShell } from "@/components/site/page-shell";
import { PreviewShot } from "@/components/site/preview-shot";
import { InlineCode, PageHeader, PagerLinks, Trail, series, textLink } from "@/components/site/prose";
import { registryUrl, siteConfig } from "@/config/site";
import { runCommand } from "@/lib/commands";
import { readSource } from "@/lib/highlight";
import { templateTargets } from "@/lib/templates";
import {
  getItem,
  getTemplate,
  getTemplateNeighbours,
  isNew,
  templatePreviewPath,
  templateShot,
  templateThumb,
  templates,
} from "@/registry";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return templates.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) return {};
  const description = `${template.description} A neon Next.js template built from NeonKit components, installable with the shadcn CLI.`;
  const image = { url: templateThumb(slug), width: 960, height: 600, alt: `${template.name} template preview` };
  return {
    title: `${template.name} template`,
    description,
    alternates: { canonical: `/templates/${slug}` },
    openGraph: {
      title: `${template.name} · NeonKit templates`,
      description,
      url: `/templates/${slug}`,
      type: "article",
      siteName: "NeonKit",
      locale: "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.name} · NeonKit templates`,
      description,
      creator: `@${siteConfig.author.handle}`,
      images: [image.url],
    },
  };
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) notFound();

  const [cli, config, targets] = await Promise.all([
    runCommand(`shadcn@latest add ${registryUrl(slug)}`),
    readSource(`src/components/templates/${slug}/config.ts`),
    templateTargets(slug),
  ]);
  // Show the config as it lands in the user's app, where the registry build has rewritten the preview path.
  const installedConfig = config.replaceAll(`/preview/${slug}`, `/${slug}`);
  const uses = template.registryDependencies.map((dep) => getItem(dep)).filter((dep) => dep !== undefined);
  const { prev, next } = getTemplateNeighbours(slug);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: `${template.name}: neon Next.js template`,
      description: template.description,
      url: `${siteConfig.url}/templates/${slug}`,
      image: `${siteConfig.url}${templateThumb(slug)}`,
      author: { "@type": "Person", name: siteConfig.author.name, url: siteConfig.author.site },
      isPartOf: { "@type": "WebSite", name: "NeonKit", url: siteConfig.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NeonKit", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Templates", item: `${siteConfig.url}/templates` },
        { "@type": "ListItem", position: 3, name: template.name, item: `${siteConfig.url}/templates/${slug}` },
      ],
    },
  ];

  return (
    <PageShell>
      <JsonLd data={structuredData} />
      <PageHeader
        meta={<Trail items={[{ title: "Templates", href: "/templates" }, { title: template.name }]} />}
        title={template.name}
        action={
          <Button asChild variant="solid" size="lg" className="shrink-0">
            <a href={templatePreviewPath(slug)} target="_blank" rel="noreferrer">
              Open the live preview <ArrowUpRight />
            </a>
          </Button>
        }
        className="mb-14"
      >
        <p>{template.description}</p>
        <p className="mt-4 text-[14.5px] leading-[1.6]">
          {isNew(template) && <span className="mr-2 text-[rgb(var(--neon-accent))]">New in {template.addedIn}.</span>}
          {template.routes.length === 1 ? "One page" : `${template.routes.length} pages`}, {uses.length} components,{" "}
          {targets.length} files.
        </p>
      </PageHeader>

      <section aria-labelledby="pages">
        <h2 id="pages" className="sr-only">
          Pages
        </h2>
        <ul className={template.routes.length > 1 ? "grid gap-x-6 gap-y-10 md:grid-cols-2" : "grid"}>
          {template.routes.map((route, i) => (
            <li key={route} className={template.routes.length > 2 && i === 0 ? "md:col-span-2" : undefined}>
              <a
                href={templatePreviewPath(slug, route)}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-[14px] outline-none"
              >
                <span className="block overflow-hidden rounded-[14px] border border-white/[0.07] bg-surface transition-[border-color,box-shadow] duration-200 ease-out-quint group-hover:border-[rgb(var(--neon-accent)/0.4)] group-hover:shadow-[0_0_0_1px_rgb(var(--neon-accent)/0.12),0_24px_64px_-28px_rgb(var(--neon-accent)/0.5)] group-focus-visible:ring-2 group-focus-visible:ring-[rgb(var(--neon-accent)/0.6)] group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-background">
                  <PreviewShot
                    base={templateShot(slug, route)}
                    sizes={template.routes.length > 2 && i === 0 ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"}
                  />
                </span>
                <span className="mt-3.5 flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-[13px] text-fg">
                    /{slug}
                    {route}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[13.5px] text-muted transition-colors group-hover:text-fg">
                    Open <ArrowUpRight size={14} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-28 grid gap-16 lg:grid-cols-12 lg:gap-8">
        <section aria-labelledby="installation" className="min-w-0 lg:col-span-6">
          <h2 id="installation" className="type-display mb-6 text-[1.75rem] text-fg sm:text-[2rem]">
            Installation
          </h2>
          <CommandBlock commands={cli} />
          <p className="mt-5 max-w-[34rem] text-[15px] leading-[1.65] text-muted">
            Writes the pages to <InlineCode>app/{slug}</InlineCode>, their sections to{" "}
            <InlineCode>components/templates/{slug}</InlineCode> and adds the {uses.length} NeonKit components it&apos;s
            built from. Then open <InlineCode>/{slug}</InlineCode> in your app.
          </p>
          {uses.length > 0 && (
            <p className="mt-4 max-w-[34rem] text-[15px] leading-[1.65] text-muted">
              Built from{" "}
              {series(
                uses.map((dep) => (
                  <Link key={dep.slug} href={`/components/${dep.slug}`} className={textLink}>
                    {dep.name}
                  </Link>
                )),
              )}
              .
            </p>
          )}
        </section>
        <section aria-labelledby="make-it-yours" className="min-w-0 lg:col-span-6">
          <h2 id="make-it-yours" className="type-display mb-6 text-[1.75rem] text-fg sm:text-[2rem]">
            Make it yours
          </h2>
          <CodeBlock code={installedConfig} title={`components/templates/${slug}/config.ts`} lang="ts" />
          <p className="mt-5 max-w-[34rem] text-[15px] leading-[1.65] text-muted">
            Change <InlineCode>color</InlineCode> and the whole template re-tints. To serve it somewhere else, move{" "}
            <InlineCode>app/{slug}</InlineCode> and update <InlineCode>basePath</InlineCode>; every link between its
            pages starts there.
          </p>
        </section>
      </div>

      <section aria-labelledby="files" className="mt-28">
        <h2 id="files" className="type-display text-[1.75rem] text-fg sm:text-[2rem]">
          What lands in your repo
        </h2>
        <p className="mt-3 text-[15px] text-muted">{targets.length} files, all of them yours to edit.</p>
        <ul className="mt-8 columns-1 gap-10 font-mono text-[12.5px] leading-[1.9] text-muted sm:columns-2 lg:columns-3">
          {targets.map((target) => (
            <li key={target} className="break-inside-avoid truncate" title={target}>
              {target}
            </li>
          ))}
        </ul>
      </section>

      <PagerLinks
        prev={prev && { title: prev.name, href: `/templates/${prev.slug}` }}
        next={next && { title: next.name, href: `/templates/${next.slug}` }}
      />
    </PageShell>
  );
}
