"use client";

import * as React from "react";
import { Power } from "@/components/ui/icons";
import { NeonText } from "@/components/ui/neon-text";

export default function NeonTextPower() {
  const [on, setOn] = React.useState(true);

  return (
    <div className="flex flex-col items-center gap-8">
      <NeonText on={on} className="text-5xl font-semibold tracking-tight">
        VACANCY
      </NeonText>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13px] font-medium text-white/70 outline-none transition-[color,border-color,transform] duration-150 hover:border-white/20 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] active:scale-[0.97]"
      >
        <Power className="size-3.5" /> {on ? "Switch off" : "Switch on"}
      </button>
    </div>
  );
}
