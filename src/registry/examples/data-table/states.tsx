"use client";

import * as React from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Key = { id: string; name: string; prefix: string; scope: string; lastUsed: string };

const keys: Key[] = [
  { id: "k1", name: "Production web", prefix: "nk_live_8f3a", scope: "Read, write", lastUsed: "2 minutes ago" },
  { id: "k2", name: "Billing worker", prefix: "nk_live_c41d", scope: "Billing", lastUsed: "1 hour ago" },
  { id: "k3", name: "Staging", prefix: "nk_test_77b0", scope: "Read, write", lastUsed: "Yesterday" },
  { id: "k4", name: "Analytics export", prefix: "nk_live_02e9", scope: "Read", lastUsed: "Sep 30" },
];

const columns: DataTableColumn<Key>[] = [
  { id: "name", header: "Name", accessor: "name", rowHeader: true, sortable: true },
  {
    id: "prefix",
    header: "Key",
    accessor: "prefix",
    cell: ({ value }) => <code className="font-mono text-[12.5px] text-white/60">{String(value)}…</code>,
  },
  { id: "scope", header: "Scope", accessor: "scope" },
  { id: "lastUsed", header: "Last used", accessor: "lastUsed", align: "right" },
];

export default function DataTableStates() {
  const [state, setState] = React.useState("loading");
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <ToggleGroup aria-label="Table state" size="sm" value={state} onValueChange={setState} className="w-fit">
        <ToggleGroupItem value="loading">Loading</ToggleGroupItem>
        <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
        <ToggleGroupItem value="data">Loaded</ToggleGroupItem>
      </ToggleGroup>
      <DataTable
        label="API keys"
        noun={["key", "keys"]}
        data={state === "data" ? keys : []}
        columns={columns}
        loading={state === "loading"}
        defaultPageSize={4}
        searchPlaceholder="Search keys"
        emptyState={
          <div className="grid justify-items-center gap-1.5">
            <p className="text-sm text-white/80">No API keys yet</p>
            <p className="text-[13px] text-white/50">Keys you create show here with their scope and last use.</p>
          </div>
        }
      />
    </div>
  );
}
