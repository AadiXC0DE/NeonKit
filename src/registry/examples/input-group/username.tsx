"use client";

import * as React from "react";
import { Check } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";

const TAKEN = ["ana", "acme", "admin", "design", "studio"];

export default function InputGroupUsername() {
  const [name, setName] = React.useState("ana");
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    if (!checking) return;
    const timer = window.setTimeout(() => setChecking(false), 600);
    return () => window.clearTimeout(timer);
  }, [checking, name]);

  const taken = TAKEN.includes(name.toLowerCase());
  const status = !name ? null : checking ? "checking" : taken ? "taken" : "free";

  return (
    <div className="grid min-w-0 w-full max-w-sm gap-1.5">
      <label htmlFor="handle" className="text-sm font-medium text-white/80">
        Profile URL
      </label>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>acme.dev/</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id="handle"
          value={name}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={status === "taken" || undefined}
          aria-describedby="handle-status"
          onChange={(event) => {
            setName(event.target.value.replace(/[^a-z0-9-]/gi, ""));
            setChecking(true);
          }}
        />
        <InputGroupAddon align="inline-end">
          {status === "checking" && <Spinner size="sm" label="Checking" />}
          {status === "free" && <Check className="text-[rgb(52_211_153)]" aria-hidden />}
        </InputGroupAddon>
      </InputGroup>
      <p id="handle-status" aria-live="polite" className={status === "taken" ? "text-xs text-[#ff4d5e]" : "text-xs text-white/50"}>
        {status === "taken" ? `acme.dev/${name} is taken. Try ${name}-studio.` : status === "free" ? "Available." : "Letters, numbers and dashes."}
      </p>
    </div>
  );
}
