"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const files = ["page.tsx", "layout.tsx", "billing.tsx", "route.ts", "schema.prisma"];

export default function ResizableDemo() {
  return (
    <div className="h-[420px] w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <ResizablePanelGroup direction="horizontal" autoSaveId="resizable-demo">
        <ResizablePanel defaultSize={24} minSize={16} maxSize={40} collapsible>
          <div className="grid h-full content-start gap-0.5 p-3">
            <p className="px-2 pb-2 text-[13px] text-white/50">acme-web</p>
            {files.map((file, i) => (
              <p
                key={file}
                className={
                  i === 2
                    ? "truncate rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[12.5px] text-white/90"
                    : "truncate px-2 py-1 font-mono text-[12.5px] text-white/55"
                }
              >
                {file}
              </p>
            ))}
          </div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize file list" />
        <ResizablePanel defaultSize={76} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={68} minSize={30}>
              <div className="h-full overflow-hidden whitespace-pre p-5 font-mono text-[12.5px] leading-6 text-white/55">
                <p><span className="text-white/25">12</span>  export async function updatePlan(id: string, plan: Plan) {"{"}</p>
                <p><span className="text-white/25">13</span>    const seat = await db.seat.count({"{"} where: {"{"} orgId: id {"}"} {"}"});</p>
                <p><span className="text-white/25">14</span>    if (seat &gt; limits[plan]) throw new SeatLimitError(seat);</p>
                <p><span className="text-white/25">15</span>    return stripe.subscriptions.update(id, {"{"} plan {"}"});</p>
                <p><span className="text-white/25">16</span>  {"}"}</p>
              </div>
            </ResizablePanel>
            <ResizableHandle aria-label="Resize terminal" />
            <ResizablePanel defaultSize={32} minSize={12} collapsible>
              <div className="h-full overflow-hidden bg-black/30 p-4 font-mono text-[12.5px] leading-6 text-white/50">
                <p><span className="text-white/25">$</span> pnpm test billing</p>
                <p className="text-[#34d399]">✓ 14 passed (1.82s)</p>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
