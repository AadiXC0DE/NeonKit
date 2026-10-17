"use client";

import * as React from "react";
import { ChatReasoning } from "@/components/ui/chat-message";

const thought = `The p95 jumped from 180ms to 1.4s at 09:10, which lines up with the 09:05 deploy, not with traffic. Traffic is flat.

The deploy added an \`include: { invoices: true }\` to the customer query. With 40 invoices per customer on average, that's one round trip turning into a large join on every page view.

Checking whether the invoices are even rendered on that page before suggesting a fix.`;

export default function ChatMessageReasoning() {
  const [run, setRun] = React.useState(0);
  return <Thinking key={run} onRestart={() => setRun((n) => n + 1)} />;
}

function Thinking({ onRestart }: { onRestart: () => void }) {
  const [text, setText] = React.useState("");
  const [streaming, setStreaming] = React.useState(true);

  React.useEffect(() => {
    let at = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const re = /\s*\S+\s?/y;
      re.lastIndex = at;
      at = re.exec(thought) ? re.lastIndex : thought.length;
      setText(thought.slice(0, at));
      if (at >= thought.length) timer = setTimeout(() => setStreaming(false), 500);
      else timer = setTimeout(tick, /[.]\s?$/.test(thought.slice(0, at)) ? 260 : 46);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid w-full max-w-xl gap-6">
      <ChatReasoning streaming={streaming}>
        {text}
      </ChatReasoning>
      <button
        type="button"
        onClick={onRestart}
        className="w-fit cursor-pointer rounded-md text-[13px] text-white/55 underline decoration-white/20 underline-offset-4 outline-none transition-colors hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
      >
        Think again
      </button>
    </div>
  );
}
