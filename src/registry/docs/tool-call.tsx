import type { ComponentDoc } from "../types";
import ToolCallDemo from "../examples/tool-call/demo";
import ToolCallApproval from "../examples/tool-call/approval";
import ToolCallStates from "../examples/tool-call/states";
import ToolCallResearch from "../examples/tool-call/research";

export const doc: ComponentDoc = {
  usage: `import { ToolCall, ToolCallGroup } from "@/components/ui/tool-call"

<ToolCallGroup label="Run log">
  <ToolCall name="read_file" args={{ path: "src/date.ts" }} status="success" duration={0.1} result={source} />
  <ToolCall name="edit_file" summary="src/date.ts" status="approval" onApprove={run} onDeny={skip} />
</ToolCallGroup>`,
  examples: [
    {
      name: "demo",
      title: "A run log",
      description:
        "A coding agent reproduces a failing test, reads the file and asks before it edits. Approve it to watch the patch land and the suite go green; the running lamp blinks like drive activity and the timer counts up.",
      component: ToolCallDemo,
    },
    {
      name: "approval",
      title: "Approval",
      description:
        "A tool that needs permission opens with its arguments and a note on what it will do. The amber lamp breathes until you decide; Approve is the one lit thing on the row.",
      component: ToolCallApproval,
    },
    {
      name: "states",
      title: "Every status",
      description: "Success, error with its message, running, queued and denied, stacked in one group. Readouts stay in one column.",
      component: ToolCallStates,
    },
    {
      name: "research",
      title: "Custom results",
      description: "result takes any node. Here a SQL query returns a table, and summary replaces the raw arguments with what the query is for.",
      component: ToolCallResearch,
    },
  ],
  api: [
    {
      name: "ToolCall",
      description: "One invocation. The row is a disclosure when there is anything to show.",
      props: [
        { prop: "name", type: "string", description: "The tool's name, in mono." },
        { prop: "args", type: "Record<string, unknown> | string", description: "Shown as a key/value list when open. One string argument doubles as the summary." },
        { prop: "summary", type: "ReactNode", description: "Replaces the one-line argument summary." },
        { prop: "status", type: '"pending" | "approval" | "running" | "success" | "error" | "denied"', default: '"success"', description: "Drives the lamp, the readout and the border. \"done\" is accepted as success." },
        { prop: "duration", type: "number", description: "Seconds. While running, a live timer counts up when omitted." },
        { prop: "meta", type: "ReactNode", description: "Replaces the duration, e.g. \"14 passed\" or \"exit 1\"." },
        { prop: "result", type: "ReactNode", description: "Shown when open. Strings render as code." },
        { prop: "resultLanguage", type: "string", description: "Language for a string result." },
        { prop: "error", type: "ReactNode", description: "Shown under the row when status is error." },
        { prop: "children", type: "ReactNode", description: "Extra detail in the panel before the result, such as a diff preview." },
        { prop: "approvalNote", type: "ReactNode", description: "With status approval: what running it will do." },
        { prop: "onApprove / onDeny", type: "() => void", description: "The approval buttons. Set status yourself from them." },
        { prop: "approveLabel / denyLabel", type: "string", default: '"Approve" / "Deny"', description: "Button text, e.g. \"Run on prod\"." },
        { prop: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Disclosure state. A call waiting for approval is always open." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Approval is always amber and errors red." },
      ],
    },
    {
      name: "ToolCallGroup",
      description: "An ordered list that joins its calls into one panel, like lines in a log.",
      props: [
        { prop: "label", type: "string", default: '"Tool calls"', description: "Accessible name of the list." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Passed down to every call." },
      ],
    },
  ],
  notes: [
    "Each status is spoken as a word after the tool name, and status changes are announced through a polite live region. The ticking timer is never announced.",
    "Approve and Deny are plain buttons in reading order after the arguments, so the decision follows what it's about.",
    "Under prefers-reduced-motion the running lamp holds steady and the approval lamp stops breathing.",
  ],
};
