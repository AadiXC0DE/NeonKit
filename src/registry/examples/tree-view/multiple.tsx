"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TreeView, type TreeNode } from "@/components/ui/tree-view";

const channels: TreeNode[] = [
  {
    id: "eng",
    label: "Engineering",
    children: [
      { id: "eng-deploys", label: "#deploys", meta: "1.2k" },
      { id: "eng-incidents", label: "#incidents", meta: "84" },
      { id: "eng-frontend", label: "#frontend", meta: "312" },
      { id: "eng-infra", label: "#infra", meta: "207" },
    ],
  },
  {
    id: "design",
    label: "Design",
    children: [
      { id: "design-crit", label: "#crit", meta: "96" },
      { id: "design-system", label: "#design-system", meta: "143" },
    ],
  },
  {
    id: "company",
    label: "Company",
    children: [
      { id: "company-general", label: "#general", meta: "2.4k" },
      { id: "company-random", label: "#random", meta: "980" },
      { id: "company-board", label: "#board", meta: "12", disabled: true },
    ],
  },
];

export default function TreeViewMultiple() {
  const [selected, setSelected] = React.useState<string[]>(["eng-deploys", "eng-incidents"]);
  return (
    <div className="grid w-full max-w-xs gap-4">
      <TreeView
        aria-label="Channels to export"
        data={channels}
        selectionMode="multiple"
        showIcons={false}
        defaultExpanded={["eng", "design"]}
        selected={selected}
        onSelectedChange={setSelected}
      />
      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-[13px] text-white/55">
          <span className="tabular-nums text-white/90">{selected.length}</span> channels
        </p>
        <Button size="sm" disabled={selected.length === 0}>
          Export history
        </Button>
      </div>
      <p className="text-xs leading-5 text-white/50">Cmd-click to add one, Shift-click for a range, Space toggles.</p>
    </div>
  );
}
