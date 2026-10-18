"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ContextMeter, type ContextPart } from "@/components/ui/context-meter";

const LIMIT = 200_000;

const START = { files: 38_900, conversation: 88_500 };

export default function ContextMeterDemo() {
  const [files, setFiles] = React.useState(START.files);
  const [conversation, setConversation] = React.useState(START.conversation);
  const [attached, setAttached] = React.useState(0);

  const parts: ContextPart[] = [
    { label: "System prompt", tokens: 3_100 },
    { label: conversation === START.conversation ? "Conversation (41 turns)" : "Conversation (brief + 3 turns)", tokens: conversation },
    { label: `Files (${6 + attached * 14} open)`, tokens: files },
    { label: "Tools (github, postgres)", tokens: 11_800 },
  ];
  const used = parts.reduce((sum, part) => sum + part.tokens, 0);

  return (
    <div className="grid w-full max-w-[34rem] gap-6">
      <ContextMeter
        size="lg"
        limit={LIMIT}
        parts={parts}
        label="Context window, Argon 2"
        note="Past 90%, the oldest turns are summarised into a short brief before the next reply."
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={used + 21_600 > LIMIT}
          onClick={() => {
            setFiles((n) => n + 21_600);
            setAttached((n) => n + 1);
          }}
        >
          Attach migrations/, 21.6k
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={conversation <= 12_200}
          onClick={() => setConversation(12_200)}
        >
          Compact conversation
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          disabled={files === START.files && conversation === START.conversation}
          onClick={() => {
            setFiles(START.files);
            setConversation(START.conversation);
            setAttached(0);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
