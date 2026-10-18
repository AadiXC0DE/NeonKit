"use client";

import * as React from "react";
import { ChatMarkdown, ChatMessage, ChatReasoning, ChatToolCall, type ChatToolStatus } from "@/components/ui/chat-message";

const QUESTION =
  "The sticky header on /settings stopped sticking after I wrapped the page in the new AppShell. No errors in the console. Where should I look?";

const REASONING =
  "position: sticky sticks within the nearest ancestor that has overflow set, scrolling or not. If AppShell put overflow on a wrapper that never scrolls itself, the header is pinned to a box that doesn't move, so it looks like it stopped working.";

const ANSWER = `\`<main className="overflow-x-hidden">\` in AppShell is the culprit. Any \`overflow\` other than \`visible\` makes \`main\` the header's scroll container, even when only one axis is clipped, and \`main\` itself never scrolls.

Use \`overflow-x-clip\` instead. It clips the same way without creating a scroll container:

\`\`\`tsx components/app-shell.tsx {3}
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh overflow-x-clip">
      <Sidebar />
      {children}
    </main>
  );
}
\`\`\`

Both Tailwind 3.4 and 4 ship \`overflow-x-clip\`.`;

type Phase = "idle" | "thinking" | "tool" | "writing" | "done";

export default function ChatMessageDemo() {
  const [run, setRun] = React.useState(0);
  return <Exchange key={run} onRetry={() => setRun((n) => n + 1)} />;
}

function Exchange({ onRetry }: { onRetry: () => void }) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [reasoning, setReasoning] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [tool, setTool] = React.useState<ChatToolStatus>("pending");

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const stream = (text: string, set: (value: string) => void, speed: number, then: () => void) => {
      let at = 0;
      const tick = () => {
        const fence = (text.slice(0, at).match(/```/g) ?? []).length % 2 === 1;
        const re = fence ? /[^\n]*\n?/y : /\s*\S+\s?/y;
        re.lastIndex = at;
        at = re.exec(text) && re.lastIndex > at ? re.lastIndex : text.length;
        set(text.slice(0, at));
        if (at >= text.length) timer = setTimeout(then, 400);
        else timer = setTimeout(tick, /[.:]\s?$/.test(text.slice(0, at)) ? speed * 5 : speed + (at % 4) * 6);
      };
      tick();
    };

    timer = setTimeout(() => {
      setPhase("thinking");
      stream(REASONING, setReasoning, 38, () => {
        setPhase("tool");
        setTool("running");
        timer = setTimeout(() => {
          setTool("done");
          setPhase("writing");
          timer = setTimeout(() => stream(ANSWER, setAnswer, 26, () => setPhase("done")), 300);
        }, 1100);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const live = phase !== "done";

  return (
    <div className="grid w-full max-w-2xl gap-8">
      <ChatMessage from="user" name="Sam Okafor" time="16:08" content={QUESTION} />
      <ChatMessage
        from="assistant"
        name="Argon"
        time="16:08"
        streaming={live}
        copyText={answer}
        actions="always"
        defaultFeedback={null}
        onRetry={onRetry}
      >
        {phase !== "idle" && <ChatReasoning streaming={phase === "thinking"}>{reasoning}</ChatReasoning>}
        {tool !== "pending" && (
          <ChatToolCall
            name="search_code"
            args={{ query: "overflow-", path: "components/app-shell.tsx" }}
            status={tool}
            duration={1.1}
            result={`components/app-shell.tsx:14    <main className="min-h-dvh overflow-x-hidden">`}
          />
        )}
        {(phase === "writing" || phase === "done") && <ChatMarkdown streaming={live}>{answer}</ChatMarkdown>}
      </ChatMessage>
    </div>
  );
}
