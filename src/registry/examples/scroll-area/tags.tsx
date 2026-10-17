import { ScrollArea } from "@/components/ui/scroll-area";

const topics = [
  "accessibility",
  "animation",
  "design-tokens",
  "forms",
  "keyboard",
  "motion",
  "overlays",
  "performance",
  "react-19",
  "server-components",
  "tailwind-4",
  "theming",
  "typography",
];

export default function ScrollAreaTags() {
  return (
    <article className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="truncate text-sm font-medium text-white/90">halcyon/ui</h3>
        <span className="shrink-0 text-xs tabular-nums text-white/50">2.4k stars</span>
      </div>
      <p className="mt-1 text-[13px] leading-5 text-white/55">
        React components for the Halcyon dashboard, published from the monorepo on every tag.
      </p>
      <ScrollArea orientation="horizontal" aria-label="Topics" className="mt-4">
        <ul className="flex w-max gap-2 pb-3">
          {topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-white/70"
            >
              {topic}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </article>
  );
}
