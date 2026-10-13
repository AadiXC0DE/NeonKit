"use client";

import * as React from "react";
import {
  ChatMarkdown,
  ChatMessage,
  ChatReasoning,
  ChatToolCall,
  type ChatAttachmentItem,
  type ChatFeedback,
  type ChatToolStatus,
} from "@/components/ui/chat-message";
import { Conversation, ConversationDivider, type ConversationActions } from "@/components/ui/conversation";
import { PromptInput, type PromptMessage } from "@/components/ui/prompt-input";
import { Select } from "@/components/ui/select";

/* A screenshot of the bug: "acme" in the box, results for "ac" underneath. */
const SCREENSHOT = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="224" viewBox="0 0 320 224"><rect width="320" height="224" fill="#0b0d13"/><rect x="16" y="16" width="288" height="34" rx="8" fill="#141823" stroke="#2a3040"/><text x="30" y="38" font-family="ui-sans-serif,system-ui" font-size="13" fill="#e8edf5">acme</text><rect x="62" y="26" width="1.5" height="15" fill="#22d3ee"/><g font-family="ui-sans-serif,system-ui" font-size="12"><rect x="16" y="64" width="288" height="40" rx="6" fill="#10131b"/><text x="30" y="88" fill="#c9d1de">Acorn Labs</text><text x="236" y="88" fill="#5a6276">#4410</text><rect x="16" y="110" width="288" height="40" rx="6" fill="#10131b"/><text x="30" y="134" fill="#c9d1de">Acadia Health</text><text x="236" y="134" fill="#5a6276">#3982</text><rect x="16" y="156" width="288" height="40" rx="6" fill="#10131b"/><text x="30" y="180" fill="#c9d1de">Arcadian Supply</text><text x="236" y="180" fill="#5a6276">#2077</text></g></svg>`,
)}`;

const FIX = `\`\`\`ts src/hooks/use-customer-search.ts diff {22}
 export function useCustomerSearch(query: string) {
   const [results, setResults] = useState<Customer[]>([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
     if (!query) return setResults([]);
+    const controller = new AbortController();
     setLoading(true);
-    fetch(\`/api/customers?q=\${query}\`)
+    fetch(\`/api/customers?q=\${encodeURIComponent(query)}\`, {
+      signal: controller.signal,
+    })
       .then((res) => res.json())
       .then((data) => setResults(data.customers))
-      .finally(() => setLoading(false));
+      .catch((error) => {
+        if (error.name !== "AbortError") throw error;
+      })
+      .finally(() => {
+        if (!controller.signal.aborted) setLoading(false);
+      });
+    return () => controller.abort();
   }, [query]);

   return { results, loading };
 }
\`\`\``;

const HOOK_SOURCE = `export function useCustomerSearch(query: string) {
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return setResults([]);
    setLoading(true);
    fetch(\`/api/customers?q=\${query}\`)
      .then((res) => res.json())
      .then((data) => setResults(data.customers))
      .finally(() => setLoading(false));
  }, [query]);

  return { results, loading };
}`;

const TEST = `\`\`\`ts src/hooks/use-customer-search.test.ts
it("ignores a response for a stale query", async () => {
  const pending: Record<string, (body: unknown) => void> = {};
  vi.spyOn(globalThis, "fetch").mockImplementation((url, init) =>
    new Promise((resolve, reject) => {
      const q = new URL(String(url), "http://test").searchParams.get("q")!;
      init?.signal?.addEventListener("abort", () =>
        reject(new DOMException("Aborted", "AbortError")),
      );
      pending[q] = (body) => resolve(Response.json(body));
    }),
  );

  const { result, rerender } = renderHook(({ q }) => useCustomerSearch(q), {
    initialProps: { q: "ac" },
  });
  rerender({ q: "acme" });

  pending.acme({ customers: [{ id: 2, name: "Acme Freight" }] });
  pending.ac({ customers: [{ id: 1, name: "Acorn Labs" }] });

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.results).toEqual([{ id: 2, name: "Acme Freight" }]);
});
\`\`\``;

type Step =
  | { kind: "reasoning"; text: string }
  | { kind: "tool"; name: string; args: Record<string, unknown>; result: string; resultLanguage?: string; ms: number }
  | { kind: "text"; text: string };

type Part =
  | { kind: "reasoning"; text: string; streaming: boolean }
  | {
      kind: "tool";
      name: string;
      args: Record<string, unknown>;
      result?: string;
      resultLanguage?: string;
      status: ChatToolStatus;
      duration?: number;
      error?: string;
    }
  | { kind: "text"; text: string };

type Message = {
  id: string;
  from: "user" | "assistant";
  time: string;
  text?: string;
  attachments?: ChatAttachmentItem[];
  parts?: Part[];
  streaming?: boolean;
  script?: Step[];
};

const SCRIPTS: Step[][] = [
  [
    {
      kind: "reasoning",
      text: "Results for an older query winning means responses are resolving out of order. Every debounced change starts a fetch, and every fetch calls setResults when it lands. If the request for “ac” is slower than the one for “acme”, it lands last and overwrites the newer results.\n\nThe debounce only narrows that window. It can't close it. I need to see whether the hook cancels anything on cleanup.",
    },
    {
      kind: "tool",
      name: "search_code",
      args: { query: "setResults(", path: "src/" },
      result: "src/hooks/use-customer-search.ts:10\nsrc/pages/orders/order-search.tsx:41",
      ms: 900,
    },
    {
      kind: "tool",
      name: "read_file",
      args: { path: "src/hooks/use-customer-search.ts" },
      result: HOOK_SOURCE,
      resultLanguage: "ts",
      ms: 600,
    },
    {
      kind: "text",
      text: `Found it. \`useCustomerSearch\` starts a request for every debounced query but never cancels the previous one, so whichever response arrives **last** wins, even when it belongs to an older query.

Abort the in-flight request when the query changes:

${FIX}

Three things changed:

- The effect's cleanup aborts the previous request, so a slow “ac” response can't land after “acme”.
- \`loading\` only clears for the request that's still current.
- The query is URL-encoded, so “O'Brien & Sons” no longer breaks the request.

\`order-search.tsx\` has the same pattern on line 41. Want a test that resolves two requests out of order?`,
    },
  ],
  [
    {
      kind: "reasoning",
      text: "The test has to hold the first request open, let the second one resolve, then release the first. The fetch mock must reject on abort the way the real one does, or the stale response still lands.",
    },
    {
      kind: "text",
      text: `Here it is. The mock keeps each request pending until the test releases it, and rejects on abort like the real \`fetch\`:

${TEST}`,
    },
    {
      kind: "tool",
      name: "run_tests",
      args: { file: "src/hooks/use-customer-search.test.ts" },
      result: "✓ ignores a response for a stale query  14ms\n\nTest Files  1 passed (1)\n     Tests  1 passed (1)",
      resultLanguage: "bash",
      ms: 1400,
    },
    {
      kind: "text",
      text: "Passes on this branch. On `main` it fails with **Acorn Labs** in the results, so it pins down exactly the bug you saw.",
    },
  ],
  [
    {
      kind: "text",
      text: "I'd ship it as is. The cleanup also runs on unmount, so leaving the page mid-request no longer sets state on a component that's gone.",
    },
  ],
];

const INITIAL: Message[] = [
  {
    id: "m1",
    from: "user",
    time: "10:42",
    text: "Search on /customers sometimes shows results for an older query. Type “acme” quickly and you can end up looking at results for “ac”. Started after we added the 250ms debounce. Can you find it?",
    attachments: [{ name: "customers-search.png", type: "image/png", size: 184_320, url: SCREENSHOT }],
  },
  { id: "m2", from: "assistant", time: "10:42", parts: [], streaming: true, script: SCRIPTS[0] },
];

const MODELS = [
  { value: "argon-2", label: "Argon 2" },
  { value: "argon-2-mini", label: "Argon 2 Mini" },
];

/** Where the next chunk ends: a word at a time in prose, a line at a time inside code fences. */
function nextChunk(text: string, from: number) {
  const fences = (text.slice(0, from).match(/```/g) ?? []).length;
  if (fences % 2 === 1) {
    const line = text.indexOf("\n", from);
    return line < 0 ? text.length : line + 1;
  }
  const word = /\s*\S+\s?/y;
  word.lastIndex = from;
  return word.exec(text) ? word.lastIndex : text.length;
}

function delayAfter(text: string, at: number, base: number) {
  const prev = text[at - 1];
  if (text.slice(at - 2, at) === "\n\n") return base * 6;
  if (prev === "." || prev === "?" || prev === ":") return base * 4;
  if (prev === "\n") return base * 1.5;
  return base + (at % 5) * 6;
}

function textOf(message: Message) {
  if (message.text) return message.text;
  return (message.parts ?? [])
    .filter((part): part is Extract<Part, { kind: "text" }> => part.kind === "text")
    .map((part) => part.text)
    .join("\n\n");
}

const Row = React.memo(function Row({
  message,
  latest,
  onRetry,
}: {
  message: Message;
  latest: boolean;
  onRetry: (id: string) => void;
}) {
  const [feedback, setFeedback] = React.useState<ChatFeedback>(null);
  if (message.from === "user") {
    return (
      <ChatMessage
        from="user"
        name="Maya Chen"
        time={message.time}
        content={message.text}
        attachments={message.attachments}
      />
    );
  }
  return (
    <ChatMessage
      from="assistant"
      name="Argon"
      time={message.time}
      streaming={message.streaming}
      copyText={textOf(message)}
      actions={latest ? "always" : "hover"}
      feedback={feedback}
      onFeedbackChange={setFeedback}
      onRetry={() => onRetry(message.id)}
    >
      {message.parts?.map((part, index) => {
        if (part.kind === "reasoning") {
          return (
            <ChatReasoning key={index} streaming={part.streaming}>
              {part.text}
            </ChatReasoning>
          );
        }
        if (part.kind === "tool") {
          return (
            <ChatToolCall
              key={index}
              name={part.name}
              args={part.args}
              status={part.status}
              result={part.result}
              resultLanguage={part.resultLanguage}
              duration={part.duration}
              error={part.error}
            />
          );
        }
        const last = index === (message.parts?.length ?? 0) - 1;
        return (
          <ChatMarkdown key={index} streaming={message.streaming && last}>
            {part.text}
          </ChatMarkdown>
        );
      })}
    </ChatMessage>
  );
});

export default function ConversationDemo() {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL);
  const [model, setModel] = React.useState("argon-2");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const live = React.useRef<string | null>(null);
  const replies = React.useRef(1);
  const conversation = React.useRef<ConversationActions>(null);
  const streaming = messages.some((message) => message.streaming);

  const patch = React.useCallback((id: string, change: (message: Message) => Message) => {
    setMessages((list) => list.map((message) => (message.id === id ? change(message) : message)));
  }, []);

  const run = React.useCallback(
    (id: string, script: Step[]) => {
      clearTimeout(timer.current);
      live.current = id;
      let step = 0;
      let at = 0;

      const setParts = (change: (parts: Part[]) => Part[]) =>
        patch(id, (message) => ({ ...message, parts: change(message.parts ?? []) }));
      const replaceLast = (part: Part) => setParts((parts) => [...parts.slice(0, -1), part]);

      const tick = () => {
        const current = script[step];
        if (!current) {
          live.current = null;
          patch(id, (message) => ({ ...message, streaming: false }));
          return;
        }
        if (current.kind === "tool") {
          if (at === 0) {
            at = 1;
            setParts((parts) => [...parts, { kind: "tool", name: current.name, args: current.args, status: "running" }]);
            timer.current = setTimeout(tick, current.ms);
          } else {
            replaceLast({
              kind: "tool",
              name: current.name,
              args: current.args,
              result: current.result,
              resultLanguage: current.resultLanguage,
              status: "done",
              duration: current.ms / 1000,
            });
            step++;
            at = 0;
            timer.current = setTimeout(tick, 320);
          }
          return;
        }
        if (at === 0) setParts((parts) => [...parts, current.kind === "reasoning" ? { kind: "reasoning", text: "", streaming: true } : { kind: "text", text: "" }]);
        at = nextChunk(current.text, at);
        const text = current.text.slice(0, at);
        const done = at >= current.text.length;
        replaceLast(current.kind === "reasoning" ? { kind: "reasoning", text, streaming: !done } : { kind: "text", text });
        if (done) {
          step++;
          at = 0;
          timer.current = setTimeout(tick, current.kind === "reasoning" ? 500 : 260);
        } else {
          timer.current = setTimeout(tick, delayAfter(current.text, at, current.kind === "reasoning" ? 34 : 26));
        }
      };
      tick();
    },
    [patch],
  );

  const stop = React.useCallback(() => {
    clearTimeout(timer.current);
    const id = live.current;
    live.current = null;
    if (!id) return;
    patch(id, (message) => ({
      ...message,
      streaming: false,
      parts: message.parts?.map((part) =>
        part.kind === "reasoning"
          ? { ...part, streaming: false }
          : part.kind === "tool" && part.status === "running"
            ? { ...part, status: "error", error: "Stopped before it finished." }
            : part,
      ),
    }));
  }, [patch]);

  const latest = React.useRef(messages);
  React.useEffect(() => {
    latest.current = messages;
  });

  const retry = React.useCallback(
    (id: string) => {
      const script = latest.current.find((message) => message.id === id)?.script;
      if (!script) return;
      patch(id, (message) => ({ ...message, parts: [], streaming: true }));
      run(id, script);
    },
    [patch, run],
  );

  React.useEffect(() => {
    const start = setTimeout(() => run("m2", SCRIPTS[0]), 700);
    return () => {
      clearTimeout(start);
      clearTimeout(timer.current);
    };
  }, [run]);

  const send = ({ text, attachments }: PromptMessage) => {
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const script = SCRIPTS[Math.min(replies.current, SCRIPTS.length - 1)];
    replies.current += 1;
    const userId = `u${Date.now()}`;
    const replyId = `a${Date.now()}`;
    setMessages((list) => [
      ...list,
      {
        id: userId,
        from: "user",
        time,
        text,
        attachments: attachments.map(({ name, size, type, url }) => ({ name, size, type, url })),
      },
      { id: replyId, from: "assistant", time, parts: [], streaming: true, script },
    ]);
    // Sending is a request to see the reply, even if you'd scrolled up to reread something.
    conversation.current?.scrollToBottom();
    timer.current = setTimeout(() => run(replyId, script), 500);
  };

  const lastId = messages[messages.length - 1]?.id;

  return (
    <div className="flex h-[680px] w-full max-w-3xl flex-col">
      <Conversation actionsRef={conversation} streaming={streaming} className="flex-1" contentClassName="px-1 pb-10 sm:px-3">
        <ConversationDivider>Today</ConversationDivider>
        {messages.map((message) => (
          <Row key={message.id} message={message} latest={message.id === lastId} onRetry={retry} />
        ))}
      </Conversation>
      <PromptInput
        className="mt-1"
        placeholder="Reply to Argon"
        streaming={streaming}
        onStop={stop}
        onSubmit={send}
        maxRows={10}
        toolbar={
          <Select
            aria-label="Model"
            size="sm"
            options={MODELS}
            value={model}
            onValueChange={setModel}
            containerClassName="w-auto"
            className="h-8 w-auto gap-1.5 border-transparent bg-transparent px-2 text-[13px] text-white/65 hover:border-transparent hover:bg-white/[0.06] hover:text-white/90"
          />
        }
      />
    </div>
  );
}
