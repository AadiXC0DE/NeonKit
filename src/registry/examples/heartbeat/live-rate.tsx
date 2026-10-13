"use client";

import * as React from "react";
import { Heart } from "@/components/ui/icons";
import { Heartbeat } from "@/components/ui/heartbeat";
import { Slider } from "@/components/ui/slider";

export default function HeartbeatLiveRate() {
  const [bpm, setBpm] = React.useState(84);
  const heart = React.useRef<SVGSVGElement>(null);

  const thump = React.useCallback(() => {
    heart.current?.animate([{ transform: "scale(1.3)" }, { transform: "scale(1)" }], {
      duration: 280,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    });
  }, []);

  return (
    <div className="grid w-full max-w-lg gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-white/80">
          <Heart
            ref={heart}
            aria-hidden
            className="size-4 fill-[rgb(var(--neon-accent,34_211_238))] text-[rgb(var(--neon-accent,34_211_238))]"
          />
          Heart rate
        </p>
        <p className="font-mono text-2xl tabular-nums text-white/90">
          {bpm}
          <span className="ml-1 text-xs text-white/55">bpm</span>
        </p>
      </div>
      <Heartbeat bpm={bpm} height={88} onBeat={thump} />
      <Slider
        aria-label="Heart rate"
        min={40}
        max={180}
        value={[bpm]}
        onValueChange={([value]) => setBpm(value)}
        formatValue={(value) => `${value} beats per minute`}
      />
    </div>
  );
}
