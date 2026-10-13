"use client";

import * as React from "react";
import { Countdown } from "@/components/ui/countdown";

export default function CountdownDigital() {
  const [closes] = React.useState(() => Date.now() + (3 * 60 + 41) * 60_000 + 18_000);

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[#07080b] px-5 py-7 lg:px-10">
      <span className="text-sm text-white/60">Lot 214, bidding closes in</span>
      <Countdown
        to={closes}
        variant="digital"
        units={["hours", "minutes", "seconds"]}
        color="red"
        className="[--countdown-h:40px] lg:[--countdown-h:60px]"
      />
    </div>
  );
}
