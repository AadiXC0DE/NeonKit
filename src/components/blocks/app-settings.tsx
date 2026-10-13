"use client";

import * as React from "react";
import { ArrowLeft, Check, Download, RotateCcw, Upload } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { HoldButton } from "@/components/ui/hold-button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const SAVED = {
  name: "Ines Ortega",
  email: "ines@fernhill.co",
  title: "Head of Finance",
  timezone: "europe-lisbon",
  workspace: "Fernhill Inc.",
  slug: "fernhill",
  currency: "usd",
  fiscal: "jan",
  plan: "growth",
  billingEmail: "finance@fernhill.co",
  notify: { digest: true, churn: true, expansion: true, failed: true, product: false },
  delivery: "instant",
};

type Settings = typeof SAVED;

const TAB_KEYS: Record<string, (keyof Settings)[]> = {
  profile: ["name", "email", "title", "timezone", "workspace", "slug", "currency", "fiscal"],
  notifications: ["notify", "delivery"],
  billing: ["plan", "billingEmail"],
};
type NotifyKey = keyof Settings["notify"];

const TIMEZONES = [
  { value: "america-new-york", label: "New York · UTC−04:00" },
  { value: "europe-london", label: "London · UTC+01:00" },
  { value: "europe-lisbon", label: "Lisbon · UTC+01:00" },
  { value: "europe-berlin", label: "Berlin · UTC+02:00" },
  { value: "asia-singapore", label: "Singapore · UTC+08:00" },
];
const CURRENCIES = [
  { value: "usd", label: "US dollar · USD" },
  { value: "eur", label: "Euro · EUR" },
  { value: "gbp", label: "Pound sterling · GBP" },
];
const FISCAL = [
  { value: "jan", label: "January" },
  { value: "apr", label: "April" },
  { value: "jul", label: "July" },
  { value: "oct", label: "October" },
];
const DELIVERY = [
  { value: "instant", label: "As they happen" },
  { value: "hourly", label: "Hourly batch" },
  { value: "daily", label: "Daily at 09:00" },
];
const NOTIFICATIONS: { key: NotifyKey; label: string; description: string }[] = [
  { key: "digest", label: "Monday digest", description: "MRR, churn and the five biggest movers from last week." },
  { key: "churn", label: "Churn and downgrades", description: "When an account cancels or drops a plan tier." },
  { key: "expansion", label: "Large expansions", description: "When an account adds more than $1,000 MRR in one change." },
  { key: "failed", label: "Failed payments", description: "Dunning has retried a card three times and given up." },
  { key: "product", label: "Product updates", description: "One short email a month about new reports." },
];
const PLANS = [
  { value: "starter", name: "Starter", price: 0, detail: "Up to 3 seats, 12 months of history" },
  { value: "growth", name: "Growth", price: 49, detail: "Cohorts, forecasts, 10 seats" },
  { value: "scale", name: "Scale", price: 89, detail: "SSO, audit log, unlimited history" },
];
const INVOICES = [
  { id: "VNT-2026-010", date: "Oct 1, 2026", amount: "$392.00" },
  { id: "VNT-2026-009", date: "Sep 1, 2026", amount: "$392.00" },
  { id: "VNT-2026-008", date: "Aug 1, 2026", amount: "$343.00" },
];

function Section({ id, title, description, children, className }: { id: string; title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn("grid gap-5 border-t border-white/[0.06] py-8 first:border-t-0 first:pt-2 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10", className)}>
      <div>
        <h2 id={id} className="text-[15px] font-semibold tracking-[-0.01em] text-white/90">{title}</h2>
        <p className="mt-1.5 text-[13px] leading-5 text-white/60">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6", className)}>{children}</div>;
}

export default function AppSettings() {
  const [tab, setTab] = React.useState("profile");
  const [saved, setSaved] = React.useState<Settings>(SAVED);
  const [draft, setDraft] = React.useState<Settings>(SAVED);
  const [errors, setErrors] = React.useState<Partial<Record<"name" | "email" | "slug" | "billingEmail" | "plan", string>>>({});
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [photo, setPhoto] = React.useState<string | undefined>();
  const [confirmText, setConfirmText] = React.useState("");
  const [deleted, setDeleted] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const timer = React.useRef<number | undefined>(undefined);

  const barRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Saving or discarding disables the button that was pressed and then hides the bar, so hand
  // focus to the open tab rather than letting it fall back to the page.
  const settleFocus = () =>
    requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (focused !== document.body && !barRef.current?.contains(focused)) return;
      formRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
    });

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const barVisible = dirty || status === "saved";

  // A hidden save bar must not be reachable with Tab.
  React.useEffect(() => {
    barRef.current?.toggleAttribute("inert", !barVisible);
  }, [barVisible]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (status === "saved") setStatus("idle");
  };
  const text = (key: "name" | "email" | "title" | "workspace" | "slug" | "billingEmail") => ({
    value: draft[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value),
  });

  function save(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!draft.name.trim()) next.name = "Your name can't be empty.";
    if (!email.test(draft.email)) next.email = "Enter an email like you@company.com.";
    if (!/^[a-z0-9-]{3,32}$/.test(draft.slug)) next.slug = "3–32 lowercase letters, numbers or dashes.";
    if (!email.test(draft.billingEmail)) next.billingEmail = "Invoices need a valid address.";
    if (draft.plan === "starter") next.plan = "Starter allows 3 seats and you have 8. Remove 5 teammates first.";
    setErrors(next);
    if (Object.keys(next).length) {
      setTab(next.name || next.email || next.slug ? "profile" : "billing");
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setStatus("saving");
    timer.current = window.setTimeout(() => {
      setSaved(draft);
      setStatus("saved");
      settleFocus();
      timer.current = window.setTimeout(() => setStatus("idle"), 1800);
    }, 900);
  }

  function discard() {
    setDraft(saved);
    setErrors({});
    settleFocus();
  }

  const changed = (t: string) => (TAB_KEYS[t] ?? []).some((k) => JSON.stringify(draft[k]) !== JSON.stringify(saved[k]));
  const tabLabel = (t: string, label: string) => (
    <>
      {label}
      {changed(t) && (
        <span className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]">
          <span className="sr-only">, unsaved changes</span>
        </span>
      )}
    </>
  );

  const plan = PLANS.find((p) => p.value === draft.plan) ?? PLANS[1];
  const currentPlan = PLANS.find((p) => p.value === saved.plan) ?? PLANS[1];

  return (
    <div
      // Change the color here; everything inside follows it.
      style={neonVars("blue")}
      className="min-h-[100svh] bg-[#05060a] text-white/90"
    >
      <header className="flex h-14 items-center gap-3 border-b border-white/[0.06] px-4 sm:px-6">
        <svg aria-hidden viewBox="0 0 28 28" className="size-7 shrink-0">
          <rect x="0.5" y="0.5" width="27" height="27" rx="8" fill="rgb(var(--neon) / 0.08)" stroke="rgb(var(--neon) / 0.35)" />
          <path d="M8 9.5 14 19l6-9.5" fill="none" stroke="rgb(var(--neon))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <nav aria-label="Breadcrumb" className="min-w-0 truncate text-sm">
          <a href="#overview" className="py-2 text-white/60 outline-none hover:text-white/85 focus-visible:text-white">Fernhill</a>
          <span aria-hidden className="mx-2 text-white/20">/</span>
          <span aria-current="page" className="text-white/85">Settings</span>
        </nav>
        <a href="#overview" className="ml-auto hidden items-center gap-1 text-xs text-white/60 outline-none hover:text-white/85 focus-visible:text-white sm:flex">
          <ArrowLeft aria-hidden className="size-3.5" /> Dashboard
        </a>
        <Avatar alt={saved.name} src={photo} size="sm" className="ml-auto sm:ml-0" />
      </header>

      <form ref={formRef} onSubmit={save} noValidate className="mx-auto w-full max-w-[1000px] px-4 pb-10 pt-10 sm:px-6 lg:pt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Workspace · {saved.workspace}</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[44px]">Settings</h1>

        <Tabs value={tab} onValueChange={setTab} variant="underline" className="mt-8 gap-6">
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList className="min-w-max">
              <TabsTrigger value="profile">{tabLabel("profile", "Profile")}</TabsTrigger>
              <TabsTrigger value="notifications">{tabLabel("notifications", "Notifications")}</TabsTrigger>
              <TabsTrigger value="billing">{tabLabel("billing", "Billing")}</TabsTrigger>
              <TabsTrigger value="danger">Danger zone</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" forceMount>
            <Section id="s-profile" title="Your profile" description="How you appear to teammates in comments, exports and shared reports.">
              <Panel className="grid gap-5">
                <div className="flex items-center gap-4">
                  <Avatar alt={draft.name || "You"} src={photo} size="xl" />
                  <div className="grid gap-2.5">
                    <p className="text-xs text-white/60">Square image, at least 256 px.</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (photo) URL.revokeObjectURL(photo);
                        setPhoto(URL.createObjectURL(file));
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="soft" onClick={() => fileRef.current?.click()}>
                        <Upload /> Upload photo
                      </Button>
                      {photo && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => setPhoto(undefined)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Full name" autoComplete="name" error={errors.name} {...text("name")} />
                  <Input label="Job title" {...text("title")} />
                </div>
                <Input label="Email" type="email" autoComplete="email" description="Sign-in links and alerts go here." error={errors.email} {...text("email")} />
                <Select label="Time zone" options={TIMEZONES} value={draft.timezone} onValueChange={(v) => set("timezone", v)} description="Daily reports close at midnight in this zone." />
              </Panel>
            </Section>

            <Section id="s-workspace" title="Workspace" description="Shared by everyone at Fernhill. Changes apply to every report.">
              <Panel className="grid gap-5">
                <Input label="Workspace name" {...text("workspace")} />
                <Input label="Workspace URL" leading={<span className="font-mono text-xs text-white/60">vantage.app/</span>} error={errors.slug} spellCheck={false} {...text("slug")} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select label="Reporting currency" options={CURRENCIES} value={draft.currency} onValueChange={(v) => set("currency", v)} />
                  <Select label="Fiscal year starts" options={FISCAL} value={draft.fiscal} onValueChange={(v) => set("fiscal", v)} />
                </div>
              </Panel>
            </Section>
          </TabsContent>

          <TabsContent value="notifications" forceMount>
            <Section id="s-email" title="Email alerts" description="Sent to the address on your profile. Teammates choose their own.">
              <Panel className="divide-y divide-white/[0.06] py-1 sm:py-1">
                {NOTIFICATIONS.map((n) => (
                  <Field key={n.key} orientation="horizontal" label={n.label} description={n.description} className="py-4">
                    <Switch checked={draft.notify[n.key]} onCheckedChange={(on) => set("notify", { ...draft.notify, [n.key]: on })} />
                  </Field>
                ))}
              </Panel>
            </Section>
            <Section id="s-delivery" title="Delivery" description="Batching keeps a busy renewal week from flooding your inbox.">
              <Panel>
                <Select label="Send alerts" options={DELIVERY} value={draft.delivery} onValueChange={(v) => set("delivery", v)} containerClassName="max-w-xs" />
              </Panel>
            </Section>
          </TabsContent>

          <TabsContent value="billing" forceMount>
            <Section id="s-plan" title="Plan" description={`You're on ${currentPlan.name}. Changes are prorated to the day.`}>
              <RadioGroup variant="card" orientation="horizontal" aria-label="Plan" value={draft.plan} onValueChange={(v) => set("plan", v)} className="grid gap-3 sm:grid-cols-3">
                {PLANS.map((p) => (
                  <RadioGroupItem key={p.value} value={p.value} label={p.name}>
                    <span className="mt-3 block text-2xl font-semibold tracking-[-0.03em] text-white">
                      {p.price ? `$${p.price}` : "Free"}
                      {p.price > 0 && <span className="text-[13px] font-normal tracking-normal text-white/60"> / seat / mo</span>}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[18px] text-white/60">{p.detail}</span>
                  </RadioGroupItem>
                ))}
              </RadioGroup>
              {errors.plan && <p className="mt-3 text-xs text-[#ff4d5e]">{errors.plan}</p>}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-4 py-3 text-[13px]">
                <span className="text-white/55">
                  8 seats × ${plan.price} = <span className="font-mono text-white/90">${(plan.price * 8).toLocaleString("en-US")}.00</span> / month
                </span>
                <span className="text-white/60">Renews Nov 1, 2026</span>
              </div>
            </Section>
            <Section id="s-invoices" title="Invoices" description="Paid by card ending 4417, expires 08/28. Invoices go to the billing email.">
              <Panel className="grid gap-5">
                <Input label="Billing email" type="email" error={errors.billingEmail} {...text("billingEmail")} />
                <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                  {INVOICES.map((inv) => (
                    <li key={inv.id} className="flex items-center gap-3 py-3 text-[13px]">
                      <span className="w-28 shrink-0 text-white/80">{inv.date}</span>
                      <span className="hidden flex-1 font-mono text-xs text-white/60 sm:block">{inv.id}</span>
                      <span className="ml-auto font-mono text-white/80 sm:ml-0">{inv.amount}</span>
                      <Button type="button" size="sm" variant="ghost" aria-label={`Download invoice ${inv.id}`} className="size-8 px-0">
                        <Download />
                      </Button>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Section>
          </TabsContent>

          <TabsContent value="danger" forceMount>
            <Section id="s-danger" title="Delete workspace" description="Removes every report, forecast and teammate. Billing stops at the end of the day.">
              <div className="overflow-hidden rounded-2xl border border-[rgb(255_77_94/0.28)] bg-[rgb(255_77_94/0.03)]">
                {deleted ? (
                  <div role="status" className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                    <div>
                      <p className="text-sm font-medium text-white/90">{saved.workspace} is scheduled for deletion.</p>
                      <p className="mt-1 text-[13px] text-white/60">It goes for good on Oct 26, 2026. Until then you can bring it back.</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="border border-white/10" onClick={() => { setDeleted(false); setConfirmText(""); }}>
                      <RotateCcw /> Restore workspace
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 p-5 sm:p-6">
                      <ul className="grid gap-1.5 text-[13px] text-white/60">
                        <li>· 1,348 accounts and 26 months of MRR history</li>
                        <li>· 14 saved reports, 3 forecasts, 8 teammates</li>
                      </ul>
                      <Input
                        color="red"
                        label={<>Type <span className="font-mono text-white">{saved.slug}</span> to confirm</>}
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        spellCheck={false}
                        autoComplete="off"
                        containerClassName="max-w-xs"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(255_77_94/0.18)] bg-[rgb(255_77_94/0.03)] px-5 py-3.5 sm:px-6">
                      <p className="text-xs text-white/60">Exports stay available for 14 days.</p>
                      <HoldButton
                        type="button"
                        color="red"
                        size="sm"
                        duration={1800}
                        disabled={confirmText !== saved.slug}
                        completeLabel="Deleting…"
                        resetDelay={Infinity}
                        onComplete={() => { timer.current = window.setTimeout(() => setDeleted(true), 700); }}
                      >
                        Hold to delete workspace
                      </HoldButton>
                    </div>
                  </>
                )}
              </div>
            </Section>
          </TabsContent>
        </Tabs>

        <div
          ref={barRef}
          aria-hidden={!barVisible}
          className={cn(
            "sticky bottom-4 z-20 mx-auto mt-6 flex w-full max-w-[560px] items-center gap-3 rounded-2xl border bg-[#0a0b11] py-2.5 pl-4 pr-2.5",
            "transition-[opacity,transform,translate,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            barVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
            dirty
              ? "border-[rgb(var(--neon)/0.35)] shadow-[0_18px_40px_-12px_rgb(0_0_0/0.9),0_0_28px_-10px_rgb(var(--neon)/0.6)]"
              : "border-white/10 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.9)]",
          )}
        >
          <p aria-live="polite" className="min-w-0 flex-1 truncate text-[13px] text-white/70">
            {status === "saved" && !dirty ? (
              <span className="inline-flex items-center gap-1.5 text-white/85">
                <Check aria-hidden className="size-4 text-[rgb(var(--neon))]" /> Changes saved
              </span>
            ) : (
              <>
                <span aria-hidden className="mr-2 inline-block size-1.5 rounded-full bg-[rgb(var(--neon))] align-middle shadow-[0_0_8px_rgb(var(--neon))]" />
                Unsaved changes
              </>
            )}
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={discard} disabled={!dirty || status === "saving"}>
            Discard
          </Button>
          <Button type="submit" size="sm" variant="solid" loading={status === "saving"} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
