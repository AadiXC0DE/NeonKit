"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { neonVars } from "@/lib/neon";

type Incident = {
  id: string;
  title: string;
  service: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  opened: number;
  duration: number;
};

const services = ["checkout-api", "edge-router", "search", "auth", "ingest-worker", "billing"];
const titles = [
  "Elevated 5xx on POST /orders",
  "p99 latency over 2s in fra1",
  "Index lag above 10 minutes",
  "Token refresh failing for SSO orgs",
  "Queue depth over 50k",
  "Duplicate invoice emails",
  "Cold starts after config push",
  "TLS handshake errors from one CDN POP",
];

const incidents: Incident[] = Array.from({ length: 64 }, (_, i) => ({
  id: `INC-${812 - i}`,
  title: titles[(i * 5) % titles.length],
  service: services[(i * 7) % services.length],
  severity: i % 11 === 0 ? "SEV1" : i % 3 === 0 ? "SEV2" : "SEV3",
  opened: i * 19 + (i % 4) * 3,
  duration: ((i * 37) % 170) + 6,
}));

const severity = { SEV1: "red", SEV2: "orange", SEV3: "white" } as const;

function ago(hours: number) {
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const columns: DataTableColumn<Incident>[] = [
  {
    id: "severity",
    header: "Sev",
    accessor: "severity",
    sortable: true,
    width: 72,
    filter: "select",
    cell: ({ row }) => (
      <span style={neonVars(severity[row.severity])} className="font-medium tabular-nums text-[rgb(var(--neon))]">
        {row.severity}
      </span>
    ),
  },
  { id: "title", header: "Incident", accessor: "title", rowHeader: true },
  { id: "service", header: "Service", accessor: "service", filter: "text", cell: ({ highlight, value }) => <span className="font-mono text-[12.5px] text-white/60">{highlight(String(value))}</span> },
  { id: "duration", header: "Duration", accessor: "duration", sortable: true, align: "right", searchable: false, cell: ({ value }) => `${value}m` },
  { id: "opened", header: "Opened", accessor: "opened", sortable: true, align: "right", searchable: false, cell: ({ value }) => <span className="text-white/55">{ago(value as number)}</span> },
];

// Each row is a link: the incident title carries the href, stretched over the whole row.
export default function DataTableLinks() {
  return (
    <DataTable
      className="w-full max-w-4xl"
      label="Incidents"
      noun={["incident", "incidents"]}
      data={incidents}
      columns={columns}
      getRowHref={(row) => `#${row.id.toLowerCase()}`}
      pagination="load-more"
      defaultPageSize={8}
      defaultDensity="compact"
      defaultSorting={[{ id: "opened", desc: false }]}
      searchPlaceholder="Search incidents"
    />
  );
}
