"use client";

import * as React from "react";
import { Reasoning } from "@/components/ui/reasoning";

const TRACE = `One failure, in date math, right after the runners moved to eu-central-1. That points at time zones. The old runners were on UTC; the new ones default to Europe/Berlin.

Berlin leaves summer time on October 25, so that day is 25 hours long. If \`addDays\` adds a fixed 86,400,000 ms per day, stepping across that night lands at 23:00 the day before instead of midnight. The failing assertion is off by exactly one hour, which fits.

I'll reproduce it with TZ=Europe/Berlin before touching \`src/date.ts\`, then step by calendar day with \`setDate\` instead of adding milliseconds.`;

function useTyped(text: string, run: number) {
  const [typed, setTyped] = React.useState("");
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    let at = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = /\s*\S+\s?/y;
      word.lastIndex = at;
      at = word.exec(text) ? word.lastIndex : text.length;
      setTyped(text.slice(0, at));
      if (at >= text.length) timer = setTimeout(() => setDone(true), 600);
      else timer = setTimeout(tick, /[.,]\s?$/.test(text.slice(0, at)) ? 300 : 70);
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [text, run]);
  return { typed, done, reset: () => (setTyped(""), setDone(false)) };
}

export default function ReasoningDemo() {
  const [run, setRun] = React.useState(0);
  const { typed, done, reset } = useTyped(TRACE, run);

  return (
    <div className="grid w-full max-w-xl gap-5">
      <Reasoning streaming={!done}>{typed}</Reasoning>
      <button
        type="button"
        onClick={() => {
          reset();
          setRun((n) => n + 1);
        }}
        className={`w-fit cursor-pointer rounded-md text-[13px] text-white/55 underline decoration-white/20 underline-offset-4 outline-none transition-[color,opacity] hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] ${done ? "opacity-100" : "pointer-events-none opacity-0"}`}
        tabIndex={done ? 0 : -1}
      >
        Think again
      </button>
    </div>
  );
}
