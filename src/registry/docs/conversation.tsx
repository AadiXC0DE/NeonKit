import type { ComponentDoc } from "../types";
import ConversationDemo from "../examples/conversation/demo";
import ConversationLongThread from "../examples/conversation/long-thread";
import ConversationEmpty from "../examples/conversation/empty";
import ConversationDividers from "../examples/conversation/dividers";

export const doc: ComponentDoc = {
  usage: `import { Conversation, ConversationDivider } from "@/components/ui/conversation"

<Conversation className="h-[600px]" streaming={streaming}>
  <ConversationDivider>Today</ConversationDivider>
  {messages.map((m) => <ChatMessage key={m.id} {...m} />)}
</Conversation>`,
  examples: [
    {
      name: "demo",
      title: "A debugging session",
      description:
        "Conversation, ChatMessage, PromptInput and CodeBlock together. The reply thinks, searches, reads a file and streams a fix as a diff; send a follow-up to get a test.",
      component: ConversationDemo,
    },
    {
      name: "long-thread",
      title: "300 messages",
      description:
        "Scroll up and new messages stop pulling you down. Jump to latest appears with a count of what arrived since.",
      component: ConversationLongThread,
    },
    {
      name: "empty",
      title: "Empty state",
      description: "The empty slot fills the space until the first message. Pick a suggestion or type one.",
      component: ConversationEmpty,
    },
    {
      name: "dividers",
      title: "Dates and system notes",
      description: "ConversationDivider separates days. initialScroll=\"top\" opens a thread at its start.",
      component: ConversationDividers,
    },
  ],
  api: [
    {
      name: "Conversation",
      description: "Renders a div around a scrolling log. Give it a height, or put it in a flex column.",
      props: [
        { prop: "empty", type: "ReactNode", description: "Shown when there are no children." },
        { prop: "streaming", type: "boolean", default: "false", description: "Sets aria-busy so screen readers wait for the finished reply." },
        { prop: "autoScroll", type: "boolean", default: "true", description: "Follow new content while the reader is at the bottom." },
        { prop: "threshold", type: "number", default: "56", description: "Pixels from the bottom that still count as at the bottom." },
        { prop: "initialScroll", type: '"bottom" | "top"', default: '"bottom"', description: "Where it opens." },
        { prop: "jumpLabel", type: "string", default: '"Jump to latest"', description: "Text on the pill." },
        { prop: "contentClassName", type: "string", description: "Classes for the column holding the messages." },
        {
          prop: "actionsRef",
          type: "Ref<{ scrollToBottom, isAtBottom }>",
          description: "Imperative controls, e.g. to jump down after sending from elsewhere.",
        },
        { prop: "onStickChange", type: "(stuck: boolean) => void", description: "Called when following starts or stops." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Lights the unread count." },
      ],
    },
    {
      name: "ConversationDivider",
      description: "A labelled separator. Not counted as an unread message.",
      props: [{ prop: "label", type: "string", default: "text content", description: "Accessible label when the children aren't a string." }],
    },
  ],
  notes: [
    "The scroller is a log region and focusable, so it scrolls with the keyboard. Arrow keys, Page Up and Home stop the follow like the wheel does.",
    "It follows by easing toward a bottom that keeps moving, so streamed text glides instead of jumping a line at a time.",
    "Call actionsRef.current.scrollToBottom() when someone sends, so their message and the reply come into view even if they'd scrolled up.",
    "Jump to latest is named with the unread count, and leaves the tab order while it's hidden.",
    "Under prefers-reduced-motion following and jumping are instant.",
    "Plain DOM, no virtualisation. 300 rich messages stay smooth when finished messages are memoized, as in the examples.",
  ],
};
