"use client";

import * as React from "react";
import { Hand, Image as ImageIcon, MousePointer2, PenTool, Shapes, Type } from "@/components/ui/icons";
import { Dock, DockItem, DockSeparator } from "@/components/ui/dock";

const tools = [
  { id: "select", label: "Select  V", icon: MousePointer2 },
  { id: "hand", label: "Hand  H", icon: Hand },
  { id: "pen", label: "Pen  P", icon: PenTool },
  { id: "text", label: "Text  T", icon: Type },
  { id: "shapes", label: "Shapes  R", icon: Shapes },
];

// A canvas toolbar: no magnification, and the lit tube marks the tool in hand.
export default function DockToolbar() {
  const [tool, setTool] = React.useState("pen");

  return (
    <Dock size="sm" magnification={1} aria-label="Tools" color="violet">
      {tools.map((t) => (
        <DockItem
          key={t.id}
          label={t.label}
          running={tool === t.id}
          runningLabel="selected"
          aria-pressed={tool === t.id}
          onClick={() => setTool(t.id)}
        >
          <t.icon strokeWidth={1.75} />
        </DockItem>
      ))}
      <DockSeparator />
      <DockItem label="Place image" disabled>
        <ImageIcon strokeWidth={1.75} />
      </DockItem>
    </Dock>
  );
}
