import {
  Activity,
  ArrowRight,
  BookOpen,
  Boxes,
  Building2,
  ChartColumn,
  Code,
  Database,
  Flag,
  Gauge,
  Newspaper,
  ShieldCheck,
  ShoppingBag,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type Entry = { title: string; description: string; icon: LucideIcon; href: string };

const products: Entry[] = [
  { title: "Edge Functions", description: "Run code within 50 ms of every user.", icon: Zap, href: "#edge-functions" },
  { title: "Storage", description: "Postgres, KV and blobs that scale to zero.", icon: Database, href: "#storage" },
  { title: "Observability", description: "Traces, logs and metrics on one timeline.", icon: Activity, href: "#observability" },
  { title: "Analytics", description: "Product analytics without cookies.", icon: ChartColumn, href: "#analytics" },
  { title: "Feature Flags", description: "Ship dark, roll out by percentage.", icon: Flag, href: "#flags" },
  { title: "Firewall", description: "Bot protection and rate limits at the edge.", icon: ShieldCheck, href: "#firewall" },
];

const solutions: Entry[] = [
  { title: "Ecommerce", description: "Storefronts that hold up on launch day.", icon: ShoppingBag, href: "#ecommerce" },
  { title: "SaaS", description: "A preview for every pull request.", icon: Boxes, href: "#saas" },
  { title: "Media", description: "Stream and cache close to readers.", icon: Newspaper, href: "#media" },
  { title: "Enterprise", description: "SSO, audit logs and a 99.99% SLA.", icon: Building2, href: "#enterprise" },
];

const developers: Entry[] = [
  { title: "Documentation", description: "Guides, concepts and recipes", icon: BookOpen, href: "#docs" },
  { title: "API reference", description: "Every endpoint, fully typed", icon: Code, href: "#api" },
  { title: "CLI", description: "Deploy from your terminal", icon: Terminal, href: "#cli" },
  { title: "Status", description: "All systems operational", icon: Gauge, href: "#status" },
];

// p95 cold start over the last twelve weeks, as a share of the first week.
const coldStarts = [92, 88, 90, 81, 77, 78, 67, 61, 58, 49, 45, 36];

function PanelLink({ title, description, icon: Icon, href }: Entry) {
  return (
    <li>
      <NavigationMenuLink href={href} className="group flex items-start gap-3 p-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-white/55 transition-[color,border-color,box-shadow] duration-150 group-hover:border-[rgb(var(--neon)/0.45)] group-hover:text-[rgb(var(--neon))] group-hover:shadow-[0_0_14px_-4px_rgb(var(--neon)/0.6)] group-focus-visible:border-[rgb(var(--neon)/0.45)] group-focus-visible:text-[rgb(var(--neon))]">
          <Icon aria-hidden className="size-4" />
        </span>
        <span className="min-w-0 pt-px">
          <span className="block text-sm font-medium leading-5 text-white/90">{title}</span>
          <span className="block text-xs leading-5 text-white/45">{description}</span>
        </span>
      </NavigationMenuLink>
    </li>
  );
}

export default function NavigationMenuDemo() {
  return (
    <div className="relative h-[460px] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#07080d]">
      <header className="relative z-10 flex h-14 items-center gap-3 border-b border-white/[0.06] px-3 sm:px-4">
        <a href="#top" className="flex shrink-0 items-center gap-2 rounded-md text-sm font-semibold text-white/90">
          <span
            aria-hidden
            className="grid size-5 place-items-center rounded-md border border-[rgb(var(--neon)/0.7)] shadow-[0_0_10px_-2px_rgb(var(--neon)/0.8)]"
          >
            <span className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" />
          </span>
          <span className="hidden sm:inline">Northlight</span>
        </a>

        <NavigationMenu className="min-w-0 flex-1 justify-center">
          <NavigationMenuList>
            <NavigationMenuItem value="product">
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>
              <NavigationMenuContent className="grid w-[min(600px,calc(100vw-48px))] gap-2 p-2 sm:grid-cols-[1fr_196px]">
                <ul className="grid gap-0.5 sm:grid-cols-2">
                  {products.map((product) => (
                    <PanelLink key={product.title} {...product} />
                  ))}
                </ul>
                <NavigationMenuLink
                  href="#changelog"
                  className="group hidden flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-white/15 sm:flex"
                >
                  <span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--neon))]">
                      New in v4
                    </span>
                    <span className="mt-1.5 block text-sm font-medium leading-5 text-white/90">
                      Cold starts are 61% faster
                    </span>
                  </span>
                  <span aria-hidden className="mt-4 flex h-16 items-end gap-1">
                    {coldStarts.map((height, index) => (
                      <span
                        key={index}
                        style={{ height: `${height}%` }}
                        className={
                          index === coldStarts.length - 1
                            ? "w-full rounded-[2px] bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.7)]"
                            : "w-full rounded-[2px] bg-white/10"
                        }
                      />
                    ))}
                  </span>
                  <span className="mt-3 flex items-center gap-1 text-xs text-white/50 transition-colors group-hover:text-white/80">
                    Read the post
                    <ArrowRight aria-hidden className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem value="solutions">
              <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
              <NavigationMenuContent className="w-[min(460px,calc(100vw-48px))] p-2">
                <ul className="grid gap-0.5 sm:grid-cols-2">
                  {solutions.map((solution) => (
                    <PanelLink key={solution.title} {...solution} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem value="developers">
              <NavigationMenuTrigger>Developers</NavigationMenuTrigger>
              <NavigationMenuContent className="w-[min(300px,calc(100vw-48px))]">
                <ul className="grid gap-0.5 p-2">
                  {developers.map((entry) => (
                    <PanelLink key={entry.title} {...entry} />
                  ))}
                </ul>
                <div className="border-t border-white/[0.06] p-2">
                  <NavigationMenuLink
                    href="#changelog"
                    className="flex items-center justify-between px-2.5 py-2 text-xs text-white/55 hover:text-white/85"
                  >
                    Changelog
                    <span className="rounded-full border border-[rgb(var(--neon)/0.3)] px-2 py-0.5 text-[11px] text-[rgb(var(--neon))]">
                      v4.2
                    </span>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Button variant="solid" size="sm" className="hidden sm:inline-flex">
          Start free
        </Button>
      </header>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-14 bg-[radial-gradient(rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="relative px-6 pt-20 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--neon))]">Edge platform</p>
        <h2 className="mx-auto mt-3 max-w-md text-2xl font-semibold tracking-tight text-white/90 sm:text-3xl">
          Ship to every region in one push.
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">
          Functions, storage and observability on one network, 50 ms from every user.
        </p>
      </div>
    </div>
  );
}
