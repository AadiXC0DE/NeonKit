"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { basePath } from "../config";
import { DEPLOYMENTS, type Deployment } from "../data";
import { duration } from "../parts/format";
import { StatusBadge } from "../parts/status-badge";

export function RecentDeployments({ className }: { className?: string }) {
  const [rows, setRows] = React.useState<Deployment[]>(DEPLOYMENTS);

  // The build at the top finishes while you watch.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setRows((list) => list.map((d) => (d.status === "building" ? { ...d, status: "ready", duration: 96 } : d)));
    }, 6500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section aria-labelledby="deploys-title" className={className}>
      <div className="flex items-end justify-between gap-4 px-1 pb-4">
        <div>
          <h2 id="deploys-title" className="text-lg font-semibold tracking-[-0.02em] text-white">
            Recent deployments
          </h2>
          <p className="mt-1 text-[13px] text-white/60">Production and preview, newest first.</p>
        </div>
        <Link
          href={`${basePath}/projects`}
          className="group inline-flex items-center gap-1.5 rounded-md text-[13px] text-white/65 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          All projects
          <ArrowRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deployment</TableHead>
            <TableHead className="hidden sm:table-cell">Commit</TableHead>
            <TableHead className="hidden xl:table-cell">Author</TableHead>
            <TableHead className="hidden xl:table-cell">Environment</TableHead>
            <TableHead align="right" className="hidden lg:table-cell">Build</TableHead>
            <TableHead align="right">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 sm:flex-col sm:items-start">
                  <span className="whitespace-nowrap font-mono text-[13px] text-white/90">{d.project}</span>
                  <StatusBadge status={d.status} />
                  <span className="w-full max-w-[230px] truncate text-xs text-white/60 sm:hidden">{d.commit}</span>
                </div>
              </TableCell>
              <TableCell className="hidden max-w-[220px] sm:table-cell xl:max-w-[340px]">
                <p className="truncate text-white/85">{d.commit}</p>
                <p className="mt-1 flex min-w-0 items-center gap-1.5 font-mono text-xs text-white/55">
                  <GitBranch aria-hidden className="size-3 shrink-0" />
                  <span className="truncate">{d.branch}</span>
                  <span className="text-white/30">·</span>
                  <span>{d.sha}</span>
                </p>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <Avatar alt="" fallback={initials(d.author)} size="sm" className="text-[10px]" />
                  <span className="text-white/75">{d.author}</span>
                </span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className={d.environment === "Production" ? "text-white/85" : "text-white/60"}>{d.environment}</span>
              </TableCell>
              <TableCell align="right" className="hidden font-mono text-[13px] text-white/75 lg:table-cell">
                {d.status === "building" ? <span className="text-[rgb(var(--neon))]">running</span> : duration(d.duration)}
              </TableCell>
              <TableCell align="right" className="whitespace-nowrap text-[13px] text-white/60">
                {d.age}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}
