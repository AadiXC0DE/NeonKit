import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

import { docHref, docs } from "@/components/templates/docs/docs";
import { focusRing } from "@/components/templates/docs/styles";

// Unknown doc pages call notFound(), which lands here inside the docs shell instead of the app's bare 404.
const suggestions = docs.filter((doc) => ["", "installation", "quickstart", "troubleshooting"].includes(doc.slug));

export default function DocsNotFound() {
  return (
    <div className="max-w-[760px]">
      <p className="font-mono text-[14px] text-white/60">
        <span className="mr-2 text-[rgb(var(--neon))]">$</span>gantry docs: page not found
      </p>
      <h1 className="mt-5 text-balance text-[clamp(2.375rem,5.2vw,3.5rem)] font-[620] leading-[1] tracking-[-0.038em] text-white [font-stretch:112%]">
        No page at this address.
      </h1>
      <p className="mt-5 max-w-[56ch] text-pretty text-[16px] leading-[1.65] text-white/60">
        It may have moved when the CLI reference was split up. Search with <span className="font-mono text-white/85">⌘K</span>,
        or start from one of these.
      </p>
      <ul className="mt-10 border-t border-white/[0.08]">
        {suggestions.map((doc) => (
          <li key={doc.slug} className="border-b border-white/[0.07]">
            <Link
              href={docHref(doc.slug)}
              className={cn(
                "group flex items-center justify-between gap-4 rounded-md py-4 text-[16px] text-white/85 transition-colors hover:text-[rgb(var(--neon))]",
                focusRing,
              )}
            >
              <span>
                <span className={cn("block font-medium", doc.mono && "font-mono font-normal")}>{doc.title}</span>
                <span className="mt-1 block text-[14px] text-white/55">{doc.description}</span>
              </span>
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 text-white/40 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--neon))]"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
