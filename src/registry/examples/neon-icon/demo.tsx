"use client";

import * as React from "react";
import { NeonIcon } from "@/components/ui/neon-icon";
import { Headphones, Lamp, Lock, Mic, Radio, Rss, Video, type Icon } from "@/components/ui/icons";

type Channel = { id: string; icon: Icon; name: string; on: string; off: string };

const channels: Channel[] = [
  { id: "mic", icon: Mic, name: "Mic 1", on: "Live", off: "Muted" },
  { id: "cam", icon: Video, name: "Cam A", on: "Recording", off: "Standby" },
  { id: "stream", icon: Rss, name: "Stream", on: "6 Mb/s", off: "Offline" },
  { id: "talkback", icon: Headphones, name: "Talkback", on: "Open", off: "Closed" },
  { id: "lights", icon: Lamp, name: "House lights", on: "80%", off: "Off" },
  { id: "door", icon: Lock, name: "Door", on: "Locked", off: "Open" },
];

// On air is a status, so it keeps its red whatever accent the rest of the panel takes.
const onAirColor = "red";

// Switched on one after another when the panel powers up.
const startup = ["door", "lights", "mic", "cam", "stream"];

function clock(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function NeonIconDemo() {
  const [on, setOn] = React.useState<Record<string, boolean>>({});
  const [elapsed, setElapsed] = React.useState(2537);
  const onAir = Boolean(on.mic && on.stream);

  React.useEffect(() => {
    const timers = startup.map((id, i) =>
      setTimeout(() => setOn((state) => ({ ...state, [id]: true })), 350 + i * 220),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  React.useEffect(() => {
    if (!onAir) return;
    const interval = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [onAir]);

  return (
    <div className="w-full max-w-[44rem] rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,#101218,#08090d)] shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_40px_80px_-40px_rgb(0_0_0/0.95)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-7">
        <div>
          <p className="text-[15px] font-medium text-white/90">Studio B</p>
          <p className="text-[13px] text-white/55">Late show, Thursday</p>
        </div>
        <div className="flex items-center gap-3" aria-live="polite">
          <span className="text-right">
            <span className={`block text-[13px] ${onAir ? "text-[rgb(255_77_94)]" : "text-white/55"}`}>
              {onAir ? "On air" : "Off air"}
            </span>
            <span className="block font-mono text-xs tabular-nums text-white/70">{clock(elapsed)}</span>
          </span>
          <NeonIcon icon={Radio} value={onAir ? 1 : 0} color={onAirColor} size={34} label={onAir ? "On air" : "Off air"} />
        </div>
      </div>

      <ul className="grid grid-cols-3 sm:grid-cols-6">
        {channels.map((channel, i) => {
          const lit = Boolean(on[channel.id]);
          return (
            <li
              key={channel.id}
              className={`border-white/[0.06] ${i % 3 !== 2 ? "border-r" : ""} ${i < 3 ? "border-b sm:border-b-0" : ""} sm:border-r sm:last:border-r-0`}
            >
              <button
                type="button"
                aria-pressed={lit}
                onClick={() => setOn((state) => ({ ...state, [channel.id]: !state[channel.id] }))}
                className="group flex w-full cursor-pointer flex-col items-center gap-4 px-2 pb-5 pt-7 outline-none transition-colors duration-150 hover:bg-white/[0.025] focus-visible:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] active:bg-white/[0.04] sm:pt-8"
              >
                <NeonIcon icon={channel.icon} value={lit ? 1 : 0} size={40} aria-hidden />
                <span className="grid gap-0.5 text-center">
                  <span className="text-[13px] text-white/90">{channel.name}</span>
                  <span className={`text-[13px] tabular-nums ${lit ? "text-white/70" : "text-white/50"}`}>
                    {lit ? channel.on : channel.off}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
