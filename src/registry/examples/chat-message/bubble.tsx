"use client";

import * as React from "react";
import { ChatMessage } from "@/components/ui/chat-message";

function mock(title: string, body: string, accent: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="224" viewBox="0 0 320 224"><rect width="320" height="224" fill="#0b0d13"/><circle cx="160" cy="78" r="22" fill="none" stroke="${accent}" stroke-width="2.5"/><text x="160" y="134" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="15" font-weight="600" fill="#e8edf5">${title}</text><text x="160" y="156" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#8a93a6">${body}</text><rect x="118" y="172" width="84" height="26" rx="7" fill="${accent}" opacity=".9"/></svg>`,
  )}`;
}

const attachments = [
  { name: "empty-a.png", type: "image/png", size: 96_000, url: mock("No invoices yet", "Invoices you send show up here.", "#22d3ee") },
  { name: "empty-b.png", type: "image/png", size: 102_400, url: mock("Send your first invoice", "Get paid in 2 days on average.", "#a855f7") },
];

const reply = `**B**, mostly. It tells people what to do and why it's worth doing; A only describes an empty table.

Two things I'd take from A:

- The quieter icon. B's ring competes with the button for attention.
- "Invoices you send show up here" is a better line under the button than above it, for people who aren't ready to send one yet.`;

export default function ChatMessageBubble() {
  const [question, setQuestion] = React.useState("Which empty state reads better for the invoices page?");
  const [followUp, setFollowUp] = React.useState("Makes sense. Can you write the copy for B with that line moved?");
  return (
    <div className="grid w-full max-w-2xl gap-8">
      <ChatMessage
        from="user"
        layout="bubble"
        time="11:20"
        attachments={attachments}
        content={question}
        onEdit={setQuestion}
      />
      <ChatMessage from="assistant" layout="bubble" name="Argon" time="11:20" content={reply} defaultFeedback="up" />
      <ChatMessage
        from="user"
        layout="bubble"
        time="11:22"
        content={followUp}
        onEdit={setFollowUp}
      />
    </div>
  );
}
