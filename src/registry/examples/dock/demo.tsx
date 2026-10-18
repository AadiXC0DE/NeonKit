"use client";

import * as React from "react";
import { CalendarDays, Download, Folder, Mail, Music2, NotebookPen, SquareTerminal, Trash2 } from "@/components/ui/icons";
import { Dock, DockItem, DockSeparator } from "@/components/ui/dock";

const apps = [
  { id: "files", label: "Files", icon: Folder },
  { id: "mail", label: "Mail", icon: Mail, badge: 12 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "music", label: "Music", icon: Music2, wide: true },
  { id: "notes", label: "Notes", icon: NotebookPen, wide: true },
  { id: "terminal", label: "Terminal", icon: SquareTerminal },
];

// Phones get a smaller dock with fewer apps; there's no pointer to magnify toward anyway.
const narrowQuery = "(max-width: 479px)";
function useNarrow() {
  return React.useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(narrowQuery);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(narrowQuery).matches,
    () => false,
  );
}

export default function DockDemo() {
  const [open, setOpen] = React.useState<string[]>(["files", "mail", "terminal"]);
  const narrow = useNarrow();
  const launch = (id: string) => setOpen((list) => (list.includes(id) ? list : [...list, id]));

  return (
    <div className="relative flex h-[300px] w-full max-w-[760px] items-end justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,#161a24,#07080c_75%)] pb-5">
      <p className="absolute left-5 top-4 font-mono text-[12px] tabular-nums text-white/50">Tue 14:02</p>
      <Dock aria-label="Dock" size={narrow ? "sm" : "md"}>
        {apps.filter((app) => !narrow || !app.wide).map((app) => (
          <DockItem
            key={app.id}
            label={app.label}
            badge={app.badge}
            running={open.includes(app.id)}
            onClick={() => launch(app.id)}
          >
            <app.icon strokeWidth={1.75} />
          </DockItem>
        ))}
        <DockSeparator />
        <DockItem label="Downloads">
          <Download strokeWidth={1.75} />
        </DockItem>
        <DockItem label="Trash">
          <Trash2 strokeWidth={1.75} />
        </DockItem>
      </Dock>
    </div>
  );
}
