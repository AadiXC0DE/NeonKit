"use client";

import * as React from "react";
import { ChatMessage } from "@/components/ui/chat-message";
import { Conversation, ConversationDivider } from "@/components/ui/conversation";

const PEOPLE = ["Maya Chen", "Sam Okafor", "Priya Raman", "Jonas Weber"];
const LINES = [
  "Deploy for web finished in 3m 12s.",
  "Can someone look at the flaky checkout test? It failed twice on main this morning.",
  "Looking. It waits for a toast that animates out before the assertion runs.",
  "Bumped the Postgres pool from 10 to 20 on the worker; queue depth is back under 50.",
  "Invite emails are going out again. The SMTP password had rotated.",
  "p95 on /api/search is 210ms, down from 380ms after the index.",
  "Reminder: freeze for 2.4 starts Thursday at 18:00.",
  "Merged the rate-limit change. Five invites per minute per address.",
];
const INCOMING = [
  "Staging is green again.",
  "Rolled the fix to 10% of traffic. Error rate is flat.",
  "Bumping to 50%.",
  "100%. Closing the incident.",
  "Postmortem doc is in the incidents folder.",
];

/** 300 messages over four days, the same on the server and the client. */
const HISTORY = Array.from({ length: 300 }, (_, i) => {
  const minutes = 9 * 60 + ((i * 7) % 540);
  return {
    id: `h${i}`,
    day: Math.floor(i / 75),
    name: PEOPLE[(i * 3) % PEOPLE.length],
    time: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
    text: LINES[(i * 5) % LINES.length],
  };
});
const DAYS = ["Friday, October 9", "Monday, October 12", "Yesterday", "Today"];

const Row = React.memo(function Row({ name, time, text }: { name: string; time: string; text: string }) {
  return <ChatMessage from="user" name={name} time={time} content={text} actions="none" />;
});

export default function ConversationLongThread() {
  const [extra, setExtra] = React.useState<{ id: string; text: string }[]>([]);
  const [busy, setBusy] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const simulate = () => {
    setBusy(true);
    INCOMING.forEach((text, index) => {
      timers.current.push(
        setTimeout(() => {
          setExtra((list) => [...list, { id: `n${list.length}`, text }]);
          if (index === INCOMING.length - 1) setBusy(false);
        }, 1200 * (index + 1)),
      );
    });
  };

  return (
    <div className="grid w-full max-w-2xl gap-3">
      <Conversation className="h-[520px] rounded-xl border border-white/[0.07] bg-[#07080d]" contentClassName="gap-5">
        {HISTORY.map((message, index) => (
          <React.Fragment key={message.id}>
            {(index === 0 || HISTORY[index - 1].day !== message.day) && (
              <ConversationDivider>{DAYS[message.day]}</ConversationDivider>
            )}
            <Row name={message.name} time={message.time} text={message.text} />
          </React.Fragment>
        ))}
        {extra.map((message) => (
          <Row key={message.id} name="Jonas Weber" time="now" text={message.text} />
        ))}
      </Conversation>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[13px] text-white/50">
        <span>{HISTORY.length + extra.length} messages. Scroll up, then let new ones arrive.</span>
        <button
          type="button"
          disabled={busy}
          onClick={simulate}
          className="cursor-pointer rounded-md px-2 py-1 font-medium text-white/80 outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] disabled:cursor-default disabled:opacity-50"
        >
          {busy ? "Receiving…" : "Receive 5 messages"}
        </button>
      </div>
    </div>
  );
}
