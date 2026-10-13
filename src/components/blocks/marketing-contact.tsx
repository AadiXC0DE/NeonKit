"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight, Check } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SevenSegment } from "@/components/ui/seven-segment";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Opening hours in minutes after local midnight, indexed Sunday to Saturday.
const OFFICES = {
  chicago: {
    city: "Chicago",
    zone: "America/Chicago",
    zoneLabel: "Central time",
    address: ["1418 W Fulton St, Floor 3", "Chicago, IL 60607"],
    phone: "+1 (312) 555-0148",
    hours: [null, [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 900], null],
  },
  porto: {
    city: "Porto",
    zone: "Europe/Lisbon",
    zoneLabel: "Western European time",
    address: ["Rua do Almada 212, 2º", "4050-032 Porto"],
    phone: "+351 22 555 0193",
    hours: [null, [570, 1110], [570, 1110], [570, 1110], [570, 1110], [570, 960], null],
  },
} satisfies Record<string, {
  city: string;
  zone: string;
  zoneLabel: string;
  address: string[];
  phone: string;
  hours: ([number, number] | null)[];
}>;

type OfficeKey = keyof typeof OFFICES;

const SERVICES = ["Product design", "Web build", "Design system", "Rescue a project"];

const BUDGETS = [
  { value: "25", label: "Under $25k" },
  { value: "60", label: "$25k – $60k" },
  { value: "150", label: "$60k – $150k" },
  { value: "150+", label: "$150k and up" },
];

const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

function readOffice(key: OfficeKey) {
  const office = OFFICES[key];
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: office.zone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = DAYS.indexOf(get("weekday"));
  const now = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
  const today = office.hours[day];

  if (today && now >= today[0] && now < today[1]) {
    const left = today[1] - now;
    return { day, time: clock(now), open: true, note: `Closes ${clock(today[1])}, in ${Math.floor(left / 60)}h ${left % 60}m` };
  }
  for (let ahead = 0; ahead < 8; ahead++) {
    const next = office.hours[(day + ahead) % 7];
    if (!next || (ahead === 0 && now >= next[0])) continue;
    const when = ahead === 0 ? "today" : ahead === 1 ? "tomorrow" : DAYS[(day + ahead) % 7];
    return { day, time: clock(now), open: false, note: `Opens ${when} at ${clock(next[0])}` };
  }
  return { day, time: clock(now), open: false, note: "" };
}

function useOfficeStatus(key: OfficeKey) {
  const [status, setStatus] = React.useState<ReturnType<typeof readOffice> | null>(null);
  React.useEffect(() => {
    const tick = () => setStatus(readOffice(key));
    tick();
    const timer = window.setInterval(tick, 5000);
    return () => window.clearInterval(timer);
  }, [key]);
  return status;
}

const GROUPS = [
  { label: "Mon–Thu", days: [1, 2, 3, 4] },
  { label: "Fri", days: [5] },
  { label: "Sat–Sun", days: [6, 0] },
];

// A small tube sign in the window: lit while the studio is open, dark glass otherwise.
function OpenSign({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "rounded-[10px] border px-3 pb-1.5 pt-1 text-[22px] leading-none tracking-[0.01em] transition-[color,border-color,text-shadow,box-shadow] duration-500",
        on
          ? "border-[rgb(var(--neon)/0.7)] text-[color-mix(in_srgb,rgb(var(--neon))_35%,white)] shadow-[0_0_14px_rgb(var(--neon)/0.45),inset_0_0_10px_rgb(var(--neon)/0.25)] [text-shadow:0_0_4px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.8)]"
          : "border-[rgb(var(--neon)/0.14)] text-[rgb(var(--neon)/0.18)]",
      )}
      style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
    >
      Open
    </span>
  );
}

function OfficeHours() {
  const [office, setOffice] = React.useState<OfficeKey>("chicago");
  const status = useOfficeStatus(office);
  const data = OFFICES[office];

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-medium tracking-[-0.01em] text-white/85">Both studios, right now</h3>
        <ToggleGroup aria-label="Studio" size="sm" value={office} onValueChange={(value) => setOffice(value as OfficeKey)}>
          <ToggleGroupItem value="chicago" className="h-8 sm:h-7">Chicago</ToggleGroupItem>
          <ToggleGroupItem value="porto" className="h-8 sm:h-7">Porto</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="relative mt-8">
        {/* The display lights the wall it hangs on. */}
        <div aria-hidden className="absolute -left-6 top-0 h-36 w-80 rounded-[50%] bg-[rgb(var(--neon)/0.12)] blur-[60px]" />
        <div className="relative flex items-end justify-between gap-4">
          <SevenSegment
            value={status?.time ?? "--:--"}
            colonBlink
            unlit={0.07}
            className="[--segment-h:64px] sm:[--segment-h:92px]"
            aria-label={status ? `${data.city} local time ${status.time}` : `${data.city} local time`}
          />
          <span className="pb-2"><OpenSign on={Boolean(status?.open)} /></span>
        </div>
        <p className="relative mt-4 text-[13px] text-white/55">
          {data.city}, {data.zoneLabel.toLowerCase()}
        </p>
        <p aria-live="polite" className="relative mt-1 text-[15px] text-white/60">
          <span className="text-white/90">{status ? (status.open ? "Open now." : "Closed.") : "Checking hours."}</span>{" "}
          {status?.note}
        </p>

        <dl className="relative mt-7 grid grid-cols-3 border-t border-white/[0.08] pt-5">
          {GROUPS.map((group) => {
            const hours = data.hours[group.days[0]];
            const today = status ? group.days.includes(status.day) : false;
            return (
              <div key={group.label} className="relative">
                <dt
                  className={cn(
                    "text-[13px]",
                    today ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]" : "text-white/55",
                  )}
                >
                  {group.label}
                  {today && <span className="sr-only"> (today)</span>}
                </dt>
                <dd className={cn("mt-1 text-[14px] tabular-nums", today ? "text-white/90" : "text-white/55")}>
                  {hours ? `${clock(hours[0])}–${clock(hours[1])}` : "Closed"}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="mt-5 grid gap-4 border-t border-white/[0.08] pt-5 text-[14px] sm:grid-cols-2">
        <address className="not-italic leading-relaxed text-white/70">
          {data.address.map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </address>
        <div className="flex flex-col gap-3 sm:items-end sm:gap-1.5">
          <a href={`tel:${data.phone.replace(/[^+\d]/g, "")}`} className="w-fit rounded-md text-white/70 tabular-nums outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
            {data.phone}
          </a>
          <a href="#" className="inline-flex w-fit items-center gap-1 rounded-md text-[rgb(var(--neon))] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
            Directions <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

type Errors = Partial<Record<"name" | "email" | "message", string>>;

function validate(values: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Who should we reply to?";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "That email doesn't look complete.";
  if (values.message.trim().length < 20) errors.message = "A couple of sentences helps us route this. 20 characters minimum.";
  return errors;
}

function ContactForm() {
  const [values, setValues] = React.useState({ name: "", email: "", company: "", message: "" });
  const [services, setServices] = React.useState<string[]>(["Web build"]);
  const [budget, setBudget] = React.useState<string>();
  const [errors, setErrors] = React.useState<Errors>({});
  const [tried, setTried] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "sending" | "sent">("idle");
  const timer = React.useRef<number | undefined>(undefined);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);
  // Where focus goes after the next render: the first invalid field, the receipt, or back to the form.
  const focusNext = React.useRef<"error" | "done" | "form" | null>(null);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  React.useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === "error") formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    if (target === "done") doneRef.current?.focus();
    if (target === "form") formRef.current?.querySelector<HTMLElement>("input")?.focus();
  }, [errors, state]);

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    if (tried) setErrors(validate(next));
  };

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setTried(true);
    setErrors(found);
    if (Object.keys(found).length) {
      focusNext.current = "error";
      return;
    }
    setState("sending");
    timer.current = window.setTimeout(() => {
      focusNext.current = "done";
      setState("sent");
    }, 1200);
  }

  function reset() {
    setValues({ name: "", email: "", company: "", message: "" });
    setServices(["Web build"]);
    setBudget(undefined);
    setTried(false);
    setErrors({});
    focusNext.current = "form";
    setState("idle");
  }

  if (state === "sent") {
    return (
      <div role="status" className="flex min-h-[560px] flex-col justify-between p-6 sm:p-9">
        <div>
          <span className="grid size-11 place-items-center rounded-full border border-[rgb(var(--neon)/0.6)] bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))] shadow-[0_0_24px_rgb(var(--neon)/0.35),inset_0_0_10px_rgb(var(--neon)/0.2)]">
            <Check aria-hidden className="size-5" strokeWidth={2.5} />
          </span>
          <p className="mt-8 text-[13px] text-white/55">
            Ticket <span className="font-mono text-white/75">CL-2291</span>
          </p>
          <h3 ref={doneRef} tabIndex={-1} className="mt-2 text-[34px] font-[620] leading-[1.02] tracking-[-0.035em] text-white outline-none [font-stretch:112%]">
            Got it, {values.name.trim().split(" ")[0]}.
          </h3>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/55">
            A partner reads every brief. Expect a reply at {values.email.trim()} within one business day, usually
            before 3pm Central.
          </p>
          <dl className="mt-8 grid gap-3 border-t border-white/[0.06] pt-5 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-white/55">Scope</dt>
              <dd className="mt-1 text-white/80">{services.length ? services.join(", ") : "Not sure yet"}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-white/55">Budget</dt>
              <dd className="mt-1 text-white/80">{BUDGETS.find((b) => b.value === budget)?.label ?? "Not given"}</dd>
            </div>
          </dl>
        </div>
        <Button variant="link" size="sm" onClick={reset} className="mt-10 w-fit">
          Send another brief
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="grid gap-5 p-6 sm:p-9">
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <Input label="Name" autoComplete="name" placeholder="Dana Whitfield" value={values.name} onChange={set("name")} error={errors.name} />
        <Input label="Work email" type="email" autoComplete="email" placeholder="dana@ridgeway.co" value={values.email} onChange={set("email")} error={errors.email} />
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <Input label="Company" autoComplete="organization" placeholder="Optional" value={values.company} onChange={set("company")} />
        <Select label="Budget" placeholder="Pick a range" options={BUDGETS} value={budget} onValueChange={setBudget} />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-sm font-medium text-white/80">What do you need?</legend>
        <ToggleGroup
          type="multiple"
          variant="ghost"
          size="sm"
          value={services}
          onValueChange={setServices}
          className="flex flex-wrap gap-2"
        >
          {SERVICES.map((service) => (
            <ToggleGroupItem key={service} value={service} className="border border-white/10 data-[state=on]:border-transparent">
              {service}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>
      <Textarea
        label="The short version"
        placeholder="What's broken, who it's for, and when it needs to work."
        minRows={6}
        maxLength={1200}
        showCount
        value={values.message}
        onChange={set("message")}
        error={errors.message}
      />
      <div className="mt-1 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-white/60">Median first reply last quarter: 3h 40m.</p>
        <Button type="submit" variant="solid" loading={state === "sending"} className="w-full sm:w-auto">
          {state === "sending" ? "Sending" : "Send brief"}
          {state !== "sending" && <ArrowRight aria-hidden />}
        </Button>
      </div>
    </form>
  );
}

export default function MarketingContact() {
  return (
    <section
      aria-labelledby="copperline-contact-title"
      // Change the color here; everything inside follows it.
      style={neonVars("orange")}
      className="relative isolate overflow-hidden bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-16">
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <h2
            id="copperline-contact-title"
            className="text-[clamp(2.6rem,5.6vw,4.75rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
          >
            Tell us <span className="sm:block">what&apos;s stuck.</span>
          </h2>
          <p className="mt-6 max-w-[40ch] text-[17px] leading-[1.6] text-white/60">
            We&apos;re a twelve-person product agency. Send the messy version; we&apos;d rather read three honest
            sentences than a polished RFP.
          </p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.025] shadow-[0_50px_100px_-50px_rgb(0_0_0/0.9)]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 sm:px-9">
              <p className="text-sm font-medium text-white/90">New project brief</p>
              <a href="mailto:hello@copperline.studio" className="rounded-md text-[13px] text-white/60 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                or hello@copperline.studio
              </a>
            </div>
            <ContactForm />
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-end">
          <OfficeHours />
        </div>
      </div>
    </section>
  );
}

