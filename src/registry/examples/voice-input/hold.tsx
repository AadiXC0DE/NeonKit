"use client";

import * as React from "react";
import { VoiceInput, type VoiceRecording } from "@/components/ui/voice-input";

type Note = { id: number; who: string; at: string; seconds: number; text: string };

const REPLIES = [
  "Replica lag is back under two seconds. Leaving the read traffic on the primary until it holds for ten minutes.",
  "Paging Ana for the database side. The vacuum on events is still running, 61% through.",
  "Status page updated. Next update at 14:30 or sooner if the error rate moves.",
];

const INITIAL: Note[] = [
  {
    id: 1,
    who: "Ana Ribeiro",
    at: "14:02",
    seconds: 9,
    text: "Rolled api back to 4.18.2. 5xx rate dropped from 6.1% to 0.08% within two minutes.",
  },
];

export default function VoiceInputHold() {
  const [notes, setNotes] = React.useState(INITIAL);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const send = ({ duration }: VoiceRecording) =>
    new Promise<void>((resolve) => {
      timer.current = setTimeout(() => {
        setNotes((list) => [
          ...list,
          {
            id: list.length + 1,
            who: "You",
            at: `14:${String(10 + list.length * 3).padStart(2, "0")}`,
            seconds: Math.max(1, Math.round(duration / 1000)),
            text: REPLIES[(list.length - 1) % REPLIES.length],
          },
        ]);
        resolve();
      }, 900);
    });

  return (
    <div className="grid w-full max-w-lg gap-4">
      <ol aria-label="Voice notes in #incident-2291" className="grid gap-3.5">
        {notes.map((note) => (
          <li key={note.id} className="grid gap-1">
            <p className="flex items-baseline gap-2 text-[13px]">
              <span className="font-medium text-white/85">{note.who}</span>
              <span className="tabular-nums text-white/45">{note.at}</span>
              <span className="font-mono text-[11.5px] tabular-nums text-white/40">0:{String(note.seconds).padStart(2, "0")}</span>
            </p>
            <p className="text-[14.5px] leading-relaxed text-white/75">{note.text}</p>
          </li>
        ))}
      </ol>
      <VoiceInput mode="hold" size="md" label="Hold to talk" hint="Hold to reply in #incident-2291, or hold Space" maxDuration={30} onStop={send} />
    </div>
  );
}
