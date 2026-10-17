"use client";

import * as React from "react";
import { VoiceInput, type VoiceInputState } from "@/components/ui/voice-input";

const SPOKEN =
  "Move the nightly export to 02:30 UTC so it stops overlapping the backup window, and page me only if it runs past forty minutes.";

/** Stand-in for a streaming speech SDK: an input level and interim words. */
function useFakeEngine(running: boolean) {
  const [level, setLevel] = React.useState(0);
  const [words, setWords] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    let raf = 0;
    const start = performance.now();
    const total = SPOKEN.split(" ").length;
    const tick = (now: number) => {
      const t = now - start;
      const syllable = Math.max(0, Math.sin(t / 86)) ** 0.7;
      const phrase = 0.55 + 0.3 * Math.sin(t / 700);
      const talking = Math.floor(t / 260) < total;
      setLevel(talking ? Math.min(1, syllable * phrase + 0.05) : 0.03);
      setWords(Math.min(total, Math.floor(t / 260)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return { level, words };
}

export default function VoiceInputEngine() {
  const [state, setState] = React.useState<VoiceInputState>("idle");
  const [text, setText] = React.useState("");
  const { level, words } = useFakeEngine(state === "listening");
  const interim = state === "listening" ? SPOKEN.split(" ").slice(0, words).join(" ") : "";

  return (
    <div className="grid w-full max-w-lg gap-3">
      <VoiceInput
        size="md"
        microphone={false}
        level={level}
        state={state}
        onStateChange={setState}
        onStart={() => setText("")}
        onStop={() => setText(SPOKEN.split(" ").slice(0, Math.max(words, 1)).join(" "))}
        hint="Dictate a note for the on-call handover"
      />
      <p aria-live="off" className="min-h-[4.5rem] px-1 text-[14.5px] leading-relaxed text-white/80">
        {interim ? <span className="text-white/55">{interim}</span> : text || <span className="text-white/40">The transcript lands here.</span>}
      </p>
    </div>
  );
}
