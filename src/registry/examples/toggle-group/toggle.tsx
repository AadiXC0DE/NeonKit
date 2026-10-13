"use client";

import * as React from "react";
import { BellOff, Eye, Pin, Star } from "@/components/ui/icons";
import { Toggle } from "@/components/ui/toggle-group";

export default function ToggleExample() {
  const [watching, setWatching] = React.useState(true);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Pin to sidebar">
        <Pin />
      </Toggle>
      <Toggle aria-label="Star" defaultPressed>
        <Star />
      </Toggle>
      <span aria-hidden className="mx-1 h-6 w-px bg-white/10" />
      <Toggle variant="outline" pressed={watching} onPressedChange={setWatching}>
        <Eye />
        {watching ? "Watching" : "Watch"}
      </Toggle>
      <Toggle variant="outline">
        <BellOff />
        Mute thread
      </Toggle>
    </div>
  );
}
