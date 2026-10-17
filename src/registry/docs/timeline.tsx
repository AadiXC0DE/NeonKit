import type { ComponentDoc } from "../types";
import TimelineDemo from "../examples/timeline/demo";
import TimelineDeployPipeline from "../examples/timeline/deploy-pipeline";
import TimelineRoadmap from "../examples/timeline/roadmap";
import TimelineLive from "../examples/timeline/live";

export const doc: ComponentDoc = {
  usage: `import { Timeline, TimelineItem } from "@/components/ui/timeline"

<Timeline>
  <TimelineItem title="Identified" time="09:31 UTC" dateTime="2026-10-11T09:31Z">
    A connection pool limit starves requests under load.
  </TimelineItem>
  <TimelineItem status="current" title="Monitoring" time="10:05 UTC">
    Error rates are back under 0.1%.
  </TimelineItem>
  <TimelineItem status="upcoming" title="Resolved" />
</Timeline>`,
  examples: [
    {
      name: "demo",
      title: "Incident updates",
      description:
        "The tube is lit up to the current item and unlit glass after it. On mount the light travels down from the first marker to now.",
      component: TimelineDemo,
    },
    {
      name: "deploy-pipeline",
      title: "With icons",
      description: "An icon replaces the dot in the marker. Durations use an ISO 8601 duration as their dateTime.",
      component: TimelineDeployPipeline,
    },
    {
      name: "roadmap",
      title: "Horizontal",
      description:
        "ISO date strings are formatted for you and rendered as <time>. Each item is at least 10rem wide, so put long timelines in a horizontal ScrollArea.",
      component: TimelineRoadmap,
    },
    {
      name: "live",
      title: "Advancing",
      description: "When an item moves to current, the segment before it fills and its marker strikes like a tube.",
      component: TimelineLive,
    },
  ],
  api: [
    {
      name: "Timeline",
      description: "Renders an <ol>. Also accepts native list attributes. Pass TimelineItem elements as direct children.",
      props: [
        { prop: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Vertical runs the tube down the left. Horizontal runs it along the top with content below." },
        {
          prop: "formatTime",
          type: "(date: Date) => ReactNode",
          description: "Formats a Date or ISO string time. The default is a short en-US format in UTC, so server and client render the same text.",
        },
        {
          prop: "statusLabels",
          type: 'Partial<Record<"done" | "upcoming", string>>',
          default: '{ done: "Completed", upcoming: "Upcoming" }',
          description: "Visually hidden words read before each title. Translate them here.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "TimelineItem",
      description: "Renders an <li>. Children become the description and may contain any block content.",
      props: [
        { prop: "title", type: "ReactNode", description: "The event name." },
        {
          prop: "status",
          type: '"done" | "current" | "upcoming"',
          default: '"done"',
          description: "Done and current items light the tube. The current marker pulses softly and gets aria-current=\"step\".",
        },
        {
          prop: "time",
          type: "ReactNode | Date",
          description: "A Date or ISO string renders a formatted <time dateTime>. Anything else renders as given.",
        },
        { prop: "dateTime", type: "string", description: "Machine-readable value for a human time such as \"2 hours ago\". Renders a <time>." },
        { prop: "icon", type: "ReactNode", description: "Replaces the dot inside the marker." },
      ],
    },
  ],
  notes: [
    "It's an ordered list, so screen readers announce the number of events and each one's position.",
    "Status isn't conveyed by light alone: done and upcoming items carry visually hidden labels, and the current item has aria-current=\"step\".",
    "Times with a machine-readable value render as <time dateTime>, so assistive tech and parsers get the exact moment.",
    "With reduced motion the tube doesn't fill on mount and the current marker holds a steady glow instead of pulsing.",
  ],
};
