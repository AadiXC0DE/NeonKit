"use client";

import { Check } from "@/components/ui/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const steps = [
  { label: "Cloning github.com/acme/web", detail: "main · 9f3c2ab", time: "1.2s" },
  { label: "Restoring build cache", detail: "412 MB", time: "0.8s" },
  { label: "Installing dependencies", detail: "1,284 packages", time: "9.4s" },
  { label: "Running next build", detail: "38 routes", time: "24.1s" },
  { label: "Uploading static files", detail: "214 files", time: "3.9s" },
  { label: "Assigning acme.dev", detail: "fra1, iad1", time: "0.6s" },
];

export default function CollapsibleDemo() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="size-2 shrink-0 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_8px_rgb(52_211_153/0.8)]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/90">acme-web · Production</p>
          <p className="truncate text-xs text-white/50">Ready · deployed 4 minutes ago</p>
        </div>
        <span className="font-mono text-xs tabular-nums text-white/55">41.0s</span>
      </div>

      <Collapsible className="border-t border-white/[0.08]">
        <CollapsibleTrigger className="flex h-11 w-full gap-3 rounded-none px-4 text-[13px] focus-visible:ring-inset focus-visible:ring-offset-0">
          <span className="flex-1 text-left">Build steps</span>
          <span className="font-normal text-white/40">{steps.length} passed</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ol className="grid gap-2.5 px-4 pb-4 pt-1">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-3 text-[13px]">
                <Check aria-hidden className="size-3.5 shrink-0 text-[rgb(var(--neon))]" />
                <span className="min-w-0 flex-1 truncate text-white/80">
                  {step.label}
                  <span className="ml-2 text-white/35">{step.detail}</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-white/50">{step.time}</span>
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
