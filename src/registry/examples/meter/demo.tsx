"use client";

import * as React from "react";
import { Meter } from "@/components/ui/meter";

// The meters span -54 to +6 dBFS, so the default red zone (from 90%) starts at 0 dB.
const scale = [6, 0, -6, -12, -24, -36, -48];
const toLevel = (db: number) => (db + 54) / 60;
const toDb = (level: number) => level * 60 - 54;

type Channel = { level: number; peak: number; peakAt: number };

// A stand-in for a real mix: a steady bed, a kick on every beat and a little
// grit, with the right channel a touch behind the left.
function useStereoSignal(ref: React.RefObject<HTMLElement | null>) {
  const [channels, setChannels] = React.useState<[Channel, Channel]>([
    { level: 0, peak: 0, peakAt: 0 },
    { level: 0, peak: 0, peakAt: 0 },
  ]);

  React.useEffect(() => {
    let raf = 0;
    let last = 0;
    const start = performance.now();
    const state: [Channel, Channel] = [
      { level: 0, peak: 0, peakAt: 0 },
      { level: 0, peak: 0, peakAt: 0 },
    ];
    let visible = true;
    const tick = (now: number) => {
      raf = visible ? requestAnimationFrame(tick) : 0;
      if (now - last < 30) return;
      last = now;
      const t = (now - start) / 1000;
      const beat = t / (60 / 124);
      const phrase = Math.sin(t * 0.45) * 0.05;
      state.forEach((channel, i) => {
        const hit = (beat + i * 0.04) % 1;
        // Every fourth bar the chorus pushes into the red.
        const lift = Math.floor(beat / 16) % 4 === 3 ? 0.08 : 0;
        const target = 0.6 + phrase + lift + Math.exp(-hit * 5.5) * 0.23 + (Math.random() - 0.5) * 0.07;
        // Ballistics: jump up to a transient, ease back down.
        channel.level = Math.min(1, target > channel.level ? target : channel.level + (target - channel.level) * 0.3);
        if (channel.level >= channel.peak || now - channel.peakAt > 2000) {
          channel.peak = channel.level;
          channel.peakAt = now;
        }
      });
      setChannels([{ ...state[0] }, { ...state[1] }]);
    };
    // The meters stop when the panel scrolls away and pick up again when it's back.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    if (ref.current) io.observe(ref.current);
    raf = requestAnimationFrame(tick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  return channels;
}

function Readout({ level }: { level: number }) {
  const db = toDb(level);
  return (
    <span
      className={
        db >= 0
          ? "font-mono text-[11px] tabular-nums text-[#ff4d5e] [text-shadow:0_0_10px_rgb(255_77_94/0.7)]"
          : "font-mono text-[11px] tabular-nums text-white/70"
      }
    >
      {level === 0 ? "\u2212inf" : `${db > 0 ? "+" : db < 0 ? "\u2212" : ""}${Math.abs(db).toFixed(1)}`}
    </span>
  );
}

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-[7px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#3b404d,#101219)] shadow-[0_0_0_1px_rgb(255_255_255/0.05)] after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-[5px] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-black/70 ${className}`}
    />
  );
}

export default function MeterDemo() {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [left, right] = useStereoSignal(panelRef);

  return (
    <div ref={panelRef} className="relative rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#11131a,#0a0b10)] px-8 pb-6 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]">
      <Screw className="left-2.5 top-2.5" />
      <Screw className="right-2.5 top-2.5" />
      <Screw className="bottom-2.5 left-2.5" />
      <Screw className="bottom-2.5 right-2.5" />
      <div className="mb-4 flex items-baseline justify-between gap-10 text-xs">
        <span className="font-medium text-white/80">Master</span>
        <span className="text-white/50">Peak, dBFS</span>
      </div>
      <div className="grid grid-cols-[auto_2rem_auto] justify-center gap-x-3 gap-y-2">
        <div className="text-center">
          <Readout level={left.peak} />
        </div>
        <span />
        <div className="text-center">
          <Readout level={right.peak} />
        </div>
        <Meter aria-label="Left channel" orientation="vertical" size="lg" value={left.level} className="h-72" />
        <div aria-hidden className="relative">
          {scale.map((db) => (
            <span
              key={db}
              className="absolute inset-x-0 translate-y-1/2 text-center text-[10px] font-medium tabular-nums text-white/50"
              style={{ bottom: `calc(4px + ${toLevel(db)} * (100% - 8px))` }}
            >
              {db > 0 ? `+${db}` : db < 0 ? `\u2212${-db}` : db}
            </span>
          ))}
        </div>
        <Meter aria-label="Right channel" orientation="vertical" size="lg" value={right.level} className="h-72" />
        <span className="text-center text-[11px] font-semibold text-white/60">L</span>
        <span />
        <span className="text-center text-[11px] font-semibold text-white/60">R</span>
      </div>
    </div>
  );
}
