import { Globe } from "@/components/ui/globe";

export default function GlobeStill() {
  return (
    <div className="flex w-full max-w-md items-center gap-6">
      <Globe interactive={false} speed={3} tilt={14} longitude={-30} className="w-36 shrink-0 sm:w-44" aria-label="Globe" />
      <div>
        <p className="font-mono text-4xl tabular-nums tracking-tight text-white/90">31</p>
        <p className="mt-1 text-sm text-white/60">regions, every one within 40 ms of a customer.</p>
      </div>
    </div>
  );
}
