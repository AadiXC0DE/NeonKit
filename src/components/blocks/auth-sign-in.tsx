"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Starfield } from "@/components/ui/starfield";
import { neonVars } from "@/lib/neon";

const TELEMETRY = [
  { label: "Alt", value: "512 km" },
  { label: "Incl", value: "97.4°" },
  { label: "GSD", value: "0.5 m" },
  { label: "Revisit", value: "6 h" },
];
const DOWNLINK_SECONDS = 4 * 60 + 12;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type View = "sign-in" | "reset";
type Status = "idle" | "loading" | "done";

const css = `
@keyframes nk-auth-sign-in-x { from { transform: translateX(-46%); } to { transform: translateX(46%); } }
@keyframes nk-auth-sign-in-y { from { transform: translateY(-50%); } to { transform: translateY(50%); } }
.nk-auth-sign-in-x { animation: nk-auth-sign-in-x 9s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate; }
.nk-auth-sign-in-y { animation: nk-auth-sign-in-y 9s cubic-bezier(0.37, 0, 0.63, 1) -4.5s infinite alternate; }
@media (prefers-reduced-motion: reduce) {
  .nk-auth-sign-in-x { animation: none; transform: translateX(18%); }
  .nk-auth-sign-in-y { animation: none; transform: translateY(-42%); }
}
`;

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em] text-white/90">
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none">
        <circle cx="12" cy="12" r="4" fill="rgb(var(--neon))" />
        <ellipse cx="12" cy="12" rx="10.5" ry="4.2" transform="rotate(-24 12 12)" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      </svg>
      orbital
    </span>
  );
}

function GithubMark() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function OrbitArt() {
  const [left, setLeft] = React.useState(DOWNLINK_SECONDS);

  React.useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s <= 0 ? DOWNLINK_SECONDS : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="relative isolate hidden overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#030408] lg:flex lg:flex-col">
      <Starfield density={5} speed={0.25} parallax={14} tint={0.14} className="-z-20" />

      {/* The planet: a dark disc whose limb is lit by the atmosphere */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[54%] -z-10 aspect-square w-[200%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_0%,#0b1820,#05080d_22%,#030408_45%)]"
        style={{
          boxShadow:
            "0 -1px 0 color-mix(in srgb, rgb(var(--neon)) 35%, white), 0 -3px 10px rgb(var(--neon) / 0.55), 0 -18px 60px rgb(var(--neon) / 0.22), 0 -60px 160px rgb(var(--neon) / 0.1), inset 0 14px 40px rgb(var(--neon) / 0.12)",
        }}
      />

      {/* Orbit track and the satellite riding it */}
      <svg aria-hidden viewBox="0 0 600 220" preserveAspectRatio="none" className="absolute inset-x-[6%] top-[26%] -z-20 h-[32%] w-[88%] overflow-visible">
        <ellipse cx="300" cy="110" rx="300" ry="110" fill="none" stroke="rgb(var(--neon) / 0.22)" strokeWidth="1" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div aria-hidden className="absolute inset-x-[6%] top-[26%] -z-20 flex h-[32%] justify-center">
        <div className="nk-auth-sign-in-x flex h-full w-full justify-center">
          <div className="nk-auth-sign-in-y flex h-full items-center">
            <span className="relative block size-1.5 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_14px_3px_rgb(var(--neon)/0.6),0_0_40px_8px_rgb(var(--neon)/0.2)]" />
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between p-8">
        <Wordmark />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">ORB-7 · SSO</span>
      </div>

      <div className="mt-auto grid gap-6 p-8">
        <p className="max-w-[28ch] text-balance text-[32px] font-medium leading-[1.05] tracking-[-0.035em] text-white/90">
          Fresh tiles over the Atacama, 41 minutes after the pass.
        </p>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-white/[0.08] pt-5 font-mono text-[11px] uppercase tracking-[0.16em]">
          <dl className="flex gap-6">
            {TELEMETRY.map((t) => (
              <div key={t.label} className="grid gap-1">
                <dt className="text-white/55">{t.label}</dt>
                <dd className="text-white/80">{t.value}</dd>
              </div>
            ))}
          </dl>
          <p className="grid gap-1 text-right">
            <span className="text-white/55">Next downlink</span>
            <span className="tabular-nums text-[rgb(var(--neon))]">T-{clock}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthSignIn() {
  const [view, setView] = React.useState<View>("sign-in");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [provider, setProvider] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  // Switching views unmounts the button that was pressed, so move focus to the new title instead of <body>.
  const moveFocus = React.useRef(false);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    titleRef.current?.focus();
  }, [view, status]);

  function finishAfter(ms: number) {
    setStatus("loading");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      moveFocus.current = true;
      setStatus("done");
    }, ms);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL.test(email.trim())) next.email = email ? "That doesn't look like an email address." : "Enter your work email.";
    if (view === "sign-in" && password.length < 8) next.password = password ? "Passwords here are at least 8 characters." : "Enter your password.";
    setErrors(next);
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();
    setProvider(null);
    finishAfter(1100);
  }

  function startOver(nextView: View) {
    clearTimeout(timer.current);
    moveFocus.current = true;
    setView(nextView);
    setStatus("idle");
    setProvider(null);
    setErrors({});
    setPassword("");
    setReveal(false);
  }

  const busy = status === "loading";

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate grid min-h-[100svh] overflow-hidden bg-[#05060a] p-3 text-white/90 lg:min-h-[max(820px,100svh)] lg:grid-cols-[1.08fr_1fr]"
    >
      <style>{css}</style>
      {/* Below lg the art panel is gone; a faint horizon keeps the mood */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[calc(100%-26px)] -z-10 aspect-square w-[260%] -translate-x-1/2 rounded-full bg-[#04060a] opacity-70 lg:hidden"
        style={{ boxShadow: "0 -1px 0 rgb(var(--neon) / 0.55), 0 -10px 40px rgb(var(--neon) / 0.16), 0 -50px 120px rgb(var(--neon) / 0.07)" }}
      />
      <OrbitArt />

      <main className="flex flex-col px-5 pb-12 pt-6 sm:px-10 lg:px-16 lg:pb-6">
        <header className="flex items-center justify-between gap-4 text-sm">
          <span className="lg:invisible">
            <Wordmark />
          </span>
          <a
            href="#request-access"
            className="-my-2 rounded-md py-2 text-white/60 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            New to Orbital? <span className="text-[rgb(var(--neon))]">Request access</span>
          </a>
        </header>

        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-14">
          {status === "done" ? (
            <div aria-live="polite" className="grid gap-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[rgb(var(--neon))]">
                {view === "reset" ? "Link sent" : "Signed in"}
              </p>
              <h1 ref={titleRef} tabIndex={-1} className="text-[40px] font-semibold leading-[1] tracking-[-0.04em] outline-none">
                {view === "reset" ? "Check your inbox." : "Welcome back."}
              </h1>
              {view === "reset" ? (
                <p className="text-[15px] leading-relaxed text-white/55">
                  We sent a reset link to <span className="text-white/90 [overflow-wrap:anywhere]">{email}</span>. It works once, for 30 minutes.
                </p>
              ) : (
                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">{provider ? `Signed in with ${provider}` : email}</span>
                    <span aria-hidden className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
                  </div>
                  <div className="flex items-baseline justify-between border-t border-white/[0.06] pt-3">
                    <span className="text-white/90">Atacama North</span>
                    <span className="font-mono text-xs text-white/55">3 new captures</span>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button variant="solid" onClick={() => startOver("sign-in")}>
                  {view === "reset" ? "Back to sign in" : "Open console"} <ArrowRight />
                </Button>
                {view === "sign-in" && (
                  <Button variant="ghost" onClick={() => startOver("sign-in")}>
                    Sign out
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {view === "reset" && (
                <button
                  type="button"
                  onClick={() => startOver("sign-in")}
                  className="-my-2 mb-4 inline-flex w-fit items-center gap-1.5 rounded-md py-2 text-sm text-white/60 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                >
                  <ArrowLeft className="size-4" /> Back to sign in
                </button>
              )}
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                {view === "reset" ? "Account recovery" : "Operator console"}
              </p>
              <h1 ref={titleRef} tabIndex={-1} className="text-[40px] font-semibold leading-[1] tracking-[-0.04em] outline-none">
                {view === "reset" ? "Reset your password" : "Sign in"}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-white/55">
                {view === "reset"
                  ? "Enter the email on your account and we'll send a one-time link."
                  : "Tasking, archive and the 0.5 m catalogue, all behind one login."}
              </p>

              {view === "sign-in" && (
                <>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {[
                      { name: "GitHub", icon: <GithubMark /> },
                      { name: "Google", icon: <GoogleMark /> },
                    ].map((p) => (
                      <Button
                        key={p.name}
                        type="button"
                        variant="ghost"
                        loading={busy && provider === p.name}
                        disabled={busy}
                        onClick={() => {
                          setProvider(p.name);
                          finishAfter(900);
                        }}
                        className="border border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20"
                      >
                        {!(busy && provider === p.name) && p.icon}
                        {p.name}
                      </Button>
                    ))}
                  </div>
                  <div className="my-7 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                    <span aria-hidden className="h-px flex-1 bg-white/[0.08]" />
                    or with email
                    <span aria-hidden className="h-px flex-1 bg-white/[0.08]" />
                  </div>
                </>
              )}

              <form noValidate onSubmit={handleSubmit} className={view === "reset" ? "mt-8 grid gap-5" : "grid gap-5"}>
                <Input
                  ref={emailRef}
                  type="email"
                  name="email"
                  label="Work email"
                  autoComplete="email"
                  placeholder="ines@lumenfield.co"
                  value={email}
                  error={errors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
                  }}
                />
                {view === "sign-in" && (
                  <>
                    <Input
                      ref={passwordRef}
                      type={reveal ? "text" : "password"}
                      name="password"
                      label="Password"
                      autoComplete="current-password"
                      placeholder="At least 8 characters"
                      value={password}
                      error={errors.password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((x) => ({ ...x, password: undefined }));
                      }}
                      trailing={
                        <button
                          type="button"
                          aria-label={reveal ? "Hide password" : "Show password"}
                          aria-pressed={reveal}
                          onClick={() => setReveal((r) => !r)}
                          className="-mr-2.5 grid size-9 place-items-center rounded-md text-white/45 outline-none transition-colors hover:text-white/90 focus-visible:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                        >
                          {reveal ? <EyeOff /> : <Eye />}
                        </button>
                      }
                    />
                    <div className="flex items-center justify-between gap-4">
                      <Checkbox size="sm" checked={remember} onCheckedChange={setRemember} label="Keep me signed in" />
                      <button
                        type="button"
                        onClick={() => startOver("reset")}
                        className="-my-2 rounded-md py-2 text-[13px] text-white/60 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </>
                )}
                <Button type="submit" variant="solid" size="lg" loading={busy && !provider} disabled={busy} className="mt-1 w-full">
                  {view === "reset" ? "Send reset link" : busy && !provider ? "Signing in" : "Sign in"}
                </Button>
              </form>
            </>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          <span>© 2026 Orbital Earth Data</span>
          <span className="flex gap-5">
            <a href="#terms" className="-my-2 rounded-md py-2 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">Terms</a>
            <a href="#privacy" className="-my-2 rounded-md py-2 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">Privacy</a>
            <a href="#status" className="-my-2 rounded-md py-2 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">Status</a>
          </span>
        </footer>
      </main>
    </section>
  );
}
