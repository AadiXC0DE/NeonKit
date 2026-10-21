import { cn } from "@/lib/utils";

/**
 * A whole page (a block or a template route) in a gallery tile: a 1440 × 900 screenshot taken at 2x by
 * scripts/thumbs.mjs, served as a 1280 or 2560 wide WebP. Running a dozen live pages at once is what used to
 * take the gallery down; the live, interactive version is one click away on the item's own page.
 */
export function PreviewShot({ base, sizes, className }: { base: string; sizes: string; className?: string }) {
  return (
    <span className={cn("relative block aspect-[8/5] overflow-hidden bg-[#05060a]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a pre-sized WebP pair, nothing left to optimize */}
      <img
        src={`${base}-1280.webp`}
        srcSet={`${base}-1280.webp 1280w, ${base}-2560.webp 2560w`}
        sizes={sizes}
        width={1280}
        height={800}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full object-cover object-top"
      />
    </span>
  );
}
