"use client";

import * as React from "react";
import { Braces, FileCode, FileText } from "@/components/ui/icons";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const files = [
  "src/components/ui/command.tsx",
  "src/components/ui/popover.tsx",
  "src/components/ui/dialog.tsx",
  "src/components/ui/select.tsx",
  "src/components/site/search.tsx",
  "src/registry/registry.json",
  "src/lib/neon.ts",
  "src/lib/utils.ts",
  "app/(docs)/components/[slug]/page.tsx",
  "app/layout.tsx",
  "scripts/build-registry.mjs",
  "tests/ui/command.test.tsx",
  "package.json",
  "CONTRIBUTING.md",
];

function iconFor(path: string) {
  if (path.endsWith(".json")) return <Braces />;
  if (path.endsWith(".md")) return <FileText />;
  return <FileCode />;
}

export default function CommandFileJump() {
  const [opened, setOpened] = React.useState("src/components/ui/command.tsx");

  return (
    <div className="grid w-full max-w-md gap-2">
      <Command label="Files">
        <CommandInput placeholder="Jump to file… try “uicmd” or “regjson”" />
        <CommandList className="max-h-64">
          <CommandEmpty>No file matches that.</CommandEmpty>
          {files.map((path) => (
            <CommandItem key={path} icon={iconFor(path)} onSelect={setOpened} className="font-mono text-[13px]">
              {path}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
      <p className="truncate px-1 text-xs text-white/50">
        Opened <span className="font-mono text-white/70">{opened}</span>
      </p>
    </div>
  );
}
