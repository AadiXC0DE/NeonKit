"use client";

import * as React from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

const RECENT = ["poster-v3.tide", "album-cover-final.tide", "zine-spread-04.tide"];

export default function MenubarDemo() {
  const [last, setLast] = React.useState("Opened poster-v3.tide");
  const [rulers, setRulers] = React.useState(true);
  const [snap, setSnap] = React.useState(true);
  const [zoom, setZoom] = React.useState("fit");
  const run = (label: string) => () => setLast(label);

  return (
    <div className="flex min-w-0 w-full max-w-2xl flex-col items-start gap-3">
      <Menubar aria-label="Tide">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem shortcut="⌘N" onSelect={run("New canvas")}>New canvas</MenubarItem>
            <MenubarItem shortcut="⌘O" onSelect={run("Open…")}>Open…</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Open recent</MenubarSubTrigger>
              <MenubarSubContent>
                {RECENT.map((file) => (
                  <MenubarItem key={file} onSelect={run(`Opened ${file}`)}>
                    {file}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem shortcut="⌘S" onSelect={run("Saved poster-v3.tide")}>Save</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Export as</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem shortcut="⇧⌘E" onSelect={run("Exported poster-v3.png")}>PNG</MenubarItem>
                <MenubarItem onSelect={run("Exported poster-v3.svg")}>SVG</MenubarItem>
                <MenubarItem onSelect={run("Exported poster-v3.pdf")}>PDF for print</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem disabled>Share…</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem shortcut="⌘Z" onSelect={run("Undid “Move layer”")}>Undo move layer</MenubarItem>
            <MenubarItem shortcut="⇧⌘Z" disabled>Redo</MenubarItem>
            <MenubarSeparator />
            <MenubarItem shortcut="⌘X" onSelect={run("Cut")}>Cut</MenubarItem>
            <MenubarItem shortcut="⌘C" onSelect={run("Copied 2 layers")}>Copy</MenubarItem>
            <MenubarItem shortcut="⌘V" onSelect={run("Pasted")}>Paste</MenubarItem>
            <MenubarSeparator />
            <MenubarItem shortcut="⌘A" onSelect={run("Selected 14 layers")}>Select all</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={rulers} onCheckedChange={setRulers} shortcut="⇧R">
              Rulers
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={snap} onCheckedChange={setSnap} shortcut="⇧S">
              Snap to grid
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
              <MenubarRadioItem value="fit" shortcut="⇧1">Zoom to fit</MenubarRadioItem>
              <MenubarRadioItem value="100" shortcut="⇧0">Actual size</MenubarRadioItem>
              <MenubarRadioItem value="200" shortcut="⇧2">200%</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="layer">
          <MenubarTrigger>Layer</MenubarTrigger>
          <MenubarContent>
            <MenubarItem shortcut="⌘G" onSelect={run("Grouped 2 layers")}>Group</MenubarItem>
            <MenubarItem shortcut="⇧⌘G" onSelect={run("Ungrouped")}>Ungroup</MenubarItem>
            <MenubarItem shortcut="⌘]" onSelect={run("Brought forward")}>Bring forward</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="danger" shortcut="⌫" onSelect={run("Deleted 2 layers")}>
              Delete
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="px-1 text-[13px] text-white/55" aria-live="polite">
        {last}
        <span className="text-white/35">
          {" "}
          · rulers {rulers ? "on" : "off"} · snap {snap ? "on" : "off"} · {zoom === "fit" ? "fit" : `${zoom}%`}
        </span>
      </p>
    </div>
  );
}
