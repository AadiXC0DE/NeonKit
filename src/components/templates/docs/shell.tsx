"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "@/components/ui/icons";

import { KbdCombo } from "@/components/ui/kbd";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

import { TabChoiceProvider } from "./code";
import { color, repoStars, repoUrl, version } from "./config";
import { docHref, findDoc, slugFromPathname } from "./docs";
import { GitHubIcon, Wordmark } from "./logo";
import { DocsSidebar, MobileNav } from "./nav";
import { SearchDialog } from "./search";
import { focusRing } from "./styles";
import { TableOfContents } from "./toc";

const subscribeNever = () => () => {};

/** ⌘ on Apple devices, Ctrl elsewhere. The server renders ⌘. */
function useModifierKey() {
  return React.useSyncExternalStore(
    subscribeNever,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = slugFromPathname(pathname);
  const doc = findDoc(slug);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const mod = useModifierKey();

  // ⌘K toggles search anywhere in the docs; "/" opens it unless you're typing somewhere.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const k = event.key.toLowerCase() === "k" || event.code === "KeyK";
      if (k && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div style={neonVars(color)} className="min-h-screen bg-[#05060a] text-white antialiased">
      <a
        href="#content"
        className={cn(
          "fixed left-3 top-3 z-[70] -translate-y-20 rounded-lg bg-[rgb(var(--neon))] px-4 py-2 text-sm font-medium text-[#05060a]",
          "transition-transform duration-200 focus:translate-y-0",
          focusRing,
        )}
      >
        Skip to content
      </a>

      <TabChoiceProvider>
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <header className="sticky top-0 z-40 h-14 border-b border-white/[0.07] bg-[#05060a]/80 backdrop-blur-[12px]">
            <div className="mx-auto flex h-full max-w-[1520px] items-center">
              <div className="flex items-center gap-1.5 pl-2 sm:pl-4 lg:w-[264px] lg:shrink-0 lg:gap-2.5 lg:pl-7">
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open navigation"
                    className={cn(
                      "grid size-9 cursor-pointer place-items-center rounded-lg text-white/70 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white lg:hidden",
                      focusRing,
                    )}
                  >
                    <Menu aria-hidden className="size-[18px]" />
                  </button>
                </SheetTrigger>
                <Link href={docHref("")} className={cn("rounded-md py-1 pr-1", focusRing)}>
                  <Wordmark />
                  <span className="sr-only"> home</span>
                </Link>
                <a
                  href={`${repoUrl}/releases/tag/v${version}`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "ml-0.5 hidden rounded-md px-1.5 py-1 font-mono text-[12px] tabular-nums text-white/50 transition-colors duration-150 hover:text-white sm:block",
                    focusRing,
                  )}
                >
                  <span className="sr-only">Release notes for version </span>
                  {version}
                </a>
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 pr-2 sm:gap-3 sm:pr-5 lg:justify-between lg:pl-14 lg:pr-7">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-keyshortcuts="Meta+K Control+K /"
                  className={cn(
                    "group hidden h-9 w-[min(100%,340px)] cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] pl-3 pr-1.5 text-sm text-white/60 md:flex",
                    "transition-[border-color,color,box-shadow] duration-150 hover:border-white/20 hover:text-white/85",
                    focusRing,
                  )}
                >
                  <Search aria-hidden className="size-4 text-white/50 transition-colors group-hover:text-white/80" />
                  Search docs
                  <KbdCombo keys={[mod, "K"]} size="sm" separator={null} listen className="ml-auto" />
                </button>
                <button
                  type="button"
                  aria-label="Search docs"
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "grid size-9 cursor-pointer place-items-center rounded-lg text-white/70 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white md:hidden",
                    focusRing,
                  )}
                >
                  <Search aria-hidden className="size-[18px]" />
                </button>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-white/70 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white sm:px-2.5",
                    focusRing,
                  )}
                >
                  <GitHubIcon className="size-[18px]" />
                  <span className="sr-only">Gantry on GitHub, </span>
                  <span className="hidden font-mono text-xs tabular-nums sm:inline">
                    {repoStars}
                    <span className="sr-only"> stars</span>
                  </span>
                </a>
              </div>
            </div>
          </header>

          <MobileNav
            slug={slug}
            onSearch={() => {
              setNavOpen(false);
              setSearchOpen(true);
            }}
          />
        </Sheet>

        <SidebarProvider shortcut={false} className="mx-auto max-w-[1520px]">
          <DocsSidebar slug={slug} />
          <div className="flex min-w-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <main id="content" tabIndex={-1} className="flex-1 px-5 pb-20 pt-10 outline-none sm:px-10 sm:pt-14 lg:px-14">
                {children}
              </main>
              <SiteFooter />
            </div>
            {doc && (
              <aside aria-label="Table of contents" className="hidden w-[248px] shrink-0 xl:block">
                <div className="sticky top-14 flex max-h-[calc(100svh-3.5rem)] flex-col pb-8 pr-8 pt-14">
                  <TableOfContents key={doc.slug} doc={doc} />
                </div>
              </aside>
            )}
          </div>
        </SidebarProvider>

        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </TabChoiceProvider>
    </div>
  );
}

function SiteFooter() {
  const links = [
    { label: "GitHub", href: repoUrl },
    { label: "Releases", href: `${repoUrl}/releases` },
    { label: "Discussions", href: `${repoUrl}/discussions` },
  ];
  return (
    <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-10 lg:px-14">
      <div className="flex max-w-[760px] flex-col gap-4 text-[13px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Gantry contributors. Released under the MIT license.</p>
        <ul className="flex gap-5">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={cn("rounded-md transition-colors duration-150 hover:text-white", focusRing)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
