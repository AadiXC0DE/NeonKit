"use client";

import * as React from "react";
import { Bell, GitBranch, Mail, Volume1, Volume2, Waves } from "lucide-react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Kbd, KbdCombo } from "@/components/ui/kbd";
import { OTPInput } from "@/components/ui/otp-input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast, Toaster } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

function Tile({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex flex-col rounded-2xl border border-line bg-white/[0.015] p-5 sm:p-6", className)}>
      <p className="mb-6 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{label}</p>
      {children}
    </div>
  );
}

function SignIn() {
  return (
    <Tile label="input · checkbox · button" className="md:col-span-6 lg:col-span-4 lg:row-span-2">
      <div className="flex flex-1 flex-col">
        <h3 className="text-xl font-semibold tracking-[-0.02em] text-fg">Sign in to Nightshift</h3>
        <p className="mt-1 text-[14px] text-muted">The night crew&apos;s dashboard.</p>
        <form className="mt-8 flex flex-1 flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Email" type="email" placeholder="ana@acme.dev" leading={<Mail />} autoComplete="off" />
          <Input label="Password" type="password" placeholder="••••••••••" autoComplete="off" />
          <Checkbox label="Keep me signed in" defaultChecked size="sm" />
          <div className="mt-auto grid gap-2 pt-6">
            <Button
              type="submit"
              variant="solid"
              onClick={() => toast.success("Signed in", { description: "Welcome back, Ana." })}
            >
              Continue
            </Button>
            <Button type="button" variant="ghost">
              Use a passkey instead
            </Button>
          </div>
        </form>
      </div>
    </Tile>
  );
}

const steps = [
  { label: "Install", value: 100 },
  { label: "Build", value: 64 },
  { label: "Deploy", value: 0 },
];

function Deploy() {
  const [build, setBuild] = React.useState(64);

  React.useEffect(() => {
    const id = setInterval(() => setBuild((v) => (v >= 100 ? 18 : Math.min(100, v + 3))), 420);
    return () => clearInterval(id);
  }, []);

  return (
    <Tile label="tabs · progress · badge · border beam" className="md:col-span-6 lg:col-span-8">
      <BorderBeam duration={7} className="rounded-xl border border-line bg-background/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <GitBranch className="size-4 text-muted" />
            <span className="font-medium text-fg">nightshift-web</span>
            <span className="font-mono text-[12px] text-dim">main · 4f2a91c</span>
          </div>
          <Badge dot pulse>
            {build >= 100 ? "Ready" : "Building"}
          </Badge>
        </div>
        <Tabs defaultValue="overview" variant="underline" className="px-5 pb-5 pt-2">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="env">Environment</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="grid gap-5 pt-5 sm:grid-cols-3">
            {steps.map((step) => {
              const value = step.label === "Build" ? build : step.label === "Deploy" ? (build >= 100 ? 100 : 0) : step.value;
              return (
                <Progress
                  key={step.label}
                  value={value}
                  label={step.label}
                  showValue
                  size="sm"
                  color={value >= 100 ? "green" : undefined}
                />
              );
            })}
          </TabsContent>
          <TabsContent value="logs" className="pt-4">
            <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-muted">
              {`> next build\n  ✓ Compiled successfully in 8.2s\n  ✓ Generating static pages (34/34)\n  ○ /components/[slug]  26 paths`}
            </pre>
          </TabsContent>
          <TabsContent value="env" className="pt-4 font-mono text-[12px] text-muted">
            NEXT_PUBLIC_SITE_URL <span className="text-dim">=</span> https://nightshift.dev
          </TabsContent>
        </Tabs>
      </BorderBeam>
    </Tile>
  );
}

function Notifications() {
  return (
    <Tile label="switch" className="md:col-span-3 lg:col-span-4">
      <ul className="divide-y divide-line">
        {[
          { title: "Deploy alerts", body: "When a build fails or ships.", on: true },
          { title: "Mentions", body: "Someone tags you in a review.", on: true },
          { title: "Weekly digest", body: "Mondays, 9am your time.", on: false },
        ].map((row) => (
          <li key={row.title} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-[14px] text-fg">{row.title}</p>
              <p className="text-[13px] text-dim">{row.body}</p>
            </div>
            <Switch defaultChecked={row.on} aria-label={row.title} />
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function Verify() {
  const [state, setState] = React.useState<"idle" | "ok" | "bad">("idle");
  return (
    <Tile label="otp input" className="md:col-span-3 lg:col-span-4">
      <p className="text-[14px] text-fg">Check your inbox</p>
      <p className="text-[13px] text-dim">
        Enter the code sent to ana@acme.dev. Try <span className="font-mono text-muted">424242</span>.
      </p>
      <OTPInput
        className="mt-5"
        groupSize={3}
        invalid={state === "bad"}
        onValueChange={() => setState("idle")}
        onComplete={(code) => {
          const ok = code === "424242";
          setState(ok ? "ok" : "bad");
          if (ok) toast.success("Verified", { description: "You're in." });
        }}
      />
      <p className={cn("mt-4 font-mono text-[11px]", state === "bad" ? "text-[rgb(255_77_94)]" : "text-dim")}>
        {state === "bad" ? "That code didn't match." : state === "ok" ? "Verified." : "Resend in 0:24"}
      </p>
    </Tile>
  );
}

function Studio() {
  const [volume, setVolume] = React.useState([62]);
  return (
    <Tile label="slider · select" className="md:col-span-3 lg:col-span-4">
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between text-[13px]">
            <span className="text-fg">Volume</span>
            <span className="font-mono tabular-nums text-dim">{volume[0]}%</span>
          </div>
          <div className="flex items-center gap-3 text-dim">
            <Volume1 className="size-4 shrink-0" />
            <Slider value={volume} onValueChange={setVolume} aria-label="Volume" />
            <Volume2 className="size-4 shrink-0" />
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between text-[13px]">
            <span className="text-fg">Low cut</span>
            <span className="font-mono text-dim">Hz</span>
          </div>
          <Slider defaultValue={[80, 320]} min={20} max={500} showValue="hover" thumbLabels={["From", "To"]} />
        </div>
        <Select
          aria-label="Output"
          defaultValue="studio"
          options={[
            { value: "studio", label: "Studio monitors", icon: <Waves /> },
            { value: "laptop", label: "MacBook speakers", icon: <Volume2 /> },
            { value: "airpods", label: "Ana's AirPods", icon: <Bell /> },
          ]}
        />
      </div>
    </Tile>
  );
}

function Shortcuts() {
  return (
    <Tile label="kbd · toast" className="md:col-span-3 lg:col-span-4">
      <p className="text-[14px] text-fg">Hold a key</p>
      <p className="text-[13px] text-dim">These keys light up while you press them.</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <KbdCombo keys={["⌘", "K"]} listen />
        <span className="text-dim">·</span>
        <KbdCombo keys={["⇧", "Enter"]} listen />
        <span className="text-dim">·</span>
        <Kbd listen="Escape">Esc</Kbd>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Button size="sm" onClick={() => toast("Saved to drafts")}>
          Save
        </Button>
        <Button
          size="sm"
          color="red"
          variant="soft"
          onClick={() =>
            toast.error("Deploy failed", {
              description: "Build exited with code 1.",
              action: { label: "View logs", onClick: () => toast.info("Opening logs…") },
            })
          }
        >
          Break the build
        </Button>
      </div>
    </Tile>
  );
}

const crew = [
  { name: "Ana Ortiz", status: "online" as const, role: "On call" },
  { name: "Kenji Mori", status: "busy" as const, role: "In review" },
  { name: "Priya Nair", status: "away" as const, role: "Back at 2am" },
  { name: "Leo Brandt", status: "online" as const, role: "Shipping" },
];

function Crew() {
  return (
    <Tile label="avatar · tooltip" className="md:col-span-6 lg:col-span-4">
      <p className="text-[14px] text-fg">Tonight&apos;s crew</p>
      <p className="text-[13px] text-dim">Hover a face.</p>
      <div className="mt-5 flex items-center justify-between">
        <AvatarGroup size="lg">
          {crew.map((person) => (
            <Tooltip key={person.name} content={`${person.name} · ${person.role}`}>
              <span tabIndex={0} className="rounded-full outline-none">
                <Avatar alt={person.name} status={person.status} size="lg" />
              </span>
            </Tooltip>
          ))}
        </AvatarGroup>
        <Badge variant="outline" size="sm">
          4 online
        </Badge>
      </div>
    </Tile>
  );
}

export function Showcase() {
  return (
    <section id="showcase" className="mx-auto max-w-[88rem] px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading index="02" label="Live" title={<>Lit when<br className="hidden sm:block" /> it matters.</>}>
        Resting UI stays quiet. Light marks focus, selection and progress, so a glance tells you what&apos;s going on.
        Everything below works. Try the knob again.
      </SectionHeading>
      <div className="grid gap-3 md:grid-cols-6 lg:grid-cols-12">
        <SignIn />
        <Deploy />
        <Notifications />
        <Verify />
        <Studio />
        <Shortcuts />
        <Crew />
      </div>
      <Toaster />
    </section>
  );
}
