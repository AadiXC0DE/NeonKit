"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, FileText, Hash, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Step, Stepper } from "@/components/ui/stepper";
import { TagInput } from "@/components/ui/tag-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

// Change the color here; everything inside follows it. Step 3 lets people pick their own.
const DEFAULT_ACCENT = "#22d3ee";

const STEPS = [
  { title: "Workspace", description: "Name and purpose" },
  { title: "Teammates", description: "Optional" },
  { title: "Accent", description: "Make it yours" },
];

const PURPOSES = ["Engineering", "Research", "Operations", "Everything"];
const PAGES: Record<string, string[]> = {
  Engineering: ["Runbooks", "Architecture decisions", "On-call handbook"],
  Research: ["Field protocols", "Interview notes", "Reading list"],
  Operations: ["Vendor contacts", "Policies", "Weekly reviews"],
  Everything: ["Handbook", "Meeting notes", "Projects"],
};

const ACCENTS = [
  { value: "#22d3ee", label: "Argon" },
  { value: "#a3e635", label: "Lime" },
  { value: "#fbbf24", label: "Sodium" },
  { value: "#ff8a3d", label: "Ember" },
  { value: "#ff5fa2", label: "Rose" },
  { value: "#a855f7", label: "Krypton" },
  { value: "#4f8bff", label: "Mercury" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Preview({ name, purpose, people, done }: { name: string; purpose: string; people: string[]; done: boolean }) {
  const title = name.trim() || "Untitled workspace";
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[#0a0b11] text-left transition-[border-color,box-shadow] duration-500",
        done ? "border-[rgb(var(--neon)/0.6)] shadow-[0_0_0_1px_rgb(var(--neon)/0.3),0_0_48px_-8px_rgb(var(--neon)/0.45)]" : "border-white/10",
      )}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-white/[0.06] px-3">
        {[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-white/10" />)}
        <span className="ml-3 truncate font-mono text-[10px] text-white/55">fieldnote.app/{slugify(name) || "your-team"}</span>
      </div>
      <div className="grid min-h-[340px] grid-cols-[156px_minmax(0,1fr)]">
        <div className="border-r border-white/[0.06] p-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[rgb(var(--neon))] text-[11px] font-semibold text-[#05060a] transition-colors duration-300">
              {title[0].toUpperCase()}
            </span>
            <span className="truncate text-[13px] font-medium text-white/85">{title}</span>
          </div>
          <div className="mt-3 flex h-7 items-center gap-2 rounded-md border border-white/[0.06] px-2 text-[11px] text-white/55">
            <Search className="size-3" /> Search
          </div>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-white/55">{purpose}</p>
          <ul className="mt-2 space-y-1 text-[12px]">
            {PAGES[purpose].map((p, i) => (
              <li key={p} className={cn("flex items-center gap-2 rounded-md px-2 py-1", i === 0 ? "bg-[rgb(var(--neon)/0.12)] text-[rgb(var(--neon))]" : "text-white/60")}>
                <FileText className="size-3 shrink-0" /> <span className="truncate">{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center">
            <Avatar alt="You" size="sm" className="ring-2 ring-[#0a0b11]" />
            {people.slice(0, 3).map((p) => (
              <Avatar key={p} alt={p.split("@")[0].replace(/[._-]/g, " ")} size="sm" className="-ml-1.5 ring-2 ring-[#0a0b11]" />
            ))}
            {people.length > 3 && <span className="ml-1.5 font-mono text-[10px] text-white/55">+{people.length - 3}</span>}
          </div>
        </div>
        <div className="p-5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-white/55"><Hash className="size-3" /> {PAGES[purpose][0].toLowerCase()}</p>
          <p className="mt-2 text-lg font-semibold leading-tight tracking-[-0.02em] text-white/90">Welcome to {title}</p>
          <div className="mt-4 space-y-2">
            {[92, 84, 96, 60].map((w, i) => <div key={i} className="h-2 rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />)}
          </div>
          <div className="mt-5 rounded-lg border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.06)] p-3">
            <div className="h-2 w-1/3 rounded-full bg-[rgb(var(--neon)/0.5)]" />
            <div className="mt-2 h-2 w-4/5 rounded-full bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppOnboarding() {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [nameError, setNameError] = React.useState("");
  const [purpose, setPurpose] = React.useState("Research");
  const [people, setPeople] = React.useState<string[]>(["ines@kelpie.org"]);
  const [accent, setAccent] = React.useState(DEFAULT_ACCENT);
  const done = step === STEPS.length;
  const formRef = React.useRef<HTMLFormElement>(null);

  // Focus follows the step, so keyboard users land in the new field.
  const focusField = () => requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[data-autofocus] input")?.focus());
  const goTo = (index: number) => {
    setStep(index);
    focusField();
  };

  const next = () => {
    if (step === 0) {
      const trimmed = name.trim();
      const error = trimmed.length < 2 ? "Give it a name with at least two characters." : trimmed.length > 40 ? "Keep it under 40 characters." : "";
      if (error) {
        setNameError(error);
        return focusField();
      }
    }
    goTo(step + 1);
  };

  return (
    <section
      style={neonVars(accent)}
      aria-labelledby="fn-onboarding-title"
      className="relative isolate overflow-hidden bg-[#05060a] px-4 py-10 text-white/90 sm:px-8 sm:py-14"
    >
      <div aria-hidden className="absolute -right-32 top-24 -z-10 h-[420px] w-[620px] rounded-full bg-[rgb(var(--neon)/0.08)] blur-[120px] transition-colors duration-500" />

      <div className="mx-auto grid max-w-[1160px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-start lg:gap-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Fieldnote · Set up</p>
          <h1 id="fn-onboarding-title" className="mt-3 text-[clamp(2.25rem,4.6vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            {done ? "Your wiki is ready." : "Three steps to a wiki people actually read."}
          </h1>

          <Stepper value={step} onValueChange={goTo} clickable aria-label="Workspace setup" className="mt-10">
            {STEPS.map((s, i) => (
              <Step key={s.title} title={s.title} description={<span className="text-white/60">{s.description}</span>} disabled={done || i > step} />
            ))}
          </Stepper>

          <form
            ref={formRef}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
            className="mt-8 min-h-[248px]"
          >
            {step === 0 && (
              <div className="grid gap-6">
                <div data-autofocus>
                  <Input
                    label="Workspace name"
                    placeholder="Kelpie Field Lab"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                    }}
                    error={nameError || undefined}
                    description={`Your address: fieldnote.app/${slugify(name) || "…"}`}
                    size="lg"
                  />
                </div>
                <div className="grid gap-2.5">
                  <span id="fn-purpose" className="text-sm text-white/70">Mostly for</span>
                  <ToggleGroup aria-labelledby="fn-purpose" variant="outline" size="sm" value={purpose} onValueChange={(v) => v && setPurpose(v)} className="flex-wrap">
                    {PURPOSES.map((p) => <ToggleGroupItem key={p} value={p} className="max-sm:h-9">{p}</ToggleGroupItem>)}
                  </ToggleGroup>
                </div>
              </div>
            )}

            {step === 1 && (
              <div data-autofocus>
                <TagInput
                  label="Invite by email"
                  placeholder="name@team.org"
                  description="Press Enter or comma after each address. Invites last 7 days."
                  value={people}
                  onValueChange={setPeople}
                  separators={["Enter", ",", " "]}
                  max={12}
                  validate={(tag) => (EMAIL.test(tag) ? true : `“${tag}” isn’t a full email address.`)}
                />
              </div>
            )}

            {step === 2 && (
              <ColorPicker label="Accent" swatches={ACCENTS} value={accent} onValueChange={setAccent} size="sm" className="max-w-[300px]" />
            )}

            {done && (
              <div className="grid gap-4">
                <p className="max-w-md text-[15px] leading-relaxed text-white/65">
                  <span className="text-white/90">{name.trim()}</span> is live with {PAGES[purpose].length} starter pages.{" "}
                  {people.length
                    ? `${people.length} ${people.length === 1 ? "invite is" : "invites are"} on the way.`
                    : "Invite people whenever you're ready."}
                </p>
                <ul className="grid gap-2 text-sm text-white/70">
                  {["Import from Markdown or Notion export", "Install the Slack digest", "Pin your first runbook"].map((t) => (
                    <li key={t} className="flex items-center gap-2.5">
                      <span className="size-1 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
              {done ? (
                <Button type="button" variant="ghost" onClick={() => goTo(0)}>
                  Edit setup
                </Button>
              ) : (
                <Button type="button" variant="ghost" disabled={step === 0} onClick={() => goTo(step - 1)}>
                  <ArrowLeft /> Back
                </Button>
              )}
              <div className="flex items-center gap-2">
                {step === 1 && (
                  <Button type="button" variant="ghost" onClick={() => { setPeople([]); goTo(2); }}>
                    Skip
                  </Button>
                )}
                {done ? (
                  <Button type="button" variant="solid">Open {name.trim()} <ArrowRight /></Button>
                ) : (
                  <Button type="submit" variant="solid">
                    {step === STEPS.length - 1 ? <>Create workspace <Check /></> : <>Continue <ArrowRight /></>}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="hidden md:block">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Live preview</p>
          <Preview name={name} purpose={purpose} people={people} done={done} />
        </div>
      </div>
    </section>
  );
}
