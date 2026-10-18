import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { NeonText } from "@/components/ui/neon-text";
import { ArrowUpRight } from "@/components/ui/icons";
import { GitHubIcon } from "@/components/site/icons";
import { PageShell } from "@/components/site/page-shell";
import { PageHeader, textLink } from "@/components/site/prose";
import { shareOnX, siteConfig } from "@/config/site";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sponsor",
  description:
    "NeonKit is free and MIT licensed. Sponsor on GitHub, buy the maker a coffee, star the repo or tell a friend.",
  alternates: { canonical: "/sponsor" },
};

const ways = [
  {
    color: "pink",
    when: "Monthly",
    title: "GitHub Sponsors",
    body: "Recurring support pays for new components and keeps the docs current as React and Tailwind move.",
    cta: "Sponsor on GitHub",
    href: siteConfig.sponsor.github,
  },
  {
    color: "amber",
    when: "Once",
    title: "Buy a coffee",
    body: "Most of NeonKit was built after midnight. A coffee keeps the night shift going.",
    cta: "Buy a coffee",
    href: siteConfig.sponsor.coffee,
  },
  {
    color: "cyan",
    when: "Free",
    title: "Star the repo",
    body: "Stars are how other developers find it. One click, and it genuinely helps.",
    cta: "Star on GitHub",
    href: siteConfig.github,
  },
  {
    color: "lime",
    when: "Free",
    title: "Tell someone",
    body: "Post it, drop it in your team chat, or credit it in a README. Word of mouth beats any ad.",
    cta: "Share on X",
    href: shareOnX(`NeonKit: neon UI components for React and Tailwind, installable with the shadcn CLI. By @${siteConfig.author.handle}`),
  },
] as const;

export default function SponsorPage() {
  return (
    <PageShell>
      <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
        <PageHeader title="Keep the lights on." size="lg" className="mb-0 sm:mb-0 lg:col-span-7">
          NeonKit is free, MIT licensed and made by one person. If it saved you an afternoon, here&apos;s how to keep the
          sign lit.
        </PageHeader>
        <div aria-hidden className="hidden justify-end lg:col-span-5 lg:flex">
          <div className="rounded-[24px] border border-white/[0.05] px-10 py-6">
            <NeonText color="pink" buzz className="font-neon text-6xl">
              tips welcome
            </NeonText>
          </div>
        </div>
      </div>

      <ul className="mt-24 border-t border-white/[0.08] sm:mt-28">
        {ways.map(({ color, when, title, body, cta, href }) => (
          <li
            key={title}
            style={neonVars(color)}
            className="group grid gap-3 border-b border-white/[0.08] py-8 sm:py-10 lg:grid-cols-12 lg:items-baseline lg:gap-8"
          >
            <div className="flex items-baseline gap-4 lg:col-span-4">
              <span
                aria-hidden
                className="h-5 w-[5px] shrink-0 self-center rounded-full bg-[rgb(var(--neon))] opacity-40 transition-[opacity,box-shadow] duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_6px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.6)]"
              />
              <h2 className="type-display text-[clamp(1.6rem,2.4vw,2.1rem)] text-fg">{title}</h2>
              <span className="text-[13.5px] text-muted">{when}</span>
            </div>
            <p className="max-w-[34rem] pl-[21px] text-[15.5px] leading-[1.6] text-muted lg:col-span-5 lg:pl-0">
              {body}
            </p>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1.5 pl-[21px] text-[15px] font-medium text-fg underline decoration-white/25 underline-offset-[0.22em] transition-[text-decoration-color] hover:decoration-[rgb(var(--neon))] lg:col-span-3 lg:justify-self-end lg:pl-0"
            >
              {cta} <ArrowUpRight size={15} />
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="maker" className="mt-32 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <h2 id="maker" className="type-display text-[clamp(1.75rem,2.6vw,2.25rem)] text-fg">
            Who makes it
          </h2>
          <div className="mt-8 flex items-center gap-4">
            <Avatar src="https://github.com/AadiXC0DE.png?size=160" alt={siteConfig.author.name} size="xl" ring />
            <div>
              <p className="text-[16px] font-medium text-fg">{siteConfig.author.name}</p>
              <p className="text-[14px] text-muted">Design engineer</p>
            </div>
          </div>
        </div>
        <div className="max-w-[40rem] space-y-5 text-[16.5px] leading-[1.65] text-muted lg:col-span-7 lg:col-start-6">
          <p>
            I&apos;m Aadi, a design engineer at Ownpath. Before that I worked with Philips, Hero MotoCorp and Koolio, and
            had one exit when Adda247 acquired Symmulate.
          </p>
          <p>
            NeonKit started as an excuse to obsess over the small stuff: how a switch should feel when it turns on, how a
            focus ring can glow without shouting. It&apos;s a side project, and sponsorships are what turn evenings into
            new components.
          </p>
          <p>
            Ideas, bugs, or just saying hi?{" "}
            <a href={siteConfig.author.x} target="_blank" rel="noreferrer" className={textLink}>
              Message me on X
            </a>{" "}
            or{" "}
            <Link href="/request" className={textLink}>
              request a component
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[14.5px]">
            <a href={siteConfig.author.site} target="_blank" rel="noreferrer" className={textLink}>
              heyaadi.com
            </a>
            <a href={siteConfig.author.x} target="_blank" rel="noreferrer" className={textLink}>
              @{siteConfig.author.handle} on X
            </a>
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noreferrer"
              className={cn(textLink, "inline-flex items-center gap-1.5")}
            >
              <GitHubIcon className="size-3.5" /> AadiXC0DE
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
