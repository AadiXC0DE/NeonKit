"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function usePending(ms: number) {
  const [pending, setPending] = React.useState(false);
  const start = () => {
    if (pending) return;
    setPending(true);
    setTimeout(() => setPending(false), ms);
  };
  return [pending, start] as const;
}

export default function SpinnerButton() {
  const [checking, runChecks] = usePending(2400);
  const [publishing, publish] = usePending(2000);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button aria-busy={checking || undefined} onClick={runChecks}>
        {checking && <Spinner size="sm" aria-hidden />}
        {checking ? "Running checks" : "Run checks"}
      </Button>
      <Button
        variant="soft"
        color="violet"
        aria-busy={publishing || undefined}
        onClick={publish}
      >
        {publishing && <Spinner size="sm" variant="dots" aria-hidden />}
        {publishing ? "Publishing" : "Publish post"}
      </Button>
    </div>
  );
}
