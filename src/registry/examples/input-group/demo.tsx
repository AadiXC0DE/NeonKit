"use client";

import * as React from "react";
import { Check, Copy } from "@/components/ui/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export default function InputGroupDemo() {
  const [slug, setSlug] = React.useState("spring-pottery-class");
  const [amount, setAmount] = React.useState("85.00");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <form className="grid min-w-0 w-full max-w-md gap-5" onSubmit={(event) => event.preventDefault()}>
      <div className="grid gap-1.5">
        <label htmlFor="pay-amount" className="text-sm font-medium text-white/80">
          Price
        </label>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText className="text-white/70">€</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id="pay-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="tabular-nums"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>EUR</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="pay-link" className="text-sm font-medium text-white/80">
          Payment link
        </label>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://pay.acme.co/</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id="pay-link"
            value={slug}
            spellCheck={false}
            onChange={(event) => setSlug(event.target.value.replace(/\s+/g, "-").toLowerCase())}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon"
              aria-label={copied ? "Copied" : "Copy link"}
              onClick={() => {
                void navigator.clipboard?.writeText(`https://pay.acme.co/${slug}`).catch(() => {});
                setCopied(true);
              }}
              className={copied ? "text-[rgb(var(--neon))]" : undefined}
            >
              {copied ? <Check /> : <Copy />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p className="text-xs text-white/50" aria-live="polite">
          {copied ? "Link copied." : "Anyone with the link can pay. You can turn it off later."}
        </p>
      </div>
    </form>
  );
}
