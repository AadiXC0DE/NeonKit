"use client";

import * as React from "react";
import { FileArchive, FileCode2, FileImage, FileText } from "@/components/ui/icons";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const files = [
  { name: "brand-guidelines-v4.pdf", meta: "PDF · 18.2 MB · edited Tuesday", icon: FileText },
  { name: "hero-poster@2x.png", meta: "PNG · 4.1 MB · 3200 × 1800", icon: FileImage },
  { name: "tokens.json", meta: "JSON · 12 KB · synced from Figma", icon: FileCode2 },
  { name: "launch-assets.zip", meta: "ZIP · 212 MB · 46 files", icon: FileArchive },
];

export default function ItemFiles() {
  const [selected, setSelected] = React.useState(files[1].name);

  return (
    <ItemGroup aria-label="Files" className="min-w-0 w-full max-w-md gap-0.5">
      {files.map(({ name, meta, icon: Icon }) => (
        <Item key={name} asChild size="sm" active={selected === name}>
          <button type="button" aria-pressed={selected === name} onClick={() => setSelected(name)}>
            <ItemMedia variant="icon" className="size-9">
              <Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="font-mono text-[13px] font-normal">{name}</ItemTitle>
              <ItemDescription lines={1} className="text-xs">{meta}</ItemDescription>
            </ItemContent>
          </button>
        </Item>
      ))}
    </ItemGroup>
  );
}
