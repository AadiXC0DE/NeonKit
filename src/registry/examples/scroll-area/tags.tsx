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
    <div className="grid w-full max-w-sm gap-2">
      <span className="text-xs font-medium text-white/55">Topics</span>
      <ScrollArea orientation="horizontal" aria-label="Topics">
        <ul className="flex w-max gap-2 pb-4">
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
    </div>
  );
}
