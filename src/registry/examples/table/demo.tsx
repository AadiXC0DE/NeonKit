"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Status = "ready" | "building" | "queued" | "error" | "canceled";

type Deployment = {
  id: string;
  message: string;
  sha: string;
  branch: string;
  status: Status;
  /** Build time in seconds. */
  duration: number | null;
  minutesAgo: number;
};

const deployments: Deployment[] = [
  { id: "dpl_1", message: "Cache edge config between deploys", sha: "8f3a2c1", branch: "main", status: "building", duration: null, minutesAgo: 0 },
  { id: "dpl_2", message: "Redesign the billing settings page", sha: "3b8e51f", branch: "feat/billing-v2", status: "queued", duration: null, minutesAgo: 1 },
  { id: "dpl_3", message: "Fix flaky checkout test", sha: "a1f9c2e", branch: "main", status: "ready", duration: 72, minutesAgo: 14 },
  { id: "dpl_4", message: "Add OTP input to sign-in", sha: "7c3d10b", branch: "feat/otp-input", status: "ready", duration: 95, minutesAgo: 38 },
  { id: "dpl_5", message: "Bump next to 16.4.0", sha: "c93e4a8", branch: "deps/next-16-4", status: "error", duration: 41, minutesAgo: 62 },
  { id: "dpl_6", message: "Tighten rate limits on search", sha: "5d2f61b", branch: "fix/search-limits", status: "ready", duration: 66, minutesAgo: 125 },
  { id: "dpl_7", message: "Translate onboarding into German", sha: "e0b7a93", branch: "i18n/de", status: "canceled", duration: 12, minutesAgo: 190 },
];

const statuses = {
  ready: { label: "Ready", color: "green", pulse: false, order: 3 },
  building: { label: "Building", color: "amber", pulse: true, order: 1 },
  queued: { label: "Queued", color: "white", pulse: false, order: 2 },
  error: { label: "Error", color: "red", pulse: false, order: 0 },
  canceled: { label: "Canceled", color: "white", pulse: false, order: 4 },
} as const;

type SortKey = "message" | "status" | "duration" | "created";
type Sort = { key: SortKey; direction: "asc" | "desc" };

const compare: Record<SortKey, (a: Deployment, b: Deployment) => number> = {
  message: (a, b) => a.message.localeCompare(b.message),
  status: (a, b) => statuses[a.status].order - statuses[b.status].order,
  duration: (a, b) => (a.duration ?? Infinity) - (b.duration ?? Infinity),
  created: (a, b) => b.minutesAgo - a.minutesAgo,
};

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${String(seconds % 60).padStart(2, "0")}s` : `${seconds}s`;
}

function formatAge(minutes: number) {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function TableDemo() {
  const [sort, setSort] = React.useState<Sort>({ key: "created", direction: "desc" });
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(["dpl_4"]));

  const rows = React.useMemo(() => {
    const sorted = [...deployments].sort(compare[sort.key]);
    return sort.direction === "asc" ? sorted : sorted.reverse();
  }, [sort]);

  function sortBy(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  }

  function toggle(id: string, on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const allSelected = selected.size === deployments.length;
  const direction = (key: SortKey) => (sort.key === key ? sort.direction : false);

  return (
    <div className="grid w-full max-w-3xl gap-3">
      <div className="flex items-baseline justify-between gap-4 px-1">
        <h3 className="text-sm font-medium text-white/90">Deployments</h3>
        <p aria-live="polite" className="text-xs text-white/50">
          {selected.size > 0 ? `${selected.size} of ${deployments.length} selected` : `${deployments.length} deployments`}
        </p>
      </div>
      <Table aria-label="Deployments">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 pr-0">
              <Checkbox
                className="flex w-fit"
                aria-label="Select all deployments"
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onCheckedChange={(on) => setSelected(on ? new Set(deployments.map((d) => d.id)) : new Set())}
              />
            </TableHead>
            <TableHead sortDirection={direction("message")} onSort={() => sortBy("message")}>
              Commit
            </TableHead>
            <TableHead sortDirection={direction("status")} onSort={() => sortBy("status")}>
              Status
            </TableHead>
            <TableHead align="right" sortDirection={direction("duration")} onSort={() => sortBy("duration")}>
              Duration
            </TableHead>
            <TableHead align="right" sortDirection={direction("created")} onSort={() => sortBy("created")}>
              Created
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((deployment) => {
            const status = statuses[deployment.status];
            const isSelected = selected.has(deployment.id);
            return (
              <TableRow
                key={deployment.id}
                selected={isSelected}
                interactive
                onClick={(event) => {
                  // The checkbox handles its own clicks.
                  if ((event.target as HTMLElement).closest("label")) return;
                  toggle(deployment.id, !isSelected);
                }}
              >
                <TableCell className="pr-0">
                  <Checkbox
                    className="flex w-fit"
                    aria-label={`Select ${deployment.sha}`}
                    checked={isSelected}
                    onCheckedChange={(on) => toggle(deployment.id, on)}
                  />
                </TableCell>
                <TableCell>
                  {/* A floor on the width: on a phone the table scrolls instead of cutting every message to a word. */}
                  <div className="grid min-w-[13.5rem] max-w-[18rem] gap-0.5">
                    <span className="truncate font-medium text-white/90">{deployment.message}</span>
                    <span className="flex min-w-0 whitespace-nowrap font-mono text-xs text-white/50">
                      <span className="truncate">{deployment.branch}</span>
                      <span className="shrink-0">&nbsp;· {deployment.sha}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color={status.color} dot pulse={status.pulse}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell align="right" className="whitespace-nowrap font-mono text-xs text-white/60">
                  {formatDuration(deployment.duration)}
                </TableCell>
                <TableCell align="right" className="whitespace-nowrap text-white/50">
                  {formatAge(deployment.minutesAgo)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
