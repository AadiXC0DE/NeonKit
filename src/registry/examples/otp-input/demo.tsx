"use client";

import * as React from "react";
import { OTPInput } from "@/components/ui/otp-input";

type Status = "idle" | "verifying" | "verified" | "resent";

export default function OTPInputDemo() {
  const [status, setStatus] = React.useState<Status>("idle");
  const timer = React.useRef<number>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  function verify() {
    setStatus("verifying");
    timer.current = window.setTimeout(() => setStatus("verified"), 900);
  }

  return (
    <div className="grid justify-items-center gap-5 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-white/90">Check your inbox</p>
        <p className="text-sm text-white/55">
          Enter the 6-digit code we sent to <span className="text-white/80">ada@northwind.io</span>
        </p>
      </div>
      <OTPInput
        aria-label="Verification code"
        color={status === "verified" ? "green" : undefined}
        onValueChange={() => {
          window.clearTimeout(timer.current);
          setStatus("idle");
        }}
        onComplete={verify}
      />
      <p aria-live="polite" className="h-5 text-xs leading-5 text-white/55">
        {status === "verifying" && <span className="animate-pulse">Verifying…</span>}
        {status === "verified" && <span className="text-[#34d399]">Verified. Signing you in.</span>}
        {status === "resent" && "A new code is on its way."}
        {status === "idle" && (
          <>
            Didn&apos;t get it?{" "}
            <button
              type="button"
              onClick={() => setStatus("resent")}
              className="cursor-pointer font-medium text-white/80 underline-offset-4 outline-none transition-colors hover:text-white hover:underline focus-visible:underline"
            >
              Resend code
            </button>
          </>
        )}
      </p>
    </div>
  );
}
