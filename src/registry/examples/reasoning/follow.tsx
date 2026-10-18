"use client";

import * as React from "react";
import { Reasoning } from "@/components/ui/reasoning";

const TRACE = `Cancellations on the Team plan tripled in September while Starter and Business stayed flat, so this isn't pricing or seasonality. Something specific to Team.

The status page has an incident on September 8: seat invitations failed for Team workspaces after the SSO rollout. If invites failed, admins couldn't add people, and a Team workspace with one seat is just an expensive Starter.

I'll split September's Team cancellations by whether the workspace had a failed invite before canceling.`;

export default function ReasoningFollow() {
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
      const word = /\s*\S+\s?/y;
      word.lastIndex = at;
      at = word.exec(TRACE) ? word.lastIndex : TRACE.length;
      setText(TRACE.slice(0, at));
      if (at >= TRACE.length) timer = setTimeout(() => setStreaming(false), 700);
      else timer = setTimeout(tick, /[.:]\s?$/.test(TRACE.slice(0, at)) ? 280 : 42);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid w-full max-w-xl gap-5">
      <Reasoning streaming={streaming} followStreaming label="Reading the churn numbers">
        {text}
      </Reasoning>
      {!streaming && (
        <button
          type="button"
          onClick={onRestart}
          className="w-fit cursor-pointer rounded-md text-[13px] text-white/55 underline decoration-white/20 underline-offset-4 outline-none transition-colors hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          Think again
        </button>
      )}
    </div>
  );
}
