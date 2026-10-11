"use client";

import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const files = [
  { path: "src/components/ui/sheet.tsx", added: 412, removed: 0 },
  { path: "src/registry/docs/sheet.tsx", added: 96, removed: 0 },
  { path: "src/registry/registry.json", added: 12, removed: 1 },
  { path: "src/registry/examples/sheet/demo.tsx", added: 151, removed: 0 },
  { path: "src/registry/examples/sheet/bottom.tsx", added: 82, removed: 0 },
  { path: "src/registry/examples/sheet/navigation.tsx", added: 104, removed: 0 },
  { path: "tests/ui/sheet.test.tsx", added: 139, removed: 0 },
  { path: "CONTRIBUTING.md", added: 3, removed: 2 },
];

function FileRow({ file }: { file: (typeof files)[number] }) {
  return (
    <li className="flex items-center gap-3 py-1.5 font-mono text-xs">
      <span className="min-w-0 flex-1 truncate text-white/75">{file.path}</span>
      <span className="tabular-nums text-[rgb(52_211_153)]">+{file.added}</span>
      <span className="w-6 text-right tabular-nums text-[#ff4d5e]">−{file.removed}</span>
    </li>
  );
}

export default function CollapsibleShowMore() {
  const [open, setOpen] = React.useState(false);
  const shown = files.slice(0, 3);
  const rest = files.slice(3);

  return (
    <div className="w-full max-w-md">
      <p className="mb-2 text-sm font-medium text-white/85">
        {files.length} files changed
      </p>
      <Collapsible open={open} onOpenChange={setOpen}>
        <ul>
          {shown.map((file) => (
            <FileRow key={file.path} file={file} />
          ))}
        </ul>
        <CollapsibleContent>
          <ul className="pl-3">
            {rest.map((file) => (
              <FileRow key={file.path} file={file} />
            ))}
          </ul>
        </CollapsibleContent>
        <CollapsibleTrigger className="mt-2 text-xs text-white/55">
          {open ? "Show fewer" : `Show ${rest.length} more files`}
        </CollapsibleTrigger>
      </Collapsible>
    </div>
  );
}
