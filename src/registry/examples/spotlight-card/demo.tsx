import { Gauge, Layers, ShieldCheck } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const features = [
  { icon: Gauge, title: "Edge cached", body: "Static pages ship from 300 locations. Median TTFB 41ms." },
  { icon: ShieldCheck, title: "Signed builds", body: "Every artifact is checksummed and traceable to a commit." },
  { icon: Layers, title: "Preview per branch", body: "Push a branch, get a URL. Delete the branch, it's gone." },
];

export default function SpotlightCardDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-3">
      {features.map(({ icon: Icon, title, body }) => (
        <SpotlightCard key={title} className="p-5">
          <Icon className="size-5 text-white/60" />
          <h3 className="mt-6 text-sm font-medium text-white/90">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/50">{body}</p>
        </SpotlightCard>
      ))}
    </div>
  );
}
