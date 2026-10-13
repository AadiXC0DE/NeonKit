import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { releases } from "@/config/changelog";
import { blocks, registry } from "@/registry";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in NeonKit, release by release.",
  alternates: { canonical: "/changelog" },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));

export default function ChangelogPage() {
  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Changelog</p>
        <h1 className="text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
          What&apos;s new.
        </h1>
      </div>

      <ol className="mt-16 max-w-4xl">
        {releases.map((release, i) => {
          const added = registry.filter((item) => item.addedIn === release.version);
          const addedBlocks = blocks.filter((block) => block.addedIn === release.version);
          return (
            <li key={release.version} className="grid gap-4 border-t border-line py-10 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-10">
              <div className="font-mono text-[12px] text-dim">
                <p className={i === 0 ? "neon-text text-[15px]" : "text-[15px] text-muted"}>v{release.version}</p>
                <time dateTime={release.date} className="mt-1 block">
                  {formatDate(release.date)}
                </time>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.025em] text-fg">{release.title}</h2>
                <ul className="mt-4 space-y-2.5 text-[15.5px] leading-relaxed text-muted">
                  {release.notes.map((note) => (
                    <li key={note} className="flex gap-3">
                      <span className="mt-[12px] h-px w-3 shrink-0 bg-[rgb(var(--neon-accent))]" />
                      {note}
                    </li>
                  ))}
                </ul>
                {added.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">
                      {added.length} components
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {added.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/components/${item.slug}`}
                          className="rounded-md border border-line px-2.5 py-1 text-[13px] text-muted transition-colors hover:border-[rgb(var(--neon-accent)/0.5)] hover:text-fg"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {addedBlocks.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">
                      {addedBlocks.length} blocks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {addedBlocks.map((block) => (
                        <Link
                          key={block.slug}
                          href={`/blocks/${block.slug}`}
                          className="rounded-md border border-line px-2.5 py-1 text-[13px] text-muted transition-colors hover:border-[rgb(var(--neon-accent)/0.5)] hover:text-fg"
                        >
                          {block.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
