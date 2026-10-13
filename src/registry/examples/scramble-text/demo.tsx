"use client";

import * as React from "react";
import { ScrambleText } from "@/components/ui/scramble-text";

const statuses = ["Uplink established", "Decrypting payload", "Handshake verified", "Standing by"];

export default function ScrambleTextDemo() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % statuses.length), 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ScrambleText
        as="p"
        aria-live="polite"
        text={statuses[index]}
        trigger="mount"
        duration={1100}
        className="font-mono text-[clamp(1.5rem,5vw,2.5rem)] font-medium tracking-[0.02em] text-white/90"
      />
      <p className="text-[13px] text-white/55">Relay 07, Kowloon uplink</p>
    </div>
  );
}
