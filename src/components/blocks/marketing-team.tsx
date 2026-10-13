"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HologramCard } from "@/components/ui/hologram-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";

type Discipline = "design" | "engineering" | "production";

const TEAM: {
  name: string;
  initials: string;
  role: string;
  discipline: Discipline;
  city: string;
  since: number;
  fact: string;
}[] = [
  { name: "Marta Abreu", initials: "MA", role: "Founder, design direction", discipline: "design", city: "Lisbon", since: 2019, fact: "Has redrawn the studio logo eleven times. Shipped one of them." },
  { name: "Joost Verhagen", initials: "JV", role: "Engineering lead", discipline: "engineering", city: "Rotterdam", since: 2019, fact: "Keeps a paper log of every production incident since 2017. Volume four." },
  { name: "Inês Carvalho", initials: "IC", role: "Product designer", discipline: "design", city: "Lisbon", since: 2021, fact: "Will defend 13px body text to anyone, at length, with printouts." },
  { name: "Teo Park", initials: "TP", role: "Frontend engineer", discipline: "engineering", city: "Seoul, remote", since: 2022, fact: "Wrote our deploy script on a train with no signal. It still runs." },
  { name: "Hana Okafor", initials: "HO", role: "Producer", discipline: "production", city: "Rotterdam", since: 2020, fact: "Opens every kickoff with: what would make this a bad project?" },
  { name: "Rui Salgado", initials: "RS", role: "Motion designer", discipline: "design", city: "Lisbon", since: 2023, fact: "Owns 41 saved easing curves. Uses two. Won't say which." },
];

const ROLES = [
  { title: "Senior design engineer", place: "Lisbon or remote, EU", terms: "Full-time", href: "#" },
  { title: "Backend engineer, Elixir", place: "Rotterdam", terms: "Full-time", href: "#" },
  { title: "Studio manager", place: "Lisbon", terms: "4 days a week", href: "#" },
];

const FILTERS: { value: "all" | Discipline; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "production", label: "Production" },
];

// Each card gets its own tide chart: a stack of sine lines with one lit.
function TideArt({ seed }: { seed: number }) {
  const lines = Array.from({ length: 9 }, (_, i) => {
    const amp = 4 + ((seed * 7 + i * 3) % 9);
    const freq = 0.018 + ((seed + i) % 4) * 0.004;
    const phase = seed * 1.7 + i * 0.6;
    const y = 34 + i * 17;
    let d = "";
    for (let x = 0; x <= 320; x += 8) {
      d += `${x === 0 ? "M" : "L"}${x} ${(y + Math.sin(x * freq + phase) * amp).toFixed(1)}`;
    }
    return d;
  });
  const lit = 1 + (seed % 3);

  return (
    <svg aria-hidden viewBox="0 0 320 200" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
      {lines.map((d, i) =>
        i === lit ? null : <path key={i} d={d} stroke="rgb(var(--neon) / 0.16)" strokeWidth={1.25} />,
      )}
      <path
        d={lines[lit]}
        stroke="rgb(var(--neon))"
        strokeWidth={3}
        className="opacity-40 transition-opacity duration-300 [filter:blur(3px)] group-hover/card:opacity-100"
      />
      <path d={lines[lit]} stroke="color-mix(in srgb, rgb(var(--neon)) 45%, white)" strokeWidth={1.5} />
    </svg>
  );
}

function MemberCard({ member, index }: { member: (typeof TEAM)[number]; index: number }) {
  return (
    <HologramCard
      foil="lines"
      maxTilt={9}
      intensity={0.8}
      className="group/card flex w-[78vw] max-w-[320px] shrink-0 flex-col snap-start overflow-hidden rounded-[20px] sm:w-auto sm:max-w-none"
    >
      <div className="relative h-44 overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(ellipse_90%_70%_at_70%_100%,rgb(var(--neon)/0.12),transparent_70%),#07080d] sm:h-52">
        <TideArt seed={index + 3} />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
          <span>LT/{String(index + 1).padStart(2, "0")}</span>
          <span>{member.city}</span>
        </div>
        <span className="absolute bottom-3 left-4 text-[64px] font-semibold leading-none tracking-[-0.06em] text-white/90 [text-shadow:0_2px_24px_#07080d]">
          {member.initials}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-medium tracking-[-0.01em] text-white/90">{member.name}</h3>
        <p className="mt-0.5 text-sm text-white/55">{member.role}</p>
        <p className="mt-5 border-t border-white/[0.06] pt-4 text-[13px] leading-relaxed text-white/70">
          {member.fact}
        </p>
        <p className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Since {member.since}</p>
      </div>
    </HologramCard>
  );
}

export default function MarketingTeam() {
  const [filter, setFilter] = React.useState<"all" | Discipline>("all");
  const shown = TEAM.map((member, index) => ({ member, index })).filter(
    ({ member }) => filter === "all" || member.discipline === filter,
  );

  return (
    <section
      aria-labelledby="lowtide-team-title"
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="relative isolate overflow-hidden bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.07)] blur-[120px]" />

      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Lowtide Studio · The people</p>
            <h2
              id="lowtide-team-title"
              className="mt-5 text-[clamp(2.4rem,5.6vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
            >
              Six people,
              <br />
              <span className="text-white/45">one long table.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="max-w-md text-[15px] leading-relaxed text-white/55">
              A product studio split between Lisbon and Rotterdam. We take four clients a year and stay on until
              the thing works, which is usually longer than anyone planned.
            </p>
            <dl className="mt-6 grid max-w-md grid-cols-3 border-t border-white/[0.08] pt-4">
              {[
                ["2019", "Founded"],
                ["38", "Shipped"],
                ["4.6 yrs", "Avg. stay"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</dt>
                  <dd className="mt-1 text-lg font-medium tracking-[-0.02em] text-white/90">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 sm:mt-16">
          <ToggleGroup
            aria-label="Filter by discipline"
            value={filter}
            onValueChange={(value) => setFilter(value as typeof filter)}
            size="sm"
            className="max-w-full overflow-x-auto"
          >
            {FILTERS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p aria-live="polite" className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
            {String(shown.length).padStart(2, "0")} / {String(TEAM.length).padStart(2, "0")} shown
          </p>
        </div>

        <ul
          aria-label="Team members"
          className="-mx-6 mt-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        >
          {shown.map(({ member, index }) => (
            <li key={member.name} className="contents">
              <MemberCard member={member} index={index} />
            </li>
          ))}
        </ul>

        <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] sm:mt-20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-6">
            <h3 className="flex items-center gap-3 text-base font-medium tracking-[-0.01em] text-white/90">
              We&apos;re hiring
              <Badge variant="outline" size="sm" pulse>
                3 roles
              </Badge>
            </h3>
            <p className="text-sm text-white/45">Paid trial week. No take-home tests.</p>
          </div>
          <ul>
            {ROLES.map((role, i) => (
              <li key={role.title} className="border-b border-white/[0.06] last:border-b-0">
                <a
                  href={role.href}
                  className="group/role grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 outline-none transition-colors duration-200 hover:bg-[rgb(var(--neon)/0.05)] focus-visible:bg-[rgb(var(--neon)/0.06)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)] lg:grid-cols-[3rem_1fr_14rem_8rem_auto] sm:px-6"
                >
                  <span className="font-mono text-[11px] text-white/35">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[15px] text-white/90 transition-colors duration-200 group-hover/role:text-white">
                    {role.title}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 text-white/35 transition-[color,transform] duration-200 group-hover/role:-translate-y-0.5 group-hover/role:translate-x-0.5 group-hover/role:text-[rgb(var(--neon))] lg:order-last"
                  />
                  <span className="col-start-2 text-[13px] text-white/50 lg:col-start-auto">
                    {role.place}
                    <span className="lg:hidden"> · {role.terms}</span>
                  </span>
                  <span className="hidden text-[13px] text-white/50 lg:block">{role.terms}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
