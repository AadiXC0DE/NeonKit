import type { Metadata } from "next";
import { BlockPreview } from "@/components/site/block-preview";
import { PageShell } from "@/components/site/page-shell";
import { highlight, readSource } from "@/lib/highlight";
import { blockCategories, blockPath, blocks, isNew } from "@/registry";

export const metadata: Metadata = {
  title: "Blocks",
  description:
    "Whole neon sections for React and Tailwind: heroes, pricing, features, auth and app shells. Install with one shadcn command.",
  alternates: { canonical: "/blocks" },
};

export default async function BlocksPage() {
  const sources = await Promise.all(
    blocks.map(async (block) => {
      const code = await readSource(blockPath(block.slug));
      return { slug: block.slug, code, html: await highlight(code) };
    }),
  );
  const source = Object.fromEntries(sources.map((s) => [s.slug, s]));

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Blocks</p>
        <h1 className="text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
          Whole sections, ready to glow.
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
          Heroes, pricing, features, auth screens and app shells built from NeonKit components. One command adds the
          block and everything it uses.
        </p>
      </div>

      {blocks.length === 0 ? (
        <p className="mt-16 rounded-2xl border border-line py-20 text-center text-dim">The first blocks are on their way.</p>
      ) : (
        <div className="mt-16 space-y-20">
          {blockCategories
            .filter((category) => blocks.some((block) => block.category === category))
            .map((category) => (
              <section key={category} aria-labelledby={`blocks-${category}`}>
                <h2
                  id={`blocks-${category}`}
                  className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim"
                >
                  {category}
                  <span className="h-px flex-1 bg-line" />
                </h2>
                <div className="space-y-14">
                  {blocks
                    .filter((block) => block.category === category)
                    .map((block) => (
                      <article key={block.slug} id={block.slug} className="scroll-mt-24">
                        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-xl font-semibold tracking-[-0.02em] text-fg">
                            <a href={`#${block.slug}`}>{block.name}</a>
                            {isNew(block) && (
                              <span className="ml-2 align-middle font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--neon-accent))]">
                                new
                              </span>
                            )}
                          </h3>
                          <p className="text-[14.5px] text-muted">{block.description}</p>
                        </div>
                        <BlockPreview
                          slug={block.slug}
                          html={source[block.slug].html}
                          code={source[block.slug].code}
                          height={block.height}
                        />
                      </article>
                    ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </PageShell>
  );
}
