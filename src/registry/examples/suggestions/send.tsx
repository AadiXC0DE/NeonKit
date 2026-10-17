"use client";

import * as React from "react";
import { ChartLine, Clock, Database, Server, ShieldCheck, TrendingDown } from "@/components/ui/icons";
import { Suggestion, Suggestions } from "@/components/ui/suggestions";

const PROMPTS = [
  { icon: <TrendingDown />, text: "Why did p95 latency jump at 14:05?" },
  { icon: <Server />, text: "Which pods restarted today?" },
  { icon: <Database />, text: "Slowest queries on orders-db" },
  { icon: <ChartLine />, text: "Compare error rate to last Tuesday" },
  { icon: <ShieldCheck />, text: "Expiring TLS certificates" },
  { icon: <Clock />, text: "What changed in the last hour?" },
];

export default function SuggestionsSend() {
  const [asked, setAsked] = React.useState<string[]>([]);

  return (
    <div className="grid w-full max-w-xl gap-4">
      <div className="grid gap-1">
        <p className="text-[15px] font-medium text-white/90">Ask about checkout-api</p>
        <p className="text-[13px] text-white/50">Answers use the last 7 days of traces, logs and deploys.</p>
      </div>
      <Suggestions
        wrap
        aria-label="Questions"
        // These send straight away: a picked chip is the whole question.
        onSelect={(text) => setAsked((list) => (list.includes(text) ? list : [text, ...list].slice(0, 3)))}
      >
        {PROMPTS.map((prompt) => (
          <Suggestion key={prompt.text} icon={prompt.icon} disabled={asked.includes(prompt.text)}>
            {prompt.text}
          </Suggestion>
        ))}
      </Suggestions>
      <ol aria-label="Asked" className="grid min-h-[4.5rem] content-start gap-1.5 text-[13px]">
        {asked.length === 0 ? (
          <li className="text-white/45">Nothing asked yet.</li>
        ) : (
          asked.map((text, i) => (
            <li key={text} className="flex items-baseline gap-2.5">
              <span className="font-mono text-[11.5px] tabular-nums text-white/40">{`#${asked.length - i}`}</span>
              <span className="text-white/80">{text}</span>
              {i === 0 && <span className="text-[rgb(var(--neon))]">Running</span>}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
