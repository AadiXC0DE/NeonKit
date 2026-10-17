import { ScrollArea } from "@/components/ui/scroll-area";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

export default function TimelineRoadmap() {
  return (
    <ScrollArea orientation="horizontal" aria-label="Release roadmap" className="w-full max-w-[44rem]">
      <Timeline orientation="horizontal" className="min-w-[43rem] px-1 pb-5 pt-3">
        <TimelineItem className="min-w-[8.5rem]" title="v2.0" time="2026-03-04">
          Tailwind 4 support and the new color system.
        </TimelineItem>
        <TimelineItem className="min-w-[8.5rem]" title="v2.1" time="2026-05-20">
          Select, Combobox and form field anatomy.
        </TimelineItem>
        <TimelineItem className="min-w-[8.5rem]" title="v2.2" time="2026-08-12">
          Overlays move to floating-ui.
        </TimelineItem>
        <TimelineItem className="min-w-[8.5rem]" status="current" title="v2.3 release candidate" time="2026-10-08">
          Table, Timeline and Scroll Area. In testing now.
        </TimelineItem>
        <TimelineItem className="min-w-[8.5rem]" status="upcoming" title="v2.4" time="Q1 2027">
          Charts and a data grid.
        </TimelineItem>
      </Timeline>
    </ScrollArea>
  );
}
