"use client";

import * as React from "react";
import { TreeView, type TreeNode } from "@/components/ui/tree-view";

// Stands in for a bucket listing API: 600ms per request, and one prefix that always fails.
const listing: Record<string, TreeNode[]> = {
  "media/": [
    { id: "media/2026/", label: "2026", isBranch: true },
    { id: "media/avatars/", label: "avatars", isBranch: true },
    { id: "media/broken/", label: "legacy-import", isBranch: true },
  ],
  "media/2026/": [
    { id: "media/2026/09/", label: "09", isBranch: true },
    { id: "media/2026/10/", label: "10", isBranch: true },
  ],
  "media/2026/09/": [
    { id: "media/2026/09/launch-hero.webp", label: "launch-hero.webp", meta: "412 KB" },
    { id: "media/2026/09/og-card.png", label: "og-card.png", meta: "88 KB" },
  ],
  "media/2026/10/": [{ id: "media/2026/10/changelog-1.6.mp4", label: "changelog-1.6.mp4", meta: "18.2 MB" }],
  "media/avatars/": [
    { id: "media/avatars/u_8f21.jpg", label: "u_8f21.jpg", meta: "24 KB" },
    { id: "media/avatars/u_a03c.jpg", label: "u_a03c.jpg", meta: "31 KB" },
  ],
  "backups/": [],
};

function list(node: TreeNode) {
  return new Promise<TreeNode[]>((resolve, reject) =>
    setTimeout(() => (listing[node.id] ? resolve(listing[node.id]) : reject(new Error("403"))), 600),
  );
}

const roots: TreeNode[] = [
  { id: "media/", label: "media", isBranch: true },
  { id: "backups/", label: "backups", isBranch: true },
];

export default function TreeViewLazy() {
  const [opened, setOpened] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
        <TreeView aria-label="Bucket acme-assets" data={roots} loadChildren={list} onAction={(node) => setOpened(node.id)} />
      </div>
      <p className="px-1 text-[13px] text-white/55">
        {opened ? (
          <>
            Opened <span className="font-mono text-white/85">s3://acme-assets/{opened}</span>
          </>
        ) : (
          "Folders load when you open them. Click a file to open it."
        )}
      </p>
    </div>
  );
}
