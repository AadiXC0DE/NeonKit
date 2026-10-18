"use client";

import * as React from "react";
import { LocateFixed, Minus, Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";

export default function ButtonGroupVertical() {
  const [zoom, setZoom] = React.useState(14);

  return (
    <div className="flex items-center gap-5">
      <ButtonGroup orientation="vertical" aria-label="Map zoom">
        <Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(z + 1, 20))}>
          <Plus />
        </Button>
        <Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(z - 1, 2))}>
          <Minus />
        </Button>
        <ButtonGroupSeparator />
        <Button variant="outline" size="icon" aria-label="Center on me" onClick={() => setZoom(14)}>
          <LocateFixed />
        </Button>
      </ButtonGroup>
      <p className="text-sm text-white/55">
        Zoom <span className="font-mono tabular-nums text-white/85">{zoom}</span>
      </p>
    </div>
  );
}
