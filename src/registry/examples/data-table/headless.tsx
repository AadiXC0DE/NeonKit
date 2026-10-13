"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useDataTable, type DataTableColumn } from "@/components/ui/data-table";

type Member = { id: string; name: string; email: string; role: "Owner" | "Admin" | "Member"; seats: number };

const members: Member[] = [
  { id: "m1", name: "Priya Raman", email: "priya@ledgerline.io", role: "Owner", seats: 1 },
  { id: "m2", name: "Marco Bellini", email: "marco@ledgerline.io", role: "Admin", seats: 1 },
  { id: "m3", name: "Hana Okafor", email: "hana@ledgerline.io", role: "Member", seats: 1 },
  { id: "m4", name: "Tomás Reyes", email: "tomas@ledgerline.io", role: "Member", seats: 1 },
  { id: "m5", name: "Ines Lindqvist", email: "ines@ledgerline.io", role: "Admin", seats: 1 },
];

const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Name", accessor: "name", sortable: true },
  { id: "email", header: "Email", accessor: "email" },
  { id: "role", header: "Role", accessor: "role", sortable: true },
];

// The same state machine without the table: search, sort and selection driving a list.
export default function DataTableHeadless() {
  const table = useDataTable({ data: members, columns, pagination: "none", defaultSorting: [{ id: "name", desc: false }] });
  const sort = table.getSort("role");

  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex items-center gap-2">
        <Input
          size="sm"
          aria-label="Search members"
          placeholder="Search members"
          value={table.globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        <button
          type="button"
          onClick={() => table.toggleSort("role")}
          className="h-8 shrink-0 cursor-pointer rounded-md border border-white/10 px-3 text-xs text-white/70 hover:text-white/90"
        >
          Role {sort ? (sort.desc ? "↓" : "↑") : ""}
        </button>
      </div>
      <ul className="grid">
        {table.rows.map(({ id, row }) => (
          <li
            key={id}
            className={cn(
              "flex items-center gap-3 border-b border-white/[0.06] px-1 py-2.5",
              table.isSelected(id) && "text-white",
            )}
          >
            <Checkbox
              size="sm"
              aria-label={`Select ${row.name}`}
              checked={table.isSelected(id)}
              onCheckedChange={(checked) => table.toggleRow(id, checked)}
            />
            <div className="grid min-w-0 flex-1">
              <span className="truncate text-sm text-white/90">{row.name}</span>
              <span className="truncate text-xs text-white/50">{row.email}</span>
            </div>
            <span className="text-xs text-white/55">{row.role}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-white/50">
        {table.selection.size} of {table.filteredRows.length} selected
      </p>
    </div>
  );
}
