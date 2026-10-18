import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

import { content } from "./content";
import { docHref, findDoc, neighbours, type Doc } from "./docs";
import { PageFeedback } from "./feedback";
import { MobileToc } from "./mobile-toc";

function PagerLink({ doc, direction }: { doc: Doc; direction: "previous" | "next" }) {
  const next = direction === "next";
  const Arrow = next ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={docHref(doc.slug)}
      rel={next ? "next" : "prev"}
      className={cn(
        "group flex flex-col gap-1 rounded-md py-1",
        "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]",
        next ? "items-end text-right sm:col-start-2" : "items-start",
      )}
    >
      <span className="text-[13px] text-white/55">{next ? "Next" : "Previous"}</span>
      <span
        className={cn(
          "flex items-center gap-2 text-[17px] font-medium tracking-[-0.01em] text-white transition-colors duration-150 group-hover:text-[rgb(var(--neon))]",
          doc.mono && "font-mono text-[15px] font-normal tracking-normal",
        )}
      >
        {!next && (
          <Arrow
            aria-hidden
            className="size-4 text-white/50 transition-[transform,color] duration-200 ease-out group-hover:-translate-x-0.5 group-hover:text-[rgb(var(--neon))]"
          />
        )}
        {doc.title}
        {next && (
          <Arrow
            aria-hidden
            className="size-4 text-white/50 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[rgb(var(--neon))]"
          />
        )}
      </span>
    </Link>
  );
}

function Title({ doc }: { doc: Doc }) {
  if (doc.mono) {
    const [bin, ...rest] = doc.title.split(" ");
    // Command pages: the title is the command, set the way you'd type it.
    return (
      <h1
        id="doc-title"
        className="font-mono text-[clamp(2rem,5vw,2.875rem)] font-normal leading-[1.1] tracking-[-0.035em] text-white"
      >
        <span aria-hidden className="mr-[0.45em] select-none text-[rgb(var(--neon))]">
          $
        </span>
        <span className="text-white/50">{bin}</span> {rest.join(" ")}
      </h1>
    );
  }
  const home = doc.slug === "";
  return (
    <h1
      id="doc-title"
      className={cn(
        "text-balance font-[620] text-white [font-stretch:112%]",
        home
          ? "max-w-[14ch] text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.96] tracking-[-0.042em]"
          : "text-[clamp(2.375rem,5.2vw,3.5rem)] leading-[1] tracking-[-0.038em]",
      )}
    >
      {doc.headline ?? doc.title}
    </h1>
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
        <Title doc={doc} />
        <p className="mt-6 max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/65 sm:text-[18px]">
          {doc.description}
        </p>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/55">
          <span>{doc.group}</span>
          <span aria-hidden className="text-white/25">
            ·
          </span>
          <span>Updated {doc.updated}</span>
          <span aria-hidden className="text-white/25">
            ·
          </span>
          <span>{doc.readingTime} read</span>
        </p>
      </header>

      <MobileToc key={doc.slug} doc={doc} />

      <div className="pt-2 [&>h2:first-child]:mt-14">
        <Content />
      </div>

      <footer className="mt-24">
        <div className="border-y border-white/[0.07] py-5">
          <PageFeedback title={doc.title} />
        </div>
        {(previous || next) && (
          <nav aria-label="Previous and next page" className="mt-10 grid gap-8 sm:grid-cols-2">
            {previous && <PagerLink doc={previous} direction="previous" />}
            {next && <PagerLink doc={next} direction="next" />}
          </nav>
        )}
      </footer>
    </article>
  );
}
