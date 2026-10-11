import { Hexagon, Mountain, Orbit, Triangle, Waves, Zap } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

const companies = [
  { name: "Halcyon", icon: Hexagon },
  { name: "Northwind", icon: Triangle },
  { name: "Orbital", icon: Orbit },
  { name: "Voltline", icon: Zap },
  { name: "Tidewater", icon: Waves },
  { name: "Summit Labs", icon: Mountain },
];

export default function MarqueeLogos() {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-center text-sm text-white/50">Lighting up dashboards at</p>
      <Marquee speed={30} gap={56} fade={96} className="mt-6 py-2">
        {companies.map(({ name, icon: Icon }) => (
          <span key={name} className="flex items-center gap-2 whitespace-nowrap text-lg font-medium tracking-tight text-white/45">
            <Icon className="size-5" strokeWidth={1.75} />
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
