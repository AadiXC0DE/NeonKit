"use client";

import * as React from "react";
import { Check, Copy } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

const apiKey = "nk_live_51Hx9Q2eZvKYlo2C8Nf3";

export default function InputStates() {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid w-full max-w-sm gap-5">
      <Input
        label="Secret key"
        description="Read-only. Roll the key from the dashboard if it leaks."
        value={apiKey}
        readOnly
        className="font-mono"
        onFocus={(event) => event.currentTarget.select()}
        trailing={
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy secret key"}
            className="-mr-1.5 grid size-7 cursor-pointer place-items-center rounded-md text-white/40 outline-none transition-colors hover:text-white/80 focus-visible:bg-[rgb(var(--neon)/0.12)] focus-visible:text-[rgb(var(--neon))]"
          >
            {copied ? <Check className="text-[#34d399]" /> : <Copy />}
          </button>
        }
      />
      <Input
        label="Billing email"
        description="Managed by your organization owner."
        defaultValue="billing@northwind.io"
        disabled
      />
    </div>
  );
}
