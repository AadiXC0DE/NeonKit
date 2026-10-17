"use client";

import * as React from "react";
import { TreeView, type TreeNode } from "@/components/ui/tree-view";

const file = (id: string, meta?: string): TreeNode => ({
  id,
  label: id.split("/").pop()!,
  meta: meta && <span className={meta === "M" ? "text-[#fbbf24]" : "text-[#34d399]"}>{meta}</span>,
});

const repo: TreeNode[] = [
  {
    id: "app",
    label: "app",
    children: [
      {
        id: "app/(marketing)",
        label: "(marketing)",
        children: [file("app/(marketing)/page.tsx"), file("app/(marketing)/pricing/page.tsx", "M")],
      },
      {
        id: "app/dashboard",
        label: "dashboard",
        children: [
          file("app/dashboard/layout.tsx"),
          file("app/dashboard/page.tsx", "M"),
          {
            id: "app/dashboard/settings",
            label: "settings",
            children: [file("app/dashboard/settings/page.tsx"), file("app/dashboard/settings/billing.tsx", "A")],
          },
        ],
      },
      file("app/layout.tsx"),
      file("app/globals.css"),
    ],
  },
  {
    id: "components",
    label: "components",
    children: [
      {
        id: "components/ui",
        label: "ui",
        children: [file("components/ui/button.tsx"), file("components/ui/data-table.tsx", "A"), file("components/ui/tree-view.tsx", "A")],
      },
      file("components/site-header.tsx"),
    ],
  },
  { id: "lib", label: "lib", children: [file("lib/utils.ts"), file("lib/neon.ts")] },
  { id: "public", label: "public", children: [] },
  file("next.config.ts"),
  file("package.json", "M"),
  file("tsconfig.json"),
];

export default function TreeViewDemo() {
  const [selected, setSelected] = React.useState(["app/dashboard/page.tsx"]);
  const path = selected[0] ?? "";

  return (
    <div className="grid w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] sm:grid-cols-[260px_1fr]">
      <div className="border-b border-white/10 p-2 sm:border-b-0 sm:border-r">
        <TreeView
          aria-label="Files in acme-web"
          data={repo}
          defaultExpanded={["app", "app/dashboard", "components"]}
          selected={selected}
          onSelectedChange={setSelected}
        />
      </div>
      <div className="grid content-start gap-3 p-5">
        <p className="font-mono text-[13px] text-white/50">
          acme-web/<span className="text-white/90">{path}</span>
        </p>
        <div className="grid font-mono text-[12.5px] leading-6 whitespace-pre text-white/40">
          <p><span className="text-white/25">1</span>  export default function Page() {"{"}</p>
          <p><span className="text-white/25">2</span>    return &lt;Dashboard /&gt;;</p>
          <p><span className="text-white/25">3</span>  {"}"}</p>
        </div>
      </div>
    </div>
  );
}
