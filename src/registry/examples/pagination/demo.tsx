"use client";

import * as React from "react";
import { Pagination } from "@/components/ui/pagination";

const total = 2384;
const perPage = 50;
const pageCount = Math.ceil(total / perPage);

export default function PaginationDemo() {
  const [page, setPage] = React.useState(6);
  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <div className="grid justify-items-center gap-4">
      <Pagination page={page} onPageChange={setPage} pageCount={pageCount} />
      <p className="text-xs text-white/50">
        Showing <span className="tabular-nums text-white/80">{first.toLocaleString("en-US")}</span>–
        <span className="tabular-nums text-white/80">{last.toLocaleString("en-US")}</span> of{" "}
        <span className="tabular-nums text-white/80">{total.toLocaleString("en-US")}</span> audit events
      </p>
    </div>
  );
}
