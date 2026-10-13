import Link from "next/link";
import { siteConfig } from "@/config/site";
import { blocks, currentVersion, registry, templates } from "@/registry";
import { LogoMark } from "./logo";

const link =
  "text-fg underline decoration-white/20 decoration-1 underline-offset-[0.18em] transition-[text-decoration-color] duration-200 hover:decoration-[rgb(var(--neon-accent))]";

function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={link}>
      {children}
    </a>
  );
}

function In({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={link}>
      {children}
    </Link>
  );
}

/** A colophon rather than a link farm: the links live in two sentences. */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[88rem] px-4 pb-10 pt-20 sm:px-6 sm:pt-28">
        <div className="max-w-[62rem] space-y-6 text-[clamp(1.3rem,2.3vw,2.1rem)] leading-[1.38] tracking-[-0.02em] text-muted">
          <p>
            NeonKit is <In href="/components">{registry.length} components</In>,{" "}
            <In href="/blocks">{blocks.length} blocks</In> and <In href="/templates">{templates.length} templates</In> for
            React and Tailwind, made by <Out href={siteConfig.author.site}>{siteConfig.author.name}</Out> and released
            under the <Out href={`${siteConfig.github}/blob/main/LICENSE`}>MIT license</Out>. Start with the{" "}
            <In href="/docs">docs</In>, or see what changed in the <In href="/changelog">changelog</In>.
          </p>
          <p>
            Found a bug? <Out href={`${siteConfig.issues}/new?template=bug-report.yml`}>Open an issue</Out>. Missing
            something? <In href="/request">Request a component</In>. If it saved you a week,{" "}
            <In href="/sponsor">sponsor it</In> or <Out href={siteConfig.sponsor.coffee}>buy a coffee</Out>. Follow along
            on <Out href={siteConfig.author.x}>X</Out> and <Out href={siteConfig.github}>GitHub</Out>.
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-[13.5px] text-muted sm:mt-28 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="NeonKit home" className="inline-flex w-fit items-center gap-2.5 rounded-md text-fg">
            <LogoMark className="size-5" />
            <span className="font-semibold tracking-[-0.02em]">NeonKit</span>
          </Link>
          <p>Set in Mona Sans and Fragment Mono. Signs in Tilt Neon.</p>
          <p>
            © {new Date().getFullYear()} · <span className="font-mono text-[12.5px]">v{currentVersion}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
