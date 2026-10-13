import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { PageHeader } from "@/components/site/prose";
import { releases } from "@/config/changelog";
import { cn } from "@/lib/utils";
import { blocks, registry, templates } from "@/registry";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in NeonKit, release by release.",
  alternates: { canonical: "/changelog" },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));

function Added({ label, items }: { label: string; items: { name: string; href: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8">
      <h3 className="text-[14px] font-medium text-fg">
        {items.length} {label}
      </h3>
      <p className="mt-2 max-w-[44rem] text-[15px] leading-[1.75] text-muted">
        {items.map((item, i) => (
          <span key={item.href}>
            <span className="whitespace-nowrap">
              <Link href={item.href} className="transition-colors hover:text-fg">
                {item.name}
              </Link>
              {i < items.length - 1 && (
                <span aria-hidden className="ml-2 mr-1 text-white/20">
                  /
                </span>
              )}
            </span>{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function ChangelogPage() {
  return (
    <PageShell>
      <PageHeader title="Changelog" size="lg">
        Every release, newest first. Anything added in the last two carries a New mark across the site.
      </PageHeader>

      <ol className="max-w-[72rem]">
        {releases.map((release, i) => {
          const added = registry.filter((item) => item.addedIn === release.version);
          const addedBlocks = blocks.filter((block) => block.addedIn === release.version);
          const addedTemplates = templates.filter((template) => template.addedIn === release.version);
          const latest = i === 0;
          return (
            <li
              key={release.version}
              className="grid gap-5 border-t border-white/[0.08] py-14 sm:py-16 lg:grid-cols-12 lg:gap-8"
            >
              <div className="lg:col-span-3">
                <p
                  className={cn(
                    "type-display text-[clamp(2.5rem,4vw,3.5rem)] tabular-nums",
                    latest ? "neon-text" : "text-fg",
                  )}
                >
                  {release.version}
                </p>
                <p className="mt-3 text-[14px] text-muted">
                  <time dateTime={release.date}>{formatDate(release.date)}</time>
                  {latest && <span className="text-fg">, latest</span>}
                </p>
              </div>
              <div className="min-w-0 lg:col-span-9">
                <h2 id={`release-${release.version}`} className="text-[1.6rem] font-medium leading-tight tracking-[-0.02em] text-fg">
                  {release.title}
                </h2>
                <ul className="mt-5 max-w-[44rem] space-y-3 text-[16px] leading-[1.65] text-muted">
                  {release.notes.map((note) => (
                    <li key={note} className="relative pl-5">
                      <span aria-hidden className="absolute left-0 top-[0.8em] h-px w-2.5 bg-white/25" />
                      {note}
                    </li>
                  ))}
                </ul>
                <Added
                  label={added.length === 1 ? "component" : "components"}
                  items={added.map((item) => ({ name: item.name, href: `/components/${item.slug}` }))}
                />
                <Added
                  label={addedTemplates.length === 1 ? "template" : "templates"}
                  items={addedTemplates.map((template) => ({ name: template.name, href: `/templates/${template.slug}` }))}
                />
                <Added
                  label={addedBlocks.length === 1 ? "block" : "blocks"}
                  items={addedBlocks.map((block) => ({ name: block.name, href: `/blocks/${block.slug}` }))}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
