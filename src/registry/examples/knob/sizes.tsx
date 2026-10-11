"use client";

import { Knob } from "@/components/ui/knob";

export default function KnobSizes() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-10">
      <Knob size="sm" label="Drive" color="orange" defaultValue={72} />
      <Knob size="md" label="Mix" color="magenta" defaultValue={40} />
      <Knob size="lg" label="Volume" color="lime" defaultValue={58} formatValue={(v) => `${v}%`} showValue />
      <Knob size="md" label="Locked" defaultValue={30} disabled />
    </div>
  );
}
