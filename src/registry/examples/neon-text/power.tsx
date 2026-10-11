"use client";

import * as React from "react";
import { Power } from "lucide-react";
import { NeonText } from "@/components/ui/neon-text";

export default function NeonTextPower() {
  const [on, setOn] = React.useState(true);

  return (
    <div className="flex flex-col items-center gap-8">
      <NeonText on={on} color="lime" className="text-5xl font-semibold tracking-tight">
        VACANCY
      </NeonText>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white/20 hover:text-white/90"
      >
        <Power className="size-3.5" /> {on ? "Switch off" : "Switch on"}
      </button>
    </div>
  );
}
