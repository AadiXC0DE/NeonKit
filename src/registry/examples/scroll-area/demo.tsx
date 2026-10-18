import { ScrollArea } from "@/components/ui/scroll-area";

const releases = [
  {
    version: "2.3.0",
    date: "Oct 8, 2026",
    notes: [
      "New Table with sortable headers, row selection and a sticky header.",
      "Timeline lights its tube up to the current event.",
      "Scroll Area with edge fades that only appear when there is more to see.",
    ],
  },
  {
    version: "2.2.4",
    date: "Sep 22, 2026",
    notes: ["Select no longer scrolls the page when opened near the bottom of the viewport."],
  },
  {
    version: "2.2.3",
    date: "Sep 9, 2026",
    notes: [
      "Dialog returns focus to the trigger after a nested Select closes.",
      "Badge dots line up with the text baseline at the small size.",
    ],
  },
  {
    version: "2.2.0",
    date: "Aug 12, 2026",
    notes: [
      "Overlays are positioned with floating-ui and flip when they run out of room.",
      "Every component reads color through --neon, so one variable themes a whole subtree.",
    ],
  },
  {
    version: "2.1.2",
    date: "Jul 1, 2026",
    notes: ["Switch flickers on only when it is turned on, not on first render."],
  },
  {
    version: "2.1.0",
    date: "May 20, 2026",
    notes: [
      "Select, Combobox and Input share one field anatomy: label, description and error.",
      "Sizes line up at 32, 40 and 48 pixels across every form control.",
    ],
  },
  {
    version: "2.0.0",
    date: "Mar 4, 2026",
    notes: [
      "Tailwind 4 support. Components still work unchanged on Tailwind 3.",
      "New palette with eleven colors stored as RGB channels.",
    ],
  },
];

export default function ScrollAreaDemo() {
  return (
    <ScrollArea
      aria-label="Changelog"
      className="h-80 w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.02]"
    >
      <ol className="grid gap-6 p-5 pr-6">
        {releases.map((release) => (
          <li key={release.version} className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-sm font-medium text-white/90">v{release.version}</span>
              <span className="text-xs text-white/40">{release.date}</span>
            </div>
            <ul className="grid gap-1.5">
              {release.notes.map((note) => (
                <li key={note} className="flex gap-2.5 text-sm leading-6 text-white/60">
                  <span aria-hidden className="mt-[11px] size-1 shrink-0 rounded-full bg-white/25" />
                  {note}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
