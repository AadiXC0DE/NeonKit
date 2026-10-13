"use client";

import * as React from "react";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  ChartColumn,
  Database,
  FileText,
  GitMerge,
  Menu,
  Rocket,
  ShieldAlert,
  Users,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

type Entry = { title: string; description: string; href: string; icon: LucideIcon };

const PRODUCT: { heading: string; items: Entry[] }[] = [
  {
    heading: "Build",
    items: [
      { title: "Affected builds", description: "Runs only what a commit touched.", href: "#affected", icon: Waypoints },
      { title: "Remote cache", description: "One cache for CI and every laptop.", href: "#cache", icon: Database },
      { title: "Merge queue", description: "Batches PRs, bisects the breakage.", href: "#queue", icon: GitMerge },
    ],
  },
  {
    heading: "Ship",
    items: [
      { title: "Preview deploys", description: "A URL per package, per PR.", href: "#previews", icon: Rocket },
      { title: "Flaky test quarantine", description: "Retries and mutes repeat offenders.", href: "#flaky", icon: ShieldAlert },
      { title: "Pipeline insights", description: "Where the minutes go, per package.", href: "#insights", icon: ChartColumn },
    ],
  },
];

const RESOURCES: { heading: string; items: Entry[] }[] = [
  {
    heading: "Learn",
    items: [
      { title: "Documentation", description: "Config reference and guides.", href: "#docs", icon: BookOpen },
      { title: "Monorepo recipes", description: "pnpm, Nx, Bazel, Turborepo.", href: "#recipes", icon: Boxes },
    ],
  },
  {
    heading: "Company",
    items: [
      { title: "Customers", description: "How 1,180 teams cut CI time.", href: "#customers", icon: Users },
      { title: "Changelog", description: "v2.14 shipped Oct 9.", href: "#changelog", icon: FileText },
    ],
  },
];

// One run of the pipeline in the featured card, in real seconds.
const STAGES = [
  { name: "install", seconds: 2, note: "cache hit" },
  { name: "graph", seconds: 1, note: "3 of 41" },
  { name: "build", seconds: 6, note: "3 packages" },
  { name: "test", seconds: 7, note: "412 specs" },
  { name: "deploy", seconds: 2, note: "3 previews" },
];
const RUN_SECONDS = STAGES.reduce((sum, stage) => sum + stage.seconds, 0);

function usePipeline() {
  const [state, setState] = React.useState({ run: 4821, elapsed: 0 });
  React.useEffect(() => {
    // Counts to the end of the run, holds on "passed" for four seconds, then starts the next one.
    const id = window.setInterval(() => {
      setState((s) => (s.elapsed >= RUN_SECONDS + 4 ? { run: s.run + 1, elapsed: 0 } : { ...s, elapsed: s.elapsed + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}

function stageAt(elapsed: number) {
  let start = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (elapsed < start + STAGES[i].seconds) return i;
    start += STAGES[i].seconds;
  }
  return STAGES.length;
}

function PipelineCard() {
  const { run, elapsed } = usePipeline();
  const current = stageAt(elapsed);
  const passed = current === STAGES.length;
  const clock = Math.min(elapsed, RUN_SECONDS);

  return (
    <NavigationMenuLink
      href="#pipelines"
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-white/15"
    >
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-[rgb(var(--neon)/0.12)] blur-[40px]" />
      <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              passed
                ? "bg-[rgb(52_211_153)] shadow-[0_0_6px_rgb(52_211_153)]"
                : "animate-pulse bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))] motion-reduce:animate-none",
            )}
          />
          main · #{run}
        </span>
        <span className="tabular-nums text-white/70">0:{String(clock).padStart(2, "0")}</span>
      </span>

      <span className="mt-4 block text-sm font-medium leading-5 text-white/90" aria-live="polite">
        {passed ? `Passed in ${RUN_SECONDS}s` : "Building 3 of 41 packages"}
      </span>

      <span className="mt-4 grid gap-1.5 border-t border-white/[0.06] pt-3.5 font-mono text-[11px]">
        {STAGES.map((stage, index) => {
          const done = index < current;
          const live = index === current;
          return (
            <span key={stage.name} className={cn("grid grid-cols-[10px_52px_1fr_auto] items-center gap-2", !done && !live && "text-white/25")}>
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  done && "bg-[rgb(var(--neon)/0.55)]",
                  live && "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.8)]",
                  !done && !live && "bg-[rgb(var(--neon)/0.14)]",
                )}
              />
              <span className={done || live ? "text-white/75" : undefined}>{stage.name}</span>
              <span className={done || live ? "truncate text-white/40" : "truncate"}>{stage.note}</span>
              <span className="tabular-nums text-white/45">{done ? `${stage.seconds}s` : live ? "…" : ""}</span>
            </span>
          );
        })}
      </span>

      <span className="mt-5 flex items-center gap-1 text-xs text-white/50 transition-colors group-hover:text-white/85">
        Run it on your repo
        <ArrowRight aria-hidden className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
      </span>
    </NavigationMenuLink>
  );
}

function PanelLink({ title, description, href, icon: Icon }: Entry) {
  return (
    <li>
      <NavigationMenuLink href={href} className="group px-3 py-2.5">
        <span className="flex items-center gap-2.5 text-sm font-medium leading-5 text-white/90">
          <Icon
            aria-hidden
            className="size-3.5 shrink-0 text-white/35 transition-[color,filter] duration-150 group-hover:text-[rgb(var(--neon))] group-hover:[filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.8))] group-focus-visible:text-[rgb(var(--neon))]"
          />
          {title}
        </span>
        <span className="mt-0.5 block pl-6 text-xs leading-5 text-white/45">{description}</span>
      </NavigationMenuLink>
    </li>
  );
}

function Column({ heading, items }: { heading: string; items: Entry[] }) {
  return (
    <div>
      <p className="px-3 pb-1.5 pt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">{heading}</p>
      <ul className="grid gap-0.5">
        {items.map((item) => (
          <PanelLink key={item.title} {...item} />
        ))}
      </ul>
    </div>
  );
}

function Wordmark() {
  return (
    <a
      href="#top"
      className="flex shrink-0 items-center gap-2.5 rounded-md text-[17px] font-semibold tracking-[-0.02em] text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]"
    >
      {/* Three branches merging into one line. */}
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" strokeWidth={1.7} strokeLinecap="round">
        <path d="M5 3.5v4.5c0 3 7 3.5 7 7M19 3.5v4.5c0 3-7 3.5-7 7M12 3.5v16" stroke="rgb(255 255 255 / 0.85)" />
        <circle cx="12" cy="20.2" r="1.9" fill="rgb(var(--neon))" style={{ filter: "drop-shadow(0 0 4px rgb(var(--neon)))" }} />
      </svg>
      Forgeline
    </a>
  );
}

function MobileSection({ heading, groups }: { heading: string; groups: { heading: string; items: Entry[] }[] }) {
  return (
    <Collapsible className="border-b border-white/[0.07]">
      <CollapsibleTrigger className="flex w-full justify-between py-4 text-2xl font-semibold tracking-[-0.03em] text-white/90">
        {heading}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-5 pb-5">
          {groups.map((group) => (
            <div key={group.heading}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">{group.heading}</p>
              <ul className="mt-2 grid gap-3">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <a href={item.href} className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
                      <span className="block text-[15px] font-medium text-white/85">{item.title}</span>
                      <span className="block text-[13px] leading-5 text-white/45">{item.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function NavbarMega() {
  return (
    <div
      // Change the color here; everything inside follows it.
      style={neonVars("orange")}
      className="relative isolate min-h-[520px] bg-[#05060a] text-white md:min-h-[640px] lg:min-h-[520px]"
    >
      <header className="relative z-20 border-b border-white/[0.07]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 sm:px-8">
          <Wordmark />

          {/* Opens on load so the preview shows the panel; drop defaultValue in your app. */}
          <NavigationMenu defaultValue="product" className="hidden flex-1 justify-center md:flex">
            <NavigationMenuList>
              <NavigationMenuItem value="product">
                <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                <NavigationMenuContent className="grid w-[min(760px,calc(100vw-48px))] grid-cols-[1fr_1fr] gap-2 p-2 lg:grid-cols-[1fr_1fr_240px]">
                  {PRODUCT.map((group) => (
                    <Column key={group.heading} {...group} />
                  ))}
                  <div className="col-span-2 p-1 lg:col-span-1">
                    <PipelineCard />
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem value="resources">
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent className="w-[min(500px,calc(100vw-48px))] p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {RESOURCES.map((group) => (
                      <Column key={group.heading} {...group} />
                    ))}
                  </div>
                  <a
                    href="#status"
                    className="mt-2 flex items-center justify-between rounded-lg border-t border-white/[0.06] px-3 py-3 text-xs text-white/50 outline-none transition-colors hover:text-white/85 focus-visible:ring-1 focus-visible:ring-[rgb(var(--neon)/0.5)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_6px_rgb(52_211_153)]" />
                      All runners healthy
                    </span>
                    <span className="font-mono text-[11px] text-white/35">p50 queue 3s</span>
                  </a>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#enterprise">Enterprise</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-auto flex items-center gap-2 sm:gap-4 md:ml-0">
            <a
              href="#sign-in"
              className="hidden whitespace-nowrap rounded-md px-2 py-1.5 text-sm text-white/55 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] sm:block md:hidden lg:block"
            >
              Sign in
            </a>
            <Button asChild variant="solid" size="sm" className="hidden px-3.5 shadow-[0_0_0_1px_rgb(var(--neon)),inset_0_1px_0_rgb(255_255_255/0.45)] sm:inline-flex">
              <a href="#start">Connect a repo</a>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="-mr-2 md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" size="sm">
                <SheetHeader>
                  <SheetTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-white/45">
                    Forgeline
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="mt-6">
                  <MobileSection heading="Product" groups={PRODUCT} />
                  <MobileSection heading="Resources" groups={RESOURCES} />
                  {["Pricing", "Enterprise"].map((label) => (
                    <a
                      key={label}
                      href={`#${label.toLowerCase()}`}
                      className="block border-b border-white/[0.07] py-4 text-2xl font-semibold tracking-[-0.03em] text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
                <div className="mt-auto grid gap-2 pt-8">
                  <Button asChild variant="solid" size="lg">
                    <a href="#start">
                      Connect a repo <ArrowRight />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <a href="#sign-in">Sign in</a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* A slice of the page underneath, so the nav reads in context. */}
      <div
        aria-hidden
        className="pointer-events-none mx-auto max-w-6xl select-none px-5 pb-12 pt-20 [mask-image:linear-gradient(to_bottom,#000_45%,transparent)] sm:px-8 sm:pt-28"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">CI/CD for monorepos</p>
        <p className="mt-5 max-w-4xl [text-wrap:balance] text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white/90">
          Build what changed. Skip the other 38 packages.
        </p>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-white/50">
          Forgeline reads your workspace graph, runs only what a commit affects and shares every artifact through one cache.
        </p>
      </div>
    </div>
  );
}
