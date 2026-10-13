"use client";

import * as React from "react";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OTPInput } from "@/components/ui/otp-input";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const ACCOUNT = "m.okafor@tessellate.io";
const DEVICE = "Pixel 8 ··42";
const SESSION = { device: "Chrome on macOS", place: "Lisbon, PT", time: "10:42" };
const TRUSTED_UNTIL = "12 Nov 2026";
const WRONG_CODE = "000000";
const RESEND_AFTER = 30;
const ATTEMPTS = 5;

type State = "idle" | "checking" | "error" | "done";

// An arch of nine voussoirs; the middle one is the keystone and the only tube.
const CX = 160;
const CY = 168;
function stone(a0: number, a1: number, r0: number, r1: number) {
  const p = (r: number, a: number) => {
    const rad = (a * Math.PI) / 180;
    return `${(CX + r * Math.cos(rad)).toFixed(1)} ${(CY - r * Math.sin(rad)).toFixed(1)}`;
  };
  return `M${p(r1, a0)} L${p(r1, a1)} L${p(r0, a1)} L${p(r0, a0)} Z`;
}
const STONES = Array.from({ length: 9 }, (_, i) => {
  const a0 = 180 - i * 20 - 0.9;
  const a1 = 180 - (i + 1) * 20 + 0.9;
  return i === 4 ? stone(a0, a1, 62, 132) : stone(a0, a1, 70, 120);
});

const css = `
@keyframes nk-auth-verify-ignite { 0% { opacity: 0 } 10% { opacity: 1 } 18% { opacity: 0.15 } 32% { opacity: 0.9 } 40% { opacity: 0.3 } 58%, 100% { opacity: 1 } }
@keyframes nk-auth-verify-check { 0%, 100% { opacity: 0.12 } 50% { opacity: 0.5 } }
@keyframes nk-auth-verify-fault { 0% { opacity: 0 } 8% { opacity: 1 } 22% { opacity: 0.2 } 34% { opacity: 1 } 100% { opacity: 0 } }
.nk-auth-verify-done { animation: nk-auth-verify-ignite 900ms linear both; }
.nk-auth-verify-checking { animation: nk-auth-verify-check 700ms ease-in-out infinite; }
.nk-auth-verify-error { animation: nk-auth-verify-fault 1100ms linear both; }
@media (prefers-reduced-motion: reduce) {
  .nk-auth-verify-done { animation: none; opacity: 1; }
  .nk-auth-verify-checking { animation: none; opacity: 0.35; }
  .nk-auth-verify-error { animation: none; opacity: 0.8; }
}
`;

function Arch({ state, flashes }: { state: State; flashes: number }) {
  const lit = state === "done";
  return (
    <svg viewBox="0 0 320 250" aria-hidden className="w-full max-w-[240px] overflow-visible sm:max-w-[300px] lg:max-w-[480px]">
      {STONES.map((d, i) =>
        i === 4 ? null : (
          <path
            key={i}
            d={d}
            fill={lit ? "rgb(var(--neon) / 0.05)" : "rgb(255 255 255 / 0.015)"}
            stroke={lit ? "rgb(var(--neon) / 0.35)" : "rgb(255 255 255 / 0.1)"}
            strokeWidth="1"
            className="transition-[fill,stroke] duration-700"
          />
        ),
      )}
      {[40, 230].map((x) => (
        <g key={x} fill="rgb(255 255 255 / 0.015)" stroke="rgb(255 255 255 / 0.08)" strokeWidth="1">
          <rect x={x} y={170} width="50" height="34" />
          <rect x={x} y={206} width="50" height="34" />
        </g>
      ))}
      <path d={STONES[4]} fill="none" strokeWidth="3.5" strokeLinejoin="round" style={{ stroke: "rgb(var(--neon) / 0.16)" }} />
      {state !== "idle" && (
        <g
          key={`${state}-${flashes}`}
          className={`nk-auth-verify-${state}`}
          style={{
            ...(state === "error" ? { "--neon": "255 77 94" } : {}),
            filter: "drop-shadow(0 0 2px rgb(var(--neon))) drop-shadow(0 0 8px rgb(var(--neon) / 0.8)) drop-shadow(0 0 22px rgb(var(--neon) / 0.45))",
          } as React.CSSProperties}
        >
          <path d={STONES[4]} fill="none" strokeWidth="3.5" strokeLinejoin="round" style={{ stroke: "color-mix(in srgb, rgb(var(--neon)) 30%, white)" }} />
        </g>
      )}
    </svg>
  );
}

export default function AuthVerify() {
  const [backup, setBackup] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [state, setState] = React.useState<State>("idle");
  const [flashes, setFlashes] = React.useState(0);
  const [attempts, setAttempts] = React.useState(ATTEMPTS);
  const [remember, setRemember] = React.useState(true);
  const [wait, setWait] = React.useState(RESEND_AFTER);
  const [resent, setResent] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const otpRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  // The code boxes are disabled while checking and the form swaps for the success panel,
  // both of which drop focus on <body>. Put it back where the next step happens.
  const focusNext = React.useRef<"otp" | "title" | null>(null);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  React.useEffect(() => {
    if (!focusNext.current) return;
    if (focusNext.current === "title") titleRef.current?.focus();
    else otpRef.current?.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus();
    focusNext.current = null;
  });

  React.useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const length = backup ? 8 : 6;
  const locked = attempts <= 0;

  function verify(value: string) {
    if (value.length < length || state === "checking" || locked) return;
    setState("checking");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      focusNext.current = value === WRONG_CODE ? "otp" : "title";
      if (value === WRONG_CODE) {
        setState("error");
        setFlashes((n) => n + 1);
        setAttempts((n) => n - 1);
      } else {
        setState("done");
      }
    }, 750);
  }

  function switchMode() {
    setBackup((b) => !b);
    setCode("");
    setState("idle");
  }

  function startOver() {
    focusNext.current = "otp";
    setCode("");
    setState("idle");
    setAttempts(ATTEMPTS);
  }

  const status =
    state === "done" ? "Unlocked" : state === "checking" ? "Checking" : state === "error" ? "Rejected" : "Locked";

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="relative isolate flex min-h-[100svh] flex-col bg-[#05060a] px-5 py-6 text-white/90 sm:px-10 lg:min-h-[max(760px,100svh)]"
    >
      <style>{css}</style>
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <span className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="rgb(var(--neon))" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M5 3h10l-2.5 14h-5Z" />
          </svg>
          keystone
        </span>
        <p className="text-[13px] text-white/60">
          {ACCOUNT} ·{" "}
          <a href="#switch-account" className="-my-2 inline-block rounded-md py-2 text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white/90">
            Not you?
          </a>
        </p>
      </header>

      <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-10 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
        {/* The arch is the lock: the keystone lights when the code checks out. */}
        <div className="relative isolate flex flex-col items-center gap-8 lg:col-span-6 lg:items-start">
          <div
            aria-hidden
            className={cn(
              "absolute left-1/2 top-[22%] -z-10 h-56 w-80 -translate-x-1/2 rounded-full bg-[rgb(var(--neon)/0.22)] blur-[80px] transition-opacity duration-700",
              state === "done" ? "opacity-100" : "opacity-0",
            )}
          />
          <div className="flex w-full justify-center border-b border-white/[0.08] pb-px">
            <Arch state={state} flashes={flashes} />
          </div>
          <div className="grid w-full gap-1.5 text-[13px]">
              <p className="flex items-center justify-between">
                <span className="text-white/55">This sign-in</span>
                <span
                  aria-live="polite"
                  className={cn(
                    "transition-colors",
                    state === "done" && "text-[rgb(var(--neon))]",
                    state === "error" && "text-[#ff4d5e]",
                    (state === "idle" || state === "checking") && "text-white/70",
                  )}
                >
                  {status}
                </span>
              </p>
              <p className="flex flex-wrap gap-x-2 text-white/55">
                {SESSION.device} in {SESSION.place}, at <span className="font-mono tabular-nums text-white/70">{SESSION.time}</span>
              </p>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[460px] flex-col justify-center lg:col-span-5 lg:col-start-8 lg:mx-0 lg:min-h-[520px]">
            {state === "done" ? (
              <div className="grid gap-5 py-6">
                <h1
                  ref={titleRef}
                  tabIndex={-1}
                  className="text-[clamp(2.75rem,6vw,4.25rem)] font-[620] leading-[0.96] tracking-[-0.04em] outline-none [font-stretch:112%]"
                >
                  You&apos;re in.
                </h1>
                <p className="max-w-[36ch] text-[17px] leading-[1.6] text-white/60">
                  {remember
                    ? `This browser is trusted until ${TRUSTED_UNTIL}. We'll ask again after that, or from anywhere new.`
                    : "We'll ask for a code again next time you sign in from this browser."}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Button variant="solid">
                    Continue to Tessellate <ArrowRight />
                  </Button>
                  <Button variant="ghost" onClick={startOver}>
                    Verify again
                  </Button>
                </div>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  verify(code);
                }}
                className="grid gap-6"
              >
                <div>
                  <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-[620] leading-[0.98] tracking-[-0.04em] [font-stretch:112%]">
                    {backup ? "Use a backup code" : "Enter the code from your phone"}
                  </h1>
                  <p className="mt-4 max-w-[40ch] text-[16px] leading-[1.55] text-white/60">
                    <span className="text-white/90">Password accepted.</span>{" "}
                    {backup
                      ? "Now one of the eight-character codes you saved when you turned on two-factor. Each works once."
                      : `Open Keystone on ${DEVICE} and type the code shown for tessellate.io.`}
                  </p>
                </div>

                <div className="grid gap-2.5">
                  <OTPInput
                    ref={otpRef}
                    key={backup ? "backup" : "totp"}
                    length={length}
                    groupSize={backup ? 4 : 3}
                    mode={backup ? "alphanumeric" : "numeric"}
                    size={backup ? "md" : "lg"}
                    aria-label={backup ? "Backup code" : "Verification code"}
                    value={code}
                    invalid={state === "error"}
                    disabled={state === "checking" || locked}
                    onValueChange={(v) => {
                      setCode(v.toUpperCase());
                      if (state === "error") setState("idle");
                    }}
                    onComplete={(v) => verify(v.toUpperCase())}
                    className={cn(
                      "max-w-full",
                      backup ? "gap-1.5 [&_input]:w-[clamp(1.75rem,7.4vw,2.5rem)]" : "[&_input]:w-[clamp(2.25rem,9.6vw,3.25rem)]",
                    )}
                  />
                  <p aria-live="polite" className={cn("min-h-5 text-[13px]", state === "error" || locked ? "text-[#ff4d5e]" : "text-white/60")}>
                    {locked
                      ? "Too many attempts. Try again in 15 minutes."
                      : state === "error"
                        ? `That code didn't match. ${attempts} ${attempts === 1 ? "attempt" : "attempts"} left.`
                        : state === "checking"
                          ? "Checking…"
                          : backup
                            ? "Demo: any 8 characters work."
                            : `Demo: any code works except ${WRONG_CODE}.`}
                  </p>
                </div>

                <Checkbox size="sm" checked={remember} onCheckedChange={setRemember} label="Trust this browser for 30 days" />

                <Button type="submit" variant="solid" size="lg" loading={state === "checking"} disabled={code.length < length || locked} className="w-full">
                  Verify
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/[0.06] pt-5 text-[13px]">
                  <span role="status" className="sr-only">
                    {resent && wait > 0 ? "New code sent." : ""}
                  </span>
                  {wait > 0 ? (
                    <span className="text-white/60">
                      {resent ? "New code sent. " : "No code? "}Resend in{" "}
                      <span className="font-mono tabular-nums text-white/70">0:{String(wait).padStart(2, "0")}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        focusNext.current = "otp";
                        setWait(RESEND_AFTER);
                        setResent(true);
                      }}
                      className="-my-2 rounded-md py-2 text-[rgb(var(--neon))] outline-none hover:[text-shadow:0_0_12px_rgb(var(--neon)/0.6)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                    >
                      Resend code
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="-my-2 rounded-md py-2 text-white/60 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    {backup ? "Use the app instead" : "Use a backup code"}
                  </button>
                </div>
              </form>
            )}
          </div>
      </main>
    </section>
  );
}
