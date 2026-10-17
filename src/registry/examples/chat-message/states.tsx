"use client";

import * as React from "react";
import { ChatMessage } from "@/components/ui/chat-message";

const PARTIAL = "Renamed 14 call sites in 6 files. Two tests mock `chargeCustomer` by string name, so I updated those";
const FULL = `${PARTIAL} too.

Opened **#482 Rename chargeCustomer to createCharge**. CI is running; the billing contract tests take about four minutes.`;

export default function ChatMessageStates() {
  const [request, setRequest] = React.useState(
    "Rename `chargeCustomer` to `createCharge` across the billing service and open a PR.",
  );
  const [retried, setRetried] = React.useState(false);
  return (
    <div className="grid w-full max-w-2xl gap-7">
      <ChatMessage from="system" time="09:30" content="Argon has read-only access to acme/billing. It can open pull requests but not merge them." />
      <ChatMessage
        from="user"
        name="Priya Raman"
        time="09:31"
        content={request}
        onEdit={setRequest}
      />
      <ChatMessage
        from="assistant"
        name="Argon"
        time="09:31"
        content={retried ? FULL : PARTIAL}
        error={retried ? undefined : "The connection dropped after 38 seconds. Nothing was pushed."}
        onRetry={() => setRetried(true)}
      />
    </div>
  );
}
