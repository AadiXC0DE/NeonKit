import { Haze } from "@/components/ui/haze";

export default function HazeSideLight() {
  return (
    <figure className="relative flex min-h-[300px] w-full flex-col justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 py-10 sm:pl-[38%] sm:pr-12">
      <Haze light="left" color="violet" density={0.5} intensity={0.6} />
      <blockquote className="relative max-w-[36ch] text-xl font-medium leading-snug tracking-[-0.01em] text-white/90 sm:text-2xl">
        &ldquo;We cut cue prep for a touring show from two days to four hours, and nobody misses the spreadsheet.&rdquo;
      </blockquote>
      <figcaption className="relative mt-5 text-sm text-white/60">Esme Laurent, lighting designer, Halcyon Tour 2026</figcaption>
    </figure>
  );
}
