"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ColorPicker } from "@/components/ui/color-picker";

const labelColors = [
  { value: "#ff4d5e", label: "Signal red" },
  { value: "#ff8a3d", label: "Ember" },
  { value: "#fbbf24", label: "Sodium" },
  { value: "#a3e635", label: "Lime" },
  { value: "#34d399", label: "Mint" },
  { value: "#22d3ee", label: "Argon" },
  { value: "#4f8bff", label: "Mercury" },
  { value: "#a855f7", label: "Krypton" },
];

export default function ColorPickerLabelColors() {
  const [color, setColor] = React.useState("#a855f7");

  return (
    <div className="grid w-full max-w-[16rem] gap-4">
      <ColorPicker
        size="sm"
        label="Label color"
        swatches={labelColors}
        showInput={false}
        value={color}
        onValueChange={setColor}
      />
      <div className="flex items-center justify-between gap-3 text-xs text-white/55">
        <span>Preview</span>
        <Badge color={color} dot>
          needs-design
        </Badge>
      </div>
    </div>
  );
}
