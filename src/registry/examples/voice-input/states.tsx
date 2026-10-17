"use client";

import * as React from "react";
import { VoiceInput, type VoiceInputState } from "@/components/ui/voice-input";

/** A speech-like envelope: syllables riding on phrases, with pauses. */
function useSpeechLevel(active: boolean) {
  const [level, setLevel] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start;
      const syllable = Math.max(0, Math.sin(t / 82)) ** 0.7;
      const phrase = 0.5 + 0.32 * Math.sin(t / 640) + 0.12 * Math.sin(t / 233);
      const pause = Math.sin(t / 1700) > -0.55 ? 1 : 0.08;
      setLevel(Math.min(1, syllable * phrase * pause + 0.04));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return level;
}

const ROWS: { state: VoiceInputState; name: string }[] = [
  { state: "idle", name: "At rest" },
  { state: "listening", name: "Listening" },
  { state: "transcribing", name: "Transcribing" },
  { state: "denied", name: "Microphone blocked" },
];

export default function VoiceInputStates() {
  const level = useSpeechLevel(true);
  return (
    <div className="grid w-full max-w-md">
      {ROWS.map((row) => (
        <div key={row.state} className="flex min-h-14 items-center justify-between gap-4 border-b border-white/[0.06] last:border-b-0">
          <span className="text-[13.5px] text-white/70">{row.name}</span>
          <VoiceInput state={row.state} microphone={false} level={row.state === "listening" ? level : 0} />
        </div>
      ))}
    </div>
  );
}
