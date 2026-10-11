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

export default function NavigationMenuDocs() {
  return (
    <div className="relative h-72 w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#07080d]">
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
      <div className="space-y-3 p-6">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-2 w-full max-w-sm rounded-full bg-white/[0.06]" />
        <div className="h-2 w-full max-w-xs rounded-full bg-white/[0.06]" />
      </div>
    </div>
  );
}
