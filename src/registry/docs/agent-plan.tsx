import type { ComponentDoc } from "../types";
import AgentPlanDemo from "../examples/agent-plan/demo";
import AgentPlanFailed from "../examples/agent-plan/failed";
import AgentPlanResearch from "../examples/agent-plan/research";

export const doc: ComponentDoc = {
  usage: `import { AgentPlan } from "@/components/ui/agent-plan"

<AgentPlan
  title="Fix the failing date test"
  steps={[
    { title: "Reproduce with TZ=Europe/Berlin", status: "done", meta: "1 failed" },
    { title: "Step by calendar day in src/date.ts", status: "active" },
    { title: "Re-run the suite" },
  ]}
/>`,
  examples: [
    {
      name: "demo",
      title: "A plan in progress",
      description:
        "The tube between steps fills down to the step that's running, then that node lights. Substeps tick off under it. When the last step finishes the tube powers down to a steady line.",
      component: AgentPlanDemo,
    },
    {
      name: "failed",
      title: "Stopped by a failure",
      description: "The light stops at the failed step, which says why. Steps after it are skipped, not pending.",
      component: AgentPlanFailed,
    },
    {
      name: "research",
      title: "With findings",
      description: "Descriptions carry what a step found; meta carries the number. The active step shows a live timer when it has no meta.",
      component: AgentPlanResearch,
    },
  ],
  api: [
    {
      name: "AgentPlan",
      props: [
        { prop: "steps", type: "PlanStep[]", description: "{ id?, title, label?, description?, status?, meta?, substeps?, content? }" },
        { prop: "title", type: "ReactNode", description: "Heading above the steps. Also names the list." },
        { prop: "readout", type: "ReactNode | null", default: '"2 of 4"', description: "Replaces the count of done steps. null hides it." },
        { prop: "timer", type: "boolean", default: "true", description: "Live timer on the active step when it has no meta." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Failed steps are always red." },
      ],
    },
    {
      name: "PlanStep",
      props: [
        { prop: "title", type: "ReactNode", description: "What the step does." },
        { prop: "status", type: '"pending" | "active" | "done" | "failed" | "skipped"', default: '"pending"', description: "The tube lights up to the furthest step that started." },
        { prop: "description", type: "ReactNode", description: "A line under the title: what it found, why it failed." },
        { prop: "meta", type: "ReactNode", description: "Right-aligned value." },
        { prop: "substeps", type: "{ title, status?, meta? }[]", description: "A short checklist under the step." },
        { prop: "content", type: "ReactNode", description: "Anything else under the step, such as the tool calls it made." },
        { prop: "label", type: "string", description: "Plain text for announcements when title isn't a string." },
      ],
    },
  ],
  notes: [
    "An ordered list; the running step has aria-current=\"step\" and every step and substep starts with its status in words.",
    "A polite live region announces Step 3 of 4 and the step's name when the active step changes, Plan complete at the end, and where it stopped on a failure. Nothing is announced on mount.",
    "Under prefers-reduced-motion the tube fills instantly and the active node holds still.",
  ],
};
