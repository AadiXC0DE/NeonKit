"use client";

import { Button } from "@/components/ui/button";
import { CrtOverlay } from "@/components/ui/crt-overlay";
import { Input } from "@/components/ui/input";

export default function CrtOverlaySignIn() {
  return (
    <CrtOverlay curvature className="w-full max-w-sm">
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4 p-8 pb-9">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[rgb(var(--neon))]">Night Owl BBS</p>
          <p className="mt-1 text-sm text-white/55">Node 2 of 4 is free. 14,400 baud.</p>
        </div>
        <Input label="Handle" placeholder="your handle" autoComplete="username" />
        <Input label="Password" type="password" placeholder="••••••••" autoComplete="current-password" />
        <Button type="submit" variant="solid" className="mt-1">
          Dial in
        </Button>
      </form>
    </CrtOverlay>
  );
}
