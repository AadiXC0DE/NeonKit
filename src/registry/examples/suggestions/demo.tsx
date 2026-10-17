"use client";

import * as React from "react";
import { Bug, FileText, GitPullRequest, TestTube } from "@/components/ui/icons";
import { PromptInput } from "@/components/ui/prompt-input";
import { Suggestion, Suggestions } from "@/components/ui/suggestions";

const STARTERS = [
  { icon: <Bug />, text: "Why did deploy #4127 fail?" },
  { icon: <GitPullRequest />, text: "Summarize PR #482 for review" },
  { icon: <TestTube />, text: "Which tests flaked this week?" },
  { icon: <FileText />, text: "Draft release notes for v2.14" },
];

const FOLLOW_UPS = [
  { icon: <Bug />, text: "Show the failing step’s log" },
  { icon: <GitPullRequest />, text: "Open a revert PR" },
  { icon: <TestTube />, text: "Rerun with --verbose" },
];

export default function SuggestionsDemo() {
  const [value, setValue] = React.useState("");
  const [sent, setSent] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const chips = sent ? FOLLOW_UPS : STARTERS;

  return (
    <div className="grid w-full max-w-2xl gap-3">
      <PromptInput
        ref={inputRef}
        value={value}
        onValueChange={setValue}
        placeholder="Ask about builds, PRs or tests"
        allowAttachments={false}
        onSubmit={(message) => {
          setSent(message.text);
          setValue("");
        }}
      />
      <Suggestions
        wrap
        aria-label={sent ? "Follow-up questions" : "Suggested questions"}
        onSelect={(text) => {
          // Fill rather than send, so the prompt can be edited first.
          setValue(text);
          requestAnimationFrame(() => {
            const input = inputRef.current;
            input?.focus();
            input?.setSelectionRange(text.length, text.length);
          });
        }}
      >
        {chips.map((chip) => (
          <Suggestion key={chip.text} icon={chip.icon}>
            {chip.text}
          </Suggestion>
        ))}
      </Suggestions>
      <p aria-live="polite" className="min-h-5 px-1 text-[13px] text-white/50">
        {sent ? `Sent “${sent}”. The chips now follow up on it.` : "A chip fills the prompt. Edit it, then press Enter."}
      </p>
    </div>
  );
}
