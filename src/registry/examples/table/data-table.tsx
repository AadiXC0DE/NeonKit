"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Status = "paid" | "open" | "overdue" | "draft";

type Invoice = {
  id: string;
  customer: string;
  status: Status;
  /** Days since Jan 1, 2026 (UTC). */
  due: number;
  amount: number;
};

const customers = [
  "Kestrel Health",
  "Orbital Freight",
  "Lumen Analytics",
  "Parallel Works",
  "Riverbend Clinic",
  "Sable Systems",
  "Tessellate",
  "Umbra Audio",
  "Vantage Legal",
  "Quarry & Co",
];

const TODAY = 283; // Oct 11, 2026
const PAGE_SIZE = 6;

const initialInvoices: Invoice[] = Array.from({ length: 24 }, (_, i) => {
  const due = 300 - i * 5;
  const status: Status = due > TODAY ? (i % 4 === 0 ? "draft" : "open") : i % 5 === 2 ? "overdue" : "paid";
  return {
    id: `INV-${2041 - i}`,
    customer: customers[(i * 3) % customers.length],
    status,
    due,
    amount: ((i * 7919) % 8900) + 450 + ((i * 37) % 4) * 0.25,
  };
});

const statuses = {
  paid: { label: "Paid", color: "green" },
  open: { label: "Open", color: "blue" },
  overdue: { label: "Overdue", color: "red" },
  draft: { label: "Draft", color: "white" },
} as const;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const formatDue = (days: number) => day.format(new Date(Date.UTC(2026, 0, 1 + days)));

type SortKey = "id" | "customer" | "due" | "amount";
type Sort = { key: SortKey; direction: "asc" | "desc" };

const compare: Record<SortKey, (a: Invoice, b: Invoice) => number> = {
  id: (a, b) => a.id.localeCompare(b.id),
  customer: (a, b) => a.customer.localeCompare(b.customer),
  due: (a, b) => a.due - b.due,
  amount: (a, b) => a.amount - b.amount,
};

export default function TableDataTable() {
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [sort, setSort] = React.useState<Sort>({ key: "due", direction: "desc" });
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());

  const sorted = React.useMemo(() => {
    const rows = [...invoices].sort(compare[sort.key]);
    return sort.direction === "asc" ? rows : rows.reverse();
  }, [invoices, sort]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);
  const selectedOnPage = rows.filter((invoice) => selected.has(invoice.id)).length;

  function sortBy(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
    setPage(1);
  }

  function setChecked(ids: string[], on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function markPaid() {
    setInvoices((current) =>
      current.map((invoice) => (selected.has(invoice.id) ? { ...invoice, status: "paid" } : invoice)),
    );
    setSelected(new Set());
  }

  const direction = (key: SortKey) => (sort.key === key ? sort.direction : false);

  return (
    <div className="grid w-full max-w-3xl gap-3">
      <div className="flex h-8 items-center justify-between gap-4 px-1">
        <p aria-live="polite" className="text-sm text-white/55">
          {selected.size > 0 ? (
            <span className="text-white/90">{selected.size} selected</span>
          ) : (
            `${invoices.length} invoices`
          )}
        </p>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button size="sm" variant="soft" onClick={markPaid}>
              Mark as paid
            </Button>
          </div>
        )}
      </div>

      <Table aria-label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 pr-0">
              <Checkbox
                aria-label="Select all invoices on this page"
                checked={selectedOnPage === rows.length}
                indeterminate={selectedOnPage > 0 && selectedOnPage < rows.length}
                onCheckedChange={(on) => setChecked(rows.map((invoice) => invoice.id), on)}
              />
            </TableHead>
            <TableHead sortDirection={direction("id")} onSort={() => sortBy("id")}>
              Invoice
            </TableHead>
            <TableHead sortDirection={direction("customer")} onSort={() => sortBy("customer")}>
              Customer
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead sortDirection={direction("due")} onSort={() => sortBy("due")}>
              Due
            </TableHead>
            <TableHead align="right" sortDirection={direction("amount")} onSort={() => sortBy("amount")}>
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((invoice) => {
            const status = statuses[invoice.status];
            const isSelected = selected.has(invoice.id);
            return (
              <TableRow key={invoice.id} selected={isSelected}>
                <TableCell className="pr-0">
                  <Checkbox
                    aria-label={`Select ${invoice.id}`}
                    checked={isSelected}
                    onCheckedChange={(on) => setChecked([invoice.id], on)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-white/90">{invoice.id}</TableCell>
                <TableCell className="whitespace-nowrap">{invoice.customer}</TableCell>
                <TableCell>
                  <Badge color={status.color} size="sm">
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell
                  className={
                    invoice.status === "overdue" ? "whitespace-nowrap text-[#ff4d5e]" : "whitespace-nowrap text-white/55"
                  }
                >
                  {formatDue(invoice.due)}
                </TableCell>
                <TableCell align="right" className="font-medium text-white/90">
                  {currency.format(invoice.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-xs tabular-nums text-white/50">
          {start + 1}–{start + rows.length} of {sorted.length}
        </p>
        <Pagination size="sm" page={page} onPageChange={setPage} pageCount={pageCount} />
      </div>
    </div>
  );
}
