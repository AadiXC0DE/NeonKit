import type { Metadata } from "next";
import Link from "next/link";
import { LiveFrame } from "@/components/site/live-preview";
import { ArrowUpRight } from "@/components/ui/icons";
import { PageShell } from "@/components/site/page-shell";
import { PageHeader, textLink } from "@/components/site/prose";
import { cn } from "@/lib/utils";
import { isNew, templatePreviewPath, templates } from "@/registry";

export const metadata: Metadata = {
  title: "Templates",
  description: `${templates.length} complete neon sites for Next.js: a SaaS landing, a dashboard, a portfolio, a launch event and docs. Install one with a single shadcn command.`,
  alternates: { canonical: "/templates" },
};

const pages = (n: number) => (n === 1 ? "1 page" : `${n} pages`);

function TemplateEntry({
  template,
  featured = false,
}: {
  template: (typeof templates)[number];
  featured?: boolean;
}) {
  const href = `/templates/${template.slug}`;
  return (
    <article className={cn("group relative", featured && "lg:grid lg:grid-cols-12 lg:gap-8")}>
      <Link
        href={href}
        aria-label={`${template.name} template`}
        className={cn(
          "relative block aspect-[8/5] overflow-hidden rounded-[14px] border border-white/[0.07] bg-surface outline-none transition-[border-color,box-shadow] duration-200 ease-out-quint hover:border-[rgb(var(--neon-accent)/0.4)] hover:shadow-[0_0_0_1px_rgb(var(--neon-accent)/0.12),0_24px_64px_-28px_rgb(var(--neon-accent)/0.5)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          featured && "lg:col-span-8",
        )}
      >
        <LiveFrame src={templatePreviewPath(template.slug)} title={`${template.name} template preview`} className="size-full" />
      </Link>
      <div className={cn("mt-6", featured && "lg:col-span-4 lg:mt-0 lg:flex lg:flex-col lg:justify-end lg:pb-1")}>
        <p className="text-[13.5px] text-muted">
          {pages(template.routes.length)}, {template.registryDependencies.length} components
          {isNew(template) && <span className="ml-2 text-[rgb(var(--neon-accent))]">New</span>}
        </p>
        <h2
          className={cn(
            "type-display mt-3 text-fg",
            featured ? "text-[clamp(2rem,3.4vw,3rem)]" : "text-[clamp(1.75rem,2.6vw,2.25rem)]",
          )}
        >
          <Link href={href} className="rounded-md outline-none focus-visible:underline">
            {template.name}
          </Link>
        </h2>
        <p className="mt-3 max-w-[30rem] text-pretty text-[15.5px] leading-[1.6] text-muted">{template.description}</p>
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12.5px] text-muted">
          {template.routes.map((route) => (
            <li key={route}>
              /{template.slug}
              {route}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14.5px]">
          <Link href={href} className={cn(textLink, "font-medium")}>
            Install and details
          </Link>
          <a
            href={templatePreviewPath(template.slug)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-fg"
          >
            Live preview <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function TemplatesPage() {
  const [first, ...rest] = templates;
  return (
    <PageShell>
      <PageHeader title="Templates" size="lg">
        Complete Next.js sites, each with one brand, one color and copy that sounds like a real product. One command
        writes the pages, their sections and every component they use.
      </PageHeader>

      {first && <TemplateEntry template={first} featured />}
      {rest.length > 0 && (
        <div className="mt-24 grid gap-x-8 gap-y-24 sm:mt-28 md:grid-cols-2">
          {rest.map((template) => (
            <TemplateEntry key={template.slug} template={template} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
