import { Button } from "@/components/ui/button";
import { LightRays } from "@/components/ui/light-rays";

export default function LightRaysEmptyState() {
  return (
    <div className="relative flex h-80 w-full max-w-xl flex-col items-center justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pb-10 text-center">
      <LightRays origin="top-right" rays={4} spread={30} intensity={0.55} dust={2} />
      <p className="relative font-mono text-xs text-white/45">404</p>
      <h3 className="relative mt-2 text-2xl font-semibold tracking-tight text-white/90">Nothing here but dust</h3>
      <p className="relative mt-2 max-w-xs text-sm text-white/55">The page moved, or never existed. The light&apos;s still on, though.</p>
      <Button variant="ghost" size="sm" className="relative mt-5">
        Back to the dashboard
      </Button>
    </div>
  );
}
