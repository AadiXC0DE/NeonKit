"use client";

import * as React from "react";
import { PanelLeft } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ResizablePanelApi,
} from "@/components/ui/resizable";

export default function ResizableControlled() {
  const sidebar = React.useRef<ResizablePanelApi>(null);
  const [sizes, setSizes] = React.useState<number[]>([30, 70]);
  const open = sizes[0] > 0.5;

  return (
    <div className="grid w-full max-w-2xl gap-3">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="border border-white/10"
          aria-pressed={open}
          onClick={() => (open ? sidebar.current?.collapse() : sidebar.current?.expand())}
        >
          <PanelLeft aria-hidden />
          {open ? "Hide outline" : "Show outline"}
        </Button>
        <p className="font-mono text-xs tabular-nums text-white/50">
          {sizes.map((s) => `${s.toFixed(1)}%`).join(" / ")}
        </p>
      </div>
      <div className="h-56 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <ResizablePanelGroup direction="horizontal" onLayout={setSizes}>
          <ResizablePanel apiRef={sidebar} defaultSize={30} minSize={20} maxSize={45} collapsible>
            <ol className="grid gap-2 p-4 text-[13px] text-white/55">
              <li className="text-white/90">1. Why annual</li>
              <li>2. Churn by plan</li>
              <li>3. The 20% test</li>
              <li>4. Risks</li>
            </ol>
          </ResizablePanel>
          <ResizableHandle withHandle={false} aria-label="Resize outline" />
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="grid gap-2 p-5">
              <h3 className="text-base font-medium text-white/90">Why annual</h3>
              <p className="text-sm leading-6 text-white/55">
                Annual Team seats churn at 0.9% a month against 2.7% for monthly ones.
              </p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <p className="text-xs leading-5 text-white/50">
        Focus the divider and use the arrow keys, or press Enter to fold the outline away.
      </p>
    </div>
  );
}
