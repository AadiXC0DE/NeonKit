"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const control =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white/90 outline-none [color-scheme:dark] transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-white/30 hover:border-white/20 focus-visible:border-[rgb(var(--neon)/0.8)] focus-visible:bg-[rgb(var(--neon)/0.04)] focus-visible:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5)] aria-[invalid=true]:border-[rgb(var(--neon)/0.55)]";

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-opacity='0.4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

type Errors = { code?: string; term?: string };

export default function FieldValidation() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [errors, setErrors] = React.useState<Errors>({});
  const [attempt, setAttempt] = React.useState(0);
  const [status, setStatus] = React.useState("");

  // After a failed submit, move focus to the first field that needs attention.
  React.useEffect(() => {
    if (attempt) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const code = String(data.get("auth-code") ?? "").trim();
    const term = String(data.get("term") ?? "");
    const next: Errors = {
      code: !code
        ? "Enter the auth code from your current registrar."
        : code.length < 8
          ? `Auth codes are at least 8 characters. This one has ${code.length}.`
          : undefined,
      term: term ? undefined : "Choose how long to renew for after the transfer.",
    };
    setErrors(next);
    if (next.code || next.term) {
      setStatus("");
      setAttempt((count) => count + 1);
    } else {
      setStatus("Transfer requested for nightjar.studio. We'll email you when it lands.");
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="grid w-full max-w-sm gap-5">
      <Field
        label="Auth code"
        required
        description="Also called an EPP code. Your current registrar sends it on request."
        error={errors.code}
      >
        <input
          name="auth-code"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. 7Xq#vR2m!pL9"
          onChange={() => errors.code && setErrors((e) => ({ ...e, code: undefined }))}
          className={`${control} px-3 font-mono`}
        />
      </Field>

      <Field label="Renew for" required error={errors.term}>
        <select
          name="term"
          defaultValue=""
          style={{ backgroundImage: chevron }}
          onChange={() => errors.term && setErrors((e) => ({ ...e, term: undefined }))}
          className={`${control} cursor-pointer appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pl-3 pr-9`}
        >
          <option value="" disabled>
            Choose a term
          </option>
          <option value="1">1 year · $14</option>
          <option value="2">2 years · $27</option>
          <option value="5">5 years · $64</option>
        </select>
      </Field>

      <Field
        orientation="horizontal"
        label="WHOIS privacy"
        description="Hide your contact details from public lookups."
      >
        <Switch name="privacy" defaultChecked />
      </Field>

      <div className="grid gap-2">
        <Button type="submit" variant="solid" className="w-full">
          Request transfer
        </Button>
        <p aria-live="polite" className="min-h-5 text-xs leading-5 text-white/55">
          {status}
        </p>
      </div>
    </form>
  );
}
