import type * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { currentVersion } from "@/registry";
import { LogoMark } from "./logo";

const groups: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Library",
    links: [
      { label: "Components", href: "/components" },
      { label: "Blocks", href: "/blocks" },
      { label: "Templates", href: "/templates" },
      { label: "Icons", href: "/components/icons" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Theming", href: "/docs/theming" },
      { label: "Theme Studio", href: "/theme" },
      { label: "Use with AI", href: "/docs/ai" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: siteConfig.github },
      { label: "X", href: siteConfig.author.x },
      { label: "Request a component", href: "/request" },
      { label: "Report a bug", href: `${siteConfig.issues}/new?template=bug-report.yml` },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Sponsor", href: "/sponsor" },
      { label: "GitHub Sponsors", href: siteConfig.sponsor.github },
      { label: "Buy me a coffee", href: siteConfig.sponsor.coffee },
      { label: "MIT license", href: `${siteConfig.github}/blob/main/LICENSE` },
    ],
  },
];

function FooterLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const style = className ?? "text-[15px] text-muted transition-colors duration-150 hover:text-fg";
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noreferrer" className={style}>
      {children}
    </a>
  ) : (
    <Link href={href} className={style}>
      {children}
    </Link>
  );
}

// Steam stutters like a tube on a tired transformer; with reduced motion it simply holds.
const steam =
  "@keyframes nk-steam{0%,100%{opacity:.9}12%{opacity:.35}18%{opacity:.85}46%{opacity:.6}52%{opacity:.95}78%{opacity:.4}}" +
  ".nk-steam{animation:nk-steam 3.4s linear infinite}" +
  "@media (prefers-reduced-motion:reduce){.nk-steam{animation:none;opacity:.85}}";

/** A coffee mug bent from tube, with steam that flickers like a cheap transformer. */
function NeonMug() {
  const tube = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const shapes = (
    <>
      <path d="M4.5 10h11v5.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V10z" />
      {/* the handle stops short of the cup: blockout where one tube passes the other */}
      <path d="M17 11.5h.75a2.5 2.5 0 0 1 0 5H16.5" />
      <path className="nk-steam" d="M7.5 7.5c-1-1.1 1-2 0-3.3" />
      <path className="nk-steam [animation-delay:-1.1s]" d="M10 7.5c-1-1.1 1-2 0-3.3" />
      <path className="nk-steam [animation-delay:-2.3s]" d="M12.5 7.5c-1-1.1 1-2 0-3.3" />
    </>
  );
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-14 shrink-0 overflow-visible [filter:drop-shadow(0_0_2px_rgb(var(--neon-accent)))_drop-shadow(0_0_10px_rgb(var(--neon-accent)/0.55))]"
    >
      <style>{steam}</style>
      <g {...tube} stroke="rgb(var(--neon-accent))" strokeWidth={1.75}>
        {shapes}
      </g>
      <g {...tube} stroke="#fff" strokeOpacity={0.8} strokeWidth={0.6}>
        {shapes}
      </g>
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[88rem] px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-6">
          {/* Who and why */}
          <div className="lg:col-span-5">
            <Link href="/" aria-label="NeonKit home" className="inline-flex items-center gap-2.5 rounded-md text-fg">
              <LogoMark className="size-6" />
              <span className="text-[17px] font-semibold tracking-[-0.02em]">NeonKit</span>
            </Link>
            <p className="mt-4 max-w-[24rem] text-[15px] leading-[1.6] text-muted">
              Neon UI components for React and Tailwind. Free, open source, and yours once installed.
            </p>
            <p className="mt-3 text-[15px] text-muted">
              Made by{" "}
              <FooterLink href={siteConfig.author.site} className="text-fg underline decoration-white/25 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]">
                {siteConfig.author.name}
              </FooterLink>
            </p>

            <div className="mt-10 flex items-center gap-5">
              <NeonMug />
              <div>
                <p className="text-[16px] font-medium leading-snug text-fg">If NeonKit saved you a week, buy a coffee.</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <FooterLink
                    href={siteConfig.sponsor.coffee}
                    className="inline-flex h-9 items-center rounded-lg bg-[rgb(var(--neon-accent))] px-4 text-[14px] font-medium text-[#05060a] shadow-[0_0_18px_-4px_rgb(var(--neon-accent)/0.7)] transition-[filter] hover:brightness-110"
                  >
                    Buy me a coffee
                  </FooterLink>
                  <FooterLink
                    href="/sponsor"
                    className="text-[14px] font-medium text-fg underline decoration-white/25 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]"
                  >
                    Sponsor NeonKit
                  </FooterLink>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-7">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-[14px] font-medium text-fg">{group.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((item) => (
                    <li key={item.label}>
                      <FooterLink href={item.href}>{item.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 text-[13.5px] text-muted sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} NeonKit · MIT · <span className="font-mono text-[12.5px]">v{currentVersion}</span>
          </p>
          <p>Calm at rest. Lit when it matters.</p>
        </div>
      </div>
    </footer>
  );
}
