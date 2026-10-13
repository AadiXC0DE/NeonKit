import * as React from "react";
import { cn } from "@/lib/utils";

/** Juno's display face: the sans pushed wide and tight, like lettering cut for a shopfront. */
export const display =
  "[font-stretch:112%] [font-weight:620] tracking-[-0.038em] leading-[0.98]";


/**
 * A section opener: one headline, and a sentence under it that earns its place.
 * No labels above it. The headline says what the section is.
 */
export function SectionHeading({
  id,
  title,
  lede,
  className,
  size = "lg",
}: {
  id: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={className}>
      <h2
        id={id}
        className={cn(
          display,
          "text-balance text-white",
          // Size first, then leading: a font-size class would otherwise drop the line height when merged.
          size === "lg" ? "text-[clamp(40px,6.2vw,88px)]" : "text-[clamp(34px,4.4vw,60px)]",
          "leading-[0.98]",
        )}
      >
        {title}
      </h2>
      {lede && <p className="mt-6 max-w-[46ch] text-pretty text-[16px] leading-[1.6] text-white/60">{lede}</p>}
    </div>
  );
}
