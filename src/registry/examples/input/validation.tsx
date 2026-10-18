"use client";

import * as React from "react";
import { Check } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

const taken = ["aadi", "admin", "neon", "support"];

function validate(handle: string) {
  if (!handle) return "Pick a handle for your profile link.";
  if (!/^[a-z0-9-]+$/.test(handle)) return "Use lowercase letters, numbers and dashes.";
  if (handle.length < 3) return "Handles are at least 3 characters.";
  if (taken.includes(handle)) return `That one is taken. Try ${handle}-dev.`;
  return undefined;
}

export default function InputValidation() {
  const [handle, setHandle] = React.useState("aadi");
  const error = validate(handle);

  return (
    <Input
      label="Profile URL"
      description="Your public page. You can change it once every 30 days."
      value={handle}
      onChange={(event) => setHandle(event.target.value.trim())}
      error={error}
      spellCheck={false}
      autoCapitalize="none"
      leading={<span className="-mr-1.5 select-none">neonkit.dev/</span>}
      trailing={error ? null : <Check className="text-[#34d399]" aria-hidden />}
      containerClassName="max-w-sm"
    />
  );
}
