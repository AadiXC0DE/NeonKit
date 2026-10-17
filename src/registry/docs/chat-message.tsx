import type { ComponentDoc } from "../types";
import ChatMessageDemo from "../examples/chat-message/demo";
import ChatMessageBubble from "../examples/chat-message/bubble";
import ChatMessageToolCalls from "../examples/chat-message/tool-calls";
import ChatMessageReasoning from "../examples/chat-message/reasoning";
import ChatMessageStates from "../examples/chat-message/states";

export const doc: ComponentDoc = {
  usage: `import { ChatMessage, ChatReasoning, ChatToolCall } from "@/components/ui/chat-message"

<ChatMessage from="assistant" name="Argon" time="14:02" content={text} streaming={streaming}>
  <ChatReasoning streaming={thinking}>{reasoning}</ChatReasoning>
  <ChatToolCall name="read_file" args={{ path: "app/page.tsx" }} status="done" />
</ChatMessage>`,
  examples: [
    {
      name: "demo",
      title: "A streamed reply",
      description:
        "Reasoning with a live timer folds away when it's done, a tool call runs, then the answer streams in. New words arrive lit and cool to white; the caret is a short tube at the end of the line.",
      component: ChatMessageDemo,
    },
    {
      name: "bubble",
      title: "Bubble layout",
      description: "Your own messages sit on the right in a bubble with their images above; replies stay open on the left.",
      component: ChatMessageBubble,
    },
    {
      name: "tool-calls",
      title: "Tool calls",
      description:
        "Done, failed, running and queued. Rows open to their arguments and output. These are Tool Call rows; use ToolCallGroup to join them into one log.",
      component: ChatMessageToolCalls,
    },
    {
      name: "reasoning",
      title: "Reasoning",
      description: "The filament is hot while it thinks and the trace stays open. Open or close it by hand and it stops folding itself away.",
      component: ChatMessageReasoning,
    },
    {
      name: "states",
      title: "System notes and errors",
      description: "System messages center as a quiet note. An error keeps whatever arrived and offers Try again.",
      component: ChatMessageStates,
    },
  ],
  api: [
    {
      name: "ChatMessage",
      description: "Renders an article. Children (reasoning, tool calls, your own parts) come before content.",
      props: [
        { prop: "from", type: '"user" | "assistant" | "system"', description: "Who sent it. System messages render as a centered note." },
        { prop: "name", type: "ReactNode", description: "Shown above flat messages and used as the accessible name." },
        { prop: "avatar", type: "ReactNode", description: "Replaces the default mark. null hides it." },
        { prop: "time", type: "ReactNode", description: "Shown next to the name." },
        { prop: "dateTime", type: "string", description: "Machine-readable value for the time element." },
        { prop: "layout", type: '"flat" | "bubble"', default: '"flat"', description: "Rows with marks and names, or user bubbles on the right." },
        { prop: "content", type: "string", description: "Markdown-ish text: paragraphs, lists, quotes, headings, fenced code, inline code, bold, italic, links." },
        { prop: "streaming", type: "boolean", default: "false", description: "Caret, fresh-word fade, lit mark. Actions hide until it's done." },
        { prop: "attachments", type: "ChatAttachmentItem[]", description: "{ name, size?, type?, url? }. Images with a url show a thumbnail." },
        { prop: "error", type: "ReactNode", description: "Shown under the content with Try again when onRetry is set." },
        { prop: "actions", type: '"hover" | "always" | "none"', default: '"hover"', description: "When the action row shows. Touch screens always show it." },
        { prop: "copyText", type: "string", default: "content", description: "What the copy action copies." },
        { prop: "onRetry", type: "() => void", description: "Adds Retry to replies." },
        { prop: "onEdit", type: "() => void", description: "Adds Edit to your own messages." },
        { prop: "feedback", type: '"up" | "down" | null', description: "Controlled thumbs. Shown on replies when any feedback prop is set." },
        { prop: "defaultFeedback", type: '"up" | "down" | null', description: "Initial thumbs when uncontrolled." },
        { prop: "onFeedbackChange", type: "(feedback) => void", description: "Pressing the active thumb again clears it to null." },
        { prop: "extraActions", type: "ReactNode", description: "More buttons at the end of the action row." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "ChatReasoning",
      description: "Reasoning with followStreaming on: it opens while thinking and folds away when done. Takes every Reasoning prop.",
      props: [
        { prop: "streaming", type: "boolean", default: "false", description: "Hot filament, running timer, open." },
        { prop: "duration", type: "number", description: "Seconds spent. Measured while streaming when omitted." },
        { prop: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Disclosure state. defaultOpen follows streaming." },
        { prop: "followStreaming", type: "boolean", default: "true", description: "Set false for a trace that stays folded to its one live line." },
        { prop: "label", type: "ReactNode", default: '"Thinking"', description: "Header while streaming." },
      ],
    },
    {
      name: "ChatToolCall",
      description: "ToolCall with its arguments always summarised as key: value pairs. Takes every ToolCall prop, including approval.",
      props: [
        { prop: "name", type: "string", description: "The tool's name." },
        { prop: "args", type: "Record<string, unknown> | string", description: "Summarised in the row, listed when open." },
        { prop: "status", type: '"pending" | "approval" | "running" | "done" | "success" | "error" | "denied"', default: '"done"', description: "Drives the lamp, the readout and the border." },
        { prop: "result", type: "ReactNode", description: "Shown when open. Strings render as code." },
        { prop: "error", type: "ReactNode", description: "Shown under the row." },
        { prop: "duration", type: "number", description: "Seconds. A live timer counts while running." },
        { prop: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Disclosure state." },
      ],
    },
    {
      name: "ChatMarkdown",
      description: "The renderer on its own, for building your own message parts.",
      props: [
        { prop: "children", type: "string", description: "The text so far." },
        { prop: "streaming", type: "boolean", default: "false", description: "Caret at the end and fresh-word fade." },
        { prop: "codeMaxHeight", type: "number", default: "420", description: "Code blocks scroll past this height." },
      ],
    },
  ],
  notes: [
    "Each message is an article named by its sender. A streaming message sets aria-busy so screen readers wait for the finished text.",
    "Hover-only actions also appear on keyboard focus within the message and are always visible on touch screens.",
    "Thumbs are toggle buttons with aria-pressed. Copy announces through a polite status region.",
    "Reasoning and tool rows are disclosure buttons with aria-expanded; closed panels are hidden from assistive tech, not just collapsed.",
    "Unclosed code fences, backticks and bold render formatted while text streams, so the reply doesn't flash raw markdown.",
    "Links only render for http(s), mailto and relative URLs. External ones open in a new tab with noopener.",
    "Under prefers-reduced-motion the caret holds still, words appear without the fade and the reply mark stops breathing.",
  ],
};
