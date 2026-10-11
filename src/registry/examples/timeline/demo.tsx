import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

export default function TimelineDemo() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <h3 className="text-base font-semibold text-white/90">Elevated error rates on the EU API</h3>
          <p className="text-xs text-white/45">Affects api.eu · fra1, lhr1</p>
        </div>
        <Badge dot pulse>
          Monitoring
        </Badge>
      </div>

      <Timeline>
        <TimelineItem title="Investigating" time="09:12 UTC" dateTime="2026-10-11T09:12Z">
          Error rates rose to 4.2% minutes after the 09:05 deploy. We&apos;re looking into it.
        </TimelineItem>
        <TimelineItem title="Identified" time="09:31 UTC" dateTime="2026-10-11T09:31Z">
          A lower connection pool limit in v4.19.0 starves requests under peak load.
        </TimelineItem>
        <TimelineItem title="Fix deployed" time="09:48 UTC" dateTime="2026-10-11T09:48Z">
          Rolled back to v4.18.2 in fra1 and lhr1.
        </TimelineItem>
        <TimelineItem status="current" title="Monitoring" time="10:05 UTC" dateTime="2026-10-11T10:05Z">
          Error rates are back under 0.1%. We&apos;ll keep watching for the next hour.
        </TimelineItem>
        <TimelineItem status="upcoming" title="Resolved" />
      </Timeline>
    </div>
  );
}
