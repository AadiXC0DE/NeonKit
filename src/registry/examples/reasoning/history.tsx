import { Reasoning } from "@/components/ui/reasoning";

export default function ReasoningHistory() {
  return (
    <div className="grid w-full max-w-xl gap-6">
      <div className="grid gap-2">
        <Reasoning duration={4}>
          {`The user wants the p95 for /api/search over the last 24 hours, split by region. The metrics store keeps 1-minute buckets, so a p95 over a day means merging histograms, not averaging percentiles.`}
        </Reasoning>
        <p className="text-[15px] leading-[1.65] text-white/85">
          p95 was 182 ms in eu-west-1 and 410 ms in ap-south-1. The gap opened at 06:40 UTC.
        </p>
      </div>
      <div className="grid gap-2">
        <Reasoning duration={72} defaultOpen>
          {`06:40 UTC is when the ap-south-1 read replica was resized. If the new instance started with a cold buffer cache, every search would hit disk until the working set warmed up.

That predicts latency falling back over a few hours. It didn't: it's still at 410 ms now, eight hours later. So the cache isn't the whole story.

The resize also moved the replica to a different availability zone than the API pods. Cross-AZ round trips are about 1 ms each, and **a search makes 140 of them** through the N+1 in \`loadFacets\`. That's 140 ms on its own, and it would never warm away.`}
        </Reasoning>
        <p className="text-[15px] leading-[1.65] text-white/85">
          It&apos;s the zone, not the cache. Moving the replica back to ap-south-1a should take about 140 ms off.
        </p>
      </div>
    </div>
  );
}
