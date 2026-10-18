"use client";

import * as React from "react";
import { ListMusic, Repeat, Shuffle } from "@/components/ui/icons";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

export default function MenubarPlayer() {
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState("all");
  const [output, setOutput] = React.useState("studio");

  return (
    <Menubar aria-label="Player">
      <MenubarMenu>
        <MenubarTrigger>Controls</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="Space">Play</MenubarItem>
          <MenubarItem shortcut="⌘→">Next track</MenubarItem>
          <MenubarItem shortcut="⌘←">Previous track</MenubarItem>
          <MenubarSeparator />
          <MenubarCheckboxItem checked={shuffle} onCheckedChange={setShuffle} shortcut="⌘S">
            Shuffle
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Repeat</MenubarLabel>
          <MenubarRadioGroup value={repeat} onValueChange={setRepeat}>
            <MenubarRadioItem value="off">Off</MenubarRadioItem>
            <MenubarRadioItem value="all">All</MenubarRadioItem>
            <MenubarRadioItem value="one">One</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Output</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={output} onValueChange={setOutput}>
            <MenubarRadioItem value="studio">Studio monitors</MenubarRadioItem>
            <MenubarRadioItem value="airpods">Ana’s AirPods Pro</MenubarRadioItem>
            <MenubarRadioItem value="kitchen">Kitchen speaker</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Library</MenubarTrigger>
        <MenubarContent>
          <MenubarItem icon={<ListMusic />}>New playlist</MenubarItem>
          <MenubarItem icon={<Shuffle />} disabled={!shuffle}>
            Reshuffle queue
          </MenubarItem>
          <MenubarItem icon={<Repeat />}>Show listening history</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
