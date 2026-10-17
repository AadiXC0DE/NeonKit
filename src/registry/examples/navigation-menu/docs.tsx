import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const guides = [
  { title: "Deploy your first app", time: "5 min", href: "#first-app" },
  { title: "Preview deployments", time: "4 min", href: "#previews" },
  { title: "Custom domains and TLS", time: "6 min", href: "#domains" },
  { title: "Caching at the edge", time: "9 min", href: "#caching" },
];

const reference = [
  { title: "REST API", href: "#rest" },
  { title: "JavaScript SDK", href: "#sdk-js" },
  { title: "Python SDK", href: "#sdk-python" },
  { title: "CLI", href: "#cli" },
  { title: "Webhooks", href: "#webhooks" },
  { title: "Error codes", href: "#errors" },
];

const changes = [
  { version: "4.2.0", note: "Preview deployments get their own TLS certificate in under 10 s." },
  { version: "4.1.3", note: "Edge config reads are cached for 60 s per region." },
  { version: "4.1.0", note: "The Python SDK supports streaming responses." },
];

export default function NavigationMenuDocs() {
  return (
    <div className="relative min-h-72 w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#07080d]">
      <header className="relative z-10 flex h-12 items-center gap-2 border-b border-white/[0.06] px-3">
        <span className="shrink-0 pr-2 text-sm font-semibold text-white/90">Docs</span>
        <NavigationMenu className="min-w-0">
          <NavigationMenuList>
            <NavigationMenuItem value="guides">
              <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
              <NavigationMenuContent className="w-[min(300px,calc(100vw-48px))] p-1.5">
                <ul>
                  {guides.map((guide) => (
                    <li key={guide.href}>
                      <NavigationMenuLink
                        href={guide.href}
                        className="flex items-center justify-between gap-4 px-3 py-2 text-sm text-white/75 hover:text-white"
                      >
                        {guide.title}
                        <span className="shrink-0 text-xs text-white/35">{guide.time}</span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="reference">
              <NavigationMenuTrigger>Reference</NavigationMenuTrigger>
              <NavigationMenuContent className="w-[min(340px,calc(100vw-48px))] p-1.5">
                <ul className="grid grid-cols-2">
                  {reference.map((entry) => (
                    <li key={entry.href}>
                      <NavigationMenuLink
                        href={entry.href}
                        className="px-3 py-2 text-sm text-white/75 hover:text-white"
                      >
                        {entry.title}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#changelog" active>
                Changelog
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <article className="px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-white/90">Changelog</h2>
        <ol className="mt-4 grid gap-3.5 text-sm">
          {changes.map((change) => (
            <li key={change.version} className="grid grid-cols-[3.5rem_1fr] gap-3">
              <span className="font-mono text-[12.5px] leading-5 text-white/45">{change.version}</span>
              <span className="leading-5 text-white/70">{change.note}</span>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
