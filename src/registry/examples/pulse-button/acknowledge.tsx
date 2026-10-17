"use client";

import * as React from "react";
import { PulseButton } from "@/components/ui/pulse-button";

export default function PulseButtonAcknowledge() {
  const [seen, setSeen] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <PulseButton variant="outline" pulse={!seen} onClick={() => setSeen(true)}>
        {seen ? "Release notes opened" : "See what's new in 1.2"}
      </PulseButton>
      <p className="text-xs text-white/50">
        {seen ? "The pulse has done its job and stops." : "Pulses until someone clicks it."}
      </p>
    </div>
  );
}
