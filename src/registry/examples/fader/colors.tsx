"use client";

import { Fader } from "@/components/ui/fader";

export default function FaderColors() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-8 sm:gap-8">
      <Fader size="sm" label="Drums" color="amber" defaultValue={70} level={0.62} ticks={6} className="h-52" />
      <Fader size="md" label="Synth" color="magenta" defaultValue={55} level={0.48} ticks={6} className="h-52" />
      <Fader size="lg" label="Pads" color="green" defaultValue={40} level={0.3} ticks={6} className="h-52" />
      <Fader size="md" label="Muted" defaultValue={25} level={0} ticks={6} disabled className="h-52" />
    </div>
  );
}
