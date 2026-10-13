"use client";

import * as React from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const STATS = [
  { value: "4.1 PB", label: "archived" },
  { value: "212", label: "institutions" },
  { value: "9 s", label: "to mint a DOI" },
];
const RECENT = {
  doi: "10.58213/sb.81424",
  title: "Soil microbiome transects, Kenyan highlands, 2019–2024",
  size: "38.2 GB",
  downloads: "1,204",
};
const DOI_PREFIX = "10.58213/sb";
const LEVELS = ["Too short", "Weak", "Weak", "Fair", "Good", "Strong"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { name?: string; email?: string; password?: string; terms?: string };

function rulesFor(password: string, name: string, email: string) {
  const lower = password.toLowerCase();
  const personal = [...name.toLowerCase().split(/\s+/), email.toLowerCase().split("@")[0]].filter((w) => w.length > 2);
  return [
    { label: "12 or more characters", met: password.length >= 12 },
    { label: "Upper and lower case", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", met: /\d/.test(password) },
    { label: "A symbol", met: /[^a-zA-Z0-9\s]/.test(password) },
    { label: "Not your name or email", met: password.length > 0 && !personal.some((w) => lower.includes(w)) },
  ];
}

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "researcher";
}

function Tube({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-[3px] w-3.5 shrink-0 rounded-full transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none",
        lit
          ? "bg-[color-mix(in_srgb,rgb(var(--neon))_35%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.6)]"
          : "bg-[rgb(var(--neon)/0.14)]",
      )}
    />
  );
}

export default function AuthSignUp() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const rules = rulesFor(password, name, email);
  const met = rules.filter((r) => r.met).length;
  const score = password ? met / rules.length : 0;
  const level = !password ? "" : password.length < 8 ? LEVELS[0] : LEVELS[met];

  function clear(field: keyof Errors) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Your name goes on every citation.";
    if (!EMAIL.test(email.trim())) next.email = email ? "That doesn't look like an email address." : "Enter your institution email.";
    if (!rules[0].met || met < 4) next.password = "Meet the length rule and at least three others.";
    if (!terms) next.terms = "You'll need to accept the deposit terms.";
    setErrors(next);
    const first = (["name", "email", "password", "terms"] as const).find((k) => next[k]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("loading");
    timer.current = setTimeout(() => setStatus("done"), 1300);
  }

  function reset() {
    setStatus("idle");
    setPassword("");
    setTerms(false);
  }

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("green")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-14 text-white/90 sm:px-10 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1160px] gap-12 lg:grid-cols-[1fr_440px] lg:items-start lg:gap-20">
        <div className="max-w-[560px] lg:pt-16">
          <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 text-[rgb(var(--neon))]" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 14V7" strokeLinecap="round" />
              <path d="M8 8.5C8 5.5 6 3.5 3 3.5c0 3 2 5 5 5ZM8 7c0-2.5 1.7-4.5 5-4.5 0 2.8-1.9 4.5-5 4.5Z" />
            </svg>
            Seedbank · open research data
          </p>
          <h1 className="mt-6 text-[clamp(2.75rem,6.4vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            Deposit once.
            <br />
            <span className="text-white/45">Cite it forever.</span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-white/55">
            Every dataset gets a DOI the moment it lands, a checksum on every file and a mirror on two continents. Free
            up to 50 GB per researcher.
          </p>

          <dl className="mt-10 grid grid-cols-3 border-y border-white/[0.08]">
            {STATS.map((s, i) => (
              <div key={s.label} className={cn("py-5", i > 0 && "border-l border-white/[0.08] pl-4 sm:pl-6")}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-[clamp(1.375rem,3vw,1.875rem)] font-semibold tracking-[-0.03em] tabular-nums">{s.value}</dd>
                <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/40">{s.label}</dd>
              </div>
            ))}
          </dl>

          <figure className="mt-8 hidden gap-2 sm:grid">
            <figcaption className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">Deposited this morning</figcaption>
            <div className="flex items-baseline justify-between gap-6 text-sm">
              <span className="text-white/80">{RECENT.title}</span>
              <span className="shrink-0 font-mono text-xs text-white/40">{RECENT.size}</span>
            </div>
            <div className="flex items-baseline justify-between gap-6 font-mono text-xs">
              <span className="text-[rgb(var(--neon))]">doi:{RECENT.doi}</span>
              <span className="text-white/40">{RECENT.downloads} downloads</span>
            </div>
          </figure>
        </div>

        <div className="relative isolate w-full max-w-[560px] lg:max-w-none">
          {/* The meter's light spills onto the wall behind the card as the password gets stronger */}
          <div
            aria-hidden
            style={{ opacity: status === "done" ? 1 : score * 0.9 }}
            className="absolute -inset-x-8 bottom-[10%] top-[30%] -z-10 rounded-full bg-[rgb(var(--neon)/0.16)] blur-[80px] transition-opacity duration-500"
          />
          <div className="rounded-[20px] border border-white/10 bg-[#0a0b11] p-6 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] sm:p-8">
            {status === "done" ? (
              <div aria-live="polite" className="grid gap-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[rgb(var(--neon))]">Account created</p>
                <h2 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.035em]">
                  Check your inbox, {name.trim().split(/\s+/)[0]}.
                </h2>
                <p className="text-[15px] leading-relaxed text-white/55">
                  We sent a confirmation link to <span className="text-white/90">{email}</span>. Your deposit prefix is
                  already reserved:
                </p>
                <p className="rounded-xl border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.06)] px-4 py-3 font-mono text-sm text-[rgb(var(--neon))] [overflow-wrap:anywhere]">
                  {DOI_PREFIX}.{slugify(name)}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Button variant="solid">
                    Start a deposit <ArrowRight />
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    Use another email
                  </Button>
                </div>
              </div>
            ) : (
              <form ref={formRef} noValidate onSubmit={handleSubmit} className="grid gap-5">
                <div className="mb-1 flex items-baseline justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-[-0.02em]">Create an account</h2>
                  <a href="#sign-in" className="text-[13px] text-white/55 transition-colors hover:text-[rgb(var(--neon))]">
                    Sign in instead
                  </a>
                </div>
                <Input
                  name="name"
                  label="Full name"
                  autoComplete="name"
                  placeholder="Amara Osei"
                  value={name}
                  error={errors.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clear("name");
                  }}
                />
                <Input
                  name="email"
                  type="email"
                  label="Institution email"
                  autoComplete="email"
                  placeholder="a.osei@ug.edu.gh"
                  description="Joins your institution's group automatically."
                  value={email}
                  error={errors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clear("email");
                  }}
                />
                <div className="grid gap-3">
                  <Input
                    name="password"
                    type={reveal ? "text" : "password"}
                    label="Password"
                    autoComplete="new-password"
                    value={password}
                    error={errors.password}
                    aria-describedby="seedbank-rules"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clear("password");
                    }}
                    trailing={
                      <button
                        type="button"
                        aria-label={reveal ? "Hide password" : "Show password"}
                        aria-pressed={reveal}
                        onClick={() => setReveal((r) => !r)}
                        className="-mr-1.5 grid size-7 place-items-center rounded-md text-white/45 outline-none transition-colors hover:text-white/90 focus-visible:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                      >
                        {reveal ? <EyeOff /> : <Eye />}
                      </button>
                    }
                  />
                  <div className="grid gap-2">
                    <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
                      <span className="text-white/40">Strength</span>
                      <span aria-live="polite" className={score >= 0.8 ? "text-[rgb(var(--neon))]" : "text-white/70"}>
                        {level}
                      </span>
                    </div>
                    <Meter
                      value={score}
                      peak={false}
                      segments={20}
                      size="sm"
                      zones={[{ from: 0, color: "red" }, { from: 0.4, color: "amber" }, { from: 0.8 }]}
                      aria-label="Password strength"
                      className="w-full"
                    />
                  </div>
                  <ul id="seedbank-rules" className="grid gap-x-4 gap-y-2 pt-1 text-[13px] sm:grid-cols-2">
                    {rules.map((rule) => (
                      <li key={rule.label} className="flex items-center gap-2.5">
                        <Tube lit={rule.met} />
                        <span className={cn("transition-colors duration-200", rule.met ? "text-white/85" : "text-white/40")}>
                          {rule.label}
                          <span className="sr-only">{rule.met ? ", met" : ", not met"}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid gap-1.5 border-t border-white/[0.06] pt-5">
                  <Checkbox
                    name="terms"
                    size="sm"
                    checked={terms}
                    onCheckedChange={(v) => {
                      setTerms(v);
                      clear("terms");
                    }}
                    aria-invalid={errors.terms ? true : undefined}
                    label={
                      <span className="text-white/70">
                        I accept the{" "}
                        <a href="#terms" className="text-white/90 underline decoration-white/25 underline-offset-4 hover:decoration-[rgb(var(--neon))]">
                          deposit terms
                        </a>{" "}
                        and CC BY 4.0 as my default licence.
                      </span>
                    }
                  />
                  {errors.terms && <p className="pl-[26px] text-xs text-[#ff4d5e]">{errors.terms}</p>}
                </div>
                <Button type="submit" variant="solid" size="lg" loading={status === "loading"} className="w-full">
                  {status === "loading" ? "Reserving your prefix" : "Create account"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
