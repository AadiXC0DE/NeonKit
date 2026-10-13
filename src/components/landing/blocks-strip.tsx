import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blocks, getBlock } from "@/registry";
import { SectionHeading } from "./section-heading";

// A spread across categories, so the strip reads as "everything a site needs".
const featured = ["hero-city", "pricing-tiers", "app-dashboard", "features-bento", "auth-sign-in", "marketing-404"];

export function BlocksStrip() {
  const shown = featured.map((slug) => getBlock(slug)).filter((block) => block !== undefined);
  if (shown.length === 0) return null;

  return (
    <section id="blocks" className="mx-auto max-w-[88rem] px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading index="05" label="Blocks" title={<>Whole sections,<br className="hidden sm:block" /> already wired.</>}>
        {blocks.length} heroes, pricing tables, auth screens and app shells built from the components above. Paste three
        and you have a page.
      </SectionHeading>

      <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((block) => (
          <li key={block.slug}>
            <Link href={`/blocks/${block.slug}`} className="group block outline-none">
              <div className="relative aspect-[8/5] overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 group-hover:border-[rgb(var(--neon-accent)/0.4)] group-hover:shadow-[0_0_32px_-8px_rgb(var(--neon-accent)/0.45)] group-focus-visible:ring-2 group-focus-visible:ring-[rgb(var(--neon-accent)/0.6)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
                <Image
                  src={`/thumbs/${block.slug}.jpg`}
                  alt=""
                  width={960}
                  height={600}
                  unoptimized
                  className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                <span className="text-white/80 transition-[color,text-shadow] group-hover:neon-text">{block.name}</span>
                <span className="text-dim">{block.category}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/blocks"
        className="group mt-12 inline-flex items-center gap-2 text-[15px] text-fg underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-[rgb(var(--neon-accent))]"
      >
        See all {blocks.length} blocks
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
