"use client";

import * as React from "react";
import { OTPInput } from "@/components/ui/otp-input";

export default function OTPInputPin() {
  const [approved, setApproved] = React.useState(false);

  return (
    <div className="grid justify-items-center gap-4 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-white/90">Approve production deploy</p>
        <p className="text-sm text-white/55">Enter your 4-digit PIN to ship v2.4.0.</p>
      </div>
      <OTPInput
        aria-label="PIN"
        length={4}
        mask
        onValueChange={() => setApproved(false)}
        onComplete={() => setApproved(true)}
      />
      <p aria-live="polite" className="h-5 text-xs leading-5 text-[#34d399]">
        {approved && "Approved. Deploy started."}
      </p>
    </div>
  );
}
