"use client";

import * as React from "react";
import { Countdown } from "@/components/ui/countdown";

export default function CountdownSign() {
  // The coming midnight, worked out in the browser so the server never guesses a time zone.
  const [midnight, setMidnight] = React.useState<number | null>(null);

  React.useEffect(() => {
    const id = setTimeout(() => {
      const next = new Date();
      next.setHours(24, 0, 0, 0);
      setMidnight(next.getTime());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 [--neon:var(--neon-accent,34_211_238)]">
      <p
        className="text-2xl text-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_6px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.7)]"
        style={{ fontFamily: "var(--font-tilt-neon)" }}
      >
        Last call at midnight
      </p>
      <Countdown
        to={midnight ?? Number.NaN}
        variant="sign"
        units={["hours", "minutes", "seconds"]}
        labels={false}
        className="[--countdown-h:48px] lg:[--countdown-h:72px]"
      />
    </div>
  );
}
