import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Coffee, Heart, Megaphone, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NeonText } from "@/components/ui/neon-text";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GitHubIcon } from "@/components/site/icons";
import { PageShell } from "@/components/site/page-shell";
import { shareOnX, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sponsor",
  description:
    "NeonKit is free and MIT licensed. Sponsor on GitHub, buy the maker a coffee, star the repo or tell a friend.",
  alternates: { canonical: "/sponsor" },
};

const ways = [
  {
    icon: Heart,
    color: "pink",
    kicker: "Monthly",
    title: "GitHub Sponsors",
    body: "Recurring support funds new components and keeps the docs current as React and Tailwind move.",
    cta: "Sponsor on GitHub",
    href: siteConfig.sponsor.github,
  },
  {
    icon: Coffee,
    color: "amber",
    kicker: "One-off",
    title: "Buy me a coffee",
    body: "Most of NeonKit was built after midnight. A coffee keeps the night shift going.",
    cta: "Buy a coffee",
    href: siteConfig.sponsor.coffee,
  },
  {
    icon: Star,
    color: "cyan",
    kicker: "Free",
    title: "Star the repo",
    body: "Stars are how other developers find it. It takes one click and it genuinely helps.",
    cta: "Star on GitHub",
    href: siteConfig.github,
  },
  {
    icon: Megaphone,
    color: "lime",
    kicker: "Free",
    title: "Tell someone",
    body: "Post it, drop it in your team chat, or credit it in your README. Word of mouth beats any ad.",
    cta: "Share on X",
    href: shareOnX(`NeonKit: neon UI components for React and Tailwind, installable with the shadcn CLI. By @${siteConfig.author.handle}`),
  },
] as const;

export default function SponsorPage() {
  return (
    <PageShell>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Sponsor</p>
          <h1 className="text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
            Keep the lights on.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            NeonKit is free, MIT licensed and built by one person. If it saved you an afternoon, here&apos;s how to keep
            the sign lit.
          </p>
        </div>
        <div aria-hidden className="hidden rounded-[24px] border border-white/[0.05] px-10 py-6 lg:block">
          <NeonText color="pink" buzz className="font-neon text-6xl">
            tips welcome
          </NeonText>
        </div>
      </div>

      <div className="mt-16 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ways.map(({ icon: Icon, color, kicker, title, body, cta, href }) => (
          <SpotlightCard key={title} color={color} className="flex min-h-[300px] flex-col p-6">
            <div className="flex items-center justify-between">
              <Icon className="size-5 text-white/60" strokeWidth={1.5} />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{kicker}</span>
            </div>
            <h2 className="mt-auto pt-12 text-xl font-semibold tracking-[-0.02em] text-fg">{title}</h2>
            <p className="mt-2 min-h-[4.75em] text-[14.5px] leading-relaxed text-muted">{body}</p>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-[rgb(var(--neon))] transition-[text-shadow] hover:[text-shadow:0_0_12px_rgb(var(--neon)/0.7)]"
            >
              {cta} <ArrowUpRight className="size-4" />
            </a>
          </SpotlightCard>
        ))}
      </div>

      <section aria-labelledby="maker" className="mt-24 grid gap-10 border-t border-line pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Meet the maker</p>
          <div className="mt-6 flex items-center gap-4">
            <Avatar src="https://github.com/AadiXC0DE.png?size=160" alt={siteConfig.author.name} size="xl" ring />
            <div>
              <h2 id="maker" className="text-xl font-semibold tracking-[-0.02em] text-fg">
                {siteConfig.author.name}
              </h2>
              <p className="text-[14px] text-muted">Design engineer</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 text-[16px] leading-relaxed text-muted">
          <p>
            I&apos;m Aadi, a design engineer at Ownpath. Before that I worked with Philips, Hero MotoCorp and Koolio, and
            had one exit when Adda247 acquired Symmulate.
          </p>
          <p>
            NeonKit started as an excuse to obsess over the small stuff: how a switch should feel when it turns on, how a
            focus ring can glow without shouting. It&apos;s a side project, and sponsorships are what turn evenings into
            new components.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[14px]">
            <a href={siteConfig.author.site} target="_blank" rel="noreferrer" className="text-fg underline decoration-white/20 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]">
              heyaadi.com
            </a>
            <a href={siteConfig.author.x} target="_blank" rel="noreferrer" className="text-fg underline decoration-white/20 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]">
              @{siteConfig.author.handle} on X
            </a>
            <a href={siteConfig.author.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-fg underline decoration-white/20 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]">
              <GitHubIcon className="size-3.5" /> AadiXC0DE
            </a>
          </div>
        </div>
      </section>

      <section className="mt-20 flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-white/[0.015] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.015em] text-fg">Ideas, bugs, or just saying hi?</h2>
          <p className="mt-1 text-[15px] text-muted">Feedback shapes what gets built next.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={siteConfig.author.x} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-[14px] text-fg transition-colors hover:border-line-strong">
            Message on X
          </a>
          <Link href="/request" className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-[14px] text-fg transition-colors hover:border-line-strong">
            Request a component
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
