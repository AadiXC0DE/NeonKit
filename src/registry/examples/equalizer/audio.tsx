"use client";

import * as React from "react";
import { Pause, Play } from "@/components/ui/icons";
import { Equalizer } from "@/components/ui/equalizer";

// Synthesizes a four-bar loop offline, so the example needs no audio file.
// OfflineAudioContext renders without a user gesture; playback still waits for one.
async function renderLoop() {
  const rate = 44100;
  const beat = 60 / 112;
  const length = beat * 16;
  const ctx = new OfflineAudioContext(1, Math.ceil(rate * length), rate);
  const out = ctx.createGain();
  out.gain.value = 0.55;
  out.connect(ctx.destination);

  const noise = ctx.createBuffer(1, rate * 0.25, rate);
  noise.getChannelData(0).forEach((_, i, data) => (data[i] = Math.random() * 2 - 1));

  const hit = (time: number, decay: number, gain: number, setup: (dest: AudioNode) => AudioScheduledSourceNode) => {
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(gain, time);
    amp.gain.exponentialRampToValueAtTime(0.001, time + decay);
    amp.connect(out);
    const source = setup(amp);
    source.start(time);
    source.stop(time + decay + 0.05);
  };

  const burst = (filter: BiquadFilterType, frequency: number) => (dest: AudioNode) => {
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const shape = ctx.createBiquadFilter();
    shape.type = filter;
    shape.frequency.value = frequency;
    source.connect(shape).connect(dest);
    return source;
  };

  const tone = (type: OscillatorType, frequency: number, cutoff = 12000) => (dest: AudioNode) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    const shape = ctx.createBiquadFilter();
    shape.frequency.value = cutoff;
    osc.connect(shape).connect(dest);
    return osc;
  };

  const bass = [55, 55, 65.41, 49, 43.65, 43.65, 49, 49];
  const chords = [
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
    [196, 261.63, 329.63],
    [196, 246.94, 293.66],
  ];

  for (let i = 0; i < 16; i++) {
    const t = i * beat;
    hit(t, 0.32, 0.95, (dest) => {
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(44, t + 0.12);
      osc.connect(dest);
      return osc;
    });
    if (i % 2 === 1) hit(t, 0.18, 0.4, burst("bandpass", 1900));
    hit(t + beat / 2, 0.05, 0.22, burst("highpass", 7500));
    hit(t + beat / 2, 0.42, 0.3, tone("sawtooth", bass[(i >> 1) % bass.length], 520));
  }
  chords.forEach((chord, bar) =>
    chord.forEach((frequency) => hit(bar * beat * 4, beat * 4, 0.06, tone("triangle", frequency * 2))),
  );

  const buffer = await ctx.startRendering();
  return URL.createObjectURL(toWav(buffer));
}

function toWav(buffer: AudioBuffer) {
  const samples = buffer.getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const text = (offset: number, value: string) =>
    [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
  return new Blob([view], { type: "audio/wav" });
}

export default function EqualizerAudio() {
  const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);
  const [src, setSrc] = React.useState<string>();
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    let url: string | undefined;
    let cancelled = false;
    renderLoop().then((result) => {
      if (cancelled) URL.revokeObjectURL(result);
      else setSrc((url = result));
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <Equalizer audio={audio} bars={28} height={110} gap={4} />
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          disabled={!src}
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            if (!audio) return;
            if (audio.paused) audio.play().catch(() => setPlaying(false));
            else audio.pause();
          }}
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/[0.05] text-white/85 transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] disabled:cursor-wait disabled:opacity-50"
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
        </button>
        <div className="min-w-0">
          <p className="text-sm text-white/85">Synth loop, 112 bpm</p>
          <p className="text-xs text-white/55">{!src ? "Rendering…" : playing ? "The bars read its real spectrum." : "Rendered in your browser. Press play."}</p>
        </div>
      </div>
      <audio
        ref={setAudio}
        src={src}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}
