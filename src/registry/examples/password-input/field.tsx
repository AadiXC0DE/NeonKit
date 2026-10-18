"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export default function PasswordInputField() {
  const [attempts, setAttempts] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      noValidate
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const password = new FormData(event.currentTarget).get("password");
        if (!password) return setError("Enter your password.");
        const next = attempts + 1;
        setAttempts(next);
        setError(next >= 5 ? "Too many attempts. Try again in 15 minutes." : `That password doesn’t match. ${5 - next} attempts left.`);
      }}
    >
      <Input label="Email" name="email" type="email" autoComplete="username" defaultValue="ada@lumen.dev" />
      <Field label="Password" error={error}>
        <PasswordInput name="password" placeholder="Your password" onValueChange={() => setError(null)} />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" variant="solid" disabled={attempts >= 5}>
          Sign in
        </Button>
        <a href="#reset" className="text-[13px] text-white/55 underline-offset-4 hover:text-white/85 hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  );
}
