"use client";

import * as React from "react";
import { OTPInput } from "@/components/ui/otp-input";

type Status = "idle" | "checking" | "invalid" | "accepted";

export default function OTPInputInvalid() {
  const [status, setStatus] = React.useState<Status>("idle");
  const timer = React.useRef<number>(undefined);
  const messageId = React.useId();

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  function check(code: string) {
    setStatus("checking");
    timer.current = window.setTimeout(() => {
      setStatus(code === "424242" ? "accepted" : "invalid");
    }, 500);
  }

  return (
    <div className="grid justify-items-center gap-4 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-white/90">Two-factor authentication</p>
        <p className="text-sm text-white/55">
          Open your authenticator app. Anything but <span className="font-mono text-white/80">424242</span> fails.
        </p>
      </div>
      <OTPInput
        aria-label="Authenticator code"
        invalid={status === "invalid"}
        aria-describedby={messageId}
        onValueChange={() => {
          window.clearTimeout(timer.current);
          setStatus("idle");
        }}
        onComplete={check}
      />
      <p
        id={messageId}
        aria-live="polite"
        className={status === "accepted" ? "h-5 text-xs leading-5 text-[#34d399]" : "h-5 text-xs leading-5 text-[#ff4d5e]"}
      >
        {status === "invalid" && "That code didn’t work. Check your app and try again."}
        {status === "accepted" && "Code accepted."}
      </p>
    </div>
  );
}
