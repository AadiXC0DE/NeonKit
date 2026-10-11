"use client";

import * as React from "react";
import { ScrambleText } from "@/components/ui/scramble-text";

const statuses = ["UPLINK ESTABLISHED", "DECRYPTING PAYLOAD", "HANDSHAKE VERIFIED", "STANDING BY"];

export default function ScrambleTextDemo() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % statuses.length), 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">Relay 07 · status</span>
      <ScrambleText
        as="p"
        aria-live="polite"
        text={statuses[index]}
        trigger="mount"
        duration={1100}
        className="font-mono text-[clamp(1.5rem,5vw,2.5rem)] font-medium tracking-[0.08em] text-white/90"
      />
    </div>
  );
}
