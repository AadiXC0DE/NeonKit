import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LogoMark } from "./logo";

const columns = [
  {
    title: "Library",
    links: [
      { label: "Components", href: "/components" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Theming", href: "/docs/theming" },
      { label: "Use with AI", href: "/docs/ai" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: siteConfig.github },
      { label: "X / Twitter", href: siteConfig.author.x },
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

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Link href="/" className="inline-flex items-center gap-2.5 text-fg">
            <LogoMark className="size-5" />
            <span className="font-semibold tracking-[-0.02em]">NeonKit</span>
          </Link>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            Neon UI components for React and Tailwind. Free and open source.
          </p>
          <p className="mt-6 text-[13px] text-dim">
            Built by{" "}
            <a href={siteConfig.author.x} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-fg">
              @{siteConfig.author.handle}
            </a>
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{column.title}</h2>
            <ul className="space-y-2.5 text-[14px]">
              {column.links.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <li key={link.label}>
                    {external ? (
                      <a href={link.href} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-fg">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-muted transition-colors hover:text-fg">
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-3 px-4 py-5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim sm:px-6">
          <span>© {new Date().getFullYear()} NeonKit · MIT</span>
          <span>Calm at rest. Lit when it matters.</span>
        </div>
      </div>
    </footer>
  );
}
