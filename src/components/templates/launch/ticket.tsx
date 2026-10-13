"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonText } from "@/components/ui/neon-text";
import { cn } from "@/lib/utils";

import { event } from "./config";
import { tiers, type Tier } from "./data";
import { useEvent, type Phase } from "./event-state";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The notches and perforation sit at --cut: across the ticket on wide screens, down it on narrow ones.
const css = `
.nk-launch-ticket {
  --cut: calc(100% - 153px);
  --r: 13px;
  -webkit-mask-image: radial-gradient(circle var(--r) at 0 var(--cut), transparent 97%, #000), radial-gradient(circle var(--r) at 100% var(--cut), transparent 97%, #000);
  mask-image: radial-gradient(circle var(--r) at 0 var(--cut), transparent 97%, #000), radial-gradient(circle var(--r) at 100% var(--cut), transparent 97%, #000);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
@media (min-width: 640px) {
  .nk-launch-ticket {
    --cut: calc(100% - 199px);
    -webkit-mask-image: radial-gradient(circle var(--r) at var(--cut) 0, transparent 97%, #000), radial-gradient(circle var(--r) at var(--cut) 100%, transparent 97%, #000);
    mask-image: radial-gradient(circle var(--r) at var(--cut) 0, transparent 97%, #000), radial-gradient(circle var(--r) at var(--cut) 100%, transparent 97%, #000);
  }
}
`;

function hash(text: string) {
  return Array.from(text).reduce((h, char) => Math.imul(h ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
}

// A seeded pattern with the three finder squares, so it reads as a code without encoding anything.
function QrPlaceholder({ seed, className }: { seed: string; className?: string }) {
  const size = 25;
  const cells = React.useMemo(() => {
    let state = hash(seed);
    const next = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const finder = (x: number, y: number) =>
      [[0, 0], [size - 7, 0], [0, size - 7]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
    const out: string[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!finder(x, y) && next() > 0.52) out.push(`M${x} ${y}h1v1h-1z`);
      }
    }
    return out.join("");
  }, [seed]);

  return (
    <svg aria-hidden viewBox={`-2 -2 ${size + 4} ${size + 4}`} className={cn("rounded-lg bg-[#ecebf2]", className)} shapeRendering="crispEdges">
      {[[0, 0], [size - 7, 0], [0, size - 7]].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="#0a0b11">
          <path d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={x + 2} y={y + 2} width={3} height={3} />
        </g>
      ))}
      <path d={cells} fill="#0a0b11" />
    </svg>
  );
}

function Field({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">{label}</dt>
      <dd className="mt-1 truncate text-[14px] font-medium text-white/90">{value}</dd>
    </div>
  );
}

function TicketArt({ tier, holder, admitted }: { tier: Tier; holder: string; admitted: boolean }) {
  const name = holder.trim();
  const number = `LL27-${tier.id.slice(0, 2).toUpperCase()}-${hash(`${tier.id}:${name.toLowerCase()}`).toString(36).slice(0, 4).toUpperCase()}`;

  return (
    <div className="relative">
      {/* The sign on the ticket lights the table it's lying on. */}
      <div aria-hidden className="absolute -inset-x-6 bottom-[-12%] top-[30%] -z-10 rounded-[50%] bg-[rgb(var(--neon)/0.2)] blur-[70px]" />
      <article
        aria-label={`Ticket preview: ${tier.name}, ${name || "no name yet"}`}
        className="nk-launch-ticket relative flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#0b0b12] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:flex-row"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_12%_0%,rgb(var(--neon)/0.16),transparent_70%),repeating-linear-gradient(0deg,rgb(255_255_255/0.018)_0_1px,transparent_1px_4px)]" />

        <div className="relative min-w-0 flex-1 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <NeonText buzz className="text-[44px] leading-none tracking-[-0.01em] sm:text-[52px]" style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}>
              low light
            </NeonText>
            <p className="shrink-0 pt-1 text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-white/60">
              {event.edition}
              <br />
              <span className="text-[rgb(var(--neon))]">Admit one</span>
            </p>
          </div>
          <p className="mt-3 max-w-[30ch] text-[13px] leading-relaxed text-white/60">One night on interface craft.</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/[0.07] pt-5 sm:grid-cols-[1.25fr_1fr_1fr_1fr]">
            <Field label="Date" value="19 Mar 2027" />
            <Field label="Doors" value={tier.id === "late" ? "21:30" : tier.id === "stream" ? "19:15" : "18:30"} />
            <Field label="Tier" value={tier.name} />
            <Field label="Seat" value={tier.seat} />
            <Field label="Holder" value={name || (admitted ? "Guest no. 214" : <span className="text-white/40">Your name here</span>)} className="col-span-2" />
            <Field label="Venue" value={tier.id === "stream" ? "Wherever you are" : `${event.venue}, Rotterdam`} className="col-span-2" />
          </dl>
        </div>

        <div aria-hidden className="relative mx-[13px] h-0 border-t-2 border-dashed border-white/[0.14] sm:mx-0 sm:my-[13px] sm:h-auto sm:w-0 sm:border-l-2 sm:border-t-0" />

        <div className="relative flex items-center gap-5 p-6 sm:w-[198px] sm:flex-col sm:items-stretch sm:justify-between sm:gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Gate</p>
            <p className={cn("font-semibold leading-none tracking-[-0.03em] text-white", tier.gate.length > 2 ? "text-[20px]" : "text-[30px]")}>{tier.gate}</p>
          </div>
          <QrPlaceholder seed={number} className="order-first size-[104px] shrink-0 sm:order-none sm:aspect-square sm:h-auto sm:w-full" />
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">{tier.price === "Free" ? "Free pass" : tier.price}</p>
            <p className="mt-1 truncate font-mono text-[12px] text-white/80">{number}</p>
          </div>
        </div>

        {admitted && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[60px] left-5 rotate-[-12deg] rounded-lg border-2 border-[rgb(var(--neon)/0.7)] px-3 py-1.5 font-mono text-[13px] font-semibold uppercase tracking-[0.2em] [color:color-mix(in_srgb,rgb(var(--neon))_70%,white)] bg-[#0b0b12]/90 shadow-[0_0_18px_rgb(var(--neon)/0.35)] backdrop-blur-[2px] sm:bottom-auto sm:left-auto sm:right-4 sm:top-[42%]"
          >
            Admitted 18:42
          </div>
        )}
      </article>
    </div>
  );
}

const HEADLINE: Record<Phase, string> = {
  before: "Admit one, after dark.",
  live: "Doors are open.",
  after: "Thanks for coming.",
};

function Picker({ phase, tier, onTier }: { phase: Phase; tier: Tier["id"]; onTier: (id: Tier["id"]) => void }) {
  return (
    <fieldset className="mt-8">
      <legend className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">Choose a ticket</legend>
      <div className="mt-3 grid gap-2">
        {tiers.map((item) => {
          const checked = item.id === tier;
          const stock = phase === "live" && item.id === "late" ? "On the door till 22:00" : item.stock;
          return (
            <label
              key={item.id}
              className={cn(
                "group relative flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-[border-color,background-color,box-shadow] duration-200",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[rgb(var(--neon)/0.6)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#05060a]",
                item.soldOut
                  ? "cursor-not-allowed border-white/[0.06] bg-transparent"
                  : checked
                    ? "border-[rgb(var(--neon)/0.6)] bg-[rgb(var(--neon)/0.06)] shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_24px_-6px_rgb(var(--neon)/0.5)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20",
              )}
            >
              <input
                type="radio"
                name="tier"
                value={item.id}
                checked={checked}
                disabled={item.soldOut}
                onChange={() => onTier(item.id)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                  checked ? "border-[rgb(var(--neon))]" : "border-white/25",
                )}
              >
                {checked && <span className="size-2 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_6px_rgb(var(--neon))]" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("flex items-baseline gap-2 text-[15px] font-medium", item.soldOut ? "text-white/50 line-through decoration-white/30" : "text-white")}>
                  {item.name}
                </span>
                <span className={cn("mt-0.5 block text-[13px] leading-snug", item.soldOut ? "text-white/45" : "text-white/60")}>{item.detail}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className={cn("block text-[15px] font-semibold tabular-nums", item.soldOut ? "text-white/50" : "text-white")}>{item.price}</span>
                <span className={cn("block font-mono text-[10px] uppercase tracking-[0.14em]", item.soldOut ? "text-white/55" : "text-white/60")}>{stock}</span>
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] text-white/60">
        Floor seats are gone.{" "}
        <a href="#waitlist" className="rounded-md text-white/85 underline decoration-white/25 underline-offset-4 outline-none hover:decoration-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
          Take a number for returns
        </a>
        .
      </p>
    </fieldset>
  );
}

function TicketBody({ phase }: { phase: Phase }) {
  const [tierId, setTierId] = React.useState<Tier["id"]>("late");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const tier = tiers.find((item) => item.id === tierId) ?? tiers[1];

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = {
      name: name.trim().length < 2 ? "The name goes on your badge, so we need it." : undefined,
      email: EMAIL.test(email.trim()) ? undefined : email ? "That doesn't look like an email address." : "Where should the ticket go?",
    };
    setErrors(next);
    if (next.name || next.email) {
      document.getElementById(next.name ? "ticket-name" : "ticket-email")?.focus();
      return;
    }
    setStatus("loading");
    timer.current = setTimeout(() => setStatus("done"), 900);
  }

  const doneText =
    tier.id === "stream"
      ? `You're on the stream list. The link goes to ${email.trim()} at 18:00 on the night.`
      : phase === "live"
        ? `Held at the door under ${name.trim()}. Pay at Gate K before 22:00.`
        : `Held for 15 minutes. The payment link is on its way to ${email.trim()}.`;

  return (
    <div className="mx-auto grid max-w-[1176px] items-start gap-14 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">Tickets · Low Light {event.edition}</p>
        <h2
          id="tickets-title"
          className="mt-6 max-w-[11ch] text-balance text-[clamp(2.5rem,5.6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white"
        >
          {HEADLINE[phase]}
        </h2>

        {phase === "after" ? (
          <>
            <p className="mt-6 max-w-[44ch] text-pretty text-[15px] leading-relaxed text-white/65">
              340 of you in the room, 2,904 on the stream, and one cheese toastie shortage we&apos;re still sorry about.
              Dates for 2028 go out to the newsletter in June.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="solid" size="lg">
                <a href={event.replayUrl} target="_blank" rel="noreferrer">
                  Watch the replay <ArrowUpRight aria-hidden />
                </a>
              </Button>
            </div>
          </>
        ) : status === "done" ? (
          <div role="status" className="mt-8 rounded-2xl border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.05)] p-5">
            <p className="flex gap-3 text-[15px] leading-relaxed text-white/85">
              <Check aria-hidden className="mt-1 size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)))]" />
              {doneText}
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-4 rounded-md text-[13px] text-white/60 underline decoration-white/25 underline-offset-4 outline-none hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              Get another ticket
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={submit}>
            <Picker phase={phase} tier={tierId} onTier={setTierId} />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:items-start">
              <Input
                id="ticket-name"
                label="Name on the ticket"
                autoComplete="name"
                placeholder="Mara Lindqvist"
                value={name}
                error={errors.name}
                maxLength={32}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              <Input
                id="ticket-email"
                type="email"
                label="Email"
                autoComplete="email"
                placeholder="mara@studio.com"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button type="submit" variant="solid" size="lg" loading={status === "loading"}>
                {tier.id === "stream" ? "Get a stream pass" : phase === "live" ? `Hold one at the door · ${tier.price}` : `Reserve · ${tier.price}`}
                {status !== "loading" && <ArrowRight aria-hidden />}
              </Button>
              <p className="text-[13px] text-white/60">Name changes are free until 12 March.</p>
            </div>
          </form>
        )}
      </div>

      <div className="lg:col-span-7 lg:pl-6 lg:pt-10">
        <div className="mx-auto max-w-[640px] lg:rotate-[-2.5deg]">
          <TicketArt tier={tier} holder={name} admitted={phase === "after"} />
        </div>
        <p className="mx-auto mt-8 max-w-[640px] text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/55 lg:mt-12">
          {phase === "after"
            ? "Keep it. It's the only merch we made"
            : tier.id === "stream"
              ? "The stream link arrives at 18:00 on the night"
              : `Show the code at Gate ${tier.gate} · Name changes free until 12 Mar`}
        </p>
      </div>
    </div>
  );
}

export function Tickets() {
  const { phase, ready } = useEvent();
  const shown: Phase = ready ? phase : "before";

  return (
    <section
      id="tickets"
      aria-labelledby="tickets-title"
      className="relative isolate scroll-mt-20 overflow-hidden border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32"
    >
      <style>{css}</style>
      <TicketBody key={shown} phase={shown} />
    </section>
  );
}
