import { Accessibility, Palette, FileCode2 } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SectionHeading } from "./section-heading";

const items = [
  {
    icon: Palette,
    title: "One variable",
    body: "Every component reads --neon. Pass a color, set it on a parent, or turn the knob up top and watch it travel.",
    detail: "color=\"#ff6a00\"",
  },
  {
    icon: Accessibility,
    title: "Keyboard first",
    body: "Native dialog, real inputs, roving focus, typeahead, ARIA wired up. Reduced motion is respected everywhere.",
    detail: "role=\"switch\"",
  },
  {
    icon: FileCode2,
    title: "Tailwind 3 and 4",
    body: "No config, no plugin, no custom theme keys. The classes compile the same in either version.",
    detail: "bg-[rgb(var(--neon)/0.12)]",
  },
];

export function Principles() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading index="05" label="Under the glass" title="Built like a sign, not a sticker.">
        The glow is the easy part. Underneath it you get proper focus management, real form elements and code you
        can read in one sitting.
      </SectionHeading>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body, detail }) => (
          <SpotlightCard key={title} className="flex min-h-[240px] flex-col p-6 sm:p-7 md:min-h-[280px]">
            <Icon className="size-5 text-muted" strokeWidth={1.5} />
            <h3 className="mt-auto pt-10 text-xl md:pt-16 font-semibold tracking-[-0.02em] text-fg">{title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{body}</p>
            <code className="mt-6 block border-t border-line pt-4 font-mono text-[12px] text-dim">{detail}</code>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
