"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { neonVars } from "@/lib/neon";
import { color } from "../config";
import { NOTICES } from "../data";
import { AppSidebar } from "./app-sidebar";
import { CommandPalette } from "./command-palette";
import { NAV_ITEMS } from "./nav-items";
import { TopBar } from "./top-bar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      // The template's color is set once here, from config.ts; everything inside follows it.
      style={neonVars(color)}
      shortcut={false}
      className="min-h-screen bg-[#05060a] text-white antialiased"
    >
      <a
        href="#main"
        className="sr-only rounded-lg bg-[#0a0b11] px-3 py-2 text-sm text-white shadow-[0_0_0_1px_rgb(var(--neon)/0.5),0_0_18px_rgb(var(--neon)/0.35)] outline-none focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70]"
      >
        Skip to content
      </a>
      <Console>{children}</Console>
    </SidebarProvider>
  );
}

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

function Console({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { collapsed, setCollapsed, isMobile } = useSidebar();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [notices, setNotices] = React.useState(NOTICES);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setMobileNavOpen((open) => !open);
    else setCollapsed(!collapsed);
  }, [isMobile, collapsed, setCollapsed]);

  const latest = React.useRef({ toggleSidebar, paletteOpen });
  React.useEffect(() => {
    latest.current = { toggleSidebar, paletteOpen };
  });

  // Shortcuts live only while the console is mounted: ⌘K and ⌘B anywhere, "G then a letter" outside text fields.
  React.useEffect(() => {
    let leader = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const key = event.key.toLowerCase();
      const mod = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey;
      if (mod && (key === "k" || event.code === "KeyK")) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (mod && (key === "b" || event.code === "KeyB") && !latest.current.paletteOpen) {
        event.preventDefault();
        latest.current.toggleSidebar();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || typing(event.target) || latest.current.paletteOpen) return;
      if (document.querySelector("dialog[open]")) return;
      if (key === "g") {
        leader = event.timeStamp;
        return;
      }
      if (leader && event.timeStamp - leader < 900) {
        const target = NAV_ITEMS.find((item) => item.keys.endsWith(key.toUpperCase()));
        leader = 0;
        if (target) {
          event.preventDefault();
          router.push(target.url);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const readAll = React.useCallback(() => setNotices((list) => list.map((n) => ({ ...n, unread: false }))), []);
  const read = React.useCallback((id: string) => setNotices((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n))), []);

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <TopBar
          notices={notices}
          onRead={read}
          onReadAll={readAll}
          onOpenPalette={() => setPaletteOpen(true)}
          mobileNavOpen={mobileNavOpen}
          onMobileNavChange={setMobileNavOpen}
        />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-20 pt-8 outline-none sm:px-6 sm:pt-10 lg:px-10">
          {children}
        </main>
      </SidebarInset>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onToggleSidebar={toggleSidebar} onReadAll={readAll} />
      <Toaster position="bottom-right" color={color} />
    </>
  );
}
