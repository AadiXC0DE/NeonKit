import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { CommandBlock } from "@/components/site/install-tabs";
import { JsonLd } from "@/components/site/json-ld";
import { PageShell } from "@/components/site/page-shell";
import { PagerLinks } from "@/components/site/prose";
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
      <header className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
            <Link href="/templates" className="transition-colors hover:text-muted">
              Templates
            </Link>
            <span className="mx-2 text-white/15">/</span>
            {template.routes.length} {template.routes.length === 1 ? "page" : "pages"}
            {isNew(template) && <span className="ml-3 text-[rgb(var(--neon-accent))]">new</span>}
          </p>
          <h1 className="text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-fg">
            {template.name}
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{template.description}</p>
        </div>
        <a
          href={templatePreviewPath(slug)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-lg border border-[rgb(var(--neon-accent)/0.5)] bg-[rgb(var(--neon-accent)/0.1)] px-5 text-[14.5px] text-fg shadow-[0_0_24px_-6px_rgb(var(--neon-accent)/0.5)] transition-[background-color,box-shadow] hover:bg-[rgb(var(--neon-accent)/0.16)] hover:shadow-[0_0_32px_-4px_rgb(var(--neon-accent)/0.6)] lg:self-auto"
        >
          Open live preview <ArrowUpRight className="size-4" />
        </a>
      </header>

      <section aria-labelledby="pages">
        <h2 id="pages" className="sr-only">
          Pages
        </h2>
        <ul className={template.routes.length > 1 ? "grid gap-5 md:grid-cols-2" : "grid gap-5"}>
          {template.routes.map((route, i) => (
            <li key={route} className={template.routes.length > 2 && i === 0 ? "md:col-span-2" : undefined}>
              <a
                href={templatePreviewPath(slug, route)}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-xl border border-line bg-surface outline-none transition-[border-color,box-shadow] duration-200 hover:border-[rgb(var(--neon-accent)/0.4)] hover:shadow-[0_0_32px_-8px_rgb(var(--neon-accent)/0.45)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)]"
              >
                <div className="flex h-9 items-center gap-3 border-b border-line px-3.5">
                  <span aria-hidden className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-white/10" />
                    <span className="size-2.5 rounded-full bg-white/10" />
                    <span className="size-2.5 rounded-full bg-white/10" />
                  </span>
                  <span className="truncate font-mono text-[11.5px] text-muted">
                    /{slug}
                    {route}
                  </span>
                  <ArrowUpRight className="ml-auto size-3.5 text-dim transition-colors group-hover:text-fg" />
                </div>
                <Image
                  src={templateThumb(slug, route)}
                  alt={`The /${slug}${route} page`}
                  width={960}
                  height={600}
                  unoptimized
                  priority={i === 0}
                  className="aspect-[8/5] w-full object-cover object-top"
                />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="installation">
          <h2 id="installation" className="mb-4 text-xl font-semibold tracking-[-0.02em] text-fg">
            Installation
          </h2>
          <CommandBlock commands={cli} />
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
            Writes the pages to <code className="font-mono text-[13px] text-fg">app/{slug}</code>, their sections to{" "}
            <code className="font-mono text-[13px] text-fg">components/templates/{slug}</code> and adds the{" "}
            {uses.length} NeonKit components it is built from. Open{" "}
            <code className="font-mono text-[13px] text-fg">/{slug}</code> in your app.
          </p>
          {uses.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[11px] text-dim">
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
            </div>
          )}
        </section>
        <section aria-labelledby="make-it-yours">
          <h2 id="make-it-yours" className="mb-4 text-xl font-semibold tracking-[-0.02em] text-fg">
            Make it yours
          </h2>
          <CodeBlock code={installedConfig} title={`components/templates/${slug}/config.ts`} lang="ts" />
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
            Change <code className="font-mono text-[13px] text-fg">color</code> and the whole template re-tints. To serve
            it somewhere else, move <code className="font-mono text-[13px] text-fg">app/{slug}</code> and update{" "}
            <code className="font-mono text-[13px] text-fg">basePath</code>; every link between its pages starts there.
          </p>
        </section>
      </div>

      <section aria-labelledby="files" className="mt-16">
        <h2
          id="files"
          className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim"
        >
          {targets.length} files
          <span className="h-px flex-1 bg-line" />
        </h2>
        <ul className="columns-1 gap-8 font-mono text-[12.5px] leading-7 text-muted sm:columns-2 lg:columns-3">
          {targets.map((target) => (
            <li key={target} className="break-inside-avoid truncate">
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
