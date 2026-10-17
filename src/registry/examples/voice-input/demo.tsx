"use client";

import * as React from "react";
import { PromptInput } from "@/components/ui/prompt-input";
import { VoiceInput, type VoiceRecording } from "@/components/ui/voice-input";

const DICTATED = "fix(auth): refresh the session token a minute before it expires, not after the first 401";

export default function VoiceInputDemo() {
  const [value, setValue] = React.useState("");
  const [note, setNote] = React.useState("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  // Send recording.audio to your speech-to-text service here. This one pretends for 1.4s.
  const transcribe = (recording: VoiceRecording) =>
    new Promise<void>((resolve) => {
      timer.current = setTimeout(() => {
        setValue((text) => (text.trim() ? `${text.trimEnd()} ${DICTATED}` : DICTATED));
        setNote(`${(recording.duration / 1000).toFixed(1)}s of audio, ${DICTATED.split(" ").length} words.`);
        resolve();
      }, 1400);
    });

  return (
    <div className="grid w-full max-w-2xl gap-3">
      <PromptInput
        value={value}
        onValueChange={setValue}
        label="Commit message"
        placeholder="Commit message"
        allowAttachments={false}
        submitOn="mod-enter"
        onSubmit={({ text }) => setNote(`Committed: ${text.split("\n")[0]}`)}
        toolbar={<VoiceInput onStop={transcribe} onCancel={() => setNote("Discarded.")} maxDuration={60} />}
      />
      <p aria-live="polite" className="min-h-5 px-1 text-[13px] text-white/50">
        {note || "Press the mic and say the change. Escape cancels, the tick finishes."}
      </p>
    </div>
  );
}
