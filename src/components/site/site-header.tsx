"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { blocks } from "@/registry";
import { DocsNav } from "./docs-nav";
import { GitHubIcon } from "./icons";
import { Logo } from "./logo";
import { Search } from "./search";

const links = [
  { title: "Docs", href: "/docs" },
  { title: "Components", href: "/components" },
  // Advertised once there's a real gallery, not a single pilot block.
  ...(blocks.length >= 6 ? [{ title: "Blocks", href: "/blocks" }] : []),
  { title: "Use with AI", href: "/docs/ai" },
  { title: "Sponsor", href: "/sponsor" },
];

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-line bg-background/75 backdrop-blur-xl backdrop-saturate-150",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-[88rem] items-center gap-8 px-4 sm:px-6">
        <Link href="/" aria-label="NeonKit home" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/docs"
                ? pathname.startsWith("/docs") && pathname !== "/docs/ai"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13.5px] transition-colors",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {link.title}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Search />
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
          >
            <GitHubIcon className="size-4" />
            <span className="hidden sm:inline">Star</span>
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-white/[0.05] hover:text-fg md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 overflow-y-auto border-t border-line bg-background px-4 pb-16 pt-6 md:hidden">
          <nav aria-label="Site" className="mb-8 grid grid-cols-2 gap-2">
            {[...links, { title: "Request a component", href: "/request" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line px-3 py-2.5 text-[14px] text-fg"
              >
                {link.title}
              </Link>
            ))}
          </nav>
          <DocsNav onNavigate={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
