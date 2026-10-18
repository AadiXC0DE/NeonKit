"use client";

import * as React from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const steps = [
  ["Install the CLI", "npm i -g @relay/cli, then relay login. It opens a browser once and stores a token in your keychain."],
  ["Link the project", "relay link in your repo root writes .relay/project.json. Commit it; it holds no secrets."],
  ["Add an endpoint", "relay endpoints add https://api.example.com/hooks picks up the signing secret and prints it once."],
  ["Send a test event", "relay trigger invoice.paid replays a recorded payload against the endpoint and shows the response."],
  ["Turn on retries", "relay endpoints set --retries at-least-once. Receivers should deduplicate on Relay-Delivery-Id."],
  ["Watch it live", "relay tail streams deliveries with status, latency and attempt number. Ctrl-C to stop."],
];

export default function ScrollProgressRing() {
  const listRef = React.useRef<HTMLOListElement>(null);
  const [percent, setPercent] = React.useState(0);

  return (
    <div className="flex w-full max-w-md items-start gap-5">
      <ScrollProgress
        variant="ring"
        target={listRef}
        size={64}
        thickness={2.5}
        onProgressChange={setPercent}
        aria-label="Setup guide progress"
      >
        <span className="font-mono text-[13px] tabular-nums text-white/85">{percent}%</span>
      </ScrollProgress>
      <ol
        ref={listRef}
        tabIndex={0}
        aria-label="Setup guide"
        className="h-56 flex-1 space-y-4 overflow-y-auto pr-1 outline-none [scrollbar-width:thin]"
      >
        {steps.map(([title, body], i) => (
          <li key={title} className="text-sm">
            <p className="font-medium text-white/90">
              <span className="mr-2 font-mono text-white/40">{i + 1}</span>
              {title}
            </p>
            <p className="mt-1 leading-relaxed text-white/55">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
