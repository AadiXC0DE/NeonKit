"use client";

import * as React from "react";
import { AgentPlan, type PlanStep } from "@/components/ui/agent-plan";
import { ChatMarkdown, ChatMessage } from "@/components/ui/chat-message";
import { CodeBlock } from "@/components/ui/code-block";
import { Conversation, ConversationDivider, type ConversationActions } from "@/components/ui/conversation";
import { PromptInput, type PromptMessage } from "@/components/ui/prompt-input";
import { Reasoning } from "@/components/ui/reasoning";
import { ToolCall, type ToolCallStatus } from "@/components/ui/tool-call";

/* ------------------------------------------------------------------------------------------------
 * The session: a coding agent fixing a test that broke when CI moved to a runner in Frankfurt.
 * ---------------------------------------------------------------------------------------------- */

const ASK =
  "`npm test` has been red on main since we moved CI runners to eu-central-1. One failure, in `date.test.ts`. Nothing in that file changed. Can you fix it?";

const THOUGHT = `A date test that broke on a region move, with no code change, points at time zones. The old runners were on UTC; eu-central-1 defaults to Europe/Berlin, which leaves summer time on October 25.

If \`addDays\` adds a fixed 86,400,000 ms per day, stepping across that night lands an hour short. Reproduce it with TZ set, then read \`src/date.ts\`.`;

const FAIL = ` FAIL  src/date.test.ts > addDays > keeps local midnight across the DST change
AssertionError: expected 2026-10-25T22:00:00.000Z to equal 2026-10-25T23:00:00.000Z

 ❯ src/date.test.ts:18:31
     18|     expect(addDays(start, 2)).toEqual(new Date(2026, 9, 26));

 Test Files  1 failed | 6 passed (7)
      Tests  1 failed | 13 passed (14)`;

const SOURCE = `const DAY = 86_400_000;

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY);
}`;

const DIFF = ` export function addDays(date: Date, days: number) {
-  return new Date(date.getTime() + days * DAY);
+  const next = new Date(date);
+  next.setDate(next.getDate() + days);
+  return next;
 }`;

const PASS = ` Test Files  7 passed (7)
      Tests  14 passed (14)
   Duration  1.71s`;

const ANSWER = `Fixed. \`addDays\` added 86,400,000 ms per day, but October 25 is 25 hours long in Berlin, so stepping across it landed at 23:00 the day before. The UTC runners never had a 25-hour day, which is why it only broke on the move.

\`\`\`ts src/date.ts diff
${DIFF}
\`\`\`

All 14 tests pass with \`TZ=Europe/Berlin\`. \`formatRelative\` in \`src/format.ts\` divides by \`DAY\` the same way and will be off on the same night. Want me to fix that one too?`;

const DENIED = `Left \`src/date.ts\` as it was. The cause stands: \`addDays\` adds 86,400,000 ms per day and October 25 is 25 hours in Berlin. If you'd rather not change the helper, pinning \`TZ=UTC\` in the CI job hides it, but users in Europe would still get the wrong date.`;

const FOLLOW_UP = `Same bug, other direction: \`formatRelative\` divides the gap by \`DAY\` and floors it, so on the night of October 25 "tomorrow" reads as "today". Comparing calendar dates instead of milliseconds fixes it. I'll hold off until you've merged the first change, so the two don't land in one commit.`;

type Tool = {
  id: string;
  name: string;
  summary: string;
  args?: Record<string, unknown>;
  status: ToolCallStatus;
  duration?: number;
  meta?: string;
  result?: string;
  resultLanguage?: string;
  preview?: boolean;
};

type Reply = {
  id: string;
  from: "assistant";
  time: string;
  streaming: boolean;
  thought?: { text: string; streaming: boolean };
  plan?: PlanStep[];
  tools: Record<string, Tool>;
  text?: string;
};

type Ask = { id: string; from: "user"; time: string; text: string };
type Message = Ask | Reply;

const PLAN: PlanStep[] = [
  { id: "reproduce", title: "Reproduce with TZ=Europe/Berlin", status: "active" },
  { id: "cause", title: "Find why addDays is an hour short", status: "pending" },
  { id: "patch", title: "Step by calendar day in src/date.ts", status: "pending" },
  { id: "rerun", title: "Re-run the suite", status: "pending" },
];

// Which tool calls hang under which step of the plan.
const TOOLS_BY_STEP: Record<string, string[]> = {
  reproduce: ["test-1"],
  cause: ["read"],
  patch: ["edit"],
  rerun: ["test-2"],
};

const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/* ------------------------------------------------------------------------------------------------
 * Rendering
 * ---------------------------------------------------------------------------------------------- */

function ToolRow({ tool, onDecide }: { tool: Tool; onDecide: (approved: boolean) => void }) {
  return (
    <ToolCall
      name={tool.name}
      summary={tool.summary}
      args={tool.args}
      status={tool.status}
      duration={tool.duration}
      meta={tool.meta}
      result={tool.result}
      resultLanguage={tool.resultLanguage}
      approvalNote={
        <>
          Edits <span className="font-mono text-[12px] text-white/85">src/date.ts</span>: 3 lines in, 1 out.
        </>
      }
      onApprove={() => onDecide(true)}
      onDeny={() => onDecide(false)}
    >
      {tool.preview && (
        <CodeBlock
          code={DIFF}
          language="ts"
          diff
          header={false}
          lineNumbers={false}
          className="rounded-lg border-white/[0.06] bg-black/25 [&_.nk-code-scroll]:text-[12px]"
        />
      )}
    </ToolCall>
  );
}

const Row = React.memo(function Row({ message, onDecide }: { message: Message; onDecide: (approved: boolean) => void }) {
  if (message.from === "user") {
    return <ChatMessage from="user" name="Maya Chen" time={message.time} content={message.text} />;
  }
  const steps = message.plan?.map((step) => {
    const tools = (TOOLS_BY_STEP[step.id ?? ""] ?? []).map((id) => message.tools[id]).filter(Boolean);
    return tools.length
      ? {
          ...step,
          content: (
            <div className="grid gap-2">
              {tools.map((tool) => (
                <ToolRow key={tool.id} tool={tool} onDecide={onDecide} />
              ))}
            </div>
          ),
        }
      : step;
  });
  const loose = Object.values(message.tools).filter((tool) => !Object.values(TOOLS_BY_STEP).flat().includes(tool.id));
  return (
    <ChatMessage
      from="assistant"
      name="Argon"
      time={message.time}
      streaming={message.streaming}
      copyText={message.text}
      actions={message.streaming ? "none" : "hover"}
    >
      {message.thought && <Reasoning streaming={message.thought.streaming}>{message.thought.text}</Reasoning>}
      {steps && <AgentPlan title="Fix the failing date test" steps={steps} timer={false} className="py-1" />}
      {loose.map((tool) => (
        <ToolRow key={tool.id} tool={tool} onDecide={onDecide} />
      ))}
      {message.text !== undefined && (
        <ChatMarkdown streaming={message.streaming}>{message.text}</ChatMarkdown>
      )}
    </ChatMessage>
  );
});

/* ------------------------------------------------------------------------------------------------
 * The director: plays the session, waits for your decision on the edit
 * ---------------------------------------------------------------------------------------------- */

class Stopped extends Error {}

export default function ConversationDemo() {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: "ask", from: "user", time: "09:12", text: ASK },
    { id: "reply", from: "assistant", time: "09:12", streaming: true, tools: {} },
  ]);
  const [live, setLive] = React.useState(true);
  const conversation = React.useRef<ConversationActions>(null);
  const run = React.useRef(0);
  const decide = React.useRef<((approved: boolean) => void) | null>(null);
  const timers = React.useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const patch = React.useCallback((id: string, change: (reply: Reply) => Reply) => {
    setMessages((list) => list.map((m) => (m.id === id && m.from === "assistant" ? change(m) : m)));
  }, []);

  const play = React.useCallback(
    async (id: string, script: (ctx: Director) => Promise<void>) => {
      const token = ++run.current;
      setLive(true);
      const sleep = (ms: number) =>
        new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => {
            timers.current.delete(timer);
            if (token === run.current) resolve();
            else reject(new Stopped());
          }, ms);
          timers.current.add(timer);
        });
      const type = async (text: string, write: (sofar: string) => void, pace: number) => {
        let at = 0;
        while (at < text.length) {
          const fences = (text.slice(0, at).match(/```/g) ?? []).length;
          if (fences % 2 === 1) {
            const line = text.indexOf("\n", at);
            at = line < 0 ? text.length : line + 1;
          } else {
            const word = /\s*\S+\s?/y;
            word.lastIndex = at;
            at = word.exec(text) ? word.lastIndex : text.length;
          }
          write(text.slice(0, at));
          await sleep(/[.:?]\s?$/.test(text.slice(0, at)) ? pace * 7 : pace + (at % 4) * 5);
        }
      };
      const ctx: Director = {
        sleep,
        type,
        update: (change) => patch(id, change),
        tool: (tool) => patch(id, (r) => ({ ...r, tools: { ...r.tools, [tool.id]: { ...r.tools[tool.id], ...tool } as Tool } })),
        step: (stepId, change) =>
          patch(id, (r) => ({ ...r, plan: r.plan?.map((s) => (s.id === stepId ? { ...s, ...change } : s)) })),
        approval: () =>
          new Promise<boolean>((resolve, reject) => {
            decide.current = (approved) => {
              decide.current = null;
              if (token === run.current) resolve(approved);
              else reject(new Stopped());
            };
          }),
      };
      try {
        await script(ctx);
        patch(id, (r) => ({ ...r, streaming: false }));
        setLive(false);
      } catch (error) {
        if (!(error instanceof Stopped)) throw error;
      }
    },
    [patch],
  );

  const cancel = React.useCallback(() => {
    run.current++;
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    decide.current = null;
  }, []);

  React.useEffect(() => {
    const start = setTimeout(() => play("reply", session), 700);
    return () => {
      clearTimeout(start);
      cancel();
    };
  }, [play, cancel]);

  const stop = () => {
    cancel();
    setLive(false);
    setMessages((list) =>
      list.map((m) => {
        if (m.from !== "assistant" || !m.streaming) return m;
        const tools = Object.fromEntries(
          Object.entries(m.tools).map(([key, tool]) => [
            key,
            tool.status === "running" || tool.status === "approval" ? { ...tool, status: "denied" as const, meta: "Stopped" } : tool,
          ]),
        );
        return {
          ...m,
          streaming: false,
          tools,
          thought: m.thought && { ...m.thought, streaming: false },
          plan: m.plan?.map((s) =>
            s.status === "active" ? { ...s, status: "failed" as const, meta: "Stopped" } : s,
          ),
        };
      }),
    );
  };

  const send = ({ text }: PromptMessage) => {
    const id = `reply-${Date.now()}`;
    setMessages((list) => [
      ...list,
      { id: `ask-${Date.now()}`, from: "user", time: now(), text },
      { id, from: "assistant", time: now(), streaming: true, tools: {} },
    ]);
    conversation.current?.scrollToBottom();
    play(id, followUp);
  };

  const onDecide = React.useCallback((approved: boolean) => decide.current?.(approved), []);

  return (
    <div className="flex h-[720px] w-full max-w-3xl flex-col">
      <Conversation actionsRef={conversation} streaming={live} className="flex-1" contentClassName="px-1 pb-10 sm:px-3">
        <ConversationDivider>Today</ConversationDivider>
        {messages.map((message) => (
          <Row key={message.id} message={message} onDecide={onDecide} />
        ))}
      </Conversation>
      <PromptInput
        className="mt-1"
        placeholder="Reply to Argon"
        streaming={live}
        onStop={stop}
        onSubmit={send}
        maxRows={8}
      />
    </div>
  );
}

type Director = {
  sleep: (ms: number) => Promise<void>;
  type: (text: string, write: (sofar: string) => void, pace: number) => Promise<void>;
  update: (change: (reply: Reply) => Reply) => void;
  tool: (tool: Partial<Tool> & { id: string }) => void;
  step: (id: string, change: Partial<PlanStep>) => void;
  approval: () => Promise<boolean>;
};

async function session({ sleep, type, update, tool, step, approval }: Director) {
  await type(THOUGHT, (text) => update((r) => ({ ...r, thought: { text, streaming: true } })), 34);
  await sleep(500);
  update((r) => ({ ...r, thought: { text: THOUGHT, streaming: false }, plan: PLAN }));
  await sleep(500);

  const test = { name: "run_command", summary: "TZ=Europe/Berlin npm test", args: { command: "TZ=Europe/Berlin npm test", cwd: "~/src/ledger" } };
  tool({ id: "test-1", ...test, status: "running" });
  await sleep(1840);
  tool({ id: "test-1", status: "error", duration: 1.84, meta: "1 failed", result: FAIL, resultLanguage: "bash" });
  step("reproduce", { status: "done" });
  step("cause", { status: "active" });
  await sleep(600);

  tool({ id: "read", name: "read_file", summary: "src/date.ts", args: { path: "src/date.ts" }, status: "running" });
  await sleep(420);
  tool({ id: "read", status: "success", duration: 0.1, result: SOURCE, resultLanguage: "ts" });
  await sleep(500);
  step("cause", { status: "done", description: "It adds 86,400,000 ms per day. October 25 is 25 hours long in Berlin." });
  step("patch", { status: "active" });
  await sleep(500);

  tool({ id: "edit", name: "edit_file", summary: "src/date.ts", status: "approval", preview: true });
  const approved = await approval();
  if (!approved) {
    tool({ id: "edit", status: "denied", preview: false });
    step("patch", { status: "skipped", meta: "Denied" });
    step("rerun", { status: "skipped" });
    await sleep(500);
    await type(DENIED, (text) => update((r) => ({ ...r, text })), 22);
    return;
  }
  tool({ id: "edit", status: "running", preview: false });
  await sleep(500);
  tool({ id: "edit", status: "success", duration: 0.2, meta: "+3 −1", result: DIFF, resultLanguage: "diff" });
  step("patch", { status: "done" });
  step("rerun", { status: "active" });
  await sleep(400);

  tool({ id: "test-2", ...test, status: "running" });
  await sleep(1710);
  tool({ id: "test-2", status: "success", duration: 1.71, meta: "14 passed", result: PASS, resultLanguage: "bash" });
  step("rerun", { status: "done" });
  await sleep(700);
  await type(ANSWER, (text) => update((r) => ({ ...r, text })), 24);
}

async function followUp({ sleep, type, update, tool }: Director) {
  await type(
    "The user means `formatRelative`. Read it before saying anything about the fix.",
    (text) => update((r) => ({ ...r, thought: { text, streaming: true } })),
    34,
  );
  await sleep(400);
  update((r) => ({ ...r, thought: r.thought && { ...r.thought, streaming: false } }));
  tool({ id: "read-format", name: "read_file", summary: "src/format.ts", args: { path: "src/format.ts" }, status: "running" });
  await sleep(450);
  tool({ id: "read-format", status: "success", duration: 0.1, meta: "38 lines" });
  await sleep(400);
  await type(FOLLOW_UP, (text) => update((r) => ({ ...r, text })), 24);
}
