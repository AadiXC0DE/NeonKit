"use client";

import * as React from "react";
import { Download } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { neonVars } from "@/lib/neon";

type Status = "paid" | "open" | "overdue" | "draft" | "void";

type Invoice = {
  id: string;
  customer: string;
  status: Status;
  plan: "Starter" | "Team" | "Business" | "Enterprise";
  amount: number;
  issued: Date;
};

const customers = [
  "Kestrel Health", "Orbital Freight", "Lumen Analytics", "Parallel Works", "Riverbend Clinic",
  "Sable Systems", "Tessellate", "Umbra Audio", "Vantage Legal", "Quarry & Co", "Halcyon Labs",
  "Northwind Mobility", "Brightline Studio", "Ferro Robotics", "Juniper Bank", "Moss & Pike",
  "Ostara Foods", "Pelican Air", "Coral Ledger", "Driftwood Games",
];
const plans = ["Starter", "Team", "Business", "Enterprise"] as const;
const prices = { Starter: 290, Team: 1190, Business: 4800, Enterprise: 18500 };

// 1,000 invoices from a fixed seed, so the server and client render the same rows.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seeded(2026);
const invoices: Invoice[] = Array.from({ length: 1000 }, (_, i) => {
  const plan = plans[Math.min(3, Math.floor(random() ** 1.6 * 4))];
  const day = Math.floor(i * 0.29);
  const roll = random();
  const status: Status =
    day < 12 ? (roll > 0.6 ? "draft" : "open") : roll > 0.93 ? "overdue" : roll < 0.025 ? "void" : "paid";
  return {
    id: `INV-${24000 - i}`,
    customer: customers[Math.floor(random() * customers.length)],
    status,
    plan,
    amount: Math.round(prices[plan] * (0.8 + random() * 0.6) * 100) / 100,
    issued: new Date(Date.UTC(2026, 9, 12) - day * 86400000),
  };
});

const statuses: Record<Status, { label: string; color: string }> = {
  paid: { label: "Paid", color: "green" },
  open: { label: "Open", color: "blue" },
  overdue: { label: "Overdue", color: "red" },
  draft: { label: "Draft", color: "white" },
  void: { label: "Void", color: "white" },
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice", accessor: "id", sortable: true, rowHeader: true, width: 130 },
  { id: "customer", header: "Customer", accessor: "customer", sortable: true },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    sortable: true,
    filter: "select",
    filterOptions: Object.entries(statuses).map(([value, s]) => ({ value, label: s.label })),
    filterValue: (row) => statuses[row.status].label,
    cell: ({ row }) => {
      const s = statuses[row.status];
      return (
        // Block flex: an inline-flex box would sit its empty dot on the baseline and drop the label 2px.
        <span className="flex items-center gap-2" style={neonVars(s.color)}>
          <span
            className={
              row.status === "draft" || row.status === "void"
                ? "size-1.5 rounded-full border border-white/40"
                : "size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/0.8)]"
            }
          />
          <span className={row.status === "void" ? "text-white/40 line-through" : "text-white/80"}>{s.label}</span>
        </span>
      );
    },
  },
  { id: "plan", header: "Plan", accessor: "plan", sortable: true, filter: "select" },
  {
    id: "amount",
    header: "Amount",
    accessor: "amount",
    sortable: true,
    sortDescFirst: true,
    align: "right",
    searchable: false,
    cell: ({ value }) => <span className="text-white/90">{money.format(value as number)}</span>,
  },
  {
    id: "issued",
    header: "Issued",
    accessor: "issued",
    sortable: true,
    sortDescFirst: true,
    align: "right",
    searchable: false,
    cell: ({ value }) => <span className="text-white/60">{date.format(value as Date)}</span>,
  },
];

export default function DataTableDemo() {
  return (
    <DataTable
      className="w-full max-w-5xl"
      label="Invoices"
      noun={["invoice", "invoices"]}
      data={invoices}
      columns={columns}
      selectable
      defaultSorting={[{ id: "issued", desc: true }]}
      searchPlaceholder="Search invoices or customers"
      pageSizeOptions={[10, 25, 50, 100]}
      maxHeight={560}
      selectionActions={(rows, clear) => (
        <>
          <Button variant="ghost" size="sm" className="border border-white/10" onClick={clear}>
            <Download aria-hidden />
            Export {rows.length}
          </Button>
        </>
      )}
    />
  );
}
