"use client";

import { ContextMeter } from "@/components/ui/context-meter";
import { PromptInput } from "@/components/ui/prompt-input";

const PARTS = [
  { label: "System prompt", tokens: 3_100 },
  { label: "Conversation", tokens: 88_500 },
  { label: "Files", tokens: 38_900 },
  { label: "Tools", tokens: 11_800 },
];

export default function ContextMeterComposer() {
  return (
    <div className="w-full max-w-2xl">
      <PromptInput
        placeholder="Ask about the billing service"
        toolbar={
          <ContextMeter
            size="sm"
            limit={200_000}
            parts={PARTS}
            breakdown
            note="Past 90%, the oldest turns are summarised before the next reply."
          />
        }
      />
    </div>
  );
}
