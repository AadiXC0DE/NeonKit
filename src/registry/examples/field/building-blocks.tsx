"use client";

import * as React from "react";
import { FieldDescription, FieldError, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function FieldBuildingBlocks() {
  const [password, setPassword] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const tooShort = touched && password.length > 0 && password.length < 12;

  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor="new-password" required>
          New password
        </Label>
        <button
          type="button"
          aria-pressed={visible}
          aria-controls="new-password"
          onClick={() => setVisible((v) => !v)}
          className="cursor-pointer rounded-md text-xs text-white/55 outline-none transition-colors hover:text-white/90 focus-visible:text-[rgb(var(--neon))]"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <Input
        id="new-password"
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onBlur={() => setTouched(true)}
        error={tooShort}
        aria-describedby="new-password-message"
      />
      {tooShort ? (
        <FieldError id="new-password-message">
          {12 - password.length} more {12 - password.length === 1 ? "character" : "characters"} to go.
        </FieldError>
      ) : (
        <FieldDescription id="new-password-message">
          At least 12 characters. A short sentence you&apos;ll remember works well.
        </FieldDescription>
      )}
    </div>
  );
}
