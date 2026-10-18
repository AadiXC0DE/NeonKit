"use client";

import * as React from "react";
import { ChatMessage } from "@/components/ui/chat-message";
import { Conversation } from "@/components/ui/conversation";
import { PromptInput } from "@/components/ui/prompt-input";

const SUGGESTIONS = [
  "Why is /api/search slower since Tuesday?",
  "Write a migration that adds expires_at to invites",
  "Explain the retry logic in the webhook worker",
];

const REPLY =
  "Pulling the traces for /api/search since Tuesday. The first slow requests start at 14:05, four minutes after the deploy that added the `include: { tags: true }` to the search query.";

type Message = { id: string; from: "user" | "assistant"; text: string; streaming?: boolean };

export default function ConversationEmpty() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const ask = (text: string) => {
    setMessages([
      { id: "q", from: "user", text },
      { id: "a", from: "assistant", text: "", streaming: true },
    ]);
    let at = 0;
    const tick = () => {
      const re = /\s*\S+\s?/y;
      re.lastIndex = at;
      at = re.exec(REPLY) ? re.lastIndex : REPLY.length;
      const done = at >= REPLY.length;
      setMessages((list) => list.map((m) => (m.id === "a" ? { ...m, text: REPLY.slice(0, at), streaming: !done } : m)));
      if (!done) timer.current = setTimeout(tick, 34);
    };
    timer.current = setTimeout(tick, 500);
  };

  const streaming = messages.some((m) => m.streaming);

  return (
    <div className="flex h-[460px] w-full max-w-2xl flex-col gap-2">
      <Conversation
        className="flex-1"
        streaming={streaming}
        empty={
          <div className="grid justify-items-start gap-5 px-1">
            <p className="max-w-[16ch] text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-white/90 [font-stretch:112%]">
              What&apos;s slow, broken or unclear?
            </p>
            <ul className="-mx-3 grid w-[calc(100%+1.5rem)] gap-0.5">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[14.5px] text-white/65 outline-none transition-colors hover:bg-white/[0.04] hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        }
      >
        {messages.map((m) =>
          m.from === "user" ? (
            <ChatMessage key={m.id} from="user" layout="bubble" content={m.text} />
          ) : (
            <ChatMessage key={m.id} from="assistant" name="Argon" content={m.text} streaming={m.streaming} />
          ),
        )}
      </Conversation>
      <PromptInput
        placeholder="Ask Argon"
        streaming={streaming}
        onStop={() => {
          clearTimeout(timer.current);
          setMessages((list) => list.map((m) => ({ ...m, streaming: false })));
        }}
        onSubmit={({ text }) => ask(text)}
      />
    </div>
  );
}
