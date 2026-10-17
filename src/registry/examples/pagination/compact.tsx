"use client";

import * as React from "react";
import { Pagination } from "@/components/ui/pagination";

const releases = [
  { version: "v2.4.0", date: "Mar 3", note: "Sidebar rail with hover labels" },
  { version: "v2.3.2", date: "Feb 24", note: "Fix focus return in nested dialogs" },
  { version: "v2.3.1", date: "Feb 19", note: "Pagination keeps its width mid-range" },
  { version: "v2.3.0", date: "Feb 11", note: "Stepper with a filling connector" },
  { version: "v2.2.4", date: "Feb 2", note: "Smaller bundle for the Select list" },
  { version: "v2.2.3", date: "Jan 28", note: "Respect reduced motion in Tabs" },
  { version: "v2.2.2", date: "Jan 20", note: "Toast stacking on mobile Safari" },
  { version: "v2.2.1", date: "Jan 14", note: "Kbd lights up while a key is held" },
  { version: "v2.2.0", date: "Jan 6", note: "Breadcrumb collapses long trails" },
];

const perPage = 3;

export default function PaginationCompact() {
  const [page, setPage] = React.useState(1);
  const visible = releases.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-medium text-white/90">Releases</h3>
        <span className="text-xs text-white/40">{releases.length} total</span>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {visible.map((release) => (
          <li key={release.version} className="grid gap-0.5 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[13px] text-white/90">{release.version}</span>
              <span className="text-xs text-white/40">{release.date}</span>
            </div>
            <p className="truncate text-xs text-white/55">{release.note}</p>
          </li>
        ))}
      </ul>
      <div className="flex justify-center border-t border-white/10 px-4 py-2.5">
        <Pagination
          variant="compact"
          size="sm"
          page={page}
          onPageChange={setPage}
          pageCount={Math.ceil(releases.length / perPage)}
        />
      </div>
    </div>
  );
}
