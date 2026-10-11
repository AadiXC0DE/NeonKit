import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-4 px-4 py-8 text-[13px] text-dim sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-4" />
          <span>
            Built by{" "}
            <a href={siteConfig.authorUrl} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-fg">
              {siteConfig.author}
            </a>
            . MIT licensed.
          </span>
        </div>
        <div className="flex gap-5">
          <Link href="/docs" className="transition-colors hover:text-fg">Docs</Link>
          <Link href="/components" className="transition-colors hover:text-fg">Components</Link>
          <a href={siteConfig.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
