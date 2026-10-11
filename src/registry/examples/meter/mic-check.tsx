"use client";

import * as React from "react";
import { Mic, MicOff } from "lucide-react";
import { Meter } from "@/components/ui/meter";

type Status = "idle" | "listening" | "blocked";

// Maps loudness to the meter: -60 dBFS reads empty, 0 dBFS fills it.
const toLevel = (rms: number) => Math.min(1, Math.max(0, (20 * Math.log10(rms + 1e-8) + 60) / 60));

export default function MeterMicCheck() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [level, setLevel] = React.useState(0);
  const stopRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => () => stopRef.current?.(), []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Created inside the click, so the browser lets it start.
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let raf = 0;
      const read = () => {
        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) sum += sample * sample;
        setLevel(toLevel(Math.sqrt(sum / samples.length)));
        raf = requestAnimationFrame(read);
      };
      read();
      stopRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((track) => track.stop());
        void context.close();
      };
      setStatus("listening");
    } catch {
      setStatus("blocked");
    }
  };

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setLevel(0);
    setStatus("idle");
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-medium text-white/90">Microphone</p>
      <p className="mt-1 text-xs leading-5 text-white/50">
        {status === "blocked"
          ? "Microphone access was blocked. Allow it in your browser's site settings."
          : "Speak at your normal volume. The bar should reach the amber zone."}
      </p>
      <Meter aria-label="Input level" value={level} segments={28} className="mt-4 w-full" />
      <button
        type="button"
        onClick={status === "listening" ? stop : start}
        className="mt-4 inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-white/80 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]"
      >
        {status === "listening" ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
        {status === "listening" ? "Stop test" : "Test microphone"}
      </button>
    </div>
  );
}
