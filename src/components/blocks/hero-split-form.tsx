"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OTPInput } from "@/components/ui/otp-input";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const POINTS = [
  "Zero-knowledge. Keys never leave your devices.",
  "Per-vault roles, read-only seats, one-click revoke.",
  "SSO and SCIM on Team, $6 per seat a month.",
];

const STEPS = ["Email", "Verify", "Vault"];

const VERIFY_STEPS = [
  "This browser generates the vault key.",
  "We store the encrypted vault, never the key.",
  "You get a recovery kit to print or save.",
];
const TICKS = 36;

type Step = 0 | 1 | 2;

function Progress({ step }: { step: Step }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Sign-up progress">
      {STEPS.map((label, i) => (
        <li key={label} aria-current={i === step ? "step" : undefined} className="grid gap-2">
          <span
            className={cn(
              "h-[3px] rounded-full transition-[background-color,box-shadow] duration-500",
              i < step && "bg-[rgb(var(--neon)/0.6)]",
              i === step && "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.6)]",
              i > step && "bg-[rgb(var(--neon)/0.14)]",
            )}
          />
          <span className={cn("font-mono text-[10px] uppercase tracking-[0.16em]", i <= step ? "text-white/75" : "text-white/50")}>
            0{i + 1} {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

// The vault door: a ring of ticks that light up in turn around a lock.
function VaultDial() {
  return (
    <div className="relative mx-auto grid size-36 place-items-center">
      <div aria-hidden className="absolute inset-0 rounded-full bg-[rgb(var(--neon)/0.18)] blur-[36px]" />
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0">
        {Array.from({ length: TICKS }, (_, i) => (
          <line
            key={i}
            x1="50"
            y1="4"
            x2="50"
            y2={i % 3 === 0 ? 12 : 9}
            transform={`rotate(${(360 / TICKS) * i} 50 50)`}
            strokeWidth={i % 3 === 0 ? 1.6 : 1}
            strokeLinecap="round"
            className="nk-hero-split-form-tick"
            style={{ animationDelay: `${i * 28}ms` }}
          />
        ))}
        <circle cx="50" cy="50" r="31" fill="#0a0b11" stroke="rgb(var(--neon) / 0.35)" strokeWidth="1" />
      </svg>
      <Lock className="relative size-7 text-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] [filter:drop-shadow(0_0_6px_rgb(var(--neon)))]" />
    </div>
  );
}

function SignupCard() {
  const [step, setStep] = React.useState<Step>(0);
  const [email, setEmail] = React.useState("");
  const [team, setTeam] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; team?: string }>({});
  const [busy, setBusy] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [resendIn, setResendIn] = React.useState(0);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const teamRef = React.useRef<HTMLInputElement>(null);
  const moved = React.useRef(false);

  // Each step replaces the last, so focus moves to the new step's heading. Step 1 focuses its code input itself.
  React.useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    if (step !== 1) headingRef.current?.focus();
  }, [step]);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const slug = team.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "team";

  function sendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = "Enter the email you use for work.";
    if (team.trim().length < 2) next.team = "Give the vault a name, at least 2 characters.";
    setErrors(next);
    if (next.email || next.team) {
      (next.email ? emailRef : teamRef).current?.focus();
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setCode("");
      setResendIn(30);
      setStep(1);
    }, 800);
  }

  function verify(value: string) {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setStep(2);
    }, 900);
    setCode(value);
  }

  return (
    <div className="relative flex flex-col rounded-[20px] border border-white/10 bg-[#0a0b11] p-6 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.04)] sm:p-8 lg:min-h-[540px]">
      <Progress step={step} />

      <div aria-live="polite" className="mt-8 flex flex-1 flex-col">
        {step === 0 && (
          <form onSubmit={sendCode} noValidate className="flex flex-1 flex-col gap-5">
            <div>
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-[-0.02em] text-white/90 outline-none">
                Create a team vault
              </h2>
              <p className="mt-1 text-sm text-white/60">Free for 3 people. No card.</p>
            </div>
            <Input
              ref={emailRef}
              label="Work email"
              type="email"
              autoComplete="email"
              placeholder="ana@quayside.co"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              error={errors.email}
            />
            <Input
              ref={teamRef}
              label="Vault name"
              placeholder="Quayside Ops"
              value={team}
              onChange={(event) => {
                setTeam(event.target.value);
                if (errors.team) setErrors((e) => ({ ...e, team: undefined }));
              }}
              error={errors.team}
              description={team.trim() ? `harbor.app/${slug}` : "You can add more vaults later."}
            />
            <Button type="submit" variant="solid" size="lg" loading={busy} className="mt-auto shadow-[0_0_0_1px_rgb(var(--neon)),inset_0_1px_0_rgb(255_255_255/0.45)]">
              Send a code <ArrowRight />
            </Button>
          </form>
        )}

        {step === 1 && (
          <div className="flex flex-1 flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-white/90">Check your inbox</h2>
              <p className="mt-1 text-sm leading-6 text-white/60">
                We sent a 6-digit code to <span className="text-white/85">{email.trim()}</span>.
              </p>
            </div>
            <OTPInput
              autoFocus
              value={code}
              onValueChange={setCode}
              onComplete={verify}
              disabled={busy}
              className="w-full justify-between"
            />
            <p className="font-mono text-[11px] text-white/55">Demo: any six digits work.</p>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">When you verify</p>
              <ol className="mt-3 grid gap-2 text-[13px] leading-5 text-white/60">
                {VERIFY_STEPS.map((text, i) => (
                  <li key={text} className="flex gap-3">
                    <span className="font-mono text-[11px] leading-5 text-[rgb(var(--neon)/0.8)]">0{i + 1}</span>
                    {text}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4 text-sm">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="-my-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md py-2 text-white/60 outline-none hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                <ArrowLeft aria-hidden className="size-3.5" /> Change email
              </button>
              <button
                type="button"
                disabled={resendIn > 0 || busy}
                onClick={() => setResendIn(30)}
                className="-my-2 cursor-pointer rounded-md py-2 text-[rgb(var(--neon))] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] disabled:cursor-default disabled:text-white/35 disabled:no-underline"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid flex-1 content-center gap-6 text-center">
            <VaultDial />
            <div>
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-[-0.02em] text-white/90 outline-none">
                Vault created
              </h2>
              <p className="mt-1 font-mono text-[12px] text-white/60">harbor.app/{slug}</p>
            </div>
            <dl className="grid grid-cols-3 rounded-xl border border-white/[0.07] py-3 text-xs">
              {[
                ["Cipher", "AES-256"],
                ["Members", "1 of 3"],
                ["Recovery", "Kit ready"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col-reverse gap-1">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">{label}</dt>
                  <dd className="text-white/80">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="grid gap-2">
              <Button variant="solid" size="lg" className="shadow-[0_0_0_1px_rgb(var(--neon)),inset_0_1px_0_rgb(255_255_255/0.45)]">
                Invite your team <ArrowRight />
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setEmail("");
                  setTeam("");
                }}
                className="cursor-pointer rounded-md py-2 text-sm text-white/60 outline-none hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeroSplitForm() {
  return (
    <section
      aria-labelledby="harbor-hero-title"
      // Change the color here; everything inside follows it.
      style={neonVars("blue")}
      className="relative isolate overflow-hidden bg-[#05060a] text-white"
    >
      <style>{`
        @keyframes nk-hero-split-form-tick { from { stroke: rgb(var(--neon) / 0.15); } to { stroke: color-mix(in srgb, rgb(var(--neon)) 55%, white); } }
        .nk-hero-split-form-tick { stroke: rgb(var(--neon) / 0.15); animation: nk-hero-split-form-tick 240ms ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .nk-hero-split-form-tick { animation: none; stroke: color-mix(in srgb, rgb(var(--neon)) 55%, white); }
        }
      `}</style>
      <div aria-hidden className="absolute right-0 top-0 -z-10 h-full w-1/2 bg-[radial-gradient(ellipse_70%_60%_at_60%_45%,rgb(var(--neon)/0.1),transparent_70%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_440px] lg:gap-20">
        <div>
          <p className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em] text-white/90">
            <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" strokeWidth={1.7} strokeLinecap="round">
              <path d="M4 13a8 8 0 0 0 16 0M12 21V4M8 7h8" stroke="rgb(255 255 255 / 0.85)" />
              <circle cx="12" cy="3.6" r="1.7" fill="rgb(var(--neon))" style={{ filter: "drop-shadow(0 0 4px rgb(var(--neon)))" }} />
            </svg>
            Harbor
          </p>
          <h1
            id="harbor-hero-title"
            className="mt-10 [text-wrap:balance] text-[clamp(2.75rem,6.4vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white/95"
          >
            Stop pasting passwords into chat.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
            Harbor gives your team one end-to-end encrypted vault, with autofill on every device and an audit log of who
            opened what. We can&apos;t read it, and neither can anyone who breaches us.
          </p>
          <ul className="mt-9 grid gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-white/70">
                <Check aria-hidden className="mt-[3px] size-4 shrink-0 text-[rgb(var(--neon))]" />
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-10 border-t border-white/[0.07] pt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
            2,480 teams · audited by Halyard Security, Aug 2026
          </p>
        </div>

        <SignupCard />
      </div>
    </section>
  );
}
