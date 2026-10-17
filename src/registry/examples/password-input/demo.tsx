"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput, evaluatePassword } from "@/components/ui/password-input";

export default function PasswordInputDemo() {
  const [password, setPassword] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const strong = evaluatePassword(password).score >= 3 && password.length >= 12;

  return (
    <form
      className="grid w-full max-w-sm gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (strong) setSaved(true);
      }}
    >
      <div className="grid gap-1">
        <p className="text-[15px] font-medium text-white/90">Choose a new password</p>
        <p className="text-[13px] text-white/50">For ada@lumen.dev. You’ll be signed out on 3 other devices.</p>
      </div>
      <PasswordInput
        label="New password"
        value={password}
        onValueChange={(next) => {
          setPassword(next);
          setSaved(false);
        }}
        strength
        rules
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="solid" disabled={!strong}>
          Save password
        </Button>
        <p aria-live="polite" className="text-[13px] text-white/50">
          {saved ? "Saved. Other sessions end within a minute." : strong ? "" : "Needs at least Good."}
        </p>
      </div>
    </form>
  );
}
