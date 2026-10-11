"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoaded() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(id);
  }, [loading]);

  return (
    <div className="grid w-full max-w-sm gap-4">
      <article
        aria-busy={loading}
        className="min-h-[13.5rem] rounded-xl border border-white/10 bg-white/[0.03] p-5"
      >
        {loading ? (
          <>
            <span className="sr-only">Loading article</span>
            <Skeleton variant="text" className="h-2.5 w-28" />
            <Skeleton variant="text" className="mt-4 h-4 w-4/5" />
            <div className="mt-4 grid gap-2.5">
              <Skeleton variant="text" className="h-2.5" />
              <Skeleton variant="text" className="h-2.5 w-11/12" />
              <Skeleton variant="text" className="h-2.5 w-1/2" />
            </div>
            <div className="mt-6 flex items-center gap-2.5">
              <Skeleton variant="circle" className="size-7" />
              <Skeleton variant="text" className="h-2.5 w-28" />
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-white/45">Engineering · 6 min read</p>
            <h3 className="mt-2 text-base font-medium text-white/90">
              How we cut cold starts by 40%
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">
              Moving route handlers to the edge and trimming the server bundle
              took p95 boot time from 820 ms to 490 ms.
            </p>
            <div className="mt-4 flex items-center gap-2.5 text-xs text-white/55">
              <span className="flex size-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[10px] font-medium text-white/80">
                MC
              </span>
              Maya Chen · Oct 9
            </div>
          </>
        )}
      </article>
      <Button
        variant="ghost"
        size="sm"
        className="justify-self-center"
        disabled={loading}
        onClick={() => setLoading(true)}
      >
        <RefreshCw /> Reload
      </Button>
    </div>
  );
}
