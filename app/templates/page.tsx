import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { isNew, templatePreviewPath, templateThumb, templates } from "@/registry";

export const metadata: Metadata = {
  title: "Templates",
  description: `${templates.length} complete neon sites for Next.js: a SaaS landing, a dashboard, a portfolio, a launch event and docs. Install one with a single shadcn command.`,
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Templates</p>
        <h1 className="text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
          Whole sites, ready to fork.
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
          Complete Next.js sites built from NeonKit components, each with one brand, one color and real copy. One
          command installs the pages, their sections and every component they use.
        </p>
      </div>

      <ol className="mt-16 space-y-6">
        {templates.map((template, i) => (
          <li key={template.slug}>
            <article className="group relative grid overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-[rgb(var(--neon-accent)/0.35)] hover:shadow-[0_0_40px_-12px_rgb(var(--neon-accent)/0.4)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
              <Link
                href={`/templates/${template.slug}`}
                aria-label={`${template.name} template`}
                className="relative block aspect-[8/5] overflow-hidden border-b border-line outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon-accent)/0.6)] lg:border-b-0 lg:border-r"
              >
                <Image
                  src={templateThumb(template.slug)}
                  alt=""
                  width={960}
                  height={600}
                  unoptimized
                  priority={i === 0}
                  className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.012] motion-reduce:transition-none"
                />
              </Link>
              <div className="flex flex-col p-6 sm:p-8">
                <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
                  <span className="tabular-nums text-[rgb(var(--neon-accent))]">{String(i + 1).padStart(2, "0")}</span>
                  {template.routes.length} {template.routes.length === 1 ? "page" : "pages"}
                  {isNew(template) && <span className="text-[rgb(var(--neon-accent))]">new</span>}
                </p>
                <h2 className="mt-4 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-fg">
                  <Link href={`/templates/${template.slug}`} className="outline-none focus-visible:underline">
                    {template.name}
                  </Link>
                </h2>
                <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-muted">{template.description}</p>
                <ul className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11.5px] text-muted">
                  {template.routes.map((route) => (
                    <li key={route} className="rounded-md border border-line px-2 py-0.5">
                      /{template.slug}
                      {route}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8 text-[14px]">
                  <Link
                    href={`/templates/${template.slug}`}
                    className="inline-flex items-center gap-1.5 text-fg underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-[rgb(var(--neon-accent))]"
                  >
                    Install and details <ArrowRight className="size-3.5" />
                  </Link>
                  <a
                    href={templatePreviewPath(template.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg"
                  >
                    Live preview <ArrowUpRight className="size-3.5" />
                  </a>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
                    {template.registryDependencies.length} components
                  </span>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
