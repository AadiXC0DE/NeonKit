import { Bold, Code, Italic, Link, Strikethrough, Underline } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

const groups = [
  [
    { label: "Bold", shortcut: "⌘B", icon: Bold },
    { label: "Italic", shortcut: "⌘I", icon: Italic },
    { label: "Underline", shortcut: "⌘U", icon: Underline },
    { label: "Strikethrough", shortcut: "⌘⇧X", icon: Strikethrough },
  ],
  [
    { label: "Link", shortcut: "⌘K", icon: Link },
    { label: "Inline code", shortcut: "⌘E", icon: Code },
  ],
];

export default function TooltipDemo() {
  return (
    <div
      role="group"
      aria-label="Text formatting"
      className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-white/[0.03] p-1"
    >
      {groups.map((tools, index) => (
        <div key={index} className="flex items-center gap-0.5">
          {index > 0 && <span aria-hidden className="mx-1 h-4 w-px bg-white/10" />}
          {tools.map(({ label, shortcut, icon: Icon }) => (
            <Tooltip
              key={label}
              content={
                <span className="flex items-center gap-2">
                  {label}
                  <kbd className="font-sans text-[11px] tracking-wide text-white/50">{shortcut}</kbd>
                </span>
              }
            >
              <Button variant="ghost" size="icon" aria-label={label} className="size-8 rounded-lg">
                <Icon />
              </Button>
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  );
}
