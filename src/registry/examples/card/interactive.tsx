import { ArrowUpRight, Boxes, Package, Palette, Terminal } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  {
    title: "Installation",
    description: "Point the shadcn CLI at the registry and add your first component.",
    href: "#installation",
    icon: Terminal,
  },
  {
    title: "Theming",
    description: "Set --neon-accent once and every component follows it.",
    href: "#theming",
    icon: Palette,
  },
  {
    title: "Components",
    description: "Each one is a single file you own, edit and ship.",
    href: "#components",
    icon: Boxes,
  },
  {
    title: "Registry",
    description: "Serve your own variants as shadcn-compatible JSON.",
    href: "#registry",
    icon: Package,
  },
];

export default function CardInteractive() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {links.map(({ title, description, href, icon: Icon }) => (
        <Card key={title} interactive className="group">
          <CardHeader className="gap-2">
            <div className="mb-2 flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[rgb(var(--neon))]">
              <Icon aria-hidden className="size-4" />
            </div>
            <CardTitle className="flex items-center justify-between gap-3">
              {/* The link's ::after covers the card, so the whole surface is clickable. */}
              <a href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
                {title}
              </a>
              <ArrowUpRight
                aria-hidden
                className="size-4 text-white/30 transition-[color,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70"
              />
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
