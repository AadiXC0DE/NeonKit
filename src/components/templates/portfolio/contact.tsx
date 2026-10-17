"use client";

import * as React from "react";
import { ArrowUpRight, CornerDownLeft } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { CrtOverlay } from "@/components/ui/crt-overlay";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { color, email, socials } from "./config";
import { useLights } from "./lights";
import { SectionHeading, display } from "./section-heading";

type Values = { name: string; email: string; when: string; message: string };
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const empty: Values = { name: "", email: "", when: "mar-2027", message: "" };

const windows = [
  { value: "mar-2027", label: "Mar 2027" },
  { value: "q2-2027", label: "Q2 2027" },
  { value: "later", label: "Later" },
];

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Who should I reply to?";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "That address doesn't look complete.";
  if (values.message.trim().length < 20) errors.message = "A couple of sentences, please. 20 characters at least.";
  return errors;
}

const label = (text: string) => <span className="text-[13px] font-normal text-white/70">{text}</span>;

function MessageForm() {
  const [values, setValues] = React.useState<Values>(empty);
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">("idle");
  const sentRef = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  React.useEffect(() => {
    if (status === "sent") sentRef.current?.focus();
  }, [status]);

  const set = (key: "name" | "email" | "message") => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) {
      const form = event.currentTarget;
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setStatus("sending");
    timer.current = window.setTimeout(() => setStatus("sent"), 1100);
  };

  if (status === "sent") {
    return (
      <div
        ref={sentRef}
        tabIndex={-1}
        role="status"
        className="flex min-h-[500px] flex-col justify-center px-6 py-12 font-mono outline-none sm:px-10"
      >
        <p className="text-[13px] text-[rgb(var(--neon))]">&gt; message queued</p>
        <p className="mt-6 max-w-[34ch] text-[clamp(22px,3vw,30px)] leading-[1.25] tracking-[-0.02em] text-white">
          Thanks, {values.name.trim().split(" ")[0]}. It&apos;s on my desk.
        </p>
        <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-white/70">
          I read everything myself and reply within two working days, from {email}.
        </p>
        <div className="mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setValues(empty);
              setStatus("idle");
            }}
          >
            Write another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} aria-label="Message Juno" className="flex h-full flex-col gap-5 p-5 sm:p-8">
      <p className="truncate font-mono text-[12px] text-white/70 sm:text-[13px]">
        &gt; new message to <span className="text-[rgb(var(--neon))]">{email}</span>
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label={label("Name")}
          autoComplete="name"
          placeholder="Ada Visser"
          value={values.name}
          onChange={set("name")}
          error={errors.name}
          className="bg-black/30 font-mono"
        />
        <Input
          label={label("Email")}
          type="email"
          autoComplete="email"
          placeholder="ada@harbourline.nl"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
          className="bg-black/30 font-mono"
        />
      </div>
      <fieldset>
        <legend className="mb-1.5">{label("Start")}</legend>
        <div className="flex flex-wrap gap-2">
          {windows.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="when"
                value={option.value}
                checked={values.when === option.value}
                onChange={() => setValues((current) => ({ ...current, when: option.value }))}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex h-8 items-center rounded-md border border-white/10 bg-black/30 px-3 font-mono text-xs text-white/70",
                  "transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-white/25 hover:text-white/90",
                  "peer-checked:border-[rgb(var(--neon)/0.7)] peer-checked:bg-[rgb(var(--neon)/0.1)] peer-checked:text-[rgb(var(--neon))] peer-checked:shadow-[0_0_14px_-2px_rgb(var(--neon)/0.45)]",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--neon)/0.6)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#040507]",
                )}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Textarea
        label={label("The short version")}
        placeholder="What you're making, who it's for, and what's not working yet."
        minRows={4}
        maxRows={8}
        maxLength={1000}
        showCount
        value={values.message}
        onChange={set("message")}
        error={errors.message}
        className="bg-black/30 font-mono"
      />
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="text-xs text-white/60">Replies within two working days.</p>
        <Button type="submit" variant="solid" loading={status === "sending"}>
          {status === "sending" ? "Sending" : "Send message"}
          {status !== "sending" && <CornerDownLeft aria-hidden />}
        </Button>
      </div>
    </form>
  );
}

function Monitor() {
  const { on, setOn } = useLights();

  return (
    <div className="relative rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,#1a1b21,#0d0e12)] p-2.5 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.95),inset_0_1px_0_rgb(255_255_255/0.07),inset_0_-2px_0_rgb(0_0_0/0.5)] sm:p-4">
      <CrtOverlay on={on} color={color} curvature chromatic={false} className="min-h-[500px]">
        <MessageForm />
      </CrtOverlay>

      {!on && (
        <div className="absolute inset-2.5 grid place-items-center p-8 text-center sm:inset-4">
          <div>
            <p className="text-[15px] font-medium text-white/85">Screen off</p>
            <p className="mx-auto mt-3 max-w-[30ch] text-[15px] leading-relaxed text-white/70">
              The lights are out. Flip them back on to write, or email {email}.
            </p>
            <Button variant="outline" size="sm" className="mt-5" onClick={() => setOn(true)}>
              Turn the lights on
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 pb-1 pt-3.5 sm:px-4">
        <span className="text-[12px] text-white/55">JP-87 mail terminal</span>
        <span className="flex items-center gap-2 text-[12px] text-white/55">
          Power
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full transition-[background-color,box-shadow] duration-300",
              on ? "bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.6)]" : "bg-white/15",
            )}
          />
        </span>
      </div>
    </div>
  );
}

export function Contact() {
  const { on } = useLights();

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-16 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-12 sm:px-10 sm:pb-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5 lg:pt-4">
            <SectionHeading
              id="contact-title"
              size="md"
              title="Got something that has to feel right?"
              lede="Tell me what you're making and where it hurts. A few honest sentences beat a polished brief."
            />

            <dl className="mt-12 max-w-md space-y-5 text-[15px] leading-relaxed">
              <div>
                <dt className="text-[13px] text-white/55">Replies</dt>
                <dd className="mt-0.5 text-white/85">Within two working days, from me, not a form.</dd>
              </div>
              <div>
                <dt className="text-[13px] text-white/55">Based</dt>
                <dd className="mt-0.5 text-white/85">Rotterdam, on CET. Calls on Tuesdays and Thursdays.</dd>
              </div>
              <div>
                <dt className="text-[13px] text-white/55">Elsewhere</dt>
                <dd className="mt-0.5 flex flex-wrap gap-x-5 gap-y-1">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="group flex items-center gap-0.5 rounded-md text-white/85 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                    >
                      {social.label}
                      <ArrowUpRight aria-hidden className="size-3.5 opacity-60" />
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <Monitor />
          </div>
        </div>

        {/* The address, set big enough to read from across the room. It lights when you reach for it. */}
        <div className="mt-24 border-t border-white/[0.08] pt-10 sm:mt-32 sm:pt-14">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[15px] text-white/55">Or skip the form and write to</p>
            <CopyButton value={email} aria-label="Copy email address" copiedLabel="Address copied" />
          </div>
          <div className="mt-3">
            <a
              href={`mailto:${email}`}
              className={cn(
                display,
                "group -ml-[0.03em] rounded-lg text-[clamp(34px,9.4vw,104px)] sm:text-[clamp(34px,7.4vw,104px)] leading-[1.02] text-white outline-none transition-[color,text-shadow] duration-300",
                "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]",
                on &&
                  "hover:text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)] hover:[text-shadow:0_0_2px_rgb(var(--neon)/0.9),0_0_28px_rgb(var(--neon)/0.5)] focus-visible:text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)]",
              )}
            >
              {email.split("@")[0]}@<wbr />
              {email.split("@")[1]}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
