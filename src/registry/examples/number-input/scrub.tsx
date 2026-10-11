"use client";

import * as React from "react";
import { RotateCw } from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";

const grip = "w-3 text-center font-mono text-[11px] font-medium";

export default function NumberInputScrub() {
  const [frame, setFrame] = React.useState({ x: 120, y: 48, w: 320, h: 180, rotation: 0, opacity: 0.9 });
  const set = (key: keyof typeof frame) => (value: number | null) =>
    setFrame((current) => ({ ...current, [key]: value ?? 0 }));

  return (
    <div className="grid w-full max-w-sm gap-3 rounded-xl border border-white/10 bg-[#0a0b11] p-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">Frame</p>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput size="sm" aria-label="X position" leading={<span className={grip}>X</span>} value={frame.x} onValueChange={set("x")} />
        <NumberInput size="sm" aria-label="Y position" leading={<span className={grip}>Y</span>} value={frame.y} onValueChange={set("y")} />
        <NumberInput
          size="sm"
          aria-label="Width"
          leading={<span className={grip}>W</span>}
          min={1}
          value={frame.w}
          onValueChange={set("w")}
        />
        <NumberInput
          size="sm"
          aria-label="Height"
          leading={<span className={grip}>H</span>}
          min={1}
          value={frame.h}
          onValueChange={set("h")}
        />
        <NumberInput
          size="sm"
          aria-label="Rotation"
          leading={<RotateCw />}
          min={-180}
          max={180}
          largeStep={15}
          formatOptions={{ style: "unit", unit: "degree", maximumFractionDigits: 1 }}
          locale="en-US"
          value={frame.rotation}
          onValueChange={set("rotation")}
        />
        <NumberInput
          size="sm"
          aria-label="Opacity"
          leading={<span className={grip}>%</span>}
          min={0}
          max={1}
          step={0.01}
          largeStep={0.1}
          formatOptions={{ style: "percent" }}
          locale="en-US"
          value={frame.opacity}
          onValueChange={set("opacity")}
        />
      </div>
      <p className="text-[11px] leading-4 text-white/40">
        Drag a letter sideways to scrub. Shift moves in large steps, Alt slows down for precise values.
      </p>
    </div>
  );
}
