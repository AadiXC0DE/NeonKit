import { GitCommitHorizontal, Globe, Hammer, Rocket, ShieldCheck } from "@/components/ui/icons";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

export default function TimelineDeployPipeline() {
  return (
    <div className="w-full max-w-md">
      <Timeline>
        <TimelineItem
          icon={<GitCommitHorizontal />}
          title="Commit pushed to main"
          time="14:02"
          dateTime="2026-10-11T14:02Z"
        >
          <span className="font-mono text-xs text-white/50">8f3a2c1</span> · Cache edge config between deploys
        </TimelineItem>
        <TimelineItem icon={<Hammer />} title="Built" time="48s" dateTime="PT48S">
          312 routes, 18 functions. Restored 1.4 GB from the build cache.
        </TimelineItem>
        <TimelineItem icon={<ShieldCheck />} title="Checks passed" time="1m 06s" dateTime="PT1M6S">
          Type check, 1,284 tests and the Lighthouse budget.
        </TimelineItem>
        <TimelineItem status="current" icon={<Rocket />} title="Deploying to fra1, iad1, hnd1" time="Running">
          2 of 3 regions are live. Waiting on health checks in hnd1.
        </TimelineItem>
        <TimelineItem status="upcoming" icon={<Globe />} title="Promote to production">
          Swaps neonkit.dev to this deployment.
        </TimelineItem>
      </Timeline>
    </div>
  );
}
