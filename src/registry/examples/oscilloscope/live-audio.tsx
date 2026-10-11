"use client";

import * as React from "react";
import { Mic, Volume2 } from "lucide-react";
import { Oscilloscope } from "@/components/ui/oscilloscope";

type Source = "tone" | "mic";

export default function OscilloscopeLiveAudio() {
  const [analyser, setAnalyser] = React.useState<AnalyserNode | null>(null);
  const [active, setActive] = React.useState<Source | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const stopRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => () => stopRef.current?.(), []);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setAnalyser(null);
    setActive(null);
  };

  // Each source builds its own graph inside the click, so the AudioContext may start.
  const start = async (source: Source) => {
    stop();
    setError(null);
    const context = new AudioContext();
    const node = context.createAnalyser();
    node.fftSize = 2048;
    try {
      if (source === "tone") {
        // A 220 Hz sawtooth with a slow filter sweep, quiet enough to leave on.
        const osc = context.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = 220;
        const filter = context.createBiquadFilter();
        filter.frequency.value = 900;
        const lfo = context.createOscillator();
        lfo.frequency.value = 0.25;
        const depth = context.createGain();
        depth.gain.value = 600;
        lfo.connect(depth).connect(filter.frequency);
        const volume = context.createGain();
        volume.gain.value = 0.08;
        osc.connect(filter).connect(node);
        node.connect(volume).connect(context.destination);
        osc.start();
        lfo.start();
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        context.createMediaStreamSource(stream).connect(node);
        stopRef.current = () => stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      void context.close();
      setError("Microphone access was blocked.");
      return;
    }
    const release = stopRef.current;
    stopRef.current = () => {
      release?.();
      void context.close();
    };
    setAnalyser(node);
    setActive(source);
  };

  const button =
    "inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]";
  const idle = "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]";
  const on =
    "border-[rgb(var(--neon-accent,34_211_238)/0.5)] bg-[rgb(var(--neon-accent,34_211_238)/0.12)] text-[rgb(var(--neon-accent,34_211_238))]";

  return (
    <div className="grid w-full max-w-xl gap-4">
      <Oscilloscope source={analyser} amplitude={active === "mic" ? 2.5 : active ? 1.6 : 0} aria-label="Live audio waveform">
        <span className="absolute left-4 top-4">{active === "mic" ? "MIC" : active === "tone" ? "OSC 220 Hz" : "NO SIGNAL"}</span>
      </Oscilloscope>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={active === "tone"}
          onClick={() => (active === "tone" ? stop() : start("tone"))}
          className={`${button} ${active === "tone" ? on : idle}`}
        >
          <Volume2 className="size-3.5" /> Tone
        </button>
        <button
          type="button"
          aria-pressed={active === "mic"}
          onClick={() => (active === "mic" ? stop() : start("mic"))}
          className={`${button} ${active === "mic" ? on : idle}`}
        >
          <Mic className="size-3.5" /> Microphone
        </button>
        {error && <span className="text-xs text-[#ff4d5e]">{error}</span>}
      </div>
    </div>
  );
}
