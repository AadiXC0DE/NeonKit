"use client";

import * as React from "react";
import { Globe } from "@/components/ui/icons";
import { PromptInput, type PromptMessage } from "@/components/ui/prompt-input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle-group";

const MODELS = [
  { value: "argon-2", label: "Argon 2", description: "Best for code review and refactors" },
  { value: "argon-2-mini", label: "Argon 2 Mini", description: "Faster, for quick questions" },
];

export default function PromptInputDemo() {
  const [model, setModel] = React.useState("argon-2");
  const [web, setWeb] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [sent, setSent] = React.useState<PromptMessage | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const send = (message: PromptMessage) => {
    setSent(message);
    setStreaming(true);
    timer.current = setTimeout(() => setStreaming(false), 4000);
  };

  return (
    <div className="grid w-full max-w-2xl gap-3">
      <PromptInput
        autoFocus
        placeholder="Ask about this repository, or drop a file"
        counter="tokens"
        streaming={streaming}
        onStop={() => {
          clearTimeout(timer.current);
          setStreaming(false);
        }}
        onSubmit={send}
        toolbar={
          <>
            <Select
              aria-label="Model"
              size="sm"
              options={MODELS}
              value={model}
              onValueChange={setModel}
              containerClassName="w-auto"
              className="h-8 w-auto gap-1.5 border-transparent bg-transparent px-2 text-[13px] text-white/65 hover:border-transparent hover:bg-white/[0.06] hover:text-white/90"
            />
            <Toggle size="sm" aria-label="Search the web" pressed={web} onPressedChange={setWeb} className="gap-1.5 px-2 text-[13px]">
              <Globe aria-hidden />
              <span className="hidden sm:inline">Web</span>
            </Toggle>
          </>
        }
      />
      <p aria-live="polite" className="min-h-5 px-1 text-[13px] text-white/50">
        {sent
          ? streaming
            ? "Answering… press Escape or the stop button to cut it short."
            : `Sent ${sent.text ? `“${sent.text.length > 48 ? `${sent.text.slice(0, 48)}…` : sent.text}”` : "a message"}${sent.attachments.length ? ` with ${sent.attachments.length} file${sent.attachments.length > 1 ? "s" : ""}` : ""}.`
          : "Enter sends. Shift+Enter adds a line."}
      </p>
    </div>
  );
}
