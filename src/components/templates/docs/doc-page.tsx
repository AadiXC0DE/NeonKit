import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { content } from "./content";
import { docHref, findDoc, neighbours, type Doc } from "./docs";
import { PageFeedback } from "./feedback";

/** Below xl there's no right rail, so the outline folds into the top of the page. */
function InlineToc({ doc }: { doc: Doc }) {
  return (
    <details className="group/toc mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] xl:hidden">
      <summary
        className={cn(
          "flex h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 text-sm text-white/80 [&::-webkit-details-marker]:hidden",
          "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
        )}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">On this page</span>
        <ChevronDown
          aria-hidden
          className="size-4 text-white/50 transition-transform duration-200 group-open/toc:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="border-t border-white/[0.06] px-2 py-2">
        {doc.headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block rounded-md py-2 pr-2 text-sm text-white/65 transition-colors hover:bg-white/[0.04] hover:text-white",
                "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                heading.level === 3 ? "pl-6" : "pl-2",
              )}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function PagerLink({ doc, direction }: { doc: Doc; direction: "previous" | "next" }) {
  const next = direction === "next";
  const Arrow = next ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={docHref(doc.slug)}
      rel={next ? "next" : "prev"}
      className={cn(
        "group relative flex flex-col gap-1.5 overflow-hidden rounded-xl border border-white/[0.08] px-5 py-4",
        "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
        "hover:border-[rgb(var(--neon)/0.4)] hover:bg-[rgb(var(--neon)/0.03)] hover:shadow-[0_0_28px_-12px_rgb(var(--neon)/0.6)]",
        "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        next ? "items-end text-right sm:col-start-2" : "items-start",
      )}
    >
      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
        {!next && (
          <Arrow aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        )}
        {next ? "Next" : "Previous"}
        {next && <Arrow aria-hidden className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />}
      </span>
      <span
        className={cn(
          "text-[15px] font-medium text-white transition-colors duration-150 group-hover:text-[rgb(var(--neon))]",
          doc.mono && "font-mono text-[14px]",
        )}
      >
        {doc.title}
      </span>
    </Link>
  );
}

export function DocPage({ slug }: { slug: string }) {
  const doc = findDoc(slug);
  const Content = content[slug];
  if (!doc || !Content) return null;
  const { previous, next } = neighbours(slug);

  return (
    <article aria-labelledby="doc-title" className="mx-auto max-w-[760px] lg:mx-0">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[rgb(var(--neon))]">{doc.group}</p>
        <h1
          id="doc-title"
          className={cn(
            "mt-4 text-balance font-semibold text-white",
            doc.mono
              ? "font-mono text-[2rem] leading-[1.1] tracking-[-0.04em] sm:text-[2.5rem]"
              : "text-[2.25rem] leading-[1.04] tracking-[-0.04em] sm:text-[2.75rem]",
          )}
        >
          {doc.title}
        </h1>
        <p className="mt-5 max-w-[62ch] text-pretty text-[17px] leading-7 text-white/65">{doc.description}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-white/55">
          <span>Updated {doc.updated}</span>
          <span aria-hidden className="text-white/25">
            /
          </span>
          <span>{doc.readingTime} read</span>
        </p>
      </header>

      <InlineToc doc={doc} />

      <div className="pt-2">
        <Content />
      </div>

      <footer className="mt-20 border-t border-white/[0.07] pt-8">
        <PageFeedback title={doc.title} />
        {(previous || next) && (
          <nav aria-label="Previous and next page" className="mt-8 grid gap-3 sm:grid-cols-2">
            {previous && <PagerLink doc={previous} direction="previous" />}
            {next && <PagerLink doc={next} direction="next" />}
          </nav>
        )}
      </footer>
    </article>
  );
}
