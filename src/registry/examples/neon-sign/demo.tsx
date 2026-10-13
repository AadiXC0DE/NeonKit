"use client";

import * as React from "react";
import { NeonSign } from "@/components/ui/neon-sign";
import { Switch } from "@/components/ui/switch";

export default function NeonSignDemo() {
  const [on, setOn] = React.useState(true);

  return (
    <div className="flex w-full flex-col items-center gap-6 pt-4">
      <NeonSign
        on={on}
        frame="rounded"
        cable="right"
        size="xl"
        buzz
        style={{ fontFamily: "var(--font-tilt-neon)" }}
        lines={[
          { text: "OPEN", className: "pl-[0.06em] tracking-[0.06em]" },
          { text: "late", color: "pink", className: "-mt-[0.06em] pl-[0.34em] text-[0.46em] tracking-[0.34em]" },
        ]}
      />
      <Switch
        checked={on}
        onCheckedChange={setOn}
        label={<span className="text-[13px] font-medium text-white/60">Power</span>}
      />
    </div>
  );
}
