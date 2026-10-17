"use client";

import * as React from "react";
import { KeyRound, Smartphone } from "@/components/ui/icons";
import { Tour, type TourStep } from "@/components/ui/tour";

const steps: TourStep[] = [
  {
    title: "Two-factor sign-in",
    body: "Three steps, about two minutes. You’ll need your phone and somewhere safe to keep 10 backup codes.",
  },
  {
    target: "#tour-2fa-app",
    title: "Scan with an authenticator",
    body: "1Password, Authy and Google Authenticator all work. The code changes every 30 seconds.",
    side: "right",
  },
  {
    target: "#tour-2fa-codes",
    title: "Save your backup codes",
    body: "Each one works once. They’re the only way in if you lose the phone.",
    side: "right",
  },
  {
    target: "#tour-2fa-enforce",
    title: "Require it for the team",
    body: "Members without two-factor are signed out at their next request and asked to set it up.",
    side: "top",
  },
];

const titles = ["Intro", "Authenticator", "Backup codes", "Team policy"];

export default function TourControlled() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  return (
    <div className="grid w-full max-w-xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ol aria-label="Tour progress" className="flex flex-wrap items-center gap-1 text-[12.5px]">
          {titles.map((title, i) => (
            <li key={title}>
              <button
                type="button"
                onClick={() => {
                  setStep(i);
                  setOpen(true);
                }}
                aria-current={open && step === i ? "step" : undefined}
                className="whitespace-nowrap rounded-md px-2 py-1 text-white/50 outline-none hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] aria-[current=step]:bg-[rgb(var(--neon)/0.1)] aria-[current=step]:text-[rgb(var(--neon))]"
              >
                {title}
              </button>
            </li>
          ))}
        </ol>
        <span className="font-mono text-[12px] tabular-nums text-white/45">step={step}</span>
      </div>

      <section className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div id="tour-2fa-app" className="flex items-center gap-3 rounded-lg border border-white/[0.07] p-3">
          <Smartphone aria-hidden className="size-5 shrink-0 text-white/50" />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] text-white/85">Authenticator app</p>
            <p className="text-[12.5px] text-white/45">Not set up</p>
          </div>
          <span className="rounded-md border border-white/10 px-2.5 py-1 text-[12.5px] text-white/70">Set up</span>
        </div>
        <div id="tour-2fa-codes" className="flex items-center gap-3 rounded-lg border border-white/[0.07] p-3">
          <KeyRound aria-hidden className="size-5 shrink-0 text-white/50" />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] text-white/85">Backup codes</p>
            <p className="text-[12.5px] text-white/45">10 codes, generated after setup</p>
          </div>
        </div>
        <div id="tour-2fa-enforce" className="flex items-center justify-between gap-3 rounded-lg px-3 py-2">
          <p className="text-[13.5px] text-white/70">Require two-factor for all 14 members</p>
          <span aria-hidden className="h-5 w-9 rounded-full bg-white/10" />
        </div>
      </section>

      <Tour steps={steps} open={open} onOpenChange={setOpen} step={step} onStepChange={setStep} />
    </div>
  );
}
