import { Skeleton } from "@/components/ui/skeleton";

// Varied widths read as real data; identical bars read as a wireframe.
const rows = [
  { name: "w-28", email: "w-36", amount: "w-14" },
  { name: "w-20", email: "w-32", amount: "w-12" },
  { name: "w-32", email: "w-40", amount: "w-16" },
  { name: "w-24", email: "w-28", amount: "w-12" },
  { name: "w-28", email: "w-36", amount: "w-14" },
];

export default function SkeletonTable() {
  return (
    <div
      aria-busy="true"
      className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
    >
      <span className="sr-only">Loading invoices</span>
      <div className="grid grid-cols-[1fr_auto_auto] gap-6 border-b border-white/[0.06] px-4 py-2.5 text-xs text-white/45">
        <span>Customer</span>
        <span className="w-16">Status</span>
        <span className="w-16 text-right">Amount</span>
      </div>
      <ul>
        {rows.map((row, i) => (
          <li
            key={i}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-6 border-b border-white/[0.04] px-4 py-3 last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton variant="circle" className="size-8 shrink-0" />
              <div className="grid min-w-0 gap-2">
                <Skeleton variant="text" className={row.name} />
                <Skeleton variant="text" className={`h-2 ${row.email} max-w-full`} />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <div className="flex w-16 justify-end">
              <Skeleton variant="text" className={row.amount} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
