"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Star } from "@/components/ui/icons";
import { Sparks } from "@/components/ui/sparks";

export default function SparksWrapper() {
  const [starred, setStarred] = React.useState(false);

  return (
    <Sparks count={28} spread={110} velocity={380} disabled={starred}>
      <Button variant={starred ? "soft" : "outline"} aria-pressed={starred} onClick={() => setStarred((s) => !s)}>
        <Star className={starred ? "fill-current" : undefined} />
        {starred ? "Starred" : "Star"}
        <span className="ml-1 border-l border-white/15 pl-2.5 font-mono text-xs tabular-nums opacity-80">
          {starred ? "2,319" : "2,318"}
        </span>
      </Button>
    </Sparks>
  );
}
