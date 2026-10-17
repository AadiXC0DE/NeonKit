"use client";

import * as React from "react";
import { ZoomIn } from "@/components/ui/icons";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const zoomLevels = [
  { value: "50", shortcut: "⇧0" },
  { value: "100", shortcut: "⇧1" },
  { value: "200", shortcut: "⇧2" },
];

export default function ContextMenuCanvas() {
  const [zoom, setZoom] = React.useState("100");
  const [grid, setGrid] = React.useState(true);
  const [rulers, setRulers] = React.useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        tabIndex={0}
        aria-label="Design canvas"
        className="relative h-64 w-full max-w-lg select-none overflow-hidden rounded-xl border border-white/10 bg-[#07080d] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
      >
        {grid && (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.09)_1px,transparent_1px)] [background-size:16px_16px]"
          />
        )}
        {rulers && (
          <>
            <div aria-hidden className="absolute inset-x-0 top-0 h-4 border-b border-white/10 bg-white/[0.03]" />
            <div aria-hidden className="absolute inset-y-0 left-0 w-4 border-r border-white/10 bg-white/[0.03]" />
          </>
        )}
        <div
          className="absolute inset-0 grid place-items-center transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ transform: `scale(${Number(zoom) / 100})` }}
        >
          <div className="w-44 rounded-lg border border-white/10 bg-[#0a0b11] p-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.8)]">
            <div className="h-2 w-16 rounded-full bg-[rgb(var(--neon)/0.7)]" />
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10" />
            <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-white/10" />
            <div className="mt-3 h-5 w-14 rounded-md border border-[rgb(var(--neon)/0.5)]" />
          </div>
        </div>
        <span className="absolute bottom-3 right-3 rounded-md bg-black/40 px-1.5 py-0.5 text-[11px] tabular-nums text-white/50">
          {zoom}%
        </span>
        <span className="absolute bottom-3 left-3 text-[11px] text-white/35">Right-click anywhere on the canvas</span>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56" aria-label="Canvas">
        <ContextMenuItem inset shortcut="⌘V" disabled>
          Paste
        </ContextMenuItem>
        <ContextMenuItem inset shortcut="⌘A">
          Select all
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<ZoomIn />}>Zoom</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            <ContextMenuRadioGroup value={zoom} onValueChange={setZoom}>
              <ContextMenuLabel inset>Zoom to</ContextMenuLabel>
              {zoomLevels.map((level) => (
                <ContextMenuRadioItem key={level.value} value={level.value} shortcut={level.shortcut}>
                  {level.value}%
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid} shortcut="⌘'">
          Show grid
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={rulers} onCheckedChange={setRulers} shortcut="⇧R">
          Show rulers
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
