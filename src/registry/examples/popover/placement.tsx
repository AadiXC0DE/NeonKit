"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const placements = [
  { side: "top", label: "Top", hint: "Flips below when it runs out of room above." },
  { side: "right", label: "Right", hint: "Slides along the edge to stay on screen." },
  { side: "bottom", label: "Bottom", hint: "The default. Light leaks in from the trigger." },
  { side: "left", label: "Left", hint: "The arrow tracks the trigger as it shifts." },
] as const;

export default function PopoverPlacement() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {placements.map((placement) => (
        <Popover key={placement.side}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="border border-white/10">
              {placement.label}
            </Button>
          </PopoverTrigger>
          <PopoverContent side={placement.side} arrow initialFocus="content" className="w-52 px-3 py-2.5">
            <p className="text-xs leading-5 text-white/70">{placement.hint}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
