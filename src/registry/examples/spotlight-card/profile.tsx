import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function SpotlightCardProfile() {
  return (
    <SpotlightCard color="violet" radius={480} className="w-full max-w-sm p-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Now playing</p>
      <p className="mt-4 text-2xl font-medium tracking-tight text-white/90">Midnight City</p>
      <p className="text-sm text-white/50">M83 · Hurry Up, We&apos;re Dreaming</p>
      <div className="mt-6 flex items-center gap-3 text-xs tabular-nums text-white/40">
        <span>1:42</span>
        <div className="h-1 flex-1 rounded-full bg-white/10">
          <div className="h-full w-[42%] rounded-full bg-[rgb(168_85_247)] shadow-[0_0_10px_rgb(168_85_247/0.7)]" />
        </div>
        <span>4:03</span>
      </div>
    </SpotlightCard>
  );
}
