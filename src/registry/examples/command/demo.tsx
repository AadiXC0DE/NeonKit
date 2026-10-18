"use client";

import * as React from "react";
import {
  Activity,
  Box,
  Copy,
  GitBranch,
  LayoutDashboard,
  Rocket,
  RotateCcw,
  ScrollText,
  Search,
  Settings,
  Terminal,
  UserPlus,
} from "@/components/ui/icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd, KbdCombo } from "@/components/ui/kbd";
import { neonColors, neonVars, type NeonColorName } from "@/lib/neon";

const themes: { value: NeonColorName; label: string }[] = [
  { value: "cyan", label: "Cyan" },
  { value: "magenta", label: "Magenta" },
  { value: "lime", label: "Lime" },
  { value: "amber", label: "Amber" },
];

const pages = [
  { label: "Go to Dashboard", icon: <LayoutDashboard />, shortcut: "G D" },
  { label: "Go to Deployments", icon: <Rocket />, shortcut: "G P", keywords: ["builds", "releases"] },
  { label: "Go to Logs", icon: <ScrollText />, shortcut: "G L", keywords: ["runtime", "errors", "output"] },
  { label: "Go to Observability", icon: <Activity />, keywords: ["analytics", "metrics", "latency"] },
  { label: "Go to Settings", icon: <Settings />, shortcut: "⌘,", keywords: ["preferences", "domains", "env"] },
];

const actions = [
  { label: "Deploy main to production", icon: <Rocket />, shortcut: "⌘⇧D", keywords: ["ship", "release"] },
  { label: "Roll back to previous deployment", icon: <RotateCcw />, keywords: ["revert", "undo"] },
  { label: "Create preview from branch", icon: <GitBranch />, keywords: ["pull request", "pr"] },
  { label: "Copy production URL", icon: <Copy />, shortcut: "⌘⇧C", keywords: ["link", "domain"] },
  { label: "Invite teammate", icon: <UserPlus />, keywords: ["member", "team", "add"] },
  { label: "Open shell", icon: <Terminal />, keywords: ["ssh", "console"], disabled: true },
];

export default function CommandDemo() {
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<NeonColorName>();
  const [last, setLast] = React.useState<string>();

  // ⌘K belongs to the docs search on this site, so the demo listens for ⌘J.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "j" || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      event.preventDefault();
      setOpen((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function run(label: string) {
    setLast(label);
    setOpen(false);
  }

  return (
    <div style={neonVars(theme)} className="flex w-full max-w-sm flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] pl-3 pr-2 text-sm text-white/40 outline-none transition-[border-color,color] duration-150 hover:border-white/20 hover:text-white/60 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search or run a command…</span>
        <KbdCombo keys={["⌘", "J"]} size="sm" separator={null} listen />
      </button>
      <p aria-live="polite" className="h-5 text-xs text-white/40">
        {last ? (
          <>
            Ran <span className="text-white/75">{last}</span>
          </>
        ) : (
          "Press ⌘J anywhere on the page."
        )}
      </p>

      <CommandDialog open={open} onOpenChange={setOpen} label="Acme commands" color={theme}>
        <CommandInput placeholder="Search or jump to…" />
        <CommandList>
          <CommandEmpty>Nothing lit up. Try “deploy” or “logs”.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {pages.map((page) => (
              <CommandItem
                key={page.label}
                icon={page.icon}
                shortcut={page.shortcut}
                keywords={page.keywords}
                onSelect={run}
              >
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            {actions.map((action) => (
              <CommandItem
                key={action.label}
                icon={action.icon}
                shortcut={action.shortcut}
                keywords={action.keywords}
                disabled={action.disabled}
                onSelect={run}
              >
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            {themes.map((option) => {
              const current = (theme ?? "cyan") === option.value;
              return (
                <CommandItem
                  key={option.value}
                  value={`Theme ${option.label}`}
                  keywords={["color", "accent"]}
                  aria-current={current || undefined}
                  // A lit swatch marks the current theme; the rest are unlit glass.
                  icon={
                    <span
                      style={{ "--swatch": neonColors[option.value] } as React.CSSProperties}
                      className={
                        current
                          ? "size-2.5 rounded-full bg-[rgb(var(--swatch))] shadow-[0_0_8px_rgb(var(--swatch)/0.9)]"
                          : "size-2.5 rounded-full border border-[rgb(var(--swatch)/0.5)] bg-[rgb(var(--swatch)/0.12)]"
                      }
                    />
                  }
                  // Stays open so the palette re-tints in place.
                  onSelect={() => setTheme(option.value)}
                >
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] px-4 py-2.5 text-[11px] text-white/40">
          <span className="flex items-center gap-1.5">
            <Box aria-hidden className="size-3.5 text-[rgb(var(--neon))]" />
            acme-web
          </span>
          <span aria-hidden className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1.5">
              <Kbd size="sm">↑</Kbd>
              <Kbd size="sm">↓</Kbd>
              Move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd size="sm">↵</Kbd>
              Run
            </span>
          </span>
        </div>
      </CommandDialog>
    </div>
  );
}
