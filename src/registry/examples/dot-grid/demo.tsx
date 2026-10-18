import { Button } from "@/components/ui/button";
import { DotGrid } from "@/components/ui/dot-grid";

export default function DotGridDemo() {
  return (
    <div className="relative flex h-[440px] w-full flex-col justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 sm:h-[480px] sm:px-14">
      <DotGrid />
      <h2 className="relative max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white/95 sm:text-[52px]">
        Every request, traced to the line
      </h2>
      <p className="relative mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/60">
        Halyard keeps all 4.1 billion spans a day, unsampled, and answers a query across a week of them in 280 ms.
      </p>
      <div className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button variant="solid">Start tracing</Button>
        <code className="font-mono text-[13px] text-white/60">npx halyard init</code>
      </div>
    </div>
  );
}
