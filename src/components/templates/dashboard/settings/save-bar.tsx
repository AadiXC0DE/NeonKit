"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveBar({
  dirty,
  status,
  changes,
  onDiscard,
}: {
  dirty: boolean;
  status: "idle" | "saving" | "saved";
  changes: number;
  onDiscard: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const visible = dirty || status !== "idle";

  // A hidden bar must stay out of the Tab order.
  React.useEffect(() => {
    ref.current?.toggleAttribute("inert", !visible);
  }, [visible]);

  return (
    <div className="pointer-events-none sticky bottom-5 z-20 mt-6 flex justify-center">
      <div
        ref={ref}
        aria-hidden={!visible}
        className={cn(
          "pointer-events-auto flex w-full max-w-[560px] items-center gap-3 rounded-2xl border bg-[#0a0b11] py-2.5 pl-4 pr-2.5",
          "transition-[opacity,transform,translate,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
          dirty
            ? "border-[rgb(var(--neon)/0.35)] shadow-[0_18px_40px_-12px_rgb(0_0_0/0.9),0_0_28px_-10px_rgb(var(--neon)/0.6)]"
            : "border-white/10 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.9)]",
        )}
      >
        <p aria-live="polite" className="min-w-0 flex-1 truncate text-[13px] text-white/75">
          {status === "saved" && !dirty ? (
            <span className="inline-flex items-center gap-1.5 text-white/90">
              <Check aria-hidden className="size-4 text-[rgb(var(--neon))]" /> Changes saved
            </span>
          ) : (
            <>
              <span aria-hidden className="mr-2 inline-block size-1.5 rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_8px_rgb(var(--neon))]" />
              {changes === 1 ? "1 unsaved change" : `${changes} unsaved changes`}
            </>
          )}
        </p>
        <Button type="button" size="sm" variant="ghost" onClick={onDiscard} disabled={!dirty || status === "saving"}>
          Discard
        </Button>
        <Button type="submit" size="sm" variant="solid" loading={status === "saving"} disabled={!dirty}>
          Save
        </Button>
      </div>
    </div>
  );
}
