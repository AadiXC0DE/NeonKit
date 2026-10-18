"use client";

import * as React from "react";
import { BellOff, Eye, Pin, Star } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/toggle-group";

export default function ToggleExample() {
  const [watching, setWatching] = React.useState(true);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <div className="flex items-center gap-1">
        <Toggle aria-label="Pin to sidebar">
          <Pin />
        </Toggle>
        <Toggle aria-label="Star" defaultPressed>
          <Star />
        </Toggle>
      </div>
      <span aria-hidden className="hidden h-6 w-px bg-white/10 sm:block" />
      <div className="flex items-center gap-2">
        <Toggle variant="outline" pressed={watching} onPressedChange={setWatching}>
          <Eye />
          {watching ? "Watching" : "Watch"}
        </Toggle>
        <Toggle variant="outline">
          <BellOff />
          Mute thread
        </Toggle>
      </div>
    </div>
  );
}
