"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CrtOverlay } from "@/components/ui/crt-overlay";
import { Input } from "@/components/ui/input";

export default function CrtOverlaySignIn() {
  const [handle, setHandle] = React.useState("");
  const [state, setState] = React.useState<"idle" | "dialing" | "connected">("idle");

  React.useEffect(() => {
    if (state !== "dialing") return;
    const timeout = setTimeout(() => setState("connected"), 1400);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <CrtOverlay curvature className="w-full max-w-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setState("dialing");
        }}
        className="flex flex-col gap-4 p-8 pb-9"
      >
        <div>
          <h3 className="text-lg font-medium text-[rgb(var(--neon))]">Night Owl BBS</h3>
          <p className="mt-1 text-sm text-white/55" aria-live="polite">
            {state === "idle" && "Node 2 of 4 is free. 14,400 baud."}
            {state === "dialing" && "Dialing 555-0142…"}
            {state === "connected" && `Connected to node 2. Welcome back, ${handle.trim() || "caller"}.`}
          </p>
        </div>
        <Input
          label="Handle"
          placeholder="your handle"
          autoComplete="username"
          required
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
        />
        <Input label="Password" type="password" placeholder="••••••••" autoComplete="current-password" required />
        <Button type="submit" variant="solid" className="mt-1" disabled={state === "dialing"}>
          {state === "dialing" ? "Dialing…" : state === "connected" ? "Hang up and redial" : "Dial in"}
        </Button>
      </form>
    </CrtOverlay>
  );
}
